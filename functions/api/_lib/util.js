/* ================================================================
   Κοινά helpers για τις Pages Functions
   ================================================================ */

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

/* Ο κατάλογος διαβάζεται από το ίδιο deployment (ASSETS binding),
   ώστε client & function να βλέπουν ΠΑΝΤΑ το ίδιο products.json. */
export async function readCatalog(env, request) {
  const url = new URL('/shop/products.json', request.url);
  const res = await env.ASSETS.fetch(url);
  if (!res.ok) throw new Error('catalog fetch failed: ' + res.status);
  return res.json();
}
