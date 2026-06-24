'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CIRCLE_TEXT = 'try clicking · something cool · ';
const RADIUS = 54;
const CURSOR_SIZE = 148;

export default function AIOps() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let angle = 0;
    const tick = () => {
      angle += 0.4;
      setRotation(angle);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setVisible(true);
  }, []);

  const onLeave = useCallback(() => setVisible(false), []);

  const cx = CURSOR_SIZE / 2;
  const cy = CURSOR_SIZE / 2;
  const arcPath = `M ${cx},${cy} m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        paddingBlock: 'clamp(48px, 8vw, 96px)',
        background: '#050c1a',
      }}
    >
      {/* Moving gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '55%', height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(14,40,100,0.55) 0%, transparent 70%)',
          animation: 'aiops-blob-1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '10%',
          width: '45%', height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(30,15,80,0.5) 0%, transparent 70%)',
          animation: 'aiops-blob-2 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '30%',
          width: '40%', height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(5,30,70,0.4) 0%, transparent 70%)',
          animation: 'aiops-blob-3 18s ease-in-out infinite',
        }} />
      </div>

      {/* Label */}
      <div className="relative z-10 text-center mb-4">
        <p
          className="font-display font-semibold uppercase tracking-widest"
          style={{ fontSize: 'clamp(10px, 1.2vw, 13px)', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}
        >
          AI OPERATIONS
        </p>
      </div>

      {/* Giant text — hover zone only */}
      <div className="relative z-10 flex items-center justify-center">
        <span
          className="font-nube-display leading-none cursor-none select-none"
          style={{
            fontSize: 'clamp(96px, 18vw, 260px)',
            color: '#363b9e',
            letterSpacing: '-0.01em',
            display: 'inline-block',
            transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            transform: visible ? 'scale(1.06)' : 'scale(1)',
          }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={() => router.push('/services/aiops')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/services/aiops')}
          aria-label="AI OPS事業を見る"
        >
          AI OPS
        </span>
      </div>

      {/* Animated pointer arrow */}
      <div className="relative z-10 flex justify-center mt-4" aria-hidden>
        <span
          style={{
            display: 'inline-block',
            fontSize: 'clamp(22px, 2.5vw, 32px)',
            color: '#ffffff',
            transform: 'rotate(-90deg)',
            animation: 'aiops-pointer 1.8s ease-in-out infinite',
          }}
        >
          ›
        </span>
      </div>

      {/* Custom cursor */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: 0,
          height: 0,
          pointerEvents: 'none',
          zIndex: 50,
          opacity: visible ? 1 : 0,
          transform: `scale(${visible ? 1 : 0.6})`,
          transition: 'opacity 0.25s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <svg
          width={CURSOR_SIZE}
          height={CURSOR_SIZE}
          style={{
            position: 'absolute',
            left: -CURSOR_SIZE / 2,
            top: -CURSOR_SIZE / 2,
            transform: `rotate(${rotation}deg)`,
            overflow: 'visible',
          }}
        >
          <defs>
            <path id="aiops-ring" d={arcPath} />
          </defs>
          <text fontSize={10.5} fill="#60A5FA" letterSpacing={2.2} fontFamily="inherit">
            <textPath href="#aiops-ring">{CIRCLE_TEXT.repeat(3)}</textPath>
          </text>
        </svg>
        <div
          style={{
            position: 'absolute',
            left: -40, top: -40,
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.25)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(96,165,250,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#60A5FA', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em' }}>
            View
          </span>
        </div>
      </div>
    </section>
  );
}

