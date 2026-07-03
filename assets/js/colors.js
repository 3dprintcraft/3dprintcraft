/* ================================================================
   3DPrintCraft — Palette page (colors.html)
   Renders the full colour palette, grouped by material category.
   ================================================================ */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     ΠΑΛΕΤΑ — δομή δεδομένων ανά κατηγορία υλικού.
     Κάθε χρώμα: ['Όνομα', '#hex']. Για διάφανο/clear βάλε 'NA' ως hex.
     Πρόσθεσε/αφαίρεσε κατηγορίες ή χρώματα ελεύθερα — το render προσαρμόζεται.
     ────────────────────────────────────────────────────────────── */
  const PALETTE = [
    {
      cat: 'PLA Basics',
      colors: [
        ['Jade White', '#FFFFFF'], ['Gold', '#E4BD68'], ['Silver', '#A6A9AA'], ['Gray', '#8E9089'],
        ['Bronze', '#847D48'], ['Cocoa Brown', '#6F5034'], ['Red', '#C12E1F'], ['Magenta', '#EC008C'],
        ['Pink', '#F55A74'], ['Orange', '#FF6A13'], ['Yellow', '#F4EE2A'], ['Bambu Green', '#00AE42'],
        ['Mistletoe Green', '#3F8E43'], ['Turquoise', '#00B1B7'], ['Cyan', '#0086D6'], ['Blue', '#0A2989'],
        ['Purple', '#5E43B7'], ['Black', '#000000'],
      ],
    },
    {
      cat: 'PLA Matte',
      colors: [
        ['Latte Brown', '#D3B7A7'], ['Desert Tan', '#E8DBB7'], ['Lilac Purple', '#AE96D4'],
        ['Sakura Pink', '#E8AFCF'], ['Mandarin Orange', '#F99963'], ['Dark Red', '#BB3D43'],
        ['Dark Brown', '#7D6556'], ['Dark Green', '#68724D'],
      ],
    },
    {
      cat: 'ABS',
      colors: [
        ['Tangerine Yellow', '#FFC72C'], ['Azure', '#489FDF'], ['White', '#FFFFFF'], ['Silver', '#87909A'],
        ['Red', '#D32941'], ['Orange', '#FF6A13'], ['Blue', '#0A2CA5'], ['Black', '#000000'],
      ],
    },
    {
      cat: 'PETG Translucent',
      colors: [
        ['Translucent Brown', '#C9A381'], ['Translucent Pink', '#F9C1BD'], ['Translucent Clear', 'NA'],
      ],
    },
    {
      cat: 'TPU',
      colors: [
        ['Black', '#000000'],
      ],
    },
    {
      cat: 'ASA',
      colors: [
        ['Black', '#000000'],
      ],
    },
    {
      cat: 'PA6-CF',
      colors: [
        ['Black', '#000000'],
      ],
    },
    {
      cat: 'ABS-GF',
      colors: [
        ['Black', '#000000'],
      ],
    },
  ];

  const root = document.getElementById('paletteRoot');
  const empty = document.getElementById('paletteEmpty');
  const countEl = document.getElementById('paletteCount');
  if (!root) return;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
  const isHex = (h) => /^#[0-9a-fA-F]{6}$/.test(h || '');

  /* Επιλογή σκούρου/ανοιχτού κειμένου ανάλογα με τη φωτεινότητα του χρώματος */
  const textOn = (hex) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.58 ? '#14161a' : '#f7f7f4';
  };

  let total = 0;
  const frag = document.createDocumentFragment();

  PALETTE.forEach((group) => {
    const colors = (group.colors || []).filter((c) => c && c[0]);
    if (!colors.length) return;
    total += colors.length;

    const section = document.createElement('div');
    section.className = 'pc-pal-cat';
    section.innerHTML =
      '<div class="pc-pal-cat-head">' +
        '<span class="pc-pal-cat-name">' + esc(group.cat) + '</span>' +
        '<span class="pc-pal-cat-count">' + colors.length + (colors.length === 1 ? ' ΧΡΩΜΑ' : ' ΧΡΩΜΑΤΑ') + '</span>' +
      '</div>' +
      '<div class="pc-pal-grid">' +
        colors.map((c) => {
          const name = esc(c[0]);
          const clear = !isHex(c[1]);
          const hex = clear ? '' : esc(c[1].toUpperCase());
          const style = clear ? '' : ' style="background:' + hex + ';color:' + textOn(hex) + '"';
          const meta = clear ? 'ΔΙΑΦΑΝΟ' : hex;
          return '<button type="button" class="pc-pal-card' + (clear ? ' is-clear no-copy' : '') + '"' + style +
            (clear ? '' : ' data-hex="' + hex + '" title="Αντιγραφή ' + hex + '"') + '>' +
            '<span class="pc-pal-name">' + name + '</span>' +
            '<span class="pc-pal-foot">' +
              '<span class="pc-pal-hex">' + meta + '</span>' +
              (clear ? '' : '<span class="pc-pal-copyhint" aria-hidden="true">⧉</span>') +
            '</span>' +
          '</button>';
        }).join('') +
      '</div>';
    frag.appendChild(section);
  });

  root.appendChild(frag);
  if (countEl) countEl.textContent = total;
  if (empty) empty.style.display = total ? 'none' : '';

  /* Click-to-copy του hex — feedback μόνο στη γωνία, χωρίς overlay πάνω στο κείμενο */
  root.addEventListener('click', (e) => {
    const card = e.target.closest('.pc-pal-card');
    if (!card || card.classList.contains('no-copy')) return;
    const hex = card.getAttribute('data-hex') || '';
    const hint = card.querySelector('.pc-pal-copyhint');
    const done = () => {
      card.classList.add('is-copied');
      if (hint) hint.textContent = '✓';
      clearTimeout(card._t);
      card._t = setTimeout(() => {
        card.classList.remove('is-copied');
        if (hint) hint.textContent = '⧉';
      }, 1100);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(done).catch(done);
    } else {
      done();
    }
  });
})();
