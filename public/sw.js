
const CACHE_NAME = 'it24-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let appData = {
  profile: null,
  schedule: [],
  permission: 'default'
};

let lastNotifiedCache = {};

// SW Qurasdirilma
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Aktivlesdirme
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Sehifeden melumat alma (Cidvel ve Profil)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    appData = event.data.payload;
    console.log('SW: Melumatlar sinxronize edildi');
  }
});

// Arxa fon yoxlamasi - Her deqiqe basi
function checkSchedule() {
  if (!appData.profile || !appData.schedule || appData.permission !== 'granted') return;

  const now = new Date();
  const currentDay = now.getDay();
  const todayStr = now.toDateString();

  // Cari hefteni hesabla (16 Fevral 2026 esas goturulur)
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Bugunun derslerini tap
  const dailyClasses = appData.schedule
    .filter(c => 
      (c.subgroup === 'hamisi' || c.subgroup === appData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek) &&
      Number(c.day) === currentDay
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const settings = appData.profile.notificationSettings;
  if (!settings) return;

  const processChannel = (channel, channelId) => {
    if (!channel || !channel.enabled) return;

    dailyClasses.forEach((c, index) => {
      const [startHours, startMinutes] = c.startTime.split(':').map(Number);
      const classTime = new Date(now);
      classTime.setHours(startHours, startMinutes, 0, 0);

      const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);
      
      const isFirstClass = index === 0;
      const limit = isFirstClass ? channel.firstClassMinutes : channel.otherClassesMinutes;
      
      const notifId = `notif_${c.id}_${todayStr}_${channelId}_m${limit}`;

      // Tam o deqiqede ve ya 1 deqiqe erzinde gonder
      if (diffMinutes > 0 && diffMinutes <= limit) {
        if (!lastNotifiedCache[notifId]) {
          const nameParts = c.name.split('(');
          const className = nameParts[0].trim();
          const classType = nameParts.length > 1 ? ` (${nameParts[1]}` : '';
          
          self.registration.showNotification('İT24 Xəbərdarlıq', {
            body: `Sonrakı dərs: ${className}${classType}. Otaq: ${c.room || '?'}`,
            icon: 'https://img.icons8.com/ios-filled/192/4A90E2/it.png',
            badge: 'https://img.icons8.com/ios-filled/192/4A90E2/it.png',
            vibrate: [200, 100, 200],
            tag: 'it24-alert',
            renotify: true,
            requireInteraction: true
          });
          
          lastNotifiedCache[notifId] = true;
        }
      }
    });
  };

  processChannel(settings.firstChannel, 'ch1');
  processChannel(settings.secondChannel, 'ch2');
}

// Service Worker-i oyaq saxlamaq ve yoxlamaq ucun interval
setInterval(checkSchedule, 30000); // 30 saniyeden bir yoxla

// Fetch hadisesi (Oflayn isleme ucun)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
