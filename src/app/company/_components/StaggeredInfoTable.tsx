'use client';
import { useEffect, useRef, useState } from 'react';

type Row = { label: string; value: string };

export default function StaggeredInfoTable({ rows }: { rows: Row[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <dl className="border-t border-gift-border">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-1 border-b border-gift-border py-5 sm:grid-cols-4 sm:gap-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(18px)',
              transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
            }}
          >
            <dt className="mb-1 font-display text-small uppercase tracking-widest text-[#7B2D26] sm:mb-0 sm:col-span-1">
              {row.label}
            </dt>
            <dd className="font-sans text-normal font-light text-gift-ink sm:col-span-3">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
