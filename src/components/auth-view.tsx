
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Chrome, Loader2, RotateCcw, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

type AuthMode = 'login' | 'register' | 'reset' | 'verify';

export function AuthView() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        if (!userCredential.user.emailVerified && userCredential.user.providerData[0]?.providerId === 'password') {
          await sendEmailVerification(userCredential.user);
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
      toast({ variant: "destructive", title: "Xəta", description: "Google ilə giriş uğursuz oldu." });
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
        toast({ variant: "destructive", title: "Xəta", description: "Bir az sonra yenidən yoxlayın." });
      }
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9fa]">
        <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-[32px]">
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="bg-[#e8f5e9] w-20 h-20 rounded-full flex items-center justify-center text-[#2e7d32] mx-auto">
              <Mail className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">E-maili Təsdiqləyin</h1>
              <p className="text-gray-500 text-sm">
                Biz <b>{currentUser?.email}</b> ünvanına təsdiqləmə linki göndərdik.
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl text-xs text-amber-700 border border-amber-100 leading-relaxed">
              Təsdiqləmə linkinə klik etdikdən sonra daxil ola bilərsiniz.
            </div>
            <div className="space-y-3 pt-4">
              <Button className="w-full h-12 rounded-xl bg-[#1a1c1e] hover:bg-[#2c2e30] font-bold" onClick={() => window.location.reload()}>
                Linkə Klik Etmişəm
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-bold border-gray-200" onClick={resendVerification}>
                <RotateCcw className="h-4 w-4" /> Yenidən Göndər
              </Button>
              <button 
                onClick={() => { auth.signOut(); setMode('login'); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Geri qayıt
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Sol Panel - İllüstrasiya */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-[#e8f5e9] relative">
          <div className="relative w-full aspect-square max-w-[300px] mb-8">
            <div className="absolute inset-0 bg-[#c8e6c9] rounded-full opacity-30 animate-pulse" />
            <img 
              src="https://picsum.photos/seed/portal/600/600" 
              alt="Portal Illustration" 
              className="w-full h-full object-contain relative z-10 rounded-full"
              data-ai-hint="student illustration"
            />
          </div>
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-2xl font-bold text-[#1b5e20]">Dərs Cədvəli Portalı</h2>
            <p className="text-[#4caf50] font-medium text-sm">Mingəçevir Dövlət Universiteti</p>
            
            <div className="flex gap-1.5 justify-center mt-6">
              <div className="w-2 h-2 rounded-full bg-[#81c784] opacity-40" />
              <div className="w-6 h-2 rounded-full bg-[#4caf50]" />
              <div className="w-2 h-2 rounded-full bg-[#81c784] opacity-40" />
              <div className="w-2 h-2 rounded-full bg-[#81c784] opacity-40" />
            </div>
          </div>
        </div>

        {/* Sağ Panel - Forma */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="space-y-8 max-w-[360px] mx-auto w-full">
            
            {/* Logo və Başlıq */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#1b5e20] text-white px-3 py-1.5 rounded-lg font-black text-sm tracking-tighter">QT</div>
                <h1 className="text-xl font-bold text-gray-800">QrupTap</h1>
              </div>
              <h2 className="text-sm font-medium text-gray-400">
                {mode === 'login' ? 'Hesabınıza daxil olun' : mode === 'register' ? 'Yeni hesab yaradın' : 'Şifrəni bərpa edin'}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 ml-1">E-poçt</Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#4caf50] px-4" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="password" className="text-xs font-bold text-gray-500">Şifrə</Label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => setMode('reset')} className="text-[10px] text-[#4caf50] font-bold hover:underline">
                          Şifrəni unutmusunuz?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#4caf50] px-4 pr-12" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <Button type="submit" className="w-full h-14 rounded-2xl bg-[#1a1c1e] hover:bg-[#2c2e30] font-bold text-lg shadow-lg transition-all active:scale-95" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : mode === 'login' ? 'Daxil ol' : mode === 'register' ? 'Qeydiyyat' : 'Göndər'}
                </Button>

                {mode === 'login' && (
                  <>
                    <div className="relative w-full py-2">
                      <div className="absolute inset-0 flex items-center"><Separator /></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2 text-gray-400">Və ya</span></div>
                    </div>

                    <Button type="button" variant="outline" className="w-full h-12 rounded-2xl border-gray-100 bg-white hover:bg-gray-50 font-bold gap-3" onClick={handleGoogleSignIn} disabled={loading}>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                      Google ilə daxil ol
                    </Button>
                  </>
                )}
              </div>

              <div className="text-center pt-4">
                {mode === 'login' ? (
                  <p className="text-xs text-gray-400 font-medium">
                    Hesabınız yoxdur? <button type="button" onClick={() => setMode('register')} className="text-[#4caf50] font-bold hover:underline">Qeydiyyat</button>
                  </p>
                ) : (
                  <button type="button" onClick={() => setMode('login')} className="flex items-center gap-1 text-xs text-gray-400 font-bold mx-auto hover:text-gray-600">
                    <ChevronLeft className="h-3 w-3" /> Girişə qayıt
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
