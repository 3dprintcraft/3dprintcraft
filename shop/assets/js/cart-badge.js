/* Μετρητής καλαθιού για το landing — standalone, χωρίς εξαρτήσεις */
(() => {
  'use strict';
  let count = 0;
  try {
    const items = JSON.parse(localStorage.getItem('pc-cart-v1') || '[]');
    if (Array.isArray(items)) count = items.reduce((n, i) => n + (i.qty | 0), 0);
  } catch { /* κενό καλάθι */ }
  document.querySelectorAll('.pc-cart-badge').forEach(el => {
    el.textContent = count;
    el.hidden = count === 0;
  });
})();
