'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Char-by-char scroll reveal — ported from fukujo.ac.jp/university/kansei-media
// (conceptAnimation). Each character of the [data-highlight-text]
// paragraphs starts invisible and 30px below + 10px right of its final
// position; as the user scrolls past the mission block, chars settle
// into place one by one. Single scrubbed timeline runs through every
// char in reading order, scrub 1.5 gives an analog trailing feel that
// doesn't snap to the playhead.
//
// Replaces the earlier Osmo "highlight text on scroll" pattern (chars
// dim → bright). The site looked for a more cinematic reveal so the
// mission section feels like a deliberate moment, not a contrast
// puzzle.

const FUKUJO_Y_OFFSET = 30; // px char starts below its final position
const FUKUJO_X_OFFSET = 10; // px char starts to the right of final
const FUKUJO_DURATION = 1.2; // each char's tween length
const FUKUJO_STAGGER = 0.04; // gap between consecutive chars firing
const FUKUJO_SCRUB = 1.5; // analog lag — chars trail scroll by 1.5s

export default function CeoMessageReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('#ceo-message');
    if (!root) return;

    const paragraphs = Array.from(
      root.querySelectorAll<HTMLElement>('[data-highlight-text]'),
    );
    if (!paragraphs.length) return;

    // Respect prefers-reduced-motion — leave text fully visible.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    type Instance = { ctx?: gsap.Context; split?: SplitText };
    const instance: Instance = {};

    // One SplitText across all paragraphs gives us a single flat array
    // of chars (`self.chars`) in document order. With autoSplit, GSAP
    // re-splits on resize/font-load and re-runs onSplit so the spans
    // stay attached to the current layout.
    const split = SplitText.create(paragraphs, {
      type: 'words, chars',
      autoSplit: true,
      onSplit(self) {
        instance.ctx?.revert();
        const ctx = gsap.context(() => {
          const isMobile = window.matchMedia('(max-width: 767px)').matches;

          gsap.set(self.chars, {
            display: 'inline-block',
            opacity: 0,
            y: FUKUJO_Y_OFFSET,
            x: FUKUJO_X_OFFSET,
            willChange: 'transform, opacity',
          });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: paragraphs[0],
                start: isMobile ? 'top 80%' : 'top 75%',
                endTrigger: paragraphs[paragraphs.length - 1],
                end: isMobile ? 'bottom 70%' : 'bottom 50%',
                scrub: FUKUJO_SCRUB,
              },
            })
            .to(self.chars, {
              opacity: 1,
              y: 0,
              x: 0,
              duration: FUKUJO_DURATION,
              stagger: FUKUJO_STAGGER,
              ease: 'power1.inOut',
            });
        }, root);
        instance.ctx = ctx;
      },
    });

    instance.split = split;

    return () => {
      instance.ctx?.revert();
      instance.split?.revert();
    };
  }, []);

  return null;
}
