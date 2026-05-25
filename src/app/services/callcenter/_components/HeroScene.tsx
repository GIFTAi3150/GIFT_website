'use client';

import { useEffect, useState, type CSSProperties } from 'react';

// Full-bleed cinematic hero — landscape video covers the entire viewport.
// Headline + CTA overlay on top with a gradient scrim for readability.

const HEADLINE_JP = '声で、誰かの一日を、変える人になる。';
const ACCENT_CHAR = '誰';
const CTA_TEXT = '応募する';
const ACCENT_COLOR = 'var(--r-magenta)';

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    // 100svh keeps iOS Safari from leaving extra space below when the URL bar
    // collapses; 100vh is the fallback for browsers that don't know svh yet.
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--r-ink)',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  videoLayer: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
  },
  // Diagonal gradient on desktop keeps the left side dark for the headline.
  scrim: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(105deg, rgba(14,10,36,0.78) 0%, rgba(14,10,36,0.52) 35%, rgba(14,10,36,0.18) 65%, rgba(14,10,36,0) 100%)',
    zIndex: 1,
  },
  // On narrow viewports the diagonal becomes a top-down gradient so the
  // headline at the top stays readable regardless of where the video subject is.
  scrimNarrow: {
    background:
      'linear-gradient(180deg, rgba(14,10,36,0.85) 0%, rgba(14,10,36,0.55) 40%, rgba(14,10,36,0.25) 70%, rgba(14,10,36,0.55) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(28px, 5vh, 72px)',
    // Top padding floor (108px) clears the fixed 80px header with breathing
    // room on mobile. Side floor (20px) keeps the headline off the edge.
    padding: 'clamp(108px, 8vw, 128px) clamp(20px, 6vw, 96px)',
    maxWidth: 920,
    minWidth: 0,
    width: '100%',
  },
  headline: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 900,
    fontSize: 'clamp(48px, 6.4vw, 112px)',
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
    color: '#FFFCF3',
    margin: 0,
    fontFeatureSettings: '"palt" 1',
    wordBreak: 'keep-all',
    textShadow: '0 4px 24px rgba(0,0,0,0.35)',
  },
  narrowHeadline: {
    fontSize: 'clamp(36px, 9.5vw, 56px)',
    lineHeight: 1.15,
    letterSpacing: '-0.005em',
  },
  accent: {
    fontFamily: 'var(--font-mincho)',
    fontStyle: 'italic',
    fontWeight: 600,
    letterSpacing: 0,
    color: ACCENT_COLOR,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'baseline',
    padding: 0,
    background: 'transparent',
    color: '#FFFCF3',
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    fontSize: 'clamp(28px, 2.6vw, 40px)',
    letterSpacing: '-0.005em',
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
    transition: 'color .35s cubic-bezier(0.22,1,0.36,1)',
  },
  ctaUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 3,
    background: 'currentColor',
    transformOrigin: 'left',
    transform: 'scaleX(0.4)',
    transition: 'transform .5s cubic-bezier(0.22,1,0.36,1)',
  },
};

export default function HeroScene() {
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    const mq = window.matchMedia('(max-width: 880px)');
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => {
      clearTimeout(t);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  const fade = (delay: number): CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 1.2s ease ${delay}ms, transform 1.2s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  const headlineStyle: CSSProperties = narrow
    ? { ...styles.headline, ...styles.narrowHeadline }
    : styles.headline;

  return (
    <section style={styles.root} aria-label="コールセンター事業 — Hero">
      {/* Full-bleed background video. Dark root background shows while video loads. */}
      <div style={styles.videoLayer} aria-hidden>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={styles.video}
        >
          <source src="/img/callcenter-hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark gradient over the video so the headline stays readable.
          Switches direction on narrow viewports. */}
      <div
        style={{ ...styles.scrim, ...(narrow ? styles.scrimNarrow : {}) }}
        aria-hidden
      />

      {/* Headline + CTA */}
      <div style={styles.content}>
        <h1 style={headlineStyle} aria-label={HEADLINE_JP}>
          {Array.from(HEADLINE_JP).map((ch, i) => {
            const isAccent = ch === ACCENT_CHAR;
            const stagger = 200 + i * 60;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  ...(isAccent ? styles.accent : {}),
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0) rotate(0deg)' : 'translateY(0.5em) rotate(-3deg)',
                  transition: `opacity .9s ease ${stagger}ms, transform .9s cubic-bezier(0.22,1,0.36,1) ${stagger}ms`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </h1>

        <a
          href="/recruit"
          style={{ ...styles.ctaBtn, ...fade(450 + HEADLINE_JP.length * 60) }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACCENT_COLOR;
            const u = e.currentTarget.querySelector<HTMLElement>('[data-underline]');
            if (u) u.style.transform = 'scaleX(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#FFFCF3';
            const u = e.currentTarget.querySelector<HTMLElement>('[data-underline]');
            if (u) u.style.transform = 'scaleX(0.4)';
          }}
        >
          <span style={{ position: 'relative', paddingBottom: 6 }}>
            {CTA_TEXT}
            <span data-underline style={styles.ctaUnderline} />
          </span>
        </a>
      </div>
    </section>
  );
}
