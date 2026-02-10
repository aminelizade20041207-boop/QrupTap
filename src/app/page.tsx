
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, LayoutGrid, Bell, Calculator, User } from 'lucide-react';
import { ClassSession, UserProfile } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { ClassDialog } from '@/components/class-dialog';
import { Onboarding } from '@/components/onboarding';
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const db = useFirestore();
  const { data: classes = [], loading } = useCollection<ClassSession>(
    db ? collection(db, 'classes') : null
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('it24_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  if (!profile) {
    return <Onboarding onComplete={(p) => {
      setProfile(p);
      localStorage.setItem('it24_profile', JSON.stringify(p));
    }} />;
  }

  // Filter classes based on user's subgroup
  const filteredClasses = classes.filter(c => 
    c.subgroup === 'hamisi' || c.subgroup === profile.subgroup
  );

  const handleSave = (session: ClassSession) => {
    if (!db) return;
    const docRef = doc(db, 'classes', session.id);
    setDoc(docRef, session, { merge: true });
    setEditingSession(null);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    if (confirm('Bu dərsi silmək istədiyinizə əminsiniz?')) {
      deleteDoc(doc(db, 'classes', id));
    }
  };

  const handleEdit = (session: ClassSession) => {
    setEditingSession(session);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSession(null);
    setIsDialogOpen(true);
  };

  const resetProfile = () => {
    if (confirm('Profil məlumatlarını sıfırlamaq istəyirsiniz?')) {
      localStorage.removeItem('it24_profile');
      setProfile(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-white font-bold text-xl">İT24</div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Dərs Cədvəli</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <User className="h-4 w-4" />
              <span>Salam, <b>{profile.name}</b> ({profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} altqrup)</span>
              <button onClick={resetProfile} className="text-primary hover:underline ml-2">Dəyişdir</button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={openAddDialog} className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Dərs əlavə et
            </Button>
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

          <TabsContent value="daily" className="min-h-[400px]">
            <DailyView classes={filteredClasses} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>
          
          <TabsContent value="weekly" className="min-h-[400px]">
            <WeeklyView classes={filteredClasses} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="calculator">
            <Card>
              <CardHeader>
                <CardTitle>Giriş Balı Hesablama</CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center text-muted-foreground border-t border-dashed mt-4">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Bu hissə tezliklə aktiv olacaq. Burada imtahana giriş balınızı hesablaya biləcəksiniz.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} İT24 - Mərkəzi Cədvəl Sistemi</p>
        </footer>
      </div>

      <ClassDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleSave} 
        editingSession={editingSession} 
      />
    </div>
  );
}
