'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TERMINAL = [
  { k: 'cmd',  t: 'gift-aiops init --target=business-content' },
  { k: 'ok',   t: 'AI engine: online' },
  { k: 'cmd',  t: 'scanning 1,240 documents...' },
  { k: 'data', t: '847 content clusters extracted' },
  { k: 'cmd',  t: 'deploying generation pipeline...' },
  { k: 'ok',   t: 'pipeline ready — avg latency 0.8s' },
  { k: 'cmd',  t: 'activating quality monitor...' },
  { k: 'ok',   t: 'consistency: 98.4%  ✓ all checks passed' },
];

const STATS = [
  { value: '0.8s',   label: '平均生成レイテンシ' },
  { value: '98.4%',  label: '品質一貫性スコア'   },
  { value: '3言語',  label: '日英中 同時展開'    },
] as const;

const PILLARS = [
  {
    n: '01',
    labelJa: '自律コンテンツ生成',
    labelEn: 'Content Generation',
    desc: '業務マニュアル・提案書・レポートをAIが即時生成。人的ボトルネックをゼロに。',
  },
  {
    n: '02',
    labelJa: 'リアルタイム品質管理',
    labelEn: 'Quality Monitoring',
    desc: 'ブランドトーン・正確性・一貫性をAIが24/7で常時スキャン。問題を発生前に検知する。',
  },
  {
    n: '03',
    labelJa: '統合ワークフロー自動化',
    labelEn: 'Workflow Automation',
    desc: 'Slack・CRM・CMSと連携し、コンテンツパイプライン全体を自動化。',
  },
] as const;

export default function AIOps() {
  const sectionRef  = useRef<HTMLElement>(null);
  const termRef     = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const pillarsRef  = useRef<HTMLDivElement>(null);
  const [termLines, setTermLines] = useState(0);

  useEffect(() => {
    let alive = true;

    const ctx = gsap.context(() => {

      // Terminal typewriter
      if (termRef.current) {
        ScrollTrigger.create({
          trigger: termRef.current,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            TERMINAL.forEach((_, i) => {
              setTimeout(() => {
                if (alive) setTermLines(prev => Math.max(prev, i + 1));
              }, i * 370);
            });
          },
        });
      }

      // Stats counter-up fade
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 20,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        });
      }

      // Pillar rows slide in
      if (pillarsRef.current) {
        gsap.from(pillarsRef.current.children, {
          y: 28,
          opacity: 0,
          stagger: 0.1,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: pillarsRef.current, start: 'top 88%', once: true },
        });
      }

    }, sectionRef);

    return () => {
      alive = false;
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden border-t border-b border-[#1A2F4A] bg-[#020916] py-s-80"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(37,99,235,0.14) 0%, transparent 70%)',
          'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'auto, 32px 32px',
      }}
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">

        {/* ── header ───────────────────────────────────────── */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
            AI OPERATIONS
          </p>
          <h2
            className="font-display font-extrabold"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 72px)',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #93C5FD 55%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            人が考え、<br />AIが動かす。
          </h2>
          <p
            className="font-sans font-light"
            style={{ fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: 1.9, color: '#5A7A96', maxWidth: 480 }}
          >
            業務プロセスの自動化・監視・最適化を、AIが自律的に担う。<br />
            チームは判断と創造に専念できる。
          </p>
        </div>

        {/* ── terminal ─────────────────────────────────────── */}
        <div
          ref={termRef}
          className="mx-auto mb-14 max-w-2xl overflow-hidden rounded-2xl border border-[#1A2F4A] bg-[#0D1117] shadow-[0_0_60px_rgba(37,99,235,0.1)]"
        >
          {/* macOS chrome */}
          <div className="flex items-center gap-2 border-b border-[#1A2F4A] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-[11px] text-[#3A5068]">gift-aiops — business-content</span>
          </div>
          <div className="space-y-2.5 p-6 font-mono text-[13px] leading-relaxed">
            {TERMINAL.map((line, i) => (
              <div
                key={i}
                className="flex gap-2.5"
                style={{
                  opacity:   i < termLines ? 1 : 0,
                  transform: i < termLines ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}
              >
                <span className={
                  line.k === 'ok'   ? 'shrink-0 text-[#22C55E]' :
                  line.k === 'data' ? 'shrink-0 text-[#06B6D4]' :
                                      'shrink-0 text-[#4B6880]'
                }>
                  {line.k === 'ok' ? '✓' : line.k === 'data' ? '→' : '$'}
                </span>
                <span className={
                  line.k === 'ok'   ? 'text-[#22C55E]' :
                  line.k === 'data' ? 'text-[#06B6D4]' :
                                      'text-[#CDD6F4]'
                }>
                  {line.t}
                </span>
              </div>
            ))}
            {termLines > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-[#4B6880]">$</span>
                <span className="inline-block h-[14px] w-[7px] animate-pulse rounded-[1px] bg-[#2563EB]" />
              </div>
            )}
          </div>
        </div>

        {/* ── stats bar ────────────────────────────────────── */}
        <div
          ref={statsRef}
          className="mx-auto mb-16 grid max-w-2xl grid-cols-3 divide-x divide-[#1A2F4A] rounded-2xl border border-[#1A2F4A] bg-[#070E1C]"
        >
          {STATS.map(s => (
            <div key={s.value} className="flex flex-col items-center gap-1.5 px-6 py-7 text-center">
              <span
                className="font-display font-extrabold"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 42px)',
                  background: 'linear-gradient(135deg, #60A5FA, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </span>
              <span className="font-sans text-[12px] font-medium text-[#3A5068]">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── capability pillars ───────────────────────────── */}
        <div ref={pillarsRef} className="mx-auto max-w-3xl">
          {PILLARS.map((p, i) => (
            <div
              key={p.n}
              className="group relative flex items-start gap-8 border-t border-[#1A2F4A] py-8 transition-all duration-300 last:border-b hover:border-[#2563EB]/40 last:hover:border-[#2563EB]/40"
            >
              {/* Left accent line — slides in from top on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 w-[2px] origin-top scale-y-0 bg-gradient-to-b from-[#2563EB] to-[#06B6D4] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
                style={{ height: '100%' }}
              />

              {/* Number */}
              <div className="shrink-0 pl-4 pt-1">
                <span
                  className="font-display font-extrabold leading-none"
                  style={{
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    background: 'linear-gradient(135deg, #1e3a6e 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    transition: 'filter 0.3s',
                  }}
                >
                  {p.n}
                </span>
              </div>

              {/* Content */}
              <div
                className="flex flex-1 flex-col gap-2 transition-transform duration-300 group-hover:translate-x-1 md:flex-row md:items-start md:gap-10"
              >
                <div className="shrink-0 md:w-52">
                  <p className="font-display text-[16px] font-bold leading-snug text-white">
                    {p.labelJa}
                  </p>
                  <p className="mt-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
                    {p.labelEn}
                  </p>
                </div>
                <p
                  className="font-sans font-light"
                  style={{ fontSize: 'clamp(13px, 1.3vw, 15px)', lineHeight: 1.85, color: '#5A7A96' }}
                >
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── cta ──────────────────────────────────────────── */}
        <div className="mt-14 flex justify-center">
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
