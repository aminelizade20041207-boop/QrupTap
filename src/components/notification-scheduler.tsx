
"use client";

import React, { useEffect, useState } from 'react';
import { getClasses } from '@/lib/storage';
import { ClassSession } from '@/lib/types';
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
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const classes = getClasses();

      classes.forEach((c) => {
        if (Number(c.day) !== currentDay) return;

        const [startHours, startMinutes] = c.startTime.split(':').map(Number);
        const classTime = new Date(now);
        classTime.setHours(startHours, startMinutes, 0, 0);

        const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);

        // Notify exactly 5 minutes before (using a small range to ensure it triggers once)
        if (diffMinutes > 4.5 && diffMinutes < 5.5) {
          showNotification(c);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, []);

  const showNotification = (c: ClassSession) => {
    const title = `Upcoming: ${c.name}`;
    const body = `Class starts in 5 minutes in Room ${c.room}`;

    if (permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else {
      toast({
        title,
        description: body,
      });
    }
  };

  return null;
};
