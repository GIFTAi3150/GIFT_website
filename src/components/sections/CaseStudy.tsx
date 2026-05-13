import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

// TODO: replace placeholder metric values when manager sends real numbers.
const cases = [
  {
    id: 1,
    iconId: 'callcenter',
    industry: 'CALL CENTER',
    title: 'アウトバウンド特化・自社運営の約300名体制',
    metrics: [
      { value: '300', suffix: '名+', label: '体制' },
      { value: '2018', suffix: '年〜', label: '運営開始' },
    ],
  },
  {
    id: 2,
    iconId: 'dx-consulting',
    industry: 'DX CONSULTING',
    title: 'LINE・RPA・AI導入をワンストップで支援',
    metrics: [
      { value: '50', suffix: '社+', label: '支援企業' },
      { value: '1,000', suffix: '時間+', label: 'RPA削減' },
    ],
  },
  {
    id: 3,
    iconId: 'finance-consulting',
    industry: 'FINANCIAL CONSULTING',
    title: '融資支援から財務戦略まで伴走型サポート',
    metrics: [
      { value: '30', suffix: '社+', label: '支援企業' },
      { value: '¥10', suffix: '億+', label: '融資調達' },
    ],
  },
];

export default function CaseStudy() {
  return (
    <section className="w-full bg-gift-bg-alt py-s-80">
      <div className="mx-auto mb-12 flex max-w-container flex-col gap-3 px-4 md:mb-16 md:px-6 lg:px-8">
        <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
          WORKS
        </p>
        <h2
          className="font-sans font-extrabold text-gift-ink"
          style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
        >
          実績・強み
        </h2>
        <p className="font-sans text-normal font-light text-gift-silver">
          3つの事業を軸に、お客様の成長を支援しています。
        </p>
      </div>

      {/* Mobile/tablet: horizontal swipe rail with hidden scrollbar — the
          partially-visible neighbor card cues the affordance. Desktop:
          3-column grid. */}
      <div className="mx-auto max-w-container">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 py-6 md:px-6 md:py-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-8 lg:py-0">
          {cases.map((c, i) => {
            const Icon = SERVICE_ICON_BY_ID[c.iconId];
            const index = String(i + 1).padStart(2, '0');
            return (
              <article
                key={c.id}
                className="group relative flex w-[82%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-gift-border bg-white p-7 transition-[transform,border-color,box-shadow] duration-[400ms] ease-out hover:-translate-y-1.5 hover:border-gift-green hover:shadow-[0_24px_48px_-16px_rgba(17,27,33,0.18)] sm:w-[58%] sm:p-8 lg:w-auto"
              >
                {/* Editorial index — large, faint, sits behind icon. Tints
                    forward on hover so the card has a clear "active" tell
                    beyond the lift+border. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-3 select-none font-display font-extrabold leading-none text-gift-green/[0.08] transition-colors duration-[400ms] group-hover:text-gift-green/25"
                  style={{ fontSize: 'clamp(72px, 7vw, 104px)' }}
                >
                  {index}
                </span>

                {/* Icon — flips to solid green on hover, mirroring the
                    card's elevation change. */}
                <div className="relative mb-6">
                  {Icon && (
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gift-green/10 text-gift-green transition-colors duration-[400ms] group-hover:bg-gift-green group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </span>
                  )}
                </div>

                <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-gift-silver">
                  {c.industry}
                </p>
                <h3 className="mb-10 font-sans text-medium font-bold leading-snug text-gift-ink">
                  {c.title}
                </h3>

                {/* Metrics row — inline at the foot of the card with a
                    thin rule above. Hierarchy: huge number, small suffix,
                    small caps label. No nested boxes. */}
                <div className="mt-auto flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-gift-border pt-5">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="font-display text-[30px] font-extrabold leading-none text-gift-ink">
                        {m.value}
                        <span className="text-[15px] text-gift-green">{m.suffix}</span>
                      </p>
                      <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.15em] text-gift-silver">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom accent — a thin green line that draws in from
                    the left edge on hover. Reads as an editorial reading
                    guide rather than a generic glow. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-gift-green transition-transform duration-[500ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
