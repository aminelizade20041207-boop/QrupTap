
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
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
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
                // Versiyanı yeniləmək üçün timestamp istifadə edirik
                const swUrl = '/sw.js?v=' + Date.now();
                
                navigator.serviceWorker.register(swUrl).then(function(reg) {
                  console.log('SW Registered with versioning');
                  
                  // Əgər yeni SW tapılarsa dərhal aktiv et
                  reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                      installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('Yeni versiya aktivləşdirilir...');
                          window.location.reload();
                        }
                      };
                    }
                  };
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
