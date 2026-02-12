"use client";

import React, { useEffect, useRef } from 'react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const NotificationScheduler = () => {
  const { toast } = useToast();
  const lastNotifiedRef = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    const savedNotifs = localStorage.getItem('it24_notified_cache');
    if (savedNotifs) {
      try {
        lastNotifiedRef.current = JSON.parse(savedNotifs);
      } catch (e) {
        lastNotifiedRef.current = {};
      }
    }

    const checkInterval = setInterval(() => {
      const savedProfile = localStorage.getItem('it24_profile');
      if (!savedProfile) return;
      
      const profile: UserProfile = JSON.parse(savedProfile);
      const now = new Date();
      const currentDay = now.getDay();
      const todayStr = now.toDateString();
      
      if (lastNotifiedRef.current.date !== todayStr) {
        lastNotifiedRef.current = { date: todayStr };
        localStorage.setItem('it24_notified_cache', JSON.stringify(lastNotifiedRef.current));
      }

      const startDate = new Date('2026-02-16');
      const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffInDays / 7);
      const currentWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';

      const dailyClasses = FIXED_SCHEDULE
        .filter(c => 
          (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
          (c.week === 'hamisi' || c.week === currentWeek) &&
          Number(c.day) === currentDay
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      dailyClasses.forEach((c, index) => {
        const [startHours, startMinutes] = c.startTime.split(':').map(Number);
        const classTime = new Date(now);
        classTime.setHours(startHours, startMinutes, 0, 0);

        const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);
        const notifId = `class_${c.id}_${todayStr}`;

        if (index === 0 && diffMinutes > 0 && diffMinutes <= 20) {
          if (!lastNotifiedRef.current[notifId]) {
            showNotification(`Günün İlk Dərsi: ${c.name}`, `Dərs yaxınlaşır. Otaq: ${c.room || '?'}`);
            lastNotifiedRef.current[notifId] = 'sent';
            localStorage.setItem('it24_notified_cache', JSON.stringify(lastNotifiedRef.current));
          }
        }

        if (index > 0) {
          const prevClass = dailyClasses[index - 1];
          const [endHours, endMinutes] = prevClass.endTime.split(':').map(Number);
          const prevEndTime = new Date(now);
          prevEndTime.setHours(endHours, endMinutes, 0, 0);

          const breakDiff = (now.getTime() - prevEndTime.getTime()) / 1000;
          const breakNotifId = `break_${c.id}_${todayStr}`;

          if (breakDiff >= 0 && breakDiff < 600) {
            if (!lastNotifiedRef.current[breakNotifId]) {
              showNotification(`Növbəti Dərs: ${c.name}`, `Tənəffüs başladı. Yeni dərs otağı: ${c.room || '?'}`);
              lastNotifiedRef.current[breakNotifId] = 'sent';
              localStorage.setItem('it24_notified_cache', JSON.stringify(lastNotifiedRef.current));
            }
          }
        }
      });
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [toast]);

  const showNotification = async (title: string, body: string) => {
    // Android "Ağ kvadrat" problemini həll etmək üçün mütləq şəffaf fonlu PNG
    const iconUrl = 'https://img.icons8.com/ios-filled/192/4A90E2/it.png';
    
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: iconUrl,
          badge: iconUrl,
          vibrate: [200, 100, 200, 100, 200],
          tag: 'it24-schedule-alert',
          renotify: true,
          requireInteraction: true,
          silent: false
        });
      } catch (e) {
        new Notification(title, { body, icon: iconUrl });
      }
    } else {
      toast({ title, description: body });
    }
  };

  return null;
};