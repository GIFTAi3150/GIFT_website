const ITEMS = [
  '素直さ', '熱量', '寄り添い', '成長', '挑戦',
  '誠実', '変革', '未来', '共感', '信頼',
];

const ALL = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

export default function CompanyMarquee() {
  return (
    <div className="overflow-hidden border-y border-[#D95208]/12 bg-[#EFF6F9] py-[14px]" aria-hidden>
      <div
        className="flex shrink-0 items-center whitespace-nowrap"
        style={{ animation: 'orbit-scroll 22s linear infinite' }}
      >
        {ALL.map((item, i) => (
          <span
            key={i}
            className="shrink-0 px-7 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#D95208]/45"
          >
            {item}
            <span className="ml-7 text-[#D95208]/20">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
