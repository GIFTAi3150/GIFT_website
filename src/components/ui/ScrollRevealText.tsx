'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function ScrollRevealText({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(`#${sectionId}`);
    if (!root) return;

    const paragraphs = Array.from(root.querySelectorAll<HTMLElement>('[data-highlight-text]'));
    if (!paragraphs.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    type Instance = { ctx?: gsap.Context; split?: SplitText };
    const instance: Instance = {};

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
            y: 30,
            x: 10,
            willChange: 'transform, opacity',
          });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: paragraphs[0],
                start: isMobile ? 'top 80%' : 'top 75%',
                endTrigger: paragraphs[paragraphs.length - 1],
                end: isMobile ? 'bottom 70%' : 'bottom 50%',
                scrub: 1.5,
              },
            })
            .to(self.chars, {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 1.2,
              stagger: 0.04,
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
