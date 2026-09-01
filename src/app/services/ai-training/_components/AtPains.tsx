import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { PAINS } from './aiTrainingContent';

export default function AtPains() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={PAINS.eyebrow} chip={PAINS.title} />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-3 md:gap-6">
          {PAINS.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <article className="flex h-full flex-col border border-ai-border bg-ai-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-accent hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] md:p-8">
                <h3
                  className="font-sans text-[19px] font-bold text-ai-ink"
                  style={{ lineHeight: 1.4, textWrap: 'balance' }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-4 font-sans text-[16px] font-light text-ai-muted"
                  style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                >
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={PAINS.items.length * 80}>
          <p
            className="mx-auto mt-12 max-w-2xl text-center font-sans text-[17px] font-light text-ai-ink"
            style={{ lineHeight: 1.9, textWrap: 'pretty' }}
          >
            {PAINS.lead}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
