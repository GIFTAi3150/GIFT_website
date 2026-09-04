'use client';

import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LiquidGradientCanvas, { type LiquidGradientHandle } from './LiquidGradientCanvas';

gsap.registerPlugin(ScrollTrigger);

const COMPANY_LIQUID_READY = 'gift:company-liquid-ready';

// /company tokens, ordered from the abyss/navy foundation to the restrained
// periwinkle and blue accents. The source shader blends them in OKLCH.
const COMPANY_LIQUID_COLORS = [
  '#050c1a',
  '#0b1020',
  '#111827',
  '#1a2440',
  '#363b9e',
  '#3d47c0',
  '#2563eb',
  '#60a5fa',
];

export default function CompanyLiquidBackdrop() {
  const layerRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<LiquidGradientHandle>(null);
  const readySentRef = useRef(false);

  const markReady = useCallback(() => {
    if (readySentRef.current) return;
    readySentRef.current = true;
    document.documentElement.setAttribute('data-company-liquid-ready', '');
    window.dispatchEvent(new Event(COMPANY_LIQUID_READY));

    // Let the shader paint once before the site-wide cover starts to leave.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.dispatchEvent(new Event('gift:logo-ready')));
    });
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      console.warn('[CompanyLiquidBackdrop] using static fallback:', error.message);
      markReady();
    },
    [markReady],
  );

  useEffect(() => {
    const layer = layerRef.current;
    const dim = dimRef.current;
    const root = layer?.closest<HTMLElement>('main.company-page') ?? null;
    const mission = root?.querySelector<HTMLElement>('#mission') ?? null;
    const contact = root?.querySelector<HTMLElement>('#contact-cta') ?? null;
    if (!layer || !dim || !root) return;

    let stoppedAtContact = false;
    const setRendererForContact = (stop: boolean) => {
      if (stop === stoppedAtContact) return;
      stoppedAtContact = stop;
      if (stop) liquidRef.current?.pause();
      else liquidRef.current?.play();
    };

    const ctx = gsap.context(() => {
      gsap.set(layer, { opacity: 1 });
      gsap.set(dim, { opacity: 0 });

      if (mission) {
        gsap.to(dim, {
          opacity: 0.76,
          ease: 'none',
          scrollTrigger: {
            trigger: mission,
            start: 'top 92%',
            end: 'top 28%',
            scrub: true,
          },
        });
      }

      if (contact) {
        gsap.to(layer, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: contact,
            start: 'top 90%',
            end: 'top 20%',
            scrub: true,
            onUpdate: (self) => setRendererForContact(self.progress >= 0.985),
            onLeave: () => setRendererForContact(true),
            onEnterBack: () => setRendererForContact(false),
          },
        });
      }
    }, root);

    // Do not strand either the hero intro or the global route cover on a slow GPU.
    const readyCap = window.setTimeout(markReady, 2500);

    return () => {
      window.clearTimeout(readyCap);
      setRendererForContact(true);
      ctx.revert();
      readySentRef.current = false;
      document.documentElement.removeAttribute('data-company-liquid-ready');
    };
  }, [markReady]);

  return (
    <div ref={layerRef} className="co-page-liquid" aria-hidden>
      <LiquidGradientCanvas
        ref={liquidRef}
        colors={COMPANY_LIQUID_COLORS}
        speed={0.48}
        scale={0.52}
        seed={8}
        turbAmp={0.5}
        turbFreq={0.6}
        turbIter={8}
        waveFreq={2.5}
        distBias={-0.12}
        ditherMode="smooth"
        dither={0.035}
        exposure={1.08}
        contrast={1.12}
        saturation={1.04}
        maxDpr={1.25}
        fps={30}
        respectReducedMotion
        pauseWhenOffscreen={false}
        pauseWhenHidden
        fallbackColor="#0b1020"
        onReady={markReady}
        onError={handleError}
        aria-hidden
        tabIndex={-1}
      />
      <div className="co-page-liquid__shade" />
      <div ref={dimRef} className="co-page-liquid__dim" />
    </div>
  );
}
