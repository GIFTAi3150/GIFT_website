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
          {STEPS.items.map((step, i) => (
            <Reveal
              key={step.title}
              as="li"
              delay={i * 70}
              className="flex gap-6 border-t border-ai-border py-7 transition-colors duration-300 first:border-t-0 hover:border-ai-accent"
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
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
