'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number; // ms — stagger children by passing different delays
  className?: string;
  from?: 'bottom' | 'left' | 'right'; // entry direction (default: bottom)
}

export default function Reveal({ children, delay = 0, className = '', from = 'bottom' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // animate once, then stop watching
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    from === 'left' ? 'translateX(-40px)' :
    from === 'right' ? 'translateX(40px)' :
    'translateY(32px)';

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '600ms',
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        // Release the compositor hint once animation is done — keeping willChange
        // permanently on every section burns GPU layers for nothing.
        willChange: visible ? 'auto' : 'opacity, transform',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : hiddenTransform,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
