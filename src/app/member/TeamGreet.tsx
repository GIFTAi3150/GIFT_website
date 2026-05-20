'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Press_Start_2P } from 'next/font/google';

// 8-bit pixel font for the "HELLO" greeting that floats over each
// tile. Loaded via next/font so the file is self-hosted, no FOUT.
const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

// Video grid in the neu-ad.jp/team style:
//   - 3 columns on desktop, 2 on tablet, 1 on mobile.
//   - Every tile is a looped muted color video — the video itself is
//     the "hello", a real person moving in their frame rather than a
//     static portrait.
//   - On hover: video scales up gently and the member's name swaps
//     from its small default size to a much larger size in place
//     (no layout shift — two text layers crossfade on the same row).
//
// Performance: videos use preload="none" (matches neu-ad) and only
// play when they enter the viewport via IntersectionObserver.
// Off-screen tiles are paused so a long team list doesn't keep N
// decoders running.

export interface MemberCard {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  video?: string;
}

const PLACEHOLDER_VIDEOS = [
  '/video/cc-vid.mp4',
  '/video/dx-consulting-vid.mp4',
  '/video/financial-consulting-vid.mp4',
];

// Same greeting for every tile. Pixel-style "HELLO" in Press Start 2P
// for an arcade-screen feel that contrasts with the photographic
// videos behind it.
const GREETING = 'HELLO';

export default function TeamGreet({ members }: { members: MemberCard[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // Each tile keeps its video looping the whole time it's on screen.
  // The IntersectionObserver only pauses videos that scroll off so we
  // don't keep N decoders running for tiles the user can't see.
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
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
    sectionRef.current
      .querySelectorAll<HTMLElement>('[data-idx]')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [members]);

  if (members.length === 0) {
    return (
      <section className="bg-[#F4EFE6] py-s-80">
        <p className="text-center font-sans text-normal text-[#6B5F52]">
          メンバー情報を読み込めませんでした。
        </p>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="bg-[#F4EFE6] py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-[#D96B43]">
            OUR TEAM
          </p>
          <h2
            className="font-sans font-extrabold text-[#2A2520]"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05 }}
          >
            MEET&nbsp;/&nbsp;OUR&nbsp;/&nbsp;TEAM
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-normal font-light text-[#6B5F52]">
            ホバーするとメンバーの名前が大きく表示されます。クリックすると詳細をご覧いただけます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-24 md:grid-cols-3 md:gap-x-6 md:gap-y-28 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-32">
          {members.map((m, i) => {
            const video =
              m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
            return (
            <Link
              key={m.id}
              href={`/member/${m.id}`}
              data-idx={i}
              className="group relative block"
            >
              {/* Pixel "HELLO" sitting ABOVE the card. Anchored to
                  the top edge with bottom-full so it floats outside
                  the rounded video frame entirely. On mobile (< md)
                  it's permanently visible — touch has no hover state.
                  On md+ it's hidden by default and reveals on hover
                  with a soft rise + fade. pointer-events-none so it
                  never blocks the click target. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 mb-3 flex justify-center opacity-100 transition-all duration-500 ease-out translate-y-0 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                {/* Risograph-style two-color print: terracotta HELLO
                    sits in front of a bright-teal offset clone. The
                    two are slightly off-register, mimicking a
                    misaligned silkscreen / risograph pass. Secondary
                    color #06D6A0 — high saturation, bright enough to
                    read as a confident ink against the warm cream
                    instead of disappearing into the page. Offset
                    bumped to 4px so the misregister is obvious at
                    every viewport size. */}
                <p
                  className={`${pressStart.className} whitespace-nowrap leading-none text-[#D96B43]`}
                  style={{
                    fontSize: 'clamp(18px, 3.4vw, 44px)',
                    textShadow: '4px 4px 0 #06D6A0',
                  }}
                >
                  {GREETING}
                </p>
              </div>

              {/* Looped color video — full saturation always, like
                  neu-ad. The video plays continuously while the tile
                  is on screen; hover never pauses, restarts, or
                  filters it. */}
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

              {/* Caption strip below the tile. Two-layer mask slide
                  for both the name and the role: the small default
                  copy translates UP and out of the masked frame
                  while the larger hover copy rises UP into view from
                  below. Custom cubic-bezier for an editorial expo
                  ease (slow start, fast finish, no spring), and a
                  small stagger so the name leads and the role
                  follows. */}
              <div className="px-1 pb-1 pt-4">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[#D96B43]">
                  {m.department}
                </p>

                {/* NAME — masked slide. The container is sized to the
                    LARGER copy so there's room for the hover state to
                    occupy. Both layers share one grid cell so the
                    sliding doesn't shift surrounding content. */}
                <div
                  className="mt-2 grid overflow-hidden leading-tight text-[#2A2520]"
                  style={{
                    gridTemplateAreas: '"name"',
                    minHeight: 'clamp(26px, 3.2vw, 36px)',
                  }}
                >
                  <p
                    className="font-sans font-extrabold transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full"
                    style={{
                      gridArea: 'name',
                      fontSize: 'clamp(18px, 2vw, 22px)',
                    }}
                  >
                    {m.name}
                  </p>
                  <p
                    className="translate-y-full font-sans font-extrabold transition-transform duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                    style={{
                      gridArea: 'name',
                      fontSize: 'clamp(26px, 3.2vw, 36px)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {m.name}
                  </p>
                </div>

                {/* ROLE — same masked slide, smaller delta. Slight
                    delay so the role enters after the name lands.
                    Default: warm gray. Hover: full warm ink. */}
                <div
                  className="mt-1 grid overflow-hidden text-[#8A7E72]"
                  style={{
                    gridTemplateAreas: '"role"',
                    minHeight: '1.4em',
                  }}
                >
                  <p
                    className="font-sans text-sm font-light transition-transform duration-[700ms] [transition-delay:80ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full"
                    style={{ gridArea: 'role' }}
                  >
                    {m.role}
                  </p>
                  <p
                    className="translate-y-full font-sans text-sm font-medium text-[#2A2520] transition-transform duration-[700ms] [transition-delay:80ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
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
      </div>
    </section>
  );
}
