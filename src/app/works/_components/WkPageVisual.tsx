'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createWorksHeroScene, type WorksHeroScene } from './createWorksHeroScene';
import styles from './WkPageVisual.module.css';

export default function WkPageVisual({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    setReady(false);

    let scene: WorksHeroScene | undefined;
    let disposed = false;
    let failed = false;
    let inView = true;
    let revealFrame = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      scene?.setActive(inView && !document.hidden && !failed);
    };
    const onMotionChange = () => scene?.setReducedMotion(motion.matches);
    const onFailure = () => {
      if (disposed) return;
      failed = true;
      root.dataset.worksVisualFailed = 'true';
      cancelAnimationFrame(revealFrame);
      if (!disposed) setReady(false);
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.01 },
    );
    observer.observe(root);
    sync();
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', onMotionChange);

    // Raw WebGL, bundled with the page: the first frame paints in this effect
    // instead of after a separate library download. Hero lettering is DOM SVG.
    try {
      scene = createWorksHeroScene(canvas, motion.matches, onFailure);
    } catch {
      onFailure();
    }
    if (!failed) {
      sync();
      // Fade in the first background frame without replacing the hero lettering.
      revealFrame = requestAnimationFrame(() => {
        if (disposed || failed) return;
        setReady(true);
      });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(revealFrame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', onMotionChange);
      scene?.dispose();
      delete root.dataset.worksVisualFailed;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.page} data-works-page data-ready={ready}>
      <canvas ref={canvasRef} className={styles.canvas} data-works-background aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
