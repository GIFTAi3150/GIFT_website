'use client';

import Link from 'next/link';

const WORDS = ['Company', 'Vision', 'Mission', 'Culture', 'GIFT', 'About', 'Team', 'Story'];
const LOOP = [...WORDS, ...WORDS];

export default function HPAbout() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6F2] py-24 md:py-32">

      {/* ── background marquee ───────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center overflow-hidden"
      >
        <div className="flex animate-marquee gap-16 whitespace-nowrap font-display text-[clamp(120px,18vw,220px)] font-black uppercase leading-none tracking-tighter text-black/[0.038]">
          {LOOP.map((w, i) => (
            <span key={i}>{w},</span>
          ))}
        </div>
      </div>

      {/* ── main content ─────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">

        {/* heading */}
        <div className="mb-12 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h2 className="font-display text-[clamp(56px,10vw,120px)] font-black leading-none tracking-tighter text-[#111B21]">
            About
          </h2>
          <span className="mb-2 rounded bg-[#111B21] px-4 py-2 font-display text-[14px] font-bold tracking-wider text-white">
            私たちについて
          </span>
        </div>

        {/* video */}
        <div className="mb-12 flex justify-start md:justify-center">
          {/* No fixed height — video sizes itself from width (square 800×800 source) */}
          <div className="relative">
            {/* soft purple glow */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)',
                animation: 'about-pulse 4s ease-in-out infinite',
                filter: 'blur(28px)',
                pointerEvents: 'none',
              }}
            />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 block h-auto w-[300px] md:w-[400px]"
              style={{
                filter: 'drop-shadow(0 12px 60px rgba(120,60,255,0.45))',
              }}
            >
              <source src="/videos/about-loop.webm" type="video/webm" />
              <source src="/videos/about-loop.mp4"  type="video/mp4" />
            </video>
          </div>
        </div>

        {/* body copy */}
        <div className="mb-10 max-w-[520px]">
          <p
            className="mb-4 font-display font-bold leading-snug text-[#111B21]"
            style={{ fontSize: 'clamp(22px, 3.2vw, 32px)' }}
          >
            業務を、AIで自律化する。
          </p>
          <p className="font-sans text-[16px] leading-relaxed text-[#1A2630]">
            GIFTのAIOpsは、反復業務の自動化にとどまりません。データをもとに自ら判断・改善するシステムを構築し、人が創造的な仕事に集中できる次世代の業務基盤を提供します。
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/company"
          className="group inline-flex items-center gap-3 border border-[#111B21] bg-[#111B21] px-5 py-2.5 text-white transition-all duration-300 hover:bg-transparent hover:text-[#111B21]"
        >
          <span className="font-display text-sm font-bold tracking-widest">View More</span>
          <span className="text-base transition-transform duration-300 group-hover:translate-x-1">›</span>
        </Link>

      </div>

      <style>{`
        @keyframes about-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
          50%       { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
