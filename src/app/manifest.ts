import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ジャーナル',
    short_name: 'ジャーナル',
    description: 'あきばの毎日の記録',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9',
    theme_color: '#FBBF24',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
