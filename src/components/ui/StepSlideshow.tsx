'use client';

import { useState, useEffect, useCallback } from 'react';

interface Slide {
  step: string;
  title: string;
  body: string;
  img?: string;
}

interface Props {
  slides: Slide[];
  interval?: number;
}

export default function StepSlideshow({ slides, interval = 3000 }: Props) {
  const [active, setActive] = useState(0);

  // Auto-advance: cleanup cancels the old timer whenever active changes,
  // then a fresh timer is set. Always fires — no pause logic to get stuck.
  useEffect(() => {
    const t = setTimeout(() => {
      setActive((p) => (p + 1) % slides.length);
    }, interval);
    return () => clearTimeout(t);
  }, [active, slides.length, interval]);

  const goTo = useCallback((i: number) => {
    setActive(i); // triggers effect cleanup → new timer starts immediately
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a1216] min-h-[60vh] md:min-h-[80vh]"
    >
      {/* Slides — stacked, crossfade via opacity */}
      {slides.map((slide, i) => (
        <div
          key={slide.step}
          className="absolute inset-0"
          style={{
            opacity: i === active ? 1 : 0,
            transition: 'opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: i === active ? 1 : 0,
          }}
          aria-hidden={i !== active}
        >
          {slide.img && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={slide.img}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-contain p-6 md:p-16"
            />
          )}

          {/* Gradient — bottom-heavy so text stays readable */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(10,18,22,0.85) 0%, rgba(10,18,22,0.30) 50%, rgba(10,18,22,0.10) 100%)',
            }}
          />

          {/* Step content */}
          <div className="absolute bottom-[14vh] left-[6vw] right-[6vw]">
            <p
              className="mb-3 font-nube-sans font-normal uppercase tracking-[0.18em] text-white/50"
              style={{ fontSize: 'clamp(11px, 1vw, 13px)' }}
            >
              STEP {slide.step}
            </p>
            <h3
              className="mb-4 font-nube-display text-white"
              style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', lineHeight: 1.3 }}
            >
              {slide.title}
            </h3>
            <p
              className="max-w-xl font-nube-sans text-white/70"
              style={{ fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.7 }}
            >
              {slide.body}
            </p>
          </div>
        </div>
      ))}

      {/* Pill navigator */}
      <div className="absolute z-10" style={{ bottom: '4.5vh', left: '6vw' }}>
        <div
          className="flex items-center gap-[10px] backdrop-blur-md"
          style={{
            background: 'rgba(20,28,34,0.55)',
            borderRadius: 999,
            padding: '10px 18px',
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Step ${i + 1}`}
              style={{
                height: 8,
                width: i === active ? 30 : 8,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.25)',
                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {i === active && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#fff',
                    borderRadius: 999,
                    transformOrigin: 'left center',
                    animation: `stepFill ${interval}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
