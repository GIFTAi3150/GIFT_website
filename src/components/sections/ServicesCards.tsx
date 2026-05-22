'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import services from '@/data/services.json';

// Osmo-style parallax slideshow. Each slide is a full-bleed service
// image with a left-side text panel. On transition, the outer slide
// translates 100% in one direction while its inner <img> translates 50%
// in the opposite direction — so within the slide's overflow:hidden
// frame, the image appears to move at half-speed, reading as depth.
// Navigation: click thumbnails, drag, or horizontal wheel/trackpad.
// Wraps around past the ends.

const TRANSITION_EASE = 'expo.inOut';
const TRANSITION_DURATION = 0.9;

export default function ServicesCards() {
  const wheelTargetRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const innersRef = useRef<(HTMLImageElement | null)[]>([]);
  const animatingRef = useRef(false);
  const currentRef = useRef(0);
  const [current, setCurrent] = useState(0);

  const total = services.length;

  const animateTo = (nextIdx: number, direction: 1 | -1) => {
    const cur = currentRef.current;
    if (animatingRef.current || nextIdx === cur) return;
    const outSlide = slidesRef.current[cur];
    const outInner = innersRef.current[cur];
    const inSlide = slidesRef.current[nextIdx];
    const inInner = innersRef.current[nextIdx];
    if (!outSlide || !outInner || !inSlide || !inInner) return;

    animatingRef.current = true;

    // Stage the incoming slide off-screen on the opposite side from where
    // the current is leaving, with its inner image pre-offset so it can
    // ease into 0 at half speed.
    gsap.set(inSlide, {
      opacity: 1,
      pointerEvents: 'auto',
      xPercent: direction * 100,
      zIndex: 2,
    });
    gsap.set(inInner, { xPercent: -direction * 50 });
    gsap.set(outSlide, { zIndex: 1 });

    gsap.timeline({
      defaults: { duration: TRANSITION_DURATION, ease: TRANSITION_EASE },
      onComplete: () => {
        // The outgoing slide is now off-screen — hide it and reset its
        // transforms so it's ready to re-enter on a future transition.
        gsap.set(outSlide, {
          opacity: 0,
          pointerEvents: 'none',
          xPercent: 0,
          zIndex: 1,
        });
        gsap.set(outInner, { xPercent: 0 });
        gsap.set(inSlide, { zIndex: 1 });
        currentRef.current = nextIdx;
        setCurrent(nextIdx);
        animatingRef.current = false;
      },
    })
      .to(outSlide, { xPercent: -direction * 100 }, 0)
      .to(outInner, { xPercent: direction * 50 }, 0)
      .to(inSlide, { xPercent: 0 }, 0)
      .to(inInner, { xPercent: 0 }, 0);
  };

  const next = () => {
    const cur = currentRef.current;
    animateTo((cur + 1) % total, 1);
  };
  const prev = () => {
    const cur = currentRef.current;
    animateTo((cur - 1 + total) % total, -1);
  };
  const goTo = (target: number) => {
    const cur = currentRef.current;
    if (target === cur) return;
    const forward = (target - cur + total) % total;
    const backward = (cur - target + total) % total;
    animateTo(target, forward <= backward ? 1 : -1);
  };

  // Initial layout — only slide 0 visible.
  useEffect(() => {
    slidesRef.current.forEach((slide, i) => {
      if (!slide) return;
      gsap.set(slide, {
        opacity: i === 0 ? 1 : 0,
        pointerEvents: i === 0 ? 'auto' : 'none',
        xPercent: 0,
      });
    });
    innersRef.current.forEach((img) => {
      if (img) gsap.set(img, { xPercent: 0 });
    });
  }, []);

  // Horizontal wheel / trackpad — only react when horizontal delta
  // dominates, so vertical page scroll passes through.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (animatingRef.current) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      if (e.deltaX > 0) next();
      else prev();
    };
    const node = wheelTargetRef.current;
    if (!node) return;
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  // Pointer drag — start on the slide area, ignore drags that begin on
  // links/buttons so the CTA stays clickable.
  useEffect(() => {
    const node = wheelTargetRef.current;
    if (!node) return;
    let startX = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button')) return;
      dragging = true;
      startX = e.clientX;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) next();
      else prev();
    };

    node.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      node.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <section className="relative w-full bg-gift-near-black py-s-80">
      <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
            SERVICE
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
          >
            事業内容
          </h2>
          <p className="font-sans text-normal font-light text-gift-silver">
            GIFTが提供する3つの事業。
          </p>
        </div>

        {/* Slideshow frame — overflow:hidden clips the parallax.
            Mobile aspect ratio is 3:5 (taller than wide) so the long
            Japanese body copy + tag + h3 + button stack fits inside the
            text panel without spilling past the top edge. The previous
            4:5 was only ~429px tall on iPhone SE — content needed ~380px
            after padding, and with items-end (content anchored to the
            bottom) the title got clipped at the top. */}
        <div
          ref={wheelTargetRef}
          className="relative w-full overflow-hidden rounded-2xl bg-black aspect-[3/5] sm:aspect-[16/10] touch-pan-y select-none"
        >
          {services.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => {
                slidesRef.current[i] = el;
              }}
              className="absolute inset-0 overflow-hidden will-change-transform"
              aria-hidden={i !== current}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  innersRef.current[i] = el;
                }}
                src={s.image}
                alt={s.titleEn}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
              />

              {/* Scrim — strong on the left where the text sits, fading
                  to transparent on the right so the image breathes. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

              {/* Text panel */}
              <div className="relative z-10 flex h-full items-end p-6 sm:items-center sm:p-10 lg:p-16">
                <div className="max-w-xl text-white">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-[0.2em] text-gift-green">
                    {String(i + 1).padStart(2, '0')} · {s.titleEn}
                  </p>
                  <h3
                    className="mb-4 font-display font-extrabold leading-[1.1]"
                    style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
                  >
                    {s.title}
                  </h3>
                  <p className="mb-6 max-w-md font-sans text-normal font-light text-white/85">
                    {s.body.length > 130 ? s.body.slice(0, 130) + '…' : s.body}
                  </p>
                  {s.href && (
                    <Link
                      href={s.href}
                      className="cta-btn cta-btn--on-green"
                      tabIndex={i === current ? 0 : -1}
                    >
                      <span>詳しく見る</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Thumbnails — small bordered previews. Click to jump; current
            one scales up and gets the green border. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-4">
          {services.map((s, i) => {
            const isCurrent = i === current;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${s.titleEn}へ`}
                aria-current={isCurrent ? 'true' : undefined}
                className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-md border transition-all duration-300 ease-out md:h-20 md:w-32 ${
                  isCurrent
                    ? 'scale-105 border-gift-green opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
                {isCurrent && (
                  <span className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-gift-green" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
