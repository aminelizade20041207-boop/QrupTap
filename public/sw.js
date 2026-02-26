
const CACHE_NAME = 'it24-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let userData = {
  profile: null,
  schedule: []
};

let sentNotifications = new Set();

// Install event - caching assets for offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serving from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
    console.log('SW: Məlumatlar sinxronlaşdırıldı', userData);
  }
});

// Background notification loop
function checkAndNotify() {
  if (!userData.profile || !userData.schedule.length) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // Həftə növünü müəyyən et
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  const todaysClasses = userData.schedule
    .filter(c => 
      Number(c.day) === currentDay && 
      (c.subgroup === 'hamisi' || c.subgroup === userData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((cls, index) => {
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTimeInMinutes = h * 60 + m;
    const diff = classTimeInMinutes - currentTimeInMinutes;

    const isFirstClass = index === 0;
    const settings = userData.profile.notificationSettings;

    if (!settings) return;

    // Kanal 1 Yoxlaması
    if (settings.firstChannel.enabled) {
      const triggerMinutes = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      if (diff === triggerMinutes && triggerMinutes > 0) {
        sendClassNotification(cls, diff, 'ch1');
      }
    }

    // Kanal 2 Yoxlaması
    if (settings.secondChannel.enabled) {
      const triggerMinutes = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diff === triggerMinutes && triggerMinutes > 0) {
        sendClassNotification(cls, diff, 'ch2');
      }
    }
  });
}

function sendClassNotification(cls, minutes, channelId) {
  const notifId = `${cls.id}-${cls.startTime}-${minutes}-${channelId}`;
  
  if (sentNotifications.has(notifId)) return;

  const title = minutes === 0 ? `Dərs Başladı: ${cls.name}` : `${minutes} dəqiqə qaldı: ${cls.name}`;
  const options = {
    body: `Otaq: ${cls.room || 'Təyin edilməyib'}. Vaxt: ${cls.startTime}`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    tag: 'class-reminder',
    renotify: true,
    data: { url: '/' }
  };

  self.registration.showNotification(title, options);
  sentNotifications.add(notifId);

  // 1 saat sonra köhnə bildiriş ID-sini sil
  setTimeout(() => sentNotifications.delete(notifId), 3600000);
}

// Hər 30 saniyədən bir yoxla
setInterval(checkAndNotify, 30000);

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/');
    })
  );
});
