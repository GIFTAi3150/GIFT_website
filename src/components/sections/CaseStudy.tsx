'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const cases = [
  {
    id: 1,
    industry: 'CALL CENTER',
    title: 'アウトバウンド特化・自社運営で約300名体制',
    tags: ['通信キャリア', 'SaaS企業', '教育制度'],
    image: '/img/5.jpg',
  },
  {
    id: 2,
    industry: 'DX CONSULTING',
    title: 'LINE・RPA・AI導入をワンストップで支援',
    tags: ['Lステップ認定', 'RPA', 'AI活用'],
    image: '/img/7.jpg',
  },
  {
    id: 3,
    industry: 'FINANCIAL CONSULTING',
    title: '融資支援から財務戦略まで伴走型サポート',
    tags: ['融資支援', '資金調達', 'KPI設計'],
    image: '/img/8.jpg',
  },
];

function getVisibleCount(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export default function CaseStudy() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const update = () => setVisible(getVisibleCount(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const total = cases.length;
  const maxIndex = Math.max(0, total - visible);

  const sizeConfig: Record<number, { card: string; peek: string }> = {
    1: { card: 'min(82vw, 440px)', peek: 'min(6vw, 32px)' },
    2: { card: 'calc(50vw - 28px)', peek: '16px' },
    3: { card: 'calc(33.333vw - 28px)', peek: '16px' },
  };
  const { card: cardW, peek } = sizeConfig[visible] ?? sizeConfig[3];

  const canGoPrev = index > 0;
  const canGoNext = index < maxIndex;

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(maxIndex, next)));
  };

  const arrowClass = (enabled: boolean) =>
    `absolute top-[calc(37.5%)] -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 shadow-lg ${
      enabled
        ? 'bg-white hover:bg-gift-hover text-gift-near-black hover:text-gift-ink cursor-pointer'
        : 'bg-white/40 text-gift-near-black/40 cursor-not-allowed'
    }`;

  return (
    <section className="w-full bg-gift-bg-alt py-s-80">
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
          WORKS
        </p>
        <h2
          className="font-sans font-extrabold text-gift-ink"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          実績・強み
        </h2>
        <p className="mt-2 font-sans text-normal font-light text-gift-silver">
          3つの事業を軸に、累計500社以上を支援。
        </p>
      </div>

      <div className="relative">
        <button
          aria-label="Previous case"
          disabled={!canGoPrev}
          onClick={() => go(index - 1)}
          className={`${arrowClass(canGoPrev)} left-4 md:left-6`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M13 4L7 10L13 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          aria-label="Next case"
          disabled={!canGoNext}
          onClick={() => go(index + 1)}
          className={`${arrowClass(canGoNext)} right-4 md:right-6`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M7 4L13 10L7 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${index} * (${cardW} + 16px) + ${peek}))`,
            }}
          >
            {cases.map((c) => (
              <Link
                key={c.id}
                href="/achievements"
                className="works-card group block shrink-0"
                style={{ width: cardW }}
              >
                <div className="relative overflow-hidden rounded-t-[18px]" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <p className="works-card-industry mb-2 font-display text-small uppercase tracking-widest">
                    {c.industry}
                  </p>
                  <h3 className="works-card-title mb-3 font-sans text-normal font-semibold leading-snug">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="works-card-tag border px-2 py-0.5 font-sans text-small"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
