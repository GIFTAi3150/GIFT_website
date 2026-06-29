'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  { bold: 'あの人に', rest: '聞かないと、分からない。' },
  { bold: 'あの人が', rest: '見ないと、判断できない。' },
  { bold: 'あの人が', rest: '動かないと、仕事が止まる。' },
];

export default function AIOpsIntro() {
  const outerRef      = useRef<HTMLDivElement>(null);
  const lineRefs      = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const resolutionRef = useRef<HTMLDivElement>(null);
  const giftBodyRef   = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const outer      = outerRef.current;
    const lines      = lineRefs.current;
    const resolution = resolutionRef.current;
    const giftBody   = giftBodyRef.current;

    if (!outer || lines.some((l) => !l) || !resolution || !giftBody) return;

    // Initial state set via CSS (opacity:0 / translateY) to survive SSR flash,
    // GSAP just drives them to their final positions.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4,
        invalidateOnRefresh: true,
      },
    });

    // Lines cascade in one by one
    tl.to(lines[0], { opacity: 1, y: 0, duration: 1 }, 0);
    tl.to(lines[1], { opacity: 1, y: 0, duration: 1 }, 1);
    tl.to(lines[2], { opacity: 1, y: 0, duration: 1 }, 2);

    // Hold all 3 visible for a beat, then dim them
    tl.to(lines, { opacity: 0.08, duration: 0.6 }, 3.4);

    // Resolution text blooms in
    tl.to(resolution, { opacity: 1, y: 0, duration: 1.2 }, 3.7);

    // GIFT body follows
    tl.to(giftBody, { opacity: 1, y: 0, duration: 0.9 }, 4.7);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="relative w-full" style={{ background: '#050c1a' }}>
      {/* Tall scroll space — GSAP scrubs across this */}
      <div ref={outerRef} style={{ height: '420vh' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100dvh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Subtle radial glow — static, no animation */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 20% 60%, rgba(37,99,235,0.07) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-container px-6 md:px-8 lg:px-12">

            {/* Eyebrow */}
            <p
              className="mb-12 font-display font-bold uppercase tracking-[0.22em]"
              style={{ fontSize: '11px', color: 'rgba(96,165,250,0.55)' }}
            >
              AIOps事業への接続
            </p>

            {/* Problem lines */}
            <div className="mb-0 flex flex-col" style={{ gap: 'clamp(12px, 2vw, 20px)' }}>
              {LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => { lineRefs.current[i] = el; }}
                  style={{
                    opacity: 0,
                    transform: 'translateY(44px)',
                  }}
                >
                  <p
                    className="font-sans font-light text-white"
                    style={{ fontSize: 'clamp(22px, 3.8vw, 52px)', lineHeight: '1.45', letterSpacing: '-0.01em' }}
                  >
                    <span className="font-bold">{line.bold}</span>
                    {line.rest}
                  </p>
                </div>
              ))}
            </div>

            {/* Resolution — hidden until problem lines dim */}
            <div
              ref={resolutionRef}
              style={{ opacity: 0, transform: 'translateY(36px)', marginTop: 'clamp(32px, 5vw, 64px)' }}
            >
              <p
                className="font-sans font-extrabold text-white"
                style={{
                  fontSize: 'clamp(26px, 4.5vw, 60px)',
                  lineHeight: '1.4',
                  letterSpacing: '-0.02em',
                  maxWidth: '840px',
                }}
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
                transform: 'translateY(24px)',
                marginTop: 'clamp(16px, 2.5vw, 28px)',
                fontSize: 'clamp(15px, 1.5vw, 19px)',
                lineHeight: '2',
                color: 'rgba(255,255,255,0.5)',
                maxWidth: '560px',
              }}
            >
              GIFTのAIOpsは、会社を知るAIエージェントが働き始める環境を、
              <br className="hidden sm:inline" />
              お客様と一緒につくります。
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
