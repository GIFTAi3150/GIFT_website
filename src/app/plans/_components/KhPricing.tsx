import KhSectionHead from './KhSectionHead';
import { PRICING } from './khContent';

/** Amount + 万円 unit. `tabular-nums` so every row's digits sit in the same column
 *  however many digits each figure has. The unit is sized in `em` so it scales with
 *  whatever figure size the caller passes — do not replace it with a px value. */
function Yen({ figure, className }: { figure: string; className?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-display font-bold tabular-nums ${className ?? ''}`}>{figure}</span>
      <span className="ml-1 font-sans text-[0.42em] font-light">万円</span>
    </span>
  );
}

export default function KhPricing() {
  return (
    <section className="relative bg-[#0b1020] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Pricing" chip={PRICING.title} lead={PRICING.lead} />

        <div className="mx-auto mt-14 max-w-4xl border border-white/15 bg-white/[0.03] p-6 text-white md:p-10 lg:p-12">
          {/* Headline price. 月額9万円 is what the manager leads with, so it leads
              here — but the 合計 row below gets comparable weight so the page never
              reads as if 9万円/月 were the whole cost. */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-[17px] font-light text-white/70">
                {PRICING.monthlyLabel}
              </span>
              <Yen figure={PRICING.monthlyFigure} className="text-[clamp(42px,7vw,64px)] leading-none" />
            </div>
            <span className="font-sans text-[15px] font-light text-white/70">
              {PRICING.termNote}
            </span>
          </div>

          <dl className="mt-10 md:mt-12">
            {PRICING.rows.map((row) => (
              <div
                key={row.item}
                className="flex flex-col gap-2 border-t border-white/15 py-5 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between min-[560px]:gap-6"
              >
                <dt className="min-w-0">
                  <span className="block font-sans text-[17px] font-light leading-normal">
                    {row.item}
                  </span>
                  {row.detail ? (
                    <span className="mt-1.5 block font-sans text-[15px] font-light leading-relaxed text-white/60">
                      {row.detail}
                    </span>
                  ) : null}
                </dt>
                <dd className="shrink-0 min-[560px]:text-right">
                  <Yen figure={row.amount} className="text-[24px] leading-none" />
                </dd>
              </div>
            ))}

            {/* Total. The blue rule and the larger figure mark this as the number a
                buyer actually compares against the 補助金 ceiling. */}
            <div className="flex flex-col gap-2 border-t-2 border-[#3b82f6] pt-6 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between min-[560px]:gap-6">
              <dt className="font-sans text-[19px] font-bold">{PRICING.totalLabel}</dt>
              <dd className="shrink-0">
                <Yen figure={PRICING.totalAmount} className="text-[clamp(30px,4.5vw,40px)] leading-none" />
              </dd>
            </div>
          </dl>

          {/* 補助金 panel. No strikethrough on 299万円 anywhere: a struck-through price
              reads as a limited-time sale, and this is a public grant that may or may
              not be awarded.
              The condition 「補助金の交付を受けた場合」 is this panel's first line and sits
              directly above the figure. Never separate them, never demote the
              condition to a footnote. */}
          <div className="mt-10 border border-[#3b82f6]/45 bg-[#3b82f6]/10 p-6 md:mt-12 md:p-8">
            <p className="font-sans text-[17px] font-bold text-white">
              {PRICING.subsidy.condition}
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3">
              <span className="font-sans text-[17px] font-light text-white/70">
                {PRICING.subsidy.label}
              </span>
              <Yen
                figure={PRICING.subsidy.figure}
                className="text-[clamp(36px,6vw,54px)] leading-none text-[#60a5fa]"
              />
              <span className="bg-[#3b82f6] px-2 py-0.5 font-sans text-[14px] font-bold tracking-tight text-white">
                {PRICING.subsidy.aside}
              </span>
            </div>

            <p
              className="mt-5 font-sans text-[16px] font-light text-white/70"
              style={{ lineHeight: 1.9, textWrap: 'pretty' }}
            >
              {PRICING.subsidy.body}
            </p>
          </div>

          <p className="mt-8 font-sans text-[15px] font-light text-white/50">{PRICING.taxNote}</p>
        </div>
      </div>
    </section>
  );
}
