
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'İT24 Dərs Cədvəli',
    short_name: 'İT24',
    description: 'İT24 qrupu üçün mərkəzi dərs cədvəli və xatırlatmalar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4A90E2',
    orientation: 'portrait',
    scope: '/',
    categories: ['education', 'productivity', 'utilities'],
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
        src: 'https://picsum.photos/seed/it24ss1/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Günlük Dərs Cədvəli'
      },
      {
        src: 'https://picsum.photos/seed/it24ss2/1080/1920',
        sizes: '1080x1920',
        type: 'image/png',
        label: 'Həftəlik Görünüş'
      }
    ]
  };
}
