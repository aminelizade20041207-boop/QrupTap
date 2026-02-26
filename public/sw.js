
const CACHE_NAME = 'it24-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let cachedData = {
  profile: null,
  schedule: []
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    cachedData = event.data.payload;
  }
});

function checkSchedule() {
  if (!cachedData.profile || !cachedData.schedule || cachedData.schedule.length === 0) return;

  const now = new Date();
  const day = now.getDay();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  // Həftə növünü hesabla
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  const settings = cachedData.profile.notificationSettings;
  if (!settings || !settings.firstChannel.enabled) return;

  const myClasses = cachedData.schedule.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === cachedData.profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek) &&
    Number(c.day) === day
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  myClasses.forEach((c, index) => {
    const [h, m] = c.startTime.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(h, m, 0, 0);

    const diffMinutes = Math.floor((classTime.getTime() - now.getTime()) / 60000);
    const targetMinutes = index === 0 ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;

    if (diffMinutes === targetMinutes && diffMinutes > 0) {
      const parts = c.name.split('(');
      const name = parts[0].trim();
      const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

      self.registration.showNotification('Dərs Xatırlatması', {
        body: `Sonrakı dərs: ${name}${type ? ` (${type})` : ''}.${c.room ? ` Otaq: ${c.room}` : ''}`,
        icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        tag: `class-${c.id}-${now.toDateString()}`,
        renotify: true
      });
    }
  });
}

setInterval(checkSchedule, 60000);
