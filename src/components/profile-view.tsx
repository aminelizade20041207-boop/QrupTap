
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Edit2, BookOpen, GraduationCap, Check, Move, Trash2, Settings } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { FIXED_SCHEDULE } from '@/lib/schedule-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onEditGrade: (subject: string) => void;
}

export const ProfileView = ({ profile, onUpdate, onEditGrade }: ProfileViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(0);

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

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setLastTouch({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - lastTouch.x;
    const deltaY = clientY - lastTouch.y;
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
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
      
      const size = Math.min(img.width, img.height);
      const canvasSize = 400;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      ctx.clip();

      const drawWidth = canvasSize * zoom;
      const drawHeight = (img.height / img.width) * drawWidth;
      
      const finalX = (canvasSize / 2) + position.x;
      const finalY = (canvasSize / 2) + position.y;

      ctx.drawImage(
        img, 
        finalX - (drawWidth / 2), 
        finalY - (drawHeight / 2), 
        drawWidth, 
        drawHeight
      );
      
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onUpdate({ ...profile, photo: dataUrl });
      setIsEditing(false);
      setSelectedImage(null);
    };
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
        <CardHeader className="text-center pb-2 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-xl">
              <AvatarImage src={profile.photo} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            
            {profile.photo && (
              <button 
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 bg-destructive text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-gray-800 translate-x-1/4 -translate-y-1/4"
                title="Şəkli Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-gray-800 translate-x-1/4 translate-y-1/4"
              title="Şəkil Əlavə Et"
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
          <CardDescription className="font-bold text-primary uppercase tracking-widest text-xs">
            {profile.subgroup === 'yuxari' ? 'Yuxarı' : 'Aşağı'} Altqrup
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 border-t">
          <div className="flex justify-around text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Ümumi Fənlər</p>
              <p className="text-xl font-black text-foreground">{subjects.length}</p>
            </div>
            <div className="w-px bg-border h-8 my-auto" />
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Daxil Edilən</p>
              <p className="text-xl font-black text-primary">
                {Object.keys(profile.savedGrades || {}).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground px-1">
          <GraduationCap className="h-5 w-5 text-primary" />
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
                    <span className="font-bold text-sm">{subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {grade !== undefined ? (
                        <div className="flex flex-col">
                          <span className={`text-xl font-black leading-none ${grade >= 30 ? 'text-primary' : 'text-destructive'}`}>
                            {grade}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Bal</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic font-medium">Yoxdur</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEditGrade(subject)}
                      className="text-muted-foreground hover:text-primary h-9 w-9 border-primary/10"
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
              onTouchEnd={() => {
                setIsDragging(false);
                setLastDistance(0);
              }}
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
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-primary" />
                <span className="font-medium">Dartaraq yerini tənzimləyin</span>
              </div>
              <p className="opacity-70">İki barmaqla və ya çarxla yaxınlaşdırın</p>
            </div>

            <canvas ref={canvasRef} width={400} height={400} className="hidden" />
          </div>
          <DialogFooter className="p-4 bg-muted/30 border-t flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Ləğv Et</Button>
            <Button onClick={handleSaveCroppedImage} className="flex-1 gap-2">
              <Check className="h-4 w-4" /> Tamamla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
