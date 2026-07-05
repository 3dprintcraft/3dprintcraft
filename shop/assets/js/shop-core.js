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
  escapeHtml, updateBadge, initGantry
};

document.addEventListener('DOMContentLoaded', initGantry);
})();
