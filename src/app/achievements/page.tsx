import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import achievements from '@/data/achievements.json';

export default function AchievementsPage() {
  const { cases } = achievements;

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
              実績
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-normal font-light text-gift-silver">
              クライアントと共に積み上げてきた実績をご紹介します。
            </p>
          </div>
        </section>

        {/* Case grid */}
        <Reveal>
          <section className="py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
                {cases.map((c) => (
                  <article key={c.id} className="works-card group">
                    <div
                      className="overflow-hidden rounded-t-[18px]"
                      style={{ aspectRatio: '16/10' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt={c.title}
                        className="h-full w-full object-cover brightness-90 transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-100"
                      />
                    </div>

                    <div className="p-6">
                      <p className="works-card-title mb-2 font-sans text-normal font-bold">
                        {c.client}
                      </p>

                      <p className="works-card-industry mb-3 font-display text-small font-bold uppercase tracking-widest">
                        {c.industry}
                      </p>

                      <h3 className="works-card-title mb-4 font-sans text-medium font-semibold leading-snug">
                        {c.title}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {c.services.map((s) => (
                          <span
                            key={s}
                            className="works-card-tag rounded-full border px-3 py-1 font-sans text-small"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

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
