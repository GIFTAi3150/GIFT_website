'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scroll-scrubbed clause-by-clause reveal for the CEO message section.
// Each Japanese clause (split at 、 and 。 punctuation) starts dim,
// blurred, and slightly translated back. As it enters the upper half
// of the viewport, scroll progress is scrubbed onto opacity/scale/blur
// so the clause "bumps forward" smoothly into a fully readable state.
// Reads as: every scroll step reveals more, and the reader is gently
// pulled to keep moving through the message.
//
// Mounts as a sibling of the message section — no markup changes
// beyond adding data-ceo-text to the body paragraphs in page.tsx.
// Returns null (renders nothing); all behavior is side-effect.
export default function CeoMessageReveal() {
  useEffect(() => {
    // Scope to the explicit section id so this never picks up
    // unrelated [data-ceo-text] elsewhere.
    const root = document.querySelector<HTMLElement>('#ceo-message');
    if (!root) return;

    const paragraphs = Array.from(
      root.querySelectorAll<HTMLParagraphElement>('[data-ceo-text]')
    );
    if (!paragraphs.length) return;

    const triggers: ScrollTrigger[] = [];
    // Cache the original HTML so cleanup can restore it — important
    // because Next.js client-side route transitions don't unmount
    // the section's React tree, but our useEffect cleanup needs to
    // undo the DOM mutations so re-running this effect on remount
    // doesn't double-split the text into spans-within-spans.
    const originalHTML = new Map<HTMLElement, string>();

    paragraphs.forEach((p) => {
      originalHTML.set(p, p.innerHTML);

      // Split at the END of every Japanese clause separator (、 and 。)
      // so the punctuation stays attached to the clause it belongs to.
      // Lookbehind preserves the delimiter on the previous chunk.
      const text = p.textContent ?? '';
      const clauses = text.split(/(?<=[、。])/).filter((c) => c.trim().length);

      // Replace the paragraph content with one span per clause. inline-block
      // so the transform doesn't break Japanese line-wrapping.
      p.innerHTML = '';
      const spans: HTMLSpanElement[] = [];
      clauses.forEach((c) => {
        const s = document.createElement('span');
        s.textContent = c;
        s.style.display = 'inline-block';
        s.style.willChange = 'transform, opacity, filter';
        p.appendChild(s);
        spans.push(s);
      });

      spans.forEach((s) => {
        // The actual "bump forward" tween. Each span scrubs from
        // dim+blurred+back → bright+sharp+slightly-forward as it
        // travels from the bottom 80% of the viewport up to roughly
        // viewport-center. Ease 'none' because scrub IS the easing.
        const tween = gsap.fromTo(
          s,
          {
            opacity: 0.22,
            scale: 0.94,
            y: 14,
            filter: 'blur(3px)',
          },
          {
            opacity: 1,
            scale: 1.04,
            y: 0,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: s,
              start: 'top 82%',
              end: 'top 48%',
              scrub: 0.4,
            },
          }
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
      // Restore the original innerHTML so the paragraphs don't
      // accumulate span wrappers across remounts.
      originalHTML.forEach((html, p) => {
        p.innerHTML = html;
      });
    };
  }, []);

  return null;
}
