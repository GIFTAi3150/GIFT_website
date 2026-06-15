'use client';

import { useEffect } from 'react';
import gsap from 'gsap';

export default function ElasticPulseInit() {
  useEffect(() => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    // Defer so all client hydration is settled before we query
    const timer = window.setTimeout(setup, 100);
    const cleanups: Array<() => void> = [];

    function setup() {
      const buttons = document.querySelectorAll<HTMLElement>('[data-elastic-pulse-btn]');

      buttons.forEach((btn) => {
        const target =
          btn.querySelector<HTMLElement>('[data-elastic-pulse-target]') ?? btn;
        let locked = false;
        let tl: gsap.core.Timeline | null = null;

        const onEnter = () => {
          if (locked) return;
          locked = true;
          window.setTimeout(() => { locked = false; }, 500);

          const w = target.offsetWidth;
          const h = target.offsetHeight;
          if (!w || !h) return;
          const fs = parseFloat(getComputedStyle(target).fontSize) || 16;
          const stretch = 0.75 * fs;
          const sx = (w + stretch) / w;
          const sy = (h - stretch * 0.33) / h;

          tl?.kill();
          tl = gsap
            .timeline()
            .to(target, { scaleX: sx, scaleY: sy, duration: 0.1, ease: 'power1.out' })
            .to(target, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1, 0.3)' });
        };

        btn.addEventListener('mouseenter', onEnter);
        cleanups.push(() => {
          btn.removeEventListener('mouseenter', onEnter);
          tl?.kill();
        });
      });
    }

    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
