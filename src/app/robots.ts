import type { MetadataRoute } from 'next';

const SITE_URL = 'https://gift-inc.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/style-preview'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
