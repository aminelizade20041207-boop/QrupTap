
const CACHE_NAME = 'it24-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://placehold.co/192x192/4A90E2/ffffff?text=IT24'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let userData = {
  profile: null,
  schedule: []
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
  }
});

function checkSchedule() {
  if (!userData.profile || !userData.schedule.length) return;

  const now = new Date();
  const todayIdx = now.getDay();
  
  // Calculate current week
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  const subgroup = userData.profile.subgroup;
  const settings = userData.profile.notificationSettings;

  if (!settings?.firstChannel?.enabled) return;

  const todaysClasses = userData.schedule
    .filter(c => 
      Number(c.day) === todayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  const firstClass = todaysClasses[0];

  todaysClasses.forEach((cls, index) => {
    const isFirst = index === 0;
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(h, m, 0, 0);

    const diffMinutes = Math.floor((classTime.getTime() - now.getTime()) / (1000 * 60));

    // First Channel Checks
    checkChannel(settings.firstChannel, cls, diffMinutes, isFirst, 'ch1');
    
    // Second Channel Checks
    if (settings.secondChannel?.enabled) {
      checkChannel(settings.secondChannel, cls, diffMinutes, isFirst, 'ch2');
    }
  });
}

function checkChannel(channel, cls, diffMinutes, isFirst, channelId) {
  const targetMinutes = isFirst ? channel.firstClassMinutes : channel.otherClassesMinutes;
  
  // Exact minute matching
  if (diffMinutes === targetMinutes && targetMinutes > 0) {
    const notificationId = `${cls.id}-${channelId}-${targetMinutes}`;
    
    // We use self.registration to show notification
    self.registration.showNotification('İT24 Xatırlatma', {
      body: `Sonrakı dərs: ${cls.name}. Otaq: ${cls.room || 'Məlum deyil'}`,
      icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
      tag: notificationId,
      renotify: true
    });
  }
}

// Background loop
setInterval(checkSchedule, 60000); // Check every minute
