
"use client";

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, Lock, Chrome, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset';

export function AuthView() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Göndərildi", description: "Şifrə sıfırlama linki e-poçtunuza göndərildi." });
        setMode('login');
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Xəta", 
        description: error.message === 'Firebase: Error (auth/invalid-credential).' ? "E-mail və ya şifrə səhvdir." : "Bir xəta baş verdi." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Xəta", description: "Google ilə giriş uğursuz oldu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-1">
          <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">İT24</div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Giriş' : mode === 'register' ? 'Qeydiyyat' : 'Şifrəni Sıfırla'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Dərs cədvəlinə daxil olmaq üçün məlumatlarınızı daxil edin.' : 
             mode === 'register' ? 'Yeni hesab yaradın.' : 'E-mail ünvanınızı daxil edin.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10" 
                  placeholder="nümunə@mail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Şifrə</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}
            
            {mode === 'login' && (
              <button 
                type="button" 
                onClick={() => setMode('reset')} 
                className="text-xs text-primary hover:underline"
              >
                Şifrəni unutmusunuz?
              </button>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : mode === 'login' ? <LogIn className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {mode === 'login' ? 'Daxil ol' : mode === 'register' ? 'Qeydiyyatdan keç' : 'Link göndər'}
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><Separator /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Və ya</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogleSignIn} disabled={loading}>
              <Chrome className="h-4 w-4 mr-2" /> Google ilə davam et
            </Button>

            <div className="text-center text-sm">
              {mode === 'login' ? (
                <p>Hesabınız yoxdur? <button type="button" onClick={() => setMode('register')} className="text-primary font-bold hover:underline">Qeydiyyatdan keçin</button></p>
              ) : (
                <p>Artıq hesabınız var? <button type="button" onClick={() => setMode('login')} className="text-primary font-bold hover:underline">Giriş edin</button></p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
