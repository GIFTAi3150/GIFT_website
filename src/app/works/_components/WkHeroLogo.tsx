'use client';

import { useEffect, useRef } from 'react';
import styles from './WkHeroLogo.module.css';

const RING_LINES = 14;

// One orbit: a band of concentric hairlines, a dashed track, and a bright
// comet arc. The gradient and the arc break the circle's symmetry so the spin
// is readable even at a glance.
function OrbitRing({ id }: { id: string }) {
  return (
    <svg className={styles.ringArt} viewBox="0 0 400 400" fill="none" focusable="false">
      <defs>
        <linearGradient id={`${id}-band`} x1="0" y1="200" x2="400" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#070f3d" />
          <stop offset="0.45" stopColor="#0f2280" />
          <stop offset="0.75" stopColor="#2a4fe0" />
          <stop offset="1" stopColor="#070f3d" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id}-band)`}>
        {Array.from({ length: RING_LINES }, (_, index) => (
          <circle
            key={index}
            cx="200"
            cy="200"
            r={186 - index * 3.2}
            strokeWidth={index % 4 === 0 ? 2.2 : 1.4}
            strokeOpacity={1 - index * 0.025}
          />
        ))}
      </g>
      <circle
        cx="200"
        cy="200"
        r="146"
        stroke="#0f2280"
        strokeWidth="1.6"
        strokeDasharray="2 7"
      />
      <circle
        className={styles.comet}
        cx="200"
        cy="200"
        r="190"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="90 1104"
      />
    </svg>
  );
}

export default function WkHeroLogo() {
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual || !('IntersectionObserver' in window)) return;
    let visible = false;
    const sync = () => {
      visual.dataset.moving = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(visual);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={visualRef} className={styles.visual} data-works-hero-logo aria-hidden="true">
      {/* A 3D stage: the rings cut through the wordmark's plane, so each orbit
          passes in front of GIFT on its near side and behind it on the far side. */}
      <div className={styles.stage}>
        <div className={`${styles.ring} ${styles.ringA}`}>
          <div className={styles.ringSpin}>
            <OrbitRing id="works-orbit-a" />
          </div>
        </div>
        <div className={`${styles.ring} ${styles.ringB}`}>
          <div className={styles.ringSpin}>
            <OrbitRing id="works-orbit-b" />
          </div>
        </div>
        {/* Poppins Bold outlines with the existing -0.055em tracking. Keeping the
            logo as geometry avoids a wider fallback font during a cold load. */}
        <svg
          className={styles.visualWord}
          data-works-gift-wordmark
          viewBox="33 -710 1973 715"
          fill="currentColor"
          focusable="false"
        >
          <path d="M717-480L528-480Q509-515 473.50-533.50Q438-552 390-552L390-552Q307-552 257-497.50Q207-443 207-352L207-352Q207-255 259.50-200.50Q312-146 404-146L404-146Q467-146 510.50-178Q554-210 574-270L574-270L357-270L357-396L729-396L729-237Q710-173 664.50-118Q619-63 549-29Q479 5 391 5L391 5Q287 5 205.50-40.50Q124-86 78.50-167Q33-248 33-352L33-352Q33-456 78.50-537.50Q124-619 205-664.50Q286-710 390-710L390-710Q516-710 602.50-649Q689-588 717-480L717-480ZM769-702L940-702L940 0L769 0L769-702ZM1009-702L1466-702L1466-565L1180-565L1180-417L1394-417L1394-284L1180-284L1180 0L1009 0L1009-702ZM1463-702L2006-702L2006-565L1820-565L1820 0L1649 0L1649-565L1463-565L1463-702Z" />
        </svg>
      </div>
    </div>
  );
}
