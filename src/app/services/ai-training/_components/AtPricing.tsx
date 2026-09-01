import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { PRICING } from './aiTrainingContent';

/** Amount + 万円 unit. `tabular-nums` keeps digits aligned across the two figures. */
function Yen({ figure, className }: { figure: string; className?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-display font-bold tabular-nums ${className ?? ''}`}>{figure}</span>
      <span className="ml-1 font-sans text-[0.42em] font-light">万円</span>
    </span>
  );
}

export default function AtPricing() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={PRICING.eyebrow} chip={PRICING.title} lead={PRICING.lead} />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 min-[760px]:grid-cols-2 md:gap-6">
          {/* Regular price — plain, muted card. Not struck through: this is simply
              the baseline the subsidy card sits next to.
              Hover classes live on the inner div, not on Reveal itself: Reveal sets
              transform/transitionProperty inline on its own element, and an inline
              style always beats a class (even a :hover one) on the same element —
              so a hover:-translate-y transform there would be silently dead. */}
          <Reveal>
            <div className="flex flex-col border border-ai-border bg-ai-bg p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-muted/60 md:p-8">
              <span className="font-sans text-[15px] font-light text-ai-muted">{PRICING.regular.label}</span>
              <div className="mt-4">
                <Yen figure={PRICING.regular.figure} className="text-[clamp(36px,5vw,48px)] leading-none text-ai-ink" />
              </div>
              <span className="mt-4 font-sans text-[14px] font-light text-ai-muted">{PRICING.regular.note}</span>
            </div>
          </Reveal>

          {/* Subsidised figure — the reversal. Bright accent border/bg and the
              condition line directly above the figure, never demoted to a footnote. */}
          <Reveal delay={80}>
            <div className="flex flex-col border-2 border-ai-accent bg-ai-surface-2 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.16)] md:p-8">
              <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-ai-accent">
                {PRICING.subsidized.condition}
              </span>
              <span className="mt-3 font-sans text-[15px] font-light text-ai-muted">
                {PRICING.subsidized.label}
              </span>
              <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
                <Yen
                  figure={PRICING.subsidized.figure}
                  className="text-[clamp(36px,5vw,48px)] leading-none text-ai-accent"
                />
                <span className="bg-ai-accent px-2 py-0.5 font-sans text-[13px] font-bold tracking-tight text-white">
                  {PRICING.subsidized.aside}
                </span>
              </div>
              <p className="mt-4 font-sans text-[14px] font-light text-ai-muted" style={{ lineHeight: 1.8 }}>
                {PRICING.subsidized.body}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto mt-10 max-w-4xl">
          <p className="font-sans text-[15px] font-light text-ai-ink">{PRICING.diagnosisNote}</p>
          <p className="mt-3 font-sans text-[13px] font-light text-ai-muted">{PRICING.taxNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
