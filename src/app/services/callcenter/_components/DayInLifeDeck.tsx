'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

// Pinned section, dark backdrop. As the user scrolls through ~600vh of track,
// each card holds in focus, then slides up & fades out, revealing the next from
// the stack behind it. Final "next day, your turn" gradient CTA card closes it.
// The deck animation runs on every viewport — sizing adjusts via clamp().

interface DeckEntry {
  time: string;
  title: string;
  body: string;
  img: string;
  chip: string;
}

const DECK_ENTRIES: DeckEntry[] = [
  { time: '09:30', title: '朝のチーム集合',     body: 'その日の目標と、ちょっとした近況をシェア。発声練習で笑い合うところからスタート。',     img: '/img/team/team-3.jpg', chip: 'OPEN' },
  { time: '10:00', title: 'コール業務スタート', body: 'マニュアルは骨組み、肉付けはあなたの言葉。隣には先輩がいる安心感。',                      img: '/img/team/team-1.jpg', chip: 'CONNECT' },
  { time: '12:30', title: 'ランチタイム',       body: 'オフィスのキッチンで温かい昼食。シフト制でも、毎日誰かと食卓を囲める設計。',              img: '/img/team/team-4.jpg', chip: 'PAUSE' },
  { time: '15:00', title: '1on1ミーティング',   body: '週1の30分。数字より先に「最近どう?」を聴く時間。SVが伴走します。',                       img: '/img/team/team-2.jpg', chip: 'TALK' },
  { time: '18:00', title: 'おつかれさま',       body: '残業ほぼゼロ。夜の予定も、推し活も、ちゃんと両立できる職場です。',                        img: '/img/team/team-5.jpg', chip: 'CLOSE' },
];

const TOTAL_CARDS = DECK_ENTRIES.length + 1; // +1 for CTA tail card
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const styles: Record<string, CSSProperties> = {
  pin: {
    position: 'relative',
    background: 'var(--r-ink)',
    color: 'var(--r-cream)',
  },
  inner: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    position: 'absolute',
    top: 32,
    left: 32,
    right: 32,
    zIndex: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 24,
  },
  headerLeft: { maxWidth: 560 },
  eyebrow: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--r-gold)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
  },
  eyebrowDash: { width: 28, height: 2, background: 'var(--r-gold)' } as CSSProperties,
  title: {
    margin: '12px 0 0',
    fontWeight: 800,
    fontSize: 'clamp(32px, 4.4vw, 56px)',
    lineHeight: 1.05,
    color: '#FFFCF3',
    textWrap: 'balance',
  } as CSSProperties,
  hint: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,253,243,0.65)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  stage: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageInner: {
    position: 'relative',
    width: 'min(880px, 86vw)',
    height: 'min(560px, 64vh)',
    perspective: 1600,
  },
  card: {
    position: 'absolute',
    inset: 0,
    borderRadius: 28,
    overflow: 'hidden',
    transformStyle: 'preserve-3d',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6), 0 8px 24px -4px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease',
    willChange: 'transform, opacity',
  },
  img: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  } as CSSProperties,
  imgScrim: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(14,10,36,0.05) 0%, rgba(14,10,36,0.45) 55%, rgba(14,10,36,0.92) 100%)',
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 'clamp(28px, 4vw, 48px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    color: '#FFFCF3',
  },
  timeLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(36px, 5vw, 72px)',
    color: 'var(--r-gold)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  cardTitle: {
    fontWeight: 800,
    fontSize: 'clamp(24px, 3vw, 38px)',
    margin: '6px 0 0',
    lineHeight: 1.15,
  },
  cardBody2: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 1.65,
    color: 'rgba(255,253,243,0.85)',
    maxWidth: 580,
  },
  cardChip: {
    position: 'absolute',
    top: 24,
    left: 24,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    padding: '8px 14px',
    borderRadius: 999,
    background: 'rgba(14,10,36,0.7)',
    backdropFilter: 'blur(8px)',
    color: '#FFFCF3',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  cardIndex: {
    position: 'absolute',
    top: 24,
    right: 24,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: '0.18em',
    color: 'rgba(255,253,243,0.85)',
  },
  ctaCard: {
    position: 'absolute',
    inset: 0,
    borderRadius: 28,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, var(--r-magenta) 0%, var(--r-indigo) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease',
    boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
    color: '#fff',
    padding: 'clamp(32px, 5vw, 56px)',
    textAlign: 'center',
    willChange: 'transform, opacity',
  },
  rail: {
    position: 'absolute',
    right: 'clamp(20px, 3vw, 48px)',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'flex-end',
  },
  railItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,253,243,0.45)',
    transition: 'color .4s ease, transform .4s cubic-bezier(0.22,1,0.36,1)',
  },
  railItemActive: { color: '#FFFCF3', transform: 'translateX(-4px) scale(1.02)' },
  railBar: { width: 32, height: 2, background: 'currentColor', opacity: 0.4 },
  railBarActive: { width: 56, opacity: 1, background: 'var(--r-gold)' },
  progress: {
    position: 'absolute',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(420px, 50vw)',
    height: 2,
    zIndex: 6,
    background: 'rgba(255,253,243,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--r-gold)',
    transformOrigin: 'left center',
    transition: 'transform 0.1s linear',
  },
};

export default function DayInLifeDeck() {
  const pinRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const el = pinRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / total));
      const t = p * TOTAL_CARDS;

      cardRefs.current.forEach((node, i) => {
        if (!node) return;
        const local = t - i;

        let translate = 0;
        let translateUnit: 'px' | 'vh' = 'px';
        let scale = 1;
        let opacity = 1;
        let rotate = 0;
        let zIndex = TOTAL_CARDS - i;

        if (local < 0) {
          // queued behind in a tilted stack
          const depth = Math.min(-local, 3);
          translate = depth * 18;
          scale = 1 - depth * 0.04;
          rotate = (i % 2 === 0 ? 1 : -1) * depth * 0.5;
          opacity = -local > 3 ? 0 : 1;
        } else if (local <= 0.6) {
          // hold zone
          zIndex = TOTAL_CARDS + 5;
        } else if (local <= 1) {
          // slide out
          const out = (local - 0.6) / 0.4;
          const eased = easeOutCubic(out);
          translate = -eased * 110;
          translateUnit = 'vh';
          scale = 1 - eased * 0.05;
          opacity = 1 - eased;
          rotate = -eased * 4;
          zIndex = TOTAL_CARDS + 5;
        } else {
          translate = -110;
          translateUnit = 'vh';
          opacity = 0;
        }

        node.style.opacity = String(opacity);
        node.style.zIndex = String(zIndex);
        node.style.transform =
          `translateY(${translate}${translateUnit}) scale(${scale}) rotate(${rotate}deg)`;
      });

      const idx = Math.min(TOTAL_CARDS - 1, Math.floor(t));
      setActive(idx);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <section
      ref={pinRef}
      style={{ ...styles.pin, height: `${(TOTAL_CARDS + 0.5) * 100}vh` }}
      id="dayinlife"
    >
      <div style={styles.inner}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.eyebrow}>
              <span style={styles.eyebrowDash} />A DAY IN THE LIFE
            </span>
            <h2 style={styles.title}>
              ある一日を、<span style={{ color: 'var(--r-gold)' }}>めくる</span>。
            </h2>
            <div style={styles.hint}>
              <span>↓</span> SCROLL TO REVEAL
            </div>
          </div>
        </div>

        <div style={styles.stage}>
          <div style={styles.stageInner}>
            {DECK_ENTRIES.map((e, i) => (
              <div
                key={i}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                style={styles.card}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.img} alt="" style={styles.img} />
                <div style={styles.imgScrim} />
                <div style={styles.cardChip}>{e.chip}</div>
                <div style={styles.cardBody}>
                  <div style={styles.timeLabel}>{e.time}</div>
                  <h3 style={styles.cardTitle}>{e.title}</h3>
                  <p style={styles.cardBody2}>{e.body}</p>
                </div>
              </div>
            ))}

            {/* Final CTA card */}
            <div
              ref={(node) => {
                cardRefs.current[DECK_ENTRIES.length] = node;
              }}
              style={styles.ctaCard}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: '0.28em',
                    color: 'var(--r-gold)',
                  }}
                >
                  NEXT DAY
                </div>
                <h3
                  style={{
                    margin: '20px 0 28px',
                    fontWeight: 900,
                    fontSize: 'clamp(36px, 5vw, 64px)',
                    lineHeight: 1.05,
                    textWrap: 'balance',
                  } as CSSProperties}
                >
                  次の一日は、
                  <br />
                  あなたの番です。
                </h3>
                <a href="#recruit" className="tw-btn butter">
                  応募する <span style={{ fontSize: 18 }}>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="dayinlife-rail" style={styles.rail}>
          {[...DECK_ENTRIES, { time: 'NEXT', title: '応募する' }].map((e, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                style={{ ...styles.railItem, ...(isActive ? styles.railItemActive : {}) }}
              >
                <span>{e.time}</span>
                <span style={{ ...styles.railBar, ...(isActive ? styles.railBarActive : {}) }} />
              </div>
            );
          })}
        </div>

        <div style={styles.progress}>
          <div ref={fillRef} style={styles.progressFill} />
        </div>
      </div>
    </section>
  );
}
