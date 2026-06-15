'use client';

// DX hero — interactive GIFT logo, built in code (SVG + GSAP). This is the
// WebGL-free "wow" hero: the logo reveals on land, breathes with a gentle idle
// float, and tilts in 3D toward the cursor (parallax lean). It is pure DOM/SVG
// + CSS 3D transforms — NO WebGL context is ever created, so it cannot trigger
// the site-wide context-loss crash that killed every prior 3D hero. Honors
// prefers-reduced-motion (logo just shows, no motion).

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import GiftLogoMark from './GiftLogoMark';

export default function SvgLogoHero() {
  const stageRef = useRef<HTMLDivElement | null>(null); // listens for pointer
  const tiltRef = useRef<HTMLDivElement | null>(null); // 3D-tilted wrapper
  const markRef = useRef<HTMLDivElement | null>(null); // reveal + idle target

  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    const mark = markRef.current;
    if (!stage || !tilt || !mark) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(mark, { opacity: 0.9 });
      return;
    }

    const ctx = gsap.context(() => {
      // Reveal: scale + fade up with a slight forward tip that settles.
      gsap.fromTo(
        mark,
        { opacity: 0, scale: 0.86, rotateX: 12, y: 24 },
        { opacity: 0.92, scale: 1, rotateX: 0, y: 0, duration: 1.25, ease: 'power3.out' }
      );

      // Idle: a slow, small vertical bob + barely-there roll, looping forever.
      // Reads as "alive/floating" without the edge-on collapse a full spin had.
      gsap.to(mark, {
        y: '+=10',
        rotateZ: 1.2,
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.25,
      });
    }, stage);

    // Cursor parallax — the logo leans toward the pointer in 3D. quickTo gives
    // a smooth eased follow without spamming tweens on every mousemove.
    const rotY = gsap.quickTo(tilt, 'rotateY', { duration: 0.6, ease: 'power3.out' });
    const rotX = gsap.quickTo(tilt, 'rotateX', { duration: 0.6, ease: 'power3.out' });
    const MAX = 12; // degrees of lean at the edges

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rotY(nx * MAX * 2);
      rotX(-ny * MAX * 2);
    };
    const onLeave = () => {
      rotY(0);
      rotX(0);
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);

    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 z-0 flex items-center justify-center"
      style={{ perspective: 1100 }}
    >
      {/* Soft brand glow behind the mark for depth (pure CSS, no WebGL). */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: '60%',
          maxWidth: 620,
          aspectRatio: '1 / 1',
          background:
            'radial-gradient(closest-side, rgba(99,91,255,0.18), rgba(99,91,255,0) 70%)',
          filter: 'blur(8px)',
        }}
      />
      <div ref={tiltRef} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
        <div ref={markRef} style={{ willChange: 'transform, opacity' }}>
          <GiftLogoMark style={{ width: '52%', maxWidth: 520, margin: '0 auto', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}
