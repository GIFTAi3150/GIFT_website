'use client';

import Link from 'next/link';

const PLACEHOLDER_VIDEOS = [
  '/video/cc-vid.mp4',
  '/video/aiops-vid.mp4',
  '/video/financial-consulting-vid.mp4',
];

const CARD_W = 200;
const CARD_GAP = 20;

export interface MemberPreviewCard {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  video?: string;
}

export default function MembersPreview({ members }: { members: MemberPreviewCard[] }) {
  return (
    <section className="relative bg-[#060A18] overflow-hidden">
      {/* ── Header ── */}
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8 pt-24 md:pt-32 pb-14 md:pb-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
              Members
            </p>
            <h2
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', lineHeight: 1.0 }}
            >
              Our People.
            </h2>
          </div>
          <Link
            href="/member"
            className="group hidden items-center gap-2 font-sans text-sm font-medium text-[#2563EB] transition-opacity hover:opacity-70 md:flex"
          >
            チームを見る
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* ── Horizontal scroll strip (native, single-pass) ── */}
      <div
        className="relative overflow-x-auto overflow-y-hidden no-scrollbar"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="flex items-center px-4 md:px-6 lg:px-8"
          style={{ gap: CARD_GAP, width: 'max-content' }}
        >
          {members.map((m, i) => {
            const src = m.video ?? PLACEHOLDER_VIDEOS[i % PLACEHOLDER_VIDEOS.length];
            return (
              <Link
                key={m.id}
                href={`/member/${m.id}`}
                className="relative flex-none overflow-hidden rounded-2xl"
                style={{
                  width: CARD_W,
                  height: 280,
                  scrollSnapAlign: 'start',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.55)',
                }}
              >
                <video
                  src={src}
                  poster={m.image}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-[9px] font-bold uppercase tracking-widest text-[#2563EB] mb-0.5">
                    {m.department}
                  </p>
                  <p className="font-sans text-sm font-bold leading-tight text-white">
                    {m.name}
                  </p>
                  <p className="font-sans text-[11px] text-white/55">{m.role}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── CTA (mobile) ── */}
      <div className="flex justify-center pt-10 pb-16 md:pb-24 md:hidden">
        <Link
          href="/member"
          className="group flex items-center gap-2 rounded-full border border-[#25D366] px-6 py-3 font-sans text-sm font-medium text-[#2563EB] transition-colors duration-200 hover:bg-[#25D366] hover:text-[#111B21]"
        >
          チームを見る
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      <div className="hidden md:block pb-24" />
    </section>
  );
}

