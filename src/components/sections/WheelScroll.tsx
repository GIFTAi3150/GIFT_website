'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    label: 'Why',
    title: 'キッカケで、世界が変わる',
    body: '企業が本来持つ可能性を引き出す。\nその一点に、私たちGIFTは存在します。',
  },
  {
    label: 'What',
    title: '3つの専門領域で支援する',
    body: 'コールセンター・DXコンサル・財務コンサル。\n多角的な知見で、事業の課題を解決します。',
  },
  {
    label: 'How',
    title: '戦略から実行まで、一貫して',
    body: '立案だけで終わらない伴走型支援。\n現場に入り込み、共に結果を出します。',
  },
  {
    label: 'Together',
    title: '共に、未来を創る',
    body: '関わるすべての人に、新しいキッカケを。\nGIFTと共に、新しい未来を描きましょう。',
  },
] as const;

// Compass anchors: N (Why), E (What), S (How), W (Together)
const COMPASS: React.CSSProperties[] = [
  { top: 0,    left: '50%' },
  { top: '50%', right: 0 },
  { bottom: 0, left: '50%' },
  { top: '50%', left: 0 },
];

const CENTERS: React.CSSProperties[] = [
  { transform: 'translate(-50%, -50%)' },
  { transform: 'translate(50%,  -50%)' },
  { transform: 'translate(-50%,  50%)' },
  { transform: 'translate(-50%, -50%)' },
];

function PillBadge({
  label,
  active,
  size,
}: {
  label: string;
  active: boolean;
  size: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px dashed ${active ? '#2563EB' : 'rgba(37,99,235,0.2)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size * 0.083,
        transition: 'border-color 0.5s',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: active
            ? 'radial-gradient(circle at 40% 35%, #3b5fcb 0%, #0c1a3d 55%, #090e23 100%)'
            : 'radial-gradient(circle at 40% 35%, #2a2d4a 0%, #0c0e1a 75%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: size * 0.135,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          transition: 'background 0.5s',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function WheelScroll() {
  const outerRef   = useRef<HTMLDivElement>(null);
  const circleRef  = useRef<HTMLDivElement>(null);
  const pillRefs   = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const [pillSize, setPillSize] = useState(108);

  useEffect(() => {
    const update = () => setPillSize(window.innerWidth < 768 ? 76 : 108);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const outer  = outerRef.current;
    const circle = circleRef.current;
    const pills  = pillRefs.current;
    if (!outer || !circle || pills.some(p => !p)) return;

    gsap.set(circle, { rotation: 0 });
    pills.forEach(p => { if (p) gsap.set(p, { rotation: 0 }); });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const next = p < 1 / 6 ? 0 : p < 1 / 2 ? 1 : p < 5 / 6 ? 2 : 3;
          if (next !== activeStepRef.current) {
            activeStepRef.current = next;
            setActiveStep(next);
          }
        },
      },
    });

    tl.to(circle, { rotation: -270, ease: 'none', duration: 1 }, 0);
    pills.forEach(p => { if (p) tl.to(p, { rotation: 270, ease: 'none', duration: 1 }, 0); });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="relative w-full border-t border-[#BFDBFE] bg-white">
      {/* Tall outer wrapper — always present so GSAP trigger fires on all viewports */}
      <div ref={outerRef} style={{ height: '400vh' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          {/* Section label */}
          <div className="relative z-10 pt-10 md:pt-14 text-center">
            <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
              OUR PHILOSOPHY
            </p>
          </div>

          {/* Rotating dashed circle */}
          <div
            ref={circleRef}
            style={{
              position: 'absolute',
              width: '150vw',
              height: '150vw',
              borderRadius: '50%',
              border: '1px dashed rgba(37,99,235,0.18)',
              left: '-25vw',
              top: '28vh',
            }}
          >
            {STEPS.map((step, i) => (
              <div key={step.label} style={{ position: 'absolute', ...COMPASS[i] }}>
                <div style={CENTERS[i]}>
                  <div ref={el => { pillRefs.current[i] = el; }}>
                    <PillBadge label={step.label} active={activeStep === i} size={pillSize} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content panel */}
          <div
            style={{
              position: 'absolute',
              bottom: '20vh',
              left: 0,
              right: 0,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'center',
              padding: '0 24px',
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  style={{
                    position: i === 0 ? 'relative' : 'absolute',
                    top:   i === 0 ? undefined : 0,
                    left:  i === 0 ? undefined : 0,
                    right: i === 0 ? undefined : 0,
                    textAlign: 'center',
                    opacity:   activeStep === i ? 1 : 0,
                    transform: `translateY(${activeStep === i ? 0 : 22}px)`,
                    transition:
                      'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
                    pointerEvents: activeStep === i ? 'auto' : 'none',
                  }}
                >
                  <h3
                    className="mb-4 font-sans font-extrabold text-[#0C0E1A]"
                    style={{ fontSize: 'clamp(22px, 3.2vw, 40px)', lineHeight: '1.15' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-sans font-light text-[#475569]"
                    style={{
                      fontSize: 'clamp(16px, 1.8vw, 22px)',
                      lineHeight: '2',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 5,
              background:
                'linear-gradient(to bottom, #fff 0%, transparent 18%, transparent 62%, #fff 100%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
