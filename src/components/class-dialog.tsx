
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassSession, ClassDay, DAYS_OF_WEEK } from '@/lib/types';

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
          <DialogTitle>{editingSession ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          <DialogDescription>
            Enter the details of your class session here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g. Advanced Calculus"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={formData.day?.toString()}
                onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) as ClassDay })}
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                placeholder="e.g. Room 302"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End Time</Label>
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
            <Button type="submit" className="w-full mt-4">Save Class</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
