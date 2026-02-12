
const CACHE_NAME = 'it24-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/globals.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://placehold.co/192x192/4A90E2/ffffff.png?text=IT24',
  'https://placehold.co/512x512/4A90E2/ffffff.png?text=IT24'
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
  // Oflayn işləmək üçün şəbəkə sorğularını keşləyirik
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Əgər həm keşdə yoxdursa, həm də internet yoxdursa, əsas səhifəni qaytar
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
