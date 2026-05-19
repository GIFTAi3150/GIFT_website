'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

// Sticky text on the left, big draw-in numbers on the right.
// Each number row has its own IntersectionObserver and counts from 0 → target on entry.
// Mobile layout (≤ 720px) collapses to a single column and stacks the
// num+label header so the headline doesn't wrap one-char-per-line — see the
// .pn-* media query rules in twilight.css.

const styles: Record<string, CSSProperties> = {
  root: { position: 'relative', background: 'var(--r-cream)', padding: '120px 0' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80 },
  sticky: { position: 'sticky', top: 100, alignSelf: 'start' },
  numList: { display: 'flex', flexDirection: 'column', gap: 12 },
  numRow: { borderTop: '1.5px solid var(--r-ink)', padding: '32px 0' },
  numHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 },
  num: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(80px, 12vw, 180px)',
    lineHeight: 1,
    letterSpacing: '-0.04em',
    color: 'var(--r-ink)',
    fontVariantNumeric: 'tabular-nums',
  },
  numUnit: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 28,
    color: 'var(--r-magenta)',
  },
  numLabel: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--r-ink)',
    maxWidth: 200,
    textAlign: 'right',
  },
  numSub: {
    marginTop: 14,
    fontSize: 14,
    color: 'var(--r-mocha)',
    lineHeight: 1.7,
    fontWeight: 400,
  },
};

function useCounter(target: number, duration: number, trigger: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      // For non-integer targets (e.g. 4.6), keep one decimal.
      const isInt = Number.isInteger(target);
      const value = target * eased;
      setV(isInt ? Math.round(value) : Math.round(value * 10) / 10);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);
  return v;
}

interface NumberRowProps {
  num: number;
  unit: string;
  label: string;
  sub: string;
  color?: string;
}

function NumberRow({ num, unit, label, sub, color = 'var(--r-ink)' }: NumberRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hit, setHit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHit(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const v = useCounter(num, 1500, hit);

  return (
    <div ref={ref} className="pn-row" style={styles.numRow}>
      <div className="pn-header" style={styles.numHeader}>
        <div className="pn-num" style={{ ...styles.num, color }}>
          {v}
          <span style={styles.numUnit}>{unit}</span>
        </div>
        <div className="pn-label" style={styles.numLabel}>{label}</div>
      </div>
      <div style={styles.numSub}>{sub}</div>
    </div>
  );
}

export default function PinnedNumbers() {
  return (
    <section className="pn-root" style={styles.root} id="numbers">
      <div className="tw-container pn-grid" style={styles.grid}>
        <div className="pn-sticky" style={styles.sticky}>
          <span className="tw-eyebrow">BY THE NUMBERS</span>
          <h2
            style={{
              marginTop: 18,
              fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.05,
              color: 'var(--r-ink)',
              textWrap: 'balance',
            }}
          >
            数字が、
            <br />
            <span
              style={{
                background: 'linear-gradient(120deg, transparent 0% 50%, var(--r-gold) 50% 100%)',
                padding: '0 6px',
              }}
            >
              嘘をつかない
            </span>
            。
          </h2>
          <p
            style={{
              marginTop: 24,
              fontSize: 16,
              lineHeight: 1.9,
              color: 'var(--r-mocha)',
              maxWidth: 320,
            }}
          >
            雰囲気の良さ、というふわっとした言葉ではなく、
            <br />
            測れる事実だけで語る、はたらく場所としてのGIFT。
          </p>
          <a href="/recruit" className="tw-btn butter" style={{ marginTop: 28 }}>
            応募ページへ →
          </a>
        </div>
        <div style={styles.numList}>
          <NumberRow
            num={300}
            unit="名+"
            label="自社採用・自社教育のスタッフ"
            sub="外注ゼロ。全員が、GIFTの仲間です。"
            color="var(--r-ink)"
          />
          <NumberRow
            num={98}
            unit="%"
            label="入社研修の完走率"
            sub="未経験でも安心。ペアトレ8日間の効果。"
            color="var(--r-magenta)"
          />
          <NumberRow
            num={4.6}
            unit=" /5"
            label="社員満足度スコア"
            sub="2025年社内サーベイ・回答率89%。"
            color="var(--r-ink)"
          />
          <NumberRow
            num={70}
            unit="%"
            label="未経験スタートの割合"
            sub="アパレル・飲食・学生から、続々入社中。"
            color="var(--r-magenta)"
          />
          <NumberRow
            num={12}
            unit=" 拠点"
            label="全国の拠点数"
            sub="リモート併用OK。地方在住もOK。"
            color="var(--r-ink)"
          />
        </div>
      </div>
    </section>
  );
}
