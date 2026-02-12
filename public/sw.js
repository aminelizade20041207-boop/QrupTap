
const CACHE_NAME = 'it24-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Oflayn rejimdə tətbiqin donmaması üçün "Cache First, then Network" strategiyası
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Yalnız uğurlu müraciətləri keşə əlavə et
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Əgər həm şəbəkə, həm də keş yoxdursa və bu bir səhifə müraciətidirsə, əsas səhifəni qaytar
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
