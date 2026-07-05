/* ================================================================
   3DPrintCraft Shop — σελίδα προϊόντος: options, live τιμή,
   ΣΤΟ ΚΑΛΑΘΙ / ΑΓΟΡΑ ΤΩΡΑ
   ================================================================ */
(() => {
'use strict';
const { $, $$, loadProducts, getProduct, unitPriceCents, fmtMoney,
        cartAdd, buyNowSet, escapeHtml } = window.PCShop;

const state = { product: null, selections: {}, qty: 1 };

function optionHtml(opt) {
  if (opt.type === 'select') {
    const btns = opt.choices.map(c => {
      const delta = c.priceDelta ? ` <span class="delta">+${fmtMoney(Math.round(c.priceDelta * 100))}</span>` : '';
      return `<button type="button" class="pc-shop-opt-btn" data-opt="${escapeHtml(opt.id)}" data-val="${escapeHtml(c.value)}">${escapeHtml(c.label)}${delta}</button>`;
    }).join('');
    return `<div class="pc-shop-opt" data-optwrap="${escapeHtml(opt.id)}">
      <span class="pc-shop-opt-label">${escapeHtml(opt.label)}</span>
      <div class="pc-shop-opt-choices">${btns}</div>
    </div>`;
  }
  const req = opt.required ? ' <span class="req">*</span>' : '';
  const ml = opt.maxLength || 200;
  const ph = opt.placeholder ? ` placeholder="${escapeHtml(opt.placeholder)}"` : '';
  return `<div class="pc-shop-opt" data-optwrap="${escapeHtml(opt.id)}">
    <label class="pc-shop-opt-label" for="opt-${escapeHtml(opt.id)}">${escapeHtml(opt.label)}${req}</label>
    <input class="pc-shop-input" type="text" id="opt-${escapeHtml(opt.id)}" data-opt="${escapeHtml(opt.id)}" maxlength="${ml}"${ph} />
    <div class="pc-shop-field-err" id="err-${escapeHtml(opt.id)}">ΣΥΜΠΛΗΡΩΣΕ ΤΟ ΠΕΔΙΟ — ΤΟ ΧΡΕΙΑΖΟΜΑΣΤΕ ΓΙΑ ΤΗΝ ΠΑΡΑΓΓΕΛΙΑ</div>
  </div>`;
}

function refreshPrice() {
  const cents = unitPriceCents(state.product, state.selections) * state.qty;
  $('#pPrice').textContent = fmtMoney(cents);
}

/* Επιστρέφει true αν όλα τα required text είναι συμπληρωμένα (και μαρκάρει errors) */
function collectTexts(markErrors) {
  let ok = true;
  for (const opt of state.product.options || []) {
    if (opt.type !== 'text') continue;
    const input = $(`input[data-opt="${opt.id}"]`);
    const val = input.value.trim();
    if (val) state.selections[opt.id] = val;
    else delete state.selections[opt.id];
    const bad = opt.required && !val;
    if (markErrors) {
      input.classList.toggle('is-error', bad);
      $('#err-' + opt.id).classList.toggle('is-on', bad);
    }
    if (bad) ok = false;
  }
  return ok;
}

function currentItem() {
  return { productId: state.product.id, qty: state.qty, selections: { ...state.selections } };
}

async function init() {
  const id = new URLSearchParams(location.search).get('id');
  let catalog;
  try { catalog = await loadProducts(); } catch { catalog = null; }
  const product = catalog ? getProduct(catalog, id) : null;

  if (!product) {
    $('#notFound').hidden = false;
    $('#crumb').innerHTML = '<a href="./">ΚΑΤΑΛΟΓΟΣ</a> / 404';
    return;
  }
  state.product = product;

  document.title = product.name + ' — 3DPrintCraft Shop';
  $('#crumb').innerHTML = `<a href="./">ΚΑΤΑΛΟΓΟΣ</a> / ${escapeHtml(product.name).toUpperCase()}`;
  $('#pName').textContent = product.name;
  $('#pDesc').textContent = product.description;
  const img = $('#pImg');
  img.src = product.images[0];
  img.alt = product.name;
  $('#pOptions').innerHTML = (product.options || []).map(optionHtml).join('');
  $('#productWrap').hidden = false;

  /* Προεπιλογή: πρώτο choice κάθε select */
  for (const opt of product.options || []) {
    if (opt.type === 'select' && opt.choices.length) {
      state.selections[opt.id] = opt.choices[0].value;
      $(`.pc-shop-opt-btn[data-opt="${opt.id}"][data-val="${CSS.escape(opt.choices[0].value)}"]`)
        ?.classList.add('is-active');
    }
  }

  $('#pOptions').addEventListener('click', e => {
    const btn = e.target.closest('.pc-shop-opt-btn');
    if (!btn) return;
    state.selections[btn.dataset.opt] = btn.dataset.val;
    $$(`.pc-shop-opt-btn[data-opt="${btn.dataset.opt}"]`).forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    refreshPrice();
  });
  $('#pOptions').addEventListener('input', e => {
    const input = e.target.closest('input[data-opt]');
    if (!input) return;
    input.classList.remove('is-error');
    $('#err-' + input.dataset.opt)?.classList.remove('is-on');
  });

  $('#qtyMinus').addEventListener('click', () => { state.qty = Math.max(1, state.qty - 1); $('#qtyOut').textContent = state.qty; refreshPrice(); });
  $('#qtyPlus').addEventListener('click', () => { state.qty = Math.min(20, state.qty + 1); $('#qtyOut').textContent = state.qty; refreshPrice(); });

  $('#btnCart').addEventListener('click', () => {
    if (!collectTexts(true)) return;
    const item = currentItem();
    cartAdd(item.productId, item.qty, item.selections);
    const msg = $('#addedMsg');
    msg.classList.remove('is-on');
    void msg.offsetWidth;             /* restart animation */
    msg.classList.add('is-on');
  });

  $('#btnBuy').addEventListener('click', () => {
    if (!collectTexts(true)) return;
    buyNowSet(currentItem());
    location.href = 'checkout.html?buynow=1';
  });

  refreshPrice();
}

document.addEventListener('DOMContentLoaded', init);
})();
