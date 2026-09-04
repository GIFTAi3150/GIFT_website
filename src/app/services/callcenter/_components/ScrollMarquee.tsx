'use client';

import type { CSSProperties } from 'react';

// Editorial multi-row strip — built like a print poster:
//
//   [bg]      Faint "GIFT INC." text drifting slowly in one direction.
//             Just a wordmark watermark — no big logos.
//   [hero]    Giant mixed JP/EN type with chips, color pops, gold tags.
//             The actual GIFT logo SVG is used as a separator (black, ~38px).
//   [serif]   Counter-rotating italic mincho row over the cream bg.
//   [ticker]  Dark indigo band at the bottom with reversed-out white type
//             and white logos — gives the strip a confident "poster floor."
//
// Logo coloring: the source SVG has hardcoded fills (#234a2d + #fff). To
// recolor it, we apply CSS filters — `brightness(0)` flattens everything to
// black; chain `invert(1)` to flip to white. No need to touch the SVG itself.

type Phrase =
  | { kind: 'plain' | 'pop' | 'butter' | 'outline' | 'magenta' | 'gold'; text: string }
  | { kind: 'chip'; text: string };

const heroPhrases: Phrase[] = [
  { kind: 'plain', text: 'WHERE OPPORTUNITY' },
  { kind: 'butter', text: 'BEGINS' },
  { kind: 'chip', text: 'EST. 2018' },
  { kind: 'plain', text: '声で、' },
  { kind: 'magenta', text: '世界を、' },
  { kind: 'plain', text: '動かす。' },
  { kind: 'chip', text: 'NOW HIRING' },
  { kind: 'outline', text: '300+ VOICES' },
];

const serifPhrases = [
  'Listen.',
  'Connect.',
  'Grow.',
  '聴く・つなぐ・育つ',
  'Apply in 60 seconds',
  '電話の向こうに、誰かの未来。',
  "A small voice can move someone's day.",
];

// Short, confident, all-caps phrases for the dark bottom ticker.
// Always paired with a white logo on either side.
const tickerPhrases = [
  'WORK · WITH · HEART',
  '採用中 · 2026',
  'JOIN THE GIFT',
  'A VOICE THAT MATTERS',
  '声で、はたらく。',
  'NOW HIRING — 5 ROLES',
];

const LOGO_SRC = '/GIFT_logo.svg';

// Color filters for the GIFT logo SVG (which has hardcoded fills).
const LOGO_BLACK = 'brightness(0)';
const LOGO_WHITE = 'brightness(0) invert(1)';

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    background: 'linear-gradient(180deg, var(--r-cream) 0%, #F8E9CC 100%)',
    paddingTop: 72,
    paddingBottom: 0, // ticker band below has its own padding
    overflow: 'hidden',
    borderTop: '1px solid #D9CDB3',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    opacity: 0.25,
    backgroundImage: 'radial-gradient(rgba(42,24,16,0.08) 1px, transparent 1px)',
    backgroundSize: '4px 4px',
    mixBlendMode: 'multiply',
  },
  // Background wordmark — single direction, very slow, very faint.
  ghostRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '38%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  ghostTrack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'clamp(40px, 5vw, 96px)',
    fontFamily: 'var(--font-display)',
    fontWeight: 900,
    fontSize: 'clamp(140px, 20vw, 280px)',
    lineHeight: 0.85,
    letterSpacing: '-0.04em',
    color: 'transparent',
    WebkitTextStroke: '1.5px rgba(14,10,36,0.18)',
    animation: 'twSm 140s linear infinite',
  },
  // Hero row — main marquee.
  heroWrap: {
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
    padding: '8px 0',
    maskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
  },
  heroTrack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 56,
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-sans)',
    fontWeight: 900,
    fontSize: 'clamp(64px, 11vw, 156px)',
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    color: 'var(--r-ink)',
    animation: 'twSm 60s linear infinite',
  },
  pop: { color: 'var(--r-magenta)' },
  popButter: {
    background: 'var(--r-gold)',
    color: 'var(--r-ink)',
    padding: '0 22px',
    borderRadius: 8,
    transform: 'rotate(-1.5deg)',
    boxShadow: '4px 4px 0 var(--r-ink)',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  } as CSSProperties,
  popOutline: {
    color: 'transparent',
    WebkitTextStroke: '2px var(--r-ink)',
    letterSpacing: '-0.02em',
  },
  popMagenta: {
    color: 'var(--r-magenta)',
    fontStyle: 'italic',
    fontFamily: 'var(--font-mincho)',
    fontWeight: 700,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--r-cream)',
    background: 'var(--r-ink)',
    padding: '10px 18px',
    borderRadius: 999,
    transform: 'translateY(-12px)',
  },
  heroLogoSep: {
    height: 'clamp(40px, 5vw, 64px)',
    width: 'auto',
    flexShrink: 0,
    filter: LOGO_BLACK,
    opacity: 0.85,
  },
  // Serif row — italic mincho phrases drift the other way.
  serifWrap: {
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 24,
    maskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)',
  },
  serifTrack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 36,
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mincho)',
    fontStyle: 'italic',
    fontWeight: 500,
    fontSize: 'clamp(28px, 3.8vw, 52px)',
    lineHeight: 1.1,
    color: 'var(--r-magenta-d)',
    animation: 'twSmr 70s linear infinite',
  },
  serifSep: {
    display: 'inline-block',
    fontFamily: 'var(--font-display)',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: '0.5em',
    letterSpacing: '0.3em',
    color: 'var(--r-ink)',
    opacity: 0.7,
  },
  // Dark bottom ticker band — gives the strip a confident floor and lets us
  // reverse out the type for contrast.
  tickerBand: {
    position: 'relative',
    zIndex: 2,
    background: 'var(--r-ink)',
    color: 'var(--r-cream)',
    overflow: 'hidden',
    padding: '20px 0',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  tickerTrack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 48,
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(14px, 1.4vw, 18px)',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: '#fff',
    animation: 'twSm 38s linear infinite',
  },
  tickerLogo: {
    height: 22,
    width: 'auto',
    flexShrink: 0,
    filter: LOGO_WHITE,
    opacity: 0.85,
  },
  tickerDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--r-gold)',
    flexShrink: 0,
  },
};

const Diamond = ({ size = 14, color = 'var(--r-magenta)' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden style={{ flexShrink: 0 }}>
    <path d="M7 0 L14 7 L7 14 L0 7 Z" fill={color} />
  </svg>
);

export default function ScrollMarquee() {
  const repHero = [...heroPhrases, ...heroPhrases, ...heroPhrases];
  const repSerif = [...serifPhrases, ...serifPhrases, ...serifPhrases];
  const repTicker = [...tickerPhrases, ...tickerPhrases, ...tickerPhrases];
  // Background wordmark — repeats as one long string so the scroll wrap
  // never exposes a gap. Tripled for seamless looping via the twSm keyframe.
  const ghostText = 'GIFT INC.   ';
  const ghostBlock = ghostText.repeat(10);

  return (
    <div style={styles.root}>
      <div style={styles.grain} />

      {/* Background wordmark — outlined "GIFT INC." drifts in one direction */}
      <div style={styles.ghostRow} aria-hidden>
        <div style={styles.ghostTrack}>
          <span>{ghostBlock}</span>
          <span>{ghostBlock}</span>
          <span>{ghostBlock}</span>
        </div>
      </div>

      {/* HERO row — main marquee with chips, color pops, and a quiet
          diamond between phrases (no logo here, it was too much). */}
      <div style={styles.heroWrap}>
        <div style={styles.heroTrack}>
          {repHero.map((p, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 56 }}>
              {p.kind === 'plain' && <span>{p.text}</span>}
              {p.kind === 'pop' && <span style={styles.pop}>{p.text}</span>}
              {p.kind === 'magenta' && <span style={styles.popMagenta}>{p.text}</span>}
              {p.kind === 'butter' && <span style={styles.popButter}>{p.text}</span>}
              {p.kind === 'outline' && <span style={styles.popOutline}>{p.text}</span>}
              {p.kind === 'chip' && <span style={styles.chip}>● {p.text}</span>}
              <Diamond size={20} color="var(--r-magenta)" />
            </span>
          ))}
        </div>
      </div>

      {/* SERIF row — counter-rotating italic mincho with diamond separators */}
      <div style={styles.serifWrap}>
        <div style={styles.serifTrack}>
          {repSerif.map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 36 }}>
              <span>{t}</span>
              {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
              <span style={styles.serifSep}>///</span>
              <Diamond />
            </span>
          ))}
        </div>
      </div>

      {/* TICKER band — dark indigo floor with reversed-out white type. The
          GIFT logo only appears once per loop (at the seam) so it punctuates
          rather than repeats. Gold dot separators carry the rest. */}
      <div style={styles.tickerBand}>
        <div style={styles.tickerTrack}>
          {repTicker.map((t, i) => {
            // Show the logo only at the start of each repetition of the
            // phrase set (i.e. once every tickerPhrases.length items).
            const showLogo = i % tickerPhrases.length === 0;
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 24 }}>
                {showLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={LOGO_SRC} alt="" aria-hidden style={styles.tickerLogo} />
                )}
                <span style={styles.tickerDot} />
                <span>{t}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
