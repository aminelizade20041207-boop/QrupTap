
const CACHE_NAME = 'it24-cache-v3';
let userData = {
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
    userData = event.data.payload;
  }
});

// Arxa fon yoxlama intervalı (hər 30 saniyədən bir)
setInterval(() => {
  checkSchedule();
}, 30000);

function checkSchedule() {
  if (!userData.profile || !userData.schedule.length) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const totalMinutesNow = currentHours * 60 + currentMinutes;

  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // Günün dərslərini tap və sırala
  const todaysClasses = userData.schedule
    .filter(c => 
      Number(c.day) === todayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === userData.profile.subgroup) &&
      (c.week === 'hamisi' || c.week === currentWeek)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  const settings = userData.profile.notificationSettings;
  if (!settings) return;

  todaysClasses.forEach((cls, index) => {
    const isFirstClass = index === 0;
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTotalMinutes = h * 60 + m;

    // Kanal 1
    if (settings.firstChannel.enabled) {
      const waitMinutes = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      checkAndNotify(cls, classTotalMinutes, totalMinutesNow, waitMinutes, 'ch1');
    }

    // Kanal 2
    if (settings.secondChannel.enabled) {
      const waitMinutes = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      checkAndNotify(cls, classTotalMinutes, totalMinutesNow, waitMinutes, 'ch2');
    }
  });
}

const sentNotifications = new Set();

function checkAndNotify(cls, classMinutes, nowMinutes, waitMinutes, channelId) {
  if (waitMinutes <= 0) return;
  
  const targetTime = classMinutes - waitMinutes;
  // Tam olaraq həmin dəqiqədə göndər
  if (nowMinutes === targetTime) {
    const notifId = `${cls.id}-${channelId}-${targetTime}`;
    if (!sentNotifications.has(notifId)) {
      const parts = cls.name.split('(');
      const name = parts[0].trim();
      const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
      
      self.registration.showNotification('İT24 Dərs Xatırlatması', {
        body: `Sonrakı dərs: ${name} (${type}). Otaq: ${cls.room || 'Məlum deyil'}`,
        icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        tag: notifId,
        renotify: true
      });
      sentNotifications.add(notifId);
      
      // 24 saatdan sonra köhnə xatırlatmaları təmizlə
      setTimeout(() => sentNotifications.delete(notifId), 86400000);
    }
  }
}
