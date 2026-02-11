"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, Info } from 'lucide-react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';

export const GradeCalculator = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendance, setAttendance] = useState<string>('');
  const [independentWork, setIndependentWork] = useState<string>('');
  const [colloquiums, setColloquiums] = useState(['', '', '']);
  const [labs, setLabs] = useState<string[]>([]);
  const [seminars, setSeminars] = useState<string[]>([]);

  // Unikal fənn adlarını çıxarırıq (mötərizəsiz)
  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const isOS = selectedSubject.toLowerCase().includes('əməliyyat sistemləri');

  const addSeminar = () => setSeminars([...seminars, '']);
  const removeSeminar = (index: number) => setSeminars(seminars.filter((_, i) => i !== index));
  const updateSeminar = (index: number, value: string) => {
    const newSeminars = [...seminars];
    newSeminars[index] = value;
    setSeminars(newSeminars);
  };

  const addLab = () => setLabs([...labs, '']);
  const removeLab = (index: number) => setLabs(labs.filter((_, i) => i !== index));
  const updateLab = (index: number, value: string) => {
    const newLabs = [...labs];
    newLabs[index] = value;
    setLabs(newLabs);
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Giriş Balı Hesablayıcı
        </CardTitle>
        <CardDescription>
          Qiymətlərinizi daxil edərək imtahana giriş balınızı öyrənin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Fənn Seçin</Label>
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Dərsi seçin" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubject && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label>Davamiyyət (Max 10)</Label>
              <Input 
                type="number" 
                placeholder="0-10" 
                value={attendance} 
                onChange={(e) => setAttendance(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Sərbəst İş (Max 10)</Label>
              <Input 
                type="number" 
                placeholder="0-10" 
                value={independentWork} 
                onChange={(e) => setIndependentWork(e.target.value)} 
              />
            </div>

            {!isOS && (
              <>
                <div className="space-y-2">
                  <Label>Kollokvium 1</Label>
                  <Input 
                    type="number" 
                    placeholder="0-10" 
                    value={colloquiums[0]} 
                    onChange={(e) => {
                      const c = [...colloquiums];
                      c[0] = e.target.value;
                      setColloquiums(c);
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kollokvium 2</Label>
                  <Input 
                    type="number" 
                    placeholder="0-10" 
                    value={colloquiums[1]} 
                    onChange={(e) => {
                      const c = [...colloquiums];
                      c[1] = e.target.value;
                      setColloquiums(c);
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kollokvium 3</Label>
                  <Input 
                    type="number" 
                    placeholder="0-10" 
                    value={colloquiums[2]} 
                    onChange={(e) => {
                      const c = [...colloquiums];
                      c[2] = e.target.value;
                      setColloquiums(c);
                    }} 
                  />
                </div>
              </>
            )}
          </div>
        )}

        {selectedSubject && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Laboratoriya İşləri
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{labs.length}</span>
                </Label>
                <Button variant="outline" size="sm" onClick={addLab} className="h-8 gap-1">
                  <Plus className="h-4 w-4" /> Əlavə et
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {labs.map((lab, idx) => (
                  <div key={idx} className="relative group">
                    <Input 
                      type="number" 
                      placeholder={`Lab ${idx + 1}`} 
                      value={lab} 
                      onChange={(e) => updateLab(idx, e.target.value)}
                      className="pr-8"
                    />
                    <button 
                      onClick={() => removeLab(idx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Seminar Qiymətləri
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{seminars.length}</span>
                </Label>
                <Button variant="outline" size="sm" onClick={addSeminar} className="h-8 gap-1">
                  <Plus className="h-4 w-4" /> Əlavə et
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {seminars.map((sem, idx) => (
                  <div key={idx} className="relative group">
                    <Input 
                      type="number" 
                      placeholder={`Sem ${idx + 1}`} 
                      value={sem} 
                      onChange={(e) => updateSeminar(idx, e.target.value)}
                      className="pr-8"
                    />
                    <button 
                      onClick={() => removeSeminar(idx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full text-lg h-12 gap-2 mt-4" disabled={!selectedSubject}>
              <Calculator className="h-5 w-5" /> Hesabla
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <Info className="h-3 w-3" /> Hesablama düyməsi tezliklə aktiv ediləcək.
            </p>
          </div>
        )}

        {!selectedSubject && (
          <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Calculator className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Zəhmət olmasa yuxarıdan bir fənn seçin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};