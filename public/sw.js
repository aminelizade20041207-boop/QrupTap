
const CACHE_NAME = 'it24-cache-v3';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let appData = {
  profile: null,
  schedule: []
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    appData = event.data.payload;
    console.log('SW Data Synced:', appData);
  }
});

function checkSchedule() {
  if (!appData.profile || !appData.schedule.length) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMin;

  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  const todaysClasses = appData.schedule
    .filter(c => 
      Number(c.day) === todayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === appData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((session, index) => {
    const [h, m] = session.startTime.split(':').map(Number);
    const classTimeInMinutes = h * 60 + m;
    const timeUntilClass = classTimeInMinutes - currentTimeInMinutes;

    const isFirstClass = index === 0;
    const settings = appData.profile.notificationSettings;
    if (!settings) return;

    const checkChannel = (channelKey) => {
      const channel = settings[channelKey];
      if (!channel || !channel.enabled) return;

      const triggerMinutes = isFirstClass ? channel.firstClassMinutes : channel.otherClassesMinutes;
      
      if (timeUntilClass === triggerMinutes && timeUntilClass > 0) {
        const parts = session.name.split('(');
        const name = parts[0].trim();
        const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
        const roomInfo = session.room ? `. Otaq: ${session.room}` : '';

        self.registration.showNotification('Dərs Xatırlatması', {
          body: `Sonrakı dərs: ${name} (${type})${roomInfo}`,
          icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
          tag: `class-${session.id}-${triggerMinutes}`,
          renotify: true,
          requireInteraction: true
        });
      }
    };

    checkChannel('firstChannel');
    checkChannel('secondChannel');
  });
}

setInterval(checkSchedule, 30000);
