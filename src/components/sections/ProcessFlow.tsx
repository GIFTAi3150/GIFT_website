import Reveal from '@/components/ui/Reveal';
import PixelRobot from '@/components/ui/PixelRobot';

// Mini stylized UIs used as the step illustrations. Built from pure HTML + Tailwind — no images.

function ConsultUI() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-gift-ink px-3 py-1 text-[11px] font-semibold text-white">
          通信・SaaS ×
        </span>
        <span className="rounded-full bg-gift-bg-alt px-3 py-1 text-[11px] text-gift-silver/60">
          小売 ×
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-gift-bg-alt px-3 py-1 text-[11px] text-gift-silver/60">
          教育 ×
        </span>
        <span className="rounded-full bg-gift-green px-3 py-1 text-[11px] font-semibold text-white">
          中小企業 ×
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-gift-green-teal px-3 py-1 text-[11px] font-semibold text-white">
          業務効率化 ×
        </span>
        <span className="rounded-full bg-gift-bg-alt px-3 py-1 text-[11px] text-gift-silver/60">
          新規開拓 ×
        </span>
      </div>
    </div>
  );
}

function ProposalUI() {
  const items = [
    { label: 'KPI設計', done: true },
    { label: 'スクリプト策定', done: true },
    { label: 'チーム体制', done: true },
    { label: 'キックオフ準備', done: false },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center justify-between rounded-md border border-gift-border bg-white px-3 py-2"
        >
          <span className="text-[12px] font-medium text-gift-ink">{it.label}</span>
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-sm ${
              it.done ? 'bg-gift-green text-white' : 'border border-gift-border bg-white'
            }`}
          >
            {it.done && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 6l3 3 5-6" />
              </svg>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function DashboardUI() {
  const metrics = [
    { label: 'コール数', value: '1,240', trend: '+12%' },
    { label: '応答率', value: '68%', trend: '+4pt' },
    { label: '案件化', value: '52件', trend: '+7件' },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between rounded-md border border-gift-border bg-white px-3 py-2"
        >
          <span className="text-[11px] font-medium text-gift-silver">{m.label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-bold text-gift-ink">{m.value}</span>
            <span className="text-[10px] font-semibold text-gift-green">{m.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GaugeUI() {
  // Semi-circle gauge showing 92%.
  const percent = 92;
  const radius = 56;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 140 80" className="w-full max-w-[180px]">
        {/* Track */}
        <path
          d="M14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke="#CDD0D5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke="#25D366"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="70" y="65" textAnchor="middle" className="font-display text-[22px] font-extrabold fill-gift-ink">
          {percent}%
        </text>
      </svg>
      <p className="text-[11px] font-medium text-gift-silver">目標達成率</p>
    </div>
  );
}

const steps = [
  {
    step: '01',
    label: 'CONSULT',
    title: '相談・ヒアリング',
    body: '業種・規模・課題をヒアリングし、最適な事業領域をご提案します。',
    Ui: ConsultUI,
  },
  {
    step: '02',
    label: 'DESIGN',
    title: '提案・設計',
    body: 'KPIと運用体制を設計し、具体的な実行プランをご提示します。',
    Ui: ProposalUI,
  },
  {
    step: '03',
    label: 'EXECUTE',
    title: '実行・運用',
    body: '専任チームが実行を担当し、進捗状況は随時ご共有いたします。',
    Ui: DashboardUI,
  },
  {
    step: '04',
    label: 'IMPROVE',
    title: '成果・改善',
    body: 'データを分析し、次の打ち手まで伴走。継続的に成果を伸ばします。',
    Ui: GaugeUI,
  },
];

export default function ProcessFlow() {
  return (
    <section className="relative w-full border-t border-gift-border bg-white py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-12 flex items-start gap-6">
          <div className="max-w-2xl flex-1">
            <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              HOW WE WORK
            </p>
            <h2
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
            >
              ご依頼の流れ
            </h2>
            <p className="mt-3 font-sans text-normal font-light text-gift-silver">
              相談から成果創出まで、専任チームが伴走します。4ステップでスムーズに進行。
            </p>
          </div>
          {/* Cute pixel robot mascot */}
          <PixelRobot className="h-16 w-16 shrink-0 text-gift-green-teal sm:h-24 sm:w-24 md:h-28 md:w-28" />
        </div>

        {/* Slide hint — mobile only */}
        <p className="mb-4 flex items-center justify-center gap-2 font-sans text-small italic text-gift-silver lg:hidden">
          <span aria-hidden>←</span>
          スライドしてご覧ください
          <span aria-hidden>→</span>
        </p>

        {/* Horizontal swipeable carousel on mobile, 4-col grid on desktop. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {steps.map((s, i) => {
            const Ui = s.Ui;
            return (
              <Reveal key={s.step} delay={i * 100} className="w-[85%] shrink-0 snap-center sm:w-[60%] md:w-[48%] lg:w-auto">
                <div className="group flex h-full flex-col">
                  {/* Illustration frame */}
                  <div className="relative mb-5 flex min-h-[160px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gift-bg-alt to-gift-near-black p-5 transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="w-full max-w-[200px]">
                      <Ui />
                    </div>
                  </div>

                  {/* Step label + divider */}
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-block rounded-full bg-gift-green px-3 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-white">
                      STEP {s.step}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-gift-green/30" />
                  </div>

                  {/* Title + body */}
                  <h3 className="mb-2 font-sans text-medium font-bold text-gift-ink">
                    {s.title}
                  </h3>
                  <p className="flex-1 font-sans text-small font-light leading-relaxed text-gift-silver">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
