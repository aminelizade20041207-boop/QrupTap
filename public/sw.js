
const CACHE_NAME = 'it24-v4';
let userData = { profile: null, schedule: [] };
let sentNotifications = new Set();

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

function checkAndNotify() {
  if (!userData.profile || !userData.schedule) return;

  const now = new Date();
  const dayIndex = now.getDay();
  const currentTimeString = now.toTimeString().slice(0, 5);
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // Sort daily classes
  const dailyClasses = userData.schedule
    .filter(c => {
      const dayMatch = Number(c.day) === dayIndex;
      const subgroupMatch = c.subgroup === 'hamisi' || c.subgroup === userData.profile.subgroup;
      // Week detection (simplified)
      const startDate = new Date('2026-02-16');
      const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekType = Math.floor(diffInDays / 7) % 2 === 0 ? 'ust' : 'alt';
      const weekMatch = c.week === 'hamisi' || c.week === weekType;
      
      return dayMatch && subgroupMatch && weekMatch;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (dailyClasses.length === 0) return;

  const firstClass = dailyClasses[0];
  const settings = userData.profile.notificationSettings;

  dailyClasses.forEach((c) => {
    const isFirst = c.id === firstClass.id;
    const [h, m] = c.startTime.split(':').map(Number);
    const classTotalMinutes = h * 60 + m;
    const diff = classTotalMinutes - currentTotalMinutes;

    // First channel check
    if (settings && settings.firstChannel.enabled) {
      const targetMin = isFirst ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      triggerIfNeeded(c, diff, targetMin, 'ch1');
    }

    // Second channel check
    if (settings && settings.secondChannel.enabled) {
      const targetMin = isFirst ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      triggerIfNeeded(c, diff, targetMin, 'ch2');
    }
  });
}

function triggerIfNeeded(classObj, diff, targetMin, channelId) {
  if (diff === targetMin && targetMin > 0) {
    const notifKey = `${classObj.id}-${targetMin}-${channelId}`;
    if (!sentNotifications.has(notifKey)) {
      sendNotification(classObj);
      sentNotifications.add(notifKey);
      // Clean up old keys after some time
      setTimeout(() => sentNotifications.delete(notifKey), 120000);
    }
  }
}

function sendNotification(c) {
  const parts = c.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

  self.registration.showNotification('Dərs Xatırlatması', {
    body: `Sonrakı dərs: ${name}${type ? ` (${type})` : ''}. Otaq: ${c.room || 'Naməlum'}`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    tag: `class-${c.id}`,
    renotify: true,
    vibrate: [200, 100, 200]
  });
}

// Background check loop
setInterval(checkAndNotify, 30000); // Check every 30 seconds
