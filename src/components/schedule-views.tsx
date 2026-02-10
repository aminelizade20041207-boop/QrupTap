
"use client";

import React from 'react';
import { ClassSession, DAYS_OF_WEEK } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User as UserIcon, BookOpen, Users, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewProps {
  classes: ClassSession[];
}

export const DailyView = ({ classes }: ViewProps) => {
  const todayIdx = new Date().getDay();
  const todaysClasses = classes
    .filter(c => Number(c.day) === todayIdx)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-primary">{DAYS_OF_WEEK[todayIdx]}</h3>
        <Badge variant="outline" className="bg-white">{todaysClasses.length} Dərs bu gün</Badge>
      </div>
      {todaysClasses.length > 0 ? (
        todaysClasses.map((c) => (
          <Card key={c.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl hidden sm:flex">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xl leading-tight text-foreground">{c.name}</h4>
                    {c.week !== 'hamisi' && (
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        {c.week === 'ust' ? 'ÜST' : 'ALT'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{c.startTime} - {c.endTime}</span>
                    </div>
                    {c.teacher && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        <UserIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{c.teacher}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <p>Bu gün üçün dərs yoxdur.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const WeeklyView = ({ classes }: ViewProps) => {
  return (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[800px] md:min-w-0">
        {[1, 2, 3, 4, 5].map((idx) => {
          const dayName = DAYS_OF_WEEK[idx];
          const dayClasses = classes
            .filter(c => Number(c.day) === idx)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={dayName} className="space-y-3">
              <div className="text-center pb-2 border-b-2 border-primary/10">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{dayName}</span>
              </div>
              {dayClasses.length > 0 ? (
                dayClasses.map((c) => (
                  <Card 
                    key={c.id} 
                    className={`bg-white border-primary/10 hover:border-primary transition-all shadow-sm ${c.week !== 'hamisi' ? 'border-dashed' : ''}`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="font-bold text-xs text-foreground line-clamp-2 min-h-[2.5rem]">{c.name}</p>
                      <div className="flex flex-col text-[10px] text-muted-foreground gap-1.5">
                        <span className="flex items-center gap-1 font-semibold text-primary/80">
                          <Clock className="h-3 w-3" /> {c.startTime}
                        </span>
                        {c.teacher && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" /> {c.teacher.split(' ').pop()}
                          </span>
                        )}
                        {c.week !== 'hamisi' && (
                          <span className="inline-block px-1 py-0.5 rounded bg-primary/5 text-primary text-[8px] font-bold w-fit">
                            {c.week.toUpperCase()} HƏFTƏ
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-[10px] text-center text-muted-foreground py-4 opacity-40">Dərs yoxdur</div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
