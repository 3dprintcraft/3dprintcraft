# 3DPrintCraft E-Shop — Design Spec

**Ημερομηνία:** 2026-07-05
**Κατάσταση:** Εγκεκριμένο από τον ιδιοκτήτη

## Στόχος

E-shop στο `3dprintcraft.gr/shop` με εντυπωσιακό design (συνέχεια του brutalist
aesthetic του landing) και αγορά σε 2 κλικ. Κύρια προϊόντα: NFC & personalized
gadgets (μπρελόκ, stands, σουβέρ, φωτιστικά, μπρελόκ ονόματος κ.λπ.), συν
custom 3D εκτυπώσεις κατά παραγγελία.

## Αποφάσεις (από brainstorming)

| Θέμα | Απόφαση |
|---|---|
| Πλατφόρμα | Custom static site — ΟΧΙ Shopify/WooCommerce |
| Τοποθεσία | `/shop` μέσα στο υπάρχον repo `3dprintcraft` (GitHub → Cloudflare Pages, ίδιο domain) |
| Πληρωμές | Viva Smart Checkout (hosted redirect — κάρτες, IRIS, Apple/Google Pay) |
| Προϊόντα | `products.json` στο repo — επεξεργασία με deploy, χωρίς βάση δεδομένων |
| Παραγγελίες | Email στον ιδιοκτήτη + Viva dashboard· επιβεβαίωση με email στον πελάτη |
| Custom orders | Φόρμα με περιγραφή + file upload (STL/εικόνα) σε Cloudflare R2 |
| Αποστολές | Courier (σταθερό κόστος), Box Now, Παραλαβή από εργαστήριο Πάτρα (δωρεάν) |
| NFC personalization | Πεδία ανά προϊόν πριν το «Στο καλάθι» |
| Λογαριασμοί χρηστών | ΟΧΙ — καλάθι μόνο σε localStorage |
| Τιμολόγηση/myDATA | Εκτός scope — χειροκίνητα από τον ιδιοκτήτη |
| Vouchers courier | Εκτός scope — χειροκίνητα |
| Κόστος λειτουργίας | 0€/μήνα (μόνο προμήθειες Viva) |

## Αρχιτεκτονική

```
3dprintcraft repo (Cloudflare Pages)
├── shop/
│   ├── index.html          ← κατάλογος (φίλτρα κατηγοριών, NFC πρώτα)
│   ├── product.html        ← σελίδα προϊόντος (?id=slug)
│   ├── checkout.html       ← στοιχεία + αποστολή + κουμπί πληρωμής
│   ├── thanks.html         ← επιστροφή από Viva (επιτυχία/αποτυχία)
│   ├── custom.html         ← φόρμα custom παραγγελίας + upload
│   ├── products.json       ← ο κατάλογος (ενιαία πηγή αλήθειας)
│   └── assets/             ← css/js/εικόνες προϊόντων
└── functions/api/
    ├── checkout.js         ← δημιουργία Viva payment order (server-side τιμές)
    ├── viva-webhook.js     ← επιβεβαίωση πληρωμής → emails παραγγελίας
    └── custom-order.js     ← λήψη φόρμας custom + upload σε R2 → email
```

### Ροή αγοράς (2 κλικ)

1. Σελίδα προϊόντος: πελάτης διαλέγει επιλογές → **«ΑΓΟΡΑ ΤΩΡΑ»** (κλικ 1)
   → checkout με προσυμπληρωμένο το προϊόν. (Εναλλακτικά «ΣΤΟ ΚΑΛΑΘΙ» και
   συνέχεια αγορών.)
2. Checkout: στοιχεία + τρόπος αποστολής → **«ΠΛΗΡΩΜΗ»** (κλικ 2)
   → η function `checkout.js` επικυρώνει το καλάθι, υπολογίζει το σύνολο
   **server-side από το products.json**, δημιουργεί payment order στη Viva
   και επιστρέφει το Smart Checkout URL → redirect.
3. Viva: ο πελάτης πληρώνει → επιστρέφει στο `thanks.html`.
4. Webhook `viva-webhook.js`: όταν η Viva στείλει Transaction Payment Created,
   στέλνει (α) email πλήρους παραγγελίας στον ιδιοκτήτη (προϊόντα, επιλογές,
   NFC personalization, διεύθυνση, τρόπος αποστολής), (β) email επιβεβαίωσης
   στον πελάτη. Τα στοιχεία παραγγελίας αποθηκεύονται σε Cloudflare KV με
   κλειδί το orderCode ώστε το webhook να τα ανακτήσει.

### Μοντέλο προϊόντος (`products.json`)

Κάθε προϊόν ορίζει τις δικές του επιλογές — χωρίς αλλαγή κώδικα για νέο προϊόν:

```json
{
  "id": "nfc-stand",
  "name": "NFC Stand",
  "category": "nfc",
  "price": 12.00,
  "featured": true,
  "images": ["assets/img/nfc-stand-1.webp"],
  "description": "Stand με NFC chip που ανοίγει το προφίλ σου με ένα άγγιγμα.",
  "options": [
    { "type": "select", "id": "platform", "label": "Πλατφόρμα",
      "choices": [
        { "value": "instagram", "label": "Instagram" },
        { "value": "tiktok", "label": "TikTok" },
        { "value": "google", "label": "Google Review" },
        { "value": "multi", "label": "Πολλαπλά (multi-link)", "priceDelta": 3.00 }
      ] },
    { "type": "text", "id": "link", "label": "Το link/username σου", "required": true },
    { "type": "select", "id": "color", "label": "Χρώμα",
      "choices": [
        { "value": "black", "label": "Μαύρο" },
        { "value": "white", "label": "Λευκό" },
        { "value": "orange", "label": "Πορτοκαλί" }
      ] }
  ]
}
```

- `type: "select"` → κουμπιά επιλογής, προαιρετικό `priceDelta` (±€)
- `type: "text"` → ελεύθερο κείμενο (όνομα, link, κείμενο chip)
- Κατηγορίες: `nfc` (προβάλλεται πρώτη), `prints`, `custom`
- Shipping options & κόστη: σε `config` block μέσα στο ίδιο αρχείο

### Ασφάλεια

- Κανένα στοιχείο κάρτας δεν περνά από το site — hosted Viva checkout (PCI στη Viva).
- Το σύνολο υπολογίζεται **πάντα** server-side από `products.json`· τα ποσά
  του client αγνοούνται. Text options περνούν sanitized στο email.
- Viva API keys & Resend key: Cloudflare secrets (env vars) — ποτέ στο repo.
- Webhook: επαλήθευση με το Viva webhook verification token.
- Upload: όριο μεγέθους (50MB), επιτρεπτές επεκτάσεις (stl, step, obj, 3mf,
  jpg, png, webp, pdf), αποθήκευση σε R2 με τυχαίο όνομα.
- Rate limiting στα endpoints μέσω Cloudflare (δωρεάν tier).

### Emails

- Πάροχος: **Resend** (δωρεάν 100/μέρα, verification του domain 3dprintcraft.gr).
- Παραλήπτης παραγγελιών: contactprintcraft3d@gmail.com.

### Design language

Συνέχεια του landing: ίδιες γραμματοσειρές (Archivo Black, Bowlby One, Space
Mono, Familjen Grotesk), ίδιο gantry header με προσθήκη κουμπιού **ESHOP** και
μετρητή καλαθιού, ίδια palette tokens από `assets/css/landing.css`. Ελληνικά
παντού. Mobile-first — οι περισσότερες αγορές θα γίνονται από κινητό.

## Εξωτερικές προϋποθέσεις (ενέργειες ιδιοκτήτη)

1. Επαγγελματικός λογαριασμός Viva + δημιουργία API credentials (Smart Checkout).
2. Δωρεάν λογαριασμός Resend + DNS records για verification του domain.
3. Ενεργοποίηση R2 & KV στο Cloudflare account (δωρεάν tier).

Μέχρι να γίνουν: ανάπτυξη με Viva **demo environment** (test κάρτες) και
console-log αντί για email.

## Testing

- Unit: υπολογισμός συνόλου (options, priceDelta, μεταφορικά) στη function.
- Integration: πλήρης ροή αγοράς σε Viva demo environment.
- Manual: mobile viewport, όλα τα προϊόντα/επιλογές, αποτυχημένη πληρωμή,
  webhook replay.

## Εκτός scope (μελλοντικά)

Λογαριασμοί χρηστών, ιστορικό παραγγελιών, αυτόματα τιμολόγια/myDATA,
αυτόματα vouchers courier, εκπτωτικά κουπόνια, απόθεμα/stock tracking,
αγγλική μετάφραση.
