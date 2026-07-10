# 3DPrintCraft Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 4-page Greek marketing site for 3DPrintCraft (spec: `docs/superpowers/specs/2026-07-08-3dprintcraft-website-design.md`) with a self-printing scroll hero, portfolio, filament palette, and direct-channel contact, deployable to Cloudflare Pages.

**Architecture:** Static MPA — 4 HTML pages sharing one custom CSS design system (carried over from the proven printcraft3d "Cinematic Blue" v2.1 and evolved) and one vanilla-JS motion engine. No build step. All JS in external files (strict CSP, no inline scripts). Source repos (`3dprintcraft`, `printcraft3d`) are READ-ONLY — we copy from them, never modify them.

**Tech Stack:** HTML5, custom CSS (evolved `site.css`), vanilla JS ES2020, self-hosted Commissioner variable font (Greek+Latin subsets), Cloudflare Pages (`_headers`), preview via `npx http-server` (node v24 confirmed installed).

**Verification model:** No test framework exists for a static site; each task ends with preview-tool verification steps (screenshot / console / DOM inspection) with stated expected results. That is this project's test suite. Run `preview_start` once in Task 1 and reuse the server.

**Working directory:** `C:\Users\Nomikos\Documents\GitHub\printcraft` (all relative paths below are from here).

---

## Shared page shell (reference blocks)

Tasks 4–7 each build a full page. To keep the plan DRY, the shared markup is defined ONCE here as parameterized blocks. When a task says "insert Shell HEAD with TITLE=…", copy the block below verbatim and substitute the `{{…}}` parameters. These are plan-authoring templates — the produced HTML files contain the substituted text, no templating at runtime.

### Shell HEAD (parameters: TITLE, DESC, PATH, JSONLD)

```html
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}}</title>
  <meta name="description" content="{{DESC}}">
  <link rel="canonical" href="https://3dprintcraft.gr/{{PATH}}">
  <meta property="og:title" content="{{TITLE}}">
  <meta property="og:description" content="{{DESC}}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://3dprintcraft.gr/{{PATH}}">
  <meta property="og:image" content="https://3dprintcraft.gr/assets/img/og.jpg">
  <meta property="og:locale" content="el_GR">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/commissioner-greek.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/commissioner-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/site.css">
  <script type="application/ld+json">
  {{JSONLD}}
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Μετάβαση στο περιεχόμενο</a>

  <header class="topbar">
    <a class="logo" href="index.html" aria-label="3DPrintCraft — Αρχική">3dprint<em>craft</em></a>
  </header>
```

`PATH` is `""` for index.html, otherwise the filename (`portfolio.html` etc.).

### Shell DOCK (parameter: ACTIVE — put `aria-current="page"` on the matching link)

```html
  <nav class="dock" aria-label="Κύρια πλοήγηση">
    <span class="dock-progress" aria-hidden="true"></span>
    <a href="index.html">Αρχική</a>
    <a href="portfolio.html">Portfolio</a>
    <a href="filaments.html">Χρώματα</a>
    <a href="contact.html">Επικοινωνία</a>
    <span class="dock-soon">Shop<em>σύντομα</em></span><!-- no aria-label: generic role, visible text suffices (Task 4 review) -->
  </nav>
```

### Shell FOOTER (identical on every page)

```html
  <footer class="footer">
    <div class="wrap">
      <div class="footer-inner">
        <div>
          <p class="footer-brand">3dprint<span>craft</span></p>
          <p class="footer-blurb">Ομάδα 3D εκτύπωσης στην Πάτρα. Ξεκίνησε ως χόμπι — σήμερα κορυφαία επιλογή για custom εκτυπώσεις, NFC gadgets και ιστοσελίδες.</p>
        </div>
        <div>
          <h4>Πλοήγηση</h4>
          <ul>
            <li><a href="portfolio.html">Portfolio</a></li>
            <li><a href="filaments.html">Χρώματα νημάτων</a></li>
            <li><a href="contact.html">Επικοινωνία</a></li>
          </ul>
        </div>
        <div>
          <h4>Επικοινωνία</h4>
          <ul>
            <li><a href="https://instagram.com/3dprintcraft" rel="me noopener" target="_blank">Instagram @3dprintcraft</a></li>
            <li><a href="mailto:contactprintcraft3d@gmail.com">contactprintcraft3d@gmail.com</a></li>
            <li><span class="footer-muted">Πάτρα, Ελλάδα</span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bar">
        <span>© 2026 3DPRINTCRAFT</span>
        <span>Σχεδιάστηκε &amp; τυπώθηκε στην Πάτρα</span>
      </div>
    </div>
    <p class="giant-mark" aria-hidden="true">3dprintcraft</p>
  </footer>

  <script src="assets/js/motion.js" defer></script>
</body>
</html>
```

Pages with extra JS add their `<script src="…" defer>` line before `motion.js`.

---

### Task 1: Repo bootstrap, assets, preview server

**Files:**
- Create: `.gitignore`, `CLAUDE.md`, `.claude/launch.json`
- Copy in: `assets/img/work/*.jpg` (8), `assets/img/og.jpg`, `favicon.svg`

- [ ] **Step 1: Init repo and .gitignore**

```powershell
git init; git branch -m main
```

Create `.gitignore`:

```
Thumbs.db
Desktop.ini
node_modules/
.wrangler/
```

- [ ] **Step 2: Copy assets from the old repo (READ-ONLY source — copy, never move)**

```powershell
New-Item -ItemType Directory -Force assets\img\work, assets\css, assets\js, assets\fonts
Copy-Item "C:\Users\Nomikos\Documents\GitHub\3dprintcraft\assets\img\work\*.jpg" assets\img\work\
Copy-Item "C:\Users\Nomikos\Documents\GitHub\3dprintcraft\favicon.svg" .
Copy-Item "C:\Users\Nomikos\Documents\GitHub\3dprintcraft\assets\img\work\08-nfc-stand-elia.jpg" assets\img\og.jpg
```

Verify: `Get-ChildItem assets\img\work` lists 8 jpg files.

- [ ] **Step 3: Look at the copied favicon** — Read `favicon.svg`; if it carries old branding colors that clash with `#2e54ff`, note it for Task 8 (don't fix now).

- [ ] **Step 4: Create `CLAUDE.md`** with the vault pointer and filled Project Profile:

```markdown
# 3DPrintCraft — site repo

Greek marketing site for 3DPrintCraft. Spec: `docs/superpowers/specs/2026-07-08-3dprintcraft-website-design.md`.

## Vellum Forge
Design tokens, past-work patterns, and DesignOps rules live at
`C:\Users\Nomikos\Documents\GitHub\vellum-forge` (read CLAUDE.md there first).
Use /extract-patterns, /scaffold-site, /harden, /design-research.
Source projects are READ-ONLY; log design decisions to the vault's SESSION-LOG.md.

## Project Profile (per vault WEB-STANDARDS.md)
- **Brand / client:** 3DPrintCraft
- **Entity type:** LocalBusiness
- **Production domain:** https://3dprintcraft.gr
- **`sameAs` profiles:** https://instagram.com/3dprintcraft
- **`knowsAbout` niches:** 3D printing, NFC gadgets, custom keychains, coasters, phone stands, website creation
- **Primary keywords / entities:** 3D εκτύπωση Πάτρα, custom μπρελόκ NFC, NFC stand, σουβέρ 3D, κατασκευή ιστοσελίδων Πάτρα, 3D printing Greece
- **Stack:** static HTML5 + custom CSS + vanilla JS on Cloudflare Pages (Tailwind waived — proven custom system reused, see spec amendment)

## Rules
- All copy Greek; code/comments English. WCAG AA. No inline `<script>` (strict CSP in `_headers`).
- All motion gated behind `prefers-reduced-motion`; `?motion=force` overrides for testing (preview env has reduced-motion ON).
- E-shop later: dock keeps the disabled Shop pill; new shop pages must not require touching v1 pages.
```

- [ ] **Step 5: Create `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "printcraft", "runtimeExecutable": "npx", "runtimeArgs": ["http-server", "-p", "4173", "-c-1", "."], "port": 4173 }
  ]
}
```

- [ ] **Step 6: Commit**

```powershell
git add -A; git commit -m "chore: bootstrap repo, copy portfolio assets, project profile"
```

---

### Task 2: Design system CSS + self-hosted font

**Files:**
- Create: `assets/css/site.css` (base = copy of proven system), `assets/fonts/commissioner-latin.woff2`, `assets/fonts/commissioner-greek.woff2`

- [ ] **Step 1: Copy the proven CSS as the base**

```powershell
Copy-Item "C:\Users\Nomikos\Documents\GitHub\printcraft3d\assets\css\style.css" assets\css\site.css
```

- [ ] **Step 2: Download Commissioner variable woff2 (Greek + Latin subsets)**

```powershell
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
$css = (Invoke-WebRequest "https://fonts.googleapis.com/css2?family=Commissioner:wght@100..900&display=swap" -UserAgent $ua).Content
# The CSS contains one @font-face per subset, each preceded by a /* subset */ comment.
$blocks = [regex]::Matches($css, '/\* (\w+) \*/\s*@font-face \{[^}]*url\((\S+?)\)')
foreach ($b in $blocks) {
  $subset = $b.Groups[1].Value; $url = $b.Groups[2].Value
  if ($subset -in @("latin", "greek")) { Invoke-WebRequest $url -OutFile "assets\fonts\commissioner-$subset.woff2" }
}
Get-ChildItem assets\fonts
```

Expected: two woff2 files, each roughly 15–60KB. If the regex finds nothing (Google markup change), open the CSS content manually and copy the two URLs by hand.

- [ ] **Step 3: Replace the token block and add @font-face** — in `site.css`, replace the `:root { … }` block with the version below (adds spec tokens: light base `#f5f6f9`, `#1c39c8` deep-text variant kept as `--blue-deep-text`, success/error from spec) and add `@font-face` at the very top of the file:

```css
@font-face {
  font-family: "Commissioner";
  src: url("../fonts/commissioner-latin.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122;
}
@font-face {
  font-family: "Commissioner";
  src: url("../fonts/commissioner-greek.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0370-03FF, U+1F00-1FFF;
}

:root {
  --bg: #f5f6f9;
  --bg-soft: #ffffff;
  --ink: #0e1220;
  --ink-2: #3d4356;
  --ink-3: #6d7389;          /* darkened from #8a90a3 for AA on --bg */
  --blue: #2e54ff;
  --blue-deep: #16246e;
  --blue-deep-text: #1c39c8; /* small text on light backgrounds */
  --blue-night: #0a1030;
  --blue-soft: #dfe6ff;
  --ice: #9db8ff;
  --success: #0f8a4f;
  --error: #d02b1f;
  --line: rgba(14, 18, 32, 0.1);
  --glass: rgba(255, 255, 255, 0.12);
  --glass-line: rgba(255, 255, 255, 0.22);
  --shadow-soft: 0 24px 70px rgba(16, 26, 80, 0.14);
  --shadow-float: 0 10px 40px rgba(16, 26, 80, 0.22);
  --r-lg: 28px;
  --r-md: 20px;
  --r-pill: 999px;
  --font: "Commissioner", "Segoe UI", sans-serif;
  --step--1: clamp(0.8rem, 0.75rem + 0.2vw, 0.9rem);
  --step-0: clamp(1rem, 0.95rem + 0.3vw, 1.15rem);
  --step-1: clamp(1.25rem, 1.1rem + 0.7vw, 1.6rem);
  --step-2: clamp(1.7rem, 1.4rem + 1.4vw, 2.5rem);
  --step-3: clamp(2.3rem, 1.8rem + 2.8vw, 4rem);
  --step-4: clamp(3rem, 2rem + 5.5vw, 6.5rem);
  --step-5: clamp(3.6rem, 2.2rem + 8.5vw, 9.5rem);
  --gutter: clamp(1.1rem, 4vw, 4rem);
}
```

- [ ] **Step 4: Purge shop-only CSS** — delete from `site.css` every rule for components this site doesn't have: `.drawer*`, `.dock-cart*`, `.cart-count`, `.product-card` PRICE-specific parts (`.price-row`, `.price`, `.lead-time`, `.tag` keep — reused by portfolio cards; delete only cart/checkout/quote/form sections: search for `checkout`, `quote-`, `qty-`, `field`, `pay-`, `ship-` prefixed rules). Keep everything else (dock, topbar, hero, float-obj, bigwords, glass, mega-band, footer, giant-mark, fade-rise/scale-in, sw/swi split spans, reduced-motion blocks).

- [ ] **Step 5: Append new global additions** at the end of `site.css`:

```css
/* ---------- v3 additions: view transitions, grain, dock extras ---------- */
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }
}

body::before { /* grain overlay */
  content: "";
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
}

.dock { position: relative; overflow: hidden; }
.dock-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: var(--blue);
  transform: scaleX(var(--scroll-p, 0));
  transform-origin: left;
}
.dock a[aria-current="page"] { background: var(--blue); color: #fff; }
.dock-soon {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.55em 1em;
  border-radius: var(--r-pill);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ink-3);
  border: 1px dashed var(--line);
  cursor: default;
}
.dock-soon em { font-style: normal; font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.06em; color: var(--blue-deep-text); }
@media (max-width: 480px) { .dock-soon { display: none; } }
```

Note: the copied file's existing `.dock` rule stays; the `position:relative; overflow:hidden` line here augments it (later rule wins on conflicts).

- [ ] **Step 6: Sanity-render check** — create a throwaway `_smoke.html` with Shell HEAD (TITLE=smoke, DESC=smoke, PATH=_smoke.html, JSONLD=`{}`), one `<main id="main"><h1 class="display">Δοκιμή Ελληνικών 3DPrintCraft</h1><a class="btn btn-primary" href="#">Κουμπί</a></main>`, Shell DOCK, Shell FOOTER. Start preview (`preview_start` name=printcraft), screenshot. Expected: Commissioner renders the Greek headline (not Segoe fallback — check with `preview_inspect` on `h1` for `font-family` resolved and no console 404 on woff2), blue button, dock pills visible. Then delete `_smoke.html`.

- [ ] **Step 7: Commit**

```powershell
git add -A; git commit -m "feat: Cinematic Blue design system with self-hosted Commissioner font"
```

---

### Task 3: Motion engine

**Files:**
- Create: `assets/js/motion.js`

- [ ] **Step 1: Copy the proven engine**

```powershell
Copy-Item "C:\Users\Nomikos\Documents\GitHub\printcraft3d\assets\js\main.js" assets\js\motion.js
```

- [ ] **Step 2: Adapt + extend.** Inside the `DOMContentLoaded` handler:

(a) In the card-tilt block, change both `closest?.(".product-card")` occurrences to `closest?.(".product-card, .work-card")` so portfolio cards get the hover tilt the spec asks for (the `.product-card` half stays for the future shop). Keep everything else — including the odometer block (index uses `data-count`) — as-is.

(b) APPEND the self-printing hero scrub before the closing `});`:

```js
  /* ---------- self-printing hero (scroll-scrubbed layer build) ---------- */
  const stage = document.querySelector(".print-stage");
  const printPin = document.querySelector(".hero-sticky");
  const TOTAL_LAYERS = 300;
  const hudEl = stage?.querySelector(".hud-layer");
  const setBuild = (p) => {
    stage.style.setProperty("--build", p.toFixed(4));
    if (hudEl) hudEl.textContent =
      `LAYER ${String(Math.round(p * TOTAL_LAYERS)).padStart(3, "0")}/${TOTAL_LAYERS}`;
  };
  if (stage && printPin && !reduceMotion) {
    const onPrint = () => {
      const r = printPin.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      setBuild(p);
    };
    addEventListener("scroll", onPrint, { passive: true });
    addEventListener("resize", onPrint, { passive: true });
    onPrint();
  } else if (stage) {
    setBuild(1); /* reduced motion: show the finished print */
  }

  /* ---------- dock scroll progress ---------- */
  const dock = document.querySelector(".dock");
  if (dock) {
    const onProg = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      dock.style.setProperty("--scroll-p", max > 0 ? (scrollY / max).toFixed(4) : 0);
    };
    addEventListener("scroll", onProg, { passive: true });
    onProg();
  }
```

(c) UPDATE the header comment to `/* 3DPrintCraft — motion engine v3 … */`.

- [ ] **Step 3: Verify no syntax errors** — `node --check assets/js/motion.js`. Expected: exits 0, no output.

- [ ] **Step 4: Commit**

```powershell
git add assets/js/motion.js; git commit -m "feat: motion engine v3 with self-printing hero scrub and dock progress"
```

---

### Task 4: index.html — landing with self-printing hero

**Files:**
- Create: `index.html`
- Modify: `assets/css/site.css` (append hero/section styles)

- [ ] **Step 1: Append landing CSS** to `site.css`:

```css
/* ---------- self-printing hero ----------
   Default = safe state (no JS, reduced motion): finished print, no pin.
   motion.js adds .print-scrub-on to <html> ONLY when it will actually scrub,
   and .motion-force when ?motion=force is set (lets CSS reduce-blocks be
   bypassed for testing via html:not(.motion-force) scoping). */
.hero-sticky { height: auto; }
.print-scrub-on .hero-sticky { height: 220vh; }
.hero-sticky .hero { position: relative; min-height: 100vh; }
.print-scrub-on .hero-sticky .hero { position: sticky; top: 0; height: 100vh; }
.print-stage {
  position: absolute;
  right: clamp(0.5rem, 6vw, 7rem);
  bottom: 8vh;
  width: clamp(160px, 26vw, 340px);
  aspect-ratio: 3 / 4;
  margin: 0;
  --build: 1; /* finished print by default; scrub zeroes it via the class below */
  contain: layout paint; /* HUD text + clip-path churn can't invalidate outside the stage */
}
.print-scrub-on .print-stage { --build: 0; } /* motion.js overwrites inline immediately */
.print-obj {
  position: absolute;
  inset: 0;
  clip-path: inset(calc((1 - var(--build)) * 100%) 0 0 0);
}
.print-obj::after { /* printed-layer striping */
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0 7px, rgba(255, 255, 255, 0.07) 7px 8px);
  clip-path: inherit;
}
.print-scanline {
  position: absolute;
  left: -6%;
  right: -6%;
  top: calc((1 - var(--build)) * 100%);
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--ice), #fff, var(--ice), transparent);
  box-shadow: 0 0 18px 4px rgba(157, 184, 255, 0.7);
  opacity: calc(1 - var(--build) * var(--build)); /* fades as build completes */
}
.print-hud {
  position: absolute;
  top: -2.2rem;
  right: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--ice);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 760px) {
  .print-stage { right: 50%; transform: translateX(50%); bottom: 4vh; width: clamp(130px, 34vw, 200px); opacity: 0.85; }
}
/* No reduced-motion unpin block needed: the pin only exists under .print-scrub-on,
   which motion.js never adds when reduced motion is active. */

/* ---------- filament teaser strip ---------- */
.fila-strip { display: flex; gap: 10px; overflow: hidden; padding: 6px 2px; }
.fila-strip span {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--line);
}
.fila-more { align-self: center; font-weight: 700; color: var(--blue-deep-text); white-space: nowrap; }

/* ---------- service cards ---------- */
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.4rem; }
.service-card {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 2rem 1.7rem;
  box-shadow: var(--shadow-soft);
}
.service-card svg { width: 44px; height: 44px; color: var(--blue); margin-bottom: 1.1rem; }
.service-card h3 { margin: 0 0 0.5rem; font-size: var(--step-1); letter-spacing: -0.02em; }
.service-card p { margin: 0 0 1rem; color: var(--ink-2); }
.chip-row { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.chip-row span {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.35em 0.9em;
  border-radius: var(--r-pill);
  background: var(--blue-soft);
  color: var(--blue-deep-text);
}

/* ---------- portfolio highlights (shared with portfolio page) ---------- */
.work-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.2rem; }
.work-card {
  position: relative;
  display: block;
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-soft);
  text-decoration: none;
}
.work-card img { width: 100%; height: 260px; object-fit: cover; }
.work-card .work-cap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--ink);
}
.work-card .tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--blue-deep-text); }
```

- [ ] **Step 2: Write `index.html`.** Assembly order: Shell HEAD, Shell DOCK (ACTIVE=index.html — the dock is `position:fixed` in the copied CSS, so DOM order right after `</header>` is fine), `<main id="main">`, the five sections below, `</main>`, Shell FOOTER.

Shell HEAD parameters:
- TITLE: `3DPrintCraft — 3D εκτύπωση, NFC gadgets & ιστοσελίδες στην Πάτρα`
- DESC: `Ομάδα 3D εκτύπωσης στην Πάτρα. Custom εκτυπώσεις, NFC μπρελόκ, stands και σουβέρ, και κατασκευή ιστοσελίδων για επιχειρήσεις. Ξεκίνησε ως χόμπι — έγινε κορυφαία επιλογή.`
- PATH: (empty — canonical `https://3dprintcraft.gr/`)
- JSONLD:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "3DPrintCraft",
  "url": "https://3dprintcraft.gr",
  "email": "contactprintcraft3d@gmail.com",
  "image": "https://3dprintcraft.gr/assets/img/og.jpg",
  "address": { "@type": "PostalAddress", "addressLocality": "Πάτρα", "addressCountry": "GR" },
  "sameAs": ["https://instagram.com/3dprintcraft"],
  "knowsAbout": ["3D printing", "NFC gadgets", "custom keychains", "coasters", "phone stands", "web design"],
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "3D εκτύπωση κατά παραγγελία" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "NFC gadgets — μπρελόκ, stands, σουβέρ" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Κατασκευή ιστοσελίδων για επιχειρήσεις" } }
  ]
}
```

Section 1 — HERO (self-printing). Reuse the three `.float-obj` SVGs from printcraft3d's index.html lines 34–81 verbatim (copy them from that file). The print-stage object is a new glossy vase SVG:

```html
<section class="hero-sticky">
  <div class="hero">
    <!-- float-obj o1, o2, o3: copy the three SVG blocks verbatim from
         C:\Users\Nomikos\Documents\GitHub\printcraft3d\index.html lines 34-81 -->

    <figure class="print-stage" aria-hidden="true">
      <div class="print-hud"><span class="hud-layer">LAYER 300/300</span></div><!-- no-JS state: finished print; motion.js rewrites when scrubbing -->
      <div class="print-obj">
        <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vaseA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#c6d4ff"/><stop offset=".55" stop-color="#5f7dff"/><stop offset="1" stop-color="#16246e"/>
            </linearGradient>
            <linearGradient id="vaseB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M150 10 C 210 10 230 60 210 110 C 196 145 196 175 214 210 C 240 262 236 330 196 368 C 172 391 128 391 104 368 C 64 330 60 262 86 210 C 104 175 104 145 90 110 C 70 60 90 10 150 10 Z" fill="url(#vaseA)"/>
          <path d="M150 22 C 195 22 210 62 196 104 C 188 128 150 128 150 128 C 150 128 112 128 104 104 C 90 62 105 22 150 22 Z" fill="url(#vaseB)" opacity=".5"/>
          <ellipse cx="150" cy="378" rx="52" ry="10" fill="#0a1030" opacity=".35"/>
        </svg>
      </div>
      <div class="print-scanline"></div>
    </figure>

    <div class="wrap hero-inner">
      <span class="kicker">Ομάδα 3D εκτύπωσης — Πάτρα</span>
      <h1 data-split>Από χόμπι,<br>κορυφαία ομάδα.<br><span class="accent">Στρώση στρώση.</span></h1>
      <p class="lead">Custom 3D εκτυπώσεις, NFC gadgets και ιστοσελίδες για επιχειρήσεις. Σχεδιάζουμε και τυπώνουμε στην Πάτρα, στέλνουμε παντού.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="portfolio.html">Δες τη δουλειά μας</a>
        <a class="btn btn-ghost" href="https://instagram.com/3dprintcraft" rel="noopener" target="_blank">Στείλε μας DM</a>
      </div>
    </div>
    <span class="scroll-cue" aria-hidden="true">↓ Κύλισε — τυπώνουμε</span>
  </div>
</section>
```

Check the copied CSS for `.hero-inner` data-hero animation hooks; keep or drop the `data-hero` attributes consistently with what the copied CSS animates.

Section 2 — SERVICES:

```html
<section class="section wrap" aria-labelledby="services-h">
  <span class="kicker">Τι κάνουμε</span>
  <h2 id="services-h" class="display" data-split style="font-size:var(--step-3)">Τρεις τρόποι να σε βοηθήσουμε</h2>
  <div class="services-grid" style="margin-top:2.4rem">
    <article class="service-card fade-rise">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17h16M6 17v-4h12v4M8 13V7h8v6M10 7V4h4v3"/></svg>
      <h3>3D Εκτύπωση</h3>
      <p>Στείλε μας το αρχείο ή την ιδέα σου — πρωτότυπα, ανταλλακτικά, δώρα, διακοσμητικά. Ό,τι χωράει στο τραπέζι εκτύπωσης, γίνεται.</p>
      <div class="chip-row"><span>PLA</span><span>PETG</span><span>ABS</span><span>TPU</span><span>Custom</span></div>
    </article>
    <article class="service-card fade-rise" data-d="1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8.5a7 7 0 0 1 12 0M8.5 11a4 4 0 0 1 7 0M12 14h.01M4 18h16"/></svg>
      <h3>NFC Gadgets</h3>
      <p>Μπρελόκ, stands και σουβέρ με ενσωματωμένο NFC — ένα άγγιγμα με το κινητό και ανοίγει το προφίλ, το μενού ή η σελίδα σου.</p>
      <div class="chip-row"><span>Μπρελόκ</span><span>Stands</span><span>Σουβέρ</span><span>Custom tags</span></div>
    </article>
    <article class="service-card fade-rise" data-d="2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M7 6h.01M10 6h.01"/></svg>
      <h3>Ιστοσελίδες</h3>
      <p>Σύγχρονες, γρήγορες ιστοσελίδες για επιχειρήσεις — από τη σχεδίαση ως τη δημοσίευση, με μηδενικό μηνιαίο κόστος φιλοξενίας.</p>
      <div class="chip-row"><span>Design</span><span>SEO</span><span>Responsive</span><span>0€/μήνα hosting</span></div>
    </article>
  </div>
</section>
```

Section 3 — PORTFOLIO HIGHLIGHTS (4 best: 08-nfc-stand-elia, 03-mannequin-coasters, 05-pendant-lamp-white, 01-hopscotch-keychain):

```html
<section class="section wrap" aria-labelledby="work-h" style="padding-top:0">
  <div style="display:flex;align-items:end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:2.2rem">
    <div>
      <span class="kicker">Portfolio</span>
      <h2 id="work-h" class="display" style="font-size:var(--step-3)">Πράγματα που τυπώσαμε</h2>
    </div>
    <a class="btn" href="portfolio.html">Όλο το portfolio</a>
  </div>
  <div class="work-grid">
    <a class="work-card fade-rise" href="portfolio.html">
      <img src="assets/img/work/08-nfc-stand-elia.jpg" alt="NFC stand «Elia» — 3D εκτυπωμένη βάση με ενσωματωμένο NFC tag" width="1484" height="1201" loading="lazy"><!-- lazy: sits far below the 220vh hero -->
      <span class="work-cap">NFC stand «Elia» <span class="tag">NFC</span></span>
    </a>
    <a class="work-card fade-rise" data-d="1" href="portfolio.html">
      <img src="assets/img/work/03-mannequin-coasters.jpg" alt="Σουβέρ «Mannequin» — σετ 3D εκτυπωμένα σουβέρ" width="900" height="1188" loading="lazy">
      <span class="work-cap">Σουβέρ «Mannequin» <span class="tag">Σουβέρ</span></span>
    </a>
    <a class="work-card fade-rise" data-d="2" href="portfolio.html">
      <img src="assets/img/work/05-pendant-lamp-white.jpg" alt="Κρεμαστό 3D εκτυπωμένο φωτιστικό με λευκό φως" width="1201" height="1600" loading="lazy">
      <span class="work-cap">Κρεμαστό φωτιστικό <span class="tag">Φωτιστικά</span></span>
    </a>
    <a class="work-card fade-rise" data-d="3" href="portfolio.html">
      <img src="assets/img/work/01-hopscotch-keychain.jpg" alt="Μπρελόκ «Hopscotch» — 3D εκτυπωμένο μπρελόκ" width="896" height="1110" loading="lazy">
      <span class="work-cap">Μπρελόκ «Hopscotch» <span class="tag">Μπρελόκ</span></span>
    </a>
  </div>
</section>
```

Section 4 — FILAMENT TEASER (hex values are real palette entries; full data lands in Task 6):

```html
<section class="section wrap" aria-labelledby="fila-h" style="padding-top:0">
  <div class="mega-band scale-in" style="text-align:left">
    <span class="kicker">Χρώματα</span>
    <h2 id="fila-h" class="display" style="font-size:var(--step-3);color:#fff">Διάλεξε από 40+ χρώματα νήματος</h2>
    <div class="fila-strip" aria-hidden="true">
      <span style="background:#C12E1F"></span><span style="background:#FF6A13"></span><span style="background:#F4EE2A"></span><span style="background:#00AE42"></span><span style="background:#00B1B7"></span><span style="background:#0086D6"></span><span style="background:#0A2989"></span><span style="background:#5E43B7"></span><span style="background:#EC008C"></span><span style="background:#F55A74"></span><span style="background:#E4BD68"></span><span style="background:#A6A9AA"></span><span style="background:#6F5034"></span><span style="background:#000000"></span>
      <span class="fila-more">+ πολλά ακόμα</span>
    </div>
    <a class="btn btn-light" href="filaments.html" style="margin-top:1.6rem">Δες όλη την παλέτα</a>
  </div>
</section>
```

Check the copied `.mega-band` CSS: it's a dark rounded band — if its text alignment/padding fights this content, add a `.fila-band` modifier class in Step 1 CSS instead of inline overrides.

Section 5 — CTA:

```html
<section class="section wrap" style="text-align:center;padding-top:0">
  <span class="kicker">Ας το φτιάξουμε</span>
  <h2 class="display" data-split style="font-size:var(--step-4)">Έχεις μια ιδέα;<br><span class="accent">Την τυπώνουμε.</span></h2>
  <p class="lead" style="max-width:46ch;margin:1.2rem auto 2.2rem">Στείλε μας DM στο Instagram ή email με αυτό που έχεις στο μυαλό σου — απαντάμε με προσφορά μέσα σε μία εργάσιμη.</p>
  <div class="hero-actions" style="justify-content:center">
    <a class="btn btn-primary" href="https://instagram.com/3dprintcraft" rel="noopener" target="_blank">@3dprintcraft</a>
    <a class="btn" href="mailto:contactprintcraft3d@gmail.com?subject=Ενδιαφέρομαι%20για%203D%20εκτύπωση">Στείλε email</a>
  </div>
</section>
```

- [ ] **Step 3: Verify in preview.** Reload, then:
  1. Screenshot at desktop — hero shows headline + vase stage + HUD.
  2. `preview_eval`: `(() => { scrollTo(0, document.querySelector('.hero-sticky').offsetHeight * 0.5); return null; })()` then read `document.querySelector('.hud-layer').textContent` — expected roughly `LAYER 15x/300` (mid-build) **with `?motion=force`** since preview has reduced-motion on. Without force: expected `LAYER 300/300` (static finished state).
  3. `preview_eval` `document.documentElement.scrollWidth === document.documentElement.clientWidth` at 375px width (`preview_resize` mobile) — expected `true`.
  4. Console: zero errors. Network: zero failures.

- [ ] **Step 4: Commit**

```powershell
git add -A; git commit -m "feat: landing page with self-printing scroll hero"
```

---

### Task 5: portfolio.html — filterable grid + lightbox

**Files:**
- Create: `portfolio.html`, `assets/js/portfolio.js`
- Modify: `assets/css/site.css` (append)

- [ ] **Step 1: Append portfolio CSS** to `site.css`:

```css
/* ---------- portfolio page ---------- */
.filter-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.8rem 0 2.2rem; }
.filter-btn {
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.5em 1.2em;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--bg-soft);
  color: var(--ink-2);
  cursor: pointer;
}
.filter-btn[aria-pressed="true"] { background: var(--blue); border-color: var(--blue); color: #fff; }
.work-card.is-hidden { display: none; }
.work-empty { padding: 3rem 0; text-align: center; color: var(--ink-3); font-weight: 600; }
.lightbox { border: 0; border-radius: var(--r-lg); padding: 0; max-width: min(92vw, 900px); background: var(--blue-night); }
.lightbox::backdrop { background: rgba(10, 16, 48, 0.75); backdrop-filter: blur(6px); }
.lightbox img { width: 100%; max-height: 74vh; object-fit: contain; display: block; }
.lightbox-bar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.9rem 1.2rem; color: #fff; font-weight: 600; }
.lightbox-close { font: inherit; background: rgba(255,255,255,0.14); color: #fff; border: 0; border-radius: var(--r-pill); padding: 0.45em 1.1em; cursor: pointer; }
```

- [ ] **Step 2: Write `portfolio.html`.** Shell HEAD (TITLE=`Portfolio — 3DPrintCraft`, DESC=`Δουλειές μας: NFC stands, μπρελόκ, σουβέρ και φωτιστικά — όλα σχεδιασμένα και 3D εκτυπωμένα στην Πάτρα.`, PATH=`portfolio.html`, JSONLD = same LocalBusiness block as Task 4), Shell DOCK (ACTIVE=portfolio.html), then:

```html
  <main id="main">
    <section class="section wrap" aria-labelledby="pf-h">
      <span class="kicker">Portfolio</span>
      <h1 id="pf-h" class="display" data-split style="font-size:var(--step-4)">Ό,τι τυπώνουμε,<br><span class="accent">το καμαρώνουμε.</span></h1>
      <div class="filter-row" role="group" aria-label="Φίλτρα κατηγορίας">
        <button class="filter-btn" aria-pressed="true" data-filter="all">Όλα</button>
        <button class="filter-btn" aria-pressed="false" data-filter="nfc">NFC</button>
        <button class="filter-btn" aria-pressed="false" data-filter="keychain">Μπρελόκ</button>
        <button class="filter-btn" aria-pressed="false" data-filter="coaster">Σουβέρ</button>
        <button class="filter-btn" aria-pressed="false" data-filter="lamp">Φωτιστικά</button>
      </div>
      <div class="work-grid" id="work-grid">
        <!-- 8 cards, all same shape; data-cat drives filtering, buttons open the lightbox -->
        <button class="work-card" data-cat="nfc" data-full="assets/img/work/08-nfc-stand-elia.jpg" type="button">
          <img src="assets/img/work/08-nfc-stand-elia.jpg" alt="NFC stand «Elia» — 3D εκτυπωμένη βάση με NFC tag" width="1484" height="1201">
          <span class="work-cap">NFC stand «Elia» <span class="tag">NFC</span></span>
        </button>
        <button class="work-card" data-cat="nfc" data-full="assets/img/work/07-nfc-stand-milu.jpg" type="button">
          <img src="assets/img/work/07-nfc-stand-milu.jpg" alt="NFC stand «Milu» — 3D εκτυπωμένη βάση με NFC tag" width="1600" height="1394" loading="lazy">
          <span class="work-cap">NFC stand «Milu» <span class="tag">NFC</span></span>
        </button>
        <button class="work-card" data-cat="keychain" data-full="assets/img/work/01-hopscotch-keychain.jpg" type="button">
          <img src="assets/img/work/01-hopscotch-keychain.jpg" alt="Μπρελόκ «Hopscotch» — 3D εκτυπωμένο" width="896" height="1110" loading="lazy">
          <span class="work-cap">Μπρελόκ «Hopscotch» <span class="tag">Μπρελόκ</span></span>
        </button>
        <button class="work-card" data-cat="keychain" data-full="assets/img/work/02-dr8-keychains.jpg" type="button">
          <img src="assets/img/work/02-dr8-keychains.jpg" alt="Σετ μπρελόκ DR8 — 3D εκτυπωμένα" width="1024" height="881" loading="lazy">
          <span class="work-cap">Μπρελόκ DR8 (σετ) <span class="tag">Μπρελόκ</span></span>
        </button>
        <button class="work-card" data-cat="keychain" data-full="assets/img/work/06-scalino-keychain.jpg" type="button">
          <img src="assets/img/work/06-scalino-keychain.jpg" alt="Μπρελόκ «Scalino» — 3D εκτυπωμένο" width="1079" height="739" loading="lazy">
          <span class="work-cap">Μπρελόκ «Scalino» <span class="tag">Μπρελόκ</span></span>
        </button>
        <button class="work-card" data-cat="coaster" data-full="assets/img/work/03-mannequin-coasters.jpg" type="button">
          <img src="assets/img/work/03-mannequin-coasters.jpg" alt="Σετ σουβέρ «Mannequin» — 3D εκτυπωμένα" width="900" height="1188" loading="lazy">
          <span class="work-cap">Σουβέρ «Mannequin» <span class="tag">Σουβέρ</span></span>
        </button>
        <button class="work-card" data-cat="lamp" data-full="assets/img/work/04-pendant-lamp-warm.jpg" type="button">
          <img src="assets/img/work/04-pendant-lamp-warm.jpg" alt="Κρεμαστό 3D εκτυπωμένο φωτιστικό με θερμό φως" width="872" height="760" loading="lazy">
          <span class="work-cap">Φωτιστικό (θερμό) <span class="tag">Φωτιστικά</span></span>
        </button>
        <button class="work-card" data-cat="lamp" data-full="assets/img/work/05-pendant-lamp-white.jpg" type="button">
          <img src="assets/img/work/05-pendant-lamp-white.jpg" alt="Κρεμαστό 3D εκτυπωμένο φωτιστικό με λευκό φως" width="1201" height="1600" loading="lazy">
          <span class="work-cap">Φωτιστικό (λευκό) <span class="tag">Φωτιστικά</span></span>
        </button>
      </div>
      <p class="work-empty" id="work-empty" hidden>Δεν υπάρχουν ακόμα δουλειές σε αυτή την κατηγορία — στείλε μας την ιδέα σου!</p>
      <p class="lead" style="margin-top:3rem">Θες κάτι δικό σου; <a href="contact.html" style="color:var(--blue-deep-text);font-weight:700">Πες μας τι έχεις στο μυαλό σου →</a></p>
    </section>
  </main>

  <dialog class="lightbox" id="lightbox" aria-label="Προβολή φωτογραφίας">
    <img id="lightbox-img" src="" alt="">
    <div class="lightbox-bar">
      <span id="lightbox-cap"></span>
      <button class="lightbox-close" id="lightbox-close" type="button">Κλείσιμο ✕</button>
    </div>
  </dialog>
```

Then `<script src="assets/js/portfolio.js" defer></script>` before the motion.js script line, then Shell FOOTER.

Note the cards are `<button>` (they perform an action — open lightbox), styled by the same `.work-card` class; add `.work-card { text-align: inherit; font: inherit; padding: 0; }` reset to the Step 1 CSS since buttons carry UA styles.

- [ ] **Step 3: Write `assets/js/portfolio.js`**

```js
/* Portfolio — category filters + <dialog> lightbox. Progressive enhancement:
   without JS all 8 cards are visible; filters and lightbox simply do nothing. */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("work-grid");
  const empty = document.getElementById("work-empty");
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const f = btn.dataset.filter;
      let shown = 0;
      grid.querySelectorAll(".work-card").forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("is-hidden", !show);
        if (show) shown++;
      });
      empty.hidden = shown > 0;
    });
  });

  const box = document.getElementById("lightbox");
  const boxImg = document.getElementById("lightbox-img");
  const boxCap = document.getElementById("lightbox-cap");
  if (!box || typeof box.showModal !== "function") return;

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".work-card");
    if (!card) return;
    const thumb = card.querySelector("img");
    boxImg.src = card.dataset.full;
    boxImg.alt = thumb.alt;
    boxCap.textContent = card.querySelector(".work-cap").firstChild.textContent.trim();
    box.showModal();
  });
  document.getElementById("lightbox-close").addEventListener("click", () => box.close());
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
});
```

- [ ] **Step 4: Verify in preview.** Navigate to `portfolio.html`:
  1. Screenshot — 8 cards render with photos.
  2. Click filter «Μπρελόκ» (`preview_click` on `[data-filter="keychain"]`) → `preview_eval` count of `.work-card:not(.is-hidden)` — expected `3`.
  3. Click a card → `preview_eval` `document.getElementById('lightbox').open` — expected `true`; click close → `false`.
  4. Console zero errors; 375px width no horizontal scroll.

- [ ] **Step 5: Commit**

```powershell
git add -A; git commit -m "feat: portfolio page with category filters and lightbox"
```

---

### Task 6: filaments.html — palette

**Files:**
- Create: `filaments.html`, `assets/js/filaments.js`
- Modify: `assets/css/site.css` (append)

- [ ] **Step 1: Append palette CSS** to `site.css`:

```css
/* ---------- filament palette ---------- */
.pal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.9rem; }
.pal-swatch {
  position: relative;
  height: 110px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  cursor: pointer;
  font: inherit;
  padding: 0.7rem 0.8rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pal-swatch:hover { transform: translateY(-4px); box-shadow: var(--shadow-float); }
.pal-swatch .pname { font-weight: 700; font-size: 0.85rem; line-height: 1.2; }
.pal-swatch .phex { font-size: 0.72rem; opacity: 0.75; font-variant-numeric: tabular-nums; }
.pal-swatch.is-clear {
  background:
    linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%),
    linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.08) 75%) 10px 10px / 20px 20px,
    #fff;
  background-size: 20px 20px;
}
.pal-swatch .copied {
  position: absolute;
  top: 0.6rem;
  right: 0.7rem;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--success);
  color: #fff;
  border-radius: var(--r-pill);
  padding: 0.2em 0.7em;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.pal-swatch.just-copied .copied { opacity: 1; }
.pal-cat { margin: 2.6rem 0 1rem; display: flex; align-items: baseline; gap: 0.8rem; }
.pal-cat h2 { margin: 0; font-size: var(--step-2); letter-spacing: -0.02em; }
.pal-cat .count { color: var(--ink-3); font-weight: 600; font-size: 0.9rem; }
.pal-note { margin-top: 3rem; }
```

- [ ] **Step 2: Write `filaments.html`.** Shell HEAD (TITLE=`Χρώματα νημάτων — 3DPrintCraft`, DESC=`Όλη η παλέτα νημάτων μας: PLA, PLA Matte, ABS, PETG, TPU και τεχνικά υλικά. Διάλεξε χρώμα για την επόμενη εκτύπωσή σου.`, PATH=`filaments.html`, JSONLD = LocalBusiness block), Shell DOCK (ACTIVE=filaments.html), then:

```html
  <main id="main">
    <section class="section wrap" aria-labelledby="pal-h">
      <span class="kicker">Η παλέτα μας</span>
      <h1 id="pal-h" class="display display-lg" data-split>Διάλεξε το <span class="accent">χρώμα</span> σου</h1><!-- .display-lg: step-4 with ≤720px clamp (Task 5 review) -->
      <p class="lead" style="max-width:52ch;margin-top:1rem">Αυτά είναι τα νήματα που έχουμε αυτή τη στιγμή στο εργαστήριο. Πάτα σε ένα χρώμα για να αντιγράψεις τον κωδικό του και στείλε μας τον μαζί με την ιδέα σου.</p>
      <div class="filter-row" role="group" aria-label="Φίλτρα υλικού" id="pal-filters"></div>
      <div id="paletteRoot">
        <noscript>
          <p class="lead">Η παλέτα χρειάζεται JavaScript για να εμφανιστεί. Στείλε μας
          <a href="https://instagram.com/3dprintcraft">DM στο Instagram</a> ή
          <a href="mailto:contactprintcraft3d@gmail.com">email</a> και σου στέλνουμε φωτογραφίες όλων των χρωμάτων.</p>
        </noscript>
      </div>
      <p class="lead pal-note">Δεν βρίσκεις το χρώμα που θες; <a href="contact.html" style="color:var(--blue-deep-text);font-weight:700">Ρώτησέ μας</a> — έρχονται συνέχεια νέα.</p>
    </section>
  </main>
```

Then `<script src="assets/js/filaments.js" defer></script>` before motion.js, then Shell FOOTER.

- [ ] **Step 3: Write `assets/js/filaments.js`.** The PALETTE data below is ported VERBATIM from the old repo (`3dprintcraft/assets/js/colors.js` lines 13–69) — real inventory, do not invent colors:

```js
/* Filament palette — real inventory ported from 3dprintcraft/assets/js/colors.js.
   Each color: [name, hex]; hex 'NA' = translucent/clear (checkerboard, no copy). */
document.addEventListener("DOMContentLoaded", () => {
  const PALETTE = [
    { cat: "PLA Basics", colors: [
      ["Jade White", "#FFFFFF"], ["Gold", "#E4BD68"], ["Silver", "#A6A9AA"], ["Gray", "#8E9089"],
      ["Bronze", "#847D48"], ["Cocoa Brown", "#6F5034"], ["Red", "#C12E1F"], ["Magenta", "#EC008C"],
      ["Pink", "#F55A74"], ["Orange", "#FF6A13"], ["Yellow", "#F4EE2A"], ["Bambu Green", "#00AE42"],
      ["Mistletoe Green", "#3F8E43"], ["Turquoise", "#00B1B7"], ["Cyan", "#0086D6"], ["Blue", "#0A2989"],
      ["Purple", "#5E43B7"], ["Black", "#000000"],
    ]},
    { cat: "PLA Matte", colors: [
      ["Latte Brown", "#D3B7A7"], ["Desert Tan", "#E8DBB7"], ["Lilac Purple", "#AE96D4"],
      ["Sakura Pink", "#E8AFCF"], ["Mandarin Orange", "#F99963"], ["Dark Red", "#BB3D43"],
      ["Dark Brown", "#7D6556"], ["Dark Green", "#68724D"],
    ]},
    { cat: "ABS", colors: [
      ["Tangerine Yellow", "#FFC72C"], ["Azure", "#489FDF"], ["White", "#FFFFFF"], ["Silver", "#87909A"],
      ["Red", "#D32941"], ["Orange", "#FF6A13"], ["Blue", "#0A2CA5"], ["Black", "#000000"],
    ]},
    { cat: "PETG Translucent", colors: [
      ["Translucent Brown", "#C9A381"], ["Translucent Pink", "#F9C1BD"], ["Translucent Clear", "NA"],
    ]},
    { cat: "TPU", colors: [["Black", "#000000"]] },
    { cat: "ASA", colors: [["Black", "#000000"]] },
    { cat: "PA6-CF", colors: [["Black", "#000000"]] },
    { cat: "ABS-GF", colors: [["Black", "#000000"]] },
  ];

  const root = document.getElementById("paletteRoot");
  const filterRow = document.getElementById("pal-filters");
  if (!root || !filterRow) return;

  const isHex = (h) => /^#[0-9A-Fa-f]{6}$/.test(h || "");
  const luminance = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  /* render all categories */
  root.innerHTML = PALETTE.map((group) => `
    <section class="pal-section" data-cat="${group.cat}">
      <div class="pal-cat">
        <h2>${group.cat}</h2>
        <span class="count">${group.colors.length} χρώματα</span>
      </div>
      <div class="pal-grid">
        ${group.colors.map(([name, hex]) => {
          if (!isHex(hex)) {
            return `<div class="pal-swatch is-clear" role="img" aria-label="${name} — διάφανο">
              <span class="pname" style="color:#0e1220">${name}</span>
              <span class="phex" style="color:#0e1220">διάφανο</span>
            </div>`;
          }
          const dark = luminance(hex) > 0.45;
          const fg = dark ? "#0e1220" : "#ffffff";
          return `<button class="pal-swatch" type="button" style="background:${hex}"
            data-hex="${hex}" aria-label="${name} ${hex} — αντιγραφή κωδικού">
            <span class="copied">Αντιγράφηκε!</span>
            <span class="pname" style="color:${fg}">${name}</span>
            <span class="phex" style="color:${fg}">${hex}</span>
          </button>`;
        }).join("")}
      </div>
    </section>`).join("");

  /* material filters */
  const cats = ["Όλα", ...PALETTE.map((g) => g.cat)];
  filterRow.innerHTML = cats.map((c, i) =>
    `<button class="filter-btn" type="button" aria-pressed="${i === 0}" data-cat="${c}">${c}</button>`
  ).join("");
  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterRow.querySelectorAll(".filter-btn").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    root.querySelectorAll(".pal-section").forEach((sec) => {
      sec.hidden = btn.dataset.cat !== "Όλα" && sec.dataset.cat !== btn.dataset.cat;
    });
  });

  /* click-to-copy with feedback (clipboard API needs secure context; http-server
     preview on localhost counts as secure) */
  root.addEventListener("click", async (e) => {
    const sw = e.target.closest(".pal-swatch[data-hex]");
    if (!sw) return;
    try {
      await navigator.clipboard.writeText(sw.dataset.hex);
      sw.classList.add("just-copied");
      setTimeout(() => sw.classList.remove("just-copied"), 1200);
    } catch {
      /* clipboard blocked (permissions/insecure context) — show the hex in a prompt-free way */
      const cap = sw.querySelector(".phex");
      const old = cap.textContent;
      cap.textContent = "επίλεξε: " + sw.dataset.hex;
      setTimeout(() => (cap.textContent = old), 2000);
    }
  });
});
```

- [ ] **Step 4: Verify in preview.** Navigate to `filaments.html`:
  1. Screenshot — categories render; swatch text readable on both light (Jade White → dark text) and dark (Black → white text) swatches.
  2. Count check: `preview_eval` `document.querySelectorAll('.pal-swatch').length` — expected `41` (18+8+8+3+1+1+1+1).
  3. Filter: click `[data-cat="ABS"]` → only the ABS section visible (`preview_eval` count of `.pal-section:not([hidden])` === 1).
  4. Copy: click a swatch → class `just-copied` appears (`preview_eval`), console zero errors.

- [ ] **Step 5: Commit**

```powershell
git add -A; git commit -m "feat: filament palette page with real inventory data"
```

---

### Task 7: contact.html

**Files:**
- Create: `contact.html`
- Modify: `assets/css/site.css` (append)

- [ ] **Step 1: Append contact CSS** to `site.css`:

```css
/* ---------- contact page ---------- */
.contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.4rem; margin-top: 2.4rem; }
.contact-card {
  display: block;
  text-decoration: none;
  background: var(--blue-night);
  color: #fff;
  border-radius: var(--r-lg);
  padding: 2.4rem 2rem;
  box-shadow: var(--shadow-soft);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
}
.contact-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-float); }
.contact-card.ig { background: linear-gradient(135deg, #2e54ff, #7b2eff 60%, #b52eff); }
.contact-card h2 { margin: 0 0 0.4rem; font-size: var(--step-2); letter-spacing: -0.02em; }
.contact-card p { margin: 0; color: rgba(255, 255, 255, 0.78); }
.contact-card .go { display: inline-block; margin-top: 1.4rem; font-weight: 800; }
.steps { counter-reset: step; display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1.2rem; margin-top: 2.4rem; }
.step {
  counter-increment: step;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1.6rem 1.4rem;
}
.step::before {
  content: counter(step, decimal-leading-zero);
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--blue);
  margin-bottom: 0.5rem;
}
.step h3 { margin: 0 0 0.35rem; font-size: 1.05rem; }
.step p { margin: 0; color: var(--ink-2); font-size: 0.95rem; }
```

- [ ] **Step 2: Write `contact.html`.** Shell HEAD (TITLE=`Επικοινωνία — 3DPrintCraft`, DESC=`Στείλε μας DM στο @3dprintcraft ή email — απαντάμε με προσφορά μέσα σε μία εργάσιμη. Δες πώς γίνεται η παραγγελία σε 4 βήματα.`, PATH=`contact.html`, JSONLD = LocalBusiness block), Shell DOCK (ACTIVE=contact.html), then:

```html
  <main id="main">
    <section class="section wrap" aria-labelledby="ct-h">
      <span class="kicker">Επικοινωνία</span>
      <h1 id="ct-h" class="display display-lg" data-split>Πες μας τι<br><span class="accent">έχεις στο μυαλό σου.</span></h1><!-- .display-lg: step-4 with ≤720px clamp (Task 5 review) -->
      <div class="contact-grid">
        <a class="contact-card ig" href="https://ig.me/m/3dprintcraft" rel="noopener" target="_blank">
          <h2>Instagram DM</h2>
          <p>Ο πιο γρήγορος τρόπος. Στείλε μήνυμα στο @3dprintcraft με φωτογραφία, αρχείο ή απλώς την ιδέα σου.</p>
          <span class="go">Άνοιξε το Instagram →</span>
        </a>
        <a class="contact-card" href="mailto:contactprintcraft3d@gmail.com?subject=Ενδιαφέρομαι%20για%203D%20εκτύπωση">
          <h2>Email</h2>
          <p>Για αρχεία STL/STEP/3MF ή πιο αναλυτικές περιγραφές: contactprintcraft3d@gmail.com</p>
          <span class="go">Στείλε email →</span>
        </a>
      </div>
      <p style="margin-top:0.9rem;color:var(--ink-3);font-size:0.9rem">Αν το κουμπί του Instagram δεν ανοίξει συνομιλία, βρες μας στο
        <a href="https://instagram.com/3dprintcraft" rel="noopener" target="_blank" style="color:var(--blue-deep-text);font-weight:700">instagram.com/3dprintcraft</a>.</p>
    </section>

    <section class="section wrap" aria-labelledby="how-h" style="padding-top:0">
      <span class="kicker">Πώς παραγγέλνεις</span>
      <h2 id="how-h" class="display" style="font-size:var(--step-3)">Τέσσερα απλά βήματα</h2>
      <div class="steps">
        <div class="step fade-rise">
          <h3>Στείλε την ιδέα σου</h3>
          <p>DM ή email με φωτογραφία, σκίτσο ή αρχείο 3D — ό,τι έχεις.</p>
        </div>
        <div class="step fade-rise" data-d="1">
          <h3>Παίρνεις προσφορά</h3>
          <p>Απαντάμε μέσα σε μία εργάσιμη με τιμή και χρόνο παράδοσης.</p>
        </div>
        <div class="step fade-rise" data-d="2">
          <h3>Τυπώνουμε</h3>
          <p>Διαλέγεις χρώμα από την <a href="filaments.html">παλέτα</a> και ξεκινάμε. Σου στέλνουμε φωτογραφία πριν φύγει.</p>
        </div>
        <div class="step fade-rise" data-d="3">
          <h3>Παραλαμβάνεις</h3>
          <p>Παραλαβή από Πάτρα ή αποστολή σε όλη την Ελλάδα.</p>
        </div>
      </div>
    </section>
  </main>
```

Then Shell FOOTER (no extra JS on this page).

- [ ] **Step 3: Verify in preview.** Navigate to `contact.html`: screenshot desktop + mobile; both CTA cards render, gradient IG card visible; steps numbered 01–04; console zero errors; 375px no horizontal scroll; `preview_snapshot` confirms links point to `ig.me/m/3dprintcraft`, `instagram.com/3dprintcraft`, and the mailto.

- [ ] **Step 4: Commit**

```powershell
git add -A; git commit -m "feat: contact page with direct-channel CTAs and ordering steps"
```

---

### Task 8: SEO/GEO + deploy files

**Files:**
- Create: `robots.txt`, `sitemap.xml`, `llms.txt`, `_headers`, `_redirects`

- [ ] **Step 1: `robots.txt`** (docs/ is internal — Cloudflare Pages serves everything committed, so block it here AND in `_redirects`)

```
User-agent: *
Allow: /
Disallow: /docs/

Sitemap: https://3dprintcraft.gr/sitemap.xml
```

- [ ] **Step 1b: `_redirects`** — hide internal files from the deployed site (Cloudflare Pages `_headers` cannot block paths; redirects can):

```
/docs/* / 302
/CLAUDE.md / 302
```

- [ ] **Step 2: `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://3dprintcraft.gr/</loc></url>
  <url><loc>https://3dprintcraft.gr/portfolio.html</loc></url>
  <url><loc>https://3dprintcraft.gr/filaments.html</loc></url>
  <url><loc>https://3dprintcraft.gr/contact.html</loc></url>
</urlset>
```

- [ ] **Step 3: `llms.txt`**

```markdown
# 3DPrintCraft — Core Context

## Core Purpose
3DPrintCraft is a 3D-printing team in Patras, Greece that started as a hobby and grew into a leading local business. It produces custom 3D prints and NFC gadgets, and builds websites for businesses.

## Core Features / Services
- Custom 3D printing: prototypes, spare parts, gifts, decorative objects from customer files or ideas (PLA, PLA Matte, ABS, PETG, TPU, ASA, PA6-CF, ABS-GF; 40+ filament colors listed at /filaments.html)
- NFC gadgets: 3D-printed keychains, phone stands, and coasters with embedded NFC tags that open a profile, menu, or website on tap
- Website creation: modern static websites for businesses with zero monthly hosting cost

## Target Entities & Context
3D εκτύπωση Πάτρα, custom 3D printing Greece, NFC keychains, NFC stands, NFC coasters, κατασκευή ιστοσελίδων Πάτρα. Contact: Instagram @3dprintcraft or contactprintcraft3d@gmail.com. Pickup in Patras or shipping across Greece.
```

- [ ] **Step 4: `_headers`**

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Note: `style-src 'unsafe-inline'` is required (pages use inline `style=""` attributes); `script-src 'self'` holds because ALL scripts are external files — verify no page has an inline `<script>` block or `onclick=` attribute: `Select-String -Path *.html -Pattern "onclick|<script>[^s]"` should return nothing.

- [ ] **Step 5: Favicon recolor** — CONFIRMED needed by Task 1 Step 3: the copied `favicon.svg` uses cyan-leaning blues (`#0000FF`, `#0068EE`, `#004CCC` etc.) that clash with brand `#2e54ff`. Recolor its fills to the `#2e54ff`/`#16246e`/`#0e1220` family (it's an SVG — edit fill attributes), keeping the shape unchanged.

- [ ] **Step 6: Validate JSON-LD** — `preview_eval` on each page: `JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)["@type"]` — expected `"LocalBusiness"` on all 4 pages, no parse errors.

- [ ] **Step 7: Commit**

```powershell
git add -A; git commit -m "feat: SEO/GEO layer — sitemap, robots, llms.txt, security headers"
```

---

### Task 9: Full verification pass

**Files:** none created — evidence gathering. Fix-forward anything found, amend the relevant commit message conventions (`fix: …`).

- [ ] **Step 1: Console + network sweep** — for each of the 4 pages: `preview_console_logs` (level=error) → expected empty; `preview_network` (filter=failed) → expected empty.

- [ ] **Step 2: Screenshots** — each page at desktop (1280×800) and mobile (375×812). Expected: no clipped text, dock inside viewport, hero headline fits at 375px.

- [ ] **Step 3: Horizontal-scroll guard** — at 375px on each page: `preview_eval` `document.documentElement.scrollWidth <= document.documentElement.clientWidth` → `true`.

- [ ] **Step 4: Self-printing hero behavior** — on index with `?motion=force`: scroll to 25% / 75% of `.hero-sticky`; `--build` custom property (`preview_eval` `getComputedStyle(document.querySelector('.print-stage')).getPropertyValue('--build')`) increases monotonically; HUD text matches. Without force (reduced-motion default in preview): HUD reads `LAYER 300/300`, object fully visible, page NOT pinned (hero-sticky height auto).

- [ ] **Step 5: Keyboard pass** — Tab through index and portfolio: skip-link appears first, focus rings visible on dock links, filter buttons, work cards; lightbox closes with Esc (native dialog behavior).

- [ ] **Step 6: Accessibility spot-checks** — `preview_inspect` computed color/background pairs: `.lead` on `--bg`, `.phex` on white swatch, `.footer-blurb` on footer bg; all must be ≥ 4.5:1 (compute contrast from the returned values). Every `<img>` has non-empty alt (`preview_eval` `[...document.images].filter(i => !i.alt).length` → `0` on each page).

- [ ] **Step 7: Fix anything found, commit fixes**

```powershell
git add -A; git commit -m "fix: verification pass corrections"
```

(Skip the commit if nothing needed fixing.)

- [ ] **Step 8: Update the vault session log** — append a dated Did/Decided/Open entry to `C:\Users\Nomikos\Documents\GitHub\vellum-forge\SESSION-LOG.md` (this is the one write allowed outside this repo) noting: fresh `printcraft` build shipped, printcraft3d/next superseded, Tailwind waiver, and open items (deploy to Cloudflare Pages, Instagram embed ideas, WebP pass, /harden run). Commit the vault repo.

---

## Post-plan follow-ups (not in this plan)

- Connect repo to GitHub + Cloudflare Pages, point 3dprintcraft.gr (owner action + separate session)
- `/harden` pass (Lighthouse ≥ 95 targets)
- Decide archive/retirement of `printcraft3d` and `printcraft3d-next`
- E-shop phase 2 per research brief (Viva/IRIS/COD)
