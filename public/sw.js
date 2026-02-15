
const CACHE_NAME = 'it24-cache-v1';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
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
  }
});

function checkSchedule() {
  if (!appData.profile || !appData.schedule || appData.schedule.length === 0) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dailyClasses = appData.schedule
    .filter(c => 
      Number(c.day) === todayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === appData.profile.subgroup)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  dailyClasses.forEach((session, index) => {
    const [h, m] = session.startTime.split(':').map(Number);
    const sessionMinutes = h * 60 + m;
    const diff = sessionMinutes - currentMinutes;

    const isFirstClass = index === 0;
    const settings = appData.profile.notificationSettings;
    if (!settings) return;

    const channel1 = settings.firstChannel;
    const channel2 = settings.secondChannel;

    const checkAndNotify = (channel, channelId) => {
      if (!channel || !channel.enabled) return;
      const triggerMinutes = isFirstClass ? channel.firstClassMinutes : channel.otherClassesMinutes;
      
      if (diff === triggerMinutes && triggerMinutes > 0) {
        const type = session.name.split('(')[1]?.replace(')', '') || 'Dərs';
        const name = session.name.split('(')[0].trim();
        const body = `Sonrakı dərs: ${name} (${type}). Otaq: ${session.room || 'Məlum deyil'}`;
        
        const tag = `class-notif-${session.id}-${channelId}-${triggerMinutes}`;

        self.registration.showNotification('Dərs Xatırlatması', {
          body: body,
          icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
          tag: tag,
          renotify: true
        });
      }
    };

    checkAndNotify(channel1, 'ch1');
    checkAndNotify(channel2, 'ch2');
  });
}

setInterval(checkSchedule, 30000);
