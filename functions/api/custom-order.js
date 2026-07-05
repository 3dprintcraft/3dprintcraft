/* ================================================================
   POST /api/custom-order
   Φόρμα custom παραγγελίας: περιγραφή + στοιχεία + προαιρετικό
   αρχείο (STL/εικόνα). Το αρχείο πάει σε R2 με UUID όνομα και ο
   ιδιοκτήτης παίρνει email με link. Honeypot κατά των bots.
   ================================================================ */
import { json, escapeHtml } from './_lib/util.js';
import { sendEmail } from './_lib/email.js';

const MAX_FILE_BYTES = 50 * 1024 * 1024; /* 50MB */
const ALLOWED_EXT = new Set(['stl', 'step', 'obj', '3mf', 'jpg', 'jpeg', 'png', 'webp', 'pdf']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let form;
  try { form = await request.formData(); }
  catch { return json(400, { error: 'Άκυρο αίτημα.' }); }

  /* Honeypot: αν το κρυφό πεδίο έχει τιμή, είναι bot — σιωπηλό "ok" */
  if (String(form.get('website') || '')) return json(200, { ok: true });

  const fullName = String(form.get('fullName') || '').trim().slice(0, 120);
  const email = String(form.get('email') || '').trim().slice(0, 200);
  const phone = String(form.get('phone') || '').trim().slice(0, 30);
  const description = String(form.get('description') || '').trim().slice(0, 3000);

  const errors = [];
  if (!fullName) errors.push('Λείπει το ονοματεπώνυμο.');
  if (!EMAIL_RE.test(email)) errors.push('Μη έγκυρο email.');
  if (!phone) errors.push('Λείπει το τηλέφωνο.');
  if (description.length < 10) errors.push('Γράψε λίγα λόγια παραπάνω για την ιδέα σου.');
  if (errors.length) return json(400, { error: errors.join(' ') });

  /* ── Αρχείο (προαιρετικό) ── */
  let fileInfo = null;
  const file = form.get('file');
  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return json(400, { error: 'Το αρχείο ξεπερνά τα 50MB.' });
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return json(400, { error: 'Μη αποδεκτός τύπος αρχείου. Δεκτά: STL, STEP, OBJ, 3MF, JPG, PNG, WEBP, PDF.' });

    if (env.UPLOADS) {
      const key = `custom/${crypto.randomUUID()}.${ext}`;
      await env.UPLOADS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' }
      });
      const base = env.R2_PUBLIC_BASE || '';
      fileInfo = { key, name: file.name, size: file.size, url: base ? `${base.replace(/\/$/, '')}/${key}` : null };
    } else {
      console.warn('UPLOADS R2 not bound — file skipped');
      fileInfo = { key: null, name: file.name, size: file.size, url: null };
    }
  }

  /* ── Email στον ιδιοκτήτη ── */
  const fileLine = fileInfo
    ? `<p style="font-size:13px"><b>Αρχείο:</b> ${escapeHtml(fileInfo.name)} (${(fileInfo.size / 1024 / 1024).toFixed(1)}MB)<br />${fileInfo.url ? `<a href="${escapeHtml(fileInfo.url)}">${escapeHtml(fileInfo.url)}</a>` : `R2 key: ${escapeHtml(fileInfo.key || '—')}`}</p>`
    : '<p style="font-size:13px">Χωρίς αρχείο.</p>';

  await sendEmail(env, {
    to: env.OWNER_EMAIL || 'contactprintcraft3d@gmail.com',
    subject: `🛠️ Custom παραγγελία από ${fullName}`,
    html: `<!doctype html><html lang="el"><body style="font-family:monospace;padding:24px;background:#f7f7f4;color:#14161a">
      <div style="max-width:560px;margin:0 auto;border:2px solid #14161a;background:#fff">
      <div style="background:#14161a;color:#f7f7f4;padding:12px 18px;font-weight:bold;letter-spacing:2px">3DPRINTCRAFT · CUSTOM</div>
      <div style="padding:20px">
        <h2 style="margin:0 0 12px">Νέο αίτημα custom εκτύπωσης</h2>
        <p style="font-size:13px"><b>${escapeHtml(fullName)}</b><br />${escapeHtml(email)} · ${escapeHtml(phone)}</p>
        <p style="font-size:13px;white-space:pre-wrap;border:1px dashed #999;padding:12px">${escapeHtml(description)}</p>
        ${fileLine}
        <p style="font-size:12px;color:#555">Απάντησε στον πελάτη με προσφορά και Viva payment link.</p>
      </div></div></body></html>`
  });

  return json(200, { ok: true });
}
