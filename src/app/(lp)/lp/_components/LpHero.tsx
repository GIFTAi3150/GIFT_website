'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LpVariant } from '@/data/lp-variants';

type LpHeroProps = {
  hero: LpVariant['hero'];
};

// Full-bleed video hero. The <section> is exactly the film's own box — the film
// runs edge to edge at its native ratio and is NEVER cropped (see the block
// comment on .lp-hero in lp.css), and the headline sits ON the film rather than
// in a black band under it. The height comes from .lp-hero-media's aspect-ratio;
// this component only handles the poster/video crossfade and the reduced-motion
// gate.
export default function LpHero({ hero }: LpHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Sound starts OFF and can only ever be turned on by a click. This is not a
  // preference — every browser refuses to autoplay a video with audio, so a
  // hero that arrives already making noise simply would not play at all.
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    setSoundOn(next);
    // Unmuting is a user gesture, so this is also the one moment we are
    // allowed to start playback if the browser refused it earlier (iOS
    // low-power mode being the common case).
    if (next) void video.play().catch(() => {});
  };

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
      {/* Legibility scrim for the overlaid copy. A real element rather than a
          pseudo-element because LpMotion fades it out on scroll — the copy is
          what it exists for, so it leaves when the copy leaves and hands the
          frame back clean. Geometry and the reason it stops before the right
          edge: .lp-hero-scrim in lp.css. */}
      <div className="lp-hero-scrim" aria-hidden="true" />
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

        {/* Sound toggle. Sits ON the film, BOTTOM-left. Left because the CM's
            burned-in caption runs down the right edge; bottom because a control
            parked at the top of a film reads as a watermark and gets missed
            (tried top-left 2026-08-05, rejected same day). The headline shares
            that corner and yields to it — see .lp-sound in lp.css.
            Labelled in Japanese rather than a bare speaker glyph — a lone icon reads as
            decoration and gets ignored, and the whole point is that people
            notice they can turn the sound on. */}
        <button
          type="button"
          className="lp-sound"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? '動画の音声をオフにする' : '動画の音声をオンにする'}
        >
          <span className="lp-sound-icon" aria-hidden="true">
            {soundOn ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a6.8 6.8 0 0 1 0 13.4v2.1a8.9 8.9 0 0 0 0-17.6z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 9v6h4l5 4V5L7 9H3zm18.2-.8-1.4-1.4L17 9.6l-2.8-2.8-1.4 1.4L15.6 11l-2.8 2.8 1.4 1.4L17 12.4l2.8 2.8 1.4-1.4L18.4 11l2.8-2.8z" />
              </svg>
            )}
          </span>
          {soundOn ? '音声オフ' : '音声オン'}
        </button>
      </div>
      <div className="lp-hero-copy">
        <h1>{hero.h1}</h1>
        <p>{hero.sub}</p>
      </div>
      <div className="lp-scroll">SCROLL</div>
    </section>
  );
}
