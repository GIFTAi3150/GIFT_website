import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { STEPS } from './aiTrainingContent';

export default function AtSteps() {
  return (
    <section className="relative bg-ai-surface-2 py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={STEPS.eyebrow} chip={STEPS.title} />
        </Reveal>

        <ol className="mx-auto mt-14 max-w-3xl">
          {/* Hover/transition classes sit on the inner div, not on Reveal(as="li"):
              Reveal sets transitionProperty:'opacity, transform' inline on its own
              element, which silently drops a class-based transition-colors there.
              Also: "first:border-t-0" can't move to the inner div as-is — it would
              always match (the div is always its own parent's first child), so the
              first row's border is decided explicitly from `i` instead. */}
          {STEPS.items.map((step, i) => (
            <Reveal key={step.title} as="li" delay={i * 70}>
              <div
                className={`flex gap-6 py-7 transition-colors duration-300 hover:border-ai-accent ${
                  i === 0 ? '' : 'border-t border-ai-border'
                }`}
              >
                <span className="font-display text-[28px] font-bold leading-none text-ai-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-sans text-[19px] font-bold leading-snug text-ai-ink">{step.title}</h3>
                  <p
                    className="mt-3 font-sans text-[16px] font-light text-ai-muted"
                    style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
