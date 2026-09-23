'use client';

import { useEffect, useRef } from 'react';
import styles from './WkHeroLogo.module.css';

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
      <svg className={styles.ribbon} viewBox="0 0 600 420" fill="none">
        <defs>
          <linearGradient
            id="works-ribbon-blue"
            x1="92"
            y1="322"
            x2="483"
            y2="98"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#345ddd" stopOpacity="0.15" />
            <stop offset="0.34" stopColor="#648fff" />
            <stop offset="0.6" stopColor="#d5e9ff" />
            <stop offset="0.82" stopColor="#6b9bff" />
            <stop offset="1" stopColor="#4067c8" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient
            id="works-ribbon-light"
            x1="137"
            y1="83"
            x2="459"
            y2="348"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#769eff" stopOpacity="0.1" />
            <stop offset="0.38" stopColor="#afd6ff" />
            <stop offset="0.62" stopColor="#fff" />
            <stop offset="1" stopColor="#668eff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <g className={styles.ribbonBack}>
          {Array.from({ length: 17 }, (_, index) => (
            <path
              key={index}
              d={`M ${84 + index * 2} ${293 + index * 3} C ${64 + index * 3} ${128 + index * 3}, ${418 - index * 2} ${31 + index * 3}, ${482 - index * 2} ${149 + index * 3} C ${561 - index * 3} ${294 - index * 3}, ${207 + index * 2} ${391 - index * 3}, ${127 + index * 2} ${270 - index * 2}`}
              stroke="url(#works-ribbon-blue)"
              strokeWidth="1.25"
            />
          ))}
        </g>
        <g className={styles.ribbonFront}>
          {Array.from({ length: 17 }, (_, index) => (
            <path
              key={index}
              d={`M ${148 + index * 3} ${78 + index} C ${458 - index * 3} ${49 + index * 2}, ${554 - index * 3} ${312 - index * 2}, ${390 - index * 2} ${348 - index * 2} C ${184 + index * 3} ${397 - index * 3}, ${72 + index * 3} ${123 + index * 2}, ${232 + index} ${98 + index * 2}`}
              stroke="url(#works-ribbon-light)"
              strokeWidth="1.1"
            />
          ))}
        </g>
      </svg>
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
  );
}
