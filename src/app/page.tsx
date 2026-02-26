
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Bell, Calculator, User, Info, Smartphone, CheckCircle2, Moon, Sun, Settings, Settings2, RotateCcw } from 'lucide-react';
import { UserProfile, WeekType, GradeDetails, NotificationSettings } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { Onboarding } from '@/components/onboarding';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GradeCalculator } from '@/components/grade-calculator';
import { ProfileView } from '@/components/profile-view';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  firstChannel: {
    enabled: true,
    firstClassMinutes: 60,
    otherClassesMinutes: 15
  },
  secondChannel: {
    enabled: false,
    firstClassMinutes: 30,
    otherClassesMinutes: 10
  }
};

export default function Home() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekType>('ust');
  const [selectedWeeklyWeek, setSelectedWeeklyWeek] = useState<WeekType>('ust');
  const [isReady, setIsReady] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>('unknown');
  const [activeTab, setActiveTab] = useState('daily');
  const [editingSubject, setEditingSubject] = useState<string | undefined>();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('it24_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (e) {
        localStorage.removeItem('it24_profile');
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const startDate = new Date('2026-02-16');
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffInDays / 7);
    const calculatedWeek = weekIndex % 2 === 0 ? 'ust' : 'alt';
    setCurrentWeek(calculatedWeek);
    setSelectedWeeklyWeek(calculatedWeek);
    
    setIsReady(true);
  }, []);

  if (!isReady) return <div className="min-h-screen bg-background" />;

  if (!profile) {
    return <Onboarding onComplete={(p) => {
      const newProfile: UserProfile = { ...p, savedGrades: {}, savedDetails: {}, notificationSettings: DEFAULT_NOTIF_SETTINGS };
      setProfile(newProfile);
      localStorage.setItem('it24_profile', JSON.stringify(newProfile));
    }} />;
  }

  const dailyClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  );

  const weeklyClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup)
  );

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('it24_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('it24_theme', 'light');
    }
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('it24_profile', JSON.stringify(updatedProfile));
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_DATA',
        payload: {
          profile: updatedProfile,
          schedule: FIXED_SCHEDULE
        }
      });
    }
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

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('İT24 Bildiriş Testi', {
          body: `Salam, ${profile.name}! Bu bir test bildirişidir.`,
          icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
          tag: 'test-notification',
          renotify: true
        });
        toast({ title: "Test Göndərildi", description: "Bildiriş panelini yoxlayın!" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Xəta", description: "Bildiriş göndərilə bilmədi." });
    }
  };

  const updateNotifSettings = (newSettings: NotificationSettings) => {
    updateProfile({ ...profile, notificationSettings: newSettings });
  };

  const setStandardNotifSettings = () => {
    updateNotifSettings(DEFAULT_NOTIF_SETTINGS);
    toast({ title: "Standart Ayarlar", description: "Bildiriş ayarları sıfırlandı." });
  };

  const handleMinutesChange = (channel: 'firstChannel' | 'secondChannel', field: 'firstClassMinutes' | 'otherClassesMinutes', value: string) => {
    if (!profile.notificationSettings) return;
    const parsedValue = parseInt(value) || 0;
    const nonNegativeValue = Math.max(0, parsedValue);
    
    updateNotifSettings({
      ...profile.notificationSettings,
      [channel]: { ...profile.notificationSettings[channel], [field]: nonNegativeValue }
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white font-bold text-xl shadow-sm shrink-0">İT24</div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-headline">Dərs Cədvəli</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
              <span>Salam, <b>{profile.name}</b></span>
              <button onClick={resetProfile} className="text-primary hover:underline ml-2 font-medium">Sıfırla</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full hover:bg-primary/10 transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5 text-primary shrink-0" /> : <Moon className="h-5 w-5 text-primary shrink-0" />}
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
                  <Settings className="h-5 w-5 text-primary shrink-0" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-primary font-bold">
                    <Settings2 className="h-5 w-5 shrink-0" /> Bildiriş Ayarları
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Label htmlFor="first-notif-channel" className="font-bold text-primary">Birinci Bildiriş Kanalı</Label>
                      <Switch 
                        id="first-notif-channel" 
                        checked={profile.notificationSettings?.firstChannel.enabled}
                        onCheckedChange={(checked) => updateNotifSettings({ 
                          ...profile.notificationSettings!, 
                          firstChannel: { ...profile.notificationSettings!.firstChannel, enabled: checked }
                        })}
                      />
                    </div>
                    {profile.notificationSettings?.firstChannel.enabled && (
                      <div className="space-y-3 px-1">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">İlk Dərsə (dəq)</Label>
                          <Input type="number" min="0" value={profile.notificationSettings.firstChannel.firstClassMinutes || ''} onChange={(e) => handleMinutesChange('firstChannel', 'firstClassMinutes', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Digər Dərslərə (dəq)</Label>
                          <Input type="number" min="0" value={profile.notificationSettings.firstChannel.otherClassesMinutes || ''} onChange={(e) => handleMinutesChange('firstChannel', 'otherClassesMinutes', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5 h-11 font-bold" onClick={setStandardNotifSettings}>
                    <RotateCcw className="h-4 w-4 shrink-0" /> Standart Ayarlar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative group transition-transform active:scale-95 ml-1">
              <Avatar className={`h-11 w-11 border-2 ${isProfileOpen ? 'border-primary ring-2 ring-primary/20' : 'border-white dark:border-gray-800 shadow-sm'}`}>
                <AvatarImage src={profile.photo} />
                <AvatarFallback className="bg-primary/10 text-primary"><User className="h-6 w-6 shrink-0" /></AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button variant={notifPermission === 'granted' ? "ghost" : "default"} size="sm" onClick={requestPermission} disabled={notifPermission === 'granted'} className="gap-2">
            {notifPermission === 'granted' ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Bell className="h-4 w-4 shrink-0" />}
            {notifPermission === 'granted' ? 'Aktivdir' : 'Aktiv Et'}
          </Button>
          <Button variant="outline" size="sm" onClick={triggerTestNotification} className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
            <Smartphone className="h-4 w-4 shrink-0" /> Test
          </Button>
          <div className="flex items-center gap-3 bg-background p-2 px-3 rounded-xl border border-primary/20 shadow-sm">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Həftə:</span>
            <Badge variant={currentWeek === 'ust' ? 'default' : 'secondary'} className="font-bold text-[10px]">
              {currentWeek === 'ust' ? 'ÜST' : 'ALT'}
            </Badge>
          </div>
        </div>

        {isProfileOpen ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary shrink-0" /> Şəxsi Kabinet</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsProfileOpen(false)}>Geri Qayıt</Button>
            </div>
            <ProfileView profile={profile} onUpdate={updateProfile} onEditGrade={handleEditGrade} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Günlük</TabsTrigger>
              <TabsTrigger value="weekly">Həftəlik</TabsTrigger>
              <TabsTrigger value="calculator">Giriş Balı</TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <DailyView classes={dailyClasses} />
            </TabsContent>
            
            <TabsContent value="weekly">
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                   <Button variant={selectedWeeklyWeek === 'ust' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedWeeklyWeek('ust')}>Üst Həftə</Button>
                   <Button variant={selectedWeeklyWeek === 'alt' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedWeeklyWeek('alt')}>Alt Həftə</Button>
                </div>
                <WeeklyView classes={weeklyClasses.filter(c => c.week === 'hamisi' || c.week === selectedWeeklyWeek)} />
              </div>
            </TabsContent>

            <TabsContent value="calculator">
              <GradeCalculator onSave={handleSaveGrade} initialSubject={editingSubject} existingDetails={editingSubject ? profile.savedDetails?.[editingSubject] : undefined} />
            </TabsContent>
          </Tabs>
        )}

        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 İT24 - Əlizadə Akşin</p>
        </footer>
      </div>
    </div>
  );
}
