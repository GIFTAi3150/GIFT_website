import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { REASONS } from './aiTrainingContent';

export default function AtReasons() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={REASONS.eyebrow} chip={REASONS.title} />
        </Reveal>

        <dl className="mx-auto mt-14 max-w-4xl">
          {/* Hover/transition classes sit on the inner div, not on Reveal: Reveal
              sets transitionProperty:'opacity, transform' inline on its own
              element, which silently drops a class-based transition-colors on
              the same element (the border-color change would snap instantly). */}
          {REASONS.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="flex flex-col gap-y-2 border-t border-ai-border py-6 transition-colors duration-300 hover:border-ai-accent min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10">
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
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
