'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Motion layer for the whole LP. Mounted ONCE from page.tsx and queries the DOM
// by class, exactly like ScrollRevealText does elsewhere on this site — that way
// LpFlow / LpSteps / LpCta stay server components and none of them need to know
// this file exists.
//
// Why it queries rather than taking refs: the page renders BOTH concepts stacked,
// so every selector below matches twice. Each match gets its own ScrollTrigger,
// which is what we want — the second concept animates when you reach it, not
// while it is still two screens below the fold.
//
// ⚠️ Two standing rules on this project are load-bearing here:
//   1. NEVER `gsap.timeline({ scrollTrigger: { once: true } })`. A timeline that
//      kills its own trigger during a ScrollTrigger.refresh() takes the refresh
//      down with it. Use toggleActions and let it sit.
//   2. NEVER `clearProps: 'all'` — that is `style.cssText = ''`, which wipes
//      React-owned inline styles too. Where a prop has to be released after the
//      tween (clipPath below), name it explicitly.
export default function LpMotion() {
  useEffect(() => {
    // Respect the OS setting. Note we bail BEFORE any gsap.set, so nothing is
    // ever hidden for these users — the page just renders as the static
    // document it already is.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ScrollTrigger's global refresh listeners survive ctx.revert(), so they
    // are tracked here and removed in the effect's cleanup below.
    const onRefresh: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const enter = (trigger: Element, start = 'top 85%') =>
        ({
          trigger,
          start,
          // Play once on the way down and then leave it alone. Deliberately not
          // 'play reverse play reverse' — copy that fades out again as you
          // scroll back up reads as a glitch, not as craft.
          toggleActions: 'play none none none',
        }) as ScrollTrigger.Vars;

      /* ------------------------------------------------------------ hero */
      // Fires on load for the first hero (it is already in view, so
      // ScrollTrigger resolves it immediately on refresh) and on scroll for the
      // second concept's hero further down.
      gsap.utils.toArray<HTMLElement>('.lp-hero-copy').forEach((copy) => {
        const parts = copy.querySelectorAll('h1, p');
        gsap.set(parts, { opacity: 0, y: 28 });
        gsap.to(parts, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: enter(copy, 'top 95%'),
        });
      });

      // The SCROLL cue is the one thing that loops. Small amplitude on purpose:
      // it should register in peripheral vision, not wave at you.
      gsap.utils.toArray<HTMLElement>('.lp-scroll').forEach((cue) => {
        gsap.to(cue, {
          y: 9,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      /* -------------------------------------------------------- headings */
      // Every h2 on the page is already split into .lp-line spans (display:block)
      // for the Japanese line breaks, so they double as animation units for free.
      gsap.utils.toArray<HTMLElement>('.lp-section h2, .lp-cta h2').forEach((h) => {
        const lines = h.querySelectorAll('.lp-line');
        if (!lines.length) return;

        gsap.set(lines, { opacity: 0, y: '0.4em', clipPath: 'inset(0 0 100% 0)' });
        gsap.to(lines, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          // Release clipPath once we are at rest: a live inset() would keep
          // clipping descenders and any glyph that overshoots its line box.
          // Named prop, not 'all' — see the rule at the top of this file.
          clearProps: 'clipPath',
          scrollTrigger: enter(h),
        });
      });

      // Eyebrows lead their heading in slightly, so the small label reads first.
      gsap.utils.toArray<HTMLElement>('.lp-eyebrow').forEach((el) => {
        gsap.set(el, { opacity: 0, x: -12 });
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: enter(el, 'top 92%'),
        });
      });

      /* --------------------------------------------------- flow timeline */
      // Step-by-step timeline (Osmo reference — see
      // docs/aiops-lp-timeline-spec.md). Two couplings, both cheap:
      //   1. one SCRUBBED timeline driving the rail's two fills, so the line
      //      tracks the scroll position exactly and reverses on the way up;
      //   2. one plain ScrollTrigger per step toggling active/past classes,
      //      which CSS transitions handle — no tween on opacity.
      // Normal flow, no pin and no sticky: nothing here can strand the page.
      //
      // `.lp-tl-live` is added here rather than in the markup so the no-JS and
      // reduced-motion paths keep the finished, full-opacity timeline — this
      // code sits below the prefers-reduced-motion bail at the top of the effect.
      gsap.utils.toArray<HTMLElement>('.lp-tl').forEach((section) => {
        const list = section.querySelector<HTMLElement>('.lp-tl-list');
        const steps = gsap.utils.toArray<HTMLElement>('.lp-tl-step', section);
        const fills = section.querySelectorAll<HTMLElement>('.lp-tl-fill');
        if (!list || !steps.length || fills.length !== 2) return;

        section.classList.add('lp-tl-live');

        // Where a step counts as "current". Just below centre, so a step reads
        // as active slightly before it reaches the middle of the screen.
        const LINE = '62%';

        // The two fills run back to back, so the ink half completes exactly as
        // the green half starts — at the phase break, which is the midpoint of
        // the list. `ease: 'none'` because with scrub the visitor's scroll IS
        // the easing; anything else fights the finger.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: list,
              start: `top ${LINE}`,
              end: `bottom ${LINE}`,
              scrub: true,
            },
          })
          .fromTo(fills[0], { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' })
          .fromTo(fills[1], { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' });

        steps.forEach((step) => {
          ScrollTrigger.create({
            trigger: step,
            start: `top ${LINE}`,
            end: `bottom ${LINE}`,
            // `is-past` latches on the way down and releases on the way back up,
            // so a step you have already read sits at 0.5 rather than snapping
            // back to 0.22.
            onEnter: () => step.classList.add('is-past'),
            onLeaveBack: () => step.classList.remove('is-past'),
            onToggle: (self) => step.classList.toggle('is-active', self.isActive),
          });
        });
      });

      /* ----------------------------------------------------------- steps */
      // Per-step trigger rather than one stagger across the <ol>: the steps are
      // tall, so a single timeline would animate step 03 while it is still well
      // below the fold and the visitor would never see it move.
      gsap.utils.toArray<HTMLElement>('.lp-step').forEach((step) => {
        const num = step.querySelector('.lp-num');
        const body = step.querySelector('.lp-step-body');

        gsap.set(num, { opacity: 0, y: 26 });
        gsap.set(body, { opacity: 0, y: 18 });

        gsap
          .timeline({ scrollTrigger: enter(step) })
          .to(num, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
          .to(body, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.44');
      });

      /* -------------------------------------------------- body copy + CTA */
      // ⚠️ `.lp-flow-punch` is deliberately NOT in this list. It gets its own
      // scrubbed character reveal below, and two ScrollTriggers writing opacity
      // on the same element fight each other — the fade-in would stamp over the
      // scrub and the line would flicker. Do not add it back here.
      gsap.utils
        .toArray<HTMLElement>('.lp-lead, .lp-cta-inner > p')
        .forEach((el) => {
          gsap.set(el, { opacity: 0, y: 16 });
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: enter(el, 'top 90%'),
          });
        });

      /* -------------------------------------------------- punch marquee */
      // Weight-shift marquee: the closing line tracks across the screen while
      // its variable-font weight peaks at centre — heaviest exactly when it is
      // most readable. Reference: madewithgsap effect079. Full notes, including
      // the font requirement, in docs/aiops-lp-punch-marquee-spec.md.
      //
      // ⚠️ Depends on the VARIABLE font being loaded. If layout.tsx ever goes
      // back to requesting a `700;800;900` LIST instead of a `100..900` RANGE,
      // this tween degrades to three hard steps and the effect is dead.
      //
      // `.lp-punch-live` is added here, below the reduced-motion bail, so those
      // visitors keep a plain static paragraph. Horizontal travel is the exact
      // thing that setting exists to suppress, so this is not optional.
      //
      // Native sticky does the pinning (see lp.css) — NOT ScrollTrigger `pin`.
      // There is no pin-spacer anywhere in this page, so nothing above or below
      // can have its offsets shifted.
      gsap.utils.toArray<HTMLElement>('.lp-punch').forEach((track) => {
        const line = track.querySelector<HTMLElement>('.lp-flow-punch');
        if (!line) return;

        track.classList.add('lp-punch-live');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            // Exactly the interval the sticky pane is stuck for.
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        });

        // The bold window is anchored to the CENTRE OF THE SCREEN and never
        // moves; the sentence travels through it. So weight is a function of
        // each character's screen x, recomputed as the line moves — not a
        // function of scroll progress. Animating the paragraph's weight as a
        // whole (an earlier version of this) produces a completely different,
        // wrong effect: the whole sentence pulsing.
        const chars = gsap.utils.toArray<HTMLElement>('.lp-punch-char', line);

        const paint = () => {
          const centre = window.innerWidth / 2;
          // Radius of the bold window. Wide enough to catch several characters —
          // the reference shows roughly five heavy at once — but not so wide
          // that the whole line is mid-weight.
          const radius = Math.min(window.innerWidth * 0.18, 280);

          // Read every position FIRST, then write every weight. Interleaving
          // them would force a layout flush per character, because changing a
          // weight resizes the glyph and invalidates the next measurement.
          const offsets = chars.map((c) => {
            const box = c.getBoundingClientRect();
            return Math.abs(box.left + box.width / 2 - centre);
          });

          for (let i = 0; i < chars.length; i += 1) {
            const t = 1 - Math.min(offsets[i] / radius, 1);
            // Smoothstep, so the window has soft shoulders instead of a linear
            // ramp that reads as a mechanical wipe.
            const w = 200 + t * t * (3 - 2 * t) * 700;
            chars[i].style.fontWeight = String(Math.round(w));
          }
        };

        // Travel is linear: with scrub the visitor's scroll IS the easing, and
        // anything else makes the line feel like it lags the finger. xPercent,
        // so the distance scales with each sentence's own width and both
        // variants cross fully regardless of length.
        //
        // paint() hangs off the TWEEN's onUpdate rather than the ScrollTrigger's:
        // with `scrub: 0.5` the transform keeps easing after scrolling stops, and
        // only the tween's own render callback follows it through that tail.
        tl.fromTo(
          line,
          { xPercent: 62 },
          { xPercent: -62, duration: 1, ease: 'none', onUpdate: paint },
          0,
        );

        // Once up front so the line is correctly weighted before it is ever
        // scrolled into, and again on refresh, since a resize changes both the
        // viewport centre and the radius.
        paint();
        ScrollTrigger.addEventListener('refresh', paint);
        onRefresh.push(paint);
      });

      // The button gets the only overshoot ease on the page. It is the single
      // conversion point on both concepts, so it is allowed to arrive with a
      // little more presence than everything else.
      gsap.utils.toArray<HTMLElement>('.lp-button').forEach((btn) => {
        gsap.set(btn, { opacity: 0, y: 18 });
        gsap.to(btn, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: enter(btn, 'top 93%'),
        });
      });
    });

    // The hero video and the poster <Image> both settle after this effect runs,
    // and either can change the document height. Without a refresh the triggers
    // further down keep the offsets they were born with and fire at the wrong
    // scroll positions — or, for anything that ends up above the fold, never.
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    window.addEventListener('load', refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      onRefresh.forEach((fn) => ScrollTrigger.removeEventListener('refresh', fn));
      ctx.revert();
    };
  }, []);

  return null;
}
