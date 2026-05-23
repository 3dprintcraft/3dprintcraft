/* 3DPrintCraft — landing page interactions (progressive enhancement) */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onReady = (fn) =>
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    document.documentElement.dataset.jsReady = 'true';

    /* Footer year */
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    /* ---- Mobile nav toggle ---- */
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

    /* ---- Sticky header shadow ---- */
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---- Scroll reveal ---- */
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

    /* ---- Animated counters ---- */
    const counters = document.querySelectorAll('[data-count-to]');
    const runCounter = (el) => {
      const target = Number(el.dataset.countTo) || 0;
      const suffix = el.dataset.suffix || '';
      const fmt = (n) => n.toLocaleString('el-GR') + suffix;
      if (reduceMotion) { el.textContent = fmt(target); return; }
      const duration = 1500; const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = fmt(0);
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

    /* ---- Hero parallax ---- */
    const canvas = document.querySelector('.hero__canvas');
    if (canvas && !reduceMotion) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          canvas.style.transform = `translateY(${window.scrollY * 0.16}px)`;
          ticking = false;
        });
      }, { passive: true });
    }
  });
})();
