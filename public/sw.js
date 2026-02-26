
const CACHE_NAME = 'it24-cache-v2';
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

let userProfile = null;
let classSchedule = [];
let notifiedIds = new Set();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userProfile = event.data.payload.profile;
    classSchedule = event.data.payload.schedule;
    console.log('SW Sinxronizasiya Tamamlandı');
  }
});

function checkSchedule() {
  if (!userProfile || !classSchedule || classSchedule.length === 0) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const totalMinutesNow = currentHours * 60 + currentMinutes;

  // Həftə növünü hesabla
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeekType = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Bugünkü dərsləri tap və sırala
  const todaysClasses = classSchedule.filter(c => 
    Number(c.day) === todayIdx &&
    (c.subgroup === 'hamisi' || c.subgroup === userProfile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeekType)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((c, index) => {
    const [startH, startM] = c.startTime.split(':').map(Number);
    const totalStartMinutes = startH * 60 + startM;
    const diff = totalStartMinutes - totalMinutesNow;

    const isFirstClass = index === 0;
    const settings = userProfile.notificationSettings;
    
    if (!settings) return;

    // Kanal 1
    if (settings.firstChannel.enabled) {
      const trigger = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      if (diff === trigger && trigger > 0) {
        sendNotification(c, trigger, 'ch1');
      }
    }

    // Kanal 2
    if (settings.secondChannel.enabled) {
      const trigger = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diff === trigger && trigger > 0) {
        sendNotification(c, trigger, 'ch2');
      }
    }
  });
}

function sendNotification(classSession, minutes, channelTag) {
  const notificationId = `${classSession.id}-${channelTag}-${minutes}-${new Date().toDateString()}`;
  if (notifiedIds.has(notificationId)) return;

  notifiedIds.add(notificationId);
  
  const parts = classSession.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : 'Dərs';

  self.registration.showNotification('İT24 Dərs Xatırlatması', {
    body: `Sonrakı dərs: ${name} (${type}). Otaq: ${classSession.room || 'Məlum deyil'}`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    tag: classSession.id,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200]
  });
}

// Hər 30 saniyədən bir yoxla
setInterval(checkSchedule, 30000);

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
