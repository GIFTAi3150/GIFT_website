'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// TODO: swap src + name + role with real team data
const team = [
  { src: '/img/1.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/3.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/4.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/5.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/6.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/7.jpg', name: 'Name Here', role: '役職' },
  { src: '/img/8.jpg', name: 'Name Here', role: '役職' },
];

// Duplicate so the scroll loops seamlessly — the animation slides -50%
// which is exactly one copy of the list.
const marquee = [...team, ...team];

export default function PhotoCarousel({ showCta = false }: { showCta?: boolean }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused) return;
    const t = setTimeout(() => setPaused(false), 3000);
    return () => clearTimeout(t);
  }, [paused]);

  const handleClick = () => {
    if (paused) return; // ignore clicks while already paused
    setPaused(true);
  };

  return (
    <section className="overflow-hidden bg-gift-near-black py-s-80">
      <div className="mx-auto mb-10 max-w-container px-4">
        <p className="mb-3 font-display text-small uppercase tracking-widest text-gift-green">
          MEMBERS
        </p>
        <h2
          className="mb-2 font-sans font-extrabold text-gift-ink"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          GIFTのメンバー
        </h2>
        <p className="font-sans text-normal font-light text-gift-silver">
          一人ひとりが、GIFTをつくっている。
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div
          onClick={handleClick}
          className={`flex w-max animate-marquee cursor-pointer gap-4 ${paused ? '[animation-play-state:paused]' : ''}`}
        >
          {marquee.map((member, i) => (
            <div
              key={`${member.src}-${i}`}
              className="relative shrink-0 overflow-hidden rounded-2xl"
              style={{
                width: 'min(60vw, 480px)',
                aspectRatio: '4 / 3',
              }}
            >
              <Image
                src={member.src}
                alt={`${member.name} — ${member.role}`}
                fill
                sizes="(max-width: 640px) 60vw, 480px"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)',
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-normal uppercase leading-tight tracking-widest text-gift-ink">
                  {member.name}
                </p>
                <p className="font-sans text-small font-light leading-snug text-gift-ink/80">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCta && (
      <div className="mt-12 flex justify-center px-4">
        <Link
          href="/member"
          className="group inline-flex items-center gap-3 rounded-full border border-gift-border bg-white px-10 py-4 font-sans text-normal font-medium text-gift-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-hover hover:bg-gift-hover hover:shadow-[0_10px_30px_rgba(0,86,51,0.45)] active:scale-95 active:border-gift-hover-dark active:bg-gift-hover-dark"
        >
          チームを見る
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      )}
    </section>
  );
}
