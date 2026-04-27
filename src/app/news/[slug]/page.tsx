import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { getPublishedArticles, getArticleBySlug } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: '記事が見つかりません' };
  }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `/news/${article.slug}`,
      images: article.cover ? [{ url: article.cover }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // Get related articles (same category, exclude current)
  let related: { slug: string; title: string; date: string; category: string }[] = [];
  try {
    const all = await getPublishedArticles();
    related = all
      .filter((a) => a.slug !== article.slug)
      .slice(0, 3)
      .map((a) => ({ slug: a.slug, title: a.title, date: a.date, category: a.category }));
  } catch {
    // ignore
  }

  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-gift-near-black">
        {/* Back link */}
        <div className="border-b border-gift-border py-4">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 font-sans text-small font-medium text-gift-silver transition-colors hover:text-gift-ink"
            >
              ← お知らせ・ブログ一覧へ戻る
            </Link>
          </div>
        </div>

        {/* Article header */}
        <Reveal>
          <section className="py-s-80">
            <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                {article.category && (
                  <span className="rounded-full bg-gift-green/10 px-3 py-1 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    {article.category}
                  </span>
                )}
                <span className="font-sans text-small text-gift-silver">{article.date}</span>
                {article.author && (
                  <span className="font-sans text-small text-gift-silver">by {article.author}</span>
                )}
              </div>
              <h1
                className="font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.2' }}
              >
                {article.title}
              </h1>
            </div>
          </section>
        </Reveal>

        {/* Cover image */}
        {article.cover && (
          <Reveal delay={80}>
            <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.cover}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        )}

        {/* Body */}
        <Reveal delay={100}>
          <section className="pb-s-80">
            <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
              <div
                className="font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
              >
                {article.body.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={i} className="mb-4 mt-8 font-sans text-[20px] font-bold text-gift-ink">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={i} className="mb-4 mt-10 font-sans text-[24px] font-extrabold text-gift-ink">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('# ')) {
                    return (
                      <h1 key={i} className="mb-4 mt-10 font-sans text-[28px] font-extrabold text-gift-ink">
                        {line.replace('# ', '')}
                      </h1>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="mb-2 ml-6 list-disc">
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.startsWith('1. ')) {
                    return (
                      <li key={i} className="mb-2 ml-6 list-decimal">
                        {line.replace(/^\d+\.\s/, '')}
                      </li>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-4" />;
                  return <p key={i} className="mb-4">{line}</p>;
                })}
              </div>

              {article.giftView && (
                <div className="mt-12 rounded-2xl border-l-4 border-gift-green bg-gift-bg-alt p-8">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    GIFT&apos;S VIEW
                  </p>
                  <h2
                    className="mb-6 font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(20px, 2.4vw, 26px)', lineHeight: '1.3' }}
                  >
                    GIFTの視点
                  </h2>
                  <div
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: '2' }}
                  >
                    {article.giftView.split('\n').map((line, i) => {
                      if (line.trim() === '') return <div key={i} className="h-3" />;
                      return <p key={i} className="mb-4">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* Related articles */}
        {related.length > 0 && (
          <Reveal>
            <section className="border-t border-gift-border py-s-80">
              <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  RELATED
                </p>
                <h2
                  className="mb-10 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: '1.25' }}
                >
                  関連記事
                </h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                  {related.map((n) => (
                    <Link key={n.slug} href={`/news/${n.slug}`} className="news-card group block">
                      <div className="p-5">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="font-sans text-small text-gift-silver">{n.date}</span>
                          {n.category && (
                            <span className="font-display text-small uppercase tracking-widest text-gift-green">
                              {n.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-sans text-normal font-semibold leading-snug text-gift-ink">
                          {n.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}
      </main>
      <Footer />
    </>
  );
}
