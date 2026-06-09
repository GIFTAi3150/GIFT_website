import CountUp from '@/components/ui/CountUp';

const stats = [
  { end: 300, plus: true, suffix: '名', label: '従業員数', sub: 'Employees' },
  { end: 4, plus: false, suffix: '領域', label: '事業フィールド', sub: 'Business Areas' },
  { end: 8, plus: true, suffix: '年', label: '継続年数', sub: 'Years of Service' },
];

export default function CompanyStatsBar() {
  return (
    <section className="bg-[#1A1210] py-14">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-[#D95208]/25">
          {stats.map((s) => (
            <div
              key={s.label}
              data-gsap="stat"
              className="flex flex-col items-center gap-1 px-4 py-2 text-center"
            >
              <p className="font-display text-[10px] font-bold uppercase tracking-widest text-[#E8C5BE]/40">
                {s.sub}
              </p>
              <p
                className="font-sans font-extrabold text-white"
                style={{ fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: 1 }}
              >
                <CountUp end={s.end} duration={1800} />
                {s.plus && <span className="text-[#F07A30]">+</span>}
              </p>
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-[#E8C5BE]/60">
                {s.label}
                <span className="ml-1 text-[#F07A30]">{s.suffix}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
