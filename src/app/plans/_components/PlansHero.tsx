'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import PlanCardStack from './PlanCardStack';

// Two-word-group headline reveal, ported from madewithgsap.com's hero (see
// docs/plans-page-hero-animation.md — verified against their real app2.js,
// no SplitText involved). Each group's words start shifted toward the
// measured pixel gap between the groups and animate to their natural
// resting position (x: 0), so the two halves appear to spring outward
// into place. No SplitText/Draggable — plain spans + core gsap.fromTo.
const TITLE_L = ['変える', '方法は、'];
const TITLE_R = ['ひとつ', 'じゃない。'];

export default function PlansHero() {
  const leftGroupRef = useRef<HTMLDivElement>(null);
  const rightGroupRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  // Gates PlanCardStack's drag interactivity — arms it a beat after the
  // headline settles rather than immediately on mount (see below).
  const [cardStackArmed, setCardStackArmed] = useState(false);

  useEffect(() => {
    const left = leftGroupRef.current;
    const right = rightGroupRef.current;
    const titleWrap = titleWrapRef.current;
    const secondary = [ctaRef.current].filter((el): el is HTMLAnchorElement => el !== null);
    if (!left || !right || !titleWrap) return;

    let alive = true;
    let revealed = false;
    let armTimer: number | undefined;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Belt-and-suspenders reveal used both for prefers-reduced-motion and as
    // the hard safety net below — never leave the hero permanently invisible.
    // Also arms the card stack immediately: there's no animated intro left
    // to wait on in either of those cases.
    const revealInstantly = () => {
      if (revealed) return;
      revealed = true;
      gsap.set(titleWrap, { visibility: 'visible' });
      gsap.set(left.querySelectorAll('span'), { x: 0 });
      gsap.set(right.querySelectorAll('span'), { x: 0 });
      gsap.set(secondary, { autoAlpha: 1 });
      setCardStackArmed(true);
    };

    const runIntro = () => {
      if (!alive || revealed) return;

      if (reduceMotion) {
        revealInstantly();
        return;
      }

      revealed = true;

      // Measure the real pixel gap between the two word-groups. This MUST
      // run after the webfont has actually swapped in: Gen Interface JP
      // loads late enough that measuring before then yields the wrong gap
      // (same bug class already diagnosed on /services/aiops — see
      // project_aiops_pending_bugs in memory).
      const gap = right.getBoundingClientRect().left - left.getBoundingClientRect().right;

      gsap.set(titleWrap, { visibility: 'visible' });
      gsap.fromTo(
        left.querySelectorAll('span'),
        { x: gap / 2 },
        { x: 0, stagger: 0.07, ease: 'expo.inOut', duration: 1, delay: 1 },
      );
      gsap.fromTo(
        right.querySelectorAll('span'),
        { x: -gap / 2 },
        { x: 0, stagger: -0.07, ease: 'expo.inOut', duration: 1, delay: 1 },
      );

      // CTA fades in ~1.1s after the title starts (title starts at delay:1,
      // so this lands at 2.1s from mount) — mirrors the reference's staged
      // reveal: title first (snappy), the rest a beat later (soft fade).
      gsap.fromTo(
        secondary,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: 'power4.inOut', delay: 2.1 },
      );

      // Card stack drag arms ~1.7s after this gate resolves — matching the
      // reference's own relative timing (their `intro-playing` class comes
      // off at 1.7s, mid-way through the title reveal, before the secondary
      // fade). Timed off the same font-ready gate as the headline, not raw
      // mount, so a slow font load can't arm dragging before the headline
      // has even appeared.
      armTimer = window.setTimeout(() => {
        if (alive) setCardStackArmed(true);
      }, 1700);
    };

    // Gate the measurement + animation on the webfont actually being ready,
    // with a bounded fallback so a slow/blocked font CDN can never hold the
    // hero forever — whichever settles first wins.
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, 500)),
    ]).then(() => {
      if (alive) runIntro();
    });

    // Hard safety net independent of the above: if something throws or the
    // font/measurement path never resolves, force the hero visible anyway.
    const safety = window.setTimeout(() => {
      if (alive) revealInstantly();
    }, 3000);

    return () => {
      alive = false;
      window.clearTimeout(safety);
      window.clearTimeout(armTimer);
    };
  }, []);

  return (
    // dvh, not vh/svh — full-screen covers must not under-fill when mobile
    // browser chrome collapses (standing rule on this project).
    // Desktop is pinned to exactly one screen. Mobile uses min-h so the
    // stacked title/CTA/carousel can grow instead of being squeezed.
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#f5f7ff] px-4 py-16 md:px-6 min-[901px]:h-[100dvh] lg:px-8 lg:py-20">
      {/* No-JS fallback: the hero's title/secondary copy starts hidden so the
          GSAP intro never flashes a wrong resting state; if JS never runs at
          all, force everything visible instead of leaving it blank. */}
      <noscript>
        <style>{`.plans-hero-reveal { visibility: visible !important; opacity: 1 !important; }`}</style>
      </noscript>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-10 lg:gap-8">
        {/* Single row: left half of the headline / card reel / right half of
            the headline — one horizontal band, reel centered between the two
            text halves, all vertically centered together (see
            docs/plans-page-hero-animation.md "Correction, third pass"). Grid
            with an `auto` center column lets the reel's own width (25vw, set
            inside PlanCardStack) dictate how much space is left for the two
            side columns, rather than hand-duplicating the reference's
            `calc(50% - 12.5vw - margin)` on both sides. */}
        <div
          ref={titleWrapRef}
          // `flex-1 min-h-0` instead of a fixed height: the row simply takes
          // whatever vertical space the hero has left, so the reel can never
          // push the page taller than one screen.
          // Mobile order matches the reference's stacked hero: both headline
          // halves (centred, on top of each other), then the CTA, then the
          // carousel last. Desktop falls back to auto-placement across the
          // three columns, with the CTA dropping to a second row.
          className="plans-hero-reveal invisible grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 min-[901px]:grid-cols-[1fr_auto_1fr] min-[901px]:grid-rows-[1fr_auto] min-[901px]:gap-8"
        >
          <div className="order-1 flex flex-col items-center justify-center text-center min-[901px]:order-none min-[901px]:items-start min-[901px]:text-left">
            <div
              ref={leftGroupRef}
              // Mobile: free to wrap across lines (plenty of full-width
              // room). Desktop (`min-[901px]:flex-nowrap`): the whole phrase
              // is forced onto ONE line — this is meant to read as a single
              // sentence, not a stack of words. That's only possible because
              // the desktop clamp caps much lower than mobile's 72px (see
              // `clamp(28px,3.2vw,38px)` below) — sized so the full 7-character
              // phrase fits its column next to the reel at every desktop
              // width (see PlanCardStack's narrowed `22vw/220px/320px` reel
              // sizing, shrunk specifically to give this line room).
              className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-2 text-[clamp(32px,6vw,72px)] font-bold leading-[1.1] text-[#0b1340] min-[901px]:flex-nowrap min-[901px]:justify-start min-[901px]:text-[clamp(28px,3.2vw,38px)]"
              style={{ fontFamily: '"Gen Interface JP", sans-serif' }}
            >
              {TITLE_L.map((word) => (
                <span key={word} className="inline-block shrink-0 whitespace-nowrap">
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* `visible` opts this out of the inherited `invisible` above: the
              reel has its own mount-time positioning (see PlanCardStack's
              layout effect) and was never meant to wait on the headline's
              font-ready gate — only its drag interactivity is gated, via
              `armed`. Breakpoint matches the reference's own 900px cutoff
              (verified in their style.css), not Tailwind's default lg:1024px
              — at in-between widths the old cutoff showed the cramped
              single-column fallback instead of the intended split layout. */}
          <PlanCardStack
            armed={cardStackArmed}
            className="visible order-4 self-center min-[901px]:order-none"
          />

          <div className="order-2 flex flex-col items-center justify-center text-center min-[901px]:order-none min-[901px]:items-end min-[901px]:text-right">
            <div
              ref={rightGroupRef}
              className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-2 text-[clamp(32px,6vw,72px)] font-bold leading-[1.1] text-[#0b1340] min-[901px]:flex-nowrap min-[901px]:justify-end min-[901px]:text-[clamp(28px,3.2vw,38px)]"
              style={{ fontFamily: '"Gen Interface JP", sans-serif' }}
            >
              {TITLE_R.map((word) => (
                <span key={word} className="inline-block shrink-0 whitespace-nowrap">
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Inside the grid so it can sit between the headline and the
              carousel on mobile (the reference's stacked order), centred.
              On desktop it is placed EXPLICITLY at row 2 / column 3 —
              bottom-right, under the end of the sentence (user's choice,
              2026-07-30).
              Without `col-start-3 row-start-2` the grid auto-places it into
              row 2 / column 1, i.e. bottom-LEFT, where it read as a button
              orphaned in a corner, breaking the symmetry of the
              text·reel·text band above it. Bottom-right follows reading
              order instead: the sentence ends on the right, so the CTA is
              the next beat after it. */}
          <div className="order-3 flex flex-col items-center text-center min-[901px]:order-none min-[901px]:col-start-3 min-[901px]:row-start-2 min-[901px]:items-end min-[901px]:text-right">
            <a
              ref={ctaRef}
              href="/contact"
              className="plans-hero-reveal invisible inline-flex items-center justify-center rounded-full bg-[#FF4D6D] px-8 py-4 text-sm font-semibold text-white opacity-0 transition-colors hover:bg-[#E63950]"
            >
              料金について相談する
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
