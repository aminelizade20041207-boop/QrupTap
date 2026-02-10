
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, LayoutGrid, Bell } from 'lucide-react';
import { getClasses, addClass, removeClass, updateClass } from '@/lib/storage';
import { ClassSession } from '@/lib/types';
import { DailyView, WeeklyView } from '@/components/schedule-views';
import { ClassDialog } from '@/components/class-dialog';
import { NotificationScheduler } from '@/components/notification-scheduler';

export default function Home() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  const handleSave = (session: ClassSession) => {
    if (editingSession) {
      updateClass(session);
    } else {
      addClass(session);
    }
    setClasses(getClasses());
    setEditingSession(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this class?')) {
      removeClass(id);
      setClasses(getClasses());
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <NotificationScheduler />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">ClassTrack</h1>
            </div>
            <p className="text-muted-foreground">Stay organized and never miss a class.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openAddDialog} className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Add Class
            </Button>
          </div>
        </header>

        <Tabs defaultValue="daily" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-2 rounded-xl border">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Weekly
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:block px-4 text-sm text-muted-foreground font-medium">
              Upcoming: {classes.length} total sessions
            </div>
          </div>

          <TabsContent value="daily" className="min-h-[400px]">
            <DailyView classes={classes} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>
          
          <TabsContent value="weekly" className="min-h-[400px]">
            <WeeklyView classes={classes} onDelete={handleDelete} onEdit={handleEdit} />
          </TabsContent>
        </Tabs>

        <footer className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ClassTrack Productivity. Your schedule is saved locally.</p>
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
