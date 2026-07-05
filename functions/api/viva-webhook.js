/* ================================================================
   /api/viva-webhook
   GET  → verification key (η Viva το καλεί όταν δηλώνεται το webhook)
   POST → EventTypeId 1796 (Transaction Payment Created):
          re-verify στη Viva → emails (owner + πελάτης) → idempotency flag.
   Επιστρέφει ΠΑΝΤΑ 200 ώστε η Viva να μην κάνει άσκοπα retries.
   ================================================================ */
import { json } from './_lib/util.js';
import { getTransaction, getWebhookVerificationKey } from './_lib/viva.js';
import { sendEmail, ownerOrderEmail, customerConfirmationEmail } from './_lib/email.js';

const EVENT_PAYMENT_CREATED = 1796;
const EVENT_TRANSACTION_FAILED = 1798;

export async function onRequestGet({ env }) {
  try {
    const key = await getWebhookVerificationKey(env);
    return json(200, { Key: key });
  } catch (e) {
    console.error('webhook key fetch failed', e);
    return json(200, { Key: '' });
  }
}

export async function onRequestPost({ request, env }) {
  let event;
  try { event = await request.json(); }
  catch { return json(200, { ok: false }); }

  const type = event?.EventTypeId;
  const data = event?.EventData || {};

  if (type === EVENT_TRANSACTION_FAILED) {
    console.log('[VIVA] transaction failed', data.OrderCode, data.TransactionId);
    return json(200, { ok: true });
  }
  if (type !== EVENT_PAYMENT_CREATED) return json(200, { ok: true, ignored: type });

  const orderCode = String(data.OrderCode || '');
  const transactionId = String(data.TransactionId || '');
  if (!orderCode) return json(200, { ok: false, reason: 'no orderCode' });

  /* ── Φόρτωση παραγγελίας από KV (με 1 retry για eventual consistency) ── */
  let record = await getOrder(env, orderCode);
  if (!record) {
    await new Promise(r => setTimeout(r, 2000));
    record = await getOrder(env, orderCode);
  }
  if (!record) {
    console.error('[VIVA] order not found in KV:', orderCode, '— δες το Viva dashboard');
    return json(200, { ok: false, reason: 'order not in KV' });
  }

  /* ── Idempotency: αν έχουν ήδη σταλεί emails, τέλος ── */
  if (record.emailedAt) return json(200, { ok: true, already: true });

  /* ── Επαλήθευση: τα webhooks δεν είναι signed — ρωτάμε τη Viva ── */
  if (env.VIVA_CLIENT_ID && transactionId) {
    try {
      const tx = await getTransaction(env, transactionId);
      const paid = tx.statusId === 'F';
      const amountCents = Math.round(Number(tx.amount) * 100);
      if (!paid || amountCents !== record.totalCents) {
        console.error('[VIVA] verification mismatch', { orderCode, paid, amountCents, expected: record.totalCents });
        return json(200, { ok: false, reason: 'verification failed' });
      }
    } catch (e) {
      console.error('[VIVA] transaction verification error', e);
      return json(200, { ok: false, reason: 'verification error' });
    }
  }

  /* ── Emails ── */
  const owner = ownerOrderEmail(orderCode, record, transactionId);
  await sendEmail(env, { to: env.OWNER_EMAIL || 'contactprintcraft3d@gmail.com', ...owner });
  const cust = customerConfirmationEmail(orderCode, record);
  await sendEmail(env, { to: record.customer.email, ...cust });

  record.emailedAt = new Date().toISOString();
  record.transactionId = transactionId;
  if (env.ORDERS) await env.ORDERS.put('order:' + orderCode, JSON.stringify(record));

  return json(200, { ok: true });
}

async function getOrder(env, orderCode) {
  if (!env.ORDERS) return null;
  const raw = await env.ORDERS.get('order:' + orderCode);
  return raw ? JSON.parse(raw) : null;
}
