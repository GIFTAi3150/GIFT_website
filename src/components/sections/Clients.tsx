import Reveal from '@/components/ui/Reveal';

const industries = [
  {
    label: '通信キャリア',
    labelEn: 'Telecom',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M6.5 18.5L3 22M17.5 18.5L21 22M9 18h6M12 2v4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M12 10a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
  {
    label: 'SaaS企業',
    labelEn: 'SaaS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 19h8M12 15v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
  {
    label: '中小企業',
    labelEn: 'SMB',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h1M9 13h1M9 17h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
  {
    label: '金融・融資',
    labelEn: 'Finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
  {
    label: 'スタートアップ',
    labelEn: 'Startup',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
  {
    label: 'LINE公式運用',
    labelEn: 'LINE Official',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    span: 'col-span-1',
  },
];

export default function Clients() {
  return (
    <section className="w-full border-t border-gift-border bg-gift-bg py-s-80">
      <Reveal>
        <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              INDUSTRIES
            </p>
            <h2
              className="mb-3 font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
            >
              幅広い業種をサポート
            </h2>
            <p className="max-w-xl font-sans text-normal font-light text-gift-silver">
              アライアンスパートナーとの連携により、多様な業界のお客様を支援しています。
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {industries.map((ind, i) => (
            <Reveal key={ind.labelEn} delay={i * 80}>
              <div className="group relative flex flex-col items-center gap-4 rounded-2xl border border-gift-border bg-white px-4 py-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-gift-green/40 hover:shadow-[0_8px_30px_rgba(37,211,102,0.08)]">
                {/* Icon circle */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gift-bg text-gift-green-teal transition-colors duration-500 group-hover:bg-gift-green group-hover:text-white">
                  {ind.icon}
                </div>

                {/* Labels */}
                <div>
                  <p className="font-sans text-[15px] font-bold text-gift-ink">
                    {ind.label}
                  </p>
                  <p className="mt-1 font-display text-[11px] font-medium uppercase tracking-widest text-gift-silver">
                    {ind.labelEn}
                  </p>
                </div>

                {/* Subtle green bottom accent on hover */}
                <div className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-gift-green transition-all duration-500 group-hover:w-12" />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stats row */}
        <Reveal delay={500}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-8 rounded-2xl border border-gift-border bg-white px-8 py-6 md:gap-16">
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold leading-none text-gift-green">
                500<span className="text-[20px]">社+</span>
              </p>
              <p className="mt-1 font-sans text-[12px] text-gift-silver">累計支援企業</p>
            </div>
            <div className="hidden h-8 w-px bg-gift-border md:block" />
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold leading-none text-gift-green">
                6<span className="text-[20px]">+</span>
              </p>
              <p className="mt-1 font-sans text-[12px] text-gift-silver">対応業種</p>
            </div>
            <div className="hidden h-8 w-px bg-gift-border md:block" />
            <div className="text-center">
              <p className="font-display text-[32px] font-extrabold leading-none text-gift-green">
                2018<span className="text-[20px]">年〜</span>
              </p>
              <p className="mt-1 font-sans text-[12px] text-gift-silver">運営開始</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
