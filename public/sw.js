
// İT24 Service Worker - Oflayn və Arxa fon bildirişləri üçün
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

let userData = null;

// Tətbiqdən gələn məlumatları qəbul edir
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    userData = event.data.payload;
  }
});

// Arxa fonda vaxtı izləyən dövr
setInterval(() => {
  if (!userData || !userData.profile || !userData.profile.notificationSettings) return;

  const { profile, schedule } = userData;
  const now = new Date();
  const dayIdx = now.getDay();

  // Cari günün dərslərini tap və sırala
  const todaysClasses = schedule
    .filter(c => 
      Number(c.day) === dayIdx && 
      (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todaysClasses.length === 0) return;

  todaysClasses.forEach((c, idx) => {
    const isFirstClass = idx === 0;
    const settings = profile.notificationSettings;
    
    // Kanal 1 yoxlanışı
    if (settings.firstChannel.enabled) {
      checkAndNotify(c, isFirstClass ? settings.firstChannel.firstClassMinutes : settings.firstChannel.otherClassesMinutes, 'ch1');
    }
    
    // Kanal 2 yoxlanışı
    if (settings.secondChannel.enabled) {
      checkAndNotify(c, isFirstClass ? settings.secondChannel.firstClassMinutes : settings.secondChannel.otherClassesMinutes, 'ch2');
    }
  });

  function checkAndNotify(classSession, minutesBefore, channelId) {
    if (minutesBefore <= 0) return;

    const [h, m] = classSession.startTime.split(':').map(Number);
    const classTime = new Date();
    classTime.setHours(h, m, 0, 0);
    
    const diffMin = Math.round((classTime.getTime() - now.getTime()) / 60000);
    
    // Əgər istifadəçinin qoyduğu dəqiqə tamam olubsa
    if (diffMin === minutesBefore) {
      const tag = `${classSession.id}-${channelId}-${minutesBefore}`;
      
      const parts = classSession.name.split('(');
      const name = parts[0].trim();
      const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

      self.registration.showNotification('İT24 Xatırlatma', {
        body: `Sonrakı dərs: ${name} (${type}). Otaq: ${classSession.room || '?' }`,
        icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        badge: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        tag: tag,
        renotify: true,
        vibrate: [200, 100, 200]
      });
    }
  }
}, 30000); // Hər 30 saniyədən bir yoxla
