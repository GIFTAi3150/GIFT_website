'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Press_Start_2P } from 'next/font/google';

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const PLACEHOLDER_VIDEOS = [
  '/video/cc-vid.mp4',
  '/video/aiops-vid.mp4',
  '/video/financial-consulting-vid.mp4',
];

export interface OtherMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  video?: string;
}

export default function OtherMembersGrid({
  members,
  fromFilter,
}: {
  members: OtherMember[];
  fromFilter: string;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.videoidx);
          const v = videoRefs.current[idx];
          if (!v) return;
          if (entry.isIntersecting) {
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.15 },
    );
    gridRef.current
      .querySelectorAll<HTMLElement>('[data-videoidx]')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [members]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-x-4 gap-y-24 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-7 lg:gap-y-32"
    >
      {members.map((m, i) => {
        const video = m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
        return (
          <Link
            key={m.id}
            href={`/member/${m.id}?from=${encodeURIComponent(fromFilter)}`}
            data-videoidx={i}
            className="group relative block"
          >
            {/* Pixel "HELLO" floating above card on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 mb-3 flex translate-y-2 justify-center opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-active:translate-y-0 group-active:opacity-100">
              <p
                className={`${pressStart.className} whitespace-nowrap leading-none text-[#D96B43]`}
                style={{
                  fontSize: 'clamp(12px, 1.8vw, 28px)',
                  textShadow: '4px 4px 0 #06D6A0',
                }}
              >
                HELLO
              </p>
            </div>

            {/* Video tile */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#EBE3D2]">
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={video}
                poster={m.image}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
              />
            </div>

            {/* Caption */}
            <div className="px-1 pb-1 pt-4">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[#D96B43]">
                {m.department}
              </p>

              <div
                className="mt-2 grid overflow-hidden leading-tight text-[#2A2520]"
                style={{ gridTemplateAreas: '"name"', minHeight: 'clamp(20px, 2.4vw, 28px)' }}
              >
                <p
                  className="font-sans font-extrabold transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full"
                  style={{ gridArea: 'name', fontSize: 'clamp(13px, 1.4vw, 17px)' }}
                >
                  {m.name}
                </p>
                <p
                  className="translate-y-full font-sans font-extrabold transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                  style={{ gridArea: 'name', fontSize: 'clamp(17px, 2vw, 24px)', letterSpacing: '-0.01em' }}
                >
                  {m.name}
                </p>
              </div>

              <div
                className="mt-1 grid overflow-hidden text-[#8A7E72]"
                style={{ gridTemplateAreas: '"role"', minHeight: '1.4em' }}
              >
                <p
                  className="font-sans text-xs font-light transition-transform duration-[700ms] [transition-delay:80ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full"
                  style={{ gridArea: 'role' }}
                >
                  {m.role}
                </p>
                <p
                  className="translate-y-full font-sans text-xs font-medium text-[#2A2520] transition-transform duration-[700ms] [transition-delay:80ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                  style={{ gridArea: 'role' }}
                >
                  {m.role}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

