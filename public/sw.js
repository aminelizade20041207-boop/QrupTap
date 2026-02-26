
const CACHE_NAME = 'it24-cache-v3';
let userData = { profile: null, schedule: [] };

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.webmanifest',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ]);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
  }
});

function checkSchedule() {
  if (!userData.profile || !userData.schedule) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTimeStr = now.toTimeString().slice(0, 5);
  const [currentH, currentM] = currentTimeStr.split(':').map(Number);
  const totalCurrentMin = currentH * 60 + currentM;

  // Həftə hesabı
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  const todaysClasses = userData.schedule.filter(c => 
    Number(c.day) === currentDay &&
    (c.subgroup === 'hamisi' || c.subgroup === userData.profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  const firstClass = todaysClasses[0];
  const settings = userData.profile.notificationSettings;
  if (!settings || !settings.firstChannel.enabled) return;

  todaysClasses.forEach((c, index) => {
    const isFirst = index === 0;
    const [h, m] = c.startTime.split(':').map(Number);
    const classTotalMin = h * 60 + m;
    
    // Birinci kanal yoxlaması
    const firstOffset = isFirst ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
    if (totalCurrentMin === (classTotalMin - firstOffset)) {
      sendNotif(c, firstOffset);
    }

    // İkinci kanal yoxlaması
    if (settings.secondChannel.enabled) {
      const secondOffset = isFirst ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      if (totalCurrentMin === (classTotalMin - secondOffset)) {
        sendNotif(c, secondOffset);
      }
    }
  });
}

function sendNotif(classSession, minutes) {
  const parts = classSession.name.split('(');
  const name = parts[0].trim();
  const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
  
  self.registration.showNotification('Dərs Xatırlatması', {
    body: `Sonrakı dərs: ${name} (${type}). Otaq: ${classSession.room || 'Naməlum'}. ${minutes} dəqiqə qalıb.`,
    icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
    tag: `class-${classSession.id}-${minutes}`,
    renotify: true
  });
}

setInterval(checkSchedule, 60000); // Hər dəqiqə yoxla
