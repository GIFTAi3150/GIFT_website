'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Per-paragraph stagger: fires once when the section enters view.
// No SplitText (no char-span overhead), no scrub (text isn't gated
// behind the scroll wheel). Each paragraph slides up and fades in
// as a whole unit — feels snappy vs. the char-by-char scrub it replaces.
export default function CeoMessageReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('#ceo-message');
    if (!root) return;

    const paragraphs = Array.from(
      root.querySelectorAll<HTMLElement>('[data-highlight-text]'),
    );
    if (!paragraphs.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.set(paragraphs, { opacity: 0, y: 28, x: -6 });
      gsap.to(paragraphs, {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.72,
        stagger: 0.13,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: paragraphs[0],
          start: 'top 80%',
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return null;
}
