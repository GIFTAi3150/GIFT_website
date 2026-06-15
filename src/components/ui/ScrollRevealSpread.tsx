'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export default function ScrollRevealSpread({
  children,
  className = '',
  minHeight = '140vh',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = el.querySelectorAll<HTMLElement>('.srs-w');
    if (!words.length) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate(self) {
        const p = Math.max(0, Math.min(1, (self.progress - 0.10) / 0.65));
        words.forEach((w, i) => {
          w.classList.toggle('srs-lit', p > (i + 0.2) / words.length);
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div ref={ref} className={`srs-spread ${className}`} style={{ minHeight }}>
      <div className="srs-stick">
        {children}
      </div>
    </div>
  );
}
