'use client';

import { useEffect } from 'react';

// Two pieces of behavior live here so the page can stay a server
// component (and keep its `metadata` export):
//   1. .in-view fade-up — observed on scroll, triggers count-up for any
//      child [data-count] integers.
//   2. cube tilt — mouse moving over .cube-stage tilts the .cube under
//      it; leaving resumes the CSS-driven auto-spin.
export default function FinanceScripts() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('show');
          entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach((node) => {
            if (node.dataset.done) return;
            node.dataset.done = '1';
            const target = Number(node.dataset.count);
            if (!Number.isFinite(target)) return;
            const dur = 1400;
            const start = performance.now();
            const sup = node.querySelector('sup');
            const supHtml = sup ? sup.outerHTML : '';
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              node.innerHTML = String(Math.round(target * eased)) + supHtml;
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('.finance-page .in-view').forEach((el) => io.observe(el));

    const stage = document.querySelector<HTMLElement>('.finance-page .cube-stage');
    const cube = document.querySelector<HTMLElement>('.finance-page .cube');
    let onMove: ((e: MouseEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;
    if (stage && cube) {
      onMove = (e: MouseEvent) => {
        const r = stage.getBoundingClientRect();
        const tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
        const ty = -((e.clientY - r.top) / r.height - 0.5) * 30;
        cube.style.animationPlayState = 'paused';
        cube.style.transform = `rotateX(${-18 + ty}deg) rotateY(${tx * 4}deg)`;
      };
      onLeave = () => {
        cube.style.animationPlayState = 'running';
        cube.style.transform = '';
      };
      stage.addEventListener('mousemove', onMove);
      stage.addEventListener('mouseleave', onLeave);
    }

    return () => {
      io.disconnect();
      if (stage && onMove) stage.removeEventListener('mousemove', onMove);
      if (stage && onLeave) stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return null;
}
