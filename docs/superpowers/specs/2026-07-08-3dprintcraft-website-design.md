# 3DPrintCraft Website — Design Spec

**Date:** 2026-07-08
**Repo:** `C:\Users\Nomikos\Documents\GitHub\printcraft` (fresh start — supersedes `printcraft3d` static and `printcraft3d-next` experiments; those repos stay untouched)
**Domain:** https://3dprintcraft.gr
**Deploy:** GitHub → Cloudflare Pages, €0/month

## 1. Purpose

Greek-language marketing site for 3DPrintCraft (Patras): a team that started 3D printing as a hobby and grew into a leading local business. The site promotes three services — custom 3D printing, NFC gadgets (keychains, stands, coasters), and website creation for businesses — with a strong portfolio, a browsable filament color palette, and direct-channel contact (Instagram DM + email, no forms). Architecture leaves room for a future e-shop.

**Success criteria:** eye-catching signature animation on landing; all copy in Greek; 8 real portfolio photos live; 60+ real filament swatches browsable; WCAG AA; loads fast on mobile; e-shop can be added later without reworking v1 pages.

## 2. Decisions log (owner-approved)

| Decision | Choice |
|---|---|
| Starting point | Fresh build in `printcraft`, reusing brand tokens + 2026-07-07 e-shop research brief |
| Visual direction | Evolve "Cinematic Blue" (jeton-style: gradients, glass, giant type, pill dock) |
| Stack | Static HTML + custom CSS + vanilla JS, no build step at all. *(Amended 2026-07-08 during planning: the approved Cinematic Blue system already exists as proven custom CSS in printcraft3d — reusing it beats re-implementing in Tailwind; result identical, one less tool.)* |
| Pages | Multi-page: landing, portfolio, filaments, contact |
| Signature animation | A: self-printing scroll-driven hero (layer build + scanline + HUD counter) |
| Portfolio assets | Copy the 8 real photos from `Documents\GitHub\3dprintcraft\assets\img\work` (source repo READ-ONLY) |
| Filament palette | Reuse real data from old repo's `colors.js`, restyled |
| Contact | Instagram @3dprintcraft + contactprintcraft3d@gmail.com only — no phone/address, no form backend |
| Form handling | None. Direct CTAs: Instagram DM + mailto with pre-filled subject |

## 3. Site map

```
printcraft/
├── index.html          Αρχική — hero, services, portfolio highlights, filament teaser, CTA
├── portfolio.html      Portfolio — filterable grid + lightbox
├── filaments.html      Χρώματα — filament palette by material
├── contact.html        Επικοινωνία — direct CTAs + "Πώς παραγγέλνεις" steps
├── assets/
│   ├── css/            compiled tailwind.css + site.css (custom motion/components)
│   ├── js/             main.js, motion.js, portfolio.js, filaments.js
│   └── img/work/       8 portfolio photos (WebP + JPG fallback)
├── docs/superpowers/   specs + plans
├── _headers            Cloudflare security/cache headers
├── robots.txt, sitemap.xml, llms.txt, favicon.svg
└── CLAUDE.md           project profile per vault WEB-STANDARDS.md
```

Nav (floating pill dock): Αρχική · Portfolio · Χρώματα · Επικοινωνία · **«Shop — σύντομα»** pill (styled, disabled, reserves layout slot).

## 4. Page content (all Greek)

### index.html
1. **Hero** — self-printing animation: hero object builds layer-by-layer scrubbed by scroll; printer scanline; `LAYER n/300` HUD counter; giant word-split headline telling the story (hobby → leading team in Patras); dual CTA «Δες τη δουλειά μας» → portfolio, «Στείλε μας DM» → Instagram. Hero art asset: an in-house layered SVG object in the Cinematic Blue glossy style (same technique as printcraft3d's `pcArt()` gradients) — no external 3D assets or photography required.
2. **Services** — 3 glass cards: 3D Printing κατά παραγγελία · NFC Gadgets (μπρελόκ, stands, σουβέρ) · Κατασκευή Ιστοσελίδων για επιχειρήσεις. Each: icon, title, 2-line description, chip list.
3. **Portfolio highlights** — 4 best photos with hover tilt, link to portfolio.html.
4. **Filament teaser** — animated color strip of real filament hexes → filaments.html.
5. **CTA section** — dark ink background, Instagram + email buttons, giant clipped footer wordmark.

### portfolio.html
Filter pills: Όλα / Μπρελόκ / Σουβέρ / Φωτιστικά / NFC. Grid of the 8 photos (variable spans, masonry-like), each card: photo, category tag, title. Click → lightbox (native `<dialog>`). Empty-filter state handled. Structure accepts new photos by adding one `<figure>` + one thumbnail.

### filaments.html
Real swatch data ported from old `colors.js` into `filaments.js` (single source of truth: array of `{name, hex, material, finish?}`). Grouped by material with filter pills; click-to-copy hex with copied-state feedback; luminance-based text contrast per swatch; footer note: «Δεν βρίσκεις το χρώμα που θες; Ρώτησέ μας — έρχονται συνέχεια νέα.»

### contact.html
Two big CTA cards: Instagram DM (deep link to ig.me/m/3dprintcraft with web fallback https://instagram.com/3dprintcraft) and email (mailto with pre-filled Greek subject «Ενδιαφέρομαι για 3D εκτύπωση»). Below: 4-step «Πώς παραγγέλνεις»: ① Στείλε την ιδέα ή το αρχείο σου → ② Παίρνεις προσφορά → ③ Εκτύπωση → ④ Παραλαβή/αποστολή.

## 5. Design system

**Tokens:**
- Accent: electric blue `#2e54ff` (sole saturated accent); `#1c39c8` deep variant for small text on light backgrounds (AA)
- Light base: `#f5f6f9` + paper family (`#f7f7f4`, `#ecebe5`); dark sections: ink `#14161a` / `#2e3138`
- Semantic: success `#0f8a4f`, error `#d02b1f`
- Type: **Commissioner** variable font (full Greek, proven in printcraft3d), self-hosted woff2, `font-display: swap`. Display scale via `clamp()`; hero h1 `clamp(2.5rem, 12.5vw, 4.2rem)` (mobile-overflow-safe value from v2.1 fixes)
- Surfaces: glass cards (blur + translucent white), 1px hairline borders, soft blue glow hovers, grain overlay (base64 SVG, low opacity)

**Motion layer** — every effect gated behind `prefers-reduced-motion: no-preference` (and pointer-dependent ones behind `pointer: fine`); `?motion=force` dev override retained for preview testing:
- Self-printing hero: scroll-scrubbed via a single rAF-batched scroll pipeline (reads-then-writes); layer build via `clip-path` inset scrub on the hero art; scanline sweep; HUD counter driven by same scroll fraction. *(Amended 2026-07-08 after Task 3 review: CSS scroll-timeline reveals dropped — they permanently own `transform`, killing card tilt, and leak motion under reduced-motion; IntersectionObserver is the sole reveal mechanism. No-JS/reduced-motion safety via `.print-scrub-on`/`.motion-force` root classes: the default CSS state is the finished print, unpinned.)*
- Word-split staggered headline reveals (`data-split`)
- Magnetic buttons + dock (pointer: fine only)
- Pointer parallax on hero layers
- Portfolio/service card 3D tilt (delegated listener)
- MPA View Transitions (`@view-transition`) between pages, progressive enhancement
- Scroll progress indicator in the dock
- Known pitfall carried over: `overflow-x` fallback for browsers without `clip` support (caused mobile side-clipping in v2.1)

## 6. Technical architecture

- **CSS:** Tailwind compiled once via CLI (`tailwindcss -m`) and committed; custom components/motion in `site.css`. No CDN Tailwind in production.
- **JS:** vanilla ES modules, deferred; target <100KB total. `filaments.js` data + render; `portfolio.js` filters + lightbox; `motion.js` all animation; `main.js` nav/shared.
- **Images:** 8 photos copied from old repo as-is (already optimized JPGs, 55–209KB each — under the 300KB flag threshold; WebP conversion deferred, no converter tooling on this machine), explicit width/height, `loading="lazy"` below the fold.
- **SEO/GEO** (per vault `reference\WEB-STANDARDS.md`): Greek meta + OG tags per page; JSON-LD `LocalBusiness` (Πάτρα) + `Service` entries + `ImageObject` for portfolio; `llms.txt`; `sitemap.xml` + `robots.txt` for 3dprintcraft.gr; canonical URLs.
- **Headers:** `_headers` with security (CSP compatible with self-hosted assets, X-Content-Type-Options, etc.) and cache policy (immutable for hashed/static assets).
- **Accessibility (WCAG AA):** semantic landmarks, logical headings, visible focus, alt text on every photo, ≥4.5:1 body contrast (deep blue variant where needed), reduced-motion fallback for all animation, `lang="el"`.
- **E-shop readiness:** dock reserves the Shop slot; JS module layout matches the researched cart/checkout pattern (Viva Smart Checkout / IRIS / COD per `research\2026-07-07-3d-printing-e-shop.md`) so `/shop` can be added as new pages + one module without touching v1.

## 7. Error handling & edge cases

- No-JS: all static content visible (animations are pure enhancement). The filament palette is JS-rendered from embedded JSON, so `filaments.html` includes a `<noscript>` notice pointing to Instagram/email for the color list. Portfolio grid is plain HTML (filters/lightbox are enhancements), so it works without JS.
- Reduced motion: hero shows final printed state, static; all reveals appear without animation.
- Slow connection: font swap, lazy images, no layout shift (dimensions set).
- Long Greek strings: headline clamps tested at 360px.
- Broken/missing image: `alt` text + card background keeps layout intact.
- Instagram deep link: `ig.me` may fail on desktop → plain profile URL fallback link always present.

## 8. Testing & verification

- Preview server per page: screenshot desktop (1280) + mobile (375), light/dark scheme where relevant.
- Console: zero errors; network: zero failed requests.
- Manual checks: portfolio filters (each category + empty), lightbox open/close/ESC, copy-to-clipboard feedback, reduced-motion pass (`?motion=force` off), 360px no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).
- Lighthouse-style pass during `/harden` (separate step after build): perf, a11y, SEO.

## 9. Motion v4 — "eye-catching" pass (approved 2026-07-09)

Owner-approved additions from `vellum-forge/research/2026-07-09-micro-interactions-animation-patterns.md` (React Bits techniques hand-ported per the vault index — never JSX copied). All gated behind the existing root-class system (`prefers-reduced-motion`, `pointer: fine`, `?motion=force`); no-JS default remains fully visible/static; zero build step preserved.

1. **Dock magnification** — cursor-distance scale (cap ~1.15 for text pills, ±110px falloff) with damped-spring rAF, composed with the existing `--mx/--my` magnet system.
2. **ClickSpark** — full-viewport canvas overlay; 8 radial sparks (400ms, ease-out) at click point on `.btn`/dock links; `--ice`/white strokes.
3. **Shine sweep** — CSS-only `::before` gradient strip sweep on `.btn-primary` hover.
4. **Spotlight card hover** — pointer-following radial-gradient highlight on `.work-card`/`.service-card` via CSS custom properties, extending the existing delegated pointer handler.
5. **DecryptedText kickers** — scroll-triggered character-scramble reveal on `.kicker` labels (IO-triggered, ~10 iterations, width-locked during shuffle, aria-label preserved).
6. ~~Stats band~~ — REJECTED by owner (no real numbers yet).
7. **Marquee ticker** — CSS-only infinite strip on index (between portfolio highlights and filament teaser); duplicated content, `aria-hidden` + sr-only static mirror; static under reduced motion.
8. **Curtain handoff** — services section clip-path lift scrubbed by the existing rAF pipeline as the hero pin completes; exists only under `.print-scrub-on` (no-JS/reduce-safe default = fully visible).
9. **Sticky-grid portfolio unfold** — portfolio grid assembles inside a pinned stage on first scroll-through (entrance-only; ≥761px only; any filter click force-completes the unfold; default state = normal grid).

Explicitly rejected with evidence: custom cursors (a11y backlash), ambient backgrounds behind the hero, WebGL/shader components, glassmorphism expansion, "3D mobile menus" (unverified trend).

*Amendment 2026-07-10 (owner request):* the self-printing hero print-stage (spec §4.1 / v4 context) and the DecryptedText kickers (item 5) are **temporarily disabled** — the hero figure is removed from index.html (restore: `git show 107c569:index.html`, figure.print-stage; motion/CSS auto-disable while absent) and the kickers are gated off via `DECRYPT_KICKERS = false` in motion.js. Footer giant-mark letter-spacing loosened −0.05em → −0.015em (glyphs touched).

## 10. Out of scope (v1)

- E-shop pages, cart, checkout, payments (researched, slot reserved, added later)
- Quote form with file upload (owner chose direct channels)
- Legal pages (όροι, απόρρητο) — no forms/cookies/analytics in v1, revisit with e-shop
- Blog, custom OG image generation, analytics
