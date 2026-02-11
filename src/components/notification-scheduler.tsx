
"use client";

import React, { useEffect, useState } from 'react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { ClassSession, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const NotificationScheduler = () => {
  const { toast } = useToast();

  useEffect(() => {
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

      // Bugünün dərsləri
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

        if (index === 0) {
          // Günün İLK dərsi: 20 dəqiqə qalmış
          const diffMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);
          if (diffMinutes > 19.5 && diffMinutes < 20.5) {
            showNotification(`Günün İlk Dərsi: ${c.name}`, `Dərs 20 dəqiqəyə başlayacaq. Otaq: ${c.room || '?'}`);
          }
        } else {
          // Digər dərslər: Əvvəlki dərsin bitdiyi an
          const prevClass = dailyClasses[index - 1];
          const [endHours, endMinutes] = prevClass.endTime.split(':').map(Number);
          const prevEndTime = new Date(now);
          prevEndTime.setHours(endHours, endMinutes, 0, 0);

          const diffSeconds = (now.getTime() - prevEndTime.getTime()) / 1000;
          // Əgər əvvəlki dərs indicə (son 30 saniyədə) bitibsə
          if (diffSeconds >= 0 && diffSeconds < 31) {
            showNotification(`Növbəti Dərs: ${c.name}`, `Əvvəlki dərs bitdi. Yeni dərs otağı: ${c.room || '?'}`);
          }
        }
      });
    }, 30000); // Hər 30 saniyədən bir yoxla

    return () => clearInterval(checkInterval);
  }, [toast]);

  const showNotification = async (title: string, body: string) => {
    const iconUrl = 'https://picsum.photos/seed/it-coding/192/192';
    
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification(title, {
            body,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [200, 100, 200],
            tag: 'it24-schedule-alert',
            renotify: true
          });
        } catch (e) {
          new Notification(title, { body, icon: iconUrl });
        }
      } else {
        new Notification(title, { body, icon: iconUrl });
      }
    } else {
      toast({ title, description: body });
    }
  };

  return null;
};
