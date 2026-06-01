'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

gsap.registerPlugin(ScrollTrigger);

// Bento mosaic — one big hero card on the left, two smaller cards
// stacked on the right. On mobile the grid collapses to a single
// column (big card first, then the two smaller cards beneath).
// Entrance is a quiet fade-in only; no count-up, no slide.

type Metric = {
  prefix?: string;
  value: string;
  suffix: string;
  label: string;
};

type CaseEntry = {
  id: number;
  iconId: keyof typeof SERVICE_ICON_BY_ID;
  industry: string;
  title: string;
  href: string;
  metrics: Metric[];
};

const cases: CaseEntry[] = [
  {
    id: 1,
    iconId: 'callcenter',
    industry: 'CALL CENTER',
    title: 'アウトバウンド特化・自社運営の約300名体制',
    href: '/services/callcenter',
    metrics: [
      { value: '300', suffix: '名+', label: '体制' },
      { value: '2018', suffix: '年〜', label: '運営開始' },
    ],
  },
  {
    id: 2,
    iconId: 'dx-consulting',
    industry: 'DX CONSULTING',
    title: 'LINE・RPA・AI導入をワンストップで支援',
    href: '/services/dx-consulting',
    metrics: [{ value: '50', suffix: '社+', label: '支援企業' }],
  },
  {
    id: 3,
    iconId: 'finance-consulting',
    industry: 'FINANCIAL CONSULTING',
    title: '融資支援から財務戦略まで伴走型サポート',
    href: '/services/finance-consulting',
    metrics: [{ prefix: '¥', value: '10', suffix: '億+', label: '融資調達' }],
  },
];

export default function CaseStudy() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Subtle fade-in stagger. No vertical slide and no count-up —
    // the metrics are facts, not theatre, so we just reveal them.
    document.querySelectorAll<HTMLElement>('.works-bento-card').forEach((el, i) => {
      const tween = gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const big = cases[0];
  const smalls = cases.slice(1);
  const BigIcon = SERVICE_ICON_BY_ID[big.iconId];

  return (
    <section className="w-full bg-gift-bg-alt py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        {/* Heading + mascot share a relative wrapper so the mascot is
            absolutely positioned within the heading block — immediately
            visible the moment the section enters the viewport. */}
        <div className="relative mb-12 md:mb-16">
          <div className="flex flex-col gap-3 text-center">
            <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
              WORKS
            </p>
            <h2
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
            >
              実績・強み
            </h2>
            <p className="font-sans text-normal font-light text-gift-silver">
              3つの事業で積み上げてきた、これまでの成果。
            </p>
          </div>

          {/* Mascot — jump + 360° flip. Floats in the empty whitespace to
              the right of the centered heading text on desktop.
              Hidden on mobile (no horizontal room). */}
          <div className="works-mascot max-lg:hidden" aria-hidden>
            <img src="/achievements/GIFT_mascot_space_render.png" alt="" />
          </div>
        </div>

        {/* Bento — single column on mobile, 12-col × 2-row grid from lg.
            Big card spans 7 cols × 2 rows; small cards take 5 cols × 1
            row each, stacked in the right column. min-h on the grid
            keeps the proportions tasteful even when small-card content
            is short. */}
        <div className="grid grid-cols-1 gap-5 lg:min-h-[680px] lg:grid-cols-12 lg:grid-rows-2 lg:gap-6">
          {/* BIG card — Call Center */}
          <Link
            href={big.href}
            className="works-bento-card group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-gift-border bg-white p-8 opacity-0 transition-[box-shadow,border-color] duration-300 hover:border-gift-green hover:shadow-[0_28px_64px_-22px_rgba(17,27,33,0.22)] lg:col-span-7 lg:row-span-2 lg:p-12"
          >
            {/* Decorative icon — oversized, low-opacity, anchored to
                the top-right corner. Acts as a watermark / brand mark
                so the big card doesn't feel empty. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 text-gift-green opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.1]"
            >
              {BigIcon && <BigIcon className="h-[420px] w-[420px]" />}
            </div>

            <div className="relative">
              <p className="mb-5 font-display text-[12px] font-bold uppercase tracking-[0.25em] text-gift-green">
                01 — {big.industry}
              </p>
              <h3
                className="font-sans font-extrabold leading-tight text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}
              >
                {big.title}
              </h3>
            </div>

            <div className="relative mt-10">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-gift-border pt-8">
                {big.metrics.map((m) => (
                  <div key={m.label}>
                    <p
                      className="flex items-baseline gap-1 font-display font-extrabold leading-none text-gift-ink"
                      style={{ fontSize: 'clamp(48px, 6vw, 72px)' }}
                    >
                      {m.prefix && <span>{m.prefix}</span>}
                      <span>{m.value}</span>
                      <span
                        className="text-gift-green"
                        style={{ fontSize: '0.4em' }}
                      >
                        {m.suffix}
                      </span>
                    </p>
                    <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.18em] text-gift-silver">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* SMALL cards — DX + Finance */}
          {smalls.map((c, idx) => {
            const Icon = SERVICE_ICON_BY_ID[c.iconId];
            const num = String(idx + 2).padStart(2, '0');
            return (
              <Link
                key={c.id}
                href={c.href}
                className="works-bento-card group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-gift-border bg-white p-7 opacity-0 transition-[box-shadow,border-color] duration-300 hover:border-gift-green hover:shadow-[0_28px_64px_-22px_rgba(17,27,33,0.22)] lg:col-span-5 lg:p-9"
              >
                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-gift-green">
                      {num} — {c.industry}
                    </p>
                    {Icon && (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gift-green/10 text-gift-green transition-colors duration-300 group-hover:bg-gift-green group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-sans font-extrabold leading-tight text-gift-ink"
                    style={{ fontSize: 'clamp(20px, 2.1vw, 26px)' }}
                  >
                    {c.title}
                  </h3>
                </div>

                <div className="mt-6">
                  <div className="border-t border-gift-border pt-5">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <p
                          className="flex items-baseline gap-1 font-display font-extrabold leading-none text-gift-ink"
                          style={{ fontSize: 'clamp(36px, 4vw, 48px)' }}
                        >
                          {m.prefix && <span>{m.prefix}</span>}
                          <span>{m.value}</span>
                          <span
                            className="text-gift-green"
                            style={{ fontSize: '0.4em' }}
                          >
                            {m.suffix}
                          </span>
                        </p>
                        <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-gift-silver">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
