'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

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

    const mm = gsap.matchMedia();

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

      /* ----------------------------------------------------- line spread */
      // Port of madewithgsap effect097. Each rendered LINE's letter-spacing is
      // a function of that line's own position on screen: natural at or above
      // ~68% of the viewport, opening up below it. Not a timeline and not a
      // stagger — in the reference a single paragraph shows settled lines at
      // the top and progressively looser ones toward the bottom, and that
      // gradient inside one block is the effect.
      //
      // The reference spreads WORDS. Japanese has no word spaces, so this
      // spreads CHARACTERS (字間) instead — the only mapping that exists.
      // Derivation: docs/aiops-lp-line-spread-spec.md.
      //
      // ⚠️ Left edge is anchored and the spread is capped to the room each
      // line actually has. That is what makes this safe without a clip
      // container: nothing can overflow the measure, and with `nowrap` on the
      // split lines nothing can re-wrap mid-animation.
      gsap.utils
        .toArray<HTMLElement>('.lp-hero-copy, .lp-tl .lp-inner')
        .forEach((block) => {
          const targets = gsap.utils.toArray<HTMLElement>(
            ':scope > h1, :scope > p, :scope > .lp-eyebrow, :scope > h2',
            block,
          );
          if (!targets.length) return;

          const MAX = 0.34;
          const SETTLE = 0.62;
          const RANGE = 0.42;

          // Cached at split time rather than read per line per frame — a
          // getComputedStyle in the paint loop forces a style recalc for a
          // number that only changes when the split is redone anyway.
          const measure = (line: HTMLElement) => {
            line.style.letterSpacing = '';
            line.style.transform = '';
            line.dataset.size = String(parseFloat(getComputedStyle(line).fontSize) || 16);
          };

          // autoSplit re-splits on resize and on late webfonts, which is
          // exactly when the rendered line breaks change. The line elements are
          // therefore NOT cached anywhere — paint() re-queries them, because a
          // cached reference would be stale the moment a re-split happened.
          targets.forEach((el) => {
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'lp-sline',
              autoSplit: true,
              onSplit: (self) => {
                (self.lines as HTMLElement[]).forEach(measure);
              },
            });
          });

          const paint = () => {
            const vh = window.innerHeight;
            const lines = Array.from(
              block.querySelectorAll<HTMLElement>('.lp-sline'),
            );

            // ⚠️ Read every rect FIRST, then write every style. letter-spacing
            // is a layout property, so interleaving would force one synchronous
            // layout per line — the same rule the punch marquee below follows.
            const tops = lines.map((line) => line.getBoundingClientRect().top);

            lines.forEach((line, i) => {
              const d = gsap.utils.clamp(0, 1, (tops[i] / vh - SETTLE) / RANGE);
              if (d === 0) {
                // Removed, not written as 0, so the element's own CSS
                // letter-spacing (-0.01em on the headings) applies exactly and
                // no stray transform is left on the node.
                line.style.letterSpacing = '';
                line.style.transform = '';
                return;
              }

              const n = line.textContent?.length ?? 0;
              const size = parseFloat(line.dataset.size ?? '0');
              if (!n || !size) return;

              // NO CAP — see the warning in the spec. A wrapped line already
              // fills its measure, so capping the spread to the measure zeroes
              // the effect outright. The extra width overflows and is clipped.
              const spread = MAX * Math.pow(d, 1.5);
              // letter-spacing adds space after every character, including the
              // last, so the line gains `spread * size * n`. Shifting back by
              // half of it opens the line about its own centre instead of
              // pushing it off the right edge.
              const shift = (spread * size * n) / 2;
              line.style.letterSpacing = `${spread}em`;
              line.style.transform = `translateX(${-shift}px)`;
            });
          };

          ScrollTrigger.create({
            trigger: block,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: paint,
            // Fires on create and after every resize / re-split, which is what
            // sets the initial state for someone landing mid-page.
            onRefresh: paint,
          });
        });

      /* -------------------------------------------------------- headings */
      // Every h2 on the page is already split into .lp-line spans (display:block)
      // for the Japanese line breaks, so they double as animation units for free.
      gsap.utils
        .toArray<HTMLElement>('.lp-section h2, .lp-cta h2')
        // .lp-tl's heading is line-split for the spread below, which rewrites
        // its innerHTML — this tween's `.lp-line` targets would be detached.
        .filter((h) => !h.closest('.lp-tl'))
        .forEach((h) => {
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

      /* ------------------------------------------------- what-we-do fan */
      // Port of the madewithgsap.com homepage card sequence. Cards are revealed
      // one per 100svh of scroll and fan open along a shallow arc. Derivation:
      // docs/aiops-lp-what-fan-spec.md.
      //
      // ⚠️ NO `pin: true`. This page has no pin-spacer anywhere and adding one
      // here would strand the sections around it. The stage is `position:
      // sticky` in CSS instead, and this trigger only reads progress.
      //
      // Height is in the query as well as width: the fan needs vertical room
      // for a heading above it and a 398px card below that. The stage grid in
      // lp.css now divides that room instead of guessing at it, and the live
      // heading shrinks with viewport height, which is what keeps 660px
      // workable — below it there is no longer enough for both and those
      // viewports get the static grid.
      mm.add('(min-width: 900px) and (min-height: 660px)', () => {
        // ⚠️ Scoped PER SECTION, like every other block in this file. page.tsx
        // maps LP_SLUGS, so this section exists once per concept. A
        // document.querySelector for the wheel plus a document-wide sweep for
        // the slots would drive concept A's wheel with every concept's cards,
        // and concept B's wheel with none.
        const cleanups: Array<() => void> = [];

        gsap.utils.toArray<HTMLElement>('.lp-what-sec').forEach((sec) => {
          const scroll = sec.querySelector<HTMLElement>('.lp-what-scroll');
          const wheel = sec.querySelector<HTMLElement>('.lp-what-wheel');
          const slots = gsap.utils.toArray<HTMLElement>('.lp-wslot', sec);
          if (!scroll || !wheel || !slots.length) return;

          // Degrees per card. Must match --wheel-step in lp.css.
          const STEP = 6.2;
          let shown = -1;

          /* ------------------------------------------------ heading burst */
          // The heading is blown apart when card 02 lands. Ported from the
          // madewithgsap homepage, which runs its title through Matter.js;
          // full derivation and the px/frame -> px conversion table are in
          // docs/aiops-lp-what-heading-burst-spec.md.
          //
          // No physics engine here on purpose: with zero gravity, no walls and
          // no collisions that matter, Matter's `v *= (1 - frictionAir)` per
          // step is plain exponential decay, which is what a `power4.out` tween
          // already is. The reference's numbers are reproduced as distances.
          const head = sec.querySelector<HTMLElement>('.lp-what-head');
          const arena = sec.querySelector<HTMLElement>('.lp-what-arena');
          const stage = sec.querySelector<HTMLElement>('.lp-what-stage');
          const lines = gsap.utils.toArray<HTMLElement>('.lp-what-head h2 .lp-line', sec);
          const chars = gsap.utils.toArray<HTMLElement>('.lp-what-head h2 .lp-wchar', sec);
          // The whole heading flies, not just the h2. The eyebrow's words and the
          // lead's tokens go with it, but at reduced energy: at a third of the
          // h2's size the same 360px throw reads as confetti rather than as one
          // event.
          const small = gsap.utils.toArray<HTMLElement>(
            '.lp-what-head .lp-eyebrow .lp-wchar, .lp-what-head .lp-lead .lp-wchar',
            sec,
          );
          // h2 characters first, then the small type. This order is load-bearing:
          // blow() decides each unit's energy by whether its index is inside
          // `chars`, and restore() rewinds the same list.
          const flying = [...chars, ...small];
          // The eyebrow and lead ELEMENTS still carry the generic entrance tweens
          // from the top of this file, which start them at opacity 0. Settled
          // before the burst, so a fast scroll can never leave a container at 0
          // while its children are flying out of it.
          const boxes = gsap.utils.toArray<HTMLElement>(
            '.lp-what-head .lp-eyebrow, .lp-what-head .lp-lead',
            sec,
          );
          let blown = false;
          let burst: gsap.core.Timeline | null = null;

          const blow = () => {
            if (blown || !head || !flying.length) return;
            blown = true;

            // ⚠️ The h2's entrance tween (the generic heading block near the top
            // of this file) animates clipPath: inset() on the LINE and only
            // clears it on complete. A fast scroll can still have it live when
            // the burst starts, and an inset() on the line would clip every
            // character the moment it leaves the line box. Settle the line
            // first, then blow.
            gsap.killTweensOf(lines);
            gsap.set(lines, { opacity: 1, y: 0, clearProps: 'clipPath' });
            gsap.killTweensOf(boxes);
            gsap.set(boxes, { opacity: 1, x: 0, y: 0 });

            // Outward direction per unit, measured NOW: it depends on the
            // viewport size and on where the sticky stage currently sits, so it
            // cannot be computed once at build time.
            const box = head.getBoundingClientRect();
            const cx = box.left + box.width / 2;
            const cy = box.top + box.height / 2;
            // The stage is `overflow: hidden`, and it has to be — the wheel
            // inside it is a 3675px square that would otherwise hand the
            // document a horizontal scrollbar. While the stage is stuck its top
            // and bottom edges ARE the viewport's, so a character clipped there
            // is just a character leaving the screen. Its left and right edges
            // are NOT: .lp-section's padding insets them by up to 84px, and a
            // character sliced on an invisible vertical line 84px inside the
            // window reads as a rendering bug. So x — and only x — is bounded,
            // per character, by the room that character actually has.
            const stageBox = (stage ?? head).getBoundingClientRect();

            // Each unit's finished destination, resolved HERE rather than in
            // function-based tween values: the flight and the fade below are two
            // separate tweens over the same targets, and the per-unit energy
            // difference belongs in one place rather than duplicated into both.
            const units = flying.map((el, i) => {
              const big = i < chars.length;
              const r = el.getBoundingClientRect();
              const dx = r.left + r.width / 2 - cx;
              const dy = r.top + r.height / 2 - cy;
              // || 1 guards the unit that happens to sit exactly on the centre —
              // its direction is arbitrary, but it must not be NaN.
              const len = Math.hypot(dx, dy) || 1;
              // The reference's per-frame velocities converted to total distance
              // (see the table in the spec); 60% of it for the small type.
              const dist = big ? gsap.utils.random(170, 360) : gsap.utils.random(100, 220);
              const lift = big ? gsap.utils.random(100, 165) : gsap.utils.random(60, 110);
              const spin = big ? 170 : 120;
              return {
                x: gsap.utils.clamp(
                  -(r.left - stageBox.left),
                  stageBox.right - r.right,
                  (dx / len) * dist + gsap.utils.random(-30, 30),
                ),
                y: (dy / len) * dist - lift,
                rotation: gsap.utils.random(-spin, spin),
              };
            });

            burst?.kill();
            burst = gsap.timeline();
            burst
              // Flight. power4.out is the frictionAir decay curve; the random
              // ranges are the reference's per-frame velocities converted to
              // total distance.
              .to(
                flying,
                {
                  x: (i: number) => units[i].x,
                  y: (i: number) => units[i].y,
                  rotation: (i: number) => units[i].rotation,
                  duration: 0.75,
                  ease: 'power4.out',
                },
                0,
              )
              // The fade is late and shuffled, exactly like the reference: the
              // characters are already well clear of the heading before any of
              // them start to go, which is what makes it read as thrown rather
              // than dissolved.
              //
              // `amount`, not `each`: the lead brings the unit count to roughly
              // 75, and `each: 0.012` would spread the fade across 0.9s — leaving
              // stragglers still dissolving over card 01. `amount` distributes a
              // fixed total however long the copy gets.
              .to(
                flying,
                {
                  autoAlpha: 0,
                  scale: 0.8,
                  duration: 0.2,
                  ease: 'power3.in',
                  stagger: { amount: 0.3, from: 'random' },
                },
                0.4,
              )
              // Second half of the effect, and the one thing the reference does
              // not need: its title is a separate pinned section, ours shares
              // this stage with the fan. `arena.offsetTop` is (heading row + row
              // gap), so half of it re-centres the arena's box in the stage and
              // closes the void the heading leaves behind. offsetTop is a layout
              // read and is unaffected by the transform written here, so it stays
              // correct on a repeat blow.
              .to(
                arena,
                { y: -(arena?.offsetTop ?? 0) / 2, duration: 0.8, ease: 'power3.inOut' },
                0.15,
              );
          };

          const restore = () => {
            if (!blown) return;
            blown = false;
            burst?.kill();
            burst = gsap.timeline();
            burst
              .to(
                flying,
                {
                  x: 0,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.45,
                  ease: 'expo.out',
                  // amount, not each — same reason as the fade in blow().
                  stagger: { amount: 0.18, from: 'random' },
                },
                0,
              )
              .to(arena, { y: 0, duration: 0.6, ease: 'power3.inOut' }, 0);
          };

          // The heading stands in the MIDDLE of the stage for the lead-in, not at
          // the top of grid row 1: for a sixth of the budget it is the only thing
          // on screen, and a title parked against the top edge with half a screen
          // of empty black under it reads as a section that failed to load.
          // Transform only — the grid rows are untouched, so `arena.offsetTop`,
          // which the burst's lift is measured from, stays the layout number it
          // has always been.
          const centre = () => {
            if (!head || !stage) return;
            gsap.set(head, {
              y: Math.max(0, (stage.clientHeight - head.offsetHeight) / 2),
            });
          };

          // Before the trigger is created, so `.lp-what-scroll`'s 360svh is
          // already applied when ScrollTrigger measures it.
          sec.classList.add('lp-what-live');

          // ⚠️ State is derived from the index, never from the delta. The
          // reference reveals only slots[t] on the way down and hides only
          // slots[a] on the way up, so any scroll that skips an index — a
          // flick, a trackpad throw, a scroll-position restore on reload —
          // desyncs it permanently. Rebuilding the whole state each time
          // cannot.
          const apply = (i: number) => {
            if (i === shown) return;
            slots.forEach((slot, n) => {
              const on = n <= i;
              slot.classList.toggle('lp-on', on);
              if (on) gsap.set(slot, { rotation: n * STEP });
            });
            // Pop only for a card that is genuinely new, so scrubbing back and
            // forth over one boundary doesn't re-trigger it endlessly.
            if (i > shown && i >= 0) {
              gsap.from(slots[i], {
                scale: 0.94,
                ease: 'elastic.out(0.6, 0.3)',
                duration: 0.5,
              });
            }
            // Counter-rotate the group by half a step per card so the fan stays
            // symmetric about screen centre as it grows. With three cards the
            // resting angles are -6.2, 0, +6.2.
            gsap.to(wheel, {
              rotation: i < 0 ? 0 : -(STEP / 2) * i,
              ease: 'elastic.out(0.6, 0.3)',
              duration: 0.5,
            });
            // Card 01 is what knocks the heading out, at the same moment its own
            // entrance starts — that IS the effect. It only works because of the
            // lead-in above (see LEAD): the card has to arrive at a heading that
            // has already had its moment, not at progress 0. Both directions,
            // because apply() rebuilds state from the index and scrolling back up
            // has to put the words back. The blown/restore guards make repeat
            // calls at the same index free.
            if (i >= 0) blow();
            else restore();
            shown = i;
          };

          // The first sixth of the budget belongs to the heading alone: no cards,
          // and -1 is a state apply() already knows how to render — it is what
          // onLeaveBack rewinds to. Must match the 60svh lead-in baked into the
          // 360svh on `.lp-what-live .lp-what-scroll` in lp.css.
          const LEAD = 1 / 6;
          const indexOf = (progress: number) => {
            if (progress < LEAD) return -1;
            const p = (progress - LEAD) / (1 - LEAD);
            // clamped, because progress hits exactly 1 at the end and
            // floor(1 * 3) would be 3 — one past the last card.
            return Math.min(slots.length - 1, Math.floor(p * slots.length));
          };

          const st = ScrollTrigger.create({
            trigger: scroll,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => apply(indexOf(self.progress)),
            // Fires on create and on every resize/refresh, which is what sets
            // the initial state and what restores it for someone landing
            // mid-section. Re-centring the heading belongs here too — both terms
            // of that measurement are viewport-height dependent.
            onRefresh: (self) => {
              centre();
              apply(indexOf(self.progress));
            },
            onLeaveBack: () => {
              shown = 0;
              apply(-1);
            },
          });

          cleanups.push(() => {
            st.kill();
            burst?.kill();
            blown = false;
            sec.classList.remove('lp-what-live');
            slots.forEach((slot) => slot.classList.remove('lp-on'));
            // Named props, not clearProps:'all' — 'all' is style.cssText = "",
            // which wipes React-owned inline styles too.
            gsap.set([...slots, wheel], { clearProps: 'transform' });
            // A resize down to the static grid must not leave characters parked
            // mid-flight or invisible: visibility is included because autoAlpha
            // writes it.
            if (flying.length) {
              gsap.set([...flying, ...boxes], {
                clearProps: 'transform,opacity,visibility',
              });
            }
            if (arena) gsap.set(arena, { clearProps: 'transform' });
            // The lead-in centring is a transform on the heading itself, and it
            // has to come off with everything else — the static grid below 900px
            // puts the heading back at the top of the section.
            if (head) gsap.set(head, { clearProps: 'transform' });
          });
        });

        // ⚠️ Returned from the mm.add callback, NOT from the forEach — forEach
        // discards return values, so a per-section cleanup returned there is
        // silently dropped and `.lp-what-live` survives a resize down to the
        // static grid, where its sticky stage and 300svh budget are both wrong.
        return () => cleanups.forEach((fn) => fn());
      });

      /* --------------------------------- what-we-do strip: drag (<900px) */
      // Below the fan's breakpoint the cards are a native scroll-snap strip. A
      // finger scrolls it; a MOUSE cannot — Chrome does not translate a vertical
      // wheel into horizontal scroll, and lp.css hides the scrollbar. On a narrow
      // desktop window the cards were simply unreachable. Spec:
      // docs/aiops-lp-what-strip-drag-spec.md.
      //
      // ⚠️ Mouse pointers ONLY. Touch never enters these handlers, so a phone
      // keeps entirely native scrolling — writing scrollLeft while a touch is
      // down is what breaks tap-vs-scroll on this project's touchscreen laptop.
      //
      // ⚠️ No rAF ease on scrollLeft anywhere in here. The landing is the
      // browser's own smooth scroll; a proportional ease loop is what made the
      // /plans reel unrecoverable, because scrollLeft rounds to whole pixels and
      // the loop can never converge.
      mm.add('(max-width: 899px)', () => {
        const unbinds: Array<() => void> = [];

        gsap.utils.toArray<HTMLElement>('.lp-what-sec').forEach((sec) => {
          const wheel = sec.querySelector<HTMLElement>('.lp-what-wheel');
          const slots = gsap.utils.toArray<HTMLElement>('.lp-wslot', sec);
          if (!wheel || slots.length < 2) return;

          let dragging = false;
          let startX = 0;
          let startLeft = 0;
          let timer = 0;

          // Idempotent on purpose: `scrollend` and the timeout below can both
          // fire, and a resize can revert the whole block mid-drag.
          const settle = () => {
            window.clearTimeout(timer);
            wheel.removeEventListener('scrollend', settle);
            wheel.classList.remove('lp-wdrag');
          };

          const onDown = (e: PointerEvent) => {
            // Nothing to drag if the strip does not overflow — on a wide-enough
            // window below 900px all three cards already fit.
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            if (wheel.scrollWidth <= wheel.clientWidth) return;
            dragging = true;
            startX = e.clientX;
            startLeft = wheel.scrollLeft;
            settle();
            wheel.classList.add('lp-wdrag');
            wheel.setPointerCapture(e.pointerId);
            // Otherwise the browser starts a text selection and the drag turns
            // into a highlight.
            e.preventDefault();
          };

          const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            wheel.scrollLeft = startLeft - (e.clientX - startX);
          };

          const onUp = () => {
            if (!dragging) return;
            dragging = false;
            // Pitch is MEASURED, not recomputed from the min(76vw, 320px) width
            // and the 12px gap — one source of truth, and it survives any change
            // to either. Snap positions are exactly 0, pitch, 2*pitch, because
            // scroll-padding-inline matches the strip's own padding-inline.
            const pitch = slots[1].offsetLeft - slots[0].offsetLeft;
            if (pitch > 0) {
              const i = gsap.utils.clamp(
                0,
                slots.length - 1,
                Math.round(wheel.scrollLeft / pitch),
              );
              wheel.scrollTo({ left: i * pitch, behavior: 'smooth' });
            }
            // Snap comes back only once that scroll has landed: restoring
            // `x mandatory` mid-flight cuts the animation short and the card
            // jumps into place. scrollend is not in Safari yet, hence the timer.
            wheel.addEventListener('scrollend', settle);
            timer = window.setTimeout(settle, 500);
          };

          wheel.addEventListener('pointerdown', onDown);
          wheel.addEventListener('pointermove', onMove);
          wheel.addEventListener('pointerup', onUp);
          wheel.addEventListener('pointercancel', onUp);

          unbinds.push(() => {
            wheel.removeEventListener('pointerdown', onDown);
            wheel.removeEventListener('pointermove', onMove);
            wheel.removeEventListener('pointerup', onUp);
            wheel.removeEventListener('pointercancel', onUp);
            dragging = false;
            settle();
          });
        });

        // Same rule as the fan block above: returned from the mm.add callback,
        // never from the forEach.
        return () => unbinds.forEach((fn) => fn());
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
            // The travel below is measured in PIXELS off the line and the pane,
            // so both ends have to be re-measured whenever a resize, an orientation
            // change or a late webfont changes either width. Without this the
            // function values are evaluated exactly once and the crossing is wrong
            // for the rest of the session.
            invalidateOnRefresh: true,
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

        // Travel is a FULL CROSSING measured in pixels — deliberately NOT a
        // percentage of the line's own width. `xPercent: ±62` (what this replaces)
        // moves the line 124% of ITS width, which only clears both clip edges when
        // the line is at least ~4.2× the pane wide. It is ~2.9× on a phone and
        // ~1.9× on a laptop, so the first characters were already in frame at
        // progress 0 and the last ones were still in frame at progress 1: the
        // sentence never entered and never finished. No fixed percentage can fix
        // that, because the percentage a crossing needs depends on pane/line ratio
        // and that ratio changes with every viewport.
        //
        // `place-items: center` on the pane leaves the line centred, so half of it
        // overhangs each clip edge at rest. Shifting it by (pane + line) / 2 lands
        // its leading edge exactly on the far edge; PAD carries it clear so no
        // character is caught half-cut at either extreme.
        //
        // track.clientWidth, not the pane's: the two are identical (the pane is a
        // full-width block whose only padding is vertical) and the track is the
        // element this closure already holds.
        const PAD = 24;
        const travel = () => (track.clientWidth + line.offsetWidth) / 2 + PAD;

        // Travel is linear: with scrub the visitor's scroll IS the easing, and
        // anything else makes the line feel like it lags the finger.
        //
        // paint() hangs off the TWEEN's onUpdate rather than the ScrollTrigger's:
        // with `scrub: 0.5` the transform keeps easing after scrolling stops, and
        // only the tween's own render callback follows it through that tail.
        //
        // Function-based values, so `invalidateOnRefresh` above re-measures them.
        tl.fromTo(
          line,
          { x: () => travel() },
          { x: () => -travel(), duration: 1, ease: 'none', onUpdate: paint },
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
    // The punch marquee's crossing distance is measured off rendered text, so a
    // webfont that swaps in after `load` changes it. Cheap and idempotent — this
    // is the same refresh the two lines above already schedule.
    document.fonts?.ready.then(refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      onRefresh.forEach((fn) => ScrollTrigger.removeEventListener('refresh', fn));
      ctx.revert();
      mm.revert();
    };
  }, []);

  return null;
}
