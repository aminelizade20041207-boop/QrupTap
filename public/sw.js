
const CACHE_NAME = 'it24-cache-v3'; // Versiya yeniləndi
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://img.icons8.com/ios-filled/192/4A90E2/it.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Yeni Service Worker dərhal quraşdırılsın
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(), // Yeni Service Worker dərhal nəzarəti ələ alsın
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName); // Köhnə keşləri təmizlə
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
