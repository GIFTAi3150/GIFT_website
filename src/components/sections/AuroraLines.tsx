'use client';

/**
 * AuroraLines — flowing silk-ribbon aurora drawn on a 2D canvas.
 *
 * Renders the SAME animated ribbons on every device (desktop + mobile). It uses a
 * 2D canvas, NOT WebGL, on purpose: on the homepage the hero fluid sim already
 * owns the page's one reliable WebGL context, and mobile GPUs refuse to paint a
 * SECOND live WebGL context — it stays blank until a touch forces a composite,
 * the old "aurora only shows when you tap it" bug. A 2D canvas has no such limit,
 * so one code path covers all devices with no fallback and no context-loss risk.
 *
 *   <section className="relative">
 *     <AuroraLines className="pointer-events-none absolute inset-0" />
 *     ...content...
 *   </section>
 *
 * Perf: a few soft additive strokes per frame (no per-frame allocation); pauses
 * when the section is offscreen or the tab is hidden; holds one static frame
 * under prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  ribbons?: number; // number of lines (default 7)
  speed?: number; // global speed multiplier (default 1)
  intensity?: number; // line brightness (default 1)
  colorA?: [number, number, number]; // first color, 0..1 RGB
  colorB?: [number, number, number]; // last color,  0..1 RGB
  mouseParallax?: boolean; // field leans toward cursor (desktop only, default true)
};

export default function AuroraLines({
  className = '',
  ribbons = 7,
  speed = 1,
  intensity = 1,
  colorA = [0.2, 0.8, 1.0],
  colorB = [0.58, 0.38, 1.0],
  mouseParallax = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = Math.min(Math.max(Math.round(ribbons), 1), 16);
    const [ar, ag, ab] = colorA;
    const [br, bg, bb] = colorB;
    // mix colorA -> colorB at t (0..1) -> "r, g, b" 0..255 triplet for rgba()
    const mix = (t: number) =>
      `${Math.round((ar + (br - ar) * t) * 255)}, ` +
      `${Math.round((ag + (bg - ag) * t) * 255)}, ` +
      `${Math.round((ab + (bb - ab) * t) * 255)}`;

    // Render below CSS resolution and let CSS scale it up — the soft additive
    // strokes hide the low res and it keeps mobile cheap.
    const SCALE = 0.85;
    let W = 2,
      H = 2;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(2, Math.floor(r.width * SCALE));
      H = Math.max(2, Math.floor(r.height * SCALE));
      canvas.width = W;
      canvas.height = H;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // mouse parallax (desktop only; touch never fires mousemove so it stays put)
    let mx = 0.5,
      my = 0.5,
      smx = 0.5,
      smy = 0.5;
    const onMove = (e: MouseEvent) => {
      if (!mouseParallax) return;
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    };
    window.addEventListener('mousemove', onMove);

    // pause while the section is offscreen
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, {
      threshold: 0,
    });
    io.observe(canvas);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SAMPLES = 64;
    const yPrev = new Float32Array(SAMPLES + 1); // couples each ribbon to the last
    const xs = new Float32Array(SAMPLES + 1); // reused per ribbon (no GC churn)
    const ys = new Float32Array(SAMPLES + 1);

    const t0 = performance.now();
    let drawnOnce = false;

    const draw = (time: number) => {
      const aspect = W / H;
      smx += (mx - smx) * 0.04;
      smy += (my - smy) * 0.04;
      const parX = mouseParallax ? (smx - 0.5) * 0.18 : 0;
      const parY = mouseParallax ? (smy - 0.5) * 0.18 : 0;
      const t = time * 0.12 * speed;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      yPrev.fill(0);

      const strokePath = (lw: number, alpha: number, col: string) => {
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let s = 1; s <= SAMPLES; s++) ctx.lineTo(xs[s], ys[s]);
        ctx.lineWidth = lw;
        ctx.strokeStyle = `rgba(${col}, ${alpha})`;
        ctx.stroke();
      };

      for (let i = 0; i < n; i++) {
        const freq = 0.6 + i * 0.33;
        const rspeed = (i % 2 === 0 ? 1 : -1) * (0.7 + i * 0.17);
        const amp = 0.55 - i * 0.045;
        const offset = -0.52 + i * (1.04 / Math.max(n - 1, 1));
        const col = mix(i / Math.max(n - 1, 1));

        for (let s = 0; s <= SAMPLES; s++) {
          const u = s / SAMPLES; // 0..1 across the width
          const px = (u * 2 - 1) * aspect + parX; // normalized x, aspect-scaled
          const yN = Math.sin(px * freq + t * rspeed * 2 + yPrev[s] * 2.2) * amp;
          yPrev[s] = yN;
          const pYc = yN * 0.7 - offset + parY; // normalized centerline (-1..1)
          xs[s] = u * W;
          ys[s] = (1 - (pYc + 1) / 2) * H;
        }

        // soft aura -> mid halo -> bright core, all additively blended
        strokePath(H * 0.14, 0.05 * intensity, col);
        strokePath(H * 0.05, 0.09 * intensity, col);
        strokePath(Math.max(1.5, H * 0.006), 0.55 * intensity, col);
      }

      ctx.globalCompositeOperation = 'source-over';
      drawnOnce = true;
    };

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (reduced && drawnOnce) return; // reduced motion: one static frame, then idle
      // NB: seconds, not ms — the ribbon math below is tuned for a seconds clock
      // (the old WebGL version fed uTime in seconds). Passing raw ms ran it 1000× fast.
      draw(reduced ? 0 : (now - t0) / 1000);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      ro.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ribbons, speed, intensity, mouseParallax, ...colorA, ...colorB]);

  const rgba = (c: [number, number, number], a: number) =>
    `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;

  return (
    <div className={className} style={{ position: 'absolute', inset: 0 }}>
      {/* Faint static base — covers the split second before the first canvas
          frame so the dark section never flashes bare. The animated ribbons draw
          on top of it. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(155deg, ${rgba(colorA, 0.14)} 0%, transparent 46%, ${rgba(colorB, 0.12)} 100%)`,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        aria-hidden="true"
      />
    </div>
  );
}
