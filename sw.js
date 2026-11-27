// Offline-first: the app opens instantly from the cache, then quietly
// fetches any update in the background (used on the next launch).
const CACHE = 'luja-v4';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'icon.svg', 'icon-180.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const cacheable = url => url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!cacheable(url)) return;
  // every page navigation is served by the cached app shell
  const key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    const update = fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(update); return cached; }
    return (await update) || (await cache.match('index.html')) || Response.error();
  }));
});
