
'use client';

import { useEffect } from 'react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { UserProfile } from '@/lib/types';

export const NotificationScheduler = () => {
  useEffect(() => {
    const syncDataWithSW = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const savedProfile = localStorage.getItem('it24_profile');
        
        if (savedProfile && registration.active) {
          const profile: UserProfile = JSON.parse(savedProfile);
          
          registration.active.postMessage({
            type: 'SYNC_DATA',
            payload: {
              profile,
              schedule: FIXED_SCHEDULE
            }
          });
        }
      } catch (err) {
        console.error('SW Sinxronizasiya xətası:', err);
      }
    };

    syncDataWithSW();
    
    const interval = setInterval(syncDataWithSW, 30000);
    window.addEventListener('storage', syncDataWithSW);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncDataWithSW);
    };
  }, []);

  return null;
};
