
const CACHE_NAME = 'it24-cache-v3';
let appData = {
  profile: null,
  schedule: []
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    appData = event.data.payload;
  }
});

function getWeekType() {
  const startDate = new Date('2026-02-16');
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  return weekIndex % 2 === 0 ? 'ust' : 'alt';
}

function checkAndNotify() {
  if (!appData.profile || !appData.schedule || !appData.profile.notificationSettings) return;

  const now = new Date();
  const currentDayIdx = now.getDay();
  const currentWeek = getWeekType();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todaysClasses = appData.schedule.filter(c => 
    Number(c.day) === currentDayIdx &&
    (c.week === 'hamisi' || c.week === currentWeek) &&
    (c.subgroup === 'hamisi' || c.subgroup === appData.profile.subgroup)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  const settings = appData.profile.notificationSettings;
  
  todaysClasses.forEach((cls, index) => {
    const isFirstClass = index === 0;
    const [startH, startM] = cls.startTime.split(':').map(Number);
    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);

    const diffMinutes = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60));

    // Kanal 1
    if (settings.firstChannel.enabled) {
      const triggerMin = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      if (diffMinutes === triggerMin) {
        sendNotification(cls, diffMinutes);
      }
    }

    // Kanal 2
    if (settings.secondChannel.enabled) {
      const triggerMin = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diffMinutes === triggerMin) {
        sendNotification(cls, diffMinutes);
      }
    }
  });
}

function sendNotification(cls, minutes) {
  const parts = cls.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? ` (${parts[1].replace(')', '')})` : '';
  
  self.registration.showNotification(`Dərs Başlayır: ${minutes} dəqiqə qaldı`, {
    body: `Sonrakı dərs: ${name}${type}.${cls.room ? ` Otaq: ${cls.room}` : ''}`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/96x96/4A90E2/ffffff?text=IT24',
    tag: `class-${cls.id}-${minutes}`,
    renotify: true,
    vibrate: [200, 100, 200]
  });
}

// Check every 30 seconds
setInterval(checkAndNotify, 30000);
