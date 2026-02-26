const CACHE_NAME = 'it24-cache-v3';
let appProfile = null;
let appSchedule = [];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    appProfile = event.data.payload.profile;
    appSchedule = event.data.payload.schedule;
  }
});

function checkSchedule() {
  if (!appProfile || !appSchedule.length) return;

  const now = new Date();
  const dayIdx = now.getDay();
  const currentTimeStr = now.toTimeString().substring(0, 5); // HH:mm
  const [nowH, nowM] = currentTimeStr.split(':').map(Number);
  const nowTotalMinutes = nowH * 60 + nowM;

  const todaysClasses = appSchedule.filter(c => 
    Number(c.day) === dayIdx && 
    (c.subgroup === 'hamisi' || c.subgroup === appProfile.subgroup)
  );

  todaysClasses.forEach(c => {
    const [startH, startM] = c.startTime.split(':').map(Number);
    const startTotalMinutes = startH * 60 + startM;
    
    const diff = startTotalMinutes - nowTotalMinutes;
    const settings = appProfile.notificationSettings;

    if (!settings) return;

    const isFirstClass = todaysClasses.sort((a,b) => a.startTime.localeCompare(b.startTime))[0].id === c.id;

    // First Channel
    if (settings.firstChannel?.enabled) {
      const triggerMinutes = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      if (diff === triggerMinutes) {
        showClassNotification(c, diff);
      }
    }

    // Second Channel
    if (settings.secondChannel?.enabled) {
      const triggerMinutes = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (diff === triggerMinutes) {
        showClassNotification(c, diff);
      }
    }
  });
}

function showClassNotification(classData, minutesLeft) {
  const parts = classData.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
  
  const title = `Dərsə Az Qalıb!`;
  const body = `Sonrakı dərs: ${name} ${type ? `(${type})` : ''}. Otaq: ${classData.room || 'Məlum deyil'}. ${minutesLeft} dəqiqə qalıb.`;

  self.registration.showNotification(title, {
    body: body,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/96x96/4A90E2/ffffff?text=IT24',
    vibrate: [200, 100, 200],
    tag: `class-notif-${classData.id}-${minutesLeft}`,
    renotify: true,
    requireInteraction: true
  });
}

// Every 30 seconds check schedule
setInterval(checkSchedule, 30000);
