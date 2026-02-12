
"use client";

import React from 'react';
import { ClassSession, DAYS_OF_WEEK } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User as UserIcon, BookOpen, MapPin, FlaskConical, Users } from 'lucide-react';

interface ViewProps {
  classes: ClassSession[];
}

export const DailyView = ({ classes }: ViewProps) => {
  const todayIdx = new Date().getDay();
  const todaysClasses = classes
    .filter(c => Number(c.day) === todayIdx)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const parseClassName = (fullName: string) => {
    const parts = fullName.split('(');
    const name = parts[0].trim();
    const type = parts.length > 1 ? parts[1].replace(')', '').trim() : '';
    return { name, type };
  };

  const getClassIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('laboratoriya') || lowerType.includes('lab')) {
      return <FlaskConical className="h-5 w-5 text-primary" />;
    }
    if (lowerType.includes('məşğələ') || lowerType.includes('seminar')) {
      return <Users className="h-5 w-5 text-primary" />;
    }
    return <BookOpen className="h-5 w-5 text-primary" />;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('laboratoriya')) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    if (lowerType.includes('məşğələ')) return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    if (lowerType.includes('mühazirə')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-primary">{DAYS_OF_WEEK[todayIdx]}</h3>
        <Badge variant="outline" className="bg-background/50 dark:bg-muted/20 border-primary/20">
          {todaysClasses.length} Dərs bu gün
        </Badge>
      </div>
      {todaysClasses.length > 0 ? (
        todaysClasses.map((c) => {
          const { name, type } = parseClassName(c.name);
          return (
            <Card key={c.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl flex shrink-0 items-center justify-center">
                    {getClassIcon(type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-base sm:text-lg leading-tight text-foreground break-words flex-1">
                          {name}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.week !== 'hamisi' && (
                            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary h-5 px-1.5 font-bold">
                              {c.week === 'ust' ? 'ÜST' : 'ALT'}
                            </Badge>
                          )}
                          {c.room && (
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 text-[10px] h-5 px-1.5 font-bold">
                              <MapPin className="h-3 w-3 mr-1" /> {c.room}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {type && (
                        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border w-fit ${getTypeColor(type)}`}>
                          {type}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium">{c.startTime} - {c.endTime}</span>
                      </div>
                      {c.teacher && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg truncate">
                          <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-medium truncate">{c.teacher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {[1, 2, 3, 4, 5].map((idx) => {
        const dayName = DAYS_OF_WEEK[idx];
        const dayClasses = classes
          .filter(c => Number(c.day) === idx)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={dayName} className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-primary/20 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">{dayName}</span>
            </div>
            <div className="space-y-3">
              {dayClasses.length > 0 ? (
                dayClasses.map((c) => (
                  <Card 
                    key={c.id} 
                    className={`bg-card border-primary/10 hover:border-primary transition-all shadow-sm ${c.week !== 'hamisi' ? 'border-dashed' : ''}`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="font-bold text-sm text-foreground leading-snug">{c.name}</p>
                      <div className="flex flex-col text-xs text-muted-foreground gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold text-primary">
                            <Clock className="h-3 w-3" /> {c.startTime}
                          </span>
                          {c.room && (
                            <span className="flex items-center gap-1 font-bold text-accent">
                              <MapPin className="h-3 w-3" /> {c.room}
                            </span>
                          )}
                        </div>
                        {c.teacher && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" /> {c.teacher.split(' ')[0]}
                          </span>
                        )}
                        {c.week !== 'hamisi' && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold w-fit">
                            {c.week.toUpperCase()} HƏFTƏ
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-xs text-center text-muted-foreground py-4 opacity-40 border rounded-lg border-dashed">
                  Dərs yoxdur
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
