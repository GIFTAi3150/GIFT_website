'use client';

import { useMemo } from 'react';

interface ScatterTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** overall stagger speed — lower = snappier, higher = more spread out */
  staggerMs?: number;
  /** max travel distance in px (random within ±range) */
  range?: number;
  /** max rotation in deg (random within ±deg) */
  rotation?: number;
}

// Deterministic pseudo-random so SSR and client render the same HTML.
function seeded(n: number, salt: number) {
  const x = Math.sin(n * 9973 + salt) * 10000;
  return x - Math.floor(x);
}

export default function ScatterText({
  text,
  className,
  style,
  staggerMs = 35,
  range = 120,
  rotation = 60,
}: ScatterTextProps) {
  // Split text into words first so each word stays unbroken on the line,
  // then into chars so each char can animate independently.
  const words = useMemo(() => {
    const all = text.split('');
    const out: { chars: { ch: string; tx: string; ty: string; rot: string; delay: number }[] }[] = [
      { chars: [] },
    ];
    all.forEach((ch, i) => {
      if (ch === ' ') {
        out.push({ chars: [] });
        return;
      }
      out[out.length - 1].chars.push({
        ch,
        tx: ((seeded(i, 1) - 0.5) * 2 * range).toFixed(2),
        ty: ((seeded(i, 2) - 0.5) * 2 * range).toFixed(2),
        rot: ((seeded(i, 3) - 0.5) * 2 * rotation).toFixed(2),
        delay: i * staggerMs,
      });
    });
    return out;
  }, [text, staggerMs, range, rotation]);

  return (
    <span className={className} style={style}>
      {words.map((word, wi) => (
        <span key={wi}>
          {/* whole word stays unbroken */}
          <span className="inline-block whitespace-nowrap">
            {word.chars.map((c, ci) => (
              <span
                key={ci}
                className="scatter-char inline-block"
                style={
                  {
                    '--tx': `${c.tx}px`,
                    '--ty': `${c.ty}px`,
                    '--rot': `${c.rot}deg`,
                    '--reveal-delay': `${c.delay}ms`,
                  } as React.CSSProperties
                }
              >
                {c.ch}
              </span>
            ))}
          </span>
          {/* breakable space between words */}
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
