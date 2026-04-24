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
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
          WORKS
        </p>
        <h2
          className="font-sans font-extrabold text-gift-ink"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          実績・強み
        </h2>
        <p className="mt-2 font-sans text-normal font-light text-gift-silver">
          3つの事業を軸に、お客様の成長を支援しています。
        </p>
      </div>

      {/* Mobile: horizontal swipe with snap. Desktop: 3-column grid. No arrows. */}
      <div className="mx-auto max-w-container">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 py-6 md:px-6 md:py-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-8 lg:py-0">
          {cases.map((c) => {
            const Icon = SERVICE_ICON_BY_ID[c.iconId];
            return (
            <div
              key={c.id}
              className="group flex w-[85%] shrink-0 cursor-pointer snap-center flex-col rounded-2xl border border-gift-border bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-gift-green/40 hover:shadow-[0_20px_40px_-12px_rgba(37,211,102,0.3),0_0_30px_-5px_rgba(37,211,102,0.2)] active:scale-[0.99] sm:w-[60%] lg:w-auto"
            >
              <div className="mb-4">
                {Icon && (
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gift-green/10 text-gift-green transition-all duration-300 group-hover:scale-110 group-hover:bg-gift-green/20">
                    <Icon className="h-7 w-7" />
                  </span>
                )}
              </div>
              <h3 className="mb-6 font-sans text-medium font-bold leading-snug text-gift-ink">
                {c.title}
              </h3>
              <div className="mt-auto grid grid-cols-2 gap-3">
                {c.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-gift-border bg-gift-bg-alt px-3 py-4 text-center"
                  >
                    <p className="font-display text-[28px] font-extrabold leading-none text-gift-green">
                      {m.value}
                      <span className="text-[16px]">{m.suffix}</span>
                    </p>
                    <p className="mt-2 font-sans text-[12px] text-gift-silver">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
