import type { MetadataRoute } from 'next';

// Canonical host is www — gift-inc.org 301s here (2026-07-13 domain switch).
// Listing the bare host would fill the sitemap with URLs that all redirect,
// which is how Google ends up treating the two hosts as two different sites.
const SITE_URL = 'https://www.gift-inc.org';

// Public routes only — this list must stay in sync with the Header/Footer nav.
//
// It previously also advertised /member, /member/:id, /recruit, /achievements,
// /news and the two retired /services pages. Nothing on the site linked to
// them, but the sitemap handed them straight to Google, which indexed them and
// sent real visitors in from search (Clarity, 2026-08-24: a session that
// entered from google.com and ended on /member/kyo). Those routes now 301 in
// next.config.js. Do not re-add a path here unless it is reachable from the nav.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/company', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services/aiops', priority: 0.9, changeFrequency: 'monthly' },
  // Added 2026-09-03 when /services/ai-training left soft launch: linked from
  // both the Header and Footer service menus, so it qualifies under the rule.
  { path: '/services/ai-training', priority: 0.8, changeFrequency: 'monthly' },
  // Added back 2026-08-26 when /plans shipped. It qualifies under the rule
  // above: it is linked from both the Header and the Footer service menus.
  { path: '/plans', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
