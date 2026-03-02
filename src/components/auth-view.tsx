
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
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Loader2, Eye, EyeOff, ChevronLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset' | 'verify';

const SLIDES = [
  {
    image: "https://picsum.photos/seed/library_study/800/800",
    description: "Bütün dərsləriniz və materiallarınız bir yerdə.",
    hint: "university library"
  },
  {
    image: "https://picsum.photos/seed/laptop_work/800/800",
    description: "Dərs vaxtlarınızı səmərəli şəkildə idarə edin.",
    hint: "student laptop"
  },
  {
    image: "https://picsum.photos/seed/academic_books/800/800",
    description: "Giriş ballarınızı asanlıqla hesablayın və izləyin.",
    hint: "academic books"
  },
  {
    image: "https://picsum.photos/seed/modern_classroom/800/800",
    description: "Akademik qrupunuz üçün mərkəzləşmiş cədvəl sistemi.",
    hint: "university classroom"
  }
];

export function AuthView() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        toast({ title: "Təsdiqləmə Linki Göndərildi", description: "E-mail qutunuzu yoxlayın (Spam qovluğuna da baxın)." });
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
      
      toast({ variant: "destructive", title: "Xəta", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Xəta", description: "Google ilə giriş uğursuz oldu." });
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f9fa]">
        <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-[32px] p-8 md:p-12 text-center space-y-6">
          <div className="bg-[#e8f5e9] w-20 h-20 rounded-full flex items-center justify-center text-[#2e7d32] mx-auto">
            <Mail className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">E-maili Təsdiqləyin</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Biz <b>{currentUser?.email}</b> ünvanına link göndərdik. Təsdiqlədikdən sonra tətbiqi yeniləyin.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Button className="w-full h-12 rounded-xl bg-[#1a1c1e] hover:bg-[#2c2e30] text-white font-bold" onClick={() => window.location.reload()}>
              Yenilə / Giriş Et
            </Button>
            <button onClick={() => { auth.signOut(); setMode('login'); }} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Geri qayıt
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden min-h-[650px]">
        
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-[#e8f5e9] relative transition-all duration-700">
          <div className="relative w-full aspect-square max-w-[320px] mb-8 overflow-hidden rounded-full shadow-inner border-4 border-white/50">
            {SLIDES.map((slide, idx) => (
              <img 
                key={idx}
                src={slide.image} 
                alt="QrupTap" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                data-ai-hint={slide.hint}
              />
            ))}
          </div>
          <div className="text-center relative z-10 min-h-[60px] w-full px-6">
            {SLIDES.map((slide, idx) => (
              <div key={idx} className={`transition-all duration-700 absolute inset-0 flex items-center justify-center ${activeSlide === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <p className="text-[#4caf50] font-bold text-base leading-relaxed">{slide.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-center mt-20">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  activeSlide === idx ? 'w-8 bg-[#4caf50]' : 'w-2 bg-[#81c784] opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="space-y-8 max-w-[360px] mx-auto w-full">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#1b5e20] text-white px-3 py-1.5 rounded-lg font-black text-sm tracking-tighter shadow-md">QT</div>
                <h1 className="text-xl font-bold text-gray-800">QrupTap</h1>
              </div>
              <h2 className="text-sm font-medium text-gray-400">
                {mode === 'login' ? 'Xoş gördük! Hesabınıza daxil olun' : mode === 'register' ? 'Yeni hesab yaradın' : 'Şifrəni bərpa edin'}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tight">E-poçt</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#4caf50] px-4 text-gray-900 font-medium" 
                    placeholder="email@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-tight">Şifrə</Label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => setMode('reset')} className="text-[10px] text-[#4caf50] font-bold hover:underline">
                          Şifrənizi unutmusunuz?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#4caf50] px-4 pr-12 text-gray-900 font-medium" 
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
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-[#1a1c1e] hover:bg-[#2c2e30] text-white font-bold text-lg shadow-lg transition-all active:scale-95" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : mode === 'login' ? 'Daxil ol' : mode === 'register' ? 'Qeydiyyat' : 'Link Göndər'}
                </Button>

                {mode === 'login' && (
                  <>
                    <div className="relative w-full py-2">
                      <div className="absolute inset-0 flex items-center"><Separator className="bg-gray-100" /></div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-3 text-gray-400">Və ya</span></div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold gap-3 transition-colors flex items-center justify-center" 
                      onClick={handleGoogleSignIn} 
                      disabled={loading}
                    >
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
