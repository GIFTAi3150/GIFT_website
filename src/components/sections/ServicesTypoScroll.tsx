'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import services from '@/data/services.json';
import './typo-scroll.css';

// Osmo "big typo scroll preview" pattern. The page renders a vertical
// stack of huge service headings. As the user scrolls, the item whose
// vertical center is nearest the viewport center becomes "active" —
// its associated preview video plays in a fixed-position panel that
// sits at the center of the viewport. Clicking a heading routes to
// that service's page.
export default function ServicesTypoScroll() {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  // True on devices that can hover (i.e. desktop with a mouse).
  // Drives the trigger logic: hover-capable → hover sets active;
  // touch → scroll position picks the heading closest to viewport
  // center. Set after mount so SSR doesn't lock to a bad guess.
  const [isHoverCapable, setIsHoverCapable] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setIsHoverCapable(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Scroll-driven activation — touch devices only. On hover-capable
  // devices we leave the active state in the user's hands.
  useEffect(() => {
    if (isHoverCapable) return;
    const updateActive = () => {
      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!items.length) return;
      const vh = window.innerHeight;
      const center = vh / 2;
      let closest = 0;
      let closestDist = Infinity;
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const itemCenter = r.top + r.height / 2;
        const dist = Math.abs(itemCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveIdx(closest);
      // Preview visible only when a heading is firmly in the central
      // band — tight threshold so the thumbnail doesn't pop in/out as
      // the user scrolls past adjacent sections.
      setSectionVisible(closestDist < vh * 0.22);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [isHoverCapable]);

  // Desktop hover handlers — entering a heading instantly activates
  // it; leaving the list area hides the preview.
  const handleItemEnter = (i: number) => {
    if (!isHoverCapable) return;
    setActiveIdx(i);
    setSectionVisible(true);
  };
  const handleListLeave = () => {
    if (!isHoverCapable) return;
    setSectionVisible(false);
  };

  // Cursor-follow for the preview panel on hover-capable devices.
  // A rAF loop lerps the panel's transform toward the latest mouse
  // position so the panel trails the cursor with a slight delay
  // instead of teleporting. translate(-50%, -50%) keeps the panel
  // centered on (x, y) rather than anchored at its top-left.
  useEffect(() => {
    if (!isHoverCapable) return;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      const node = previewRef.current;
      if (node) {
        node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [isHoverCapable]);

  // Touch devices: anchor the preview directly next to whichever
  // heading is currently active. The preview sits just below the
  // heading by default; if it would overflow the bottom of the
  // viewport, it flips to sit above instead. Updates on scroll +
  // resize + activeIdx change.
  useEffect(() => {
    if (isHoverCapable) return;

    const updatePosition = () => {
      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
      const activeEl = items[activeIdx];
      const preview = previewRef.current;
      if (!activeEl || !preview) return;
      const r = activeEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const previewH = preview.offsetHeight || 180;
      const gap = 16;

      // Place preview below the active heading by default. If that
      // would clip off the bottom edge, flip it above the heading.
      let y = r.bottom + gap;
      if (y + previewH > vh - 16) y = r.top - gap - previewH;
      // Keep it under the navbar (h-20 = 80px) if it ends up flipped
      // all the way to the top.
      y = Math.max(88, y);

      const x = window.innerWidth / 2;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)`;
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isHoverCapable, activeIdx]);

  // All videos loop continuously — never pause. Kick each one off
  // once they're mounted so they're already running when their
  // heading scrolls into focus (no reveal-then-start hiccup).
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (!video) return;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  }, []);

  return (
    <section className="typo-scroll relative w-full bg-white text-gift-ink">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8 pt-s-80 pb-12">
        <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
          WORKS
        </p>
        <h2
          className="mt-3 font-sans font-extrabold text-gift-ink"
          style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
        >
          実績・強み
        </h2>
      </div>

      <div
        className="typo-scroll-list relative z-20"
        onMouseLeave={handleListLeave}
      >
        {services.map((s, i) => {
          const isActive = activeIdx === i;
          return (
            <div
              key={s.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`typo-scroll-item${isActive ? ' is-active' : ''}`}
              data-typo-scroll-item={isActive ? 'active' : undefined}
              onMouseEnter={() => handleItemEnter(i)}
            >
              <Link href={s.href} className="typo-scroll-link">
                <h3 className="typo-scroll-heading">{s.titleEn}</h3>
              </Link>
            </div>
          );
        })}
      </div>

      <div
        ref={previewRef}
        className={`typo-scroll-preview${sectionVisible ? ' is-visible' : ''}`}
        aria-hidden
      >
        {services.map((s, i) => {
          const isActive = activeIdx === i;
          // Cast for the optional `video` field — services.json may
          // not yet have it on every entry while assets are being
          // produced. If missing, the poster image acts as fallback.
          const videoSrc = (s as { video?: string }).video;
          return (
            <div
              key={s.id}
              className={`typo-scroll-media${isActive ? ' is-active' : ''}`}
            >
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={videoSrc}
                poster={s.image}
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
