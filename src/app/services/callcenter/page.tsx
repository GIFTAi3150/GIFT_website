import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import FadeUpText from '@/components/ui/FadeUpText';

export const metadata: Metadata = {
  title: 'コールセンター事業',
  description:
    'インバウンド・アウトバウンド・カスタマーサポートを100名超の体制で提供。株式会社GIFTのコールセンター事業についてご紹介します。',
  alternates: { canonical: '/services/callcenter' },
};

export default function CallCenterPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero — "Voice waveform": sine waves flow horizontally across the dark bg, with activity-pulse dots
             suggesting live call signals. Speaks directly to the core service: voice at scale. */}
        <section className="relative overflow-hidden bg-gift-ink">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gift-green/15 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gift-green-teal/10 blur-[120px]" />

            {/* Voice-waveform SVG — 3 sine layers flow continuously at different speeds.
                Paths extend past the viewBox so translating by one wavelength never exposes an empty edge.
                Each layer has a nested <g> adding a gentle vertical undulation so motion feels organic.
                Aspect is preserved via xMidYMid slice so stroke width stays consistent across viewports,
                and opacities are kept low so the waves read as ambient atmosphere behind the text. */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 160 100"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              {/* Primary wave — largest amplitude, brightest green — λ=80, cycles every 4s */}
              <g opacity="0.35" stroke="#25D366" strokeWidth="0.5" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-80 0" dur="4s" repeatCount="indefinite" calcMode="linear" />
                <g>
                  <animateTransform attributeName="transform" type="translate" values="0 0; 0 -1.5; 0 0; 0 1.5; 0 0" dur="3.2s" repeatCount="indefinite" additive="sum" />
                  <path d="M 0 45 C 10 30, 30 30, 40 45 C 50 60, 70 60, 80 45 C 90 30, 110 30, 120 45 C 130 60, 150 60, 160 45 C 170 30, 190 30, 200 45 C 210 60, 230 60, 240 45 C 250 30, 270 30, 280 45" />
                </g>
              </g>
              {/* Secondary wave — medium opacity, shorter wavelength — λ=60, cycles every 5s */}
              <g opacity="0.22" stroke="#25D366" strokeWidth="0.35" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-60 0" dur="5s" repeatCount="indefinite" calcMode="linear" />
                <g>
                  <animateTransform attributeName="transform" type="translate" values="0 0; 0 1; 0 0; 0 -1; 0 0" dur="4s" repeatCount="indefinite" additive="sum" />
                  <path d="M 0 55 C 7.5 47, 22.5 47, 30 55 C 37.5 63, 52.5 63, 60 55 C 67.5 47, 82.5 47, 90 55 C 97.5 63, 112.5 63, 120 55 C 127.5 47, 142.5 47, 150 55 C 157.5 63, 172.5 63, 180 55 C 187.5 47, 202.5 47, 210 55 C 217.5 63, 232.5 63, 240 55" />
                </g>
              </g>
              {/* Tertiary wave — white tint, longest wavelength — λ=100, cycles every 7s (counter-rhythm) */}
              <g opacity="0.1" stroke="#ffffff" strokeWidth="0.25" fill="none" strokeLinecap="round">
                <animateTransform attributeName="transform" type="translate" from="0 0" to="-100 0" dur="7s" repeatCount="indefinite" calcMode="linear" />
                <path d="M 0 50 C 12.5 32, 37.5 32, 50 50 C 62.5 68, 87.5 68, 100 50 C 112.5 32, 137.5 32, 150 50 C 162.5 68, 187.5 68, 200 50 C 212.5 32, 237.5 32, 250 50 C 262.5 68, 287.5 68, 300 50" />
              </g>

              {/* Activity pulses — brief flashes of light like live call signals */}
              <circle cx="28" cy="18" r="0.7" fill="#25D366" className="activity-pulse" />
              <circle cx="138" cy="22" r="0.7" fill="#25D366" className="activity-pulse" style={{ animationDelay: '1.3s' }} />
              <circle cx="52" cy="78" r="0.7" fill="#25D366" className="activity-pulse" style={{ animationDelay: '2.6s' }} />
              <circle cx="120" cy="82" r="0.7" fill="#25D366" className="activity-pulse" style={{ animationDelay: '0.6s' }} />
              <circle cx="82" cy="14" r="0.7" fill="#25D366" className="activity-pulse" style={{ animationDelay: '3.1s' }} />
            </svg>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-container flex-col justify-center px-4 py-s-80 md:px-6 lg:px-8">
            <p
              className="nav-reveal mb-5 flex items-center gap-3 font-display text-small font-bold uppercase tracking-widest text-gift-green"
              style={{ ['--reveal-delay' as string]: '100ms' } as React.CSSProperties}
            >
              <span aria-hidden className="inline-flex h-2 w-2 rounded-full bg-gift-green shadow-[0_0_8px_rgba(37,211,102,0.9)]" />
              CALL CENTER
            </p>

            <h1
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: '1.05' }}
            >
              <FadeUpText text="コールセンター" delayMs={250} />
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
              アウトバウンド特化・自社運営。通信分野だけで総従業員約300名、組織運営を中枢に据えた教育制度で品質と拡大を両立させています。
            </p>

            {/* Tiny stat strip — live feel */}
            <div
              className="nav-reveal mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-white/85"
              style={{ ['--reveal-delay' as string]: '1200ms' } as React.CSSProperties}
            >
              <div>
                <p className="font-display text-[28px] font-extrabold leading-none text-gift-green">
                  300<span className="text-[16px] text-white/75">名+</span>
                </p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-widest text-white/50">自社体制</p>
              </div>
              <div className="h-10 w-px bg-white/15" aria-hidden />
              <div>
                <p className="font-display text-[28px] font-extrabold leading-none text-gift-green">
                  2018<span className="text-[16px] text-white/75">〜</span>
                </p>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-widest text-white/50">運営開始</p>
              </div>
            </div>

            <div
              className="nav-reveal mt-10"
              style={{ ['--reveal-delay' as string]: '1500ms' } as React.CSSProperties}
            >
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                HIGHLIGHTS
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                GIFTのコールセンターが選ばれる理由
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    title: '自社運営',
                    body: '外注なし。全スタッフを自社で採用・教育し、品質の一貫性を担保しています。',
                  },
                  {
                    title: 'アウトバウンド特化',
                    body: 'クラウドPBX + CRMの基盤で、成果を追求したアウトバウンド運営に集中しています。',
                  },
                  {
                    title: '教育制度が強み',
                    body: '組織運営を中枢に据えた教育制度で、採用後の成長と定着率を高めています。',
                  },
                ].map((h) => (
                  <div key={h.title} className="gift-card !p-8">
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">{h.title}</h3>
                    <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                      {h.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Scale */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    300<span className="text-[40px]">名</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    通信分野だけで総従業員約300名
                  </p>
                </div>
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    2018<span className="text-[40px]">〜</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    運営開始年。長年積み上げた実績
                  </p>
                </div>
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    2<span className="text-[40px]">分野</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    光回線 / 法人営業SaaSの2領域で展開
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                コールセンター事業のご相談はこちらから
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
