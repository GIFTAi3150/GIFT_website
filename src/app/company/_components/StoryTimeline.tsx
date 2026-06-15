'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type StoryItem = {
  year: string;
  month?: string;
  isPresent?: boolean;
  event: string;
};

export default function StoryTimeline({ items }: { items: StoryItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const n = items.length;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Reduced-motion: show all panels as a plain list
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.querySelectorAll<HTMLElement>('.story-panel').forEach((p) => {
        p.style.position = 'static';
        p.style.height = 'auto';
        p.style.transform = 'none';
        p.style.zIndex = '';
      });
      const inner = wrap.querySelector<HTMLElement>('.story-inner');
      if (inner) {
        inner.style.position = 'static';
        inner.style.height = 'auto';
        inner.style.overflow = 'visible';
      }
      return;
    }

    const panels = gsap.utils.toArray<HTMLElement>('.story-panel', wrap);

    // All panels except the first start below the viewport
    panels.forEach((p, i) => {
      if (i > 0) gsap.set(p, { yPercent: 100 });
    });

    const ctx = gsap.context(() => {
      panels.forEach((panel, i) => {
        if (i === 0) return;

        // Panel i slides in while we scroll from (i−0.5)×vh to i×vh
        // past the wrap's top — giving a 50vh dwell then 50vh slide.
        gsap.fromTo(
          panel,
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: wrap,
              start: () => `top+=${(i - 0.5) * window.innerHeight} top`,
              end: () => `top+=${i * window.innerHeight} top`,
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [n]);

  return (
    /*
     * wrapRef creates (n × 100vh) of vertical scroll space.
     * The inner div is CSS-sticky so it stays pinned at viewport top
     * while the user scrolls through that space.
     * overflow:hidden on the white card clips each panel as it slides in.
     */
    <div ref={wrapRef} style={{ height: `${n * 100}vh` }}>
      <div className="story-inner sticky top-0 h-screen">
        <div
          className="relative h-full overflow-hidden bg-white"
          style={{ borderRadius: '60px 60px 0 0' }}
        >
          {items.map((item, i) => (
            <div
              key={`${item.year}-${i}`}
              className="story-panel absolute inset-0 flex flex-col bg-white"
              style={{ zIndex: i + 1 }}
            >
              {/* ── Section number row ── */}
              <div
                className="shrink-0 px-8 font-sans text-[22px] font-normal leading-none text-[#676871] md:px-20"
                style={{ borderTop: '1px solid #CDD0D5' }}
              >
                <span
                  className="inline-block pb-3 pt-2"
                  style={{ borderTop: '2px solid #111B21', marginTop: '-1px' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* ── Main content ── */}
              <div className="flex flex-1 items-center px-8 md:px-20">
                <div
                  className="grid w-full items-start"
                  style={{
                    gridTemplateColumns: 'clamp(110px, 14vw, 200px) 1fr',
                    gap: 'clamp(32px, 7vw, 115px)',
                  }}
                >
                  {/* Year column */}
                  <div className="grid items-start gap-3" style={{ marginTop: '-20px' }}>
                    <div
                      className="font-sans font-black leading-[0.9] tracking-tight text-gift-ink"
                      style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
                    >
                      {item.year}
                    </div>

                    {item.month && (
                      <div className="font-sans text-sm leading-none text-gift-silver">
                        {item.month}
                      </div>
                    )}

                    {item.isPresent && (
                      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#D95208]/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-[#D95208]">
                        <span aria-hidden className="relative inline-flex h-1.5 w-1.5">
                          <span className="absolute inset-0 animate-ping rounded-full bg-[#D95208]/60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D95208]" />
                        </span>
                        Now
                      </span>
                    )}
                  </div>

                  {/* Event column */}
                  <div className="pt-1">
                    <p
                      className="font-mincho text-gift-ink"
                      style={{
                        fontSize: 'clamp(15px, 1.4vw, 20px)',
                        lineHeight: '1.8',
                        letterSpacing: '0.025em',
                      }}
                    >
                      {item.event}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
