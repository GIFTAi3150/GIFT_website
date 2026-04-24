import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '株式会社GIFT',
    short_name: 'GIFT',
    description:
      'コールセンター・DXコンサル・財務コンサル事業を展開する株式会社GIFTの公式サイト。',
    start_url: '/',
    display: 'standalone',
    background_color: '#EBEEF3',
    theme_color: '#2d6b3f',
    lang: 'ja',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
