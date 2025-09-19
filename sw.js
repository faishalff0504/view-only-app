// Versi cache – ganti setiap kali kamu upload versi baru
const STATIC_CACHE = 'static-v0';

// File statis yang akan di-cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Install SW – cache file statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  // ⚠️ Jangan skipWaiting otomatis
});

// Activate SW – hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key.startsWith('static')) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event – network-first untuk HTML/JS, cache-first untuk lainnya
self.addEventListener('fetch', (evt) => {
  if (
    evt.request.mode === 'navigate' ||
    evt.request.url.endsWith('.html') ||
    evt.request.url.endsWith('.js')
  ) {
    evt.respondWith(
      fetch(evt.request)
        .then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(evt.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(evt.request))
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request))
  );
});

// Listener untuk pesan SKIP_WAITING manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
