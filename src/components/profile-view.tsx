
"use client";

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Edit2, BookOpen, GraduationCap } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onEditGrade: (subject: string) => void;
}

export const ProfileView = ({ profile, onUpdate, onEditGrade }: ProfileViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage src={profile.photo} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
          <CardDescription className="font-medium text-primary uppercase tracking-widest">
            {profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} Altqrup
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 border-t">
          <div className="flex justify-around text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Fənlər</p>
              <p className="text-xl font-black text-foreground">{subjects.length}</p>
            </div>
            <div className="w-px bg-border h-8 my-auto" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Hesablanan</p>
              <p className="text-xl font-black text-foreground">
                {Object.keys(profile.savedGrades || {}).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <GraduationCap className="h-6 w-6 text-primary" />
          Fənn Giriş Ballarım
        </h3>
        <div className="grid gap-3">
          {subjects.map(subject => {
            const grade = profile.savedGrades?.[subject];
            return (
              <Card key={subject} className="overflow-hidden hover:shadow-md transition-all border-primary/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-sm sm:text-base">{subject}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {grade !== undefined ? (
                        <span className={`text-xl font-black ${grade >= 30 ? 'text-primary' : 'text-destructive'}`}>
                          {grade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium">Hesablanmayıb</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditGrade(subject)}
                      className="text-muted-foreground hover:text-primary h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
