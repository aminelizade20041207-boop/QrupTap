
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'com.it24.app.v1',
    name: 'İT24 Dərs Cədvəli',
    short_name: 'İT24',
    description: 'İT24 qrupu üçün mərkəzi dərs cədvəli, giriş balı hesablayıcı və xatırlatmalar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4A90E2',
    orientation: 'portrait',
    scope: '/',
    lang: 'az',
    dir: 'ltr',
    display_override: ['standalone', 'window-controls-overlay', 'minimal-ui'],
    categories: ['education', 'productivity', 'utilities'],
    prefer_related_applications: false,
    icons: [
      {
        src: 'https://placehold.co/192x192.png?text=IT24',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/192x192.png?text=IT24',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512.png?text=IT24',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512.png?text=IT24',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: 'https://placehold.co/1080x1920.png?text=Günlük+Cədvəl',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Günlük Dərs Cədvəli',
        form_factor: 'narrow'
      },
      {
        src: 'https://placehold.co/1920x1080.png?text=Həftəlik+Cədvəl',
        sizes: '1920x1080',
        type: 'image/png',
        label: 'Həftəlik Cədvəl Görünüşü',
        form_factor: 'wide'
      }
    ]
  } as any;
}
