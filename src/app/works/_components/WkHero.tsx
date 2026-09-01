import Reveal from '@/components/ui/Reveal';
import { HERO } from './worksContent';

// Same background recipe as the top-page hero (HeroGradientStatic) and
// /services/ai-training's AtHero — two radial glows over a deep indigo→ink
// linear gradient, plus the shared grain overlay (.page-hero-grain).
const HERO_BACKGROUND = [
  'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,122,224,0.34) 0%, transparent 70%)',
  'radial-gradient(ellipse 50% 40% at 84% 12%, rgba(104,104,182,0.30) 0%, transparent 70%)',
  'linear-gradient(180deg, #3d44c2 0%, #232a8f 48%, #0b1020 100%)',
].join(', ');

export default function WkHero() {
  return (
    <section
      className="page-hero-grain relative overflow-hidden py-24 md:py-32 lg:py-36"
      style={{ backgroundImage: HERO_BACKGROUND }}
    >
      <div className="relative z-[1] mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal className="flex max-w-2xl flex-col items-start gap-5">
          <p className="font-display text-small font-bold uppercase tracking-[0.24em] text-[#C7D4FF]">
            {HERO.nameEn}
          </p>

          <h1
            className="font-sans font-extrabold text-white"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', lineHeight: 1.25, textWrap: 'balance' }}
          >
            {HERO.headline}
          </h1>

          <p
            className="max-w-xl font-sans font-light"
            style={{ fontSize: '16px', lineHeight: 2, color: 'rgba(255,255,255,0.78)', textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
