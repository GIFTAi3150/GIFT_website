'use client';

import { useEffect } from 'react';

// Scrubs --mis on each [data-wk-row] inside [data-wk-intro]: 1 while the row's
// centre is at the bottom edge of the viewport, 0 once it reaches 62% height.
// Plain rAF on scroll — no pinning, so no scroll budget to freeze.
export default function WkIntroRegister() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('[data-wk-intro]');
    if (!section) return;
    const rows = Array.from(section.querySelectorAll<HTMLElement>('[data-wk-row]'));
    if (!rows.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let inView = false;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const t = Math.min(1, Math.max(0, (centre - vh * 0.62) / (vh * 0.38)));
        row.style.setProperty('--mis', (t * t * (3 - 2 * t)).toFixed(4));
      }
    };
    const request = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        request();
      },
      { rootMargin: '20% 0px' },
    );
    observer.observe(section);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      for (const row of rows) row.style.removeProperty('--mis');
    };
  }, []);

  return null;
}
