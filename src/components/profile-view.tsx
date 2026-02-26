"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit2, GraduationCap, Check, Minus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';

const ABSENCE_RULES: Record<string, { m1: number, m2: number, fail: number }> = {
  'Kompüter Şəbəkələri': { m1: 5, m2: 9, fail: 12 },
  'Əməliyyat sistemləri': { m1: 3, m2: 6, fail: 8 },
  'Verilənlər bazası sistemləri': { m1: 3, m2: 6, fail: 8 },
  'Diskret riyaziyyat': { m1: 3, m2: 5, fail: 6 },
  'Obyekt-yönümlü proqramlaşdırma': { m1: 3, m2: 6, fail: 8 }
};

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onEditGrade: (subject: string) => void;
}

export const ProfileView = ({ profile, onUpdate, onEditGrade }: ProfileViewProps) => {
  const [expandedAbsences, setExpandedAbsences] = useState<Record<string, boolean>>({});

  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const handleUpdateAbsence = (subject: string, delta: number) => {
    const rules = ABSENCE_RULES[subject];
    const current = profile.savedAbsences?.[subject] || 0;
    const maxLimit = rules ? rules.fail : 99;
    const newValue = Math.max(0, Math.min(maxLimit, current + delta));
    
    onUpdate({
      ...profile,
      savedAbsences: { ...(profile.savedAbsences || {}), [subject]: newValue }
    });
  };

  const getAbsenceStatus = (subject: string, count: number) => {
    const rules = ABSENCE_RULES[subject];
    if (!rules) return null;
    if (count >= rules.fail) return { label: 'Kəsildin!', color: 'bg-destructive text-white', icon: <AlertTriangle className="h-3 w-3" /> };
    if (count >= rules.m2) return { label: '-2 Bal', color: 'bg-orange-500 text-white', icon: <Minus className="h-3 w-3" /> };
    if (count >= rules.m1) return { label: '-1 Bal', color: 'bg-yellow-500 text-white', icon: <Minus className="h-3 w-3" /> };
    return { label: 'Normal', color: 'bg-green-500 text-white', icon: <Check className="h-3 w-3" /> };
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden bg-card">
        <CardHeader className="text-center pb-2">
          <Avatar className="w-32 h-32 mx-auto border-4 shadow-xl mb-4">
            <AvatarImage src={profile.photo} />
            <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
          </Avatar>
          <CardTitle>{profile.name}</CardTitle>
          <CardDescription className="font-bold text-primary uppercase tracking-widest text-xs">
            {profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} Altqrup
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Giriş Ballarım:</h3>
        {subjects.map(subject => {
          const grade = profile.savedGrades?.[subject];
          const absences = profile.savedAbsences?.[subject] || 0;
          const status = getAbsenceStatus(subject, absences);
          const isExpanded = expandedAbsences[subject];

          return (
            <Card key={subject} className="border-primary/10">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black">{grade || '-'}</span>
                    <Button variant="ghost" size="icon" onClick={() => onEditGrade(subject)}><Edit2 className="h-4 w-4" /></Button>
                    {ABSENCE_RULES[subject] && (
                      <Button variant="outline" size="icon" onClick={() => setExpandedAbsences(p => ({...p, [subject]: !isExpanded}))}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="pt-4 border-t animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Qayıblar:</span>
                        <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg border">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-destructive" onClick={() => handleUpdateAbsence(subject, -1)}>-</Button>
                          <span className="font-black text-lg min-w-[20px] text-center">{absences}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 text-green-500" onClick={() => handleUpdateAbsence(subject, 1)}>+</Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status:</span>
                        {status ? (
                          <Badge className={`${status.color} font-bold px-3 py-1 shadow-sm`}>
                            <div className="flex items-center gap-1.5">
                              {status.icon}
                              {status.label}
                            </div>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Məlumatsız</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
