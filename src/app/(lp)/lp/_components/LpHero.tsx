'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LpVariant } from '@/data/lp-variants';

type LpHeroProps = {
  hero: LpVariant['hero'];
};

// Full-bleed 100dvh video hero — dvh, not vh/svh (standing rule on this
// project: svh under-fills once mobile browser chrome collapses). The dvh
// height itself lives in .lp-hero (lp.css); this component only handles the
// poster/video crossfade and the reduced-motion gate.
export default function LpHero({ hero }: LpHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // prefers-reduced-motion: reduce -> hold the poster, never actually play
  // the (muted, looping) background video. The <video> element still
  // renders either way so nothing shifts layout — it just stays invisible
  // and paused instead of fading in.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReducedMotion(mql.matches);
      if (mql.matches) videoRef.current?.pause();
    };
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  return (
    <section className="lp-hero" aria-label="AIエージェントLP ファーストビュー">
      {/* LCP element. A real next/image (not the <video poster> attribute,
          which next/image can't optimise) so a slow connection shows a
          sharp, correctly-sized still instead of a black box. */}
      <Image src={hero.poster} alt="" fill priority sizes="100vw" className="lp-hero-poster" />
      <video
        ref={videoRef}
        className="lp-hero-video"
        style={{ opacity: videoReady && !reducedMotion ? 1 : 0 }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden
      >
        <source src={hero.video} type="video/mp4" />
      </video>
      <div className="lp-hero-copy">
        <h1>{hero.h1}</h1>
        <p>{hero.sub}</p>
      </div>
      <div className="lp-scroll">SCROLL</div>
    </section>
  );
}
