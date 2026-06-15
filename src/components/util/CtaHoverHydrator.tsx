'use client';

import { useEffect } from 'react';

// Attaches mouseenter/mousemove listeners to every `.cta-btn` on the page
// and writes --cta-x / --cta-y as percentages of the button's bounding
// box. The CSS in globals.css uses those vars to position the circle that
// grows on hover (Osmo "directional button hover" pattern). On mouseleave
// we intentionally leave the vars at their last value so the circle
// shrinks back from the cursor's exit point.
//
// A MutationObserver picks up CTAs added after first paint (route
// transitions, lazy sections). Listeners attach once per element via a
// WeakSet sentinel, so re-scans are idempotent.
export default function CtaHoverHydrator() {
  useEffect(() => {
    const attached = new WeakSet<HTMLElement>();

    const writeXY = (btn: HTMLElement, e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty('--cta-x', `${x}%`);
      btn.style.setProperty('--cta-y', `${y}%`);
    };

    const attach = (btn: HTMLElement) => {
      if (attached.has(btn)) return;
      attached.add(btn);
      btn.addEventListener('mouseenter', (e) => writeXY(btn, e));
      btn.addEventListener('mousemove', (e) => writeXY(btn, e));
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('.cta-btn').forEach(attach);
    };
    scan(document);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains('cta-btn')) attach(node);
          scan(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
