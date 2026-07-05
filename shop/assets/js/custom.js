/* ================================================================
   3DPrintCraft Shop — custom παραγγελία: validation + multipart POST
   ================================================================ */
(() => {
'use strict';
const { $, escapeHtml } = window.PCShop;

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXT = ['stl', 'step', 'obj', '3mf', 'jpg', 'jpeg', 'png', 'webp', 'pdf'];

function showError(msg) {
  const box = $('#sendError');
  box.innerHTML = msg;
  box.classList.add('is-on');
}

function fileError(file) {
  if (!file) return null;
  if (file.size > MAX_FILE_BYTES) return 'ΤΟ ΑΡΧΕΙΟ ΞΕΠΕΡΝΑ ΤΑ 50MB';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return 'ΜΗ ΑΠΟΔΕΚΤΟΣ ΤΥΠΟΣ ΑΡΧΕΙΟΥ';
  return null;
}

async function submit(e) {
  e.preventDefault();
  $('#sendError').classList.remove('is-on');

  const desc = $('#cDesc').value.trim();
  const name = $('#cName').value.trim();
  const email = $('#cEmail').value.trim();
  const phone = $('#cPhone').value.trim();
  const file = $('#cFile').files[0] || null;

  const errors = [];
  if (desc.length < 10) errors.push('Περιγραφή (λίγα λόγια παραπάνω)');
  if (!name) errors.push('Ονοματεπώνυμο');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Έγκυρο email');
  if (!phone) errors.push('Τηλέφωνο');
  const fErr = fileError(file);
  const fErrBox = $('#cFileErr');
  fErrBox.textContent = fErr || '';
  fErrBox.classList.toggle('is-on', !!fErr);
  if (fErr) errors.push('Αρχείο');
  if (errors.length) { showError('ΕΛΕΓΞΕ: ' + errors.map(escapeHtml).join(' · ')); return; }

  const btn = $('#btnSend');
  btn.disabled = true;
  btn.innerHTML = 'ΑΠΟΣΤΟΛΗ… <span aria-hidden="true">⏳</span>';

  const fd = new FormData();
  fd.set('description', desc);
  fd.set('fullName', name);
  fd.set('email', email);
  fd.set('phone', phone);
  fd.set('website', $('#cWebsite').value); /* honeypot */
  if (file) fd.set('file', file);

  try {
    const res = await fetch('/api/custom-order', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showError(escapeHtml(data.error || 'ΚΑΤΙ ΠΗΓΕ ΣΤΡΑΒΑ — ΔΟΚΙΜΑΣΕ ΞΑΝΑ.'));
      btn.disabled = false;
      btn.innerHTML = 'ΣΤΕΙΛΕ ΤΟ <span aria-hidden="true">→</span>';
      return;
    }
    $('#customForm').hidden = true;
    $('#sentOk').hidden = false;
  } catch {
    showError('ΔΕΝ ΥΠΑΡΧΕΙ ΣΥΝΔΕΣΗ — ΔΟΚΙΜΑΣΕ ΞΑΝΑ.');
    btn.disabled = false;
    btn.innerHTML = 'ΣΤΕΙΛΕ ΤΟ <span aria-hidden="true">→</span>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('#customForm').addEventListener('submit', submit);
});
})();
