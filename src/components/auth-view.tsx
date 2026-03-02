
"use client";

import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { LogIn, UserPlus, Mail, Lock, Chrome, Loader2, RotateCcw } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset' | 'verify';

export function AuthView() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
          setMode('verify');
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setMode('verify');
        }
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMode('verify');
        toast({ title: "Təsdiqləmə Linki Göndərildi", description: "E-mail qutunuzu yoxlayın və linkə klik edin." });
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Göndərildi", description: "Şifrə sıfırlama linki e-poçtunuza göndərildi." });
        setMode('login');
      }
    } catch (error: any) {
      let errorMessage = "Bir xəta baş verdi.";
      if (error.code === 'auth/invalid-credential') errorMessage = "E-mail və ya şifrə səhvdir.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Bu e-mail artıq istifadə olunur.";
      if (error.code === 'auth/weak-password') errorMessage = "Şifrə ən azı 6 simvol olmalıdır.";
      if (error.code === 'auth/popup-closed-by-user') errorMessage = "Giriş pəncərəsi bağlandı.";
      
      toast({ 
        variant: "destructive", 
        title: "Xəta", 
        description: errorMessage
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
      toast({ variant: "destructive", title: "Xəta", description: "Google ilə giriş uğursuz oldu. Provayderin aktiv olduğundan əmin olun." });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (currentUser) {
      try {
        await sendEmailVerification(currentUser);
        toast({ title: "Yenidən Göndərildi", description: "Təsdiqləmə linki e-mailinizə təkrar göndərildi." });
      } catch (err) {
        toast({ variant: "destructive", title: "Xəta", description: "Çox sayda cəhd. Bir az sonra yenidən yoxlayın." });
      }
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-1">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">E-maili Təsdiqləyin</CardTitle>
            <CardDescription>
              Biz <b>{currentUser?.email}</b> ünvanına təsdiqləmə linki göndərdik. Tətbiqə daxil olmaq üçün həmin linkə klik etməlisiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 p-4 rounded-lg text-sm text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              Linkə klik etdikdən sonra səhifəni yeniləyin və ya çıxış edib yenidən daxil olun.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full h-11" onClick={() => window.location.reload()}>
              Linkə Klik Etmişəm, Giriş Et
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={resendVerification}>
              <RotateCcw className="h-4 w-4" /> Linki Yenidən Göndər
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => {
              auth.signOut();
              setMode('login');
            }}>
              Geri Qayıt
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : mode === 'login' ? <LogIn className="h-4 w-4 mr-2" /> : mode === 'register' ? <UserPlus className="h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
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
