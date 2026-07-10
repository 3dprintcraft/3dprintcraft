# Motion v4 "Eye-Catching" Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the owner-approved motion-v4 package (spec §9: dock magnification, ClickSpark, shine sweep, spotlight cards, decrypted kickers, marquee ticker, curtain handoff, portfolio sticky-grid unfold) to the shipped printcraft site.

**Architecture:** Everything extends the existing motion engine architecture: root-class gating (`print-scrub-on`/`motion-force`/`reveals-on` + new `unfold-on`), the single rAF reads-then-writes scroll pipeline, CSS-custom-property composition (never raw `style.transform` clobbering), delegated document-level pointer handlers. No new dependencies, no build step. Techniques hand-ported from the react-bits clone (`C:\Users\Nomikos\Documents\GitHub\react-bits`, READ-ONLY) and the 2026-07-09 research brief.

**Tech Stack:** vanilla JS (motion.js/portfolio.js), custom CSS (site.css), canvas 2D for sparks.

**Working directory:** `C:\Users\Nomikos\Documents\GitHub\printcraft` (HEAD after motion-v4 spec amendment). Verification: http://localhost:4173 (`npx http-server -p 4173 -c-1 .` background) + headless Edge puppeteer-core (`C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`) or preview MCP tools if available. Preview env has reduced-motion ON — use `?motion=force`. Temp scripts in scratchpad only.

**Non-negotiable invariants (check in EVERY task):**
- No-JS / reduced-motion default = static, fully visible page. New effects must not exist without their gate.
- Never write `element.style.transform` on elements the stylesheet transforms — compose via custom properties.
- All scroll work goes through rAF batching (reads before writes).
- `node --check` on every touched JS file; zero console errors in both modes; no horizontal scroll at 360px.
- CSP stays `script-src 'self'` — no inline scripts/handlers.

---

### Task M1: Dock magnification

**Files:** Modify: `assets/js/motion.js`, `assets/css/site.css`

- [ ] **Step 1: CSS** — extend the existing `.dock a, .dock button` transform composition to include scale:

```css
.dock a, .dock button, .dock .dock-soon {
  transform: translate(var(--mx, 0px), var(--my, 0px)) scale(var(--mag, 1));
  transform-origin: center bottom;
}
```

(Adjust the existing rule in place — don't duplicate. `.dock-soon` gets magnify but has no magnet vars; harmless.)

- [ ] **Step 2: JS** — append inside DOMContentLoaded, after the magnet block:

```js
  /* ---------- dock magnification (cursor-distance scale, damped lerp) ----------
     macOS-dock pattern: pills scale up to 1.15 within a ±110px falloff of the
     cursor. Centers are cached on enter/resize (reading rects per frame would
     feed back through the scale). */
  if (dock && finePointer && !reduceMotion) {
    const pills = [...dock.querySelectorAll("a, button, .dock-soon")];
    let centers = [];
    let dockRaf = null;
    let cursorX = null;
    const cacheCenters = () => {
      centers = pills.map((el) => {
        const r = el.getBoundingClientRect();
        const mag = parseFloat(el.dataset.mag || 1);
        return r.left + r.width / 2 / (mag || 1) * 0 + r.left + r.width / 2; /* see Step 3 */
      });
    };
    const dockTick = () => {
      dockRaf = null;
      let active = false;
      pills.forEach((el, i) => {
        const target = cursorX === null
          ? 1
          : 1 + 0.15 * Math.max(0, 1 - Math.abs(cursorX - centers[i]) / 110);
        const cur = parseFloat(el.dataset.mag || 1);
        const next = cur + (target - cur) * 0.22;
        el.dataset.mag = next.toFixed(4);
        el.style.setProperty("--mag", next.toFixed(4));
        if (Math.abs(target - next) > 0.002) active = true;
      });
      if (active) dockRaf = requestAnimationFrame(dockTick);
    };
    const wakeDock = () => { if (!dockRaf) dockRaf = requestAnimationFrame(dockTick); };
    dock.addEventListener("pointerenter", () => { cacheCenters(); });
    dock.addEventListener("pointermove", (e) => { cursorX = e.clientX; wakeDock(); }, { passive: true });
    dock.addEventListener("pointerleave", () => { cursorX = null; wakeDock(); });
    addEventListener("resize", () => { centers.length && cacheCenters(); }, { passive: true });
  }
```

- [ ] **Step 3: Fix the placeholder math in cacheCenters** — the line above contains dead arithmetic; the correct body is simply:

```js
      centers = pills.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });
```

Cache is taken on pointerenter when pills are at rest scale (or near it), so no scale compensation is needed. (This step exists so the implementer consciously replaces the placeholder — do not ship the dead expression.)

- [ ] **Step 4: Verify** — `node --check`. Rendered (force mode): dispatch pointermove across the dock; nearest pill's computed transform contains `scale(1.1…)`, neighbors less, distant pills ~1; pointerleave → all return to 1 (poll until settled). Magnet still works (translate present in same computed transform). Default mode: no `--mag` writes (listener not attached). Dock overflow: hover the edge pill — verify no clipping (dock has overflow rules; magnified pill grows ~5px, check against dock rect).

- [ ] **Step 5: Commit** — `git add -A; git commit -m "feat: dock magnification (motion v4)"`

---

### Task M2: Button delight — ClickSpark + shine sweep

**Files:** Modify: `assets/js/motion.js`, `assets/css/site.css`

- [ ] **Step 1: Shine sweep CSS** (CSS-only; global reduce-crusher makes it effectively instant/invisible under reduced motion — acceptable):

```css
/* ---------- shine sweep on primary CTAs ---------- */
.btn-primary { position: relative; overflow: hidden; }
.btn-primary::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -45%;
  width: 35%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(0) skewX(-18deg);
  transition: transform 0.65s ease;
  pointer-events: none;
}
.btn-primary:hover::before { transform: translateX(420%) skewX(-18deg); }
```

- [ ] **Step 2: ClickSpark JS** — append inside DOMContentLoaded (technique from react-bits `ClickSpark.jsx`: radial line sparks, 400ms, ease-out `t*(2-t)`):

```js
  /* ---------- click spark (canvas overlay; react-bits ClickSpark port) ---------- */
  if (!reduceMotion) {
    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.className = "spark-canvas";
    sparkCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(sparkCanvas);
    const sparkCtx = sparkCanvas.getContext("2d");
    const sizeSparkCanvas = () => {
      sparkCanvas.width = innerWidth;
      sparkCanvas.height = innerHeight;
    };
    sizeSparkCanvas();
    addEventListener("resize", sizeSparkCanvas, { passive: true });
    const sparks = [];
    let sparkRaf = null;
    const SPARK_MS = 400;
    const drawSparks = (t) => {
      sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const k = (t - s.t0) / SPARK_MS;
        if (k >= 1) { sparks.splice(i, 1); continue; }
        const e = k * (2 - k);
        const d0 = e * 20;
        const d1 = d0 + (1 - e) * 12;
        sparkCtx.strokeStyle = s.color;
        sparkCtx.lineWidth = 2;
        sparkCtx.globalAlpha = 1 - e;
        sparkCtx.beginPath();
        sparkCtx.moveTo(s.x + Math.cos(s.a) * d0, s.y + Math.sin(s.a) * d0);
        sparkCtx.lineTo(s.x + Math.cos(s.a) * d1, s.y + Math.sin(s.a) * d1);
        sparkCtx.stroke();
      }
      sparkCtx.globalAlpha = 1;
      sparkRaf = sparks.length ? requestAnimationFrame(drawSparks) : null;
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest?.(".btn, .dock a, .filter-btn, .pal-swatch, .contact-card")) return;
      const t0 = performance.now();
      for (let i = 0; i < 8; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 8, t0, color: "#9db8ff" });
      }
      if (!sparkRaf) sparkRaf = requestAnimationFrame(drawSparks);
    });
  }
```

- [ ] **Step 3: Spark canvas CSS:**

```css
.spark-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
```

- [ ] **Step 4: Verify** — `node --check`. Force mode: click a `.btn` → canvas gains strokes for ~0.4s (sample `getImageData` non-zero near click point, or screenshot burst); clicks on plain text spawn nothing; navigation clicks still navigate (canvas is pointer-events none, listener is passive observer — confirm dock link click navigates AND sparks). Default (reduce) mode: no `.spark-canvas` in DOM. Shine: hover `.btn-primary` → ::before transform changes (computed). 360px: canvas doesn't cause overflow (fixed inset 0).

- [ ] **Step 5: Commit** — `git add -A; git commit -m "feat: click sparks and CTA shine sweep (motion v4)"`

---

### Task M3: Spotlight card hover

**Files:** Modify: `assets/js/motion.js`, `assets/css/site.css`

- [ ] **Step 1: CSS:**

```css
/* ---------- spotlight card hover (pointer-following highlight) ---------- */
.work-card, .service-card { position: relative; }
.work-card::after, .service-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(230px circle at var(--sx, 50%) var(--sy, 50%),
    rgba(157, 184, 255, 0.28), transparent 62%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.work-card:hover::after, .service-card:hover::after { opacity: 1; }
```

CAUTION: check existing CSS for other `::after` uses on these classes first (grep `work-card::after|service-card::after`) — none should exist; if any do, reconcile instead of double-defining.

- [ ] **Step 2: JS** — in the existing delegated card-tilt `pointermove` handler, EXTEND (don't add a second listener): change its closest() selector to `".product-card, .work-card, .service-card"`, compute `--sx`/`--sy` for ALL matches, but apply the tilt transform ONLY to `.product-card`/`.work-card` (service cards get spotlight without tilt). Pattern:

```js
      const card = e.target.closest?.(".product-card, .work-card, .service-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--sx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--sy", (py * 100).toFixed(1) + "%");
      if (!card.matches(".service-card")) {
        const x = px - 0.5, y = py - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-8px)`;
      }
```

Keep the existing pointerout cleanup, extending its selector the same way (clear transform only for tilt targets; `--sx/--sy` may stay — opacity hides the layer).

- [ ] **Step 3: Verify** — `node --check`. Force mode: pointermove over a work-card → computed `--sx` updates + ::after opacity 1 on hover; service-card → spotlight vars update, transform stays none; tilt still works on work-cards. Reduce mode: no listener (inherits existing gate — confirm the tilt block's gate covers the new code). Lightbox/filters unaffected (click through spotlight layer — it's pointer-events none).

- [ ] **Step 4: Commit** — `git add -A; git commit -m "feat: spotlight hover on work and service cards (motion v4)"`

---

### Task M4: DecryptedText kickers

**Files:** Modify: `assets/js/motion.js`

- [ ] **Step 1: JS** — append inside DOMContentLoaded (technique from react-bits `DecryptedText.jsx`: interval shuffle with progressive reveal; width locked to prevent proportional-font jitter; aria-label carries the real text during the scramble):

```js
  /* ---------- decrypted-text kickers (react-bits DecryptedText port) ---------- */
  const kickers = document.querySelectorAll(".kicker");
  if (kickers.length && !reduceMotion && "IntersectionObserver" in window) {
    const DECRYPT_CHARS = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789#/_";
    const TICK_MS = 35;
    const REVEAL_TICKS = 14; /* full reveal in ~half a second */
    const decrypt = (el) => {
      const orig = el.textContent;
      if (!orig.trim()) return;
      el.setAttribute("aria-label", orig);
      el.style.minWidth = el.offsetWidth + "px";
      el.style.display = "inline-block"; /* minWidth needs a box; .kicker already inline-block — keep harmless */
      let tick = 0;
      const timer = setInterval(() => {
        tick++;
        const revealed = Math.ceil((tick / REVEAL_TICKS) * orig.length);
        if (revealed >= orig.length) {
          clearInterval(timer);
          el.textContent = orig;
          el.style.minWidth = "";
          el.removeAttribute("aria-label");
          return;
        }
        el.textContent = [...orig]
          .map((ch, i) => (ch === " " || i < revealed
            ? ch
            : DECRYPT_CHARS[(Math.random() * DECRYPT_CHARS.length) | 0]))
          .join("");
      }, TICK_MS);
    };
    const kickerIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        kickerIO.unobserve(en.target);
        decrypt(en.target);
      });
    }, { threshold: 0.6 });
    kickers.forEach((el) => kickerIO.observe(el));
  }
```

- [ ] **Step 2: Verify** — `node --check`. Force mode on index: hero kicker scrambles then settles to «Ομάδα 3D εκτύπωσης — Πάτρα» (poll textContent: changes then equals original within ~1s); width stable during scramble (offsetWidth constant ±1px); scroll to services → its kicker decrypts once (re-scroll: no repeat). Every page's kickers behave (portfolio/filaments/contact have them). Reduce mode: text static immediately. Check `.on-dark .kicker` (hero) renders scramble legibly.

- [ ] **Step 3: Commit** — `git add -A; git commit -m "feat: decrypted-text kicker reveals (motion v4)"`

---

### Task M5: Index — marquee ticker + curtain handoff

**Files:** Modify: `index.html`, `assets/css/site.css`, `assets/js/motion.js`

- [ ] **Step 1: Marquee markup** — insert in index.html BETWEEN the portfolio-highlights section and the filament-teaser section:

```html
    <!-- TICKER -->
    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">
        <span>3D PRINTING&nbsp;·&nbsp;NFC GADGETS&nbsp;·&nbsp;ΚΑΤΑΣΚΕΥΗ ΙΣΤΟΣΕΛΙΔΩΝ&nbsp;·&nbsp;CUSTOM ΕΚΤΥΠΩΣΕΙΣ&nbsp;·&nbsp;ΠΑΤΡΑ&nbsp;·&nbsp;</span>
        <span>3D PRINTING&nbsp;·&nbsp;NFC GADGETS&nbsp;·&nbsp;ΚΑΤΑΣΚΕΥΗ ΙΣΤΟΣΕΛΙΔΩΝ&nbsp;·&nbsp;CUSTOM ΕΚΤΥΠΩΣΕΙΣ&nbsp;·&nbsp;ΠΑΤΡΑ&nbsp;·&nbsp;</span>
      </div>
    </div>
    <p class="sr-only">3D printing, NFC gadgets, κατασκευή ιστοσελίδων, custom εκτυπώσεις, Πάτρα.</p>
```

- [ ] **Step 2: Marquee CSS:**

```css
/* ---------- marquee ticker ---------- */
.ticker { overflow: hidden; border-block: 1px solid var(--line); padding: 0.85rem 0; }
.ticker-track {
  display: flex;
  width: max-content;
  white-space: nowrap;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  color: var(--ink-3);
  animation: ticker-scroll 30s linear infinite;
}
@keyframes ticker-scroll { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  html:not(.motion-force) .ticker-track { animation: none; } /* explicit: the global 0.01ms crusher would strobe an infinite loop */
}
```

- [ ] **Step 3: Curtain handoff** — add class `curtain` to the services `<section>` on index.html. CSS:

```css
/* ---------- curtain handoff (hero → services); exists only while scrubbing ---------- */
.print-scrub-on .curtain {
  clip-path: inset(calc((1 - var(--curtain, 1)) * 22%) 0 0 0);
  transform: translateY(calc((1 - var(--curtain, 1)) * 44px));
}
```

JS — integrate into the EXISTING onScrollFrame (reads with the reads, writes with the writes — do not add a listener):

```js
  /* hoisted with the other lookups: */
  const curtainEl = document.querySelector(".curtain");
  /* in reads:  */ const curtainRect = curtainEl && scrubbing ? curtainEl.getBoundingClientRect() : null;
  /* in writes: */
  if (curtainRect) {
    const p = Math.min(1, Math.max(0, (innerHeight - curtainRect.top) / (innerHeight * 0.55)));
    curtainEl.style.setProperty("--curtain", p.toFixed(4));
  }
```

NOTE the invariant: `.curtain` has NO transform/clip in the default state (no-JS/reduce = fully visible); the rule exists only under `.print-scrub-on`, which only motion.js adds. `transform` on the section is safe — nothing else transforms sections, and tilt/magnet targets are descendants (their transforms compose independently).

- [ ] **Step 4: Verify** — `node --check`. Default mode: ticker STATIC (animation none), services fully visible, no clip. Force mode: ticker scrolls (transform changes between two rAF samples); scroll from hero into services → `--curtain` goes 0→1 and clip-path recedes (sample computed clip-path at two scroll offsets); after fully in view, clip-path is `inset(0% 0 0 0)` equivalent. 360px: ticker no horizontal page scroll (overflow hidden); text doesn't wrap. Ticker not focusable, sr-only mirror present.

- [ ] **Step 5: Commit** — `git add -A; git commit -m "feat: marquee ticker and hero-to-services curtain handoff (motion v4)"`

---

### Task M6: Portfolio sticky-grid unfold

**Files:** Modify: `portfolio.html`, `assets/js/portfolio.js`, `assets/css/site.css`

- [ ] **Step 1: Markup** — in portfolio.html, wrap the EXISTING portfolio section content (h1 block + filter row + grid + empty state stay together inside) like:

```html
<div class="unfold-stage">
  <div class="unfold-pin">
    <section class="section wrap" aria-labelledby="pf-h">
      … existing content unchanged …
    </section>
  </div>
</div>
```

(The closing lead link can stay inside or move after the stage — keep inside, simplest.)

- [ ] **Step 2: CSS** — all gated under a root class `unfold-on` that ONLY portfolio.js adds (default = normal static layout):

```css
/* ---------- portfolio sticky-grid entrance unfold (≥761px, motion allowed) ---------- */
.unfold-on .unfold-stage { height: 230vh; }
.unfold-on .unfold-pin {
  position: sticky;
  top: 0;
  min-height: 100svh;
  overflow: clip;
  display: flex;
  align-items: center;
}
.unfold-on .work-card {
  transform: translate(var(--ux, 0px), var(--uy, 0px)) scale(var(--us, 1));
  opacity: var(--uo, 1);
}
```

CAUTION: `.unfold-on .work-card` transform must not fight the tilt inline transform — Step 3 suspends tilt during the unfold via a `data-unfolding` attribute the tilt handler already needs to respect (see Step 4).

- [ ] **Step 3: JS (portfolio.js)** — append inside the existing DOMContentLoaded:

```js
  /* ---------- sticky-grid entrance unfold ---------- */
  const stage = document.querySelector(".unfold-stage");
  const forceMotion = new URLSearchParams(location.search).get("motion") === "force";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches && !forceMotion;
  const wideEnough = matchMedia("(min-width: 761px)").matches;
  if (stage && grid && !reduceMotion && wideEnough) {
    document.documentElement.classList.add("unfold-on");
    const cards = [...grid.querySelectorAll(".work-card")];
    grid.setAttribute("data-unfolding", "");
    /* per-card scatter offsets: alternate directions by index */
    const offsets = cards.map((c, i) => ({
      x: (i % 2 ? 1 : -1) * (60 + (i % 4) * 30),
      y: 80 + (i % 3) * 40,
    }));
    let done = false;
    const applyUnfold = (p) => {
      cards.forEach((c, i) => {
        const cp = Math.min(1, Math.max(0, p * (cards.length * 0.55) - i * 0.45));
        const e = 1 - Math.pow(1 - cp, 3);
        c.style.setProperty("--ux", ((1 - e) * offsets[i].x).toFixed(1) + "px");
        c.style.setProperty("--uy", ((1 - e) * offsets[i].y).toFixed(1) + "px");
        c.style.setProperty("--us", (0.9 + e * 0.1).toFixed(3));
        c.style.setProperty("--uo", e.toFixed(3));
      });
    };
    const finishUnfold = () => {
      if (done) return;
      done = true;
      applyUnfold(1);
      grid.removeAttribute("data-unfolding");
      document.documentElement.classList.remove("unfold-on");
      cards.forEach((c) => {
        ["--ux", "--uy", "--us", "--uo"].forEach((v) => c.style.removeProperty(v));
      });
      removeEventListener("scroll", onUnfoldScroll);
    };
    let unfoldDirty = false;
    const unfoldFrame = () => {
      unfoldDirty = false;
      const r = stage.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      if (p >= 1) { finishUnfold(); return; }
      applyUnfold(p);
    };
    const onUnfoldScroll = () => {
      if (!unfoldDirty) { unfoldDirty = true; requestAnimationFrame(unfoldFrame); }
    };
    addEventListener("scroll", onUnfoldScroll, { passive: true });
    unfoldFrame();
    /* any filter interaction force-completes the entrance */
    buttons.forEach((b) => b.addEventListener("click", finishUnfold, { once: true }));
  }
```

(`grid` and `buttons` are the existing variables in portfolio.js — verify names and reuse; if scoping prevents reuse, re-query locally.)

- [ ] **Step 4: Tilt suspension (motion.js)** — in the delegated tilt handler, skip tilt while unfolding: right after `const card = e.target.closest?.(…)`, add:

```js
      if (card && card.closest("[data-unfolding]")) return;
```

- [ ] **Step 5: Verify** — `node --check` both JS files. Force mode ≥761px: load portfolio → html has `unfold-on`, stage 230vh, pin sticky; at p≈0 cards scattered/faded (sample `--uo` < 1 on last card); scroll through → cards settle; at p=1 root class REMOVED, stage back to auto height (layout reflows to normal), all custom props cleared, tilt works again, filters work (counts 3/2/1/2/8), lightbox opens. Filter click mid-unfold → instant completion, no stuck transforms. Default (reduce) mode AND 360px: NO unfold-on class, page identical to pre-task state (diff a DOM snapshot of the grid). Keyboard: tab order unchanged.

- [ ] **Step 6: Commit** — `git add -A; git commit -m "feat: portfolio sticky-grid entrance unfold (motion v4)"`

---

### Task M7: Verification pass + vault log

- [ ] **Step 1:** Full sweep, all 4 pages × both modes: zero console errors, zero failed requests, no horizontal scroll at 375/360, screenshots desktop+mobile eyeballed.
- [ ] **Step 2:** Interaction matrix on index (force): magnify + magnet + sparks + shine simultaneously on dock/CTA; kicker decrypt; ticker; curtain; hero scrub unaffected (LAYER mid-values still correct).
- [ ] **Step 3:** Portfolio (force): unfold → filters → lightbox → tilt+spotlight, in that order, all working post-unfold.
- [ ] **Step 4:** Reduced-motion audit: every new effect absent/static (magnify listener off, no spark canvas, kickers static, ticker frozen via animation:none, curtain rule inert, unfold-on absent). No-JS reasoning check: no new hidden-by-default state exists (grep the new CSS for opacity/clip/transform outside gated classes).
- [ ] **Step 5:** Fix-forward findings, commit `fix: motion v4 verification corrections` (skip if clean).
- [ ] **Step 6:** Append vault SESSION-LOG entry (motion v4 shipped: list of 8 effects, react-bits ports noted, stats band rejected) + commit vault repo.

---

## Self-review notes (spec coverage)

Spec §9 items → tasks: 1→M1, 2+3→M2, 4→M3, 5→M4, 7+8→M5, 9→M6, verification→M7. Item 6 rejected (excluded). Invariants repeated per task. Type consistency: `--mag/--sx/--sy/--curtain/--ux/--uy/--us/--uo` custom props each defined and consumed within their own task; `data-unfolding` produced in M6 Step 3 and consumed in M6 Step 4; root classes `unfold-on` (new), `print-scrub-on` (existing) referenced consistently.
