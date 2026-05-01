'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// 4-step zigzag funnel with a wavy dashed connector. As the user scrolls past
// each step, its number-circle lights magenta. Closes with a magenta CTA card.

interface Step {
  sub: string;
  t: string;
  body: string;
}

const STEPS: Step[] = [
  { sub: 'WEB · 60秒',     t: '応募',           body: '履歴書不要。氏名・連絡先・希望シフトだけでOK。気になったら、その日のうちに送れます。' },
  { sub: 'ZOOM · 30分',    t: 'カジュアル面談', body: '質問は何でも。落とすための面接ではなく、合うかどうか確認する場です。' },
  { sub: '半日 · 有給',    t: '体験勤務',       body: '実際の現場の空気を見て、自分の感覚で判断。来てよかった、で帰ってください。' },
  { sub: '8日間 · ペアトレ', t: '入社・研修',     body: '先輩がフル伴走。3週間で独り立ちが目安。安心して、スタートを切れる設計です。' },
];

const styles: Record<string, CSSProperties> = {
  root: {
    background: 'var(--r-cream)',
    padding: 'clamp(80px, 12vw, 140px) 0',
    position: 'relative',
    overflow: 'hidden',
  },
  steps: { position: 'relative', marginTop: 64 },
  step: { display: 'flex', gap: 32, alignItems: 'center', padding: '32px 0' },
  stepRev: { flexDirection: 'row-reverse' },
  numCircle: {
    flex: '0 0 auto',
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: 'var(--r-gold)',
    border: '3px solid var(--r-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 56,
    color: 'var(--r-ink)',
    position: 'relative',
    zIndex: 2,
    transition: 'all .4s cubic-bezier(0.22,1,0.36,1)',
  },
  numActive: {
    background: 'var(--r-magenta)',
    color: '#fff',
    transform: 'scale(1.08)',
  },
  meta: { flex: 1 },
  sub: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.2em',
    color: 'var(--r-magenta)',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    fontWeight: 800,
    fontSize: 'clamp(28px, 3.5vw, 44px)',
    lineHeight: 1.1,
    color: 'var(--r-ink)',
  },
  body: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 1.85,
    color: 'var(--r-mocha)',
    maxWidth: 480,
  },
  cta: {
    marginTop: 80,
    borderRadius: 32,
    padding: 'clamp(48px, 7vw, 100px) 40px',
    background: 'var(--r-magenta)',
    color: '#fff',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
};

function Reveal({
  children,
  delay = 0,
  from = 'bottom',
}: {
  children: ReactNode;
  delay?: number;
  from?: 'left' | 'right' | 'bottom';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dirCls = from === 'left' ? 'from-left' : from === 'right' ? 'from-right' : '';
  return (
    <div
      ref={ref}
      className={`tw-reveal ${dirCls} ${shown ? 'is-in' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function RecruitFunnel() {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.top - 120) / (vh + r.height - 240)));
      setActive(Math.min(STEPS.length - 1, Math.floor(p * (STEPS.length + 0.5))));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section style={styles.root} id="recruit" ref={ref}>
      <div className="tw-container">
        <span className="tw-eyebrow">RECRUIT FLOW</span>
        <h2
          style={{
            margin: '14px 0 0',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.05,
            color: 'var(--r-ink)',
            textWrap: 'balance',
          } as CSSProperties}
        >
          応募から、初日まで。
          <br />
          <span style={{ color: 'var(--r-magenta)' }}>4ステップ。</span>
        </h2>

        <div style={styles.steps}>
          {/* connecting wavy line — viewBox lets us use a sane coord system
              (path syntax doesn't accept percentages, only numbers) */}
          <svg
            viewBox="0 0 200 1000"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.18,
            }}
            aria-hidden
          >
            <path
              d="M 70 100 Q 130 200, 70 360 T 70 620 T 70 880"
              stroke="var(--r-ink)"
              strokeWidth="3"
              strokeDasharray="6 8"
              fill="none"
            />
          </svg>
          {STEPS.map((s, i) => {
            const lit = i <= active;
            const reverse = i % 2 === 1;
            return (
              <Reveal key={i} from={reverse ? 'right' : 'left'} delay={i * 80}>
                <div style={{ ...styles.step, ...(reverse ? styles.stepRev : {}) }}>
                  <div style={{ ...styles.numCircle, ...(lit ? styles.numActive : {}) }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ ...styles.meta, textAlign: reverse ? 'right' : 'left' }}>
                    <div style={styles.sub}>{s.sub}</div>
                    <h3 style={styles.title}>{s.t}</h3>
                    <p style={{ ...styles.body, marginLeft: reverse ? 'auto' : 0 }}>{s.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div style={styles.cta}>
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}
              viewBox="0 0 800 400"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M 0 200 C 100 140, 200 140, 300 200 S 500 260, 600 200 S 800 140, 800 200"
                stroke="var(--r-gold)"
                strokeWidth="3"
                fill="none"
              >
                <animate
                  attributeName="d"
                  dur="6s"
                  repeatCount="indefinite"
                  values="
                    M 0 200 C 100 140, 200 140, 300 200 S 500 260, 600 200 S 800 140, 800 200;
                    M 0 200 C 100 260, 200 260, 300 200 S 500 140, 600 200 S 800 260, 800 200;
                    M 0 200 C 100 140, 200 140, 300 200 S 500 260, 600 200 S 800 140, 800 200"
                />
              </path>
            </svg>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  fontSize: 13,
                  color: 'var(--r-gold)',
                }}
              >
                JOIN US
              </div>
              <h3
                style={{
                  margin: '14px 0 0',
                  fontWeight: 800,
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  lineHeight: 1.1,
                  color: '#fff',
                  textWrap: 'balance',
                } as CSSProperties}
              >
                次の「キッカケ」は、
                <br />
                あなた自身かもしれません。
              </h3>
              <div
                style={{
                  marginTop: 32,
                  display: 'inline-flex',
                  gap: 14,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <a href="/contact" className="tw-btn butter">
                  応募フォームへ →
                </a>
                <a href="/contact" className="tw-btn ghost-light">
                  会社説明会を予約
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
