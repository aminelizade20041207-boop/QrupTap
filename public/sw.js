
// Service Worker - Arxa fonda bildirişləri və keşləməni idarə edir
const CACHE_NAME = 'it24-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

let userData = null;
let sentNotifications = new Set();

// Quraşdırılma zamanı keşləmə
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Köhnə keşləri təmizləmə
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// Tətbiqdən məlumatları almaq
self.addEventListener('message', (event) => {
  if (event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
    console.log('SW: Məlumatlar sinxronizasiya olundu');
  }
});

// Hər dəqiqə dərsləri yoxlayan interval
setInterval(() => {
  if (!userData || !userData.profile || !userData.schedule) return;

  const { profile, schedule } = userData;
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // Cari həftəni hesabla (16 Fevral 2026-dan etibarən)
  const startDate = new Date('2026-02-16');
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(diffInDays / 7);
  const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

  // İstifadəçinin dərslərini süzgəcdən keçir
  const myClasses = schedule.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek) &&
    Number(c.day) === currentDay
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (myClasses.length === 0) return;

  myClasses.forEach((cls, index) => {
    const [h, m] = cls.startTime.split(':').map(Number);
    const classTimeInMinutes = h * 60 + m;
    const minutesLeft = classTimeInMinutes - currentTimeInMinutes;

    const isFirstClass = index === 0;
    const settings = profile.notificationSettings;

    if (!settings) return;

    // Birinci Kanal Yoxlaması
    if (settings.firstChannel.enabled) {
      const targetMin = isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes;
      checkAndNotify(cls, minutesLeft, targetMin, 'ch1');
    }

    // İkinci Kanal Yoxlaması
    if (settings.secondChannel.enabled) {
      const targetMin = isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes;
      checkAndNotify(cls, minutesLeft, targetMin, 'ch2');
    }
  });
}, 30000); // 30 saniyədən bir yoxla

function checkAndNotify(cls, minutesLeft, targetMin, channelId) {
  // Əgər dəqiqə tamamdırsa və bu dərs/kanal üçün bildiriş göndərilməyibsə
  const notifId = `${cls.id}-${channelId}-${targetMin}`;
  
  if (minutesLeft === targetMin && !sentNotifications.has(notifId)) {
    const parts = cls.name.split('(');
    const name = parts[0].trim();
    const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

    self.registration.showNotification('İT24 Dərs Xatırlatması', {
      body: `Sonrakı dərs: ${name} (${type}). Otaq: ${cls.room || 'Təyin edilməyib'}`,
      icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
      badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
      tag: notifId,
      renotify: true
    });

    sentNotifications.add(notifId);
    
    // 24 saatdan sonra ID-ni təmizlə ki, gələn həftə eyni ID işləsin
    setTimeout(() => sentNotifications.delete(notifId), 86400000);
  }
}
