'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

const PLACEHOLDER_VIDEOS = [
  '/video/cc-vid.mp4',
  '/video/dx-consulting-vid.mp4',
  '/video/financial-consulting-vid.mp4',
];

const CARD_W = 200;
const CARD_GAP = 20;

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
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const isDraggingRef = useRef(false);

  // 4 copies so dragging right (and far left) never hits an edge
  const track = [...members, ...members, ...members, ...members];
  const singleW = members.length * (CARD_W + CARD_GAP);

  useEffect(() => {
    if (!trackRef.current || !containerRef.current || members.length === 0) return;

    gsap.registerPlugin(Draggable);

    const el = trackRef.current;
    const container = containerRef.current;

    // Start mid-track so user can drag in both directions
    xRef.current = -singleW;
    gsap.set(el, { x: xRef.current });

    const [drag] = Draggable.create(el, {
      type: 'x',
      onDragStart() {
        isDraggingRef.current = true;
        container.style.cursor = 'grabbing';
      },
      onDragEnd() {
        xRef.current = gsap.getProperty(el, 'x') as number;
        while (xRef.current < -singleW * 3) xRef.current += singleW;
        while (xRef.current > 0) xRef.current -= singleW;
        gsap.set(el, { x: xRef.current });
        isDraggingRef.current = false;
        container.style.cursor = 'grab';
      },
    });

    return () => {
      drag.kill();
    };
  }, [members.length, singleW]);

  return (
    <section className="relative bg-[#111B21] overflow-hidden">
      {/* ── Header ── */}
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8 pt-24 md:pt-32 pb-14 md:pb-16">
        <div className="flex items-end justify-between">
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
      </div>

      {/* ── Draggable slider strip ── */}
      <div className="relative h-[340px] md:h-[420px] overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center"
          style={{ cursor: 'grab' }}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ gap: CARD_GAP, width: 'max-content' }}
          >
            {track.map((m, i) => {
              const src = m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
              return (
                <Link
                  key={`${m.id}-${i}`}
                  href={`/member/${m.id}`}
                  draggable={false}
                  className="relative flex-none overflow-hidden rounded-2xl"
                  style={{
                    width: CARD_W,
                    height: 280,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.55)',
                  }}
                >
                  <video
                    src={src}
                    poster={m.image}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="none"
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-[9px] font-bold uppercase tracking-widest text-[#25D366] mb-0.5">
                      {m.department}
                    </p>
                    <p className="font-sans text-sm font-bold leading-tight text-white">
                      {m.name}
                    </p>
                    <p className="font-sans text-[11px] text-white/55">{m.role}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CTA (mobile) ── */}
      <div className="flex justify-center pt-10 pb-16 md:pb-24 md:hidden">
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

      <div className="hidden md:block pb-24" />
    </section>
  );
}
