
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Bell, Calculator, User, Smartphone, CheckCircle2, Moon, Sun, Settings, Settings2, RotateCcw, LogOut } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AuthView } from '@/components/auth-view';
import { signOut } from 'firebase/auth';

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
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userRef = useMemo(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userRef);

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

  const handleLogout = () => {
    signOut(auth);
    setIsSettingsOpen(false);
  };

  if (isUserLoading || !isReady) return <div className="min-h-screen bg-background" />;

  if (!user || (!user.emailVerified && user.providerData[0]?.providerId === 'password')) {
    return <AuthView />;
  }

  if (profileLoading) return <div className="min-h-screen bg-background" />;

  if (!profile) {
    return <Onboarding onComplete={(p) => {
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          ...p,
          id: user.uid,
          notificationSettings: DEFAULT_NOTIF_SETTINGS,
          savedGrades: {},
          savedDetails: {},
          savedAbsences: {}
        });
      }
    }} />;
  }

  const dailyClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  );

  const weeklyClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === selectedWeeklyWeek)
  );

  const updateProfile = (updatedProfile: UserProfile) => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        id: user.uid
      }, { merge: true });
    }
  };

  const handleSaveGrade = (subject: string, details: GradeDetails) => {
    const updatedGrades = { ...(profile.savedGrades || {}), [subject]: Math.round(details.total) };
    const updatedDetails = { ...(profile.savedDetails || {}), [subject]: { ...details, total: Math.round(details.total) } };
    
    updateProfile({
      ...profile,
      savedGrades: updatedGrades,
      savedDetails: updatedDetails
    });
    
    toast({ title: "Yadda saxlanıldı", description: `${subject} balınız kabinetə əlavə edildi.` });
    setEditingSubject(undefined);
    setIsProfileOpen(true);
  };

  const handleEditGrade = (subject: string) => {
    setEditingSubject(subject);
    setIsProfileOpen(false);
    setActiveTab('calculator');
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
        await registration.showNotification('QrupTap Bildiriş Testi', {
          body: `Salam, ${profile.name}! Bu bir test bildirişidir.`,
          icon: 'https://placehold.co/192x192/4A90E2/ffffff?text=QT',
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
    if (!newSettings.firstChannel.enabled) {
      newSettings.secondChannel.enabled = false;
    }
    updateProfile({ ...profile, notificationSettings: newSettings });
  };

  const setStandardNotifSettings = () => {
    updateNotifSettings(DEFAULT_NOTIF_SETTINGS);
    toast({ title: "Standart Ayarlar", description: "Bildiriş ayarları sıfırlandı." });
  };

  const formatTimeMinutes = (min: number) => {
    if (min <= 0) return '';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `(${h} saat${m > 0 ? ` ${m} dəqiqə` : ''})`;
    return `(${m} dəqiqə)`;
  };

  const handleMinutesChange = (channel: 'firstChannel' | 'secondChannel', field: 'firstClassMinutes' | 'otherClassesMinutes', value: string) => {
    if (!profile.notificationSettings) return;
    const isOtherClass = field === 'otherClassesMinutes';
    const parsedValue = parseInt(value) || 0;
    const numValue = value === '' ? 0 : (isOtherClass ? Math.min(90, Math.max(0, parsedValue)) : Math.max(0, parsedValue));
    
    updateNotifSettings({
      ...profile.notificationSettings,
      [channel]: { ...profile.notificationSettings[channel], [field]: numValue }
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'weekly') setSelectedWeeklyWeek(currentWeek);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white font-bold text-xl shadow-sm">QT</div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-headline">QrupTap</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
              <span>Salam, <b>{profile.name}</b> <Badge variant="outline" className="ml-1 text-[10px]">{profile.group}</Badge></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {isDarkMode ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-primary font-bold">
                    <Settings2 className="h-5 w-5" /> Tənzimləmələr
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Label htmlFor="first-notif-channel" className="font-bold text-primary">Bildirişlər</Label>
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
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <span>İlk Dərsə</span>
                            <span className="text-primary">{formatTimeMinutes(profile.notificationSettings.firstChannel.firstClassMinutes)}</span>
                          </Label>
                          <Input type="number" value={profile.notificationSettings.firstChannel.firstClassMinutes || ''} onChange={(e) => handleMinutesChange('firstChannel', 'firstClassMinutes', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <span>Digər Dərslərə</span>
                            <span className="text-primary">{formatTimeMinutes(profile.notificationSettings.firstChannel.otherClassesMinutes)}</span>
                          </Label>
                          <Input type="number" value={profile.notificationSettings.firstChannel.otherClassesMinutes || ''} onChange={(e) => handleMinutesChange('firstChannel', 'otherClassesMinutes', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full gap-2 font-bold" onClick={setStandardNotifSettings}>
                      <RotateCcw className="h-4 w-4" /> Standart Ayarlar
                    </Button>
                    <Button variant="destructive" className="w-full gap-2 font-bold" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Hesabdan Çıx
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative group ml-1">
              <Avatar className={`h-11 w-11 border-2 transition-all ${isProfileOpen ? 'border-primary ring-2 ring-primary/20' : 'border-white dark:border-gray-800'}`}>
                <AvatarImage src={profile.photo || user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <div className="flex gap-2 sm:absolute sm:left-0">
            <Button variant={notifPermission === 'granted' ? "ghost" : "default"} size="sm" onClick={requestPermission} disabled={notifPermission === 'granted'}>
              {notifPermission === 'granted' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Bell className="h-4 w-4" />}
              {notifPermission === 'granted' ? 'Aktivdir' : 'Aktiv Et'}
            </Button>
            <Button variant="outline" size="sm" onClick={triggerTestNotification} className="text-primary">
              <Smartphone className="h-4 w-4 mr-2" /> Test
            </Button>
          </div>
          <div className="flex items-center gap-3 bg-background p-2 px-3 rounded-xl border border-primary/20 shadow-sm mx-auto">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span>Cari Həftə:</span>
              <Badge variant={currentWeek === 'ust' ? 'default' : 'secondary'}>
                {currentWeek === 'ust' ? 'ÜST' : 'ALT'}
              </Badge>
            </div>
          </div>
        </div>

        {isProfileOpen ? (
          <div className="animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Şəxsi Kabinet</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsProfileOpen(false)}>Geri Qayıt</Button>
            </div>
            <ProfileView profile={profile} onUpdate={updateProfile} onEditGrade={handleEditGrade} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-background border p-1 rounded-xl">
              <TabsTrigger value="daily"><Bell className="h-4 w-4 mr-2" /> Günlük</TabsTrigger>
              <TabsTrigger value="weekly"><LayoutGrid className="h-4 w-4 mr-2" /> Həftəlik</TabsTrigger>
              <TabsTrigger value="calculator"><Calculator className="h-4 w-4 mr-2" /> Giriş Ballarım</TabsTrigger>
            </TabsList>

            <TabsContent value="daily"><DailyView classes={dailyClasses} /></TabsContent>
            <TabsContent value="weekly" className="space-y-6">
              <div className="flex justify-center">
                <Tabs value={selectedWeeklyWeek} onValueChange={(v) => setSelectedWeeklyWeek(v as WeekType)}>
                  <TabsList className="grid grid-cols-2 w-[240px]">
                    <TabsTrigger value="ust">Üst Həftə</TabsTrigger>
                    <TabsTrigger value="alt">Alt Həftə</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <WeeklyView classes={weeklyClasses} />
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
      </div>
    </div>
  );
}
