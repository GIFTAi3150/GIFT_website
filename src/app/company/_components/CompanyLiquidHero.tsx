'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidWordmark from './LiquidWordmark';

gsap.registerPlugin(ScrollTrigger);

const COMPANY_LIQUID_READY = 'gift:company-liquid-ready';

function heroPad(width: number): number {
  if (width >= 1024) return Math.max(32, (width - 1152) / 2 + 32);
  if (width >= 768) return 24;
  return 16;
}

export default function CompanyLiquidHero() {
  const stickRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stick = stickRef.current;
    const scene = stick?.parentElement ?? null;
    if (!stick || !scene) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spacer = scene.querySelector<HTMLElement>('.co-scene__spacer');
    const uiItems = Array.from(stick.querySelectorAll<HTMLElement>('[data-hero-ui]'));
    const cue = cueRef.current;
    stick.style.setProperty('--hero-pad', `${heroPad(window.innerWidth)}px`);

    let resizeTimer = 0;
    let previousWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === previousWidth) return;
      previousWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        stick.style.setProperty('--hero-pad', `${heroPad(window.innerWidth)}px`);
      }, 100);
    };
    window.addEventListener('resize', onResize);

    let scrollCue: gsap.core.Tween | null = null;
    const hideCue = () => {
      if (scrollCue) {
        scrollCue.kill();
        scrollCue = null;
      }
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.2, overwrite: true });
      window.removeEventListener('scroll', hideCue);
    };
    if (cue) gsap.set(cue, { autoAlpha: 0 });
    window.addEventListener('scroll', hideCue, { passive: true, once: true });

    const intro = gsap.timeline({ paused: true });
    if (reducedMotion) {
      gsap.set(uiItems, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(uiItems, { autoAlpha: 0, y: 18 });
      intro.to(
        uiItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.1,
        },
        0.45,
      );
      if (cue) intro.to(cue, { autoAlpha: 1, duration: 0.3 }, 1.65);
    }

    let introStarted = false;
    const startIntro = () => {
      if (introStarted) return;
      introStarted = true;
      intro.play();
    };
    window.addEventListener(COMPANY_LIQUID_READY, startIntro);
    if (document.documentElement.hasAttribute('data-company-liquid-ready') || reducedMotion) {
      startIntro();
    }

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: () =>
          '+=' + Math.round(((spacer?.offsetHeight ?? window.innerHeight * 0.6) / 0.6) * 0.95),
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    if (uiItems.length) {
      scrollTl.to(
        uiItems,
        {
          autoAlpha: 0,
          y: -24,
          ease: 'none',
          duration: 0.28,
          stagger: 0.018,
        },
        0.12,
      );
    }

    // The backdrop has its own safety cap; this one only protects the hero UI.
    const readyCap = window.setTimeout(startIntro, 2500);

    return () => {
      window.clearTimeout(readyCap);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener(COMPANY_LIQUID_READY, startIntro);
      hideCue();
      intro.kill();
      scrollTl.scrollTrigger?.kill();
      scrollTl.kill();
    };
  }, []);

  return (
    <div ref={stickRef} className="co-scene__stick">
      <div className="co-hero__ui">
        <LiquidWordmark />
        <h1 className="co-hero__title" data-hero-ui>
          人生が変わるきっかけを、贈る。
        </h1>
        <p className="co-hero__sub" data-hero-ui>
          Gift an opportunity.
        </p>
        <div ref={cueRef} className="co-hero__cue" aria-hidden>
          <span />
        </div>
      </div>
    </div>
  );
}
