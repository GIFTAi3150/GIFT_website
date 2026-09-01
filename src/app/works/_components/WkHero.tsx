import { HERO } from './worksContent';

export default function WkHero() {
  return (
    <section className="bg-[#0C0E1A] py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-start gap-5">
          <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
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
        </div>
      </div>
    </section>
  );
}
