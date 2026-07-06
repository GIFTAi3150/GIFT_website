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
    // strokes hide the low res and it keeps mobile cheap. Drop further on phones:
    // the aurora is fill-rate bound (6 ribbons × 3 wide additive strokes over a
    // full-screen sticky section), and 0.5 halves the pixel count vs 0.7 with no
    // visible change through the soft blur.
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const SCALE = isMobile ? 0.5 : 0.7;
    let W = 2,
      H = 2;
    // Resizing the canvas (canvas.width = …) CLEARS it. On mobile the URL bar
    // shows/hides while scrolling, which jitters the sticky section's 100dvh
    // height and fires ResizeObserver mid-scroll. If we cleared then and rAF was
    // throttled by the active scroll, the canvas would sit blank for a beat —
    // the "background blinks on/off while I scroll" bug. So: only resize when the
    // size actually changed, and repaint the fresh buffer synchronously right
    // after (see redrawAfterResize) so it never shows blank even if rAF is paused.
    const resize = (): boolean => {
      const r = canvas.getBoundingClientRect();
      const nw = Math.max(2, Math.floor(r.width * SCALE));
      const nh = Math.max(2, Math.floor(r.height * SCALE));
      if (nw === W && nh === H) return false;
      W = nw;
      H = nh;
      canvas.width = W;
      canvas.height = H;
      return true;
    };
    // Coalesce the burst of RO callbacks the URL-bar animation emits, then resize
    // once and immediately repaint. During the debounce window the last good
    // frame stays on screen (buffer untouched) — no blink.
    let roTimer = 0;
    const scheduleResize = () => {
      if (roTimer) clearTimeout(roTimer);
      roTimer = window.setTimeout(() => {
        roTimer = 0;
        if (resize() && drawnOnce) draw(lastSec);
      }, 160);
    };
    const ro = new ResizeObserver(scheduleResize);
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
    let lastSec = 0; // seconds passed to the last draw() — reused for resize repaints

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

    // Cap the aurora at ~30fps. The ribbons drift slowly (t = time * 0.12), so
    // 30fps is visually identical to 60 — but halving the redraws frees the main
    // thread during scroll, which is what made the pinned section feel heavy/hard
    // to scroll on mobile (6 ribbons × 3 wide additive strokes is a lot of fill).
    const FRAME_MS = 1000 / 30;
    let lastFrame = -Infinity;
    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (reduced && drawnOnce) return; // reduced motion: one static frame, then idle
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      // NB: seconds, not ms — the ribbon math below is tuned for a seconds clock
      // (the old WebGL version fed uTime in seconds). Passing raw ms ran it 1000× fast.
      lastSec = reduced ? 0 : (now - t0) / 1000;
      draw(lastSec);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (roTimer) clearTimeout(roTimer);
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
