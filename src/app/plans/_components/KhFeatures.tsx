import KhSectionHead from './KhSectionHead';
import { FEATURES } from './khContent';

export default function KhFeatures() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Features" chip={FEATURES.title} tone="light" />

        {/* The source line is 「導入後の変化：AIが全社の記憶を持って動く。」 — split at the
            ： so the statement carries display weight instead of reading as a
            caption. This is the page's thesis sentence. */}
        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center text-center">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#2563EB]">
            {FEATURES.leadLabel}
          </p>
          <p
            className="mt-3 font-sans font-extrabold leading-snug text-[#0C0E1A]"
            style={{ fontSize: 'clamp(20px, 2.8vw, 30px)', textWrap: 'balance' }}
          >
            {FEATURES.leadStatement}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-2 min-[1000px]:grid-cols-3 md:gap-6">
          {FEATURES.items.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col border border-[#BFDBFE] bg-[#F7FAFF] p-6 md:p-8"
            >
              <span className="font-sans text-[14px] font-bold tracking-wide text-[#2563EB]">
                {item.kicker}
              </span>

              <h3 className="mt-4 font-sans text-[20px] font-bold leading-snug text-[#0C0E1A]">
                {item.title}
              </h3>

              {/* textWrap:pretty, not balance — balance is for short lines and makes
                  a 4-line JP paragraph ragged. `pretty` only prevents the orphan. */}
              <p
                className="mt-4 font-sans text-[17px] font-light text-[#5B6B8A]"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
