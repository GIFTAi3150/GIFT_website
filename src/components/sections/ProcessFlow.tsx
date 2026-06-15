'use client';

import { useRef, useEffect, useState } from 'react';

const STEPS = [
  {
    num: '01',
    label: 'LISTEN FIRST',
    jp: 'まず、聞く。',
    copy: '表面的な要望だけを聞くのではなく、チームの実情を深く理解することから始めます。真の課題を把握することが、すべての起点です。',
    dark: true,
  },
  {
    num: '02',
    label: 'BUILD TOGETHER',
    jp: '一緒に、作る。',
    copy: '私たちは成果物を渡して終わりにしません。担当者と並走しながら構築することで、チームが自走できる状態を目指します。',
    dark: false,
  },
  {
    num: '03',
    label: 'MAKE IT WORK',
    jp: '使える状態にする。',
    copy: '使われないAIはゼロと同じです。現場のオペレーションに実際に組み込まれ、日常的に機能するまで伴走します。',
    dark: true,
  },
  {
    num: '04',
    label: 'STAY INVOLVED',
    jp: 'ずっと、関わる。',
    copy: '導入後6ヶ月が、本当の評価です。私たちのベストクライアントは、長期的なパートナーです。',
    dark: false,
  },
] as const;

const N = STEPS.length;

export default function ProcessFlow() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const el = outerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -top / scrollable)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const activeIndex = Math.min(N - 1, Math.round(progress * (N - 1)));
  const translateX = progress * (N - 1) * 100;

  /* ── Mobile: vertical stacked panels ────────────────────────── */
  if (isMobile) {
    return (
      <section>
        <div
          style={{
            borderTop: '1px solid rgba(37,99,235,0.2)',
            background: '#fff',
            padding: '18px 24px',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: '#2563EB',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            HOW WE WORK — 私たちの進め方
          </p>
        </div>

        {STEPS.map((step) => {
          const bg = step.dark ? '#0a0d1a' : '#F6F2EA';
          const ink = step.dark ? '#ffffff' : '#0a0d1a';
          const muted = step.dark ? 'rgba(255,255,255,0.82)' : 'rgba(10,13,26,0.78)';
          const ghostStroke = step.dark
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(10,13,26,0.07)';

          return (
            <div
              key={step.num}
              style={{
                background: bg,
                padding: '64px 32px 60px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Ghost number */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  right: '-0.05em',
                  bottom: '-0.18em',
                  fontSize: 180,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: 'transparent',
                  WebkitTextStroke: `1.5px ${ghostStroke}`,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                {step.num}
              </div>

              {/* Left accent */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: '#2563EB',
                }}
              />

              {/* Eyebrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    color: '#2563EB',
                  }}
                >
                  {step.num}
                </span>
                <div style={{ width: 28, height: 1, background: '#2563EB' }} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#2563EB',
                    textTransform: 'uppercase',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Headline */}
              <h2
                style={{
                  fontSize: 'clamp(40px, 10vw, 60px)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: ink,
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {step.jp}
              </h2>

              {/* Copy */}
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.9,
                  color: muted,
                  maxWidth: 440,
                  margin: 0,
                }}
              >
                {step.copy}
              </p>
            </div>
          );
        })}
      </section>
    );
  }

  /* ── Desktop: horizontal sticky scroll ──────────────────────── */
  return (
    <div ref={outerRef} style={{ height: `${N * 100}vh`, position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >

        {/* HOW WE WORK — top-left */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 36,
            left: 52,
            zIndex: 20,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            mixBlendMode: 'difference',
            pointerEvents: 'none',
          }}
        >
          HOW WE WORK
        </div>

        {/* Step counter — top-right */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 30,
            right: 52,
            zIndex: 20,
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            mixBlendMode: 'difference',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1,
              transition: 'opacity 0.3s',
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.12em',
            }}
          >
            / {String(N).padStart(2, '0')}
          </span>
        </div>

        {/* Progress dots — bottom center */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 2,
                borderRadius: 2,
                background: i === activeIndex ? '#2563EB' : 'rgba(128,128,128,0.35)',
                width: i === activeIndex ? 32 : 8,
                transition:
                  'width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s',
              }}
            />
          ))}
        </div>

        {/* Horizontal slide track */}
        <div
          style={{
            display: 'flex',
            width: `${N * 100}vw`,
            height: '100%',
            transform: `translateX(-${translateX}vw)`,
            willChange: 'transform',
          }}
        >
          {STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const bg = step.dark ? '#0a0d1a' : '#F6F2EA';
            const ink = step.dark ? '#ffffff' : '#0a0d1a';
            const muted = step.dark
              ? 'rgba(255,255,255,0.82)'
              : 'rgba(10,13,26,0.78)';
            const ghostStroke = step.dark
              ? 'rgba(255,255,255,0.055)'
              : 'rgba(10,13,26,0.06)';

            return (
              <div
                key={step.num}
                style={{
                  width: '100vw',
                  height: '100%',
                  flexShrink: 0,
                  background: bg,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 'clamp(52px, 9vw, 160px)',
                  paddingRight: 'clamp(52px, 9vw, 160px)',
                  overflow: 'hidden',
                }}
              >
                {/* Oversized ghost number */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: '-0.04em',
                    bottom: '-0.15em',
                    fontSize: 'clamp(200px, 33vw, 500px)',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'transparent',
                    WebkitTextStroke: `1.5px ${ghostStroke}`,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step.num}
                </div>

                {/* Left accent bar — scales in on active */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: '#2563EB',
                    transform: `scaleY(${isActive ? 1 : 0})`,
                    transformOrigin: 'top',
                    transition:
                      'transform 0.7s 0.15s cubic-bezier(0.22,1,0.36,1)',
                  }}
                />

                {/* Content */}
                <div
                  style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}
                >
                  {/* Eyebrow: num — label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 28,
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'translateY(0)'
                        : 'translateY(20px)',
                      transition:
                        'opacity 0.55s 0.1s, transform 0.55s 0.1s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        color: '#2563EB',
                      }}
                    >
                      {step.num}
                    </span>
                    <div
                      style={{ width: 36, height: 1, background: '#2563EB' }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        color: '#2563EB',
                        textTransform: 'uppercase',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Large Japanese headline */}
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: 36,
                      fontSize: 'clamp(56px, 8.5vw, 128px)',
                      fontWeight: 900,
                      lineHeight: 1.0,
                      letterSpacing: '-0.02em',
                      color: ink,
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'translateY(0)'
                        : 'translateY(28px)',
                      transition:
                        'opacity 0.6s 0.18s, transform 0.6s 0.18s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    {step.jp}
                  </h2>

                  {/* Body copy */}
                  <p
                    style={{
                      fontSize: 'clamp(16px, 1.4vw, 20px)',
                      lineHeight: 2,
                      color: muted,
                      maxWidth: 460,
                      margin: 0,
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'translateY(0)'
                        : 'translateY(16px)',
                      transition:
                        'opacity 0.55s 0.3s, transform 0.55s 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    {step.copy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
