'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

gsap.registerPlugin(ScrollTrigger);

// Editorial / icon-led achievement cards. Each row alternates icon
// position (left vs right) for a magazine-spread rhythm, the big
// metric numbers count up on scroll-in, and the whole card lifts +
// underlines on hover.

type Metric = {
  prefix?: string;
  value: number;
  suffix: string;
  label: string;
  /** 'comma' adds thousand-separators on display ("1,000"). */
  format?: 'comma';
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
      { value: 300, suffix: '名+', label: '体制' },
      { value: 2018, suffix: '年〜', label: '運営開始' },
    ],
  },
  {
    id: 2,
    iconId: 'dx-consulting',
    industry: 'DX CONSULTING',
    title: 'LINE・RPA・AI導入をワンストップで支援',
    href: '/services/dx-consulting',
    metrics: [
      { value: 50, suffix: '社+', label: '支援企業' },
      { value: 1000, suffix: '時間+', label: 'RPA削減', format: 'comma' },
    ],
  },
  {
    id: 3,
    iconId: 'finance-consulting',
    industry: 'FINANCIAL CONSULTING',
    title: '融資支援から財務戦略まで伴走型サポート',
    href: '/services/finance-consulting',
    metrics: [
      { value: 30, suffix: '社+', label: '支援企業' },
      { prefix: '¥', value: 10, suffix: '億+', label: '融資調達' },
    ],
  },
];

const formatValue = (v: number, format?: 'comma') =>
  format === 'comma' ? Math.round(v).toLocaleString() : String(Math.round(v));

export default function CaseStudy() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Count-up for every .works-num span — tween a plain object's `v`
    // and write the formatted value into the span on each update.
    document.querySelectorAll<HTMLElement>('.works-num').forEach((el) => {
      const target = parseFloat(el.dataset.target ?? '0');
      const format = el.dataset.format as 'comma' | undefined;
      const obj = { v: 0 };
      const t = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = formatValue(obj.v, format);
            },
          });
        },
      });
      triggers.push(t);
    });

    // Card fade-up stagger as each card enters.
    document.querySelectorAll<HTMLElement>('.works-card').forEach((el, i) => {
      const tween = gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="w-full bg-gift-bg-alt py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-3 text-center md:mb-16">
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

        <div className="flex flex-col gap-8 md:gap-10">
          {cases.map((c, i) => {
            const Icon = SERVICE_ICON_BY_ID[c.iconId];
            const isReversed = i % 2 === 1;
            return (
              <article
                key={c.id}
                className="works-card group relative overflow-hidden rounded-[28px] border border-gift-border bg-white p-7 transition-[box-shadow,border-color] duration-[400ms] ease-out hover:border-gift-green hover:shadow-[0_28px_64px_-22px_rgba(17,27,33,0.22)] sm:p-10 lg:p-14"
              >
                <div
                  className={`flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                    isReversed ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon panel — big mono-color tile with the service icon. */}
                  <div className="relative shrink-0">
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gift-green/10 transition-colors duration-[400ms] group-hover:bg-gift-green/15 sm:h-40 sm:w-40">
                      {Icon && (
                        <Icon className="h-16 w-16 text-gift-green transition-transform duration-[400ms] group-hover:scale-110 sm:h-20 sm:w-20" />
                      )}
                    </div>
                  </div>

                  {/* Content column */}
                  <div className="flex-1">
                    <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-gift-silver">
                      {c.industry}
                    </p>
                    <h3
                      className="mb-8 font-sans font-extrabold leading-tight text-gift-ink"
                      style={{ fontSize: 'clamp(20px, 2.4vw, 28px)' }}
                    >
                      {c.title}
                    </h3>

                    {/* Metrics — two columns of big numbers above a
                        small caps label. Top hairline separates from
                        the title block. */}
                    <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-gift-border pt-6">
                      {c.metrics.map((m) => (
                        <div key={m.label}>
                          <p
                            className="flex items-baseline gap-1 font-display font-extrabold leading-none text-gift-ink"
                            style={{ fontSize: 'clamp(40px, 5.5vw, 64px)' }}
                          >
                            {m.prefix && <span>{m.prefix}</span>}
                            <span
                              className="works-num"
                              data-target={m.value}
                              data-format={m.format}
                            >
                              0
                            </span>
                            <span
                              className="text-gift-green"
                              style={{ fontSize: '0.4em' }}
                            >
                              {m.suffix}
                            </span>
                          </p>
                          <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.15em] text-gift-silver">
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* CTA → service page */}
                    <Link
                      href={c.href}
                      className="inline-flex items-center gap-2 font-display text-small font-bold uppercase tracking-widest text-gift-green transition-colors duration-200 hover:text-gift-ink"
                    >
                      <span>詳しく見る</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-[400ms] group-hover:translate-x-1"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Bottom accent — thin green line draws in from the
                    left on hover, reading like an editorial underline
                    rather than a generic glow. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-gift-green transition-transform duration-[500ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
