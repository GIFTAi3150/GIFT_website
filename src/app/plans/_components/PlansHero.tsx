'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Single centred headline sentence, kept as two word-group arrays (matching
// the page's earlier two-half layout) so the reveal can still stagger words
// in document order. 2026-07-31: the carousel that used to sit between the
// two halves was removed per manager feedback (cards must be visible
// instantly, zero interaction) — the headline is now one line, and the
// reveal is a plain staggered rise + fade instead of the old "spring apart"
// gap-measure animation that only made sense with the carousel between the
// groups (see docs/plans-page-hero-animation.md for that earlier pass).
const TITLE_L = ['変える', '方法は、'];
const TITLE_R = ['ひとつ', 'じゃない。'];

export default function PlansHero() {
  const leftGroupRef = useRef<HTMLSpanElement>(null);
  const rightGroupRef = useRef<HTMLSpanElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const left = leftGroupRef.current;
    const right = rightGroupRef.current;
    const titleWrap = titleWrapRef.current;
    if (!left || !right || !titleWrap) return;

    let alive = true;
    let revealed = false;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Belt-and-suspenders reveal used both for prefers-reduced-motion and as
    // the hard safety net below — never leave the hero permanently invisible.
    const revealInstantly = () => {
      if (revealed) return;
      revealed = true;
      gsap.set(titleWrap, { visibility: 'visible' });
      gsap.set(left.querySelectorAll('span'), { y: 0, autoAlpha: 1 });
      gsap.set(right.querySelectorAll('span'), { y: 0, autoAlpha: 1 });
    };

    const runIntro = () => {
      if (!alive || revealed) return;

      if (reduceMotion) {
        revealInstantly();
        return;
      }

      revealed = true;

      gsap.set(titleWrap, { visibility: 'visible' });

      // Left group's words, then the right group's, in document order — a
      // single staggered rise + fade rather than the two halves animating
      // independently.
      const spans = [
        ...Array.from(left.querySelectorAll('span')),
        ...Array.from(right.querySelectorAll('span')),
      ];
      gsap.fromTo(
        spans,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out', delay: 0.35 },
      );
    };

    // Gate the animation on the webfont actually being ready, with a bounded
    // fallback so a slow/blocked font CDN can never hold the hero forever —
    // whichever settles first wins.
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, 500)),
    ]).then(() => {
      if (alive) runIntro();
    });

    // Hard safety net independent of the above: if something throws or the
    // font path never resolves, force the hero visible anyway.
    const safety = window.setTimeout(() => {
      if (alive) revealInstantly();
    }, 3000);

    return () => {
      alive = false;
      window.clearTimeout(safety);
    };
  }, []);

  return (
    // dvh, not vh/svh — full-screen covers must not under-fill when mobile
    // browser chrome collapses (standing rule on this project). This hero is
    // no longer full-screen, so no dvh/vh height is set at all — it is just
    // a compact band that shrinks to its content.
    <section className="relative flex flex-col overflow-hidden bg-[#f5f7ff] px-4 py-20 md:px-6 lg:px-8 lg:py-24">
      {/* No-JS fallback: the hero's title/secondary copy starts hidden so the
          GSAP intro never flashes a wrong resting state; if JS never runs at
          all, force everything visible instead of leaving it blank. */}
      <noscript>
        <style>{`.plans-hero-reveal { visibility: visible !important; opacity: 1 !important; }`}</style>
      </noscript>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        {/* Single centred headline — no side columns and no split layout now
            that the carousel that used to sit between the two headline
            halves is gone (2026-07-31, manager feedback: cards must be
            visible with zero interaction). The CTA that used to live under
            it moved onto each card instead (2026-07-31), so this wrapper no
            longer needs to be a flex column with a gap — it just centres the
            one headline `titleWrapRef` reveals. */}
        <div ref={titleWrapRef} className="plans-hero-reveal invisible flex justify-center">
          <p
            className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-center text-[clamp(32px,5.5vw,64px)] font-bold leading-[1.1] text-[#0b1340]"
            style={{ fontFamily: '"Gen Interface JP", sans-serif' }}
          >
            {/* Each group is `flex-nowrap` so its own words can never break
                apart — a line break can only ever land BETWEEN the two
                groups, at the shared parent's `flex-wrap`. */}
            <span
              ref={leftGroupRef}
              className="inline-flex flex-nowrap items-baseline gap-x-2"
            >
              {TITLE_L.map((word) => (
                <span key={word} className="inline-block shrink-0 whitespace-nowrap">
                  {word}
                </span>
              ))}
            </span>
            <span
              ref={rightGroupRef}
              className="inline-flex flex-nowrap items-baseline gap-x-2"
            >
              {TITLE_R.map((word) => (
                <span key={word} className="inline-block shrink-0 whitespace-nowrap">
                  {word}
                </span>
              ))}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
