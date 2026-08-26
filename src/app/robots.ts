import type { MetadataRoute } from 'next';

// Canonical host is www — see the note in sitemap.ts.
const SITE_URL = 'https://www.gift-inc.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only /api/ is blocked. The retired routes (/member, /recruit,
        // /achievements, /news, /style-preview, /dev, the two old /services
        // pages) are intentionally left crawlable: they 301 in next.config.js,
        // and a Disallow rule would stop Google fetching them at all, so it
        // would never see the redirect and would keep the stale URLs indexed.
        // Blocking is the slow way to de-index; letting the 301 be crawled is
        // the fast way.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
