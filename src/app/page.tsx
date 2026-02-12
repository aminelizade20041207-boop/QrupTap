
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Bell, Calculator, User, Info, Smartphone, CheckCircle2 } from 'lucide-react';
import { UserProfile, WeekType, GradeDetails } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { Onboarding } from '@/components/onboarding';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GradeCalculator } from '@/components/grade-calculator';
import { ProfileView } from '@/components/profile-view';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekType>('ust');
  const [isReady, setIsReady] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unknown'>('unknown');
  const [activeTab, setActiveTab] = useState('daily');
  const [editingSubject, setEditingSubject] = useState<string | undefined>();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('it24_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        localStorage.removeItem('it24_profile');
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    const startDate = new Date('2026-02-16');
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffInDays / 7);
    setCurrentWeek(weekIndex % 2 === 0 ? 'ust' : 'alt');
    
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="min-h-screen bg-background" />;

  if (!profile) {
    return <Onboarding onComplete={(p) => {
      const newProfile: UserProfile = { ...p, savedGrades: {}, savedDetails: {} };
      setProfile(newProfile);
      localStorage.setItem('it24_profile', JSON.stringify(newProfile));
    }} />;
  }

  const filteredClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  );

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('it24_profile', JSON.stringify(updatedProfile));
  };

  const handleSaveGrade = (subject: string, details: GradeDetails) => {
    const updatedProfile = {
      ...profile,
      savedGrades: {
        ...(profile.savedGrades || {}),
        [subject]: Math.round(details.total)
      },
      savedDetails: {
        ...(profile.savedDetails || {}),
        [subject]: { ...details, total: Math.round(details.total) }
      }
    };
    updateProfile(updatedProfile);
    toast({ title: "Yadda saxlanıldı", description: `${subject} balınız kabinetə əlavə edildi.` });
    setEditingSubject(undefined);
    setIsProfileOpen(true);
  };

  const handleEditGrade = (subject: string) => {
    setEditingSubject(subject);
    setIsProfileOpen(false);
    setActiveTab('calculator');
  };

  const resetProfile = () => {
    localStorage.removeItem('it24_profile');
    window.location.reload();
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
    }
  };

  const triggerTestNotification = async () => {
    if (notifPermission !== 'granted') {
      toast({ variant: "destructive", title: "İcazə Yoxdur", description: "Zəhmət olmasa əvvəlcə bildirişləri aktiv edin." });
      return;
    }

    const iconUrl = 'https://img.icons8.com/ios-filled/192/4A90E2/it.png';

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('İT24 Bildiriş Testi', {
          body: `Salam, ${profile.name}!`,
          icon: iconUrl,
          badge: iconUrl,
          vibrate: [200, 100, 200],
          tag: 'test-notification',
          renotify: true
        });
        toast({ title: "Test Göndərildi", description: "Bildiriş panelini yoxlayın!" });
      } else {
        new Notification('İT24 Bildiriş Testi', { 
          body: `Salam, ${profile.name}!`, 
          icon: iconUrl 
        });
        toast({ title: "Test Göndərildi", description: "Bildiriş panelini yoxlayın!" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Xəta", description: "Bildiriş göndərilə bilmədi." });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white font-bold text-xl shadow-sm">İT24</div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-headline">Dərs Cədvəli</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
              <span>Salam, <b>{profile.name}</b></span>
              <button 
                onClick={resetProfile} 
                className="text-primary hover:underline ml-2 font-medium"
              >
                Sıfırla
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative group transition-transform active:scale-95"
            >
              <Avatar className={`h-12 w-12 border-2 transition-all ${isProfileOpen ? 'border-primary ring-2 ring-primary/20' : 'border-white shadow-sm'}`}>
                <AvatarImage src={profile.photo} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white">
                <User className="h-3 w-3" />
              </div>
            </button>
          </div>
        </header>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <div className="flex gap-2 sm:absolute sm:left-0">
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
              <Smartphone className="h-4 w-4" /> Test
            </Button>
          </div>
          
          <div className="flex items-center gap-3 bg-white/50 p-2 px-3 rounded-xl border border-primary/20 shadow-sm mx-auto">
            <Info className="h-4 w-4 text-primary" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Cari Həftə:</span>
              <Badge variant={currentWeek === 'ust' ? 'default' : 'secondary'} className="font-bold text-[10px]">
                {currentWeek === 'ust' ? 'ÜST' : 'ALT'}
              </Badge>
            </div>
          </div>
        </div>

        {isProfileOpen ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Şəxsi Kabinet
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsProfileOpen(false)}>Geri Qayıt</Button>
            </div>
            <ProfileView 
              profile={profile} 
              onUpdate={updateProfile}
              onEditGrade={handleEditGrade}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-1.5 rounded-xl border overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Bell className="h-4 w-4" /> Günlük
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2 text-xs sm:text-sm">
                  <LayoutGrid className="h-4 w-4" /> Həftəlik
                </TabsTrigger>
                <TabsTrigger value="calculator" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calculator className="h-4 w-4" /> Giriş Balı
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="daily" className="min-h-[400px]">
              <DailyView classes={filteredClasses} />
            </TabsContent>
            
            <TabsContent value="weekly" className="min-h-[400px]">
              <WeeklyView classes={filteredClasses} />
            </TabsContent>

            <TabsContent value="calculator">
              <GradeCalculator 
                onSave={handleSaveGrade} 
                initialSubject={editingSubject}
                existingDetails={editingSubject ? profile.savedDetails?.[editingSubject] : undefined}
              />
            </TabsContent>
          </Tabs>
        )}

        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 İT24 - Əlizadə Akşin</p>
          <p className="text-[10px] mt-1 opacity-50">16 fevral 2026-cı il tarixindən etibarən hesablanır</p>
        </footer>
      </div>
    </div>
  );
}
