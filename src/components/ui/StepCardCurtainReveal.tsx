'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StepCardCurtainReveal() {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const container = document.querySelector<HTMLElement>('[data-step-card-container]');
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-step-card]')
    );
    if (!cards.length) return;

    if (!isDesktop) {
      if (!container) return;
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.from(container, {
            opacity: 0,
            y: 32,
            duration: 0.75,
            ease: 'power3.out',
          });
        },
      });
      return () => st.kill();
    }

    // Inject ink-colored curtain overlays — cards already have relative + overflow-hidden
    cards.forEach((card) => {
      if (card.querySelector('[data-curtain]')) return;
      const overlay = document.createElement('div');
      overlay.setAttribute('data-curtain', '');
      overlay.style.cssText =
        'position:absolute;inset:0;background:#111B21;transform:scaleY(0);' +
        'transform-origin:top;z-index:10;pointer-events:none;will-change:transform;';
      card.appendChild(overlay);
    });

    ScrollTrigger.batch(cards, {
      start: 'top 82%',
      once: true,
      interval: 0.15,
      onEnter: (batch) => {
        batch.forEach((card, i) => {
          const overlay = card.querySelector<HTMLElement>('[data-curtain]');
          if (!overlay) return;
          gsap
            .timeline({ delay: i * 0.14 })
            .to(overlay, {
              scaleY: 1,
              duration: 0.38,
              ease: 'power3.in',
              transformOrigin: 'top',
            })
            .to(overlay, {
              scaleY: 0,
              duration: 0.55,
              ease: 'power3.out',
              transformOrigin: 'bottom',
            });
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cards.forEach((card) => card.querySelector('[data-curtain]')?.remove());
    };
  }, []);

  return null;
}
