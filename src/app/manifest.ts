
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'com.it24.app',
    name: 'İT24 Dərs Cədvəli',
    short_name: 'İT24',
    description: 'İT24 qrupu üçün mərkəzi dərs cədvəli, giriş balı hesablayıcı və xatırlatmalar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4A90E2',
    orientation: 'portrait',
    scope: '/',
    categories: ['education', 'productivity', 'utilities'],
    prefer_related_applications: false,
    related_applications: [],
    icons: [
      {
        src: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/192x192/4A90E2/ffffff?text=IT24',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/4A90E2/ffffff?text=IT24',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://placehold.co/512x512/4A90E2/ffffff?text=IT24',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: 'https://picsum.photos/seed/it24mobile1/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Günlük Dərs Cədvəli (Mobil)',
        form_factor: 'narrow'
      },
      {
        src: 'https://picsum.photos/seed/it24mobile2/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Giriş Balı Hesablayıcı (Mobil)',
        form_factor: 'narrow'
      },
      {
        src: 'https://picsum.photos/seed/it24wide1/1920/1080',
        sizes: '1920x1080',
        type: 'image/png',
        label: 'Həftəlik Cədvəl Görünüşü (Masaüstü)',
        form_factor: 'wide'
      }
    ],
    shortcuts: [
      {
        name: 'Giriş Balı Hesabla',
        short_name: 'Hesabla',
        description: 'Giriş balını dərhal hesablayın',
        url: '/?tab=calculator',
        icons: [{ src: 'https://placehold.co/192x192/4A90E2/ffffff?text=+', sizes: '192x192' }]
      }
    ]
  };
}
