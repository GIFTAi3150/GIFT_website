import AtSectionHead from './AtSectionHead';
import { REASONS } from './aiTrainingContent';

export default function AtReasons() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <AtSectionHead word={REASONS.eyebrow} chip={REASONS.title} />

        <dl className="mx-auto mt-14 max-w-4xl">
          {REASONS.items.map((item, i) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 border-t border-ai-border py-6 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
            >
              <dt
                className="flex items-baseline gap-3 font-sans text-[19px] font-bold leading-snug text-ai-ink min-[760px]:w-[42%] min-[760px]:shrink-0"
                style={{ textWrap: 'balance' }}
              >
                <span className="font-display text-[14px] font-bold text-ai-accent">{`0${i + 1}`}</span>
                {item.title}
              </dt>
              <dd
                className="font-sans text-[17px] font-light text-ai-muted"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
