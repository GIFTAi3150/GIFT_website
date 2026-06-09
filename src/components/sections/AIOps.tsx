'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WHAT_IS = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    ja: '業務タスクの完全自動化',
    en: 'Automate every repetitive operation end-to-end',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    ja: '24/7 品質・精度の自律監視',
    en: 'AI monitors every output, around the clock',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
    ja: 'Slack · CRM · CMS と統合',
    en: 'Every tool in your stack, wired into one pipeline',
  },
] as const;

const WHY_GIFT = [
  {
    n: '01', color: '#3B82F6',
    title: '日本市場の専門性', proof: '日 · 英 · 中 トリリンガル',
    desc: '日本のビジネス慣行・言語ニュアンスを深く理解したAI運用基盤',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  },
  {
    n: '02', color: '#06B6D4',
    title: 'ツールではなく、運用', proof: '導入〜運用 一貫担当',
    desc: 'SaaSを渡すだけでなく、パイプライン全体の設計・運用をGIFTが担う',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  },
  {
    n: '03', color: '#22C55E',
    title: '品質 × スピード', proof: '98.4% スコア / 0.8s 生成',
    desc: '業界平均を大きく上回る品質一貫性を、本番スケールで維持し続ける',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    n: '04', color: '#A78BFA',
    title: '実証済みの実績', proof: '金融 · CC · DX 複数業種',
    desc: '金融・コールセンター・DX支援など多業種で実運用済みのパイプライン',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>,
  },
] as const;

const METRICS = [
  { value: '0.8s',   upper: '平均生成レイテンシ',  lower: '人手作業の 40× 速度' },
  { value: '98.4%',  upper: '品質一貫性スコア',     lower: '本番環境で継続維持' },
  { value: '3言語',  upper: '同時展開対応',          lower: '日 · 英 · 中' },
  { value: '24/7',   upper: '自律監視稼働',          lower: '人手介入ゼロ' },
] as const;

export default function AIOps() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const leftRef     = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const metricsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true },
        });
      }
      if (leftRef.current) {
        gsap.from(leftRef.current, {
          x: -30, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: leftRef.current, start: 'top 80%', once: true },
        });
      }
      if (rightRef.current) {
        gsap.from(rightRef.current.querySelectorAll('.aiops-card'), {
          y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: rightRef.current, start: 'top 80%', once: true },
        });
      }
      if (metricsRef.current) {
        gsap.from(metricsRef.current.children, {
          y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: metricsRef.current, start: 'top 88%', once: true },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden border-t border-b border-[#1A2F4A] bg-[#020916] py-s-80"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 70%)',
          'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'auto, 32px 32px',
      }}
    >
      <style>{`
        @keyframes aiops-flow {
          0%   { left: -8px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { left: calc(100% + 8px); opacity: 0; }
        }
        .aiops-dot-a { animation: aiops-flow 2.4s linear infinite; }
        .aiops-dot-b { animation: aiops-flow 2.4s linear infinite 1.2s; }
        .aiops-card  { transition: border-color 0.3s ease, box-shadow 0.3s ease; }
      `}</style>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">

        {/* ── header ───────────────────────────────────────── */}
        <div ref={headerRef} className="mb-16 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-[11px] font-bold uppercase tracking-widest text-[#2563EB]">
            AI OPERATIONS
          </p>
          <h2
            className="font-display font-extrabold"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #93C5FD 55%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            業務を、AIに任せる時代へ。
          </h2>
          <p
            className="font-sans font-light"
            style={{ fontSize: 'clamp(14px, 1.4vw, 16px)', lineHeight: 1.85, color: '#5A7A96', maxWidth: 520 }}
          >
            AIOpsとは、AIが業務プロセスを自律的に実行・監視・最適化する仕組みです。<br />
            GIFTはそのパイプラインを、日本の現場に合わせて設計・運用します。
          </p>
        </div>

        {/* ── two-column ───────────────────────────────────── */}
        <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">

          {/* Left: What is AIOps */}
          <div ref={leftRef} className="flex flex-col justify-center lg:col-span-2">
            <p className="mb-8 font-display text-[11px] font-bold uppercase tracking-widest text-[#3A5068]">
              AIOpsとは
            </p>

            {/* Pipeline flow visualization */}
            <div className="mb-10 rounded-2xl border border-[#1A2F4A] bg-[#070E1C] p-6">
              <div className="flex items-center justify-between">

                {/* Node: Input */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2563EB]/30 bg-[#0D1B35]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth={1.5} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#3A5068]">業務データ</span>
                </div>

                {/* Line 1 */}
                <div className="relative mx-1 flex-1">
                  <div className="h-px bg-gradient-to-r from-[#2563EB]/40 to-[#06B6D4]/40" />
                  <div
                    className="aiops-dot-a absolute top-0 h-2 w-2 -translate-y-1/2 rounded-full"
                    style={{ background: '#2563EB', boxShadow: '0 0 8px #2563EB' }}
                  />
                </div>

                {/* Node: AI Core */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-[#06B6D4]/50 bg-[#0A1A2E]"
                    style={{ boxShadow: '0 0 24px rgba(6,182,212,0.18)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={1.5} className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(6,182,212,0.7)' }}>AI Core</span>
                </div>

                {/* Line 2 */}
                <div className="relative mx-1 flex-1">
                  <div className="h-px bg-gradient-to-r from-[#06B6D4]/40 to-[#22C55E]/40" />
                  <div
                    className="aiops-dot-b absolute top-0 h-2 w-2 -translate-y-1/2 rounded-full"
                    style={{ background: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }}
                  />
                </div>

                {/* Node: Output */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#0D1B35]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={1.5} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#3A5068]">成果物</span>
                </div>

              </div>
            </div>

            {/* What-is bullets */}
            <div className="space-y-6">
              {WHAT_IS.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1A2F4A] bg-[#0D1B35] text-[#60A5FA]"
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-white">{item.ja}</p>
                    <p className="mt-0.5 font-sans text-[12px] text-[#3A5068]">{item.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Why GIFT */}
          <div ref={rightRef} className="lg:col-span-3">
            <p className="mb-8 font-display text-[11px] font-bold uppercase tracking-widest text-[#3A5068]">
              GIFTを選ぶ理由
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WHY_GIFT.map((card) => (
                <div
                  key={card.n}
                  className="aiops-card group relative overflow-hidden rounded-2xl border border-[#1A2F4A] bg-[#070E1C] p-6 hover:border-[#2563EB]/40"
                  style={{ '--card-color': card.color } as React.CSSProperties}
                >
                  {/* Number badge */}
                  <span
                    className="absolute right-4 top-4 font-display text-[10px] font-bold tracking-wider"
                    style={{ color: card.color + '55' }}
                  >
                    {card.n}
                  </span>

                  {/* Icon */}
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: card.color + '40',
                      background: card.color + '14',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Title */}
                  <p className="mb-1 font-display text-[15px] font-bold text-white">{card.title}</p>

                  {/* Proof stat */}
                  <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ color: card.color }}>
                    {card.proof}
                  </p>

                  {/* Description */}
                  <p className="font-sans text-[12px] leading-relaxed text-[#4B6880]">{card.desc}</p>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at 0% 0%, ${card.color}10 0%, transparent 65%)` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── metrics strip ────────────────────────────────── */}
        <div
          ref={metricsRef}
          className="mb-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#1A2F4A] bg-[#1A2F4A] sm:grid-cols-4"
        >
          {METRICS.map((m) => (
            <div key={m.value} className="flex flex-col items-center gap-1 bg-[#070E1C] px-6 py-8 text-center">
              <span
                className="font-display font-extrabold leading-none"
                style={{
                  fontSize: 'clamp(26px, 3vw, 40px)',
                  background: 'linear-gradient(135deg, #60A5FA, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {m.value}
              </span>
              <span className="mt-1 font-display text-[11px] font-semibold text-white/70">{m.upper}</span>
              <span className="font-sans text-[10px] text-[#3A5068]">{m.lower}</span>
            </div>
          ))}
        </div>

        {/* ── cta ──────────────────────────────────────────── */}
        <div className="flex justify-center">
          <a
            href="/services/dx-consulting"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#2563EB] px-8 py-3.5 font-display text-sm font-bold text-[#2563EB] transition-colors duration-300 hover:text-white"
          >
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 bg-[#2563EB] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
            />
            <span className="relative z-10">AIOpsの詳細を見る</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
