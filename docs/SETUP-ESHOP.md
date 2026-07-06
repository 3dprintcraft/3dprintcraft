# 🛒 E-Shop — Οδηγός Ενεργοποίησης (Go-Live)

Το eshop στο `/shop` δουλεύει ήδη σε **mock mode**: όλο το site λειτουργεί,
αλλά η «πληρωμή» είναι εικονική και τα emails τυπώνονται στο log αντί να
στέλνονται. Για να πάει live με πραγματικές πληρωμές, χρειάζονται τα παρακάτω
βήματα — με τη σειρά.

---

## Βήμα 1 — Viva (πληρωμές)

1. Άνοιξε **επαγγελματικό λογαριασμό Viva** (viva.com) για την επιχείρηση.
2. Στο Viva dashboard: **Settings → API Access**:
   - Δημιούργησε **Smart Checkout credentials** → κράτα `Client ID` & `Client Secret`.
   - Κράτα και τα **Merchant ID** + **API Key** (χρειάζονται για το webhook).
3. **Payment Sources → Add Website/App source**:
   - Domain: `3dprintcraft.gr`
   - **Success URL**: `https://3dprintcraft.gr/shop/thanks.html`
   - **Failure URL**: `https://3dprintcraft.gr/shop/thanks.html`
   - Κράτα το **Source Code** (4ψήφιο).
4. **Webhooks → Create webhook**:
   - URL: `https://3dprintcraft.gr/api/viva-webhook`
   - Event: **Transaction Payment Created**
   - (Η επαλήθευση γίνεται αυτόματα — το endpoint απαντά με το key.)

> 💡 Μπορείς πρώτα να τα κάνεις όλα στο **demo.vivapayments.com** (δωρεάν
> δοκιμαστικό περιβάλλον με test κάρτες) βάζοντας `VIVA_ENV=demo`.

## Βήμα 2 — Resend (emails)

1. Λογαριασμός στο **resend.com** (δωρεάν: 100 emails/μέρα — υπεραρκετά).
2. **Domains → Add domain** → `3dprintcraft.gr` → πρόσθεσε τα DNS records
   (SPF/DKIM) που θα σου δείξει, στο Cloudflare DNS. Η επαλήθευση θέλει από
   λίγα λεπτά έως ώρες.
3. **API Keys → Create** → κράτα το key.
4. Μετά την επαλήθευση, όρισε sender π.χ. `orders@3dprintcraft.gr`
   (env var `EMAIL_FROM`, δες παρακάτω). Μέχρι τότε χρησιμοποιείται το
   `onboarding@resend.dev` που παραδίδει ΜΟΝΟ στο δικό σου email.

## Βήμα 3 — Cloudflare (KV, R2, secrets)

Στο Cloudflare dashboard:

1. **Workers & Pages → KV → Create namespace**: όνομα `printcraft-orders`.
   Κράτα το **Namespace ID**.
2. **R2 → Create bucket**: όνομα `printcraft-uploads`.
   - Στο bucket: **Settings → Public access → Allow** (r2.dev URL) και κράτα
     το URL (π.χ. `https://pub-xxxx.r2.dev`).
3. Άνοιξε το τοπικό `wrangler.toml`, βάλε το πραγματικό Namespace ID στη θέση
   του `REPLACE_WITH_KV_NAMESPACE_ID`, **σβήσε τη γραμμή `wrangler.toml` από
   το `.gitignore`** και κάνε commit/push. (Μέχρι τότε το αρχείο μένει εκτός
   repo επίτηδες — με λάθος ID θα έσπαγε το deploy.)
4. **Pages project → Settings → Environment variables (Production)** —
   πρόσθεσε ως **Secrets**:

   | Μεταβλητή | Τιμή |
   |---|---|
   | `VIVA_ENV` | `demo` (για δοκιμές) → `production` (live) |
   | `VIVA_CLIENT_ID` | από Βήμα 1.2 |
   | `VIVA_CLIENT_SECRET` | από Βήμα 1.2 |
   | `VIVA_SOURCE_CODE` | από Βήμα 1.3 |
   | `VIVA_MERCHANT_ID` | από Βήμα 1.2 |
   | `VIVA_API_KEY` | από Βήμα 1.2 |
   | `RESEND_API_KEY` | από Βήμα 2.3 |
   | `EMAIL_FROM` | `3DPrintCraft <orders@3dprintcraft.gr>` (μετά το verify) |
   | `OWNER_EMAIL` | `contactprintcraft3d@gmail.com` |
   | `R2_PUBLIC_BASE` | το r2.dev URL από Βήμα 3.2 |

5. (Προαιρετικό αλλά καλό) **Security → WAF → Rate limiting rule**:
   path `/api/*`, π.χ. max 20 requests/λεπτό ανά IP.

## Βήμα 4 — Δοκιμή & Live

1. Με `VIVA_ENV=demo`: κάνε μια αγορά με [test κάρτα Viva](https://developer.viva.com/integration-reference/test-cards-and-environments/)
   και δες ότι έρχονται τα 2 emails.
2. Άλλαξε `VIVA_ENV=production` + βάλε τα production credentials.
3. Κάνε μία πραγματική αγορά 1–2€ ο ίδιος για σιγουριά. 🎉

---

## Καθημερινή λειτουργία

- **Νέα παραγγελία** → email στο `contactprintcraft3d@gmail.com` με όλα τα
  στοιχεία (προϊόντα, επιλογές, NFC link, διεύθυνση, τρόπος αποστολής).
  Οι πληρωμές φαίνονται και στο **Viva dashboard**.
- **Νέο προϊόν / αλλαγή τιμής** → επεξεργασία του `shop/products.json`
  (δες τη δομή των υπαρχόντων) + commit/push → auto deploy. Φωτογραφίες στο
  `shop/assets/img/` (τετράγωνες, ~800×800, webp/jpg).
- **Custom αιτήματα** → email με link στο αρχείο· απαντάς με προσφορά και
  **Viva payment link** (φτιάχνεται με 2 κλικ στο Viva dashboard).
- **Κουπόνια** → στο `shop/products.json`, μπλοκ `config.coupons`. Δύο είδη:

  ```json
  "coupons": [
    { "code": "PRINT10", "type": "percent", "value": 10 },   ← -10%
    { "code": "XMAS5",   "type": "fixed",   "value": 5 }     ← -5€
  ]
  ```

  Προσθέτεις/σβήνεις γραμμή + commit/push. Ο κωδικός δεν κάνει διάκριση
  πεζών/κεφαλαίων, η έκπτωση μπαίνει στα προϊόντα (όχι στα μεταφορικά) και
  επικυρώνεται πάντα στον server. Για να λήξει ένα κουπόνι απλά το σβήνεις.
- **Απόδειξη/τιμολόγιο** → χειροκίνητα, όπως τώρα (εκτός συστήματος).

## Τοπική ανάπτυξη

```bash
cd 3dprintcraft
npx wrangler pages dev . --port 8788     # site + functions + τοπικό KV/R2
node --test tests/pricing.test.mjs       # unit tests τιμολόγησης
```

Χωρίς secrets τρέχει σε **mock mode** (εικονική πληρωμή, emails στο log).
Για δοκιμή με Viva demo: φτιάξε αρχείο `.dev.vars` (είναι στο .gitignore) με
τα demo credentials.

## Αρχιτεκτονική (σύνοψη)

- `shop/` — στατικές σελίδες + `products.json` (κατάλογος = πηγή αλήθειας)
- `functions/api/checkout.js` — επικύρωση καλαθιού **server-side** (οι τιμές
  υπολογίζονται πάντα από το products.json, ό,τι κι αν στείλει ο browser),
  δημιουργία Viva order, αποθήκευση σε KV
- `functions/api/viva-webhook.js` — όταν πληρωθεί: επαλήθευση συναλλαγής στη
  Viva → emails → idempotency (δεν ξαναστέλνει σε replay)
- `functions/api/custom-order.js` — custom φόρμα + upload σε R2
- Καμία κάρτα δεν αγγίζει ποτέ το site — όλα στο περιβάλλον της Viva (PCI-DSS).
