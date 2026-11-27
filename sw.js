// LuJa service worker.
// - The app's own files: network first (max ~3s), so phones always get the
//   newest version; the saved copy is used when offline or the network is slow.
// - Fonts and the Supabase library: saved copy first (they never change).
// - When a new version installs, every open LuJa window reloads into it.
const CACHE = 'luja-v8';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'sync.js', 'config.js', 'icon.svg', 'icon-180.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const hadOld = keys.some(k => k !== CACHE);
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    if (hadOld) {
      // pages still running an older version: reload them into this one
      const wins = await self.clients.matchAll({ type: 'window' });
      for (const w of wins) w.navigate(w.url).catch(() => {});
    }
  })());
});

const ownFile = url => url.origin === location.origin;
const staticLib = url => url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com') || url.host === 'cdn.jsdelivr.net';

function timeout(ms) { return new Promise(r => setTimeout(() => r(null), ms)); }

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (staticLib(url)) {
    e.respondWith(caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (!ownFile(url)) return;

  const key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const net = fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    const res = await Promise.race([net, timeout(3000)]);
    if (res) return res;
    const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
    if (cached) { e.waitUntil(net); return cached; }
    return (await net) || Response.error();
  }));
});
