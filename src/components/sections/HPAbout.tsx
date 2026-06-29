'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const WORDS = ['Company', 'Vision', 'Mission', 'Culture', 'GIFT', 'About', 'Team', 'Story'];
const LOOP = [...WORDS, ...WORDS];

function makeGrainUrl(size = 256, amplitude = 18): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const id = ctx.createImageData(size, size);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.floor((Math.random() - 0.5) * 2 * amplitude);
    d[i] = 128 + n;
    d[i + 1] = 128 + n;
    d[i + 2] = 128 + n;
    d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c.toDataURL();
}

export default function HPAbout() {
  const [grainUrl, setGrainUrl] = useState('');
  useEffect(() => {
    setGrainUrl(makeGrainUrl());
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F8F6F2] py-24 md:py-32">

      {/* ── grain texture ────────────────────────────────────── */}
      {grainUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${grainUrl})`,
            backgroundSize: '256px 256px',
            backgroundRepeat: 'repeat',
            mixBlendMode: 'multiply',
            opacity: 0.35,
          }}
        />
      )}

      {/* ── background marquee ───────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] flex select-none items-center overflow-hidden"
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

        {/* text + CTA */}
        <div>
          <div className="mb-10 max-w-[520px]">
            <p
              className="mb-4 font-display font-bold leading-snug text-[#111B21]"
              style={{ fontSize: 'clamp(22px, 3.2vw, 32px)' }}
            >
              GIFTが、AIOpsに取り組む理由。
            </p>
            <p className="font-sans text-[19px] leading-relaxed text-[#111B21]">
              GIFTは、現場で人と組織を動かしてきた会社です。その経験があるからこそ、AIを「使える状態」まで根づかせられる。私たちがAIOpsに取り組む理由を、ここに。
            </p>
          </div>

          <Link
            href="/company"
            className="group inline-flex items-center gap-3 border border-[#111B21] bg-[#111B21] px-5 py-2.5 text-white transition-all duration-300 hover:bg-transparent hover:text-[#111B21]"
          >
            <span className="font-display text-sm font-bold tracking-widest">View More</span>
            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">›</span>
          </Link>
        </div>

      </div>


    </section>
  );
}
