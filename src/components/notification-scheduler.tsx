
"use client";

import React, { useEffect, useState } from 'react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { ClassSession, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const NotificationScheduler = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    const checkInterval = setInterval(() => {
      const savedProfile = localStorage.getItem('it24_profile');
      if (!savedProfile) return;
      
      const profile: UserProfile = JSON.parse(savedProfile);
      const now = new Date();
      const currentDay = now.getDay();
      
      const startDate = new Date('2025-02-16');
      const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffInDays / 7);
      const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

      const classes = FIXED_SCHEDULE.filter(c => 
        (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
        (c.week === 'hamisi' || c.week === currentWeek)
      );

      classes.forEach((c) => {
        if (Number(c.day) !== currentDay) return;

        const [startHours, startMinutes] = c.startTime.split(':').map(Number);
        const classTime = new Date(now);
        classTime.setHours(startHours, startMinutes, 0, 0);

        const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);

        // Bildiriş tam 5 dəqiqə qalmış
        if (diffMinutes > 4.7 && diffMinutes < 5.3) {
          showNotification(c.name, `Dərs 5 dəqiqəyə başlayacaq. Otaq: ${c.room || 'Qeyd edilməyib'}`);
        }
      });
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [permission, toast]);

  const showNotification = async (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      // Mobil cihazlarda sistem bildirişi üçün Service Worker istifadə olunmalıdır
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: 'https://picsum.photos/seed/it24-icon/192/192',
          badge: 'https://picsum.photos/seed/it24-icon/192/192',
          vibrate: [200, 100, 200],
          tag: 'it24-class-notification'
        });
      } else {
        new Notification(title, { body });
      }
    } else {
      toast({ title, description: body });
    }
  };

  return null;
};
