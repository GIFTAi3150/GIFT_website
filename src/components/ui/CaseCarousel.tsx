'use client';

import { useState } from 'react';

interface CasePoint {
  heading: string;
  body: string;
}

interface CaseStudy {
  num: string;
  title: string;
  description: string;
  image?: string;
  points: CasePoint[];
}

export default function CaseCarousel({ cases }: { cases: CaseStudy[] }) {
  const [current, setCurrent] = useState(0);
  const total = cases.length;

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  const cs = cases[current];

  const arrowBtn =
    'z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gift-border bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-200 hover:border-gift-green hover:bg-white hover:shadow-xl active:scale-95';

  return (
    <div className="relative">
      {/* Side arrows — all screen sizes */}
      <button
        onClick={prev}
        aria-label="前の事例"
        className={`${arrowBtn} absolute left-2 top-1/3 -translate-y-1/2 lg:-left-6`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="次の事例"
        className={`${arrowBtn} absolute right-2 top-1/3 -translate-y-1/2 lg:-right-6`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-gift-border bg-white">
        {/* Image */}
        {cs.image && (
          <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cs.image}
              alt={cs.title}
              className="h-full w-full object-cover brightness-[0.85] transition-all duration-700"
            />
            {/* Overlay with title */}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 md:p-8">
              <h3 className="font-sans text-[18px] font-bold text-white md:text-[22px]">
                {cs.title}
              </h3>
            </div>
          </div>
        )}

        {/* Text-only header if no image */}
        {!cs.image && (
          <div className="border-b border-gift-border bg-gift-bg-alt px-6 py-5 md:px-8">
            <h3 className="font-sans text-[18px] font-bold text-gift-ink md:text-[20px]">
              {cs.title}
            </h3>
          </div>
        )}

        <div className="px-6 py-7 md:px-8">
          {/* Overview */}
          <div className="mb-6 rounded-xl bg-gift-bg-alt px-5 py-4">
            <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
              概要
            </p>
            <p className="font-sans text-[15px] leading-relaxed text-gift-silver">
              {cs.description}
            </p>
          </div>

          {/* Detail points */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cs.points.map((pt) => (
              <div key={pt.heading}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gift-green" />
                  <h4 className="font-sans text-[15px] font-bold text-gift-ink">{pt.heading}</h4>
                </div>
                <p className="font-sans text-[15px] leading-relaxed text-gift-silver">
                  {pt.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom navigation — dots + mobile arrows */}
      <div className="mt-6 flex items-center justify-center gap-6">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {cases.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`事例 ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-gift-green'
                  : 'w-2.5 bg-gift-grey-light hover:bg-gift-green/40'
              }`}
            />
          ))}
        </div>

      </div>

      {/* Counter */}
      <p className="mt-3 text-center font-display text-[13px] tracking-widest text-gift-silver">
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
    </div>
  );
}
