'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// TODO: swap with real case studies
const cases = [
  {
    id: 1,
    industry: 'TELECOM',
    title: 'モバイル総合サポート LINE公式アカウント運用',
    tags: ['LINE', 'Lステップ'],
    image: '/img/2.jpg',
  },
  {
    id: 2,
    industry: 'FINANCE',
    title: 'CRM × Lステップ連携による業務自動化',
    tags: ['RPA', '自動化'],
    image: '/img/4.jpg',
  },
  {
    id: 3,
    industry: 'REAL ESTATE',
    title: '地域密着型の物件仲介サポート',
    tags: ['不動産'],
    image: '/img/6.jpg',
  },
  {
    id: 4,
    industry: 'RETAIL',
    title: 'コールセンター立ち上げ支援',
    tags: ['CS', 'オペレーション'],
    image: '/img/1.jpg',
  },
];

// How many cards fit on screen at each breakpoint.
// Tweak these if you change the card width.
function getVisibleCount(width: number) {
  if (width >= 1024) return 3; // lg
  if (width >= 640) return 2; // sm
  return 1; // mobile
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

  // Card width + left peek must match the number of visible cards,
  // or the last card slides off-screen at maxIndex.
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
        ? 'bg-white hover:bg-gift-green text-gift-near-black hover:text-white cursor-pointer'
        : 'bg-white/40 text-gift-near-black/40 cursor-not-allowed'
    }`;

  return (
    <section className="w-full bg-gift-near-black py-s-80">
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
          CASE STUDY
        </p>
        <h2
          className="font-sans font-extrabold text-white"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          支援事例
        </h2>
        <p className="mt-2 font-sans text-normal font-light text-gift-silver">
          クライアントと共に積み上げてきた実績。
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
                href="#"
                className="group block shrink-0 overflow-hidden rounded-2xl bg-gift-mid-dark transition-colors duration-200 hover:bg-gift-green/10"
                style={{ width: cardW }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-100"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-2 font-display text-small uppercase tracking-widest text-gift-green">
                    {c.industry}
                  </p>
                  <h3 className="mb-3 font-sans text-normal font-semibold leading-snug text-white">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="border border-gift-silver/30 px-2 py-0.5 font-sans text-small text-gift-silver"
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
