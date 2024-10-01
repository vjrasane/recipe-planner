import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Menu',
    short_name: 'Menu',
    description: 'Weekly Menu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }, {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      }, {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
  }
}
