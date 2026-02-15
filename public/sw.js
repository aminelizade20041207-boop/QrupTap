
/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'it24-v2';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

// Arxa fon bildiriş məntiqi
let profile = null;
let schedule = [];
let sentNotifications = new Set();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    profile = event.data.payload.profile;
    schedule = event.data.payload.schedule;
    // Data yenilənəndə göndərilmişləri təmizlə ki, yeni ayarlarla gəlsin
    sentNotifications.clear();
  }
});

function checkSchedule() {
  if (!profile || !schedule || !profile.notificationSettings) return;

  const now = new Date();
  const dayIdx = now.getDay(); 
  
  // Cari həftə növünü hesabla
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Bu günün dərslərini tap və sırala
  const todaysClasses = schedule
    .filter(c => 
      Number(c.day) === dayIdx &&
      (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((cls, index) => {
    const isFirstClass = index === 0;
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(h, m, 0, 0);

    const diffInMs = classTime.getTime() - now.getTime();
    const diffInMin = Math.floor(diffInMs / (1000 * 60));

    // Bildiriş kanallarını yoxla
    const channels = [
      { settings: profile.notificationSettings.firstChannel, id: 'c1' },
      { settings: profile.notificationSettings.secondChannel, id: 'c2' }
    ];

    channels.forEach((channel) => {
      if (!channel.settings || !channel.settings.enabled) return;

      const targetMin = isFirstClass ? channel.settings.firstClassMinutes : channel.settings.otherClassesMinutes;
      
      // Əgər vaxt tam uyğundursa bildiriş göndər
      if (diffInMin === targetMin && diffInMin >= 0) {
        const uniqueId = `${cls.id}-${channel.id}-${targetMin}`;
        if (!sentNotifications.has(uniqueId)) {
          showNotification(cls);
          sentNotifications.add(uniqueId);
        }
      }
    });
  });
}

function showNotification(cls) {
  const parts = cls.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
  const room = cls.room || 'Naməlum';

  self.registration.showNotification('İT24 Xatırlatma', {
    body: `Sonrakı dərs: ${name} (${type}). Otaq: ${room}`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/96x96/4A90E2/ffffff?text=IT24',
    tag: `class-${cls.id}`,
    renotify: true
  });
}

// Hər 30 saniyədən bir arxa fonda yoxla
setInterval(checkSchedule, 30000);
