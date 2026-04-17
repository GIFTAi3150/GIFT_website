import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import achievements from '@/data/achievements.json';

export default function AchievementsPage() {
  const { stats, businessLines } = achievements;

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Page header */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
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

        {/* Stats band */}
        <Reveal>
          <section className="border-b border-gift-border bg-gift-bg-alt py-s-70">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="text-center">
                  <p className="font-display text-[56px] font-extrabold leading-none text-gift-green">
                    {stats.totalClients}<span className="text-[28px]">社+</span>
                  </p>
                  <p className="mt-2 font-sans text-[14px] text-gift-silver">累計支援企業</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-[56px] font-extrabold leading-none text-gift-green">
                    {stats.industries}<span className="text-[28px]">+</span>
                  </p>
                  <p className="mt-2 font-sans text-[14px] text-gift-silver">対応業種</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-[56px] font-extrabold leading-none text-gift-green">
                    {stats.since}<span className="text-[28px]">年〜</span>
                  </p>
                  <p className="mt-2 font-sans text-[14px] text-gift-silver">運営開始</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Business lines */}
        <section className="py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="flex flex-col gap-16">
              {businessLines.map((bl, idx) => (
                <Reveal key={bl.id} delay={idx * 100}>
                  <div className="overflow-hidden rounded-2xl border-2 border-gift-border bg-white transition-all duration-500 hover:border-gift-green/40 hover:shadow-[0_8px_30px_rgba(37,211,102,0.08)]">
                    {/* Header bar */}
                    <div className="flex flex-col gap-4 border-b border-gift-border bg-gift-bg-alt px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-10">
                      <div>
                        <p className="font-display text-[12px] font-bold uppercase tracking-widest text-gift-green">
                          {String(idx + 1).padStart(2, '0')} — {bl.titleEn}
                        </p>
                        <h2 className="mt-1 font-sans text-[24px] font-extrabold text-gift-ink md:text-[28px]">
                          {bl.title}
                        </h2>
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

                      {/* Two columns: industries + services */}
                      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Industries */}
                        <div>
                          <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                            対応業種
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {bl.industries.map((ind) => (
                              <span
                                key={ind}
                                className="rounded-full border border-gift-border bg-gift-bg-alt px-4 py-1.5 font-sans text-[13px] text-gift-ink"
                              >
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Services */}
                        <div>
                          <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                            提供サービス
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {bl.services.map((svc) => (
                              <span
                                key={svc}
                                className="rounded-full border border-gift-green/30 bg-gift-green/5 px-4 py-1.5 font-sans text-[13px] text-gift-green-teal"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
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
