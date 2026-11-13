/* Service worker de Vanguard Solutions.
 * - Hace instalable el sitio (PWA).
 * - Red primero: siempre intenta traer la versión más nueva; si no hay conexión,
 *   usa la copia guardada de las páginas ya visitadas.
 * - Solo toca peticiones del mismo origen (no Google, fuentes ni EmailJS).
 */
const CACHE = 'vanguard-v1';
const SHELL = ['/home/home.html', '/assets/icons/icon-192-v2.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/home/home.html') : undefined)))
  );
});
