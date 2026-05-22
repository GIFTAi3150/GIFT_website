'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StepCardScrubReveal() {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const section = document.querySelector<HTMLElement>('[data-step-section]');
    const container = document.querySelector<HTMLElement>('[data-step-card-container]');
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-step-card]'));

    if (!section || !cards.length) return;

    if (!isDesktop) {
      gsap.set(cards, { opacity: 0, y: 40 });
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
          });
        },
      });
      return () => {
        st.kill();
        gsap.set(cards, { clearProps: 'all' });
      };
    }

    // Desktop: clip container so off-screen cards are hidden
    if (container) container.style.overflow = 'hidden';

    // Cards start off the right edge of the viewport
    gsap.set(cards, { x: window.innerWidth });

    // Sequential timeline — card N starts only after card N-1 lands
    const tl = gsap.timeline({ paused: true });
    cards.forEach((card) => {
      tl.to(card, {
        x: 0,
        duration: 0.85,
        ease: 'power4.out',
      }, '>-0.05'); // tiny overlap so it feels continuous
    });

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 65%',
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
      gsap.set(cards, { clearProps: 'all' });
      if (container) container.style.overflow = '';
    };
  }, []);

  return null;
}
