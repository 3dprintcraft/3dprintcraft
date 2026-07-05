/* ================================================================
   POST /api/checkout
   Επικυρώνει το καλάθι server-side, δημιουργεί payment order στη
   Viva (ή mock χωρίς credentials), αποθηκεύει την παραγγελία σε KV
   και επιστρέφει το redirect URL του Smart Checkout.
   ================================================================ */
import { validateAndPrice } from './_lib/pricing.js';
import { json, readCatalog } from './_lib/util.js';
import { createPaymentOrder, checkoutRedirectUrl } from './_lib/viva.js';

const ORDER_TTL_SECONDS = 30 * 24 * 3600; /* 30 μέρες */

export async function onRequestPost({ request, env }) {
  let payload;
  try { payload = await request.json(); }
  catch { return json(400, { error: 'Άκυρο αίτημα.' }); }

  let catalog;
  try { catalog = await readCatalog(env, request); }
  catch (e) {
    console.error('catalog read failed', e);
    return json(500, { error: 'Προσωρινό πρόβλημα — δοκίμασε ξανά σε λίγο.' });
  }

  const priced = validateAndPrice(catalog, payload);
  if (!priced.ok) return json(400, { error: priced.errors.join(' ') });

  const orderRecord = {
    createdAt: new Date().toISOString(),
    customer: {
      fullName: String(payload.customer.fullName).slice(0, 120),
      email: String(payload.customer.email).slice(0, 200),
      phone: String(payload.customer.phone).slice(0, 30)
    },
    shipping: priced.shipping,
    address: priced.shipping.needsAddress ? {
      street: String(payload.address?.street || '').slice(0, 200),
      city: String(payload.address?.city || '').slice(0, 100),
      zip: String(payload.address?.zip || '').slice(0, 12),
      notes: String(payload.address?.notes || '').slice(0, 300)
    } : null,
    items: priced.items,
    itemsTotalCents: priced.itemsTotalCents,
    shippingCostCents: priced.shippingCostCents,
    totalCents: priced.totalCents
  };

  /* ── Mock mode: χωρίς Viva credentials (τοπική ανάπτυξη) ── */
  if (!env.VIVA_CLIENT_ID) {
    const mockCode = 'MOCK-' + Date.now();
    await putOrder(env, mockCode, orderRecord);
    console.log('[MOCK CHECKOUT] order', mockCode, 'total', priced.totalCents, JSON.stringify(orderRecord.items));
    return json(200, { redirectUrl: `/shop/thanks.html?mock=1&t=mock&s=${mockCode}` });
  }

  /* ── Πραγματική Viva ── */
  try {
    const orderCode = await createPaymentOrder(env, {
      amountCents: priced.totalCents,
      customer: orderRecord.customer,
      description: `3DPrintCraft — παραγγελία ${priced.items.reduce((n, i) => n + i.qty, 0)} τεμ.`
    });
    await putOrder(env, String(orderCode), orderRecord);
    return json(200, { redirectUrl: checkoutRedirectUrl(env, orderCode) });
  } catch (e) {
    console.error('viva order creation failed', e);
    return json(502, { error: 'Η σύνδεση με τον πάροχο πληρωμών απέτυχε — δοκίμασε ξανά σε λίγο.' });
  }
}

async function putOrder(env, orderCode, record) {
  if (!env.ORDERS) { console.warn('ORDERS KV not bound — order not persisted'); return; }
  await env.ORDERS.put('order:' + orderCode, JSON.stringify(record), { expirationTtl: ORDER_TTL_SECONDS });
}
