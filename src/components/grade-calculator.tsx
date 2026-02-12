"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Badge } from '@/components/ui/badge';

export const GradeCalculator = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [attendance, setAttendance] = useState<string>('');
  const [independentWork, setIndependentWork] = useState<string>('');
  const [colloquiums, setColloquiums] = useState<string[]>(['', '', '']);
  const [seminars, setSeminars] = useState<string[]>([]);
  const [completedLabs, setCompletedLabs] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const isOS = selectedSubject.toLowerCase().includes('əməliyyat');
  const isDiscrete = selectedSubject.toLowerCase().includes('diskret');
  const isCN = selectedSubject.toLowerCase().includes('şəbəkə');

  const maxLabs = isDiscrete ? 0 : (isOS || isCN ? 8 : 5);
  const labTotalPoints = isOS ? 30 : 15;
  const multiplier = isDiscrete ? 3 : 1.5;

  useEffect(() => {
    setResult(null);
    setCompletedLabs(0);
    setColloquiums(['', '', '']);
    setSeminars([]);
    setAttendance('');
    setIndependentWork('');
  }, [selectedSubject]);

  const calculateGrade = () => {
    let total = 0;
    total += Math.min(Number(attendance) || 0, 10);
    total += Math.min(Number(independentWork) || 0, 10);

    if (!isOS) {
      const collValues = colloquiums.map(Number).filter(n => !isNaN(n) && n > 0);
      const semValues = seminars.map(Number).filter(n => !isNaN(n) && n > 0);
      const allGrades = [...collValues, ...semValues];

      if (allGrades.length > 0) {
        const avg = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
        total += avg * multiplier;
      }
    }

    if (maxLabs > 0) {
      const labScore = (completedLabs / maxLabs) * labTotalPoints;
      total += labScore;
    }
    
    setResult(parseFloat(total.toFixed(2)));
  };

  const getResultMessage = (res: number) => {
    if (res >= 40) return { text: "Əla!", color: "bg-green-500", icon: <CheckCircle2 className="h-5 w-5" /> };
    if (res >= 30) return { text: "Normal", color: "bg-primary", icon: <CheckCircle2 className="h-5 w-5" /> };
    return { text: "Kafi deyil!", color: "bg-destructive", icon: <AlertCircle className="h-5 w-5" /> };
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-6 w-6" />
          Giriş Balı Hesablayıcı
        </CardTitle>
        <CardDescription>
          Qiymətlərinizi daxil edin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Fənn Seçin</Label>
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger id="subject" className="h-12">
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Davamiyyət (Max 10)</Label>
                <Input 
                  type="text" 
                  placeholder="Məs: 10"
                  value={attendance} 
                  onChange={(e) => setAttendance(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Sərbəst İş (Max 10)</Label>
                <Input 
                  type="text" 
                  placeholder="Məs: 10"
                  value={independentWork} 
                  onChange={(e) => setIndependentWork(e.target.value)} 
                  className="h-11"
                />
              </div>
            </div>

            {!isOS && (
              <>
                <div className="space-y-3">
                  <Label>Kollokvium Qiymətləri</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {colloquiums.map((val, idx) => (
                      <Input 
                        key={idx}
                        type="text" 
                        placeholder={`Məs: 10`} 
                        value={val} 
                        onChange={(e) => {
                          const c = [...colloquiums];
                          c[idx] = e.target.value;
                          setColloquiums(c);
                        }} 
                        className="h-11"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Seminar Qiymətləri</Label>
                    <Button variant="outline" size="sm" onClick={() => setSeminars([...seminars, ''])} className="h-8 gap-1">
                      <Plus className="h-4 w-4" /> Əlavə et
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {seminars.map((sem, idx) => (
                      <div key={idx} className="relative group">
                        <Input 
                          type="text" 
                          placeholder={`Məs: 10`} 
                          value={sem} 
                          onChange={(e) => {
                            const s = [...seminars];
                            s[idx] = e.target.value;
                            setSeminars(s);
                          }}
                          className="pr-8 h-11"
                        />
                        <button 
                          onClick={() => setSeminars(seminars.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {maxLabs > 0 && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-1">
                    <Label className="font-bold">Laboratoriya</Label>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Laboratoriya üçün ayrılan ümumi bal: {labTotalPoints} bal
                    </p>
                  </div>
                  <Badge variant="outline" className="font-bold text-primary bg-white">
                    {completedLabs} / {maxLabs}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: maxLabs }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCompletedLabs(idx + 1)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center font-bold ${
                        idx < completedLabs 
                          ? 'bg-primary border-primary text-white shadow-md' 
                          : 'bg-white border-muted-foreground/20'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                {completedLabs > 0 && (
                  <p className="text-[11px] font-medium text-primary mt-2">
                    Cari laboratoriya balınız: {((completedLabs / maxLabs) * labTotalPoints).toFixed(1)} / {labTotalPoints}
                  </p>
                )}
              </div>
            )}

            <Button onClick={calculateGrade} className="w-full text-lg h-14 gap-2 mt-4 shadow-lg font-bold">
              <Calculator className="h-6 w-6" /> Hesabla
            </Button>

            {result !== null && (
              <div className={`mt-6 p-6 ${getResultMessage(result).color} text-white rounded-2xl text-center shadow-xl animate-in zoom-in-95 duration-300`}>
                <p className="text-sm font-medium opacity-90 mb-1 uppercase tracking-wider">Sizin Giriş Balınız</p>
                <h2 className="text-6xl font-black mb-3">{result}</h2>
                <div className="flex justify-center items-center gap-2 bg-white/20 py-2 px-4 rounded-full w-fit mx-auto">
                  {getResultMessage(result).icon}
                  <span className="font-bold text-sm">{getResultMessage(result).text}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedSubject && (
          <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Calculator className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">Zəhmət olmasa dərsi seçin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};