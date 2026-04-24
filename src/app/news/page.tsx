import type { Metadata } from 'next';
import { getPublishedArticles } from '@/lib/notion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsGrid from './NewsGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'お知らせ・ブログ',
  description:
    '株式会社GIFTからのお知らせ、DX・コールセンター・財務領域のノウハウ記事をお届けします。',
  alternates: { canonical: '/news' },
};

export default async function NewsPage() {
  let articles: { slug: string; title: string; date: string; category: string; excerpt: string; cover: string }[] = [];

  try {
    const notionArticles = await getPublishedArticles();
    articles = notionArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      category: a.category,
      excerpt: a.excerpt,
      cover: a.cover,
    }));
  } catch {
    // Notion fetch failed — show empty state
    articles = [];
  }

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              COLUMN / NEWS
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              コラム・お知らせ
            </h1>
            <p
              className="mt-6 max-w-2xl font-sans text-normal font-light text-gift-silver"
              style={{ lineHeight: '2' }}
            >
              GIFTからのお知らせ・プレスリリース、および事業領域（DX・AI・財務・コールセンター）に関するノウハウや業界トレンドをお届けします。
            </p>
          </div>
        </section>

        <NewsGrid articles={articles} />
      </main>
      <Footer />
    </>
  );
}
