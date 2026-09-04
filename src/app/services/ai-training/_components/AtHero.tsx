import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { HERO } from './aiTrainingContent';

// Background recipe matches the top-page hero (HeroGradientStatic): two radial
// glows over a deep indigo→ink linear gradient, plus the shared grain overlay
// (.page-hero-grain, defined in globals.css) — no photographic asset needed.
const HERO_BACKGROUND = [
  'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,122,224,0.34) 0%, transparent 70%)',
  'radial-gradient(ellipse 50% 40% at 84% 12%, rgba(104,104,182,0.30) 0%, transparent 70%)',
  'linear-gradient(180deg, #3d44c2 0%, #232a8f 48%, #0b1020 100%)',
].join(', ');

export default function AtHero() {
  return (
    <section
      className="page-hero-grain relative overflow-hidden py-24 md:py-32 lg:py-36"
      style={{ backgroundImage: HERO_BACKGROUND }}
    >
      <div className="relative z-[1] mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal className="flex max-w-3xl flex-col items-start gap-6 text-left">
          <p className="font-display text-small font-bold uppercase tracking-[0.24em] text-[#C7D4FF]">
            {HERO.nameEn}
          </p>

          <h1
            className="font-sans font-extrabold text-white"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', lineHeight: 1.25, textWrap: 'balance' }}
          >
            {HERO.nameJaParts.map((part) => (
              <span key={part} className="inline-block">
                {part}
              </span>
            ))}
          </h1>

          {/* Catch line stays white — an accent-blue treatment here did not
              stand out against the indigo gradient. */}
          <p
            className="font-sans font-bold text-white/[0.92]"
            style={{ fontSize: 'clamp(20px, 2vw, 27px)', lineHeight: 1.5 }}
          >
            {HERO.headline.line1}
            「{HERO.headline.bracketed}」{HERO.headline.tail}
          </p>

          <p
            className="max-w-2xl font-sans font-light"
            style={{ fontSize: '16px', lineHeight: 2, color: 'rgba(255,255,255,0.78)', textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>

          <div className="mt-1 flex flex-col gap-3 min-[560px]:flex-row min-[560px]:flex-wrap min-[560px]:items-center min-[560px]:gap-x-7 min-[560px]:gap-y-2">
            {HERO.points.map((point) => (
              <div key={point.title} className="flex items-center gap-2 text-[14px] font-normal text-white/85">
                <span className="h-[5px] w-[5px] shrink-0 bg-[#C7D4FF]" />
                {point.title}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <Link
            href={HERO.cta.href}
            className="group inline-flex w-full max-w-[420px] items-center justify-between gap-6 border border-white bg-white px-7 py-4 text-[#0b1020] transition-all duration-300 hover:bg-transparent hover:text-white min-[480px]:w-auto"
          >
            <span className="font-sans text-[15px] font-bold tracking-tight">{HERO.cta.label}</span>
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
        </Reveal>
      </div>
    </section>
  );
}
