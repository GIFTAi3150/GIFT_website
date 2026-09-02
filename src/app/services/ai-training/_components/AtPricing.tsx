import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { PRICING } from './aiTrainingContent';

/** Amount + 万円 unit. Unit is a fixed, readable size — not an em fraction of the
 *  figure — so it stays legible next to the oversized number. */
function Yen({ figure, unitClassName }: { figure: string; unitClassName?: string }) {
  return (
    <span className="flex items-baseline whitespace-nowrap">
      <span
        className="font-display font-bold tabular-nums leading-none"
        style={{ fontSize: 'clamp(56px, 6vw, 76px)' }}
      >
        {figure}
      </span>
      <span className={`ml-1.5 font-sans text-[22px] font-bold md:text-[26px] ${unitClassName ?? ''}`}>
        万円
      </span>
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

        {/* 1fr | arrow | 1fr — the two cards share one skeleton (condition /
            label / figure / note) and stretch to equal height; the arrow tells
            the 通常 → 実質 story at a glance. */}
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-4 min-[820px]:grid-cols-[1fr_auto_1fr] min-[820px]:gap-5">
          {/* Regular price — quiet baseline card. Hover classes live on the inner
              div, not on Reveal (its inline transform beats hover classes). */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col border border-ai-border bg-white p-7 shadow-[0_1px_3px_rgba(12,14,26,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(12,14,26,0.08)] md:p-9">
              <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-ai-muted">
                {PRICING.regular.condition}
              </span>
              <span className="mt-3 font-sans text-[15px] font-light text-ai-muted">
                {PRICING.regular.label}
              </span>
              <div className="mt-5 text-ai-ink">
                <Yen figure={PRICING.regular.figure} unitClassName="text-ai-ink" />
              </div>
              <span className="mt-auto pt-6 font-sans text-[14px] font-light text-ai-muted">
                {PRICING.regular.note}
              </span>
            </div>
          </Reveal>

          {/* 通常 → 実質 arrow. Rotates downward when the cards stack. */}
          <Reveal delay={40} className="self-center justify-self-center">
            <div className="flex h-11 w-11 rotate-90 items-center justify-center rounded-full border border-ai-accent bg-white shadow-[0_2px_8px_rgba(37,99,235,0.18)] min-[820px]:rotate-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Reveal>

          {/* Subsidised figure — the hero number. Navy card ties the page's
              hero/CTA sandwich and makes the white figure carry the section. */}
          <Reveal delay={80} className="h-full">
            <div className="flex h-full flex-col bg-ai-ink p-7 shadow-[0_10px_30px_rgba(12,14,26,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.28)] md:p-9">
              <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-[#A5C0FF]">
                {PRICING.subsidized.condition}
              </span>
              <span className="mt-3 font-sans text-[15px] font-light text-white/70">
                {PRICING.subsidized.label}
              </span>
              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2 text-white">
                <Yen figure={PRICING.subsidized.figure} unitClassName="text-white" />
                <span className="mb-1.5 bg-ai-accent px-2.5 py-1 font-sans text-[13px] font-bold tracking-tight text-white">
                  {PRICING.subsidized.aside}
                </span>
              </div>
              <p
                className="mt-auto pt-6 font-sans text-[14px] font-light text-white/70"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {PRICING.subsidized.body}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="mx-auto mt-10 max-w-5xl">
          <p className="font-sans text-[15px] font-light text-ai-ink">{PRICING.diagnosisNote}</p>
          <p className="mt-3 font-sans text-[13px] font-light text-ai-muted">{PRICING.taxNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
