'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PixelRobot from '@/components/ui/PixelRobot';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/video/dx-consulting/how-we-work.mp4';

export default function ProcessFlow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const smallWrapperRef = useRef<HTMLDivElement | null>(null);
  const bigWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const target = videoRef.current;
    const small = smallWrapperRef.current;
    const big = bigWrapperRef.current;
    if (!section || !target || !small || !big) return;

    // Compute the video's position+size as a linear interpolation
    // between the small wrapper's bounding rect and the big wrapper's
    // bounding rect. Coordinates are relative to the section (the
    // video's nearest positioned ancestor), so the video stays
    // anchored as the page scrolls while we update progress.
    const applyAt = (progress: number) => {
      const sectionRect = section.getBoundingClientRect();
      const s = small.getBoundingClientRect();
      const b = big.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, progress));
      const top = (s.top - sectionRect.top) + (b.top - s.top) * t;
      const left = (s.left - sectionRect.left) + (b.left - s.left) * t;
      const width = s.width + (b.width - s.width) * t;
      const height = s.height + (b.height - s.height) * t;
      target.style.top = `${top}px`;
      target.style.left = `${left}px`;
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
    };

    // ScrollTrigger drives `progress` from 0→1 as the small wrapper's
    // center crosses the viewport center toward the big wrapper's
    // center. No tween, no scrub — we just listen to onUpdate and
    // interpolate manually for full control.
    const trigger = ScrollTrigger.create({
      trigger: small,
      start: 'center center',
      endTrigger: big,
      end: 'center center',
      invalidateOnRefresh: true,
      onUpdate: (self) => applyAt(self.progress),
      onRefresh: (self) => applyAt(self.progress),
    });

    // First paint — apply with the trigger's initial progress (usually
    // 0, but could be 1 if the user lands on the page already scrolled
    // past the section).
    applyAt(trigger.progress);

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden border-t border-gift-border bg-white py-s-80"
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        {/* Header — centered for the stacked layout. */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
            HOW WE WORK
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
          >
            ご依頼の流れ
          </h2>
          <PixelRobot className="h-16 w-16 text-gift-green-teal sm:h-20 sm:w-20" />
        </div>

        {/* Wrapper #1 — EMPTY layout placeholder. The video sits over
            this box (not inside) so its size can grow past these bounds
            without being clipped. */}
        <div className="flex justify-center">
          <div
            ref={smallWrapperRef}
            className="h-[180px] w-full max-w-[320px]"
          />
        </div>

        {/* Spacer — scroll distance budget for the morph. Increase
            this if the morph feels too quick. */}
        <div aria-hidden className="h-[15vh]" />

        {/* Wrapper #2 — EMPTY layout placeholder for the big waypoint.
            Capped width keeps the aspect-video block compact so the
            section doesn't dominate the page on wide desktops. */}
        <div
          ref={bigWrapperRef}
          className="mx-auto aspect-video w-full max-w-[680px]"
        />

        {/* CTA — centered Japanese line "GIFTで一緒に [働く]" where
            "働く" itself is the button that links to /recruit. Sits
            below the big wrapper in document flow; by the time it
            scrolls into view the morph is locked at progress=1, so
            the video never overlaps this block. */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 text-center font-sans font-extrabold text-gift-ink"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.1', letterSpacing: '0.02em' }}
        >
          <span>GIFTで一緒に</span>
          <a
            href="/recruit"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gift-green px-4 py-2 text-white shadow-md transition-transform duration-[400ms] ease-out hover:scale-[1.04]"
            style={{ fontSize: 'inherit', lineHeight: '1.1' }}
          >
            {/* Osmo-style color sweep — a dark overlay grows from the
                LEFT edge across the pill on hover. Uses scale-x with
                origin-left so there's no "edge" sliding past, just a
                clean horizontal fill. Sits above the green base but
                below the text spans so labels stay readable. */}
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 bg-gift-ink transition-transform duration-[500ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
            />

            {/* Invisible ghost text — sets the button width to fit
                whichever of the two labels is wider, so the swap
                animation doesn't reflow the line. */}
            <span aria-hidden className="invisible">働く</span>

            {/* Default label — slides UP and out on hover. */}
            <span className="absolute inset-0 z-10 flex items-center justify-center transition-transform duration-[450ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:-translate-y-full">
              働く
            </span>

            {/* Hover label — starts BELOW the button, slides in to
                replace the default. */}
            <span className="absolute inset-0 z-10 flex translate-y-full items-center justify-center transition-transform duration-[450ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-0">
              😊
            </span>
          </a>
        </div>
      </div>

      {/* Target video — direct child of <section> so its absolute
          positioning anchors to the section, not the padded inner
          container. Top/left/width/height are set from JS in `applyAt`
          on every scroll update. */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="rounded-2xl shadow-2xl"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          objectFit: 'cover',
        }}
      />
    </section>
  );
}
