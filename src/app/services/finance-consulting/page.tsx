import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import FadeUpText from '@/components/ui/FadeUpText';

export const metadata: Metadata = {
  title: '財務コンサル事業',
  description:
    '財務パートナーズとの業務提携により、融資調達・資金繰り改善を支援。株式会社GIFTの財務コンサルティング事業についてご紹介します。',
  alternates: { canonical: '/services/finance-consulting' },
};

export default function FinanceConsultingPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero — "Rising curve": a line chart draws itself across the dark hero on page load,
             with data-point dots pulsing along it. Visual metaphor for financial growth. */}
        <section className="relative overflow-hidden bg-gift-ink">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gift-green/15 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gift-green-teal/10 blur-[120px]" />

            {/* Trading-platform-style faint grid in background */}
            <div className="dx-hero-grid absolute inset-0 opacity-60" />

            {/* Mobile-only rising-curve: covers the whole hero (same as desktop) using the SAME
                draw-in animation. preserveAspectRatio="xMidYMax slice" anchors the curve to the bottom
                and crops empty space off the top, so the rising line reads from bottom-left to upper-right
                with no visible container edge. Text/badge/CTA sit on top via z-10. */}
            <svg
              className="absolute inset-0 h-full w-full md:hidden"
              viewBox="0 0 200 120"
              preserveAspectRatio="xMidYMax slice"
              aria-hidden
            >
              <defs>
                <linearGradient id="finance-fill-grad-m" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M 10 95 C 40 92, 60 88, 80 80 S 120 68, 145 52 S 180 22, 195 12 L 195 105 L 10 105 Z"
                fill="url(#finance-fill-grad-m)"
                className="finance-fill"
              />

              <path
                d="M 10 95 C 40 92, 60 88, 80 80 S 120 68, 145 52 S 180 22, 195 12"
                stroke="#25D366"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="finance-curve"
              />

              <circle cx="40" cy="92" r="1.8" fill="#25D366" className="finance-point" style={{ animationDelay: '0.9s, 1.6s' }} />
              <circle cx="80" cy="80" r="1.8" fill="#25D366" className="finance-point" style={{ animationDelay: '1.5s, 2.2s' }} />
              <circle cx="145" cy="52" r="1.8" fill="#25D366" className="finance-point" style={{ animationDelay: '2.1s, 2.8s' }} />
              <circle cx="195" cy="12" r="2.4" fill="#25D366" className="finance-point" style={{ animationDelay: '2.6s, 3.3s' }} />
            </svg>

            {/* Rising curve SVG — desktop only. On narrow mobile screens the slice would expose just the steep
                final ascent, which reads as a random diagonal streak rather than "growth" — so we hide it
                and let the dark bg + glows + grid carry the hero on mobile. */}
            <svg
              className="absolute inset-0 hidden h-full w-full md:block"
              viewBox="0 0 200 120"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              {/* Axis hint lines — very subtle */}
              <line x1="10" y1="105" x2="195" y2="105" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" />
              <line x1="10" y1="12" x2="10" y2="105" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" />

              {/* Gradient for the area under the curve */}
              <defs>
                <linearGradient id="finance-fill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25D366" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area fill beneath the curve */}
              <path
                d="M 10 95 C 40 92, 60 88, 80 80 S 120 68, 145 52 S 180 22, 195 12 L 195 105 L 10 105 Z"
                fill="url(#finance-fill-grad)"
                className="finance-fill"
              />

              {/* The curve itself — draws from left to right via stroke-dashoffset */}
              <path
                d="M 10 95 C 40 92, 60 88, 80 80 S 120 68, 145 52 S 180 22, 195 12"
                stroke="#25D366"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="finance-curve"
              />

              {/* Data-point markers — fade in progressively, then keep gently pulsing */}
              <circle cx="40" cy="92" r="1.4" fill="#25D366" className="finance-point" style={{ animationDelay: '0.9s, 1.6s' }} />
              <circle cx="80" cy="80" r="1.4" fill="#25D366" className="finance-point" style={{ animationDelay: '1.5s, 2.2s' }} />
              <circle cx="145" cy="52" r="1.4" fill="#25D366" className="finance-point" style={{ animationDelay: '2.1s, 2.8s' }} />
              <circle cx="195" cy="12" r="1.8" fill="#25D366" className="finance-point" style={{ animationDelay: '2.6s, 3.3s' }} />
            </svg>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-container flex-col justify-center px-4 py-s-80 md:px-6 lg:px-8">
            <p
              className="nav-reveal mb-5 font-display text-small font-bold uppercase tracking-widest text-gift-green"
              style={{ ['--reveal-delay' as string]: '100ms' } as React.CSSProperties}
            >
              FINANCIAL CONSULTING
            </p>

            <h1
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: '1.05' }}
            >
              <FadeUpText text="財務コンサル" delayMs={250} />
              <span className="text-gift-green">
                <FadeUpText text="事業" delayMs={520} />
              </span>
            </h1>

            <p
              className="nav-reveal mt-8 max-w-2xl font-mincho font-light text-white/75"
              style={
                {
                  fontSize: 'clamp(16px, 1.7vw, 19px)',
                  lineHeight: '2',
                  ['--reveal-delay' as string]: '900ms',
                } as React.CSSProperties
              }
            >
              融資調達から財務戦略まで—「財務パートナーズ」との業務提携で、経営者に寄り添う伴走型コンサルティングをご提供します。
            </p>

            <div
              className="nav-reveal mt-10"
              style={{ ['--reveal-delay' as string]: '1300ms' } as React.CSSProperties}
            >
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>

            {/* Glass partner badge — same pattern as DX hero, scaled-down 財務パートナーズ card */}
            <div
              className="nav-reveal mt-12 flex max-w-md items-center gap-4 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md"
              style={{ ['--reveal-delay' as string]: '1600ms' } as React.CSSProperties}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={1.5} className="h-6 w-6">
                  <polyline points="3 17 9 11 13 15 21 7" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 7 21 7 21 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-sans text-[15px] font-bold text-white">財務パートナーズ</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gift-green/20 px-2.5 py-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5 text-gift-green">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-display text-[10px] font-bold text-gift-green">業務提携パートナー</span>
                  </span>
                </div>
                <p className="mt-1 font-sans text-[12px] leading-relaxed text-white/60">
                  融資・資金調達のプロフェッショナル集団
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats — Alliance track record (placeholders, swap with real numbers when shared) */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-70">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                <div className="text-center">
                  {/* TODO: replace with real number from 財務パートナーズ */}
                  <div className="font-display text-[64px] font-extrabold leading-none text-gift-green">
                    30<span className="text-[32px]">社+</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">支援企業</p>
                </div>
                <div className="text-center">
                  {/* TODO: replace with real number from 財務パートナーズ */}
                  <div className="font-display text-[64px] font-extrabold leading-none text-gift-green">
                    ¥10<span className="text-[32px]">億+</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">累計融資調達額</p>
                </div>
                <div className="text-center">
                  {/* TODO: replace with real number from 財務パートナーズ */}
                  <div className="font-display text-[64px] font-extrabold leading-none text-gift-green">
                    90<span className="text-[32px]">%+</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">融資承認率</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* What we offer */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                WHAT WE OFFER
              </p>
              <h2
                className="mb-5 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                提供内容
              </h2>
              <p
                className="mb-12 max-w-3xl font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                財務コンサルティングは、提携パートナー「財務パートナーズ」との業務提携によりご提供しております。両社の連携体制で、以下の支援をお届けします。
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    title: '融資支援・資金調達',
                    body: '財務パートナーズの豊富な融資実行実績をもとに、事業フェーズに応じた最適な資金調達プランをご提案します。',
                  },
                  {
                    title: '経営コンサル',
                    body: '財務パートナーズと連携し、財務戦略・KPI設計を軸に、経営判断に必要な数値と視点を経営者と共に整えます。',
                  },
                ].map((s) => (
                  <div key={s.title} className="gift-card !p-8">
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">{s.title}</h3>
                    <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Approach */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    APPROACH
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    伴走型スタイル
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <p
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
                  >
                    単発のアドバイスではなく、経営者と並走しながら数字と戦略を共に描く伴走型スタイルが私たちの特長です。外部の税理士・会計士・金融機関との連携によるアライアンス体制で、広く深いサポートを実現します。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Target */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                WHO IT'S FOR
              </p>
              <h2
                className="mb-6 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.2' }}
              >
                成長期の中小企業経営者の方へ
              </h2>
              <p className="mx-auto max-w-2xl font-sans font-light text-gift-silver" style={{ lineHeight: '2' }}>
                融資ニーズがある、財務戦略を整えたい、経営判断の数値基盤を固めたい——そうした成長期の経営者の方と共に走ります。
              </p>
            </div>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                財務コンサルのご相談はこちらから
              </h2>
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
