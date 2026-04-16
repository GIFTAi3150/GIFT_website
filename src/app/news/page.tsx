'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import news from '@/data/news.json';

const categories = ['All', 'お知らせ', 'プレスリリース', 'DX', 'AI', '財務', 'コールセンター'];

export default function NewsPage() {
  const [active, setActive] = useState<string>('All');

  const filtered = active === 'All' ? news : news.filter((n) => n.category === active);

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

        {/* Category filter */}
        <section className="border-b border-gift-border py-8">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const count =
                  c === 'All' ? news.length : news.filter((n) => n.category === c).length;
                const isActive = active === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActive(c)}
                    className={`rounded-full border px-4 py-2 font-sans text-small font-medium transition-colors ${
                      isActive
                        ? 'border-gift-ink bg-gift-ink text-white'
                        : 'border-gift-border bg-white text-gift-ink hover:border-gift-ink'
                    }`}
                  >
                    {c}
                    <span
                      className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-gift-silver'}`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* News grid */}
        <section className="py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="py-20 text-center font-sans text-normal text-gift-silver">
                該当する記事がありません。
              </p>
            ) : (
              <div
                key={active}
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
              >
                {filtered.map((n, i) => (
                  <Reveal key={n.slug} delay={(i % 3) * 90}>
                    <Link href={`/news/${n.slug}`} className="news-card group block">
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
                        <h3 className="mb-2 font-sans text-normal font-semibold leading-snug text-gift-ink">
                          {n.title}
                        </h3>
                        <p className="font-sans text-small font-light leading-relaxed text-gift-silver line-clamp-2">
                          {n.excerpt}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
