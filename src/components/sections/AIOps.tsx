'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AuroraLines from './AuroraLines';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';

gsap.registerPlugin(ScrollTrigger);

const CIRCLE_TEXT = 'try clicking · something cool · ';
const RADIUS = 54;
const CURSOR_SIZE = 148;

const LINES = [
  { bold: 'あの人に', rest: '聞かないと、分からない。' },
  { bold: 'あの人が', rest: '見ないと、判断できない。' },
  { bold: 'あの人が', rest: '動かないと、仕事が止まる。' },
];

export default function AIOps() {
  const router = useRouter();

  const outerRef      = useRef<HTMLDivElement>(null);
  const stickyRef     = useRef<HTMLDivElement>(null);
  const lineRefs      = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const resolutionRef = useRef<HTMLDivElement>(null);
  const giftBodyRef   = useRef<HTMLParagraphElement>(null);
  const aiopsWrapRef  = useRef<HTMLDivElement>(null);

  const [pos, setPos]         = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGSVGElement | null>(null);

  // Rotating cursor ring — spins ONLY while the custom cursor is actually shown
  // (desktop hover). On touch devices `visible` never flips true, so this loop
  // never starts on mobile at all. It also writes the rotation straight to the
  // DOM via a ref instead of React state: the old setRotation(angle) re-rendered
  // this entire section 60×/sec *unconditionally* — offscreen and on phones
  // where the cursor is invisible — which is what made the section fight the
  // scroll and drop frames on mobile.
  useEffect(() => {
    if (!visible) return;
    const ring = ringRef.current;
    let angle = 0;
    let raf = 0;
    const tick = () => {
      angle += 0.4;
      if (ring) ring.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  // Cursor position relative to sticky div (not the full-height outer)
  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = stickyRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setVisible(true);
  }, []);

  const onLeave = useCallback(() => setVisible(false), []);

  // Scroll-driven cascade
  useEffect(() => {
    const outer      = outerRef.current;
    const lines      = lineRefs.current;
    const resolution = resolutionRef.current;
    const giftBody   = giftBodyRef.current;
    const aiopsWrap  = aiopsWrapRef.current;

    if (!outer || lines.some((l) => !l) || !resolution || !giftBody || !aiopsWrap) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4,
        invalidateOnRefresh: true,
      },
    });

    // Lines cascade in
    tl.to(lines[0], { opacity: 1, y: 0, duration: 1 }, 0);
    tl.to(lines[1], { opacity: 1, y: 0, duration: 1 }, 1);
    tl.to(lines[2], { opacity: 1, y: 0, duration: 1 }, 2);
    // All 3 dim — problem fades into background
    tl.to(lines, { opacity: 0.07, duration: 0.6 }, 3.4);
    // Resolution blooms
    tl.to(resolution, { opacity: 1, y: 0, duration: 1.2 }, 3.7);
    // GIFT body follows
    tl.to(giftBody, { opacity: 1, y: 0, duration: 0.9 }, 4.7);
    // Giant AI OPS rises from bottom
    tl.to(aiopsWrap, { opacity: 1, y: 0, duration: 1.0 }, 5.6);

    // ViewportFreeze が測り直したら scrub 範囲を計算し直す。px の書き換えは
    // resize イベントを発火しないので、これが無いと回転後にトリガー位置が
    // 古いまま残る。
    const onFrozenChange = () => ScrollTrigger.refresh();
    window.addEventListener(VH_FROZEN_CHANGE, onFrozenChange);

    return () => {
      window.removeEventListener(VH_FROZEN_CHANGE, onFrozenChange);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const cx = CURSOR_SIZE / 2;
  const cy = CURSOR_SIZE / 2;
  const arcPath = `M ${cx},${cy} m -${RADIUS},0 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`;

  return (
    <section className="relative w-full" style={{ background: '#050c1a' }}>
      {/* Full scroll-height outer — GSAP scrubs across this.
          高さは vh ではなく ViewportFreeze が固定した px（580vh 相当）。
          理由: docs/hp-webview-vh-freeze-spec.md */}
      <div ref={outerRef} style={{ height: 'calc(var(--vh-frozen) * 5.8)' }}>
        <div
          ref={stickyRef}
          style={{
            position: 'sticky',
            top: 0,
            height: '100dvh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingTop: 'clamp(48px, 7vh, 88px)',
            paddingBottom: 'clamp(24px, 4vh, 48px)',
          }}
        >
          {/* Aurora background — flowing glow lines in place of the old static blobs */}
          <AuroraLines
            className="pointer-events-none absolute inset-0"
            ribbons={6}
            intensity={0.75}
            mouseParallax={false}
          />

          {/* ── TOP: narrative text ── */}
          <div className="relative z-10 w-full max-w-container mx-auto px-6 md:px-8 lg:px-12">

            <p
              className="mb-8 font-display font-bold uppercase tracking-[0.22em]"
              style={{ fontSize: '11px', color: 'rgba(96,165,250,0.55)' }}
            >
              AIOps事業への接続
            </p>

            {/* Problem lines */}
            <div className="flex flex-col" style={{ gap: 'clamp(10px, 1.6vw, 18px)' }}>
              {LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => { lineRefs.current[i] = el; }}
                  style={{ opacity: 0, transform: 'translateY(40px)' }}
                >
                  <p
                    className="font-sans font-light text-white"
                    style={{ fontSize: 'clamp(20px, min(3.2vw, 3.6vh), 40px)', lineHeight: '1.45', letterSpacing: '-0.01em' }}
                  >
                    <span className="font-bold">{line.bold}</span>
                    {line.rest}
                  </p>
                </div>
              ))}
            </div>

            {/* Resolution */}
            <div
              ref={resolutionRef}
              style={{ opacity: 0, transform: 'translateY(32px)', marginTop: 'clamp(20px, 3.5vw, 44px)' }}
            >
              <p
                className="font-sans font-extrabold text-white"
                style={{ fontSize: 'clamp(22px, min(3.5vw, 3.8vh), 44px)', lineHeight: '1.4', letterSpacing: '-0.02em', maxWidth: '800px' }}
              >
                そんな状態から、
                <br />
                会社の知識がチームで使える状態へ。
              </p>
            </div>

            {/* GIFT body */}
            <p
              ref={giftBodyRef}
              className="font-sans font-light"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                marginTop: 'clamp(10px, 1.8vw, 20px)',
                fontSize: 'clamp(14px, 1.3vw, 17px)',
                lineHeight: '2',
                color: 'rgba(255,255,255,0.45)',
                maxWidth: '520px',
              }}
            >
              GIFTのAIOpsは、会社を知るAIエージェントが働き始める環境を、お客様と一緒につくります。
            </p>
          </div>

          {/* ── BOTTOM: giant AI OPS — GSAP wrapper + inner span for hover scale ── */}
          <div
            ref={aiopsWrapRef}
            className="relative z-10 flex justify-center"
            style={{ opacity: 0, transform: 'translateY(64px)', marginTop: 'clamp(32px, 6vh, 80px)' }}
          >
            <span
              className="font-nube-display leading-none cursor-none select-none"
              style={{
                fontSize: 'clamp(60px, min(14vw, 15vh), 230px)',
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

          {/* Custom cursor — absolute within sticky div */}
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
              ref={ringRef}
              width={CURSOR_SIZE}
              height={CURSOR_SIZE}
              style={{
                position: 'absolute',
                left: -CURSOR_SIZE / 2,
                top: -CURSOR_SIZE / 2,
                transform: 'rotate(0deg)',
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
        </div>
      </div>
    </section>
  );
}
