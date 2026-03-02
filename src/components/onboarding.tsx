
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserProfile, GroupType } from '@/lib/types';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GroupType | null>(null);
  const [subgroup, setSubgroup] = useState<'yuxari' | 'asagi'>('yuxari');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && group) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && group && subgroup) {
      onComplete({ name, group, subgroup });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">QT</div>
          <CardTitle className="text-2xl font-bold">QrupTap-a Xoş Gəlmisiniz!</CardTitle>
          <CardDescription>
            {step === 1 ? 'Adınızı daxil edin' : step === 2 ? 'Qrupunuzu seçin' : 'Altqrupunuzu təyin edin'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                <Label htmlFor="name">Adınız və Soyadınız</Label>
                <Input 
                  id="name" 
                  placeholder="Məsələn: Samir Abdullayev" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="h-12 text-foreground bg-background"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Label>Akademik Qrup</Label>
                <RadioGroup 
                  value={group || ''} 
                  onValueChange={(v) => setGroup(v as GroupType)}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="IT24.1" id="it24.1" />
                    <Label htmlFor="it24.1" className="flex-1 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 font-bold">İT24.1 Qrupu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="IT24.2" id="it24.2" />
                    <Label htmlFor="it24.2" className="flex-1 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 font-bold">İT24.2 Qrupu</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Label>Altqrup Seçin</Label>
                <RadioGroup 
                  value={subgroup} 
                  onValueChange={(v) => setSubgroup(v as 'yuxari' | 'asagi')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="yuxari" id="yuxari" className="peer sr-only" />
                    <Label
                      htmlFor="yuxari"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <span className="text-sm font-semibold uppercase">Yuxarı</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-1">Altqrup</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="asagi" id="asagi" className="peer sr-only" />
                    <Label
                      htmlFor="asagi"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <span className="text-sm font-semibold uppercase">Aşağı</span>
                      <span className="text-[10px] text-muted-foreground uppercase mt-1">Altqrup</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Geri
              </Button>
            )}
            {step < 3 ? (
              <Button 
                type="button" 
                className="flex-1" 
                onClick={handleNext} 
                disabled={(step === 1 && !name.trim()) || (step === 2 && !group)}
              >
                İrəli <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1">Tətbiqə Başla</Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
