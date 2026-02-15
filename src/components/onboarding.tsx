
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserProfile } from '@/lib/types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [name, setName] = useState('');
  const [subgroup, setSubgroup] = useState<'yuxari' | 'asagi'>('yuxari');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({ name, subgroup });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">İT24</div>
          <CardTitle className="text-2xl font-bold">Xoş Gəlmisiniz!</CardTitle>
          <CardDescription>Başlamazdan əvvəl məlumatlarınızı daxil edin</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Adınız və Soyadınız</Label>
              <Input 
                id="name" 
                placeholder="Məsələn: Samir Abdullayev" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Altqrup Seçin</Label>
              <RadioGroup 
                value={subgroup} 
                onValueChange={(v) => setSubgroup(v as 'yuxari' | 'asagi')}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="yuxari" id="yuxari" className="peer sr-only" />
                  <Label
                    htmlFor="yuxari"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-sm font-semibold uppercase">Yuxarı</span>
                    <span className="text-xs text-muted-foreground">Altqrup</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="asagi" id="asagi" className="peer sr-only" />
                  <Label
                    htmlFor="asagi"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <span className="text-sm font-semibold uppercase">Aşağı</span>
                    <span className="text-xs text-muted-foreground">Altqrup</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg h-12">Tətbiqə Başla</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
