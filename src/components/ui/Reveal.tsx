'use client';

import { useEffect, useRef, useState, ReactNode, Ref } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number; // ms — stagger children by passing different delays
  className?: string;
  from?: 'bottom' | 'left' | 'right'; // entry direction (default: bottom)
  as?: 'div' | 'li'; // render tag — 'li' keeps list semantics valid inside <ol>/<ul>
}

export default function Reveal({ children, delay = 0, className = '', from = 'bottom', as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect the user's motion preference: skip the observer entirely and
    // show content in its final state with no transition, rather than just
    // shortening the animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      setVisible(true);
      return;
    }

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
    <Tag
      ref={ref as Ref<HTMLLIElement & HTMLDivElement>}
      style={{
        transitionDelay: reducedMotion ? '0ms' : `${delay}ms`,
        transitionDuration: reducedMotion ? '0ms' : '600ms',
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
    </Tag>
  );
}
