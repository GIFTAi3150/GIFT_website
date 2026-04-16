import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import news from '@/data/news.json';

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const index = news.findIndex((n) => n.slug === params.slug);
  if (index === -1) notFound();

  const article = news[index];
  const related = news.filter((n) => n.slug !== article.slug).slice(0, 3);

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
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
              <div className="mb-6 flex items-center gap-4">
                <span className="font-display text-small uppercase tracking-widest text-gift-green">
                  {article.category}
                </span>
                <span className="font-sans text-small text-gift-silver">{article.date}</span>
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

        {/* Hero image */}
        <Reveal delay={100}>
          <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: '16/9' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Body */}
        <Reveal delay={150}>
          <section className="py-s-80">
            <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
              <p
                className="mb-8 font-sans font-medium text-gift-ink"
                style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', lineHeight: '1.8' }}
              >
                {article.excerpt}
              </p>
              <div
                className="font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                {article.body.split('\n').map((para, i) => (
                  <p key={i} className="mb-6">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Related articles */}
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
                    <div
                      className="relative overflow-hidden rounded-t-[16px]"
                      style={{ aspectRatio: '16/10' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={n.image}
                        alt={n.title}
                        className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:brightness-100"
                      />
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-sans text-small text-gift-silver">{n.date}</span>
                        <span className="font-display text-small uppercase tracking-widest text-gift-green">
                          {n.category}
                        </span>
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
      </main>
      <Footer />
    </>
  );
}
