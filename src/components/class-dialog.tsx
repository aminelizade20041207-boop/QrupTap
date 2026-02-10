
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassSession, ClassDay, DAYS_OF_WEEK, SubgroupType } from '@/lib/types';

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: ClassSession) => void;
  editingSession?: ClassSession | null;
}

export const ClassDialog = ({ open, onOpenChange, onSave, editingSession }: ClassDialogProps) => {
  const [formData, setFormData] = useState<Partial<ClassSession>>({
    name: '',
    day: 1,
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    subgroup: 'hamisi',
  });

  useEffect(() => {
    if (editingSession) {
      setFormData(editingSession);
    } else {
      setFormData({
        name: '',
        day: 1,
        startTime: '09:00',
        endTime: '10:00',
        room: '',
        subgroup: 'hamisi',
      });
    }
  }, [editingSession, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as ClassSession,
      id: editingSession?.id || Math.random().toString(36).substr(2, 9),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSession ? 'Dərsi Redaktə Et' : 'Yeni Dərs Əlavə Et'}</DialogTitle>
          <DialogDescription>
            Dərs haqqında məlumatları daxil edin. Bu məlumat hər kəsə görünəcək.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Dərsin Adı</Label>
            <Input
              id="name"
              placeholder="Məsələn: Alqoritmlər"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Gün</Label>
              <Select
                value={formData.day?.toString()}
                onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) as ClassDay })}
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subgroup">Altqrup</Label>
              <Select
                value={formData.subgroup}
                onValueChange={(v) => setFormData({ ...formData, subgroup: v as SubgroupType })}
              >
                <SelectTrigger id="subgroup">
                  <SelectValue placeholder="Altqrup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hamisi">Hamısı</SelectItem>
                  <SelectItem value="yuxari">Yuxarı</SelectItem>
                  <SelectItem value="asagi">Aşağı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="room">Otaq / Kabinet</Label>
            <Input
              id="room"
              placeholder="Məsələn: Otaq 204"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Başlama Vaxtı</Label>
              <Input
                id="start"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Bitmə Vaxtı</Label>
              <Input
                id="end"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full mt-4">Dərsi Yadda Saxla</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
