
const CACHE_NAME = 'it24-cache-v3';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let syncData = {
  profile: null,
  schedule: []
};

// Background loop timer
let intervalId = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  startBackgroundCheck();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    syncData = event.data.payload;
    console.log('SW: Data synced', syncData);
    // Restart check with new data
    startBackgroundCheck();
  }
});

function startBackgroundCheck() {
  if (intervalId) clearInterval(intervalId);
  
  // Arxa fon yoxlaması - hər 15 saniyədə bir
  intervalId = setInterval(() => {
    checkAndNotify();
  }, 15000);
}

function checkAndNotify() {
  if (!syncData.profile || !syncData.schedule.length) return;

  const profile = syncData.profile;
  const schedule = syncData.schedule;
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMin;

  // Cari həftəni hesabla
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Bugünkü dərsləri tap və sırala
  const todayClasses = schedule
    .filter(c => 
      Number(c.day) === currentDay &&
      (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => {
      const [ah, am] = a.startTime.split(':').map(Number);
      const [bh, bm] = b.startTime.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

  if (todayClasses.length === 0) return;

  todayClasses.forEach((lesson, index) => {
    const [startH, startM] = lesson.startTime.split(':').map(Number);
    const lessonTimeInMinutes = startH * 60 + startM;
    const diff = lessonTimeInMinutes - currentTimeInMinutes;

    const isFirstClass = index === 0;
    const settings = profile.notificationSettings;
    if (!settings) return;

    // Kanal 1 yoxlaması
    if (settings.firstChannel.enabled) {
      const targetMin = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      if (diff === targetMin) {
        sendNotification(lesson, 'first');
      }
    }

    // Kanal 2 yoxlaması
    if (settings.secondChannel.enabled) {
      const targetMin = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diff === targetMin) {
        sendNotification(lesson, 'second');
      }
    }
  });
}

const sentNotifications = new Set();

function sendNotification(lesson, channel) {
  const notifId = `${lesson.id}-${channel}-${new Date().toDateString()}`;
  if (sentNotifications.has(notifId)) return;

  sentNotifications.add(notifId);

  // Parse type from name if possible (e.g. "Dərs (Mühazirə)")
  const nameParts = lesson.name.split('(');
  const name = nameParts[0].trim();
  const type = nameParts.length > 1 ? ` (${nameParts[1]}` : '';
  const room = lesson.room ? `. Otaq: ${lesson.room}` : '';

  const body = `Sonrakı dərs: ${name}${type}${room}`;

  self.registration.showNotification('İT24 Dərs Cədvəli', {
    body: body,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/96x96/4A90E2/ffffff?text=IT24',
    tag: lesson.id,
    renotify: true,
    data: { url: '/' }
  });
}

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
