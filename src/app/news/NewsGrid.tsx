'use client';

import { useState } from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';

interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  cover: string;
}

export default function NewsGrid({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<string>('All');

  const allCategories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
  const categories = ['All', ...allCategories];

  const filtered = active === 'All' ? articles : articles.filter((a) => a.category === active);

  return (
    <>
      {/* Category filter */}
      {articles.length > 0 && (
        <section className="border-b border-gift-border py-8">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const count =
                  c === 'All' ? articles.length : articles.filter((a) => a.category === c).length;
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
                    <span className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-gift-silver'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* News grid */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="mb-2 font-sans text-medium font-bold text-gift-ink">
                記事はまだありません
              </p>
              <p className="font-sans text-normal text-gift-silver">
                コンテンツは近日公開予定です。お楽しみに！
              </p>
            </div>
          ) : (
            <div
              key={active}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
            >
              {filtered.map((n, i) => (
                <Reveal key={n.slug} delay={(i % 3) * 90}>
                  <Link href={`/news/${n.slug}`} className="news-card group block">
                    {n.cover && (
                      <div className="relative overflow-hidden rounded-t-[16px]" style={{ aspectRatio: '16/10' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={n.cover}
                          alt={n.title}
                          className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:brightness-100"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="font-sans text-small text-gift-silver">{n.date}</span>
                        {n.category && (
                          <span className="rounded-full bg-gift-green/10 px-3 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                            {n.category}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-3 font-sans text-normal font-semibold leading-snug text-gift-ink">
                        {n.title}
                      </h3>
                      <p className="font-sans text-small font-light leading-relaxed text-gift-silver line-clamp-3">
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
    </>
  );
}
