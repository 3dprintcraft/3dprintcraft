/* 3DPrintCraft — printer-themed one-pager interactions (vanilla) */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

  const SECTIONS = [
    { id: 'hero',     label: 'ΑΡΧΗ' },
    { id: 'services', label: 'ΥΠΗΡΕΣΙΕΣ' },
    { id: 'work',     label: 'ΔΟΥΛΕΙΕΣ' },
    { id: 'process',  label: 'ΔΙΑΔΙΚΑΣΙΑ' },
    { id: 'cta',      label: 'ΠΡΟΣΦΟΡΑ' },
  ];
  const TOTAL_LAYERS = 412;
  const ready = (fn) => (document.readyState !== 'loading' ? fn() : addEventListener('DOMContentLoaded', fn));

  ready(() => {
    /* ── Scroll → gantry progress, active section, HUD ── */
    const gantryFill = $('#gantryFill');
    const navLinks = $$('#nav a');
    const hudD = $('#hudDesktop'), hudM = $('#hudMobile');
    const hudPct = $('#hudPct'), hudEta = $('#hudEta'), hudBar = $('#hudBar'), hudLayer = $('#hudLayer'), hudName = $('#hudName');
    const hudPctM = $('#hudPctM'), hudLayerM = $('#hudLayerM'), hudBarM = $('#hudBarM');
    let active = -1;

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
      const pct = Math.round(p * 100);
      const layer = Math.max(1, Math.round(p * TOTAL_LAYERS));

      if (gantryFill) gantryFill.style.width = (p * 100) + '%';

      let idx = 0, best = Infinity;
      SECTIONS.forEach((sec, i) => {
        const el = document.getElementById(sec.id);
        if (!el) return;
        const d = Math.abs(el.getBoundingClientRect().top - 120);
        if (d < best) { best = d; idx = i; }
      });
      if (idx !== active) {
        active = idx;
        navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
        if (hudName) hudName.textContent = SECTIONS[active].label;
      }

      const show = p > 0.02;
      if (hudD) hudD.classList.toggle('show', show);
      if (hudM) hudM.classList.toggle('show', show);

      const eta = Math.max(0, Math.round((1 - p) * 132));
      const mm = Math.floor(eta / 60), ss = String(eta % 60).padStart(2, '0');
      if (hudPct)   hudPct.textContent = pct;
      if (hudEta)   hudEta.textContent = mm + ':' + ss;
      if (hudBar)   hudBar.style.right = (100 - pct) + '%';
      if (hudLayer) hudLayer.textContent = layer + '/' + TOTAL_LAYERS;
      if (hudPctM)  hudPctM.textContent = pct + '%';
      if (hudLayerM) hudLayerM.textContent = 'L ' + layer + '/' + TOTAL_LAYERS;
      if (hudBarM)  hudBarM.style.right = (100 - pct) + '%';
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });

    /* ── Materials ticker ── */
    const tt = $('#tickerTrack');
    if (tt) {
      const items = ['PLA','ABS','ABS-GF','ASA','TPU','PA6-CF','PC'];
      tt.innerHTML = items.map((m) =>
        '<span class="hot">' + m + '</span>'
      ).join('<span class="sep">●</span>');
    }

    bootConsole();
    lifecycle();
    odometer();
  });

  /* ── Boot console typewriter ── */
  function bootConsole() {
    const body = document.getElementById('bootBody');
    const status = document.getElementById('bootStatus');
    if (!body) return;
    const lines = [
      { code: 'M115',       rest: '      ; firmware ok · 0 errors' },
      { code: 'G28',        rest: '       ; home all axes ───────────────────── ✓' },
      { code: 'M140 S60',   rest: '  ; bed → 60°C ─────────────────────── ✓' },
      { code: 'M104 S215',  rest: ' ; nozzle → 215°C ──────────────────── ✓' },
      { code: 'M73 P0',     rest: '     ; print start ──────────────── GO' },
    ];
    const render = (row, col, done) => {
      body.textContent = '';
      lines.forEach((ln, i) => {
        const div = document.createElement('div');
        const total = ln.code + ln.rest;
        const text = i < row ? total : i === row ? total.slice(0, col) : '';
        const codeLen = Math.min(text.length, ln.code.length);
        const isCmt = ln.code.charAt(0) === ';';
        const c = document.createElement('span'); c.className = isCmt ? 'cmt' : 'code'; c.textContent = text.slice(0, codeLen);
        const r = document.createElement('span'); r.className = 'cmt'; r.textContent = text.slice(codeLen);
        div.appendChild(c); div.appendChild(r);
        if (i === row && !done) { const cur = document.createElement('span'); cur.className = 'pc-boot-cursor'; div.appendChild(cur); }
        body.appendChild(div);
      });
    };
    const finish = () => { if (status) { status.textContent = '● READY'; status.classList.add('ready'); } };
    if (reduce) { render(lines.length, 0, true); finish(); return; }
    let row = 0, col = 0;
    const step = () => {
      if (row >= lines.length) { render(row, col, true); finish(); return; }
      const total = lines[row].code.length + lines[row].rest.length;
      if (col < total) { col++; render(row, col, false); setTimeout(step, 8 + Math.random() * 16); }
      else { row++; col = 0; render(row, col, false); setTimeout(step, 95); }
    };
    setTimeout(step, 240);
  }

  /* ── Hero lifecycle (3 stages) ── */
  function lifecycle() {
    const life = document.getElementById('lifecycle');
    if (!life) return;
    const tabs = $$('.pc-tab', life);
    const fills = tabs.map((t) => t.querySelector('.pc-tab-fill'));
    const typed = document.getElementById('emailTyped');
    const cursor = document.getElementById('emailCursor');
    const printLayer = document.getElementById('printLayer');
    const roLbl = document.getElementById('roLbl'), roVal = document.getElementById('roVal');
    const emailBody = 'Γεια! Μπορείτε να τυπώσετε 5 grippers μέχρι Παρασκευή; Προσφορά παρακαλώ.';
    const readouts = [
      ['ΑΠΟ', 'Μαρία @ Plexus Robotics'],
      ['ΓΕΩΜΕΤΡΙΑ', '12.403 polygons · PETG'],
      ['ΕΚΤΥΠΩΣΗ', 'Layer 247/412 · ETA 2ώ 14λ'],
    ];
    const STAGE = 3800, N = 3;

    const setStage = (stage, stageT) => {
      if (life.dataset.stage !== String(stage)) {
        life.dataset.stage = stage;
        if (roLbl) roLbl.textContent = readouts[stage][0];
        if (roVal) roVal.textContent = readouts[stage][1];
      }
      tabs.forEach((t, i) => { t.classList.toggle('is-active', i === stage); t.classList.toggle('is-done', i < stage); });
      fills.forEach((f, i) => { if (f) f.style.width = (i < stage ? 100 : i === stage ? (reduce ? 100 : stageT * 100) : 0) + '%'; });
      if (stage === 0 && typed) {
        if (reduce) {
          typed.textContent = emailBody;
          if (cursor) cursor.style.display = 'none';
        } else {
          const tp = Math.max(0, Math.min(1, (stageT - 0.12) * 1.6));
          typed.textContent = emailBody.slice(0, Math.floor(tp * emailBody.length));
          if (cursor) cursor.style.display = tp < 1 ? 'inline-block' : 'none';
        }
      }
      if (stage === 2 && printLayer) printLayer.textContent = reduce ? '412' : String(Math.round(stageT * 412)).padStart(3, '0');
    };

    setStage(0, 1); // stable: show only stage 01 (ΕΠΑΦΗ)
  }

  /* ── Filament odometer ── */
  function odometer() {
    const g = document.getElementById('odoG'), m = document.getElementById('odoM');
    if (!g || !m) return;
    const base = 61234.8, drift = 0.42, t0 = performance.now();
    const fmt = (n) => n.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (reduce) { g.textContent = fmt(base); m.textContent = fmt(base / 2.98); return; }
    const tick = () => {
      const dt = (performance.now() - t0) / 1000;
      const v = base + dt * drift;
      g.textContent = fmt(v);
      m.textContent = fmt(v / 2.98);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
