'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import servicesData from '@/data/services.json';

const AUTO_SPIN_DEG_PER_SEC = 360 / 45;
const DRAG_SENSITIVITY = 0.4;

export default function ServicesCards() {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const didDragRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const list = listRef.current;
    if (!stage || !list) return;

    const total = panelsRef.current.length;
    if (total === 0) return;

    let radius = 0;

    const layoutPanels = () => {
      // Tighter radius — cards stay close together in the cylinder
      const w = window.innerWidth;
      radius = w < 640 ? 190 : 240;
      panelsRef.current.forEach((p, i) => {
        if (!p) return;
        const angle = (i * 360) / total;
        p.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`;
      });
    };

    layoutPanels();
    window.addEventListener('resize', layoutPanels);

    let rotation = 0;
    let lastTime = performance.now();
    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let rafId = 0;
    let clickTargetHref: string | null = null;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!dragging) rotation -= AUTO_SPIN_DEG_PER_SEC * dt;
      list.style.transform = `rotateY(${rotation}deg)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      // Capture which card was pressed before pointer capture redirects events
      const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-href]');
      clickTargetHref = panel?.dataset.href ?? null;
      dragging = true;
      didDragRef.current = false;
      dragStartX = e.clientX;
      dragStartRotation = rotation;
      stage.style.cursor = 'grabbing';
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) didDragRef.current = true;
      rotation = dragStartRotation + dx * DRAG_SENSITIVITY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = 'grab';
      try { stage.releasePointerCapture(e.pointerId); } catch {}
      // Navigate only if no drag occurred and a card was the original target
      if (!didDragRef.current && clickTargetHref) {
        router.push(clickTargetHref);
      }
      clickTargetHref = null;
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
    <section className="w-full border-t border-[#BFDBFE] bg-[#F0F7FF] py-s-80">
      <div className="mx-auto mb-6 max-w-container px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
            SERVICE
          </p>
          <h2
            className="font-sans font-extrabold text-[#0C0E1A]"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
          >
            事業内容
          </h2>
          <p className="font-sans text-normal font-light text-[#475569]">
            GIFTが提供する3つの事業。
          </p>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative mx-auto h-[420px] w-full select-none touch-pan-y sm:h-[500px]"
        style={{ perspective: '1000px', cursor: 'grab' }}
      >
        <div
          ref={listRef}
          className="absolute inset-0 mx-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {servicesData.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => { panelsRef.current[i] = el; }}
              data-href={s.href}
              className="absolute left-1/2 top-1/2 h-72 w-52 cursor-pointer overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] transition-[box-shadow] duration-300 hover:shadow-[0_30px_60px_-10px_rgba(37,99,235,0.5)] sm:h-80 sm:w-56"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Service photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Dark gradient overlay so text is readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {/* Top accent */}
              <span aria-hidden className="absolute left-1/2 top-4 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#2563EB]" />

              {/* Labels at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                <p className="font-sans text-[16px] font-bold leading-tight text-white">
                  {s.title}
                </p>
                <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  {s.titleEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Side fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F0F7FF] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F0F7FF] to-transparent sm:w-24" />
      </div>
    </section>
  );
}
