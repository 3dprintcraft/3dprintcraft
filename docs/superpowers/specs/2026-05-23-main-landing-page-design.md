# 3DPrintCraft — Main Landing Page (Design Spec)

**Ημερομηνία:** 2026-05-23
**Κατάσταση:** Εγκεκριμένος σχεδιασμός (v2) — έτοιμο για πλάνο υλοποίησης

## 1. Σκοπός

Νέα κεντρική landing page για το 3DPrintCraft, από το μηδέν, στο root `/index.html` (αντικαθιστά το άδειο stub).

Το 3DPrintCraft είναι «phygital» toolkit για τοπικές επιχειρήσεις — **γεφυρώνει φυσικό + ψηφιακό**. Υπηρεσίες προς προβολή (ισότιμα· η λίστα είναι ανοιχτή / επεκτάσιμη):
- Δημιουργία **ιστοσελίδων**
- **Mini (ψηφιακά) μενού**
- **Mini hub sites** (link microsites)
- **3D printing**
- **NFC μπρελόκ** (keychains)
- …κ.ά.

**Κύριος στόχος:** Προβολή όλης της γκάμας με ισότιμη έμφαση και οδήγηση σε **Επικοινωνία / «ζήτα προσφορά»**. Υβριδική διάταξη: hero promise → services grid → featured highlights.

> **ΣΗΜΑΝΤΙΚΟ:** Κανένα link προς `/cost` ή `/hub`. Τα CTA οδηγούν σε επικοινωνία/inquiry, όχι σε εσωτερικά εργαλεία.

**Έκταση:** Πλήρης marketing σελίδα (μεγάλο scroll).
**Γλώσσα:** Ελληνικά (`lang="el"`).
**Περιεχόμενο:** Scaffold — ρεαλιστικό ελληνικό placeholder copy, δείγματα testimonials, image placeholders με περιγραφή. Ο χρήστης αντικαθιστά αργότερα.

## 2. Αισθητική — «Ζεστό & ανθρώπινο»

Εντυπωσιακό, άκρως marketing, συναισθηματικό. Φωτεινό, αισιόδοξο, με storytelling και μεγάλες ανθρώπινες εικόνες.

> Ισχύει **μόνο** για τη landing page. Οι σκούρες σελίδες `/cost` και `/hub` μένουν ως έχουν.

### Παλέτα
| Ρόλος | Hex |
|---|---|
| Φόντο (κρεμ/χαρτί) | `#FBF6EF` |
| Δεύτερη επιφάνεια | `#F3E9DC` |
| Κύριος τόνος (τερακότα) | `#C75B39` |
| Δεύτερος (μελί χρυσό) | `#E9A93C` |
| CTA accent (brand bridge) | `#FF6B2B` |
| Κείμενο (ζεστό σκούρο καφέ) | `#2E2620` |
| Muted κείμενο | `#7A6E62` |
| Διακριτικό πράσινο (φασκόμηλο) | `#7C8A5A` |

### Τυπογραφία
- **Τίτλοι:** εκφραστικό serif (Cormorant ή Spectral) ή πιο τολμηρό Montserrat — μεγάλη κλίμακα, συναισθηματικοί τίτλοι.
- **Σώμα:** Inter.
- **Περιορισμός:** η τελική επιλογή γραμματοσειρών πρέπει να έχει επιβεβαιωμένη κάλυψη ελληνικών glyphs (επαλήθευση στο build).

### Εικόνες (placeholders με περιγραφή τι μπαίνει)
- Χέρια που δουλεύουν τον 3D printer.
- Maker που κρατά το τελικό αντικείμενο / NFC μπρελόκ.
- Καταστηματάρχης χαρούμενος με τη σελίδα ή το ψηφιακό μενού του στο κινητό.
- Ύφος: φυσικό φως, ζεστό.

## 3. Αρχιτεκτονική / Αρχεία (multi-file static)

```
/index.html              ← markup (αντικαθιστά το stub)
/assets/css/landing.css   ← στυλ
/assets/js/landing.js     ← nav, scroll reveals, smooth-scroll, counters
/assets/img/              ← placeholder εικόνες
```

Χωρίς build step. Στατικά αρχεία, deploy όπως είναι μαζί με τα υπάρχοντα + `_redirects`.

## 4. Ενότητες σελίδας — Υβριδική δομή (πάνω → κάτω)

1. **Header / nav** — sticky, ημιδιάφανο με blur. Links: Υπηρεσίες · Έργα · Πώς δουλεύει · Επικοινωνία. Hamburger στο mobile. Sticky CTA → Επικοινωνία.
2. **Hero — brand promise** — δυνατό συναισθηματικό headline που γεφυρώνει φυσικό + ψηφιακό (placeholder π.χ. «Η επιχείρησή σου, online και στα χέρια του πελάτη»). Subhead, ζεστή φωτό φόντο. **Primary CTA «Ζήτα προσφορά» → Επικοινωνία**, δευτερεύον «Δες τι κάνουμε» → ενότητα Υπηρεσίες.
3. **Υπηρεσίες — services grid** — κάρτες (icon + τίτλος + σύντομο copy) για όλες τις υπηρεσίες **ισότιμα**: Ιστοσελίδες · Mini μενού · Mini hub sites · 3D printing · NFC μπρελόκ · (επεκτάσιμο). Soft CTA κάθε κάρτας → Επικοινωνία.
4. **Featured highlights (1–2)** — storytelling spotlight σε editorial zig-zag. Πρωταρχικό: **NFC μπρελόκ** (το σήμα κατατεθέν phygital — tap → ανοίγει link/μενού/προφίλ). Προαιρετικό 2ο highlight: mini ψηφιακό μενού για café/εστίαση.
5. **Έργα / Portfolio** — grid με δείγματα δουλειάς (placeholders, μικτά: sites, μενού, prints, NFC). **Χωρίς `/hub` links.**
6. **Πώς δουλεύει** — 4 βήματα: Επικοινωνία → Σχεδιασμός → Υλοποίηση/Παραγωγή → Παράδοση.
7. **Σχετικά** — σύντομη ιστορία brand + placeholder stat counters.
8. **Μαρτυρίες** — 2–3 placeholder testimonial κάρτες με πρόσωπα.
9. **Επικοινωνία (footer)** — direct-contact CTAs: Instagram, email (`mailto:`), τηλέφωνο (`tel:`), Google Maps link. **Χωρίς backend.** Footer: εσωτερικά anchors + copyright (**όχι** `/cost`, **όχι** `/hub`).

## 5. Marketing / συναισθηματικά στοιχεία layout
- Κεντρικό αφήγημα: **«γεφυρώνουμε φυσικό + ψηφιακό»** — δένει όλες τις υπηρεσίες σε μία ιστορία.
- Hero σινεμά με ζεστή φωτό + δυνατό headline + καθαρό primary CTA.
- Editorial **zig-zag** featured highlights (εικόνα/κείμενο εναλλάξ) με storytelling.
- Social proof: testimonials με πρόσωπα + counters που τρέχουν στο scroll.
- Δυνατά CTA σε τερακότα, επαναλαμβανόμενα + sticky στο header — όλα προς Επικοινωνία.

## 6. Συμπεριφορά / JS (`landing.js`)
- Mobile nav toggle (hamburger).
- Smooth-scroll anchor navigation (nav links + «Δες τι κάνουμε»).
- IntersectionObserver scroll-reveal animations (fade/slide).
- Διακριτικό parallax στο hero.
- Animated stat counters (trigger όταν μπουν στο viewport).
- Σεβασμός `prefers-reduced-motion` (instant / off).

## 7. Responsive & προσβασιμότητα
- Mobile-first, breakpoints για mobile/tablet/desktop.
- Semantic HTML5, alt κείμενα, καλή αντίθεση χρωμάτων, πλήρης πλοήγηση με πληκτρολόγιο, `lang="el"`.

## 8. Εκτός scope
- **Κανένα link σε `/cost` ή `/hub`** από CTA ή footer.
- Καμία αλλαγή στα `/cost` και `/hub` (μένουν σκούρα).
- Χωρίς backend, χωρίς build step, χωρίς υποβολή φόρμας επικοινωνίας (Netlify Forms = πιθανό μελλοντικό add-on, όχι τώρα).
- Τελικό περιεχόμενο (πραγματικό copy, φωτό, testimonials) — μόνο placeholders προς το παρόν.

## 9. Κριτήρια επιτυχίας / Επαλήθευση
- Η σελίδα φορτώνει στο `/` με όλες τις ενότητες.
- Το services grid προβάλλει όλες τις υπηρεσίες ισότιμα· όλα τα CTA οδηγούν σε **Επικοινωνία** (κανένα προς `/cost` ή `/hub`).
- Το featured highlight (NFC μπρελόκ) εμφανίζεται με storytelling/zig-zag.
- Σωστή εμφάνιση σε mobile/tablet/desktop.
- Τα ελληνικά αποδίδονται σωστά με τις επιλεγμένες γραμματοσειρές (επιβεβαιωμένη κάλυψη glyphs).
- Τα animations δουλεύουν και σέβονται το `prefers-reduced-motion`.
- Προσβάσιμο: semantic δομή, alt, keyboard nav, επαρκής αντίθεση.
- Επαλήθευση με άνοιγμα σε browser.

## 10. Ανοιχτά / υποθέσεις προς επιβεβαίωση
- Τελική επιλογή γραμματοσειράς τίτλων (μετά από έλεγχο ελληνικών glyphs).
- Στοιχεία επικοινωνίας (Instagram handle, email, τηλέφωνο, διεύθυνση) είναι placeholders.
- Ακριβής λίστα/σειρά υπηρεσιών και ποιο(α) είναι featured (default: NFC μπρελόκ).
- Τι περιλαμβάνει το «κ.ά.» — αν υπάρχουν κι άλλες υπηρεσίες να προστεθούν στο grid.
