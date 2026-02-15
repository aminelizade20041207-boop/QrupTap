
'use client';

import { useEffect } from 'react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { UserProfile } from '@/lib/types';

export const NotificationScheduler = () => {
  useEffect(() => {
    const syncDataWithSW = async () => {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const savedProfile = localStorage.getItem('it24_profile');
      
      if (savedProfile && registration.active) {
        const profile: UserProfile = JSON.parse(savedProfile);
        
        // Service Worker-e melumatlari gonderirik ki, arxa fonda ozu hesablaya bilsin
        registration.active.postMessage({
          type: 'SYNC_DATA',
          payload: {
            profile,
            schedule: FIXED_SCHEDULE,
            // Bildiris icazesi statusunu da gonderirik
            permission: Notification.permission
          }
        });
      }
    };

    // Melumatlar her defe deyisende SW-ni yenile
    syncDataWithSW();
    
    // Her 30 saniyeden bir (ve ya her hansı storage deyisende) yeniden yoxla
    const interval = setInterval(syncDataWithSW, 30000);
    window.addEventListener('storage', syncDataWithSW);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncDataWithSW);
    };
  }, []);

  return null;
};
