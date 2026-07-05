/* ================================================================
   Server-side validation & pricing — pure module (καμία I/O)
   Η ΜΟΝΗ πηγή αλήθειας για ποσά είναι ο κατάλογος (products.json).
   Ό,τι ποσό στείλει ο client αγνοείται.
   ================================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CTRL_RE = /[\u0000-\u001F\u007F]/g;
const MAX_ITEMS = 20;
const MAX_QTY = 20;

function cleanText(v, maxLength) {
  return String(v).replace(CTRL_RE, '').trim().slice(0, maxLength);
}

/**
 * validateAndPrice(catalog, payload) →
 *   { ok, errors[], items[], itemsTotalCents, shippingCostCents, totalCents, shipping }
 * items: [{ productId, name, qty, selections, unitCents, lineCents, selectionText }]
 */
export function validateAndPrice(catalog, payload) {
  const errors = [];
  const fail = () => ({ ok: false, errors });

  if (!payload || typeof payload !== 'object') { errors.push('Άκυρο αίτημα.'); return fail(); }

  /* ── Πελάτης ── */
  const c = payload.customer;
  if (!c || typeof c !== 'object') errors.push('Λείπουν τα στοιχεία πελάτη.');
  else {
    if (!cleanText(c.fullName || '', 120)) errors.push('Λείπει το ονοματεπώνυμο.');
    if (!cleanText(c.phone || '', 30)) errors.push('Λείπει το τηλέφωνο.');
    if (!EMAIL_RE.test(String(c.email || ''))) errors.push('Μη έγκυρο email.');
  }

  /* ── Αποστολή ── */
  const shipping = (catalog.config.shipping || []).find(s => s.id === payload.shippingMethod);
  if (!shipping) errors.push('Μη έγκυρος τρόπος παραλαβής.');
  else if (shipping.needsAddress) {
    const a = payload.address || {};
    if (!cleanText(a.street || '', 200)) errors.push('Λείπει η διεύθυνση.');
    if (!cleanText(a.city || '', 100)) errors.push('Λείπει η πόλη.');
    if (!cleanText(a.zip || '', 12)) errors.push('Λείπει ο Τ.Κ.');
  }

  /* ── Προϊόντα ── */
  if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > MAX_ITEMS) {
    errors.push('Άκυρο καλάθι.');
    return fail();
  }

  const items = [];
  let itemsTotalCents = 0;

  for (const raw of payload.items) {
    const product = catalog.products.find(p => p.id === raw?.productId);
    if (!product) { errors.push('Άγνωστο προϊόν στο καλάθι.'); continue; }

    const qty = raw.qty;
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      errors.push(`Μη έγκυρη ποσότητα για «${product.name}».`);
      continue;
    }

    const rawSel = raw.selections && typeof raw.selections === 'object' ? raw.selections : {};
    const optIds = new Set((product.options || []).map(o => o.id));
    const unknown = Object.keys(rawSel).filter(k => !optIds.has(k));
    if (unknown.length) { errors.push(`Άγνωστη επιλογή για «${product.name}».`); continue; }

    const selections = {};
    const selectionText = [];
    let unitCents = Math.round(product.price * 100);
    let bad = false;

    for (const opt of product.options || []) {
      const val = rawSel[opt.id];
      if (opt.type === 'select') {
        const choice = (opt.choices || []).find(ch => ch.value === val);
        if (!choice) { errors.push(`Μη έγκυρη τιμή «${opt.label}» για «${product.name}».`); bad = true; break; }
        if (choice.priceDelta) unitCents += Math.round(choice.priceDelta * 100);
        selections[opt.id] = choice.value;
        selectionText.push(`${opt.label}: ${choice.label}`);
      } else { /* text */
        const text = val === undefined || val === null ? '' : cleanText(val, opt.maxLength || 200);
        if (opt.required && !text) { errors.push(`Λείπει το πεδίο «${opt.label}» για «${product.name}».`); bad = true; break; }
        if (String(val ?? '').trim().length > (opt.maxLength || 200)) { errors.push(`Πολύ μεγάλο κείμενο στο «${opt.label}».`); bad = true; break; }
        if (text) { selections[opt.id] = text; selectionText.push(`${opt.label}: ${text}`); }
      }
    }
    if (bad) continue;

    const lineCents = unitCents * qty;
    itemsTotalCents += lineCents;
    items.push({ productId: product.id, name: product.name, qty, selections, unitCents, lineCents, selectionText });
  }

  if (errors.length) return fail();

  const shippingCostCents = Math.round(shipping.cost * 100);
  return {
    ok: true,
    errors: [],
    items,
    itemsTotalCents,
    shippingCostCents,
    totalCents: itemsTotalCents + shippingCostCents,
    shipping: { id: shipping.id, label: shipping.label, needsAddress: !!shipping.needsAddress }
  };
}
