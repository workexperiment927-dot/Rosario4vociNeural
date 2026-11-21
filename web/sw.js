const CACHE_SHELL = 'rosario-shell-v3';
const CACHE_AUDIO = 'rosario-audio-v1';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/schema-preghiere-istruzioni.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_SHELL && k !== CACHE_AUDIO)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cache-first for MP3 neural audio files (same-origin /audio/*)
  if (url.origin === self.location.origin && url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.open(CACHE_AUDIO).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const fresh = await fetch(req);
        if (fresh.ok && fresh.status === 200) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      })
    );
    return;
  }

  // Network-first with cache fallback for shell assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_SHELL).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/index.html')))
    );
  }
});
