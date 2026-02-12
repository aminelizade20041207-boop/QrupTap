
const CACHE_NAME = 'it24-cache-v10'; // Versiyanı kəskin artırdıq
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/globals.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Köhnə SW-i dərhal əvəz et
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Yeni SW-i dərhal aktivləşdir
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Köhnə keş silinir:', cacheName);
              return caches.delete(cacheName);
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
        // Oflayn rejimdə əsas səhifəni qaytar
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
