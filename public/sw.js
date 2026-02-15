
const CACHE_NAME = 'it24-v2';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let appData = {
  profile: null,
  schedule: []
};

let sentNotifications = new Set();

const parseClassName = (fullName) => {
  const parts = fullName.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
  return { name, type };
};

const checkSchedule = () => {
  if (!appData.profile || !appData.schedule.length) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentWeek = (() => {
    const startDate = new Date('2026-02-16');
    const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7) % 2 === 0 ? 'ust' : 'alt';
  })();

  const todaysClasses = appData.schedule
    .filter(c => 
      Number(c.day) === todayIdx &&
      (c.subgroup === 'hamisi' || c.subgroup === appData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  const settings = appData.profile.notificationSettings;
  if (!settings || !settings.firstChannel.enabled) return;

  todaysClasses.forEach((cls, index) => {
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(h, m, 0, 0);

    const diffInMinutes = Math.floor((classTime.getTime() - now.getTime()) / (1000 * 60));
    
    const isFirstClass = index === 0;
    
    // Check First Channel
    const firstTriggerMin = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
    if (diffInMinutes >= 0 && diffInMinutes <= firstTriggerMin) {
      const notifId = `${cls.id}-ch1-${firstTriggerMin}`;
      if (!sentNotifications.has(notifId)) {
        const { name, type } = parseClassName(cls.name);
        self.registration.showNotification('Dərs Xatırlatması', {
          body: `Sonrakı dərs: ${name} (${type}). Otaq: ${cls.room || 'Naməlum'}`,
          icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
          tag: notifId
        });
        sentNotifications.add(notifId);
      }
    }

    // Check Second Channel
    if (settings.secondChannel.enabled) {
      const secondTriggerMin = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diffInMinutes >= 0 && diffInMinutes <= secondTriggerMin) {
        const notifId = `${cls.id}-ch2-${secondTriggerMin}`;
        if (!sentNotifications.has(notifId)) {
          const { name, type } = parseClassName(cls.name);
          self.registration.showNotification('Dərs Xatırlatması (2)', {
            body: `Sonrakı dərs: ${name} (${type}). Otaq: ${cls.room || 'Naməlum'}`,
            icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
            tag: notifId
          });
          sentNotifications.add(notifId);
        }
      }
    }
  });

  // Clean up old notifications (from yesterday)
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    sentNotifications.clear();
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    appData = event.data.payload;
    sentNotifications.clear(); // Re-sync notifications when data changes
    checkSchedule();
  }
});

// Run check every minute
setInterval(checkSchedule, 30000);

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
