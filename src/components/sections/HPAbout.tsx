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
  // true  → show WebM with alpha (Chrome / Firefox)
  // false → show beige MP4 only (Safari iOS + desktop)
  //
  // Start true so SSR HTML and the initial client render both include the WebM
  // <source>. Chrome picks it up immediately on hydration without needing a
  // video.load() call. The useEffect flips this to false for Safari, which
  // causes the `key` prop on <video> to change — React unmounts/remounts the
  // element so the browser restarts source-selection with MP4 only.
  const [useAlphaVideo, setUseAlphaVideo] = useState(true);

  useEffect(() => {
    setGrainUrl(makeGrainUrl());
    // Safari (desktop and iOS) plays WebM VP9 but strips the alpha channel,
    // rendering transparent areas as solid black. Chrome includes "Safari" in
    // its UA too, so we must also exclude "Chrome" / "Chromium".
    const ua = navigator.userAgent;
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua);
    if (isSafari) setUseAlphaVideo(false);
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

        {/* 2-col grid: text left, video right — stacked on mobile (video first) */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">

          {/* video — order-1 on mobile (top), order-2 on desktop (right) */}
          <div className="order-1 flex justify-center md:order-2">
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
              {/* drop-shadow is on this wrapper, NOT on <video> directly.
                  Chrome on Windows has a compositing bug where filter applied
                  to a transparent WebM video causes the video to be invisible.
                  Moving it one level up avoids the GPU layer conflict while
                  still producing an alpha-aware shadow (the wrapper has no
                  opaque background, so the shadow traces the video's shape). */}
              <div
                style={{
                  filter: useAlphaVideo
                    ? 'drop-shadow(0 12px 60px rgba(120,60,255,0.45))'
                    : 'drop-shadow(0 8px 32px rgba(120,60,255,0.22))',
                }}
              >
                <video
                  key={useAlphaVideo ? 'webm' : 'mp4'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative z-10 block h-auto w-[280px] md:w-[400px]"
                >
                  {useAlphaVideo && (
                    <source src="/videos/about-alpha.webm" type="video/webm" />
                  )}
                  <source src="/videos/about-beige.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>

          {/* text + CTA — order-2 on mobile (bottom), order-1 on desktop (left) */}
          <div className="order-2 md:order-1">
            <div className="mb-10 max-w-[520px]">
              <p
                className="mb-4 font-display font-bold leading-snug text-[#111B21]"
                style={{ fontSize: 'clamp(22px, 3.2vw, 32px)' }}
              >
                業務を、AIで自律化する。
              </p>
              <p className="font-sans text-[19px] leading-relaxed text-[#111B21]">
                GIFTのAIOpsは、反復業務の自動化にとどまりません。データをもとに自ら判断・改善するシステムを構築し、人が創造的な仕事に集中できる次世代の業務基盤を提供します。
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
