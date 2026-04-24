'use client';

import { useEffect, useRef } from 'react';

export type HistoryItem = {
  year: string;
  month?: string;
  isPresent?: boolean;
  event: string;
};

// How much vertical scroll (in vh) advances by one year
const SCROLL_VH_PER_YEAR = 30;

// Smoothing factor — per-frame lerp toward the scroll target.
// Higher = more responsive (closer to 1:1 with scroll). Lower = silkier but more lag.
// 0.18 at 60fps = ~150ms to settle, which filters scroll jitter without feeling detached.
const SMOOTHING = 0.18;

export default function HistoryCarousel({ items }: { items: HistoryItem[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const total = items.length;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let rafId = 0;
    let running = false;
    // Eased value that chases the scroll-derived target frame by frame.
    let current = 0;

    const readTarget = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return 0;
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      return ratio * Math.max(1, total - 1);
    };

    const applyStyles = (progress: number) => {
      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const distance = i - progress;
        const abs = Math.abs(distance);
        // Dwell + quick transition:
        //   abs ≤ 0.3  → fully visible (this year "owns" the screen)
        //   0.3 → 0.7  → crossfade with the neighbor
        //   abs ≥ 0.7  → fully invisible (no ghost of far years)
        const raw = Math.max(0, Math.min(1, (0.7 - abs) / 0.4));
        const opacity = raw * raw * (3 - 2 * raw); // smoothstep easing
        // Smaller translate during dwell so the year sits still; full slide during transition.
        const yOffset = distance * -60;
        const scale = 1 - Math.min(abs, 1) * 0.06;
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scale})`;
        el.style.pointerEvents = abs < 0.3 ? 'auto' : 'none';
      }
    };

    const tick = () => {
      const target = readTarget();
      // Lerp toward target; snap when close enough so we stop burning frames.
      const delta = target - current;
      if (Math.abs(delta) < 0.0005) {
        current = target;
      } else {
        current += delta * SMOOTHING;
      }
      applyStyles(current);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      // Seed current so we don't animate from 0 when scrolling into the section.
      current = readTarget();
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    // Only run the rAF loop while the section is near the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(wrapper);

    // Initial paint in case the section is already in view on mount.
    current = readTarget();
    applyStyles(current);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [total]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(100vh + ${SCROLL_VH_PER_YEAR * total}vh)` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="relative h-[460px] w-full max-w-3xl px-6 sm:h-[520px]">
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{
                opacity: i === 0 ? 1 : 0,
                transform:
                  i === 0
                    ? 'translate3d(0, 0, 0) scale(1)'
                    : 'translate3d(0, 80px, 0) scale(0.92)',
                willChange: 'opacity, transform',
                pointerEvents: i === 0 ? 'auto' : 'none',
                backfaceVisibility: 'hidden',
              }}
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
          ))}
        </div>
      </div>
    </div>
  );
}
