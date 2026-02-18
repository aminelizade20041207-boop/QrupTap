
const CACHE_NAME = 'it24-v2';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let userData = {
  profile: null,
  schedule: []
};

let sentNotifications = new Set();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
  }
});

// Arxa fon dövrü - tətbiq qapalı olsa belə brauzer tərəfindən idarə olunur
function checkSchedule() {
  if (!userData.profile || !userData.schedule.length) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaysClasses = userData.schedule
    .filter(c => 
      Number(c.day) === todayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === userData.profile.subgroup)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((cls, idx) => {
    const isFirstClass = idx === 0;
    const [h, m] = cls.startTime.split(':').map(Number);
    const classStartMinutes = h * 60 + m;

    const settings = userData.profile.notificationSettings;
    if (!settings) return;

    // Birinci Kanal
    if (settings.firstChannel.enabled) {
      const waitMinutes = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      checkAndNotify(cls, classStartMinutes, currentMinutes, waitMinutes, 'ch1');
    }

    // İkinci Kanal
    if (settings.secondChannel.enabled) {
      const waitMinutes = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      checkAndNotify(cls, classStartMinutes, currentMinutes, waitMinutes, 'ch2');
    }
  });
}

function checkAndNotify(cls, classStartMin, currentMin, waitMin, channelId) {
  const targetTime = classStartMin - waitMin;
  const notifId = `${cls.id}-${channelId}-${waitMin}`;

  // Tam həmin dəqiqədə bildiriş göndər
  if (currentMin === targetTime && !sentNotifications.has(notifId)) {
    const { name, type } = parseClassName(cls.name);
    self.registration.showNotification('İT24 Xatırlatma', {
      body: `Sonrakı dərs: ${name} (${type}). Otaq: ${cls.room || 'N/A'}`,
      icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
      badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
      tag: cls.id,
      renotify: true,
      vibrate: [200, 100, 200]
    });
    sentNotifications.add(notifId);
  }

  // Köhnə bildirişləri təmizlə ki, gün dəyişəndə yenidən işləsin
  if (currentMin < targetTime - 10) {
    sentNotifications.delete(notifId);
  }
}

function parseClassName(fullName) {
  const parts = fullName.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
  return { name, type };
}

// Hər 30 saniyədən bir yoxla
setInterval(checkSchedule, 30000);
