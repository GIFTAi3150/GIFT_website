import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import ProcessFlow from '@/components/sections/ProcessFlow';

export const metadata: Metadata = {
  title: '実績・事例',
  description:
    '株式会社GIFTのこれまでの支援実績・導入事例をご紹介します。コールセンター、DX、財務コンサルの各事業での成果をまとめています。',
  alternates: { canonical: '/achievements' },
};
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';
import achievements from '@/data/achievements.json';

export default function AchievementsPage() {
  const { businessLines } = achievements;

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Page header — decorative drifting blobs behind the title */}
        <section className="relative overflow-hidden border-b border-gift-border py-s-80">
          {/* Floating blurred blobs for atmospheric depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />
          </div>
          <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              WORKS
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              実績・強み
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-normal font-light text-gift-silver">
              GIFTは3つの事業を軸に、幅広い業種のお客様を支援してきました。
              各事業の概要と対応業種をご紹介します。
            </p>
          </div>
        </section>

        {/* Business lines — each card carries its own metric tiles */}
        <section className="border-t border-gift-border bg-white py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="flex flex-col gap-16">
              {businessLines.map((bl, idx) => {
                const Icon = SERVICE_ICON_BY_ID[bl.id];
                return (
                <Reveal key={bl.id} delay={idx * 100}>
                  <Link
                    href={`/services/${bl.id}`}
                    className="group block overflow-hidden rounded-2xl border-2 border-gift-border bg-white transition-all duration-300 hover:border-gift-green/40 hover:shadow-[0_8px_30px_rgba(37,211,102,0.08)]"
                  >
                    {/* Header bar */}
                    <div className="flex flex-col gap-4 border-b border-gift-border bg-gift-bg-alt px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
                      <div className="flex items-center gap-5">
                        {Icon && (
                          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gift-green/10 text-gift-green transition-colors duration-300 group-hover:bg-gift-green group-hover:text-white md:h-16 md:w-16">
                            <Icon className="h-8 w-8 md:h-10 md:w-10" />
                          </span>
                        )}
                        <div>
                          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-gift-green">
                            {String(idx + 1).padStart(2, '0')} — {bl.titleEn}
                          </p>
                          <h2 className="mt-1 font-sans text-[24px] font-extrabold text-gift-ink md:text-[28px]">
                            {bl.title}
                          </h2>
                        </div>
                      </div>
                      <span className="inline-block shrink-0 rounded-full bg-gift-green/10 px-4 py-1.5 font-display text-[12px] font-bold text-gift-green-teal">
                        {bl.since}
                      </span>
                    </div>

                    <div className="px-6 py-8 md:px-10">
                      {/* Description */}
                      <p className="max-w-3xl font-sans text-[16px] leading-relaxed text-gift-silver">
                        {bl.description}
                      </p>

                      {/* Badge if exists */}
                      {bl.badge && (
                        <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-gift-border bg-gift-bg-alt px-5 py-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#06C755] font-display text-sm font-bold text-white">
                            L
                          </div>
                          <p className="font-sans text-[14px] font-semibold text-gift-ink">
                            {bl.badge}
                          </p>
                        </div>
                      )}

                      {/* Metrics — 3 KPI tiles per business line.
                          TODO: replace placeholder values once manager sends real numbers
                          (DX 支援社数 / RPA削減時間, Finance 支援社数 / 融資調達 / 承認率). */}
                      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {bl.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="rounded-xl border border-gift-border bg-gift-bg-alt px-5 py-6 text-center"
                          >
                            <p className="font-display text-[40px] font-extrabold leading-none text-gift-green md:text-[48px]">
                              {m.value}
                              <span className="text-[20px] md:text-[24px]">{m.suffix}</span>
                            </p>
                            <p className="mt-3 font-sans text-[13px] font-medium text-gift-silver">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* CTA — confirms the card is a link */}
                      <div className="mt-8 flex items-center gap-2 font-display text-[12px] font-bold uppercase tracking-widest text-gift-green">
                        <span>詳しく見る</span>
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How we work — universal 4-step process */}
        <Reveal>
          <ProcessFlow />
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                あなたの事業についても、ご相談ください。
              </h2>
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
