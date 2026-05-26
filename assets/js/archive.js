/* 3DPrintCraft — archive gallery (vanilla)
   Πηγές εικόνων (με σειρά προτεραιότητας):
     1) Google Drive  (αν συμπληρωθεί το DRIVE παρακάτω) — ζωντανά, χωρίς script
     2) manifest.json (από tools/build-archive.ps1) — δουλεύει σε κάθε host
     3) directory listing (τοπικά, πριν τρέξει το script)
   Υποφάκελοι = κατηγορίες (sticky φίλτρα). + κουμπί επιστροφής στην κορυφή. */
(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     ΡΥΘΜΙΣΗ GOOGLE DRIVE  (προαιρετικό — για ζωντανό αρχείο χωρίς script)
     Συμπλήρωσε τα 2 πεδία και οι φωτό διαβάζονται από δημόσιο φάκελο Drive.
     Υποφάκελοι μέσα στον φάκελο = κατηγορίες. Οδηγίες: τέλος αρχείου.
     Αν μείνουν κενά → διαβάζει τοπικά από assets/img/archive/.
     ═══════════════════════════════════════════════════════════════ */
  const DRIVE = {
    apiKey:   'AIzaSyAYtszz8VW7Jqu6biQCejNBGVoCEOmqFZ8',
    folderId: '1-sCENBeEktIPxK1ryKdqijKFuqLMrtkk'  // δημόσιος φάκελος Drive
  };

  const grid    = document.getElementById('archiveGrid');
  if (!grid) return;
  const empty   = document.getElementById('archiveEmpty');
  const count   = document.getElementById('archiveCount');
  const catsBar = document.getElementById('archiveCats');

  const BASE = 'assets/img/archive/';
  const IMG_RE = /\.(jpe?g|png|webp|avif|gif)$/i;
  const ALL_LABEL = 'Όλα';

  /* κρατάμε το ύψος του fixed header σε CSS var, ώστε η sticky μπάρα να κάθεται από κάτω του */
  const setGantryH = () => {
    const h = document.getElementById('top');
    if (h) document.documentElement.style.setProperty('--gantry-h', h.offsetHeight + 'px');
  };
  setGantryH();
  addEventListener('resize', setGantryH);
  addEventListener('load', setGantryH);

  let ALL = [];
  let active = ALL_LABEL;

  const url = (src) =>
    /^https?:/.test(src) ? src : BASE + String(src).split('/').map(encodeURIComponent).join('/');

  const draw = () => {
    if (count) count.textContent = String(ALL.length);
    const items = active === ALL_LABEL ? ALL : ALL.filter((it) => (it.cat || '') === active);
    if (!ALL.length) { grid.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = items.map((it, i) => {
      const o = typeof it === 'string' ? { src: it } : it;
      const dim = (o.w && o.h) ? (' width="' + o.w + '" height="' + o.h + '"') : '';
      const n = String(i + 1).padStart(3, '0');
      return '<figure class="pc-arch-item">' +
               '<img src="' + url(o.src) + '"' + dim + ' alt="Έργο 3DPrintCraft #' + n + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
               '<figcaption>#' + n + '</figcaption>' +
             '</figure>';
    }).join('');
  };

  const buildCats = () => {
    if (!catsBar) return;
    catsBar.innerHTML = '';
    const cats = Array.from(new Set(ALL.map((it) => (it && it.cat) || '').filter(Boolean)));
    if (!cats.length) { catsBar.hidden = true; return; }
    catsBar.hidden = false;
    [ALL_LABEL].concat(cats).forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pc-arch-cat' + (c === active ? ' is-active' : '');
      btn.textContent = c;
      btn.addEventListener('click', () => {
        active = c;
        catsBar.querySelectorAll('.pc-arch-cat').forEach((b) => b.classList.toggle('is-active', b === btn));
        draw();
        const gh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gantry-h')) || 76;
        const top = document.getElementById('archive').getBoundingClientRect().top + scrollY - gh - 8;
        if (scrollY > top) scrollTo({ top: top, behavior: 'smooth' });
      });
      catsBar.appendChild(btn);
    });
  };

  const render = (items) => { ALL = Array.isArray(items) ? items : []; active = ALL_LABEL; buildCats(); draw(); };

  /* ── 1) Google Drive ── */
  const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
  const driveList = (q) =>
    fetch(DRIVE_API + '?q=' + encodeURIComponent(q) +
          '&key=' + encodeURIComponent(DRIVE.apiKey) +
          '&fields=' + encodeURIComponent('files(id,name,mimeType,imageMediaMetadata(width,height))') +
          '&pageSize=1000&orderBy=name')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('drive ' + r.status))))
      .then((d) => d.files || []);
  const driveImg = (id, w) => 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + (w || 1200);

  const fromDrive = () =>
    driveList("'" + DRIVE.folderId + "' in parents and trashed=false").then((children) => {
      const isFolder = (f) => f.mimeType === 'application/vnd.google-apps.folder';
      const items = [];
      const push = (f, cat) => items.push({
        src: driveImg(f.id, 1200),
        w: f.imageMediaMetadata && f.imageMediaMetadata.width,
        h: f.imageMediaMetadata && f.imageMediaMetadata.height,
        cat: cat
      });
      children.filter((f) => /^image\//.test(f.mimeType)).forEach((f) => push(f, ''));
      const folders = children.filter(isFolder);
      return Promise.all(folders.map((folder) =>
        driveList("'" + folder.id + "' in parents and trashed=false and mimeType contains 'image/'")
          .then((imgs) => imgs.forEach((f) => push(f, folder.name)))
      )).then(() => items);
    });

  /* ── 2) manifest.json ── */
  const fromManifest = () =>
    fetch(BASE + 'manifest.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no manifest'))))
      .then((d) => (Array.isArray(d) ? d : (d && d.images) || []));

  /* ── 3) directory listing (τοπικά) ── */
  const fromListing = () =>
    fetch(BASE, { cache: 'no-store' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('no listing'))))
      .then((html) => {
        const hrefs = Array.prototype.map.call(html.matchAll(/href="([^"]+)"/g), (m) => m[1]);
        const files = hrefs
          .map((h) => decodeURIComponent(h.split('/').pop().split('?')[0]))
          .filter((h) => IMG_RE.test(h));
        return Array.from(new Set(files)).map((f) => ({ src: f, cat: '' }));
      });

  const local  = () => fromManifest().then((i) => (i.length ? i : fromListing()));
  const useDrive = DRIVE.apiKey && DRIVE.folderId;
  const loader = useDrive ? fromDrive().catch(local) : local();
  loader.catch(() => []).then(render);
})();

/* ═══════════════════════════════════════════════════════════════════════
   ΟΔΗΓΙΕΣ GOOGLE DRIVE (μία φορά setup — μετά δεν ξανατρέχεις τίποτα)
   ───────────────────────────────────────────────────────────────────────
   1) ΦΑΚΕΛΟΣ: Φτιάξε στο Google Drive έναν φάκελο (π.χ. "3DPC Αρχείο").
      Μέσα του βάλε ΥΠΟΦΑΚΕΛΟΥΣ για κατηγορίες (π.χ. Μπρελόκ, Φωτιστικά)
      και ρίξε εκεί τις φωτογραφίες. Φωτό στη ρίζα → κατηγορία "Όλα".
   2) ΔΗΜΟΣΙΟΣ: Δεξί κλικ στον φάκελο → Κοινή χρήση → "Όποιος έχει τον
      σύνδεσμο" = Θεατής. Αντίγραψε το ID από το URL:
      drive.google.com/drive/folders/ΑΥΤΟ_ΕΙΝΑΙ_ΤΟ_ID
   3) API KEY (δωρεάν): console.cloud.google.com → νέο project →
      "APIs & Services" → Enable APIs → ενεργοποίησε "Google Drive API" →
      Credentials → Create credentials → API key. (Προαιρετικά: περιόρισέ το
      σε "Google Drive API" και στο domain σου.)
   4) Συμπλήρωσε πιο πάνω:  apiKey: '...'   και   folderId: '...'
   Έτοιμο: ρίχνεις φωτό στο Drive (ακόμη κι από κινητό) και εμφανίζονται μόνες.
   ═══════════════════════════════════════════════════════════════════════ */
