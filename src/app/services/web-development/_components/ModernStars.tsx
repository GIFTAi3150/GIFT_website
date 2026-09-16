'use client';

import { useEffect, useRef } from 'react';
import styles from './ModernStars.module.css';

export default function ModernStars() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.closest<HTMLElement>('[data-time-travel]');
    if (!root || !hero) return;
    let visible = false;
    const sync = () => {
      root.dataset.active = String(visible && hero.dataset.era === 'modern' && !document.hidden);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const era = new MutationObserver(sync);
    intersection.observe(root);
    era.observe(hero, { attributes: true, attributeFilter: ['data-era'] });
    document.addEventListener('visibilitychange', sync);
    return () => {
      intersection.disconnect();
      era.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.stars} data-active="false" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}
