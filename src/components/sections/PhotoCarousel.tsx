'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const slides = [
  { src: '/img/1.jpg', en: 'CALL CENTER', ja: 'コールセンターの現場' },
  { src: '/img/3.jpg', en: 'LINE OPS',    ja: 'LINE公式アカウント運用' },
  { src: '/img/4.jpg', en: 'AUTOMATION',  ja: 'RPAで自動化' },
  { src: '/img/5.jpg', en: 'REAL ESTATE', ja: '不動産事業' },
  { src: '/img/6.jpg', en: 'TEAM',        ja: 'チームの日常' },
  { src: '/img/7.jpg', en: 'OFFICE',      ja: 'オフィスにて' },
  { src: '/img/8.jpg', en: 'CULTURE',     ja: 'GIFTのカルチャー' },
];

const AUTOPLAY_MS = 5000;

export default function PhotoCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const go = useCallback((next: number) => {
    setIndex(((next % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (hovered) return;
    timerRef.current = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index, hovered, go]);

  return (
    <section className="bg-gift-near-black py-s-80 overflow-hidden">
      <div className="max-w-container mx-auto px-4 mb-10">
        <p className="font-display text-gift-green uppercase tracking-widest text-small mb-3">
          OUR WORK
        </p>
        <h2
          className="font-sans font-extrabold text-white mb-2"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          現場から
        </h2>
        <p className="font-sans font-light text-gift-silver text-normal">
          GIFTの日常と、その先にある未来。
        </p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${index} * (min(72vw, 640px) + 16px) + min(14vw, 112px)))`,
            }}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.src}
                className="relative shrink-0 overflow-hidden cursor-pointer"
                style={{
                  width: 'min(72vw, 640px)',
                  aspectRatio: '4 / 3',
                }}
                onClick={() => go(i)}
              >
                <Image
                  src={slide.src}
                  alt={`${slide.en} — ${slide.ja}`}
                  fill
                  sizes="(max-width: 640px) 90vw, 640px"
                  className={`object-cover transition-[filter] duration-300 ${
                    i === index ? 'brightness-100' : 'brightness-75'
                  } hover:brightness-100`}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-display uppercase tracking-widest text-white text-small leading-tight">
                    {slide.en}
                  </p>
                  <p className="font-sans font-light text-white/80 text-small leading-snug">
                    {slide.ja}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gift-mid-dark hover:bg-gift-green flex items-center justify-center transition-colors duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M13 4L7 10L13 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gift-mid-dark hover:bg-gift-green flex items-center justify-center transition-colors duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 4L13 10L7 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'bg-gift-green w-6'
                : 'bg-white/30 w-2'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
