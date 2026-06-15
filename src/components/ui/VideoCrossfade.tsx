'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// Pill dimensions
const W = 90;
const H = 54;
const RX = 18;
// Perimeter of the rounded-rect: 2*π*rx + 2*(w-2rx) + 2*(h-2rx)
const PERIMETER = 2 * Math.PI * RX + 2 * (W - 2 * RX) + 2 * (H - 2 * RX);

export default function VideoCrossfade({
  src1,
  src2,
  className,
  children,
}: {
  src1: string;
  src2: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const v1 = useRef<HTMLVideoElement>(null);
  const v2 = useRef<HTMLVideoElement>(null);
  const t1 = useRef<HTMLVideoElement>(null);
  const t2 = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<1 | 2>(1);
  const [progress, setProgress] = useState(0);

  const switchTo = useCallback((target: 1 | 2) => {
    const incoming = target === 1 ? v1.current : v2.current;
    const outgoing  = target === 1 ? v2.current : v1.current;
    const inThumb   = target === 1 ? t1.current : t2.current;
    const outThumb  = target === 1 ? t2.current : t1.current;
    if (!incoming) return;
    if (outgoing)  { outgoing.pause();  outgoing.currentTime  = 0; }
    if (outThumb)  { outThumb.pause();  outThumb.currentTime  = 0; }
    incoming.currentTime = 0;
    incoming.play().catch(() => {});
    if (inThumb)   { inThumb.currentTime = 0; inThumb.play().catch(() => {}); }
    setActive(target);
    setProgress(0);
  }, []);

  useEffect(() => {
    const el1 = v1.current;
    const el2 = v2.current;
    if (!el1 || !el2) return;
    const toV2 = () => switchTo(2);
    const toV1 = () => switchTo(1);
    el1.addEventListener('ended', toV2);
    el2.addEventListener('ended', toV1);
    return () => {
      el1.removeEventListener('ended', toV2);
      el2.removeEventListener('ended', toV1);
    };
  }, [switchTo]);

  useEffect(() => {
    const el = active === 1 ? v1.current : v2.current;
    if (!el) return;
    let rafId: number;
    const tick = () => {
      if (el.duration) setProgress((el.currentTime / el.duration) * 100);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* ── Full-size background videos ── */}
      <video
        ref={v1}
        autoPlay muted playsInline preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: active === 1 ? 1 : 0 }}
        src={src1}
      />
      <video
        ref={v2}
        muted playsInline preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: active === 2 ? 1 : 0 }}
        src={src2}
      />

      {/* Cinematic gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />

      {/* Content layer */}
      <div className="relative z-10">{children}</div>

      {/* ── Video indicator pills ── */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-4">
        {([1, 2] as const).map((n) => {
          const isActive = active === n;
          const filled = PERIMETER - (PERIMETER * (isActive ? progress : 0)) / 100;

          return (
            <button
              key={n}
              onClick={() => switchTo(n)}
              aria-label={`動画 ${n}`}
              className="relative transition-all duration-700 ease-in-out"
              style={{
                width: W,
                height: H,
                opacity: isActive ? 1 : 0.45,
                transform: isActive ? 'scale(1)' : 'scale(0.93)',
              }}
            >
              {/* Thumbnail video — clipped to pill shape */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ borderRadius: RX }}
              >
                <video
                  ref={n === 1 ? t1 : t2}
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  disableRemotePlayback
                  className="absolute inset-0 h-full w-full object-cover"
                  src={n === 1 ? src1 : src2}
                />
                {/* Frosted glass tint */}
                <div
                  className="absolute inset-0 transition-colors duration-700"
                  style={{
                    background: isActive ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.38)',
                  }}
                />
              </div>

              {/* SVG border that traces the pill outline as progress fills */}
              <svg
                className="pointer-events-none absolute inset-0"
                width={W} height={H}
                viewBox={`0 0 ${W} ${H}`}
                fill="none"
              >
                {/* Ghost track — always visible, very faint */}
                <rect
                  x="1.5" y="1.5"
                  width={W - 3} height={H - 3}
                  rx={RX - 1.5}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeOpacity={isActive ? 0.18 : 0.10}
                />
                {/* Live progress stroke */}
                {isActive && (
                  <rect
                    x="1.5" y="1.5"
                    width={W - 3} height={H - 3}
                    rx={RX - 1.5}
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.95"
                    strokeLinecap="round"
                    strokeDasharray={PERIMETER}
                    strokeDashoffset={filled}
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
