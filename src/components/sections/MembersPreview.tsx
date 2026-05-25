'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

const PLACEHOLDER_VIDEOS = [
  '/video/cc-vid.mp4',
  '/video/dx-consulting-vid.mp4',
  '/video/financial-consulting-vid.mp4',
];

const CARD_W = 210;
const CARD_H = 270;
const MOVE_THRESHOLD = 16;

export interface MemberPreviewCard {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  video?: string;
}

export default function MembersPreview({ members }: { members: MemberPreviewCard[] }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  // refs on wrapper divs, not on Link/a (avoids Next.js ref-forwarding surprises)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const slotRef = useRef(0);
  const lastPos = useRef({ x: -999, y: -999 });
  const fadeTimers = useRef<(gsap.core.Tween | null)[]>([]);

  useEffect(() => {
    const zone = zoneRef.current;
    const cursor = cursorRef.current;
    if (!zone || !cursor) return;
    if (window.innerWidth < 768) return;

    const N = members.length;

    function onMove(e: MouseEvent) {
      const rect = zone!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.set(cursor, { x, y });

      if (Math.hypot(x - lastPos.current.x, y - lastPos.current.y) < MOVE_THRESHOLD) return;
      lastPos.current = { x, y };

      const slot = slotRef.current % N;
      slotRef.current++;

      const el = trailRefs.current[slot];
      const vid = videoRefs.current[slot];
      if (!el || !vid) return;

      fadeTimers.current[slot]?.kill();
      void vid.play().catch(() => {});

      const rot = (Math.random() - 0.5) * 14;

      gsap.set(el, {
        x: x - CARD_W / 2,
        y: y - CARD_H / 2,
        scale: 0.72,
        autoAlpha: 0,
        rotation: rot,
        zIndex: slotRef.current + 20,
      });
      gsap.to(el, { scale: 1, autoAlpha: 1, rotation: rot * 0.4, duration: 0.22, ease: 'power2.out' });

      fadeTimers.current[slot] = gsap.to(el, {
        scale: 0.12,
        autoAlpha: 0,
        duration: 0.85,
        ease: 'expo.out',
        delay: 0.55,
        onComplete: () => vid.pause(),
      });
    }

    function onEnter() {
      gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.2 });
    }
    function onLeave() {
      gsap.to(cursor, { autoAlpha: 0, scale: 0.5, duration: 0.3 });
    }

    zone.addEventListener('mousemove', onMove);
    zone.addEventListener('mouseenter', onEnter);
    zone.addEventListener('mouseleave', onLeave);
    return () => {
      zone.removeEventListener('mousemove', onMove);
      zone.removeEventListener('mouseenter', onEnter);
      zone.removeEventListener('mouseleave', onLeave);
    };
  }, [members]);

  return (
    <section className="bg-[#111B21] py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 flex items-end justify-between md:mb-16">
          <div>
            <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-[#25D366]">
              Members
            </p>
            <h2
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', lineHeight: 1.0 }}
            >
              Our People.
            </h2>
          </div>
          <Link
            href="/member"
            className="group hidden items-center gap-2 font-sans text-sm font-medium text-[#25D366] transition-opacity hover:opacity-70 md:flex"
          >
            チームを見る
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* ── DESKTOP: roster list + cursor video trail ─────────────────── */}
        {/* NO overflow-hidden here — it would clip the absolutely positioned trail cards */}
        <div ref={zoneRef} className="relative hidden cursor-none md:block">
          {/* tiny green dot that replaces the cursor */}
          <div
            ref={cursorRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#25D366]"
            style={{ width: 8, height: 8, opacity: 0, visibility: 'hidden' }}
          />

          {/* Roster — clickable rows, pointer-events default (auto) */}
          <div className="relative z-10">
            {members.map((m, i) => (
              <Link
                key={m.id}
                href={`/member/${m.id}`}
                className="group flex items-center gap-4 border-t border-white/10 py-5 last:border-b transition-colors duration-150"
              >
                <span className="w-8 font-display text-xs tabular-nums text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-sans text-lg font-extrabold text-white transition-colors duration-200 group-hover:text-[#25D366] lg:text-xl">
                  {m.name}
                  <span className="ml-3 font-display text-sm font-normal text-white/30">
                    {m.nameEn}
                  </span>
                </span>
                <span className="hidden font-display text-xs text-white/35 lg:block">
                  {m.department}
                </span>
                <span className="font-sans text-sm text-white/50">{m.role}</span>
                <span className="text-[#25D366] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* Trail card pool — div wrapper (not Link) so GSAP ref is reliable */}
          {members.map((m, i) => {
            const src = m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
            return (
              <div
                key={m.id}
                ref={(el) => {
                  trailRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 overflow-hidden rounded-xl shadow-2xl"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  opacity: 0,
                  visibility: 'hidden',
                  pointerEvents: 'auto',
                }}
              >
                <Link href={`/member/${m.id}`} className="block h-full w-full">
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={src}
                    poster={m.image}
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-8">
                    <p className="font-sans text-sm font-bold leading-tight text-white">{m.name}</p>
                    <p className="font-sans text-[10px] text-white/60">{m.role}</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* ── MOBILE: 2-col card grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {members.map((m, i) => {
            const video = m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
            return (
              <Link
                key={m.id}
                href={`/member/${m.id}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-[#1A2530] ring-1 ring-white/10 transition-all duration-300 active:ring-[#25D366]"
              >
                <video
                  src={video}
                  poster={m.image}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#111B21] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-[8px] font-bold uppercase tracking-widest text-[#25D366]">
                    {m.department}
                  </p>
                  <p className="font-sans text-sm font-bold leading-tight text-white">{m.name}</p>
                  <p className="font-sans text-[10px] text-white/55">{m.role}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/member"
            className="group flex items-center gap-2 rounded-full border border-[#25D366] px-6 py-3 font-sans text-sm font-medium text-[#25D366] transition-colors duration-200 hover:bg-[#25D366] hover:text-[#111B21]"
          >
            チームを見る
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
