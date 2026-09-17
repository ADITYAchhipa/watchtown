import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WatchTown - Buy First Copy Watches Online',
    short_name: 'WatchTown',
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://watchtown.in/wp-content/uploads/2025/05/cropped-android-chrome-512x512-2-270x270.png',
        sizes: '270x270',
        type: 'image/png',
      },
    ],
  };
}
