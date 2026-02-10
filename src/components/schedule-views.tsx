
"use client";

import React from 'react';
import { ClassSession, DAYS_OF_WEEK } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Edit2, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewProps {
  classes: ClassSession[];
  onEdit: (session: ClassSession) => void;
  onDelete: (id: string) => void;
}

export const DailyView = ({ classes, onEdit, onDelete }: ViewProps) => {
  const todayIdx = new Date().getDay();
  const todaysClasses = classes
    .filter(c => Number(c.day) === todayIdx)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-primary">{DAYS_OF_WEEK[todayIdx]}</h3>
        <Badge variant="outline">{todaysClasses.length} Classes Today</Badge>
      </div>
      {todaysClasses.length > 0 ? (
        todaysClasses.map((c) => (
          <Card key={c.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg leading-tight">{c.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {c.startTime} - {c.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {c.room}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(c)} className="hover:text-primary">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)} className="hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground">No classes scheduled for today.</p>
        </div>
      )}
    </div>
  );
};

export const WeeklyView = ({ classes, onEdit, onDelete }: ViewProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[800px] md:min-w-0">
        {DAYS_OF_WEEK.map((dayName, idx) => {
          const dayClasses = classes
            .filter(c => Number(c.day) === idx)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={dayName} className="space-y-3">
              <div className="text-center pb-2 border-b">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{dayName.substring(0, 3)}</span>
              </div>
              {dayClasses.map((c) => (
                <Card 
                  key={c.id} 
                  className="bg-primary/5 border-primary/20 hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => onEdit(c)}
                >
                  <CardContent className="p-3 space-y-2">
                    <p className="font-bold text-xs truncate">{c.name}</p>
                    <div className="flex flex-col text-[10px] text-muted-foreground gap-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.startTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.room}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
