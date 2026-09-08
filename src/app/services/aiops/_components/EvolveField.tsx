'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';
import { setFieldController } from './fieldBus';

type EvolveController = {
  destroy(): void;
};

declare global {
  interface Window {
    EvolveBackground?: {
      mount(host: Element, options?: { motion?: boolean; speed?: number; fps?: number }): EvolveController;
    };
  }
}

/** Fixed Evolve plate behind the full AIOps page. */
export default function EvolveField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EvolveController | null>(null);
  const readyFired = useRef(false);
  const readyTimer = useRef<number | null>(null);

  const releaseIntro = useCallback(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    window.dispatchEvent(new Event('gift:logo-ready'));
  }, []);

  const mountBackground = useCallback(() => {
    const host = hostRef.current;
    const api = window.EvolveBackground;
    if (!host || !api || controllerRef.current) return;

    controllerRef.current = api.mount(host, { motion: true, speed: 1, fps: 60 });
    // The still fallback is already visible while WebGL finishes mounting.
    readyTimer.current = window.setTimeout(releaseIntro, 180);
  }, [releaseIntro]);

  useEffect(() => {
    mountBackground();
    const cap = window.setTimeout(releaseIntro, 2200);
    return () => {
      window.clearTimeout(cap);
      if (readyTimer.current) window.clearTimeout(readyTimer.current);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [mountBackground, releaseIntro]);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    setFieldController({
      setScene: () => {},
      setVeil: (progress) => {
        const value = Math.min(1, Math.max(0, progress));
        veil.style.opacity = (value * 0.72).toFixed(3);
      },
      // Keep the writing-first treatment through the CTA as well.
      setCta: () => {},
    });

    return () => setFieldController(null);
  }, []);

  return (
    <>
      <Script src="/evolve-hero/background.js" strategy="afterInteractive" onReady={mountBackground} />
      <div ref={hostRef} className="ao-field evolve-background" aria-hidden>
        <div ref={veilRef} className="ao-evolve-veil" />
      </div>
    </>
  );
}
