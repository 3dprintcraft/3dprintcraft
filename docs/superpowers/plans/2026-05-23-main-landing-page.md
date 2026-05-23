# 3DPrintCraft Main Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a warm, emotional, marketing-driven Greek landing page for 3DPrintCraft at `/index.html`, leading with 3D printing and presenting the full service range, with all CTAs driving to contact.

**Architecture:** Multi-file static site (no build step): one semantic `index.html`, one stylesheet `assets/css/landing.css` driven by CSS custom-property design tokens, one progressive-enhancement script `assets/js/landing.js`. Layout is hybrid: hero brand-promise → priority-ordered services grid → zig-zag featured highlights → portfolio → how-it-works → about → testimonials → contact footer. Image slots are CSS/SVG placeholders the owner swaps for real `<img>` later.

**Tech Stack:** HTML5, CSS3 (custom properties, grid/flex, `prefers-reduced-motion`), vanilla JS (`IntersectionObserver`, `requestAnimationFrame`), Google Fonts (Cormorant + Inter, Greek subset). No framework, no bundler.

**Source spec:** `docs/superpowers/specs/2026-05-23-main-landing-page-design.md`

---

## Verification Approach (read first)

This repo has **no test runner** and the page has **no build step**, so classic unit-test TDD does not apply. Each task is verified two ways:

1. **Objective structural checks** — concrete, repeatable assertions against the files (element/anchor presence, no forbidden links, valid nesting). Phrased as "confirm X" — use Grep/Read.
2. **Browser observation** — serve locally and look. Start a server once at the repo root:
   - `python -m http.server 8000` → open `http://localhost:8000/`
   - (Fallback if no Python: open `index.html` directly — asset paths are **relative**, so `file://` works too.)

**Global invariant checked in several tasks:** the page must contain **zero** links to `/cost` or `/hub`. Concretely: searching the repo's `index.html` for `href="/cost`, `href="/hub`, `/cost"`, or `hub/` must return no matches.

**Asset paths are relative** (`assets/css/landing.css`, not `/assets/...`) so the page previews correctly both when served at `/` and when opened as a local file.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Semantic markup for all 9 sections; loads fonts, CSS, JS. Replaces the existing empty stub. |
| `assets/css/landing.css` | All styles: `:root` design tokens, reset, base typography, shared components (`.btn`, `.card`, `.section`, `.reveal`), per-section layout, responsive breakpoints, motion + reduced-motion. |
| `assets/js/landing.js` | Progressive enhancement: mobile nav toggle, sticky-header state, scroll-reveal, hero parallax, animated counters. All behaviors no-op or settle to final state under `prefers-reduced-motion`. |
| `assets/img/.gitkeep` | Keeps the (initially empty) image folder in git; real photos dropped here later. |

DRY: shared visual primitives (`.btn`, `.card`, `.section`, `.container`, `.eyebrow`, `.reveal`) are defined once in Task 1 and reused by every section. YAGNI: no contact-form backend, no `/cost` or `/hub` integration, no extra pages.

---

## Task 1: Scaffold files, design tokens, base styles, JS init

**Files:**
- Create: `index.html`
- Create: `assets/css/landing.css`
- Create: `assets/js/landing.js`
- Create: `assets/img/.gitkeep` (empty file)

- [ ] **Step 1: Create the empty image folder marker**

Create `assets/img/.gitkeep` as an empty file.

- [ ] **Step 2: Write `index.html` skeleton**

```html
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>3DPrintCraft — Από την ιδέα στο αντικείμενο</title>
  <meta name="description" content="3D printing, NFC μπρελόκ & stands, ιστοσελίδες και ψηφιακά μενού για την επιχείρησή σου. Από την ιδέα στο αντικείμενο." />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="assets/css/landing.css" />
</head>
<body>
  <!-- HEADER added in Task 2 -->
  <main>
    <!-- HERO added in Task 3 -->
    <!-- SERVICES added in Task 4 -->
    <!-- FEATURED added in Task 5 -->
    <!-- PORTFOLIO added in Task 6 -->
    <!-- HOW IT WORKS added in Task 7 -->
    <!-- ABOUT added in Task 8 -->
    <!-- TESTIMONIALS added in Task 9 -->
  </main>
  <!-- FOOTER added in Task 10 -->

  <script src="assets/js/landing.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Write `assets/css/landing.css` tokens + base + shared components**

```css
/* ===== Design tokens ===== */
:root {
  --bg:        #FBF6EF;
  --surface:   #F3E9DC;
  --terracotta:#C75B39;
  --gold:      #E9A93C;
  --cta:       #FF6B2B;
  --ink:       #2E2620;
  --muted:     #7A6E62;
  --sage:      #7C8A5A;

  --font-head: 'Cormorant', Georgia, 'Times New Roman', serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  --maxw: 1200px;
  --gap: 1.5rem;
  --radius: 18px;
  --radius-sm: 12px;
  --shadow: 0 16px 40px rgba(46, 38, 32, 0.10);
  --shadow-sm: 0 6px 18px rgba(46, 38, 32, 0.08);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== Reset ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; border: none; background: none; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  line-height: 1.65;
  font-size: 1.05rem;
  overflow-x: hidden;
}

/* ===== Typography ===== */
h1, h2, h3 { font-family: var(--font-head); font-weight: 700; line-height: 1.08; letter-spacing: -0.01em; }
h1 { font-size: clamp(2.6rem, 6vw, 4.6rem); }
h2 { font-size: clamp(2rem, 4.2vw, 3.2rem); }
h3 { font-size: clamp(1.4rem, 2.4vw, 1.9rem); }
p  { color: var(--ink); }
.lead { font-size: clamp(1.1rem, 1.6vw, 1.35rem); color: var(--muted); }

/* ===== Layout ===== */
.container { width: 100%; max-width: var(--maxw); margin-inline: auto; padding-inline: clamp(1.2rem, 4vw, 2.5rem); }
.section { padding-block: clamp(4rem, 9vw, 7rem); }
.section--surface { background: var(--surface); }
.eyebrow {
  font-family: var(--font-body); font-weight: 700; font-size: 0.8rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--terracotta);
  margin-bottom: 0.75rem;
}
.section__head { max-width: 56ch; margin-bottom: clamp(2rem, 4vw, 3rem); }
.section__head p { color: var(--muted); margin-top: 0.6rem; }

/* ===== Buttons ===== */
.btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.85rem 1.6rem; border-radius: 999px; font-weight: 600;
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.2s var(--ease);
}
.btn--primary { background: var(--cta); color: #fff; box-shadow: var(--shadow-sm); }
.btn--primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(255,107,43,0.35); }
.btn--ghost { background: transparent; color: var(--ink); border: 1.5px solid rgba(46,38,32,0.25); }
.btn--ghost:hover { border-color: var(--terracotta); color: var(--terracotta); }
.btn:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }

/* ===== Card ===== */
.card {
  background: #fff; border-radius: var(--radius); padding: 1.8rem;
  box-shadow: var(--shadow-sm); border: 1px solid rgba(46,38,32,0.05);
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }

/* ===== Image placeholder (swap for real <img> later) ===== */
.ph {
  position: relative; border-radius: var(--radius); overflow: hidden;
  background: linear-gradient(135deg, var(--surface), #e7d8c4);
  display: grid; place-items: center; min-height: 220px; color: var(--muted);
  font-size: 0.85rem; text-align: center; padding: 1rem;
}
.ph::after { content: "📷 " attr(data-label); }

/* ===== Scroll-reveal (JS adds .is-visible) ===== */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
.reveal.is-visible { opacity: 1; transform: none; }

/* ===== Reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
  .reveal { opacity: 1; transform: none; }
}

/* ===== Skip link (a11y) ===== */
.skip-link {
  position: absolute; left: 0.5rem; top: -3rem; z-index: 100;
  background: var(--ink); color: #fff; padding: 0.6rem 1rem; border-radius: 8px;
  transition: top 0.2s var(--ease);
}
.skip-link:focus { top: 0.5rem; }
```

- [ ] **Step 4: Write `assets/js/landing.js` init guard**

```js
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    // Behaviors registered in Task 11. Init guard confirms script loads & parses.
    document.documentElement.dataset.jsReady = 'true';
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  });
})();
```

- [ ] **Step 5: Verify scaffold**

Serve (`python -m http.server 8000`) and open `http://localhost:8000/`.
- Confirm the page loads with the cream (`#FBF6EF`) background and no console errors.
- Confirm in DevTools that `<html>` has attribute `data-js-ready="true"` (proves JS loaded).
- Confirm the Cormorant + Inter font requests succeed in the Network tab (Greek glyphs will be checked once headings exist in Task 3).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/landing.css assets/js/landing.js assets/img/.gitkeep
git commit -m "feat(landing): scaffold landing page files, design tokens, base styles"
```

---

## Task 2: Header / sticky nav

**Files:**
- Modify: `index.html` (insert as first child of `<body>`, before `<main>`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert header markup**

Insert immediately after `<body>`:

```html
  <a class="skip-link" href="#services">Παράκαμψη στο περιεχόμενο</a>

  <header class="site-header" id="top">
    <div class="container site-header__inner">
      <a class="brand" href="#top" aria-label="3DPrintCraft — αρχή">
        <span class="brand__mark">3D</span>PrintCraft
      </a>
      <nav class="nav" id="nav" aria-label="Κύρια πλοήγηση">
        <a href="#services">Υπηρεσίες</a>
        <a href="#work">Έργα</a>
        <a href="#how">Πώς δουλεύει</a>
        <a href="#contact">Επικοινωνία</a>
        <a class="btn btn--primary nav__cta" href="#contact">Ζήτα προσφορά</a>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-controls="nav" aria-expanded="false" aria-label="Άνοιγμα μενού">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
```

- [ ] **Step 2: Append header styles**

```css
/* ===== Header ===== */
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(251, 246, 239, 0.78); backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent; transition: border-color 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.site-header.is-stuck { border-color: rgba(46,38,32,0.08); box-shadow: var(--shadow-sm); }
.site-header__inner { display: flex; align-items: center; justify-content: space-between; padding-block: 0.9rem; }
.brand { font-family: var(--font-head); font-size: 1.5rem; font-weight: 700; }
.brand__mark { color: var(--terracotta); }
.nav { display: flex; align-items: center; gap: 1.6rem; }
.nav a { font-weight: 500; color: var(--ink); transition: color 0.2s var(--ease); }
.nav a:not(.nav__cta):hover { color: var(--terracotta); }
.nav-toggle { display: none; flex-direction: column; gap: 5px; padding: 8px; }
.nav-toggle span { width: 26px; height: 2.5px; background: var(--ink); border-radius: 2px; transition: transform 0.3s var(--ease), opacity 0.2s; }

@media (max-width: 860px) {
  .nav {
    position: fixed; inset: 0 0 0 auto; width: min(78vw, 320px);
    flex-direction: column; align-items: flex-start; justify-content: center;
    gap: 1.6rem; padding: 2rem; background: var(--bg); box-shadow: var(--shadow);
    transform: translateX(100%); transition: transform 0.35s var(--ease);
  }
  .nav.is-open { transform: translateX(0); }
  .nav-toggle { display: flex; z-index: 60; }
  .nav-toggle.is-open span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
  .nav-toggle.is-open span:nth-child(2) { opacity: 0; }
  .nav-toggle.is-open span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }
}

/* offset anchored sections so the sticky header doesn't cover titles */
:where(section[id]) { scroll-margin-top: 84px; }
```

- [ ] **Step 3: Verify**

Reload `http://localhost:8000/`.
- Desktop width: nav links + orange "Ζήτα προσφορά" button visible inline; header sticks to top on scroll.
- Resize < 860px: links hide, hamburger appears. (Toggle interactivity wired in Task 11 — here just confirm the hamburger renders.)
- Confirm all four nav `href`s are in-page anchors (`#services`, `#work`, `#how`, `#contact`) — **no** `/cost` or `/hub`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): sticky header with responsive nav"
```

---

## Task 3: Hero — brand promise

**Files:**
- Modify: `index.html` (replace `<!-- HERO -->` comment)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert hero markup**

```html
    <section class="hero" id="hero">
      <div class="hero__bg ph" data-label="Φωτογραφία: 3D printer εν ώρα εκτύπωσης, ζεστό φως" aria-hidden="true"></div>
      <div class="container hero__inner">
        <p class="eyebrow reveal">3D Printing · NFC · Ψηφιακά</p>
        <h1 class="reveal">Δώσε ζωή στην ιδέα σου — από την ιδέα στο αντικείμενο.</h1>
        <p class="lead reveal">Σχεδιάζουμε και τυπώνουμε ό,τι φαντάζεσαι — και το πάμε ένα βήμα παραπέρα με NFC και ψηφιακή παρουσία για την επιχείρησή σου.</p>
        <div class="hero__cta reveal">
          <a class="btn btn--primary" href="#contact">Ζήτα προσφορά</a>
          <a class="btn btn--ghost" href="#services">Δες τι κάνουμε</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append hero styles**

```css
/* ===== Hero ===== */
.hero { position: relative; min-height: 88vh; display: flex; align-items: center; overflow: hidden; }
.hero__bg { position: absolute; inset: 0; border-radius: 0; min-height: 100%; z-index: 0; }
.hero__bg::before {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(100deg, rgba(251,246,239,0.94) 0%, rgba(251,246,239,0.78) 42%, rgba(199,91,57,0.22) 100%);
}
.hero__inner { position: relative; z-index: 2; max-width: 760px; padding-block: 4rem; }
.hero h1 { margin-block: 0.5rem 1.2rem; }
.hero .lead { max-width: 54ch; }
.hero__cta { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2rem; }
```

> Note: `.hero__bg` reuses `.ph` but overrides border-radius to fill. The `data-label` caption is hidden behind the gradient on the live page; it documents the intended photo for whoever swaps it. To use a real photo later, replace the `.ph` div with `<img class="hero__bg" src="assets/img/hero.jpg" alt="" />`.

- [ ] **Step 3: Verify (incl. Greek font check)**

Reload.
- Hero fills most of the viewport; headline reads in a warm serif over a soft cream→terracotta wash; two buttons (orange primary + ghost).
- **Greek glyph check:** the Cormorant headline must render real Greek letters, not boxes/tofu. If any heading shows fallback/tofu, swap the font: in `index.html` change the Google Fonts `family=Cormorant:...` to `family=Spectral:wght@500;600;700` and in `landing.css` set `--font-head: 'Spectral', Georgia, serif;` (Spectral has verified Greek). Re-check.
- `reveal` elements start invisible (they animate in once Task 11 lands; for now they may stay hidden — that's expected until the observer exists. To preview content meanwhile, you may temporarily add `.is-visible` in DevTools).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): hero with brand promise and dual CTA"
```

---

## Task 4: Services grid (priority-ordered)

**Files:**
- Modify: `index.html` (replace `<!-- SERVICES -->`)
- Modify: `assets/css/landing.css` (append)

Order is fixed by the spec: 3D printing → NFC μπρελόκ & stands → Ιστοσελίδες → Mini μενού → Mini hub sites.

- [ ] **Step 1: Insert services markup**

```html
    <section class="section" id="services">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">Τι κάνουμε</p>
          <h2>Φτιάχνουμε — με προτεραιότητα στο 3D printing.</h2>
          <p>Από φυσικά αντικείμενα μέχρι την ψηφιακή σου παρουσία, όλα από ένα στούντιο.</p>
        </div>
        <div class="services-grid">
          <article class="card service reveal service--feature">
            <div class="service__icon" aria-hidden="true">🖨️</div>
            <h3>3D Printing</h3>
            <p>Custom εκτυπώσεις, πρωτότυπα, ανταλλακτικά και δώρα — από το σχέδιο στο χέρι σου.</p>
            <a class="service__link" href="#contact">Ζήτα προσφορά →</a>
          </article>
          <article class="card service reveal service--feature">
            <div class="service__icon" aria-hidden="true">📲</div>
            <h3>NFC μπρελόκ &amp; stands</h3>
            <p>Έξυπνα μπρελόκ και επιτραπέζια stands που με ένα tap ανοίγουν link, μενού ή προφίλ.</p>
            <a class="service__link" href="#contact">Ζήτα προσφορά →</a>
          </article>
          <article class="card service reveal">
            <div class="service__icon" aria-hidden="true">🌐</div>
            <h3>Ιστοσελίδες</h3>
            <p>Γρήγορες, όμορφες σελίδες που παρουσιάζουν την επιχείρησή σου όπως της αξίζει.</p>
            <a class="service__link" href="#contact">Ζήτα προσφορά →</a>
          </article>
          <article class="card service reveal">
            <div class="service__icon" aria-hidden="true">🍽️</div>
            <h3>Mini ψηφιακά μενού</h3>
            <p>Μενού με QR που ενημερώνεις όποτε θες — χωρίς ανατυπώσεις.</p>
            <a class="service__link" href="#contact">Ζήτα προσφορά →</a>
          </article>
          <article class="card service reveal">
            <div class="service__icon" aria-hidden="true">🔗</div>
            <h3>Mini hub sites</h3>
            <p>Μία σελίδα-κόμβος για όλα σου τα link, ώρες και τρόπους παραγγελίας.</p>
            <a class="service__link" href="#contact">Ζήτα προσφορά →</a>
          </article>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append services styles**

```css
/* ===== Services grid ===== */
.services-grid { display: grid; gap: var(--gap); grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.service { display: flex; flex-direction: column; gap: 0.6rem; }
.service__icon { font-size: 2.2rem; line-height: 1; }
.service h3 { color: var(--ink); }
.service p { color: var(--muted); flex: 1; }
.service__link { color: var(--terracotta); font-weight: 600; align-self: flex-start; transition: gap 0.2s var(--ease); }
.service__link:hover { text-decoration: underline; }
/* The two priority services span wider on large screens */
.service--feature { border-top: 3px solid var(--gold); }
@media (min-width: 880px) {
  .services-grid { grid-template-columns: repeat(6, 1fr); }
  .service { grid-column: span 2; }
  .service--feature { grid-column: span 3; } /* 3D + NFC bigger, top row */
}
```

- [ ] **Step 3: Verify**

Reload, scroll to Υπηρεσίες.
- Five service cards; on wide screens the first two (3D Printing, NFC) are visibly larger and sit on the top row with a gold top-border.
- Order top-to-bottom/left-to-right is exactly: 3D Printing, NFC μπρελόκ & stands, Ιστοσελίδες, Mini ψηφιακά μενού, Mini hub sites.
- Every `service__link` points to `#contact`. Confirm no service links to `/cost` or `/hub`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): priority-ordered services grid"
```

---

## Task 5: Featured highlights (zig-zag storytelling)

**Files:**
- Modify: `index.html` (replace `<!-- FEATURED -->`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert featured markup**

```html
    <section class="section section--surface" id="featured">
      <div class="container feature">
        <div class="feature__media ph reveal" data-label="Φωτογραφία: κοντινό σε φρεσκο-τυπωμένο custom αντικείμενο"></div>
        <div class="feature__text reveal">
          <p class="eyebrow">Η καρδιά μας</p>
          <h2>3D printing που μετατρέπει ιδέες σε πράγματα.</h2>
          <p class="lead">Στείλε μας ένα σκίτσο, μια φωτογραφία ή απλώς την ιδέα. Σχεδιάζουμε, τυπώνουμε και φινίρουμε — πρωτότυπα, ανταλλακτικά, διακοσμητικά, εταιρικά δώρα.</p>
          <a class="btn btn--primary" href="#contact">Ξεκίνα την ιδέα σου</a>
        </div>
      </div>
      <div class="container feature feature--reverse">
        <div class="feature__media ph reveal" data-label="Φωτογραφία: χέρι κάνει tap σε NFC μπρελόκ / stand"></div>
        <div class="feature__text reveal">
          <p class="eyebrow">Phygital</p>
          <h2>NFC μπρελόκ &amp; stands: ένα tap, χίλιες δυνατότητες.</h2>
          <p class="lead">Φυσικό αντικείμενο, ψηφιακή δύναμη. Ένα tap ανοίγει το μενού, το Google review, το Instagram ή την κάρτα σου — ιδανικό για καταστήματα και επαγγελματίες.</p>
          <a class="btn btn--primary" href="#contact">Θέλω NFC</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append featured styles**

```css
/* ===== Featured zig-zag ===== */
.feature { display: grid; gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; }
.feature + .feature { margin-top: clamp(3rem, 6vw, 5rem); }
.feature__media { min-height: 340px; }
.feature__text .lead { color: var(--muted); margin-block: 0.5rem 1.5rem; }
@media (min-width: 800px) {
  .feature { grid-template-columns: 1fr 1fr; }
  .feature--reverse .feature__media { order: 2; }
}
```

- [ ] **Step 3: Verify**

Reload, scroll to the featured band (surface-tinted background).
- Two alternating rows: row 1 image-left/text-right (3D printing), row 2 image-right/text-left (NFC) on wide screens; stacked on mobile.
- Both CTAs (`Ξεκίνα την ιδέα σου`, `Θέλω NFC`) link to `#contact`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): featured highlights for 3D printing and NFC"
```

---

## Task 6: Portfolio (Έργα)

**Files:**
- Modify: `index.html` (replace `<!-- PORTFOLIO -->`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert portfolio markup**

```html
    <section class="section" id="work">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">Έργα</p>
          <h2>Λίγα από αυτά που έχουμε φτιάξει.</h2>
        </div>
        <div class="work-grid">
          <figure class="work reveal"><div class="ph" data-label="Custom 3D print"></div><figcaption>Custom διακοσμητικό · 3D print</figcaption></figure>
          <figure class="work reveal"><div class="ph" data-label="NFC μπρελόκ"></div><figcaption>NFC μπρελόκ για café</figcaption></figure>
          <figure class="work reveal"><div class="ph" data-label="NFC stand"></div><figcaption>Επιτραπέζιο NFC stand</figcaption></figure>
          <figure class="work reveal"><div class="ph" data-label="Πρωτότυπο"></div><figcaption>Λειτουργικό πρωτότυπο</figcaption></figure>
          <figure class="work reveal"><div class="ph" data-label="Ιστοσελίδα"></div><figcaption>Ιστοσελίδα επιχείρησης</figcaption></figure>
          <figure class="work reveal"><div class="ph" data-label="Ψηφιακό μενού"></div><figcaption>Ψηφιακό μενού QR</figcaption></figure>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append portfolio styles**

```css
/* ===== Portfolio ===== */
.work-grid { display: grid; gap: var(--gap); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.work { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); background: #fff; }
.work .ph { min-height: 200px; border-radius: 0; }
.work figcaption { padding: 0.9rem 1.1rem; font-size: 0.95rem; color: var(--muted); }
```

- [ ] **Step 3: Verify**

Reload, scroll to Έργα. Responsive grid of 6 placeholder tiles, each captioned. **Confirm no `/hub` links anywhere in this section** (these are non-linked placeholders by design).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): portfolio grid with placeholder work"
```

---

## Task 7: How it works (Πώς δουλεύει)

**Files:**
- Modify: `index.html` (replace `<!-- HOW IT WORKS -->`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert markup**

```html
    <section class="section section--surface" id="how">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">Πώς δουλεύει</p>
          <h2>Τέσσερα απλά βήματα.</h2>
        </div>
        <ol class="steps">
          <li class="step reveal"><span class="step__num">1</span><h3>Επικοινωνία</h3><p>Μας λες την ιδέα σου και τι χρειάζεσαι.</p></li>
          <li class="step reveal"><span class="step__num">2</span><h3>Σχεδιασμός</h3><p>Σχεδιάζουμε και συμφωνούμε στο αποτέλεσμα.</p></li>
          <li class="step reveal"><span class="step__num">3</span><h3>Υλοποίηση</h3><p>Τυπώνουμε / στήνουμε με μεράκι και ποιότητα.</p></li>
          <li class="step reveal"><span class="step__num">4</span><h3>Παράδοση</h3><p>Το παραλαμβάνεις έτοιμο — έγκαιρα.</p></li>
        </ol>
      </div>
    </section>
```

- [ ] **Step 2: Append styles**

```css
/* ===== Steps ===== */
.steps { list-style: none; display: grid; gap: var(--gap); grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); counter-reset: step; }
.step { background: #fff; border-radius: var(--radius); padding: 1.8rem; box-shadow: var(--shadow-sm); }
.step__num {
  display: inline-grid; place-items: center; width: 2.6rem; height: 2.6rem; margin-bottom: 0.8rem;
  border-radius: 50%; background: var(--terracotta); color: #fff; font-family: var(--font-head); font-size: 1.3rem; font-weight: 700;
}
.step h3 { margin-bottom: 0.3rem; }
.step p { color: var(--muted); }
```

- [ ] **Step 3: Verify**

Reload, scroll to Πώς δουλεύει. Four numbered cards in order Επικοινωνία → Σχεδιασμός → Υλοποίηση → Παράδοση.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): how-it-works steps"
```

---

## Task 8: About + animated stat counters

**Files:**
- Modify: `index.html` (replace `<!-- ABOUT -->`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert markup**

```html
    <section class="section" id="about">
      <div class="container about">
        <div class="about__text reveal">
          <p class="eyebrow">Σχετικά</p>
          <h2>Ένα μικρό στούντιο με μεγάλη αγάπη στο φτιάξιμο.</h2>
          <p class="lead">Ξεκινήσαμε από το πάθος για το 3D printing και μεγαλώσαμε μαζί με τις ανάγκες των τοπικών επιχειρήσεων — φτιάχνοντας πράγματα που κρατάς στα χέρια σου και εργαλεία που σε φέρνουν online.</p>
        </div>
        <ul class="stats">
          <li class="stat reveal"><span class="stat__num" data-count-to="1200" data-suffix="+">0</span><span class="stat__label">αντικείμενα τυπωμένα</span></li>
          <li class="stat reveal"><span class="stat__num" data-count-to="150" data-suffix="+">0</span><span class="stat__label">ευχαριστημένοι πελάτες</span></li>
          <li class="stat reveal"><span class="stat__num" data-count-to="40" data-suffix="+">0</span><span class="stat__label">NFC projects</span></li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 2: Append styles**

```css
/* ===== About + stats ===== */
.about { display: grid; gap: clamp(2rem, 5vw, 4rem); align-items: center; }
@media (min-width: 820px) { .about { grid-template-columns: 1.4fr 1fr; } }
.about__text .lead { color: var(--muted); margin-top: 0.6rem; }
.stats { list-style: none; display: grid; gap: var(--gap); grid-template-columns: repeat(3, 1fr); text-align: center; }
.stat { background: var(--surface); border-radius: var(--radius); padding: 1.4rem 0.8rem; }
.stat__num { display: block; font-family: var(--font-head); font-weight: 700; font-size: clamp(1.8rem, 4vw, 2.8rem); color: var(--terracotta); }
.stat__label { font-size: 0.85rem; color: var(--muted); }
@media (max-width: 520px) { .stats { grid-template-columns: 1fr; } }
```

> Counters animate in Task 11. Markup ships the final number in `data-count-to` and a visible `0` start; if JS is disabled or reduced-motion is on, Task 11's code writes the final value immediately.

- [ ] **Step 3: Verify**

Reload, scroll to Σχετικά. Story text beside three stat blocks. Numbers currently read `0` (animation added next-to-last task). `data-count-to` values present (1200, 150, 40) with `data-suffix="+"`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): about section with stat counters markup"
```

---

## Task 9: Testimonials (Μαρτυρίες)

**Files:**
- Modify: `index.html` (replace `<!-- TESTIMONIALS -->`)
- Modify: `assets/css/landing.css` (append)

- [ ] **Step 1: Insert markup**

```html
    <section class="section section--surface" id="testimonials">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">Μαρτυρίες</p>
          <h2>Τι λένε όσοι μας εμπιστεύτηκαν.</h2>
        </div>
        <div class="quotes">
          <blockquote class="quote card reveal">
            <p>«Έφεραν την ιδέα μου στη ζωή ακριβώς όπως την ήθελα. Ταχύτητα και ποιότητα.»</p>
            <footer><span class="quote__avatar ph" data-label=""></span><span><strong>Μαρία Κ.</strong><br>Ιδιοκτήτρια καταστήματος</span></footer>
          </blockquote>
          <blockquote class="quote card reveal">
            <p>«Τα NFC stands στο μαγαζί μας εκτόξευσαν τα Google reviews. Άψογη συνεργασία.»</p>
            <footer><span class="quote__avatar ph" data-label=""></span><span><strong>Γιώργος Π.</strong><br>Καφετέρια</span></footer>
          </blockquote>
          <blockquote class="quote card reveal">
            <p>«Από το λογότυπο μέχρι τη σελίδα και τα μπρελόκ — όλα από ένα μέρος.»</p>
            <footer><span class="quote__avatar ph" data-label=""></span><span><strong>Ελένη Δ.</strong><br>Startup</span></footer>
          </blockquote>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append styles**

```css
/* ===== Testimonials ===== */
.quotes { display: grid; gap: var(--gap); grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.quote p { font-family: var(--font-head); font-size: 1.3rem; line-height: 1.4; color: var(--ink); }
.quote footer { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.2rem; font-size: 0.9rem; color: var(--muted); }
.quote__avatar { width: 48px; height: 48px; min-height: 48px; border-radius: 50%; flex: 0 0 auto; }
.quote__avatar::after { content: "🙂"; }
```

- [ ] **Step 3: Verify**

Reload, scroll to Μαρτυρίες. Three quote cards with serif quote text and an avatar placeholder + name/role.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): testimonials section"
```

---

## Task 10: Contact footer

**Files:**
- Modify: `index.html` (replace `<!-- FOOTER -->`, after `</main>`)
- Modify: `assets/css/landing.css` (append)

> Contact details below are **placeholders** (per spec §10). Swap the handle/email/phone/maps URL for real values.

- [ ] **Step 1: Insert markup**

```html
  <footer class="footer" id="contact">
    <div class="container footer__inner">
      <div class="footer__cta reveal">
        <p class="eyebrow">Επικοινωνία</p>
        <h2>Έχεις μια ιδέα; Ας τη φτιάξουμε.</h2>
        <p class="lead">Στείλε μας μήνυμα — απαντάμε γρήγορα.</p>
        <div class="footer__links">
          <a class="btn btn--primary" href="mailto:hello@3dprintcraft.gr">✉️ Email</a>
          <a class="btn btn--ghost" href="tel:+302100000000">📞 Τηλέφωνο</a>
          <a class="btn btn--ghost" href="https://instagram.com/3dprintcraft" target="_blank" rel="noopener">📷 Instagram</a>
          <a class="btn btn--ghost" href="https://maps.google.com/?q=3DPrintCraft" target="_blank" rel="noopener">📍 Χάρτης</a>
        </div>
      </div>
      <nav class="footer__nav" aria-label="Footer">
        <a href="#services">Υπηρεσίες</a>
        <a href="#work">Έργα</a>
        <a href="#how">Πώς δουλεύει</a>
        <a href="#about">Σχετικά</a>
      </nav>
    </div>
    <div class="container footer__base">
      <span class="brand"><span class="brand__mark">3D</span>PrintCraft</span>
      <small>© <span id="year">2026</span> 3DPrintCraft. Με μεράκι.</small>
    </div>
  </footer>
```

- [ ] **Step 2: Append styles**

```css
/* ===== Footer ===== */
.footer { background: var(--ink); color: #f3ece4; padding-block: clamp(3.5rem, 7vw, 5.5rem) 2rem; }
.footer .eyebrow { color: var(--gold); }
.footer h2 { color: #fff; }
.footer .lead { color: rgba(243,236,228,0.75); margin-block: 0.4rem 1.6rem; }
.footer__inner { display: grid; gap: 2.5rem; }
@media (min-width: 820px) { .footer__inner { grid-template-columns: 2fr 1fr; } }
.footer__links { display: flex; flex-wrap: wrap; gap: 0.8rem; }
.footer .btn--ghost { color: #f3ece4; border-color: rgba(243,236,228,0.3); }
.footer .btn--ghost:hover { color: var(--gold); border-color: var(--gold); }
.footer__nav { display: flex; flex-direction: column; gap: 0.7rem; }
.footer__nav a { color: rgba(243,236,228,0.8); }
.footer__nav a:hover { color: var(--gold); }
.footer__base { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(243,236,228,0.15); }
.footer__base small { color: rgba(243,236,228,0.6); }
```

- [ ] **Step 3: Verify**

Reload, scroll to bottom.
- Dark warm footer with the contact buttons. `mailto:` and `tel:` open the right handlers; Instagram/Maps open in a new tab.
- Footer nav links are in-page anchors only.
- **Global invariant:** search the whole `index.html` for `/cost` and `/hub` → **zero matches**. (Use Grep over `index.html`.)

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat(landing): contact footer with direct-contact CTAs"
```

---

## Task 11: Interactions (`landing.js`)

Now that the DOM has the classes/attributes (`.reveal`, `[data-count-to]`, `#navToggle`, `#nav`, `.site-header`, `#year`), implement all behaviors. Each settles to a usable state under reduced-motion / no-JS.

**Files:**
- Modify: `assets/js/landing.js` (replace file contents)

- [ ] **Step 1: Replace `landing.js` with full behaviors**

```js
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onReady = (fn) =>
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    document.documentElement.dataset.jsReady = 'true';

    // Footer year
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    // --- Mobile nav toggle ---
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    if (toggle && nav) {
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού');
      };
      toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
      nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    // --- Sticky header shadow ---
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // --- Scroll reveal ---
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach((el) => io.observe(el));
    }

    // --- Animated counters ---
    const counters = document.querySelectorAll('[data-count-to]');
    const runCounter = (el) => {
      const target = Number(el.dataset.countTo) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target.toLocaleString('el-GR') + suffix; return; }
      const duration = 1400; const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('el-GR') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (counters.length) {
      if (reduceMotion || !('IntersectionObserver' in window)) {
        counters.forEach(runCounter);
      } else {
        const cio = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => { if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); } });
        }, { threshold: 0.5 });
        counters.forEach((el) => cio.observe(el));
      }
    }

    // --- Hero parallax ---
    const heroBg = document.querySelector('.hero__bg');
    if (heroBg && !reduceMotion) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          heroBg.style.transform = `translateY(${window.scrollY * 0.18}px)`;
          ticking = false;
        });
      }, { passive: true });
    }
  });
})();
```

- [ ] **Step 2: Verify behaviors**

Reload `http://localhost:8000/`.
- **Reveal:** sections fade/slide in as you scroll.
- **Nav:** at < 860px the hamburger opens/closes the panel; clicking a link or pressing Esc closes it; `aria-expanded` flips true/false (check in DevTools).
- **Header:** gains a shadow after scrolling a few px.
- **Counters:** scrolling Σχετικά into view counts 0 → 1.200+, 150+, 40+ (Greek thousands separator).
- **Parallax:** hero background drifts slightly slower than scroll.
- **Footer year** shows the current year.

- [ ] **Step 3: Verify reduced-motion fallback**

In DevTools (Rendering tab) emulate `prefers-reduced-motion: reduce`, hard-reload.
- All `.reveal` content is visible immediately (nothing stuck hidden).
- Counters show final values instantly.
- No hero parallax movement.

- [ ] **Step 4: Commit**

```bash
git add assets/js/landing.js
git commit -m "feat(landing): nav toggle, scroll-reveal, counters, parallax, reduced-motion"
```

---

## Task 12: Responsive, accessibility & final pass

**Files:**
- Modify: `index.html` / `assets/css/landing.css` only if a check fails.

- [ ] **Step 1: Responsive sweep**

At 375px, 768px, 1024px, 1440px confirm: no horizontal scroll; header collapses correctly; hero text legible; grids reflow (services, work, steps, stats, quotes); footer stacks. Fix any overflow with the existing breakpoints.

- [ ] **Step 2: Accessibility checks**

- Tab from the top: skip-link appears first and jumps into content; focus order is logical; all interactive elements show the gold focus ring.
- Headings are a single `<h1>` (hero) then `<h2>` per section — no skipped levels.
- Run Lighthouse (DevTools → Lighthouse → Accessibility). Target ≥ 95; fix flagged contrast/label issues. (`--muted` on `--bg` and on dark footer must pass AA for the sizes used; darken `--muted` if Lighthouse flags it.)

- [ ] **Step 3: Greek + content correctness**

- Every heading renders Greek correctly (no tofu) in the chosen display font.
- Service order is 3D Printing → NFC → Ιστοσελίδες → Mini μενού → Mini hub sites.
- All CTAs resolve to `#contact` or real contact handlers; **Grep `index.html` for `/cost` and `/hub` → zero matches.**

- [ ] **Step 4: HTML validity**

Paste the served HTML into https://validator.w3.org/nu/ (or run a local validator). Resolve errors (unclosed tags, duplicate ids, invalid nesting). Warnings are acceptable.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix(landing): responsive, a11y, and content polish"
```

---

## Self-Review Notes (author check — completed)

- **Spec coverage:** §1 scope → Task 1–10 build all 9 sections in priority order. §2 aesthetic (palette/type/imagery) → Task 1 tokens + per-section CSS. §3 architecture → Task 1 file structure. §4 sections → Tasks 2–10. §5 marketing/emotional devices → hero (T3), zig-zag (T5), social proof + counters (T8/T11), repeated terracotta CTAs (all), sticky CTA (T2/T11). §6 JS → Task 11. §7 responsive/a11y → Task 12 (+ reduced-motion in T1/T11). §8 out-of-scope honored (no backend, no `/cost`·`/hub`). §9 success criteria → mapped into verify steps + Task 12. §10 open items → font fallback handled in T3, contact placeholders flagged in T10.
- **Placeholder scan:** no "TBD/TODO"; all code blocks complete; Greek copy is real placeholder text, not "add copy here".
- **Type/selector consistency:** classes/ids referenced by `landing.js` (`#navToggle`, `#nav`, `.site-header`, `.reveal`, `[data-count-to]`, `.hero__bg`, `#year`) are all introduced in earlier tasks before Task 11 consumes them. `data-suffix` defined in T8 and read in T11. `.is-open`/`.is-stuck`/`.is-visible` toggled by JS all have matching CSS.
