'use client';

import { useEffect, useState, type CSSProperties } from 'react';

// Editorial hero — left: stagger-in JP headline + minimal underlined CTA.
// Right: portrait video frame at its native ~0.8 aspect, hard cream backdrop.
// Below 880px collapses to a single-column stack with the video centered.

const HEADLINE_JP = '声で、誰かの一日を、変える人になる。';
const ACCENT_CHAR = '誰';
const CTA_TEXT = '応募する';
const ACCENT_COLOR = 'var(--r-magenta)';

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--r-cream)',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 'clamp(40px, 6vw, 96px)',
    padding: 'clamp(56px, 6vw, 88px)',
    boxSizing: 'border-box',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(40px, 6vh, 80px)',
    maxWidth: 720,
    minWidth: 0,
  },
  // Desktop headline. Narrow viewports get a smaller, looser variant below
  // (`narrowHeadline`) — the desktop floor of 48px crowded the edges of small
  // phones once the per-char inline-blocks wrapped.
  headline: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 900,
    fontSize: 'clamp(48px, 6.4vw, 112px)',
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
    color: 'var(--r-ink)',
    margin: 0,
    fontFeatureSettings: '"palt" 1',
    wordBreak: 'keep-all',
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
    color: 'var(--r-ink)',
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
  videoFrame: {
    position: 'relative',
    height: 'min(94vh, 1080px)',
    aspectRatio: '0.8 / 1',
    overflow: 'hidden',
    background: 'var(--r-ink)',
    boxShadow: '0 50px 100px -30px rgba(14,10,36,0.4)',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 30%',
    display: 'block',
  },
  cornerBase: {
    position: 'absolute',
    width: 18,
    height: 18,
    pointerEvents: 'none',
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

  const rootStyle: CSSProperties = narrow
    ? {
        // Mobile: stack with VIDEO first (column-reverse on the source order
        // — left/text comes second in JSX, right/video first visually).
        // Top padding is ≥ the fixed Header height (80px) plus breathing room
        // so neither the video frame nor the headline sit under the navbar.
        ...styles.root,
        display: 'flex',
        flexDirection: 'column-reverse',
        padding: '108px 20px 56px',
        gap: 32,
        minHeight: 'auto',
      }
    : styles.root;

  const headlineStyle: CSSProperties = narrow
    ? { ...styles.headline, ...styles.narrowHeadline }
    : styles.headline;

  const videoStyle: CSSProperties = narrow
    ? {
        ...styles.videoFrame,
        height: 'auto',
        width: '100%',
        maxWidth: 420,
        aspectRatio: '0.8 / 1',
        justifySelf: 'center',
      }
    : styles.videoFrame;

  return (
    <section style={rootStyle} aria-label="コールセンター事業 — Hero">
      {/* LEFT — headline + button */}
      <div style={styles.left}>
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
          href="#recruit"
          style={{ ...styles.ctaBtn, ...fade(450 + HEADLINE_JP.length * 60) }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ACCENT_COLOR;
            const u = e.currentTarget.querySelector<HTMLElement>('[data-underline]');
            if (u) u.style.transform = 'scaleX(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--r-ink)';
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

      {/* RIGHT — portrait video.
          The placeholder mp4 from the design kit is HEVC and won't decode in
          Chrome/Firefox on Windows; the SVG below shows through as a graceful
          fallback. Drop a real H.264-encoded .mp4 at /public/callcenter-hero.mp4
          (or replace the <source> path) and it'll cover the SVG automatically. */}
      <div style={{ ...videoStyle, ...fade(350) }}>
        {/* Animated SVG fallback — sits behind the <video> so if the video
            fails to decode we still see motion and color, not a black hole. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/callcenter-hero.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          style={styles.video}
        >
          <source src="/callcenter-hero.mp4" type="video/mp4" />
        </video>

        {/* Headphones sticker — covers the bottom-right corner of the video
            (the AI watermark) and also nods to the call-center theme.
            Sized + positioned to fully overlap a typical Vidu watermark
            footprint (~120×40px starting ~20px from the bottom-right). */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 4,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--r-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px -6px rgba(14,10,36,0.4)',
            transform: 'rotate(-8deg)',
          }}
        >
          <svg
            width="68"
            height="68"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--r-ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {/* Filled magenta ear cups under the stroked headband — call-center
                cue with a pop of brand color. */}
            <path d="M4 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3z" fill="#E5347A" />
            <path d="M20 14h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3z" fill="#E5347A" />
            {/* Headband + ear-cup outline as a single continuous stroke */}
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          </svg>
        </div>

        {/* Corner crop marks — editorial detail */}
        <div style={{ ...styles.cornerBase, top: -10, left: -10, borderTop: '1.5px solid var(--r-ink)', borderLeft: '1.5px solid var(--r-ink)' }} />
        <div style={{ ...styles.cornerBase, top: -10, right: -10, borderTop: '1.5px solid var(--r-ink)', borderRight: '1.5px solid var(--r-ink)' }} />
        <div style={{ ...styles.cornerBase, bottom: -10, left: -10, borderBottom: '1.5px solid var(--r-ink)', borderLeft: '1.5px solid var(--r-ink)' }} />
        <div style={{ ...styles.cornerBase, bottom: -10, right: -10, borderBottom: '1.5px solid var(--r-ink)', borderRight: '1.5px solid var(--r-ink)' }} />
      </div>
    </section>
  );
}
