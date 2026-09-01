import Link from 'next/link';
import { HERO } from './aiTrainingContent';

export default function AtHero() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#0C0E1A_0%,#111827_100%)] py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
            {HERO.nameEn}
          </p>

          <p className="mb-6 font-sans text-[15px] font-light tracking-[0.08em] text-white/60">
            {HERO.nameJa}
          </p>

          <h1
            className="font-sans font-extrabold text-white"
            style={{ fontSize: 'clamp(30px, 4.6vw, 50px)', lineHeight: 1.3, letterSpacing: '-0.005em', textWrap: 'balance' }}
          >
            {HERO.headline.line1}
            「{HERO.headline.bracketed}」{HERO.headline.tail}
          </h1>

          <div className="mt-8 h-0.5 w-12 bg-[#3b82f6]" />

          <p
            className="mt-8 w-full font-sans font-light text-white"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 1.95, textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-5 min-[680px]:grid-cols-3 md:gap-6">
          {HERO.points.map((point) => (
            <article
              key={point.title}
              className="flex h-full flex-col border border-white/15 bg-white/[0.03] p-6"
            >
              <h2 className="font-sans text-[18px] font-bold leading-snug text-white">{point.title}</h2>
              <p
                className="mt-3 font-sans text-[15px] font-light text-white/70"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {point.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href={HERO.cta.href}
            className="group inline-flex w-full max-w-[420px] items-center justify-between gap-6 bg-[#2563EB] px-7 py-4 text-white transition-colors duration-300 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] min-[480px]:w-auto"
          >
            <span className="font-sans text-[17px] font-bold tracking-tight">{HERO.cta.label}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
