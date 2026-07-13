import type { MetadataRoute } from 'next';

// Canonical host is www — see the note in sitemap.ts.
const SITE_URL = 'https://www.gift-inc.org';

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
