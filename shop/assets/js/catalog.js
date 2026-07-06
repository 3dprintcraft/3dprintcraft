/* ================================================================
   3DPrintCraft Shop — κατάλογος: render, φίλτρα, αναζήτηση,
   «είδες πρόσφατα»
   ================================================================ */
(() => {
'use strict';
const { $, $$, loadProducts, getProduct, cardHtml } = window.PCShop;

const state = { cat: 'all', query: '' };

/* NFC + featured πρώτα, μετά τα υπόλοιπα */
function sortProducts(list) {
  const score = p => (p.featured ? 2 : 0) + (p.category === 'nfc' ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a));
}

function matches(p) {
  if (state.cat !== 'all' && p.category !== state.cat) return false;
  if (!state.query) return true;
  const hay = (p.name + ' ' + p.description).toLowerCase();
  return state.query.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}

function renderRecent(catalog) {
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem('pc-recent') || '[]'); } catch { /* κενό */ }
  const picks = ids.map(id => getProduct(catalog, id)).filter(Boolean).slice(0, 3);
  if (!picks.length) return;
  $('#recentGrid').innerHTML = picks.map(p => cardHtml(p, { showTag: true })).join('');
  $('#recent').hidden = false;
}

async function init() {
  const grid = $('#grid');
  const empty = $('#empty');
  let catalog;
  try {
    catalog = await loadProducts();
  } catch (e) {
    grid.innerHTML = '<div class="pc-shop-empty">; ΣΦΑΛΜΑ ΦΟΡΤΩΣΗΣ ΚΑΤΑΛΟΓΟΥ — ΔΟΚΙΜΑΣΕ REFRESH</div>';
    return;
  }
  const products = sortProducts(catalog.products);

  function render() {
    const shown = products.filter(matches);
    grid.innerHTML = shown.map((p, i) =>
      cardHtml(p, { showTag: true, showDesc: true, showFrom: true, delay: Math.min(i * 60, 420) })).join('');
    empty.hidden = shown.length > 0;
  }

  $$('#filters .pc-shop-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('#filters .pc-shop-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      state.cat = chip.dataset.cat;
      render();
    });
  });

  $('#searchBox').addEventListener('input', e => {
    state.query = e.target.value.trim();
    render();
  });

  render();
  renderRecent(catalog);
}

document.addEventListener('DOMContentLoaded', init);
})();
