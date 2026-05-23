# 3DPrintCraft — Main Landing Page (Design Spec)

**Ημερομηνία:** 2026-05-23
**Κατάσταση:** Εγκεκριμένος σχεδιασμός — έτοιμο για πλάνο υλοποίησης

## 1. Σκοπός

Νέα κεντρική landing page για το 3DPrintCraft, από το μηδέν, στο root `/index.html` (αντικαθιστά το άδειο stub).

Το 3DPrintCraft προσφέρει **δύο** υπηρεσίες:
1. **3D εκτύπωση** — custom prints / προϊόντα κατά παραγγελία.
2. **Ψηφιακά καταστήματα** — σελίδες παραγγελιών / smart-link microsites για τοπικές επιχειρήσεις (αυτό που ζει στο `/hub`).

**Κύριος στόχος:** «Route by service» — το hero χωρίζει αμέσως τον επισκέπτη σε δύο διαδρομές, κάθε μία με δικό της CTA.

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
- Maker που κρατά το τελικό αντικείμενο.
- Καταστηματάρχης χαρούμενος με τη σελίδα του στο κινητό.
- Ύφος: φυσικό φως, ζεστό.

## 3. Αρχιτεκτονική / Αρχεία (multi-file static)

```
/index.html              ← markup (αντικαθιστά το stub)
/assets/css/landing.css   ← στυλ
/assets/js/landing.js     ← nav, scroll reveals, routing, counters
/assets/img/              ← placeholder εικόνες
```

Χωρίς build step. Στατικά αρχεία, deploy όπως είναι μαζί με τα υπάρχοντα + `_redirects`.

## 4. Ενότητες σελίδας (πάνω → κάτω)

1. **Header / nav** — sticky, ημιδιάφανο με blur. Links: Υπηρεσίες · Έργα · Πώς δουλεύει · Επικοινωνία. Hamburger στο mobile. Sticky CTA.
2. **Hero — two-path split** — συναισθηματικό headline («Δώσε ζωή στην ιδέα σου»), subhead, ζεστή φωτό φόντο, και δύο κάρτες-διαδρομές: **3D Εκτύπωση** (scroll στην ενότητα 3) / **Ψηφιακό Κατάστημα** (scroll στην ενότητα 4).
3. **3D Εκτύπωση** — τι είναι, υλικά/φινιρίσματα, χρήσεις. CTA: **«Υπολόγισε το κόστος» → `/cost`**. Placeholders prints.
4. **Ψηφιακό Κατάστημα** — order pages / microsites για τοπικά μαγαζιά, οφέλη. CTA: **«Δες ζωντανά παραδείγματα» → `/hub`**. Placeholders screenshots.
5. **Έργα / Portfolio** — μικτό grid: τα πραγματικά `/hub` shops (icefactory, milu, treysko) ως παραδείγματα storefront + placeholders prints.
6. **Πώς δουλεύει** — 4 βήματα: Επικοινωνία → Σχεδιασμός → Παραγωγή → Παράδοση.
7. **Σχετικά** — σύντομη ιστορία brand + placeholder stat counters.
8. **Μαρτυρίες** — 2–3 placeholder testimonial κάρτες με πρόσωπα.
9. **Επικοινωνία (footer)** — direct-contact CTAs: Instagram, email (`mailto:`), τηλέφωνο (`tel:`), Google Maps link. **Χωρίς backend.** Footer links σε `/cost` και `/hub` + copyright.

## 5. Marketing / συναισθηματικά στοιχεία layout
- Hero σινεμά με ζεστή φωτό + δυνατό headline + οι δύο διαδρομές ως κάρτες.
- Editorial **zig-zag** ενότητες (εικόνα/κείμενο εναλλάξ) με storytelling.
- Social proof: testimonials με πρόσωπα + counters που τρέχουν στο scroll.
- Δυνατά CTA σε τερακότα, επαναλαμβανόμενα + sticky στο header.

## 6. Συμπεριφορά / JS (`landing.js`)
- Mobile nav toggle (hamburger).
- Smooth-scroll anchor navigation (two-path routing + nav links).
- IntersectionObserver scroll-reveal animations (fade/slide).
- Διακριτικό parallax στο hero.
- Animated stat counters (trigger όταν μπουν στο viewport).
- Σεβασμός `prefers-reduced-motion` (instant / off).

## 7. Responsive & προσβασιμότητα
- Mobile-first, breakpoints για mobile/tablet/desktop.
- Semantic HTML5, alt κείμενα, καλή αντίθεση χρωμάτων, πλήρης πλοήγηση με πληκτρολόγιο, `lang="el"`.

## 8. Εκτός scope
- Καμία αλλαγή στα `/cost` και `/hub` (μένουν σκούρα).
- Χωρίς backend, χωρίς build step, χωρίς υποβολή φόρμας επικοινωνίας (Netlify Forms = πιθανό μελλοντικό add-on, όχι τώρα).
- Τελικό περιεχόμενο (πραγματικό copy, φωτό, testimonials) — μόνο placeholders προς το παρόν.

## 9. Κριτήρια επιτυχίας / Επαλήθευση
- Η σελίδα φορτώνει στο `/` με όλες τις ενότητες.
- Οι δύο διαδρομές του hero κάνουν scroll στις σωστές ενότητες· τα service CTA οδηγούν σωστά σε `/cost` και `/hub`.
- Σωστή εμφάνιση σε mobile/tablet/desktop.
- Τα ελληνικά αποδίδονται σωστά με τις επιλεγμένες γραμματοσειρές (επιβεβαιωμένη κάλυψη glyphs).
- Τα animations δουλεύουν και σέβονται το `prefers-reduced-motion`.
- Προσβάσιμο: semantic δομή, alt, keyboard nav, επαρκής αντίθεση.
- Επαλήθευση με άνοιγμα σε browser.

## 10. Ανοιχτά / υποθέσεις προς επιβεβαίωση στο build
- Τελική επιλογή γραμματοσειράς τίτλων (μετά από έλεγχο ελληνικών glyphs).
- Στοιχεία επικοινωνίας (Instagram handle, email, τηλέφωνο, διεύθυνση) είναι placeholders.
