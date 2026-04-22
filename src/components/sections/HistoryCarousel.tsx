'use client';

import { useEffect, useRef, useState } from 'react';

export type HistoryItem = {
  year: string;
  month?: string;
  isPresent?: boolean;
  event: string;
};

// How much vertical scroll (in vh) advances by one year
const SCROLL_VH_PER_YEAR = 35;

export default function HistoryCarousel({ items }: { items: HistoryItem[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const total = items.length;
  const touchStartX = useRef<number | null>(null);

  // Track scroll position → derive current year
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      const idx = Math.min(total - 1, Math.floor(ratio * total));
      setProgress(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [total]);

  // Programmatic jump (used by swipe)
  const jumpTo = (i: number) => {
    const target = Math.max(0, Math.min(total - 1, i));
    const el = wrapperRef.current;
    if (!el) return;
    const scrollableHeight = el.offsetHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;
    const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
    const targetScroll = wrapperTop + ((target + 0.5) / total) * scrollableHeight;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // Touch swipe — left/right to jump years freely
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 60) {
      jumpTo(progress + (dx > 0 ? -1 : 1));
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(100vh + ${SCROLL_VH_PER_YEAR * total}vh)` }}
    >
      <div
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-[460px] w-full max-w-3xl px-6 sm:h-[520px]">
          {items.map((item, i) => {
            const isCurrent = i === progress;
            const isPast = i < progress;
            const yOffset = isCurrent ? 0 : isPast ? -120 : 120;
            const scale = isCurrent ? 1 : 0.9;
            const blur = isCurrent ? 0 : 10;

            return (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                style={{
                  opacity: isCurrent ? 1 : 0,
                  transform: `translateY(${yOffset}px) scale(${scale})`,
                  filter: `blur(${blur}px)`,
                  transition:
                    'opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1), filter 700ms ease-out',
                  willChange: 'opacity, transform, filter',
                  pointerEvents: isCurrent ? 'auto' : 'none',
                }}
                aria-hidden={!isCurrent}
              >
                {/* Thin green accent line above */}
                <div className="mb-8 h-[2px] w-16 bg-gift-green" />

                {/* Year — big and clean */}
                <p
                  className="font-display font-extrabold leading-[0.85] tracking-tight text-gift-ink"
                  style={{ fontSize: 'clamp(96px, 18vw, 220px)' }}
                >
                  {item.year}
                </p>

                {/* NOW badge */}
                {item.isPresent && (
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gift-green/10 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-gift-green">
                    <span aria-hidden className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-gift-green/60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gift-green" />
                    </span>
                    Now
                  </span>
                )}

                {/* Event description */}
                <p
                  className="mx-auto mt-10 max-w-xl font-sans font-light leading-loose text-gift-silver"
                  style={{ fontSize: 'clamp(17px, 1.8vw, 19px)' }}
                >
                  {item.event}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
