'use client';

import { useEffect, useRef } from 'react';

type DotsGridProps = {
  className?: string;
  /** Pixels between dot centers. Smaller = denser grid. */
  spacing?: number;
  /** Dot diameter in pixels. */
  dotSize?: number;
  /** Base color of dots when cursor is far. RGBA or hex. */
  baseColor?: string;
  /** Hot color when cursor is close. RGBA or hex. */
  activeColor?: string;
  /** Pixels around the cursor within which dots light up + lean in. */
  proximityRadius?: number;
  /** Strength of the gentle pull toward the cursor. Keep small for
      "subtle lean," larger for noticeable drift. */
  magnetStrength?: number;
};

type Dot = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = baseColor, 1 = activeColor — eased over frames for a soft glow. */
  glow: number;
};

/** Parse "#RRGGBB" or "rgba(r, g, b, a)" into [r, g, b, a]. */
function parseColor(input: string): [number, number, number, number] {
  if (input.startsWith('#')) {
    const hex = input.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b, 1];
  }
  const m = input.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0, 1];
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] ?? 1];
}

export default function DotsGrid({
  className,
  spacing = 22,
  dotSize = 3,
  baseColor = 'rgba(17, 27, 33, 0.14)',
  activeColor = '#00FF6B',
  proximityRadius = 180,
  magnetStrength = 1.2,
}: DotsGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Parent's measured size is authoritative — the canvas itself
    // stretches via CSS (absolute inset-0 + width/height: 100%), but
    // the drawing buffer must be sized in JS to match.
    const parent = canvas.parentElement;
    if (!parent) return;

    // Reduced-motion users get a static grid with no proximity glow.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseRGBA = parseColor(baseColor);
    const activeRGBA = parseColor(activeColor);

    let dots: Dot[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let rafId = 0;
    let width = 0;
    let height = 0;

    const buildGrid = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      // +1 so the grid extends just past the edges, no obvious gap
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing;
          const y = offsetY + r * spacing;
          dots.push({ baseX: x, baseY: y, x, y, vx: 0, vy: 0, glow: 0 });
        }
      }
    };

    buildGrid();

    // ResizeObserver catches container resizes more reliably than the
    // window resize event.
    const ro = new ResizeObserver(() => buildGrid());
    ro.observe(parent);

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = parent.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) updateMouse(t.clientX, t.clientY);
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    if (!reducedMotion) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      canvas.addEventListener('mouseleave', onMouseLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const proxSq = proximityRadius * proximityRadius;

      for (const dot of dots) {
        let targetGlow = 0;

        if (!reducedMotion) {
          const dx = dot.x - mouseX;
          const dy = dot.y - mouseY;
          const dSq = dx * dx + dy * dy;
          if (dSq < proxSq && dSq > 1) {
            const dist = Math.sqrt(dSq);
            const t = 1 - dist / proximityRadius;
            // Subtle pull toward cursor — magnetStrength stays small so
            // dots only lean in slightly (a few pixels max before the
            // spring force balances out). Squared curve so only dots
            // very close to the cursor actually move noticeably.
            const pull = t * t * magnetStrength;
            dot.vx -= (dx / dist) * pull;
            dot.vy -= (dy / dist) * pull;
            // Glow uses the same proximity curve
            targetGlow = t * t;
          }

          // Spring back to base position with damping. Combined with
          // the pull above, dots settle a few pixels closer to the
          // cursor while it hovers, then snap back when it leaves.
          dot.vx += (dot.baseX - dot.x) * 0.16;
          dot.vy += (dot.baseY - dot.y) * 0.16;
          dot.vx *= 0.82;
          dot.vy *= 0.82;
          dot.x += dot.vx;
          dot.y += dot.vy;
        }

        // Ease toward target glow so light-up isn't instant.
        dot.glow += (targetGlow - dot.glow) * 0.18;

        const g = dot.glow;
        const r = baseRGBA[0] + (activeRGBA[0] - baseRGBA[0]) * g;
        const gg = baseRGBA[1] + (activeRGBA[1] - baseRGBA[1]) * g;
        const b = baseRGBA[2] + (activeRGBA[2] - baseRGBA[2]) * g;
        const a = baseRGBA[3] + (activeRGBA[3] - baseRGBA[3]) * g;

        ctx.fillStyle = `rgba(${r | 0}, ${gg | 0}, ${b | 0}, ${a})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [spacing, dotSize, baseColor, activeColor, proximityRadius, magnetStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      // Inline style forces the canvas to fill its containing block
      // regardless of the default 300×150 width/height attributes.
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden
    />
  );
}
