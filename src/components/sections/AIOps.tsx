'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { n: '01', label: 'コンテンツ自動生成',   desc: '業務マニュアル・提案書・レポートを即時生成。人的ボトルネックをゼロに。' },
  { n: '02', label: 'リアルタイム品質監視', desc: 'ブランドトーン・正確性・一貫性をAIが常時スキャン。' },
  { n: '03', label: '多言語ローカライズ',   desc: '日英中3言語を同時展開。トーンを保ったまま瞬時に翻訳。' },
  { n: '04', label: 'コンテンツインサイト', desc: 'KPIをリアルタイムダッシュボード化し、改善サイクルを自動提案。' },
  { n: '05', label: 'ナレッジベース構築',   desc: '社内ドキュメントを学習し、自社特化の知識AIを構築。' },
  { n: '06', label: 'ワークフロー自動化',   desc: 'Slack・CRM・CMSと連携し、コンテンツパイプラインを全自動化。' },
];

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

export default function AIOps() {
  const sectionRef = useRef<HTMLElement>(null);
  const termRef    = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const [termLines, setTermLines] = useState(0);

  useEffect(() => {
    let alive = true;

    const ctx = gsap.context(() => {
      // Terminal typewriter — each line slides + fades in sequentially
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

      // Feature cards — stagger slide-up on scroll-in
      const cards = cardRefs.current.filter((c): c is HTMLDivElement => c !== null);
      if (cards.length) {
        gsap.from(cards, {
          y: 32,
          opacity: 0,
          stagger: 0.07,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: cards[0], start: 'top 88%', once: true },
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
          'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(37,99,235,0.16) 0%, transparent 70%)',
          'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'auto, 30px 30px',
      }}
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">

        {/* ── header ───────────────────────────────────── */}
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          {/* gradient headline */}
          <h2
            className="font-display font-extrabold"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 72px)',
              lineHeight: 1.15,
              background: 'linear-gradient(135deg, #FFFFFF 20%, #93C5FD 55%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            人が考え、<br />AIが動かす。
          </h2>

        </div>

        {/* ── terminal mockup ───────────────────────────── */}
        <div
          ref={termRef}
          className="mx-auto mb-14 max-w-2xl overflow-hidden rounded-2xl border border-[#1A2F4A] bg-[#0D1117] shadow-[0_0_60px_rgba(37,99,235,0.1)]"
        >
          {/* macOS window chrome */}
          <div className="flex items-center gap-2 border-b border-[#1A2F4A] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-[11px] text-[#3A5068]">gift-aiops — business-content</span>
          </div>

          {/* terminal body */}
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

            {/* blinking cursor */}
            {termLines > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-[#4B6880]">$</span>
                <span className="inline-block h-[14px] w-[7px] animate-pulse rounded-[1px] bg-[#2563EB]" />
              </div>
            )}
          </div>
        </div>

        {/* ── what is aiops ────────────────────────────── */}
        <div className="mx-auto mb-14 max-w-3xl overflow-hidden rounded-2xl border border-[#1A2F4A] bg-[#070E1C]">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">

            {/* left — decorative label */}
            <div className="relative flex flex-col items-center justify-center border-b border-[#1A2F4A] p-8 md:border-b-0 md:border-r md:border-[#1A2F4A]">
              {/* background watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute select-none font-display font-extrabold leading-none text-[#0D1F3C]"
                style={{ fontSize: 80 }}
              >
                AI
              </span>
              <span className="relative z-10 flex flex-col items-center gap-2 text-center">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[#2563EB]">What is</span>
                <span className="font-display text-4xl font-extrabold text-white">AIOps</span>
                <span className="h-px w-10 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
                <span className="font-display text-[10px] font-medium tracking-[0.25em] text-[#3A5068] uppercase">AI Operations</span>
              </span>
            </div>

            {/* right — definition + tags */}
            <div className="flex flex-col justify-center gap-5 p-8">
              <p className="font-sans" style={{ fontSize: 15, lineHeight: 1.9, color: '#92AABF' }}>
                AIOpsとは、<strong className="font-bold text-white">AIが業務プロセスをリアルタイムで自動化・監視・最適化</strong>する次世代の運用モデル。
                データの収集から異常検知・問題解決まで、AIが自律的に処理し続ける。
                チームは戦略と創造に専念できる。
              </p>
              <div className="flex flex-wrap gap-2">
                {['自動化', 'リアルタイム監視', '異常検知', '最適化', '自律学習', 'データ分析'].map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#1A2F4A] px-3 py-1 font-display text-[11px] font-semibold text-[#4B7AB8] transition-colors duration-200 hover:border-[#2563EB] hover:text-[#7BAEE8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── feature cards ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="group relative overflow-hidden rounded-xl border border-[#1A2F4A] bg-[#070E1C] p-6 transition-all duration-300 hover:border-[#2563EB] hover:shadow-[0_0_30px_rgba(37,99,235,0.18)]"
            >
              <span className="mb-4 block font-display text-[11px] font-bold tracking-[0.2em] text-[#2563EB]">
                {f.n}
              </span>
              <h3 className="mb-2 font-display text-[15px] font-bold leading-snug text-white">
                {f.label}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: '#5A7A96' }} className="font-sans">
                {f.desc}
              </p>
              {/* corner glow — appears on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-[#2563EB]/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>

        {/* ── cta ──────────────────────────────────────── */}
        <div className="mt-14 flex justify-center">
          <a
            href="/services/dx-consulting"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#2563EB] px-8 py-3.5 font-display text-sm font-bold text-[#2563EB] transition-colors duration-300 hover:text-white"
          >
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 bg-[#2563EB] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
            />
            <span className="relative z-10">DXコンサルの詳細を見る</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
