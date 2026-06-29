'use client';

import { useEffect, useRef } from 'react';

/**
 * Snaps hero text animations to their final state the moment the user
 * scrolls. Without this, the nav-reveal and fade-up-word animations
 * (which slide text downward into place) play while the user is already
 * scrolling down — the opposing motions cancel out and the text appears
 * to float / "come down with" the user.
 *
 * Animation window is ~2.3 s after page-ready. We stop listening after
 * that so we don't interfere with other pages after navigation.
 */
export default function HeroScrollGuard({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const snapped = useRef(false);

  useEffect(() => {
    const snap = () => {
      if (snapped.current) return;
      snapped.current = true;
      const section = sectionRef.current;
      if (!section) return;
      section.querySelectorAll<HTMLElement>('.fade-up-word, .nav-reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.animation = 'none';
      });
    };

    // Already scrolled on mount (e.g. page restored with scroll position)
    if (window.scrollY > 30) {
      snap();
      return;
    }

    const onScroll = () => snap();
    window.addEventListener('scroll', onScroll, { passive: true, once: true });

    // Auto-remove after the longest possible animation (2.3 s after mount)
    const timer = setTimeout(() => {
      window.removeEventListener('scroll', onScroll);
    }, 2300);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [sectionRef]);

  return null;
}
