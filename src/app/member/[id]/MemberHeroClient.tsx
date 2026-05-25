'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  memberVideo: string;
  memberImage: string;
  memberId: string;
  prevHref: string | null;
  prevName: string | null;
  nextHref: string | null;
  nextName: string | null;
}

export default function MemberHeroClient({
  memberVideo,
  memberImage,
  memberId,
  prevHref,
  prevName,
  nextHref,
  nextName,
}: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const navigating = useRef(false);

  // Fade in on every mount (new member page)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [memberId]);

  function navigate(href: string) {
    if (navigating.current) return;
    navigating.current = true;
    setVisible(false);
    setTimeout(() => router.push(href), 180);
  }

  return (
    <div
      className="relative h-[60vh] min-h-[460px] w-full overflow-hidden bg-gift-near-black"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      <video
        key={memberId}
        src={memberVideo}
        poster={memberImage}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="h-full w-full object-cover object-center"
      />

      {prevHref ? (
        <button
          onClick={() => navigate(prevHref)}
          aria-label={`前のメンバー: ${prevName}`}
          className="member-nav-arrow member-nav-arrow--left"
          type="button"
        >
          <span aria-hidden>←</span>
        </button>
      ) : (
        <span aria-hidden className="member-nav-arrow member-nav-arrow--left member-nav-arrow--disabled">
          ←
        </span>
      )}

      {nextHref ? (
        <button
          onClick={() => navigate(nextHref)}
          aria-label={`次のメンバー: ${nextName}`}
          className="member-nav-arrow member-nav-arrow--right"
          type="button"
        >
          <span aria-hidden>→</span>
        </button>
      ) : (
        <span aria-hidden className="member-nav-arrow member-nav-arrow--right member-nav-arrow--disabled">
          →
        </span>
      )}
    </div>
  );
}
