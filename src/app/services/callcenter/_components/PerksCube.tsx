'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';

// 720vh sticky scroll track. As the user scrolls, a 3D cube on the right rotates
// face-by-face; the left panel switches perks with varied entry animations.

interface Perk {
  tag: string;
  sticker: string;
  title: string;
  body: string;
  chips: string[];
  stat?: string;
  statLabel?: string;
  bg: string;
  Icon: (props: { tint?: string }) => ReactElement;
  anim: 'wordsUp' | 'lettersIn' | 'maskRight' | 'typeIn' | 'tiltFlip' | 'fadeBlur';
}

// ─── Icons (one per face) ───────────────────────────────────────────────
const IconHeadset = ({ tint = 'var(--r-magenta)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '62%', height: '62%' }} aria-hidden>
    {/* Headband arcing over the top, connecting both ear cups */}
    <path
      d="M 32 80 Q 32 22 80 22 Q 128 22 128 80"
      stroke="var(--r-ink)"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    {/* Ear cups */}
    <rect
      x="16"
      y="72"
      width="32"
      height="58"
      rx="10"
      fill={tint}
      stroke="var(--r-ink)"
      strokeWidth="4"
    />
    <rect
      x="112"
      y="72"
      width="32"
      height="58"
      rx="10"
      fill={tint}
      stroke="var(--r-ink)"
      strokeWidth="4"
    />
    {/* Speaker dots */}
    <circle cx="32" cy="101" r="5" fill="var(--r-ink)" />
    <circle cx="128" cy="101" r="5" fill="var(--r-ink)" />
    {/* Boom mic arm — curves down and forward from the right cup */}
    <path
      d="M 128 130 Q 130 146 112 150 L 86 150"
      stroke="var(--r-ink)"
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Mic capsule at the end of the boom */}
    <ellipse cx="80" cy="150" rx="9" ry="5" fill="var(--r-ink)" />
  </svg>
);

const IconClock = ({ tint = 'var(--r-gold)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '60%', height: '60%' }} aria-hidden>
    <circle cx="80" cy="80" r="58" fill={tint} stroke="var(--r-ink)" strokeWidth="5" />
    <line
      x1="80"
      y1="80"
      x2="80"
      y2="42"
      stroke="var(--r-ink)"
      strokeWidth="6"
      strokeLinecap="round"
      style={{ transformOrigin: '80px 80px', animation: 'twPcTickHour 24s linear infinite' }}
    />
    <line
      x1="80"
      y1="80"
      x2="112"
      y2="80"
      stroke="var(--r-ink)"
      strokeWidth="4"
      strokeLinecap="round"
      style={{ transformOrigin: '80px 80px', animation: 'twPcTickMin 4s linear infinite' }}
    />
    <circle cx="80" cy="80" r="5" fill="var(--r-ink)" />
    {[0, 90, 180, 270].map((a) => (
      <rect
        key={a}
        x="78"
        y="22"
        width="4"
        height="10"
        fill="var(--r-ink)"
        style={{ transformOrigin: '80px 80px', transform: `rotate(${a}deg)` }}
      />
    ))}
  </svg>
);

const IconBookmark = ({ tint = 'var(--r-magenta)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '60%', height: '60%' }} aria-hidden>
    <rect
      x="40"
      y="28"
      width="80"
      height="104"
      rx="6"
      fill="#FBF6EC"
      stroke="var(--r-ink)"
      strokeWidth="5"
    />
    <line
      x1="56"
      y1="56"
      x2="104"
      y2="56"
      stroke="var(--r-ink)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="56"
      y1="74"
      x2="96"
      y2="74"
      stroke="var(--r-ink)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="56"
      y1="92"
      x2="100"
      y2="92"
      stroke="var(--r-ink)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M 96 22 L 96 70 L 110 60 L 124 70 L 124 22 Z"
      fill={tint}
      stroke="var(--r-ink)"
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

const IconHeart = ({ tint = 'var(--r-magenta)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '60%', height: '60%' }} aria-hidden>
    <g style={{ transformOrigin: '80px 90px', animation: 'twPcBeat 1.4s ease-in-out infinite' }}>
      <path
        d="M 80 130 C 30 90, 30 50, 56 50 C 70 50, 80 64, 80 70 C 80 64, 90 50, 104 50 C 130 50, 130 90, 80 130 Z"
        fill={tint}
        stroke="var(--r-ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="66" cy="76" r="5" fill="#FBF6EC" />
      <circle cx="90" cy="76" r="5" fill="#FBF6EC" />
    </g>
  </svg>
);

const IconChart = ({ tint = 'var(--r-gold)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '60%', height: '60%' }} aria-hidden>
    <line x1="22" y1="132" x2="138" y2="132" stroke="#FBF6EC" strokeWidth="3" />
    <rect x="28" y="80" width="18" height="52" rx="3" fill="#6E5BE8" />
    <rect x="54" y="60" width="18" height="72" rx="3" fill="var(--r-magenta)" />
    <rect x="80" y="44" width="18" height="88" rx="3" fill={tint} />
    <rect x="106" y="28" width="18" height="104" rx="3" fill="#FBF6EC" />
    <path
      d="M 36 90 L 62 70 L 88 54 L 114 38"
      stroke="#FBF6EC"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="114" cy="38" r="6" fill="#FBF6EC" />
  </svg>
);

const IconCoin = ({ tint = 'var(--r-gold)' }: { tint?: string }) => (
  <svg viewBox="0 0 160 160" style={{ width: '60%', height: '60%' }} aria-hidden>
    <circle cx="80" cy="80" r="50" fill={tint} stroke="var(--r-ink)" strokeWidth="5" />
    <circle
      cx="80"
      cy="80"
      r="40"
      fill="none"
      stroke="var(--r-ink)"
      strokeWidth="2"
      opacity="0.4"
    />
    <text
      x="80"
      y="94"
      textAnchor="middle"
      fontFamily="var(--font-display)"
      fontWeight={900}
      fontSize="46"
      fill="var(--r-ink)"
    >
      ¥
    </text>
  </svg>
);

const PERKS: Perk[] = [
  {
    tag: '01 · CORE',
    sticker: 'CORE',
    title: '「話を聴く」を、武器にする。',
    body: 'マニュアル通りでなく、相手に合わせて言葉を選ぶ。コールの仕事は、思っているより、ずっと創造的。話す力ではなく、聴く力で評価される職場です。',
    chips: ['傾聴力', '対話設計', '評価の軸'],
    bg: 'var(--r-gold)',
    Icon: IconHeadset,
    anim: 'wordsUp',
  },
  {
    tag: '02 · TIME',
    sticker: 'TIME',
    title: 'シフトは2週間ごとに、自分で組める。',
    body: '週3日OK。学校、育児、副業との両立も自然に。ライフのほうを優先しても、キャリアは止まらない。',
    chips: ['週3日〜', '2週間サイクル', '副業可'],
    bg: '#FFF7E6',
    Icon: IconClock,
    anim: 'lettersIn',
  },
  {
    tag: '03 · ONBOARDING',
    sticker: 'TRAINING',
    title: '8日間ペアトレ研修、定着率98%。',
    body: '一人で抱えない。隣に必ず、先輩がいる。最初の8日間で、不安は確信に変わります。',
    chips: ['ペア研修', '8日間', '定着 98%'],
    stat: '98%',
    statLabel: 'TRAINEE RETENTION',
    bg: 'var(--r-gold)',
    Icon: IconBookmark,
    anim: 'maskRight',
  },
  {
    tag: '04 · CULTURE',
    sticker: 'CULTURE',
    title: 'サンクスカード文化が、毎日まわる。',
    body: '「ありがとう」を口に出して、紙に書く。仲間の小さな仕事を、ちゃんと拾い合うチームです。',
    chips: ['感謝の見える化', '日次運用', 'チーム評価'],
    bg: '#FFE7DC',
    Icon: IconHeart,
    anim: 'typeIn',
  },
  {
    tag: '05 · GROWTH',
    sticker: 'GROWTH',
    title: '半年で昇給、360度評価で昇格。',
    body: '数字だけじゃない。仲間からの推薦が効く評価制度。一人で頑張らなくても、ちゃんと前に進める。',
    chips: ['半年昇給', '360度評価', '推薦昇格'],
    bg: 'var(--r-ink)',
    Icon: IconChart,
    anim: 'tiltFlip',
  },
  {
    tag: '06 · COMP',
    sticker: 'COMP',
    title: '初任給 月給 27万円〜。',
    body: '賞与年2回、交通費全額、社会保険完備、住宅手当も。生活の地盤を、まず整える待遇です。',
    chips: ['賞与年2回', '交通費全額', '社保完備', '住宅手当'],
    stat: '¥270K',
    statLabel: 'STARTING SALARY',
    bg: '#FFFDF7',
    Icon: IconCoin,
    anim: 'fadeBlur',
  },
];

// 6 cube faces: front, right, back, left, top, bottom — at distance --half.
const FACE_TRANSFORMS = [
  'rotateY(0deg)   rotateX(0deg)   translateZ(var(--half))',
  'rotateY(90deg)  rotateX(0deg)   translateZ(var(--half))',
  'rotateY(180deg) rotateX(0deg)   translateZ(var(--half))',
  'rotateY(270deg) rotateX(0deg)   translateZ(var(--half))',
  'rotateX(90deg)  translateZ(var(--half)) rotateZ(90deg)',
  'rotateX(-90deg) translateZ(var(--half)) rotateZ(-90deg)',
];

const CUBE_AT_STEP = [
  { rx: 0, ry: 0 },
  { rx: 0, ry: -90 },
  { rx: 0, ry: -180 },
  { rx: 0, ry: -270 },
  { rx: -90, ry: -270 },
  { rx: 90, ry: -270 },
];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const styles: Record<string, CSSProperties> = {
  section: {
    position: 'relative',
    background: 'linear-gradient(180deg, #F6E2C0 0%, #FBEFD8 60%, #F6E2C0 100%)',
  },
  scrollTrack: { position: 'relative', height: '720vh' },
  sticky: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    alignItems: 'center',
    overflow: 'hidden',
  },
  left: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 clamp(32px, 6vw, 96px)',
    position: 'relative',
    zIndex: 3,
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--r-magenta-d)',
    marginBottom: 18,
  },
  bigTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 900,
    fontSize: 'clamp(56px, 7.4vw, 112px)',
    lineHeight: 0.95,
    letterSpacing: '-0.025em',
    margin: 0,
    color: 'var(--r-ink)',
    wordBreak: 'keep-all',
  },
  serifAccent: {
    fontFamily: 'var(--font-mincho)',
    fontStyle: 'italic',
    fontWeight: 500,
    color: 'var(--r-magenta-d)',
  },
  perkArea: { marginTop: 36, maxWidth: 560, minHeight: 280 },
  kicker: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: '0.22em',
    color: 'var(--r-magenta-d)',
    textTransform: 'uppercase',
  },
  perkTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    fontSize: 'clamp(28px, 2.6vw, 40px)',
    lineHeight: 1.2,
    color: 'var(--r-ink)',
    margin: '10px 0 16px',
    textWrap: 'balance',
  } as CSSProperties,
  perkBody: {
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: 'clamp(15px, 1.1vw, 17px)',
    lineHeight: 1.85,
    color: 'var(--r-mocha)',
    margin: 0,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 22,
    marginTop: 22,
    borderTop: '1.5px solid rgba(14,10,36,0.18)',
    flexWrap: 'wrap',
  },
  chip: {
    display: 'inline-block',
    padding: '7px 14px',
    borderRadius: 999,
    background: 'var(--r-gold)',
    color: 'var(--r-ink)',
    fontSize: 11,
    fontWeight: 800,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.08em',
  },
  bigStat: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 'clamp(56px, 6vw, 88px)',
    color: 'var(--r-magenta-d)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  stage: {
    position: 'relative',
    height: '100%',
    width: '100%',
    perspective: '2000px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cube: {
    position: 'relative',
    width: 'var(--cube-size)',
    height: 'var(--cube-size)',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  },
  face: {
    position: 'absolute',
    inset: 0,
    background: '#FFFDF7',
    border: '1px solid rgba(14,10,36,0.15)',
    boxShadow: '0 30px 60px -20px rgba(14,10,36,0.45), 0 10px 24px -12px rgba(14,10,36,0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  } as CSSProperties,
  faceArt: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  faceLabel: {
    padding: '12px 18px',
    background: '#FFFDF7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--r-mocha)',
    borderTop: '1px solid rgba(14,10,36,0.1)',
  },
  faceSticker: {
    position: 'absolute',
    top: 14,
    left: 14,
    background: 'var(--r-magenta)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 999,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  progress: {
    position: 'absolute',
    right: 28,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 5,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(14,10,36,0.2)',
    transition: 'all .5s cubic-bezier(0.22,1,0.36,1)',
  },
  dotActive: { width: 8, height: 28, borderRadius: 4, background: 'var(--r-magenta)' },
  scrollHint: {
    position: 'absolute',
    left: 'clamp(32px, 6vw, 96px)',
    bottom: 40,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--r-mocha)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    opacity: 0.7,
  },
};

function MetaRow({ p }: { p: Perk }) {
  return (
    <div style={styles.metaRow}>
      <span style={styles.kicker}>{p.tag}</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {p.chips.map((c) => (
          <span key={c} style={styles.chip}>
            {c}
          </span>
        ))}
      </div>
      {p.stat && (
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={styles.bigStat}>{p.stat}</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 10,
              letterSpacing: '0.22em',
              color: 'var(--r-mocha)',
            }}
          >
            {p.statLabel}
          </div>
        </div>
      )}
    </div>
  );
}

function PerkSwitch({ p }: { p: Perk }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (p.anim !== 'typeIn') return;
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i++;
      setShown(p.body.slice(0, i));
      if (i >= p.body.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [p.anim, p.body]);

  if (p.anim === 'wordsUp') {
    const words = p.title.split(/(?<=[、。])/);
    return (
      <div style={styles.perkArea}>
        <h3 style={styles.perkTitle}>
          {words.map((w, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: `twPcWordsUp .7s cubic-bezier(.22,1,.36,1) ${0.05 + i * 0.09}s both`,
              }}
            >
              {w}
            </span>
          ))}
        </h3>
        <p style={{ ...styles.perkBody, animation: 'twPcWordsUp .7s ease .35s both' }}>{p.body}</p>
        <div style={{ animation: 'twPcWordsUp .6s ease .55s both' }}>
          <MetaRow p={p} />
        </div>
      </div>
    );
  }

  if (p.anim === 'lettersIn') {
    const chars = [...p.title];
    return (
      <div style={styles.perkArea}>
        <h3 style={{ ...styles.perkTitle, overflow: 'hidden' }}>
          {chars.map((c, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: `twPcLettersIn .55s cubic-bezier(.22,1,.36,1) ${i * 0.022}s both`,
              }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h3>
        <p style={{ ...styles.perkBody, animation: 'twPcWordsUp .7s ease .65s both' }}>{p.body}</p>
        <div style={{ animation: 'twPcWordsUp .6s ease .85s both' }}>
          <MetaRow p={p} />
        </div>
      </div>
    );
  }

  if (p.anim === 'maskRight') {
    return (
      <div style={styles.perkArea}>
        <h3
          style={{
            ...styles.perkTitle,
            animation: 'twPcMaskRight .8s cubic-bezier(.7,0,.3,1) both',
          }}
        >
          {p.title}
        </h3>
        <div style={{ position: 'relative', width: 64, height: 3, marginBottom: 14 }}>
          <span
            style={{
              display: 'block',
              height: 3,
              background: 'var(--r-magenta)',
              transformOrigin: 'left',
              animation: 'twPcUnderline .8s cubic-bezier(.7,0,.3,1) .5s both',
            }}
          />
        </div>
        <p
          style={{
            ...styles.perkBody,
            animation: 'twPcMaskRight 1s cubic-bezier(.7,0,.3,1) .25s both',
          }}
        >
          {p.body}
        </p>
        <div style={{ animation: 'twPcWordsUp .6s ease 1s both' }}>
          <MetaRow p={p} />
        </div>
      </div>
    );
  }

  if (p.anim === 'typeIn') {
    return (
      <div style={styles.perkArea}>
        <h3 style={{ ...styles.perkTitle, animation: 'twPcWordsUp .6s ease both' }}>{p.title}</h3>
        <p style={styles.perkBody}>
          {shown}
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              verticalAlign: 'text-bottom',
              background: 'var(--r-magenta)',
              marginLeft: 4,
              animation: 'twPcTypeBlink 0.8s steps(1) infinite',
            }}
          />
        </p>
        <div style={{ animation: 'twPcWordsUp .6s ease 1.4s both' }}>
          <MetaRow p={p} />
        </div>
      </div>
    );
  }

  if (p.anim === 'tiltFlip') {
    return (
      <div style={styles.perkArea}>
        <h3
          style={{
            ...styles.perkTitle,
            animation: 'twPcTiltFlip .9s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          {p.title}
        </h3>
        <p
          style={{
            ...styles.perkBody,
            animation: 'twPcTiltFlip 1s cubic-bezier(.22,1,.36,1) .15s both',
          }}
        >
          {p.body}
        </p>
        <div style={{ animation: 'twPcTiltFlip .8s cubic-bezier(.22,1,.36,1) .35s both' }}>
          <MetaRow p={p} />
        </div>
      </div>
    );
  }

  // fadeBlur (default)
  return (
    <div style={styles.perkArea}>
      <h3
        style={{
          ...styles.perkTitle,
          animation: 'twPcFadeBlur .9s cubic-bezier(.22,1,.36,1) both',
        }}
      >
        {p.title}
      </h3>
      <p
        style={{
          ...styles.perkBody,
          animation: 'twPcFadeBlur 1.1s cubic-bezier(.22,1,.36,1) .15s both',
        }}
      >
        {p.body}
      </p>
      <div style={{ animation: 'twPcFadeBlur .9s ease .35s both' }}>
        <MetaRow p={p} />
      </div>
    </div>
  );
}

export default function PerksCube() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const target = useRef({ rx: 0, ry: 0 });
  const current = useRef({ rx: 0, ry: 0 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    let mounted = true;

    const compute = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const t = total > 0 ? scrolled / total : 0;
      const N = PERKS.length;

      const raw = t * N;
      const idx = Math.min(N - 1, Math.floor(raw));
      const within = raw - idx;

      const HOLD = 0.6;
      let segT: number;
      const nextIdx = Math.min(N - 1, idx + 1);
      if (within < HOLD) segT = 0;
      else {
        segT = (within - HOLD) / (1 - HOLD);
        segT = easeInOutCubic(segT);
      }

      const a = CUBE_AT_STEP[idx];
      const b = CUBE_AT_STEP[nextIdx];
      target.current.rx = a.rx + (b.rx - a.rx) * segT;
      target.current.ry = a.ry + (b.ry - a.ry) * segT;

      const visIdx = within < HOLD + 0.2 ? idx : nextIdx;
      if (mounted) setActive(visIdx);
    };

    const tick = () => {
      const k = 0.12;
      current.current.rx += (target.current.rx - current.current.rx) * k;
      current.current.ry += (target.current.ry - current.current.ry) * k;
      const cube = cubeRef.current;
      if (cube)
        cube.style.transform = `rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    compute();
    tick();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  const p = PERKS[active];

  return (
    <section style={styles.section} id="perks">
      <div ref={trackRef} style={styles.scrollTrack}>
        <div className="pc-sticky" style={styles.sticky}>
          <div className="pc-left" style={styles.left}>
            <span style={styles.eyebrow}>
              <span style={{ width: 28, height: 2, background: 'var(--r-magenta)' }} />
              PERKS · WHY GIFT?
            </span>

            <h2 style={styles.bigTitle}>
              <span style={styles.serifAccent}>毎日が、</span>
              <br />
              ちょっと楽しい。
            </h2>

            <PerkSwitch p={p} key={active} />
          </div>

          <div className="pc-stage" style={styles.stage}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: '18%',
                width: 'min(50vh, 400px)',
                height: 26,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(14,10,36,0.32) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />

            <div
              ref={cubeRef}
              style={
                {
                  ...styles.cube,
                  ['--cube-size' as string]: 'min(46vh, 60vw, 380px)',
                  ['--half' as string]: 'calc(min(46vh, 60vw, 380px) / 2)',
                  transform: 'rotateX(0deg) rotateY(0deg)',
                } as CSSProperties
              }
            >
              {PERKS.map((face, i) => {
                const Icon = face.Icon;
                return (
                  <div
                    key={i}
                    style={{ ...styles.face, transform: FACE_TRANSFORMS[i], background: face.bg }}
                  >
                    <div style={styles.faceArt}>
                      <div style={styles.faceSticker}>{face.sticker}</div>
                      <Icon />
                    </div>
                    <div style={styles.faceLabel}>
                      <span>{face.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.progress}>
              {PERKS.map((_, i) => (
                <span key={i} style={i === active ? styles.dotActive : styles.dot} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
