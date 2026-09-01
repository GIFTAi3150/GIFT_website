import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import { HERO } from './worksContent';

export default function WkHero() {
  return (
    <section className="relative overflow-hidden bg-[#0C0E1A] py-24 md:py-32 lg:py-36">
      {/* Decorative background — contour lines sit in the bottom third, so the
          overlay is darkest at top (behind the title) and eases off toward the
          art lower down. alt="" + aria-hidden — purely atmospheric. */}
      <Image
        src="/img/heroes/works-hero.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,26,0.92)_0%,rgba(12,14,26,0.78)_55%,rgba(12,14,26,0.55)_100%)]" />

      <div className="relative mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal className="flex max-w-2xl flex-col items-start gap-5">
          <p className="font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
            {HERO.nameEn}
          </p>

          <h1
            className="font-sans font-extrabold text-white"
            style={{ fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.3, textWrap: 'balance' }}
          >
            {HERO.headline}
          </h1>

          <p
            className="max-w-xl font-sans font-light text-[#9AA7C2]"
            style={{ fontSize: '15px', lineHeight: 2, textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
