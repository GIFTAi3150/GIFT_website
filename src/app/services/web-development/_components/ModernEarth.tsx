'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { EarthScene } from './createEarthScene';
import styles from './ModernEarth.module.css';

export default function ModernEarth() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const hero = root?.closest<HTMLElement>('[data-time-travel]');
    if (!root || !canvas || !hero) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    let scene: EarthScene | undefined;
    let disposed = false;
    let loading = false;
    let failed = false;
    let inView = false;

    const sync = () => {
      const active =
        inView && hero.dataset.era === 'modern' && !document.hidden && !motion.matches && !failed;
      scene?.setActive(active);
      if (!active || scene || loading || failed || connection?.saveData) return;
      loading = true;
      // This chunk (including Three.js) is requested only when the modern preview is visible.
      import('./createEarthScene')
        .then(({ createEarthScene }) =>
          disposed
            ? undefined
            : createEarthScene(canvas, () => {
                failed = true;
                setReady(false);
                scene?.setActive(false);
              }),
        )
        .then((created) => {
          if (!created) return;
          if (disposed) {
            created.dispose();
            return;
          }
          scene = created;
          setReady(!failed);
          sync();
        })
        .catch(() => {
          failed = true;
          if (!disposed) setReady(false);
        })
        .finally(() => {
          loading = false;
        });
    };
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    const era = new MutationObserver(sync);
    intersection.observe(root);
    era.observe(hero, { attributes: true, attributeFilter: ['data-era'] });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      disposed = true;
      intersection.disconnect();
      era.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      scene?.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.earth} data-earth-ready={ready} aria-hidden="true">
      <span className={styles.label}>A WORLD OF POSSIBILITIES</span>
      <div className={styles.artwork}>
        <Image
          className={styles.poster}
          src="/models/earth/poster-web.webp?v=424374d6fc"
          alt=""
          width={800}
          height={800}
          unoptimized
        />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <span className={styles.caption}>
        You dream it.
        <br />
        <em>We build it.</em>
      </span>
    </div>
  );
}
