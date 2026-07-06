/* ================================================================
   3DPrintCraft Shop — shared core (PCShop)
   Κατάλογος, καλάθι (localStorage), τιμές σε λεπτά (integer)
   ================================================================ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const CART_KEY  = 'pc-cart-v1';
const BUYNOW_KEY = 'pc-buynow';

let _catalog = null;

/* ── Κατάλογος ─────────────────────────────────────────────────── */
async function loadProducts() {
  if (_catalog) return _catalog;
  const res = await fetch('products.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('catalog fetch failed: ' + res.status);
  _catalog = await res.json();
  return _catalog;
}

function getProduct(catalog, id) {
  return catalog.products.find(p => p.id === id) || null;
}

/* Τιμή μονάδας σε ΛΕΠΤΑ: base + priceDelta των επιλεγμένων choices */
function unitPriceCents(product, selections) {
  let cents = Math.round(product.price * 100);
  for (const opt of product.options || []) {
    if (opt.type !== 'select') continue;
    const val = selections ? selections[opt.id] : undefined;
    const choice = (opt.choices || []).find(c => c.value === val);
    if (choice && choice.priceDelta) cents += Math.round(choice.priceDelta * 100);
  }
  return cents;
}

const _fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });
function fmtMoney(cents) { return _fmt.format(cents / 100); }

/* Ετικέτες επιλογών για εμφάνιση: {optLabel: choiceLabel|text} */
function selectionLabels(product, selections) {
  const out = [];
  for (const opt of product.options || []) {
    const val = selections ? selections[opt.id] : undefined;
    if (val === undefined || val === '') continue;
    if (opt.type === 'select') {
      const choice = (opt.choices || []).find(c => c.value === val);
      out.push({ label: opt.label, value: choice ? choice.label : val });
    } else {
      out.push({ label: opt.label, value: val });
    }
  }
  return out;
}

/* ── Καλάθι ────────────────────────────────────────────────────── */
function cartGet() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch { return []; }
}
function cartSave(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateBadge();
}
function sameSelections(a, b) { return JSON.stringify(a || {}) === JSON.stringify(b || {}); }

function cartAdd(productId, qty, selections) {
  const items = cartGet();
  const hit = items.find(i => i.productId === productId && sameSelections(i.selections, selections));
  if (hit) hit.qty = Math.min(20, hit.qty + qty);
  else items.push({ productId, qty, selections: selections || {} });
  cartSave(items);
}
function cartSetQty(index, qty) {
  const items = cartGet();
  if (!items[index]) return;
  items[index].qty = Math.max(1, Math.min(20, qty | 0));
  cartSave(items);
}
function cartRemove(index) {
  const items = cartGet();
  items.splice(index, 1);
  cartSave(items);
}
function cartClear() { cartSave([]); }
function cartCount() { return cartGet().reduce((n, i) => n + i.qty, 0); }

/* ── Buy-now (sessionStorage) ──────────────────────────────────── */
function buyNowSet(item) { sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(item)); }
function buyNowGet() {
  try {
    const raw = sessionStorage.getItem(BUYNOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function buyNowClear() { sessionStorage.removeItem(BUYNOW_KEY); }

/* ── UI helpers ────────────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function updateBadge() {
  const n = cartCount();
  $$('.pc-cart-badge').forEach(el => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* Κοινή κάρτα προϊόντος (κατάλογος, related, είδες πρόσφατα) */
function cardHtml(p, opts) {
  const o = opts || {};
  const CAT_TAGS = { nfc: 'NFC', prints: '3D PRINT' };
  const tag = o.showTag
    ? `<span class="pc-shop-card-tag ${p.category === 'nfc' ? 'nfc' : ''}">${CAT_TAGS[p.category] || 'ITEM'}</span>`
    : '';
  const hasDeltas = (p.options || []).some(x => x.type === 'select' && (x.choices || []).some(c => c.priceDelta));
  const from = hasDeltas && o.showFrom ? '<span class="from">ΑΠΟ</span>' : '';
  const desc = o.showDesc ? `<p class="pc-shop-card-desc">${escapeHtml(p.description)}</p>` : '';
  return `
  <a class="pc-shop-card" href="product.html?id=${encodeURIComponent(p.id)}" data-cat="${escapeHtml(p.category)}"${o.delay ? ` style="animation-delay:${o.delay}ms"` : ''}>
    <div class="pc-shop-card-img">
      ${tag}
      <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy" />
    </div>
    <div class="pc-shop-card-body">
      <h3 class="pc-shop-card-name">${escapeHtml(p.name)}</h3>
      ${desc}
      <div class="pc-shop-card-foot">
        <div class="pc-shop-price">${from}${fmtMoney(unitPriceCents(p, {}))}</div>
        <span class="pc-shop-card-go">ΔΕΣ ΤΟ →</span>
      </div>
    </div>
  </a>`;
}

/* ── Mini-cart drawer ──────────────────────────────────────────── */
let drawerReady = false;

function drawerLineHtml(catalog, item, idx) {
  const p = getProduct(catalog, item.productId);
  if (!p) return '';
  const opts = selectionLabels(p, item.selections)
    .map(o => `${escapeHtml(o.label)}: <b>${escapeHtml(o.value)}</b>`).join(' · ');
  const cents = unitPriceCents(p, item.selections) * item.qty;
  return `<div class="pc-shop-line">
    <div class="pc-shop-line-img"><img src="${escapeHtml(p.images[0])}" alt="" /></div>
    <div class="pc-shop-line-main">
      <h3 class="pc-shop-line-name">${escapeHtml(p.name)}</h3>
      <div class="pc-shop-line-opts">${opts}</div>
    </div>
    <div class="pc-shop-line-side">
      <div class="pc-shop-line-price">${fmtMoney(cents)}</div>
      <div class="pc-shop-line-qty">
        <button type="button" data-dqty="${idx}" data-dir="-1" aria-label="Λιγότερα">−</button>
        <span>${item.qty}</span>
        <button type="button" data-dqty="${idx}" data-dir="1" aria-label="Περισσότερα">+</button>
      </div>
      <button class="pc-shop-line-rm" type="button" data-drm="${idx}">ΑΦΑΙΡΕΣΗ ✕</button>
    </div>
  </div>`;
}

async function renderCartDrawer() {
  const body = $('#pcDrawerBody');
  const foot = $('#pcDrawerFoot');
  if (!body) return;
  const items = cartGet();
  if (!items.length) {
    body.innerHTML = '<div class="pc-drawer-empty">ΤΟ ΚΑΛΑΘΙ ΣΟΥ ΕΙΝΑΙ ΑΔΕΙΟ</div>';
    foot.hidden = true;
    return;
  }
  let catalog;
  try { catalog = await loadProducts(); } catch { return; }

  body.innerHTML = items.map((it, i) => drawerLineHtml(catalog, it, i)).join('');

  const subtotal = items.reduce((sum, it) => {
    const p = getProduct(catalog, it.productId);
    return p ? sum + unitPriceCents(p, it.selections) * it.qty : sum;
  }, 0);

  /* Free shipping progress — ίδια λογική με το checkout */
  const t = Number(catalog.config.freeShippingOver);
  let nudge = '';
  if (Number.isFinite(t) && t > 0) {
    const th = Math.round(t * 100);
    const missing = th - subtotal;
    nudge = missing > 0
      ? `<div class="pc-shop-freeship">
          <div class="pc-shop-freeship-txt">🚚 Βάλε άλλα <b>${fmtMoney(missing)}</b> για ΔΩΡΕΑΝ μεταφορικά!</div>
          <div class="pc-shop-freeship-bar"><span style="width:${Math.min(100, Math.round((subtotal / th) * 100))}%"></span></div>
        </div>`
      : `<div class="pc-shop-freeship is-won"><div class="pc-shop-freeship-txt">🎉 Κέρδισες ΔΩΡΕΑΝ μεταφορικά!</div></div>`;
  }

  foot.hidden = false;
  foot.innerHTML = `
    ${nudge}
    <div class="pc-drawer-sub"><span>ΥΠΟΣΥΝΟΛΟ</span><span class="n">${fmtMoney(subtotal)}</span></div>
    <a class="pc-btn-primary pc-drawer-cta" href="checkout.html">ΟΛΟΚΛΗΡΩΣΗ ΑΓΟΡΑΣ <span aria-hidden="true">→</span></a>
    <button class="pc-drawer-continue" type="button" data-drawer-close>ΣΥΝΕΧΙΣΕ ΤΙΣ ΑΓΟΡΕΣ</button>`;
}

function openCart() {
  if (!drawerReady) return;
  renderCartDrawer();
  document.body.classList.add('pc-drawer-open');
}
function closeCart() { document.body.classList.remove('pc-drawer-open'); }

function initDrawer() {
  /* Στο checkout το καλάθι είναι ήδη στη σελίδα — χωρίς drawer εκεί */
  if (document.querySelector('main#checkout')) return;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="pc-drawer-backdrop" data-drawer-close></div>
    <aside class="pc-drawer" role="dialog" aria-label="Καλάθι" aria-modal="true">
      <div class="pc-drawer-head">
        <span>ΤΟ ΚΑΛΑΘΙ ΣΟΥ</span>
        <button class="pc-drawer-close" type="button" data-drawer-close aria-label="Κλείσιμο">✕</button>
      </div>
      <div class="pc-drawer-body" id="pcDrawerBody"></div>
      <div class="pc-drawer-foot" id="pcDrawerFoot" hidden></div>
    </aside>`;
  document.body.append(...wrap.children);
  drawerReady = true;

  document.addEventListener('click', e => {
    if (e.target.closest('[data-drawer-close]')) { closeCart(); return; }
    const qty = e.target.closest('[data-dqty]');
    if (qty) {
      const idx = Number(qty.dataset.dqty);
      const cur = cartGet()[idx];
      if (cur) {
        cartSetQty(idx, cur.qty + Number(qty.dataset.dir));
        renderCartDrawer();
      }
      return;
    }
    const rm = e.target.closest('[data-drm]');
    if (rm) {
      cartRemove(Number(rm.dataset.drm));
      renderCartDrawer();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  /* Το «ΚΑΛΑΘΙ» του header ανοίγει το drawer αντί να αλλάζει σελίδα */
  document.querySelectorAll('.pc-gantry-cta[href="checkout.html"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      openCart();
    });
  });
}

/* Gantry: burger + scroll progress (ίδιο feel με το landing) */
function initGantry() {
  const burger = $('#navBurger');
  const menu = $('#navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  const fill = $('#gantryFill');
  if (fill) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      fill.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  updateBadge();
}

window.PCShop = {
  $, $$, loadProducts, getProduct, unitPriceCents, fmtMoney, selectionLabels,
  cartGet, cartAdd, cartSetQty, cartRemove, cartClear, cartCount,
  buyNowSet, buyNowGet, buyNowClear,
  escapeHtml, updateBadge, initGantry,
  cardHtml, openCart, closeCart
};

document.addEventListener('DOMContentLoaded', () => {
  initGantry();
  initDrawer();
});
})();
