
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'İT24 Dərs Cədvəli',
    short_name: 'İT24',
    description: 'İT24 qrupu üçün mərkəzi dərs cədvəli və xatırlatmalar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F3F4F6',
    theme_color: '#4A90E2',
    icons: [
      {
        src: 'https://picsum.photos/seed/it24-icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/it24-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
