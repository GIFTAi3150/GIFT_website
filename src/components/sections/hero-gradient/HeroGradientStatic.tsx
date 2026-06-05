'use client';

import { useEffect, useRef } from 'react';

interface Props { className?: string; }

export default function HeroGradientStatic({ className }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const onMove = (e: PointerEvent) => {
      if (!divRef.current) return;
      divRef.current.style.setProperty('--mx', `${(e.clientX / window.innerWidth) * 100}%`);
      divRef.current.style.setProperty('--my', `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div
      ref={divRef}
      className={className}
      aria-hidden
      style={
        {
          '--mx': '50%',
          '--my': '35%',
          background: `
            radial-gradient(ellipse 60% 50% at var(--mx) var(--my), #7c7ae055 0%, transparent 70%),
            linear-gradient(180deg, #3d44c2 0%, #232a8f 48%, #0b1020 100%)
          `,
        } as React.CSSProperties
      }
    />
  );
}
