
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Bell, Calculator, User, Info, Smartphone, CheckCircle2 } from 'lucide-react';
import { UserProfile, WeekType } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { Onboarding } from '@/components/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekType>('ust');
  const [isClient, setIsClient] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unknown'>('unknown');

  useEffect(() => {
    setIsClient(true);
    const savedProfile = localStorage.getItem('it24_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    const startDate = new Date('2025-02-16');
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffInDays / 7);
    setCurrentWeek(weekIndex % 2 === 0 ? 'ust' : 'alt');
  }, []);

  if (!isClient) return null;

  if (!profile) {
    return <Onboarding onComplete={(p) => {
      setProfile(p);
      localStorage.setItem('it24_profile', JSON.stringify(p));
    }} />;
  }

  const filteredClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  );

  const resetProfile = () => {
    localStorage.removeItem('it24_profile');
    setProfile(null);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({ variant: "destructive", title: "Xəta", description: "Bu cihaz bildirişləri dəstəkləmir." });
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      toast({ title: "Uğurlu!", description: "Bildirişlər aktiv edildi." });
    } else {
      toast({ variant: "destructive", title: "Xəta", description: "Bildiriş icazəsi rədd edildi." });
    }
  };

  const triggerTestNotification = async () => {
    if (notifPermission !== 'granted') {
      toast({ variant: "destructive", title: "İcazə Yoxdur", description: "Zəhmət olmasa əvvəlcə bildirişləri aktiv edin." });
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          await registration.showNotification('İT24 Bildiriş Testi', {
            body: 'Təbriklər! Sistem bildirişləri artıq telefonun yuxarı hissəsində görünür.',
            icon: 'https://picsum.photos/seed/it24-icon/192/192',
            badge: 'https://picsum.photos/seed/it24-icon/192/192',
            vibrate: [200, 100, 200],
            tag: 'test-notification'
          });
          toast({ title: "Test Göndərildi", description: "Yuxarı paneli yoxlayın!" });
        } else {
          throw new Error('Service Worker tapılmadı');
        }
      } else {
        new Notification('İT24 Bildiriş Testi', { body: 'Təbriklər! Bildiriş sistemi işləyir.' });
        toast({ title: "Test Göndərildi", description: "Yuxarı paneli yoxlayın!" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Xəta", description: "Bildiriş göndərilə bilmədi. Səhifəni yeniləyib bir daha cəhd edin." });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white font-bold text-xl shadow-sm">İT24</div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Dərs Cədvəli</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <User className="h-4 w-4" />
              <span>Salam, <b>{profile.name}</b> ({profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} altqrup)</span>
              <button 
                onClick={resetProfile} 
                className="text-primary hover:underline ml-2 font-medium"
              >
                Dəyişdir
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-2">
              <Button 
                variant={notifPermission === 'granted' ? "ghost" : "default"} 
                size="sm" 
                onClick={requestPermission}
                disabled={notifPermission === 'granted'}
                className="gap-2"
              >
                {notifPermission === 'granted' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Bell className="h-4 w-4" />}
                {notifPermission === 'granted' ? 'Aktivdir' : 'Aktiv Et'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={triggerTestNotification}
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Smartphone className="h-4 w-4" /> Test Et
              </Button>
            </div>
            <div className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-primary/20 shadow-sm">
              <Info className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cari Həftə</span>
                <Badge variant={currentWeek === 'ust' ? 'default' : 'secondary'} className="w-fit font-bold">
                  {currentWeek === 'ust' ? 'ÜST HƏFTƏ' : 'ALT HƏFTƏ'}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="daily" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-2 rounded-xl border">
            <TabsList className="grid w-full md:w-[600px] grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Günlük
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Həftəlik
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Giriş Balı
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <DailyView classes={filteredClasses} />
          </TabsContent>
          
          <TabsContent value="weekly" className="min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <WeeklyView classes={filteredClasses} />
          </TabsContent>

          <TabsContent value="calculator" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Giriş Balı Hesablama
                </CardTitle>
              </CardHeader>
              <CardContent className="py-20 text-center text-muted-foreground">
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-primary opacity-40" />
                </div>
                <p className="text-lg font-medium text-foreground">Bu bölmə üzərində iş gedir.</p>
                <p className="text-sm">Tezliklə burada imtahana giriş balınızı rahatlıqla hesablaya biləcəksiniz.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} İT24 - Əlizadə Akşin</p>
          <p className="text-[10px] mt-1 opacity-50">16 fevral 2025-ci il tarixindən etibarən hesablanır</p>
        </footer>
      </div>
    </div>
  );
}
