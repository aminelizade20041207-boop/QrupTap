
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Bell, Calculator, User, Info } from 'lucide-react';
import { UserProfile, WeekType } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { Onboarding } from '@/components/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekType>('ust');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedProfile = localStorage.getItem('it24_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Week calculation logic
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

  // Filter classes based on user's subgroup and current week
  const filteredClasses = FIXED_SCHEDULE.filter(c => 
    (c.subgroup === 'hamisi' || c.subgroup === profile.subgroup) &&
    (c.week === 'hamisi' || c.week === currentWeek)
  );

  const resetProfile = () => {
    if (confirm('Profil məlumatlarını sıfırlamaq istəyirsiniz?')) {
      localStorage.removeItem('it24_profile');
      setProfile(null);
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
              <button onClick={resetProfile} className="text-primary hover:underline ml-2">Dəyişdir</button>
            </div>
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
          <p>© {new Date().getFullYear()} İT24 - Mərkəzi Cədvəl Sistemi</p>
          <p className="text-[10px] mt-1 opacity-50">16 fevral 2025-ci il tarixindən etibarən hesablanır</p>
        </footer>
      </div>
    </div>
  );
}
