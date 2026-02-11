"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';

export const GradeCalculator = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendance, setAttendance] = useState<number>(0);
  const [independentWork, setIndependentWork] = useState<number>(0);
  const [colloquiums, setColloquiums] = useState<string[]>(['', '', '']);
  const [seminars, setSeminars] = useState<string[]>([]);
  const [completedLabs, setCompletedLabs] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const isOS = selectedSubject.toLowerCase().includes('əməliyyat sistemləri');
  const isDiscrete = selectedSubject.toLowerCase().includes('diskret riyaziyyat');
  const isCN = selectedSubject.toLowerCase().includes('kompüter şəbəkələri');

  const hasLabs = !isDiscrete && !isOS; // İstifadəçi dedi: OS və Diskret-də lab yoxdur
  const hasColls = !isOS; // OS-də kollokvium yoxdur
  
  const maxLabs = (isOS || isCN) ? 8 : 5;
  const labTotalPoints = isOS ? 30 : 15;
  const multiplier = isDiscrete ? 3 : 1.5;

  // Fənn dəyişəndə datanı sıfırla
  useEffect(() => {
    setResult(null);
    setCompletedLabs(0);
    setColloquiums(['', '', '']);
    setSeminars([]);
  }, [selectedSubject]);

  const addSeminar = () => setSeminars([...seminars, '']);
  const removeSeminar = (index: number) => setSeminars(seminars.filter((_, i) => i !== index));
  const updateSeminar = (index: number, value: string) => {
    const newSeminars = [...seminars];
    newSeminars[index] = value;
    setSeminars(newSeminars);
  };

  const calculateGrade = () => {
    let total = 0;

    // 1. Davamiyyət və Sərbəst iş (max 20)
    total += Math.min(Number(attendance) || 0, 10);
    total += Math.min(Number(independentWork) || 0, 10);

    // 2. Kollokvium və Seminar balları
    const allGrades = [
      ...(hasColls ? colloquiums : []),
      ...seminars
    ].map(Number).filter(n => !isNaN(n) && n > 0);

    if (allGrades.length > 0) {
      const avg = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
      total += avg * multiplier;
    }

    // 3. Laboratoriya balları (Qiymət yoxdur, sadəcə sayına görə)
    if (hasLabs) {
      const labScore = (completedLabs / maxLabs) * labTotalPoints;
      total += labScore;
    }

    setResult(parseFloat(total.toFixed(2)));
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
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Davamiyyət (Max 10)</Label>
                <Input 
                  type="number" 
                  max="10"
                  value={attendance} 
                  onChange={(e) => setAttendance(Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Sərbəst İş (Max 10)</Label>
                <Input 
                  type="number" 
                  max="10"
                  value={independentWork} 
                  onChange={(e) => setIndependentWork(Number(e.target.value))} 
                />
              </div>
            </div>

            {hasColls && (
              <div className="space-y-3">
                <Label>Kollokvium Qiymətləri</Label>
                <div className="grid grid-cols-3 gap-3">
                  {colloquiums.map((val, idx) => (
                    <Input 
                      key={idx}
                      type="number" 
                      placeholder={`Koll ${idx + 1}`} 
                      value={val} 
                      onChange={(e) => {
                        const c = [...colloquiums];
                        c[idx] = e.target.value;
                        setColloquiums(c);
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}

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

            {hasLabs && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-bold">Keçilmiş Laboratoriya Sayı</Label>
                  <Badge variant="outline" className="font-bold text-primary">
                    {completedLabs} / {maxLabs}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: maxLabs }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCompletedLabs(idx + 1 === completedLabs ? idx : idx + 1)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                        idx < completedLabs 
                          ? 'bg-primary border-primary text-white shadow-inner' 
                          : 'bg-white border-muted-foreground/20 hover:border-primary/50'
                      }`}
                    >
                      {idx < completedLabs ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  * Laboratoriyalar üçün qiymət daxil edilmir, sadəcə sayına görə ballar (cəmi {labTotalPoints} bal) hesablanır.
                </p>
              </div>
            )}

            <Button onClick={calculateGrade} className="w-full text-lg h-12 gap-2 mt-4 shadow-md">
              <Calculator className="h-5 w-5" /> Hesabla
            </Button>

            {result !== null && (
              <div className="mt-6 p-6 bg-primary text-white rounded-2xl text-center animate-in zoom-in-95 duration-300 shadow-xl">
                <p className="text-sm font-medium opacity-90 mb-1">Sizin Giriş Balınız</p>
                <h2 className="text-5xl font-bold">{result}</h2>
                <div className="mt-4 flex justify-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">
                    {result >= 25 ? 'İmtahana İcazə Verilir' : 'Kəsr Təhlükəsi!'}
                  </Badge>
                </div>
              </div>
            )}
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