
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { NotificationScheduler } from '@/components/notification-scheduler';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'İT24 - Dərs Cədvəli',
  description: 'İT24 qrupu üçün mərkəzi dərs cədvəli və xatırlatmalar.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'İT24',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4A90E2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.getItem('it24_theme') === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <NotificationScheduler />
          {children}
        </FirebaseClientProvider>
        <Toaster />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                const swUrl = '/sw.js?t=' + Date.now();
                
                navigator.serviceWorker.register(swUrl).then(function(reg) {
                  console.log('SW Registered');
                  
                  reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                      installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('New update available. Reloading...');
                          window.location.reload();
                        }
                      };
                    }
                  };
                  
                  setInterval(() => {
                    reg.update();
                  }, 60000);
                }).catch(function(err) {
                  console.log('SW Registration Error:', err);
                });

                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                  }
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
