'use client';

import { useEffect, useRef } from 'react';
import Reveal from '@/components/ui/Reveal';

// Industries are rendered as panels arranged in a 3D cylinder. The list
// auto-spins slowly around Y, and dragging the stage gives manual control
// (releasing resumes the spin from the dragged angle). Adapted from
// Osmo's "3D image carousel" — we have no industry photos, so each panel
// is a tall card with the icon and labels instead of an <img>.

const industries = [
  {
    label: '通信キャリア',
    labelEn: 'Telecom',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M6.5 18.5L3 22M17.5 18.5L21 22M9 18h6M12 2v4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M12 10a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'SaaS企業',
    labelEn: 'SaaS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 19h8M12 15v4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: '中小企業',
    labelEn: 'SMB',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h1M9 13h1M9 17h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: '金融・融資',
    labelEn: 'Finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'スタートアップ',
    labelEn: 'Startup',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'LINE公式運用',
    labelEn: 'LINE Official',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const AUTO_SPIN_DEG_PER_SEC = 360 / 45; // one full rotation every 45s
const DRAG_SENSITIVITY = 0.4; // degrees per px

export default function Clients() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    const list = listRef.current;
    if (!stage || !list) return;

    const total = panelsRef.current.length;
    if (total === 0) return;

    // Radius scales with viewport but is clamped so the cylinder stays
    // sane on ultrawide screens. Recalculated on resize so panels don't
    // overlap on mobile when the user rotates their phone.
    let radius = 0;

    const layoutPanels = () => {
      const w = window.innerWidth;
      radius = w < 640 ? 200 : Math.min(w * 0.32, 440);
      panelsRef.current.forEach((p, i) => {
        if (!p) return;
        const angle = (i * 360) / total;
        p.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`;
      });
    };

    layoutPanels();
    window.addEventListener('resize', layoutPanels);

    // Single RAF loop drives rotation. We track rotation in a local var
    // and write it to the DOM each frame; drag handlers mutate the same
    // var, so the loop seamlessly resumes spinning from wherever the
    // user let go.
    let rotation = 0;
    let lastTime = performance.now();
    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let rafId = 0;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!dragging) {
        rotation -= AUTO_SPIN_DEG_PER_SEC * dt;
      }
      list.style.transform = `rotateY(${rotation}deg)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragStartX = e.clientX;
      dragStartRotation = rotation;
      stage.style.cursor = 'grabbing';
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      rotation = dragStartRotation + dx * DRAG_SENSITIVITY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = 'grab';
      // releasePointerCapture throws if the pointer was never captured —
      // wrap in try so a stale up event doesn't crash.
      try { stage.releasePointerCapture(e.pointerId); } catch {}
    };

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('pointerleave', onUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', layoutPanels);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('pointerleave', onUp);
    };
  }, []);

  return (
    <section className="w-full border-t border-gift-border bg-gift-bg py-s-80">
      <Reveal>
        <div className="mx-auto mb-12 max-w-container px-4 md:mb-16 md:px-6 lg:px-8">
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
          </div>
        </div>
      </Reveal>

      {/* Stage — perspective container. cursor:grab signals draggability. */}
      <div
        ref={stageRef}
        className="relative mx-auto h-[420px] w-full select-none touch-pan-y sm:h-[480px]"
        style={{ perspective: '1200px', cursor: 'grab' }}
      >
        <div
          ref={listRef}
          className="absolute inset-0 mx-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {industries.map((ind, i) => (
            <div
              key={ind.labelEn}
              ref={(el) => {
                panelsRef.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 flex h-72 w-48 flex-col items-center justify-between rounded-2xl border border-gift-green/20 bg-gradient-to-b from-gift-ink to-[#0a1218] p-6 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] sm:h-80 sm:w-52"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Top accent dash — small green tick to anchor the design */}
              <span aria-hidden className="h-[3px] w-8 rounded-full bg-gift-green" />

              {/* Icon — centered, large */}
              <div className="flex flex-1 items-center justify-center text-gift-green">
                {ind.icon}
              </div>

              {/* Labels — JP bold, EN tracked uppercase. */}
              <div className="text-center">
                <p className="font-sans text-[17px] font-bold leading-tight">
                  {ind.label}
                </p>
                <p className="mt-1 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-gift-silver">
                  {ind.labelEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Soft side fade — masks the rotating panels at the viewport
            edges so they don't read as harshly clipped. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gift-bg to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gift-bg to-transparent sm:w-24" />
      </div>

      <div className="mx-auto mt-16 max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8 rounded-2xl border border-gift-border bg-white px-8 py-6 md:gap-16">
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
