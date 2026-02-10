
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
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }

    const checkInterval = setInterval(() => {
      const savedProfile = localStorage.getItem('it24_profile');
      if (!savedProfile) return;
      
      const profile: UserProfile = JSON.parse(savedProfile);
      const now = new Date();
      const currentDay = now.getDay();
      
      // Calculate current week (ust/alt)
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

        // Notify exactly 5-6 minutes before
        if (diffMinutes > 4.8 && diffMinutes < 5.2) {
          showNotification(c);
        }
      });
    }, 45000); // Check every 45 seconds

    return () => clearInterval(checkInterval);
  }, []);

  const showNotification = (c: ClassSession) => {
    const title = `Dərs başlayır: ${c.name}`;
    const body = `Dərs 5 dəqiqəyə başlayacaq. Müəllim: ${c.teacher || 'Qeyd edilməyib'}`;

    if (permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (e) {
        // Fallback for some mobile browsers
        toast({ title, description: body });
      }
    } else {
      toast({
        title,
        description: body,
      });
    }
  };

  return null;
};
