
const CACHE_NAME = 'it24-cache-v2';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL, '/manifest.webmanifest']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let syncData = {
  profile: null,
  schedule: []
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    syncData = event.data.payload;
  }
});

function checkSchedule() {
  if (!syncData.profile || !syncData.schedule.length) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeInMin = currentHour * 60 + currentMin;

  // Cari hefteni teyin et (16 fevral 2026-dan hesablanir)
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Bu gunun derslerini tap ve sirala
  const todayClasses = syncData.schedule
    .filter(c => 
      Number(c.day) === currentDay && 
      (c.subgroup === 'hamisi' || c.subgroup === syncData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayClasses.length === 0) return;

  todayClasses.forEach((cls, index) => {
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTimeInMin = h * 60 + m;
    
    // Ilk ders yoxsa diger ders?
    const isFirstClass = index === 0;
    const settings = syncData.profile.notificationSettings;
    if (!settings) return;

    const channel1 = settings.firstChannel;
    const channel2 = settings.secondChannel;

    // Kanal 1 yoxlamasi
    if (channel1.enabled) {
      const waitMin = isFirstClass ? channel1.firstClassMinutes : channel1.otherClassesMinutes;
      if (currentTimeInMin === (classTimeInMin - waitMin)) {
        sendNotification(cls, `notif-1-${cls.id}-${waitMin}`);
      }
    }

    // Kanal 2 yoxlamasi
    if (channel2.enabled) {
      const waitMin = isFirstClass ? channel2.firstClassMinutes : channel2.otherClassesMinutes;
      if (currentTimeInMin === (classTimeInMin - waitMin)) {
        sendNotification(cls, `notif-2-${cls.id}-${waitMin}`);
      }
    }
  });
}

function sendNotification(cls, tag) {
  const parts = cls.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? `(${parts[1]}` : '';
  
  const title = `İT24 Dərs Xatırlatması`;
  const body = `Sonrakı dərs: ${name} ${type}. Otaq: ${cls.room || 'Məlum deyil'}`;

  self.registration.showNotification(title, {
    body: body,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    tag: tag,
    renotify: true,
    requireInteraction: true
  });
}

// Her 45 saniyeden bir yoxla
setInterval(checkSchedule, 45000);
