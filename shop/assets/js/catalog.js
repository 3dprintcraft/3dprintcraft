/* ================================================================
   3DPrintCraft Shop — κατάλογος: render + φίλτρα κατηγοριών
   ================================================================ */
(() => {
'use strict';
const { $, $$, loadProducts, unitPriceCents, fmtMoney, escapeHtml } = window.PCShop;

const CAT_TAGS = { nfc: 'NFC', prints: '3D PRINT' };

/* Έχει priceDelta κάποια επιλογή; τότε η τιμή είναι «από» */
function hasDeltas(p) {
  return (p.options || []).some(o => o.type === 'select' && (o.choices || []).some(c => c.priceDelta));
}

function cardHtml(p, i) {
  const tagCls = p.category === 'nfc' ? 'nfc' : '';
  const from = hasDeltas(p) ? '<span class="from">ΑΠΟ</span>' : '';
  return `
  <a class="pc-shop-card" href="product.html?id=${encodeURIComponent(p.id)}" data-cat="${escapeHtml(p.category)}" style="animation-delay:${Math.min(i * 60, 420)}ms">
    <div class="pc-shop-card-img">
      <span class="pc-shop-card-tag ${tagCls}">${CAT_TAGS[p.category] || 'ITEM'}</span>
      <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy" />
    </div>
    <div class="pc-shop-card-body">
      <h2 class="pc-shop-card-name">${escapeHtml(p.name)}</h2>
      <p class="pc-shop-card-desc">${escapeHtml(p.description)}</p>
      <div class="pc-shop-card-foot">
        <div class="pc-shop-price">${from}${fmtMoney(unitPriceCents(p, {}))}</div>
        <span class="pc-shop-card-go">ΔΕΣ ΤΟ →</span>
      </div>
    </div>
  </a>`;
}

/* NFC + featured πρώτα, μετά τα υπόλοιπα */
function sortProducts(list) {
  const score = p => (p.featured ? 2 : 0) + (p.category === 'nfc' ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a));
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

  function render(cat) {
    const shown = products.filter(p => cat === 'all' || p.category === cat);
    grid.innerHTML = shown.map(cardHtml).join('');
    empty.hidden = shown.length > 0;
    $('#metaCount').textContent = 'SKU · ' + String(shown.length).padStart(2, '0');
  }

  $$('#filters .pc-shop-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('#filters .pc-shop-chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      render(chip.dataset.cat);
    });
  });

  render('all');
}

document.addEventListener('DOMContentLoaded', init);
})();
