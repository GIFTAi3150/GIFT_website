import type { MetadataRoute } from 'next';
import { getPublishedArticles, getPublishedMembers } from '@/lib/notion';
import membersFallback from '@/data/members.json';

const SITE_URL = 'https://gift-inc.org';

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/company', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services/callcenter', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services/dx-consulting', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services/finance-consulting', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/achievements', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/recruit', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/member', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Members — try Notion, fall back to static JSON so sitemap always builds.
  let memberEntries: MetadataRoute.Sitemap = [];
  try {
    const members = await getPublishedMembers();
    memberEntries = members.map((m) => ({
      url: `${SITE_URL}/member/${m.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    memberEntries = membersFallback.map((m: { id: string }) => ({
      url: `${SITE_URL}/member/${m.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  }

  // News — try Notion; if it fails, skip (no JSON fallback for articles).
  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await getPublishedArticles();
    newsEntries = articles.map((a) => ({
      url: `${SITE_URL}/news/${a.slug}`,
      lastModified: a.date ? new Date(a.date.replace(/\./g, '-')) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }));
  } catch {
    newsEntries = [];
  }

  return [...staticEntries, ...memberEntries, ...newsEntries];
}
