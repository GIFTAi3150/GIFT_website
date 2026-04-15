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
                  <article key={c.id} className="group cursor-pointer">
                    <div
                      className="mb-5 overflow-hidden rounded-2xl"
                      style={{ aspectRatio: '16/10' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt={c.title}
                        className="h-full w-full object-cover brightness-90 transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-100"
                      />
                    </div>

                    <p className="mb-2 font-sans text-normal font-bold text-gift-ink transition-colors group-hover:text-gift-hover">
                      {c.client}
                    </p>

                    <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                      {c.industry}
                    </p>

                    <h3 className="mb-4 font-sans text-medium font-semibold leading-snug text-gift-ink">
                      {c.title}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {c.services.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-gift-silver/30 px-3 py-1 font-sans text-small text-gift-silver"
                        >
                          {s}
                        </span>
                      ))}
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
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full border border-gift-border bg-white px-10 py-4 font-sans text-normal font-medium text-gift-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-hover hover:bg-gift-hover hover:shadow-[0_10px_30px_rgba(0,86,51,0.45)] active:scale-95 active:border-gift-hover-dark active:bg-gift-hover-dark"
              >
                お問い合わせ
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
