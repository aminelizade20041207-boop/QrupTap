
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Edit2, BookOpen, GraduationCap, Check, Trash2, Minus, Plus, AlertTriangle, ChevronDown, ChevronUp, StickyNote, Save, X, Library, ExternalLink, FileText, UploadCloud, FileIcon } from 'lucide-react';
import { UserProfile, UserNote, UserMaterial } from '@/lib/types';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(0);
  const [expandedAbsences, setExpandedAbsences] = useState<Record<string, boolean>>({});
  
  const [newNote, setNewNote] = useState('');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isNotesManagerOpen, setIsNotesManagerOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<UserNote | null>(null);

  const [isMaterialsManagerOpen, setIsMaterialsManagerOpen] = useState(false);
  const [isMaterialAddOpen, setIsMaterialAddOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<UserMaterial | null>(null);
  const [materialForm, setMaterialForm] = useState<{ subject: string; title: string; fileName: string; fileData: string; fileType: string }>({ 
    subject: '', 
    title: '', 
    fileName: '', 
    fileData: '', 
    fileType: '' 
  });

  const subjects = Array.from(new Set(FIXED_SCHEDULE.map(s => s.name.split('(')[0].trim())));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsEditing(true);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    if (confirm('Profil şəklini silmək istədiyinizə əminsiniz?')) {
      onUpdate({ ...profile, photo: undefined });
    }
  };

  const toggleAbsence = (subject: string) => {
    setExpandedAbsences(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  const handleUpdateAbsence = (subject: string, delta: number) => {
    const rules = ABSENCE_RULES[subject];
    const current = profile.savedAbsences?.[subject] || 0;
    const maxLimit = rules ? rules.fail : 99;
    
    const newValue = Math.max(0, Math.min(maxLimit, current + delta));
    
    onUpdate({
      ...profile,
      savedAbsences: {
        ...(profile.savedAbsences || {}),
        [subject]: newValue
      }
    });
  };

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    if (noteToEdit) {
      onUpdate({
        ...profile,
        notesList: (profile.notesList || []).map(n => 
          n.id === noteToEdit.id ? { ...n, text: newNote } : n
        )
      });
      toast({ title: "Qeyd yeniləndi" });
    } else {
      const note: UserNote = {
        id: Math.random().toString(36).substr(2, 9),
        text: newNote,
        createdAt: new Date().toLocaleString('az-AZ')
      };
      onUpdate({
        ...profile,
        notesList: [note, ...(profile.notesList || [])]
      });
      toast({ title: "Qeyd əlavə edildi" });
    }
    setNewNote('');
    setNoteToEdit(null);
    setIsNoteDialogOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    onUpdate({
      ...profile,
      notesList: (profile.notesList || []).filter(n => n.id !== id)
    });
    toast({ title: "Qeyd silindi" });
  };

  const handleMaterialFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Xəta", description: "Faylın ölçüsü 2MB-dan çox ola bilməz." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaterialForm(prev => ({
          ...prev,
          fileName: file.name,
          fileData: reader.result as string,
          fileType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMaterial = () => {
    if (!materialForm.subject || !materialForm.title || !materialForm.fileData) {
      toast({ variant: "destructive", title: "Xəta", description: "Bütün xanaları doldurun və faylı seçin." });
      return;
    }

    if (materialToEdit) {
      onUpdate({
        ...profile,
        materialsList: (profile.materialsList || []).map(m => 
          m.id === materialToEdit.id ? { ...m, ...materialForm } : m
        )
      });
      toast({ title: "Material yeniləndi" });
    } else {
      const material: UserMaterial = {
        id: Math.random().toString(36).substr(2, 9),
        ...materialForm,
        createdAt: new Date().toLocaleString('az-AZ')
      };
      onUpdate({
        ...profile,
        materialsList: [material, ...(profile.materialsList || [])]
      });
      toast({ title: "Material əlavə edildi" });
    }
    setMaterialForm({ subject: '', title: '', fileName: '', fileData: '', fileType: '' });
    setMaterialToEdit(null);
    setIsMaterialAddOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    onUpdate({
      ...profile,
      materialsList: (profile.materialsList || []).filter(m => m.id !== id)
    });
    toast({ title: "Material silindi" });
  };

  const handleEditMaterial = (material: UserMaterial) => {
    setMaterialToEdit(material);
    setMaterialForm({ 
      subject: material.subject, 
      title: material.title, 
      fileName: material.fileName, 
      fileData: material.fileData, 
      fileType: material.fileType 
    });
    setIsMaterialAddOpen(true);
  };

  const handleOpenMaterial = (material: UserMaterial) => {
    const link = document.createElement('a');
    link.href = material.fileData;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAbsenceStatus = (subject: string, count: number) => {
    const rules = ABSENCE_RULES[subject];
    if (!rules) return null;

    if (count >= rules.fail) {
      return { label: 'Kəsildin!', color: 'bg-destructive text-white', icon: <AlertTriangle className="h-3 w-3 shrink-0" /> };
    }
    if (count >= rules.m2) {
      return { label: '-2 Bal', color: 'bg-orange-500 text-white', icon: <Minus className="h-3 w-3 shrink-0" /> };
    }
    if (count >= rules.m1) {
      return { label: '-1 Bal', color: 'bg-yellow-500 text-white', icon: <Minus className="h-3 w-3 shrink-0" /> };
    }
    return { label: 'Normal', color: 'bg-green-500 text-white', icon: <Check className="h-3 w-3 shrink-0" /> };
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setLastTouch({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - lastTouch.x;
    const deltaY = clientY - lastTouch.y;
    setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastTouch({ x: clientX, y: clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDistance > 0) {
        const delta = dist / lastDistance;
        setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
      }
      setLastDistance(dist);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  const handleSaveCroppedImage = () => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const canvasSize = 400;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      ctx.clip();

      const drawWidth = canvasSize * zoom;
      const drawHeight = (img.height / img.width) * drawWidth;
      
      const finalX = (canvasSize / 2) + position.x;
      const finalY = (canvasSize / 2) + position.y;

      ctx.drawImage(img, finalX - (drawWidth / 2), finalY - (drawHeight / 2), drawWidth, drawHeight);
      ctx.restore();

      onUpdate({ ...profile, photo: canvas.toDataURL('image/jpeg', 0.8) });
      setIsEditing(false);
      setSelectedImage(null);
    };
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden bg-card">
        <CardHeader className="text-center pb-2 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.photo} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            
            {profile.photo && (
              <button 
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 bg-destructive text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-background translate-x-1/4 -translate-y-1/4"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
              </button>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-background translate-x-1/4 translate-y-1/4"
            >
              <Camera className="h-5 w-5 shrink-0" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
          <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
          <CardDescription className="font-bold text-primary uppercase tracking-widest text-xs">
            {profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} Altqrup
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 border-t space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="gap-2 border-primary/20 hover:bg-primary/5 h-11 font-bold"
              onClick={() => setIsNotesManagerOpen(true)}
            >
              <StickyNote className="h-4 w-4 text-primary shrink-0" />
              Qeydlər ({profile.notesList?.length || 0})
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 border-primary/20 hover:bg-primary/5 h-11 font-bold"
              onClick={() => setIsMaterialsManagerOpen(true)}
            >
              <Library className="h-4 w-4 text-primary shrink-0" />
              Materiallar ({profile.materialsList?.length || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground px-1">
          <GraduationCap className="h-5 w-5 text-primary shrink-0" />
          Giriş Ballarım:
        </h3>
        <div className="grid gap-4">
          {subjects.map(subject => {
            const grade = profile.savedGrades?.[subject];
            const absences = profile.savedAbsences?.[subject] || 0;
            const status = getAbsenceStatus(subject, absences);
            const isExpanded = expandedAbsences[subject];

            return (
              <Card key={subject} className="overflow-hidden hover:shadow-md transition-all border-primary/10 bg-card">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/5 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary shrink-0" />
                      </div>
                      <span className="font-bold text-sm">{subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        {grade !== undefined ? (
                          <div className="flex flex-col">
                            <span className={`text-xl font-black leading-none ${grade >= 30 ? 'text-primary' : 'text-destructive'}`}>
                              {grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-muted-foreground italic font-medium">Bal yoxdur</span>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditGrade(subject)}
                        className="text-muted-foreground hover:text-primary h-9 w-9"
                      >
                        <Edit2 className="h-4 w-4 shrink-0" />
                      </Button>

                      {ABSENCE_RULES[subject] && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleAbsence(subject)}
                          className={cn(
                            "h-9 w-9 transition-all border-primary/10",
                            isExpanded ? "bg-primary text-white border-primary" : "text-primary hover:bg-primary/5"
                          )}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {ABSENCE_RULES[subject] && isExpanded && (
                    <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Qayıb Sayı:</span>
                          <span className="text-[10px] font-bold text-primary/70">Max: {ABSENCE_RULES[subject].fail}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleUpdateAbsence(subject, -1)}
                            disabled={absences <= 0}
                          >
                            <Minus className="h-4 w-4 shrink-0" />
                          </Button>
                          <span className="w-8 text-center font-bold text-lg">{absences}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleUpdateAbsence(subject, 1)}
                            disabled={absences >= ABSENCE_RULES[subject].fail}
                          >
                            <Plus className="h-4 w-4 shrink-0" />
                          </Button>
                        </div>
                      </div>
                      
                      {status && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                          <Badge className={`h-7 px-3 gap-1.5 font-bold ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={isMaterialsManagerOpen} onOpenChange={setIsMaterialsManagerOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh]">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary shrink-0" /> Dərs Materialları
            </DialogTitle>
            <Button size="sm" onClick={() => { setMaterialToEdit(null); setMaterialForm({ subject: '', title: '', fileName: '', fileData: '', fileType: '' }); setIsMaterialAddOpen(true); }} className="rounded-full h-8 w-8 p-0 mr-6">
              <Plus className="h-5 w-5 shrink-0" />
            </Button>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {!profile.materialsList?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Library className="h-16 w-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-medium">Hələ ki, material yoxdur</p>
                  <Button variant="link" onClick={() => setIsMaterialAddOpen(true)}>İlk materialı yüklə</Button>
                </div>
              ) : (
                subjects.map(subject => {
                  const subjectMaterials = (profile.materialsList || []).filter(m => m.subject === subject);
                  if (subjectMaterials.length === 0) return null;
                  
                  return (
                    <div key={subject} className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary px-1">{subject}</h4>
                      <div className="grid gap-2">
                        {subjectMaterials.map(material => (
                          <div key={material.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border group">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                <FileIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{material.title}</p>
                                <button onClick={() => handleOpenMaterial(material)} className="text-[10px] text-muted-foreground flex items-center gap-1 hover:underline truncate">
                                  {material.fileName} <ExternalLink className="h-2 w-2 shrink-0" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => handleEditMaterial(material)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                                <Edit2 className="h-3.5 w-3.5 shrink-0" />
                              </button>
                              <button onClick={() => handleDeleteMaterial(material.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors">
                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isMaterialAddOpen} onOpenChange={setIsMaterialAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{materialToEdit ? 'Materialı Redaktə Et' : 'Yeni Material Yüklə'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fənn Seçin</Label>
              <Select value={materialForm.subject} onValueChange={(v) => setMaterialForm({ ...materialForm, subject: v })}>
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
            <div className="space-y-2">
              <Label>Başlıq (məs: PDF Mühazirə)</Label>
              <Input 
                value={materialForm.title} 
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Materialın adını daxil edin"
              />
            </div>
            <div className="space-y-2">
              <Label>Fayl Seçin</Label>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full border-dashed gap-2 h-20"
                  onClick={() => materialFileInputRef.current?.click()}
                >
                  <UploadCloud className="h-6 w-6 text-primary shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">Faylı yaddaşdan seçin</span>
                    <span className="text-[10px] text-muted-foreground">PDF, Şəkil və ya Digər (Max 2MB)</span>
                  </div>
                </Button>
                {materialForm.fileName && (
                  <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-medium truncate flex-1">{materialForm.fileName}</span>
                    <button onClick={() => setMaterialForm(p => ({ ...p, fileName: '', fileData: '', fileType: '' }))} className="text-destructive">
                      <X className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={materialFileInputRef} 
                  onChange={handleMaterialFileUpload} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsMaterialAddOpen(false)}>Ləğv Et</Button>
            <Button onClick={handleSaveMaterial} disabled={!materialForm.subject || !materialForm.title || !materialForm.fileData}>
              {materialToEdit ? 'Yenilə' : 'Yadda Saxla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotesManagerOpen} onOpenChange={setIsNotesManagerOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh]">
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary shrink-0" /> Mənim Qeydlərim
            </DialogTitle>
            <Button size="sm" onClick={() => { setNoteToEdit(null); setNewNote(''); setIsNoteDialogOpen(true); }} className="rounded-full h-8 w-8 p-0 mr-6">
              <Plus className="h-5 w-5 shrink-0" />
            </Button>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {!profile.notesList?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <StickyNote className="h-16 w-16 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-medium">Hələ ki, qeyd yoxdur</p>
                  <Button variant="link" onClick={() => { setNoteToEdit(null); setNewNote(''); setIsNoteDialogOpen(true); }}>İlk qeydi yaz</Button>
                </div>
              ) : (
                profile.notesList.map((note) => (
                  <div key={note.id} className="group relative bg-muted/30 p-4 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all">
                    <p className="text-sm whitespace-pre-wrap pr-16">{note.text}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/5">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">{note.createdAt}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setNoteToEdit(note); setNewNote(note.text); setIsNoteDialogOpen(true); }}
                          className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 shrink-0" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{noteToEdit ? 'Qeydi Redaktə Et' : 'Yeni Qeyd'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Qeydinizi bura yazın..."
              className="min-h-[180px] resize-none rounded-xl"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Ləğv Et</Button>
            <Button onClick={handleSaveNote} disabled={!newNote.trim()}>
              {noteToEdit ? 'Yenilə' : 'Yadda Saxla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-center">Şəkli Dartaraq Tənzimlə</DialogTitle>
          </DialogHeader>
          <div className="p-10 flex flex-col items-center">
            <div 
              className="relative w-64 h-64 border-4 border-primary/30 rounded-full overflow-hidden bg-muted cursor-move touch-none shadow-inner"
              onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => { setIsDragging(false); setLastDistance(0); }}
              onWheel={handleWheel}
            >
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="max-w-none pointer-events-none select-none absolute"
                  style={{
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                    left: '50%',
                    top: '50%',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              )}
            </div>
            <div className="mt-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2 bg-muted/50 p-3 rounded-lg w-full">
              <span className="font-medium">Dartaraq yerini tənzimləyin</span>
            </div>
            <canvas ref={canvasRef} width={400} height={400} className="hidden" />
          </div>
          <DialogFooter className="p-4 bg-muted/30 border-t flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Ləğv Et</Button>
            <Button onClick={handleSaveCroppedImage} className="flex-1 gap-2"><Check className="h-4 w-4 shrink-0" /> Tamamla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
