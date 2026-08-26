import { HERO } from './khContent';

export default function PlansHero() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#0b1020_0%,#111827_100%)] py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
            {HERO.nameEn}
          </p>

          <p className="mb-6 font-sans text-[15px] font-light tracking-[0.08em] text-white/60">
            {HERO.nameJa}
          </p>

          {/* The page's h1 is the product's tagline, not its name — the name is the
              kicker above. Brackets stay white: the accent blue is reserved for the
              kicker, the rule and the CTA, and colouring them too would spend it
              three times in one screen. */}
          <h1
            className="font-sans font-extrabold leading-tight text-white"
            style={{ fontSize: 'clamp(30px, 4.6vw, 50px)', textWrap: 'balance' }}
          >
            {HERO.headline.line1}
            「{HERO.headline.bracketed}」{HERO.headline.tail}
          </h1>

          <div className="mt-8 h-0.5 w-12 bg-[#3b82f6]" />

          <p
            className="mt-8 w-full font-sans font-light text-white"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 2, textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>
        </div>
      </div>
    </section>
  );
}
