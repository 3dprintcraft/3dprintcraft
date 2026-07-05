/* ================================================================
   3DPrintCraft Shop — checkout: σύνοψη, στοιχεία, αποστολή,
   POST /api/checkout → redirect στη Viva
   ================================================================ */
(() => {
'use strict';
const { $, $$, loadProducts, getProduct, unitPriceCents, fmtMoney, selectionLabels,
        cartGet, cartRemove, cartSetQty, buyNowGet, escapeHtml } = window.PCShop;

const state = {
  catalog: null,
  buyNow: null,        /* αν ήρθαμε με ΑΓΟΡΑ ΤΩΡΑ, αγοράζεται ΜΟΝΟ αυτό */
  shippingMethod: null
};

function items() { return state.buyNow ? [state.buyNow] : cartGet(); }

function lineHtml(item, idx) {
  const p = getProduct(state.catalog, item.productId);
  if (!p) return '';
  const opts = selectionLabels(p, item.selections)
    .map(o => `${escapeHtml(o.label)}: <b>${escapeHtml(o.value)}</b>`).join(' · ');
  const cents = unitPriceCents(p, item.selections) * item.qty;
  const rm = state.buyNow ? '' :
    `<button class="pc-shop-line-rm" type="button" data-rm="${idx}">ΑΦΑΙΡΕΣΗ ✕</button>`;
  return `<div class="pc-shop-line">
    <div class="pc-shop-line-img"><img src="${escapeHtml(p.images[0])}" alt="" /></div>
    <div class="pc-shop-line-main">
      <h3 class="pc-shop-line-name">${escapeHtml(p.name)} × ${item.qty}</h3>
      <div class="pc-shop-line-opts">${opts}</div>
    </div>
    <div class="pc-shop-line-side">
      <div class="pc-shop-line-price">${fmtMoney(cents)}</div>
      ${rm}
    </div>
  </div>`;
}

function shipCost() {
  const ship = state.catalog.config.shipping.find(s => s.id === state.shippingMethod);
  return ship ? Math.round(ship.cost * 100) : 0;
}

function itemsTotal() {
  return items().reduce((sum, it) => {
    const p = getProduct(state.catalog, it.productId);
    return p ? sum + unitPriceCents(p, it.selections) * it.qty : sum;
  }, 0);
}

function render() {
  const list = items();
  if (!list.length) {
    $('#checkoutWrap').hidden = true;
    $('#emptyState').hidden = false;
    return;
  }
  $('#checkoutWrap').hidden = false;
  $('#emptyState').hidden = true;

  $('#lines').innerHTML = list.map(lineHtml).join('');
  $('#sumCount').textContent = list.reduce((n, i) => n + i.qty, 0) + ' ΤΕΜ';

  const ship = state.catalog.config.shipping.find(s => s.id === state.shippingMethod);
  $('#totals').innerHTML = `
    <div class="pc-shop-totals-row"><span>ΠΡΟΪΟΝΤΑ</span><span>${fmtMoney(itemsTotal())}</span></div>
    <div class="pc-shop-totals-row"><span>ΜΕΤΑΦΟΡΙΚΑ${ship ? ' · ' + escapeHtml(ship.label).toUpperCase() : ''}</span><span>${ship && ship.cost === 0 ? 'ΔΩΡΕΑΝ' : fmtMoney(shipCost())}</span></div>
    <div class="pc-shop-totals-row grand"><span>ΣΥΝΟΛΟ</span><span>${fmtMoney(itemsTotal() + shipCost())}</span></div>`;

  /* Διεύθυνση: κρύβεται όταν ο τρόπος δεν τη χρειάζεται (παραλαβή) */
  $('#addrForm').style.display = ship && !ship.needsAddress ? 'none' : '';
}

function renderShipping() {
  const opts = state.catalog.config.shipping;
  state.shippingMethod = opts[0].id;
  $('#shipOptions').innerHTML = opts.map((s, i) => `
    <label class="pc-shop-ship-opt${i === 0 ? ' is-active' : ''}">
      <input type="radio" name="ship" value="${escapeHtml(s.id)}"${i === 0 ? ' checked' : ''} />
      <div class="pc-shop-ship-main">
        <div class="pc-shop-ship-label">${escapeHtml(s.label)}</div>
        <div class="pc-shop-ship-note">${escapeHtml(s.note || '')}</div>
      </div>
      <div class="pc-shop-ship-cost">${s.cost === 0 ? 'ΔΩΡΕΑΝ' : fmtMoney(Math.round(s.cost * 100))}</div>
    </label>`).join('');

  $('#shipOptions').addEventListener('change', e => {
    if (e.target.name !== 'ship') return;
    state.shippingMethod = e.target.value;
    $$('#shipOptions .pc-shop-ship-opt').forEach(el =>
      el.classList.toggle('is-active', el.querySelector('input').checked));
    render();
  });
}

function fieldVal(id) { return $('#' + id).value.trim(); }
function markField(id, bad) { $('#' + id).classList.toggle('is-error', bad); }

function validate() {
  const errors = [];
  const need = (id, label) => {
    const bad = !fieldVal(id);
    markField(id, bad);
    if (bad) errors.push(label);
  };
  need('fFullName', 'Ονοματεπώνυμο');
  need('fEmail', 'Email');
  need('fPhone', 'Τηλέφωνο');
  if (fieldVal('fEmail') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldVal('fEmail'))) {
    markField('fEmail', true);
    errors.push('Έγκυρο email');
  }
  const ship = state.catalog.config.shipping.find(s => s.id === state.shippingMethod);
  if (ship && ship.needsAddress) {
    need('fStreet', 'Διεύθυνση');
    need('fCity', 'Πόλη');
    need('fZip', 'Τ.Κ.');
  }
  return errors;
}

function showError(msg) {
  const box = $('#payError');
  box.innerHTML = msg;
  box.classList.add('is-on');
}

async function pay() {
  $('#payError').classList.remove('is-on');
  const errors = validate();
  if (errors.length) {
    showError('ΣΥΜΠΛΗΡΩΣΕ: ' + errors.map(escapeHtml).join(' · '));
    return;
  }
  const btn = $('#btnPay');
  btn.disabled = true;
  btn.innerHTML = 'ΣΥΝΔΕΣΗ ΜΕ VIVA… <span aria-hidden="true">⏳</span>';

  const payload = {
    customer: { fullName: fieldVal('fFullName'), email: fieldVal('fEmail'), phone: fieldVal('fPhone') },
    shippingMethod: state.shippingMethod,
    address: { street: fieldVal('fStreet'), city: fieldVal('fCity'), zip: fieldVal('fZip'), notes: fieldVal('fNotes') },
    items: items().map(i => ({ productId: i.productId, qty: i.qty, selections: i.selections }))
  };

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.redirectUrl) {
      showError(escapeHtml(data.error || 'ΚΑΤΙ ΠΗΓΕ ΣΤΡΑΒΑ — ΔΟΚΙΜΑΣΕ ΞΑΝΑ ΣΕ ΛΙΓΟ.'));
      btn.disabled = false;
      btn.innerHTML = 'ΠΛΗΡΩΜΗ <span aria-hidden="true">→</span>';
      return;
    }
    location.href = data.redirectUrl;
  } catch {
    showError('ΔΕΝ ΥΠΑΡΧΕΙ ΣΥΝΔΕΣΗ — ΕΛΕΓΞΕ ΤΟ ΙΝΤΕΡΝΕΤ ΣΟΥ ΚΑΙ ΔΟΚΙΜΑΣΕ ΞΑΝΑ.');
    btn.disabled = false;
    btn.innerHTML = 'ΠΛΗΡΩΜΗ <span aria-hidden="true">→</span>';
  }
}

async function init() {
  try {
    state.catalog = await loadProducts();
  } catch {
    $('#emptyState').hidden = false;
    return;
  }

  if (new URLSearchParams(location.search).get('buynow') === '1') {
    state.buyNow = buyNowGet();
  }

  renderShipping();
  render();

  $('#lines').addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    cartRemove(Number(rm.dataset.rm));
    render();
  });
  $('#btnPay').addEventListener('click', pay);
  $$('.pc-shop-input').forEach(el =>
    el.addEventListener('input', () => el.classList.remove('is-error')));
}

document.addEventListener('DOMContentLoaded', init);
})();
