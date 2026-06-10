'use client';
import { useEffect, useRef } from 'react';

export default function GiftIncEcho() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      // 0 = element entering, 1 = merged (completes at ~70% down the viewport)
      const raw = (vh - center) / (vh * 0.3);
      const progress = Math.max(0, Math.min(1, raw));
      el.style.setProperty('--ep', progress.toFixed(3));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.visible = 'true';
        else delete el.dataset.visible;
      },
      { threshold: 0.05 },
    );

    window.addEventListener('scroll', onScroll, { passive: true });
    io.observe(el);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="gift-echo-wrap font-display">
      <span aria-hidden className="gift-echo-copy gift-echo-copy--1">GIFT INC.</span>
      <span aria-hidden className="gift-echo-copy gift-echo-copy--2">GIFT INC.</span>
      <span aria-hidden className="gift-echo-copy gift-echo-copy--3">GIFT INC.</span>
      <span className="gift-echo-main">GIFT INC.</span>
    </div>
  );
}
