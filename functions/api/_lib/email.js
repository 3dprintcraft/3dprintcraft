/* ================================================================
   Emails μέσω Resend — με console fallback όταν λείπει το key,
   ώστε η ροή πληρωμής να μην μπλοκάρει ΠΟΤΕ από email αποτυχία.
   ================================================================ */
import { escapeHtml } from './util.js';

const RESEND_URL = 'https://api.resend.com/emails';

/* Sender: μέχρι να γίνει verify το domain στο Resend χρησιμοποιείται
   το onboarding sender (δουλεύει μόνο προς τον λογαριασμό του owner). */
function sender(env) {
  return env.EMAIL_FROM || '3DPrintCraft <onboarding@resend.dev>';
}

export async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) {
    console.log('[MOCK EMAIL]', JSON.stringify({ to, subject }), html.slice(0, 400));
    return { mocked: true };
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: sender(env), to: [to], subject, html })
    });
    if (!res.ok) console.error('resend failed', res.status, await res.text());
    return { ok: res.ok };
  } catch (e) {
    console.error('resend error', e);
    return { ok: false };
  }
}

/* ── HTML builders — ΟΛΑ τα user-supplied κείμενα περνούν escapeHtml ── */

const wrap = body => `<!doctype html><html lang="el"><body style="font-family:monospace;background:#f7f7f4;color:#14161a;padding:24px">
<div style="max-width:560px;margin:0 auto;border:2px solid #14161a;background:#fff">
<div style="background:#14161a;color:#f7f7f4;padding:12px 18px;font-weight:bold;letter-spacing:2px">3DPRINTCRAFT · SHOP</div>
<div style="padding:20px">${body}</div>
<div style="padding:12px 18px;border-top:1px solid #14161a;font-size:11px;color:#7a7d85">3DPrintCraft · Πάτρα · contactprintcraft3d@gmail.com</div>
</div></body></html>`;

const money = cents => (cents / 100).toFixed(2).replace('.', ',') + ' €';

function itemsTable(order) {
  const rows = order.items.map(it => `
    <tr>
      <td style="padding:8px;border-bottom:1px dashed #ccc;vertical-align:top">
        <b>${escapeHtml(it.name)}</b> × ${it.qty}<br />
        <span style="font-size:11px;color:#555">${it.selectionText.map(escapeHtml).join('<br />')}</span>
      </td>
      <td style="padding:8px;border-bottom:1px dashed #ccc;text-align:right;vertical-align:top">${money(it.lineCents)}</td>
    </tr>`).join('');
  const discountRow = order.discountCents > 0
    ? `<tr><td style="padding:8px;text-align:right;color:#1e5eff">Κουπόνι ${escapeHtml(order.couponCode || '')}</td>
        <td style="padding:8px;text-align:right;color:#1e5eff">−${money(order.discountCents)}</td></tr>`
    : '';
  return `<table style="width:100%;border-collapse:collapse;font-size:13px">${rows}
    ${discountRow}
    <tr><td style="padding:8px;text-align:right">Μεταφορικά (${escapeHtml(order.shipping.label)})</td>
        <td style="padding:8px;text-align:right">${order.shippingCostCents === 0 ? 'ΔΩΡΕΑΝ' : money(order.shippingCostCents)}</td></tr>
    <tr><td style="padding:8px;text-align:right;font-weight:bold;border-top:2px solid #14161a">ΣΥΝΟΛΟ</td>
        <td style="padding:8px;text-align:right;font-weight:bold;border-top:2px solid #14161a">${money(order.totalCents)}</td></tr>
  </table>`;
}

export function ownerOrderEmail(orderCode, order, transactionId) {
  const a = order.address;
  const addr = a
    ? `${escapeHtml(a.street)}, ${escapeHtml(a.city)} ${escapeHtml(a.zip)}${a.notes ? '<br />Σημειώσεις: ' + escapeHtml(a.notes) : ''}`
    : 'Παραλαβή από το εργαστήριο';
  return {
    subject: `💰 Νέα παραγγελία #${orderCode} — ${money(order.totalCents)}`,
    html: wrap(`
      <h2 style="margin:0 0 4px">Νέα πληρωμένη παραγγελία</h2>
      <p style="font-size:12px;margin:0 0 16px;color:#555">#${escapeHtml(String(orderCode))} · TX ${escapeHtml(String(transactionId || '—'))} · ${escapeHtml(order.createdAt)}</p>
      ${itemsTable(order)}
      <h3 style="margin:18px 0 6px">Πελάτης</h3>
      <p style="font-size:13px;margin:0">
        ${escapeHtml(order.customer.fullName)}<br />
        ${escapeHtml(order.customer.email)} · ${escapeHtml(order.customer.phone)}<br />
        <b>${escapeHtml(order.shipping.label)}</b><br />${addr}
      </p>`)
  };
}

export function customerConfirmationEmail(orderCode, order) {
  return {
    subject: `Η παραγγελία σου στο 3DPrintCraft επιβεβαιώθηκε (#${orderCode})`,
    html: wrap(`
      <h2 style="margin:0 0 12px">Ευχαριστούμε, ${escapeHtml(order.customer.fullName)}!</h2>
      <p style="font-size:13px">Η πληρωμή σου ολοκληρώθηκε και η παραγγελία <b>#${escapeHtml(String(orderCode))}</b> μπήκε στη σειρά εκτύπωσης. Θα σε ενημερώσουμε όταν φύγει το δέμα.</p>
      ${itemsTable(order)}
      <p style="font-size:12px;color:#555">Τρόπος παραλαβής: <b>${escapeHtml(order.shipping.label)}</b></p>
      <p style="font-size:12px;color:#555">Για οποιαδήποτε αλλαγή απάντησε σε αυτό το email ή γράψε μας στο contactprintcraft3d@gmail.com.</p>`)
  };
}
