
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const hasLabs = !isDiscrete && !isOS; 
  const hasColls = !isOS;
  const hasSeminars = !isOS;
  
  const maxLabs = isCN ? 8 : (isOS ? 8 : 5);
  const multiplier = isDiscrete ? 3 : 1.5;

  useEffect(() => {
    setResult(null);
    setCompletedLabs(0);
    setColloquiums(['', '', '']);
    setSeminars([]);
    setAttendance('');
    setIndependentWork('');
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

    // 2. Kollokvium və Seminar balları (Natamam girişlər dəstəklənir)
    const allGrades = [
      ...(hasColls ? colloquiums : []),
      ...(hasSeminars ? seminars : [])
    ].map(Number).filter(n => !isNaN(n) && n > 0);

    if (allGrades.length > 0) {
      const avg = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
      total += avg * multiplier;
    }

    // 3. Laboratoriya balları
    const effectiveMaxLabs = isOS ? 8 : (isCN ? 8 : (isDiscrete ? 0 : 5));
    if (effectiveMaxLabs > 0) {
      const labScore = (completedLabs / effectiveMaxLabs) * (isOS ? 30 : 15);
      total += labScore;
    }

    setResult(parseFloat(total.toFixed(2)));
  };

  const getResultMessage = (res: number) => {
    if (res >= 34) return { text: "Əla! İmtahana tam hazırsan.", color: "bg-green-500", icon: <CheckCircle2 className="h-5 w-5" /> };
    if (res >= 25) return { text: "Yaxşı! Giriş balın çatırdı.", color: "bg-primary", icon: <CheckCircle2 className="h-5 w-5" /> };
    return { text: "Kafi deyil! Daha çox çalışmalısan.", color: "bg-destructive", icon: <AlertCircle className="h-5 w-5" /> };
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-6 w-6" />
          Giriş Balı Hesablayıcı
        </CardTitle>
        <CardDescription>
          Qiymətlərinizi daxil edin. Natamam xanalar hesablamaya təsir etmir.
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
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Davamiyyət (Max 10)</Label>
                <Input 
                  type="number" 
                  placeholder="Xal daxil et..."
                  value={attendance} 
                  onChange={(e) => setAttendance(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Sərbəst İş (Max 10)</Label>
                <Input 
                  type="number" 
                  placeholder="Xal daxil et..."
                  value={independentWork} 
                  onChange={(e) => setIndependentWork(e.target.value)} 
                  className="h-11"
                />
              </div>
            </div>

            {hasColls && (
              <div className="space-y-3">
                <Label>Kollokvium Qiymətləri (Natamam ola bilər)</Label>
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
                      className="h-11"
                    />
                  ))}
                </div>
              </div>
            )}

            {hasSeminars && (
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
                        className="pr-8 h-11"
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
            )}

            {(hasLabs || isOS) && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-bold">Verilmiş Laboratoriya Sayı</Label>
                  <Badge variant="outline" className="font-bold text-primary bg-white">
                    {completedLabs} / {isOS ? 8 : (isCN ? 8 : 5)}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: isOS ? 8 : (isCN ? 8 : 5) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCompletedLabs(idx + 1 === completedLabs ? idx : idx + 1)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center font-bold ${
                        idx < completedLabs 
                          ? 'bg-primary border-primary text-white shadow-md scale-105' 
                          : 'bg-white border-muted-foreground/20 hover:border-primary/50'
                      }`}
                    >
                      {idx < completedLabs ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  * {selectedSubject} üçün cəmi <b>{isOS ? 30 : 15} bal</b> verilmiş laboratoriyalara bölünür.
                </p>
              </div>
            )}

            <Button onClick={calculateGrade} className="w-full text-lg h-14 gap-2 mt-4 shadow-lg font-bold">
              <Calculator className="h-6 w-6" /> Hesabla
            </Button>

            {result !== null && (
              <div className={`mt-6 p-6 ${getResultMessage(result).color} text-white rounded-2xl text-center animate-in zoom-in-95 duration-300 shadow-xl`}>
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
            <p className="text-lg font-medium">Başlamaq üçün bir fənn seçin</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
