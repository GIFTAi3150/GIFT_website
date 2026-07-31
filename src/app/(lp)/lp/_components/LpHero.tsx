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
    const video = videoRef.current;
    if (!video) return;

    // ⚠️ BOTH LINES BELOW ARE LOAD-BEARING. Without them the hero shows the
    // poster and nothing ever moves — which is exactly how this shipped first.
    //
    // 1. React does not reliably reflect the `muted` PROP onto the DOM
    //    property on the initial render. When it doesn't land, the browser
    //    sees an UNMUTED autoplay video and blocks playback outright, with no
    //    error anywhere. Setting it imperatively is the standard workaround.
    video.muted = true;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      const reduce = mql.matches;
      setReducedMotion(reduce);
      if (reduce) {
        video.pause();
        return;
      }

      // 2. `canplay` can fire BEFORE hydration attaches the React onCanPlay
      //    handler — trivially so once the file is in the browser cache. In
      //    that case the event is simply lost, `videoReady` never flips, and
      //    the video plays perfectly at opacity 0 behind the poster. Reading
      //    readyState covers the event we may already have missed.
      //    3 = HAVE_FUTURE_DATA.
      if (video.readyState >= 3) setVideoReady(true);

      // Explicit play(): the autoPlay attribute alone is unreliable once a
      // client component hydrates, and the returned promise is the only way
      // to find out the browser refused.
      void video.play().catch(() => {
        // Refused (iOS low-power mode, battery saver, strict data settings).
        // The poster stays up, which is the intended fallback — not an error
        // worth surfacing to the visitor.
      });
    };

    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  return (
    <section className="lp-hero" aria-label="AIエージェントLP ファーストビュー">
      {/* The film gets its own box at its own aspect ratio, rather than being
          stretched behind the whole hero. The CM has burned-in text at the
          right edge — cropping it to fill the viewport cuts the punchline off.
          See the block comment on .lp-hero in lp.css. */}
      <div className="lp-hero-media">
        {/* LCP element. A real next/image (not the <video poster> attribute,
            which next/image can't optimise) so a slow connection shows a
            sharp, correctly-sized still instead of a black box. */}
        <Image
          src={hero.poster}
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 1100px"
          className="lp-hero-poster"
        />
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
      </div>
      <div className="lp-hero-copy">
        <h1>{hero.h1}</h1>
        <p>{hero.sub}</p>
      </div>
      <div className="lp-scroll">SCROLL</div>
    </section>
  );
}
