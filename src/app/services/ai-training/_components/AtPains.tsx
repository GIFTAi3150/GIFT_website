import AtSectionHead from './AtSectionHead';
import { PAINS } from './aiTrainingContent';

export default function AtPains() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <AtSectionHead word={PAINS.eyebrow} chip={PAINS.title} />

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-3 md:gap-6">
          {PAINS.items.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col border border-ai-border bg-ai-surface p-6 md:p-8"
            >
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
          ))}
        </div>

        <p
          className="mx-auto mt-12 max-w-2xl text-center font-sans text-[17px] font-light text-ai-ink"
          style={{ lineHeight: 1.9, textWrap: 'pretty' }}
        >
          {PAINS.lead}
        </p>
      </div>
    </section>
  );
}
