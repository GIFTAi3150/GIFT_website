'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

// Infinite draggable card reel for the /plans hero, modelled on
// madewithgsap.com's hero reel (decoded from their public app2.js — see
// docs/plans-page-hero-animation.md).
//
// HOW IT WORKS
// Cards are absolutely positioned and placed purely from one scalar,
// `stateRef.offset`. Each card's position is wrapped modulo the cycle length
// (REEL_CARD_COUNT * step), so cards leaving one end reappear at the other and the
// reel loops forever in both directions — there is NO clamp and no end stop.
//
// Two visual states:
//  - 'flat'      : while dragging. Even column, every card scale 1, tracking
//                  the pointer 1:1. A drag is an honest scroll.
//  - 'spotlight' : at rest. Exactly ONE card centred at scale 1.4; its two
//                  neighbours pushed out to peek PEEK px past the top/bottom
//                  edge; everything else parked off-screen and faded out.
// The press→flat / release→spotlight cycle is the core of the effect.
//
// On desktop the reel also runs that cycle by itself, one card every
// AUTOPLAY_PERIOD seconds, so the hero is never a static block waiting to be
// discovered — see the autoplay constants below.
//
// Notes from earlier failed passes, kept so they aren't repeated:
//  - No InertiaPlugin. Release snaps with expo.inOut; inertia momentum was
//    what made the reel drift on its own and take ~10s to settle.
//  - No gsap Observer. It resolves event names once at import and binds
//    touchstart/touchmove whenever "ontouchstart" exists (true on any
//    touchscreen Windows laptop), so a mouse never reached it — drag worked
//    on mobile and was dead on desktop. Native pointer events instead.
//  - The reel MUST have more card height than viewport height or there is
//    nothing to drag. Wrapping makes that automatic now, but with 5 cards and
//    a clamped track the flow height landed exactly on the viewport height
//    (645 vs 645) and dragging silently did nothing.
//  - No track padding. Half-viewport padding was what inflated the page.

// ---------------------------------------------------------------------------
// HOW MANY CARDS
//
// `REAL_CARD_COUNT` is the only one of these you should ever edit: set it to
// however many real cards you have (one per service, plan, whatever). 3 is
// fine. 1 is fine.
//
// The desktop reel then repeats them to fill `MIN_REEL_CARDS` slots, because
// the endless-loop illusion only holds while a card is recycled from one end
// to the other *off-screen*. That needs
//
//     count * step >= H + cardH        (step = cardH + CARD_GAP)
//
// where H is the reel's height and cardH a card's height. On a tall monitor
// H can reach ~600px against a ~130px card, so the true minimum is about 6;
// 12 leaves comfortable margin at any window size. Below that threshold the
// wrap point falls inside the visible area and you would watch a card
// teleport — invisible today only because every card is an identical blank
// navy rectangle, and immediately obvious once they carry real content.
//
// Repeating is the normal way infinite carousels handle a short list: with 3
// services the reel reads A B C A B C … as you spin it.
//
// Mobile repeats them too, for a different reason — see MOBILE_LOOP_COPIES.
const REAL_CARD_COUNT = 3;
const MIN_REEL_CARDS = 12;
const REEL_CARD_COUNT = REAL_CARD_COUNT * Math.max(1, Math.ceil(MIN_REEL_CARDS / REAL_CARD_COUNT));

// Mobile is a NATIVE horizontal scroller (kept native so touch keeps the
// browser's own momentum and rubber-banding, which no hand-rolled drag
// matches on a real phone). A native scroller has hard ends, so the endless
// loop is faked the standard way: render the real cards several times over
// and, whenever the scroll position drifts a full cycle away from the middle,
// shift it back by exactly one cycle. One "cycle" is one complete set of real
// cards, so the content either side of that shift is pixel-identical and the
// jump cannot be seen.
//
// 5 copies, not 3: an odd number gives a true middle copy, and it leaves a
// whole cycle of runway on each side of the recentre band. A cycle here is
// roughly 2.7 screen-widths, so an ordinary swipe never reaches a boundary —
// which matters because writing scrollLeft mid-fling cancels iOS momentum, so
// the shift wants to be rare rather than every cycle.
const MOBILE_LOOP_COPIES = 5;
const MOBILE_LOOP_CARDS = REAL_CARD_COUNT * MOBILE_LOOP_COPIES;

// How heavily the mouse drag and the release glide follow their target, as a
// fraction closed per frame (0–1). Lower = heavier/slower, higher = snappier.
//
// The reel does NOT jump straight to the pointer. The reference hero drove its
// track through an interpolating setter (`gsap.quickTo`, power4, 0.4s) and that
// lag is where all of its weight comes from — a 1:1 `scrollLeft = pointer`
// write, which is what this used to do, feels harsh and cheap by comparison.
// The release uses a gentler value so the card glides into place instead of
// arriving abruptly.
const MOBILE_DRAG_FOLLOW = 0.18;
const MOBILE_SETTLE_FOLLOW = 0.11;

const CARD_GAP = 5; // their real value
const ACTIVE_SCALE = 1.4; // their real value
const PEEK = 40; // their `u` — px of a neighbour left visible at the edge
const SNAP_EASE = 'expo.inOut';
const SNAP_DURATION = 0.4;

// --- Desktop autoplay ------------------------------------------------------
// The desktop reel advances itself one card at a time: a card holds the
// spotlight, the reel steps on, the next card holds. AUTOPLAY_PERIOD is the
// WHOLE beat (hold + move), so "a new card every 3 seconds" is literally 3
// here; AUTOPLAY_SHIFT is how much of that beat is spent moving, and the
// remainder (3 - 0.85 = 2.15s) is the stop.
//
// The move has to pass through the flat layout on the way, which is why
// advanceOne() animates `flat` 0→1→0 alongside `offset`. In the spotlight
// layout render() sorts cards into three discrete buckets (centred /
// neighbour / parked), so tweening `offset` on its own would only reassign
// buckets — the active card would pop out to the edge and the next would pop
// into the middle with no travel in between. Blending through flat is the
// same motion a drag + release produces, so the auto-advance reads as the
// reel moving rather than the cards swapping places.
const AUTOPLAY_PERIOD = 3;
const AUTOPLAY_SHIFT = 0.85;
// How soon to re-check while the advance is deliberately being held off —
// pointer resting on the reel, a card open, intro not finished yet. Short, so
// it picks straight back up rather than losing a whole beat.
const AUTOPLAY_RETRY = 0.4;

// Autoplay is motion the visitor didn't ask for, so it is the one part of the
// reel that respects the OS "reduce motion" setting outright: dragging still
// works, it just never moves on its own.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// How much backdrop stays visible around an opened card on mobile / narrow
// windows. There is no close button by design — you dismiss the card by
// tapping the backdrop — so that backdrop has to actually be reachable. The
// panel used to be `vw - 24` by `vh - 48`, i.e. a 12px strip down each side:
// technically tappable, but far too thin to read as "tap here to get out",
// and easy to miss and hit the card instead.
//
// 44px is the standard minimum comfortable touch target (Apple HIG / Material
// both land there). The ratio lets the gap grow on bigger screens instead of
// staying a hairline; whichever is larger wins.
const MOBILE_PANEL_MIN_GAP = 44;
const MOBILE_PANEL_GAP_RATIO = 0.07;

// Tallest the opened card is allowed to get on mobile, as height ÷ width.
// 1.25 is a 4:5 portrait.
//
// It used to just take all the height it was given (`vh - gap*2`), which on a
// phone came out around 2.4:1 — a tall thin column with nothing card-like left
// about it. A card is a landscape 16:9 object, so stretching it that far past
// its own proportions reads as a different element entirely, not as the card
// you tapped.
//
// It cannot stay exactly 16:9 either: the reel card is already ~85% of a
// phone's width, so a same-ratio "expansion" would come out no bigger than the
// original — there is simply nowhere to grow sideways on a portrait screen.
// This cap is the compromise: clearly bigger, still recognisably a card.
const MOBILE_PANEL_MAX_ASPECT = 1.25;

type Metrics = {
  H: number;
  cardH: number;
  step: number;
  cycle: number;
  center: number;
  cards: HTMLDivElement[];
};

export default function PlanCardStack({
  armed,
  className,
}: {
  armed: boolean;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const revealedRef = useRef(false);

  // Single animatable state object. `offset` is the virtual scroll position;
  // `flat` blends the layout between the two visual states — 0 = spotlight
  // (one big centred card), 1 = flat even column (while dragging).
  //
  // These are BLENDED, not switched. Previously press kicked off a 0.4s
  // eased tween to the flat layout, but the first pointermove immediately
  // gsap.set() every card to its flat position, wiping that tween out
  // mid-flight — so the cards visibly snapped straight down and the ease was
  // only ever visible if you pressed without moving. Driving both values
  // through one object lets the ease play while the drag stays responsive.
  const stateRef = useRef({ offset: 0, flat: 0 });

  // Click-to-expand. `origin` is the card's on-screen rect at the moment it
  // was clicked; the panel animates from exactly that rect out to a large
  // centred one (a FLIP transition), so it reads as the card itself opening
  // rather than a modal fading in over the top.
  const [expanded, setExpanded] = useState<number | null>(null);
  const expandedRef = useRef<number | null>(null);
  const originRef = useRef<{ top: number; left: number; width: number; height: number } | null>(
    null,
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The card currently being expanded, so it can be hidden for the duration —
  // see openCard.
  const sourceElRef = useRef<HTMLElement | null>(null);

  // Below 901px the reel is a plain native horizontal scroller — exactly what
  // the reference does. Their whole Observer/spotlight system lives in the
  // desktop branch; mobile is just `overflow:auto` + `scroll-snap-type: x
  // mandatory`, centred on load. Running GSAP transforms there would fight
  // native scrolling, so we skip it entirely.
  const [isMobile, setIsMobile] = useState(false);

  // Autoplay handles: the pending `delayedCall` that fires the next advance,
  // and the timeline of the advance itself. Held in refs (not effect locals)
  // because the drag handlers, the expand overlay and the intro all need to
  // stop or re-queue it.
  const autoplayCallRef = useRef<gsap.core.Tween | null>(null);
  const autoplayTlRef = useRef<gsap.core.Timeline | null>(null);
  // Mouse resting on the reel holds the advance. Without this a card can slide
  // out from under the cursor between aiming and clicking.
  const hoveringRef = useRef(false);

  const metrics = (): Metrics | null => {
    const viewport = viewportRef.current;
    if (!viewport) return null;
    const cards = cardEls.current.filter((el): el is HTMLDivElement => el !== null);
    if (cards.length === 0) return null;
    const cardH = cards[0].offsetHeight;
    if (!cardH) return null;
    const step = cardH + CARD_GAP;
    return {
      H: viewport.clientHeight,
      cardH,
      step,
      cycle: step * cards.length,
      center: viewport.clientHeight / 2,
      cards,
    };
  };

  // A card's signed distance from the reel's centre, wrapped into
  // [-cycle/2, cycle/2). 0 = dead centre. This wrap is what makes the reel
  // endless: a card falling off the top re-enters at the bottom.
  const posOf = (i: number, m: Metrics) =>
    gsap.utils.wrap(-m.cycle / 2, m.cycle / 2, i * m.step - stateRef.current.offset);

  // Places every card from the current { offset, flat } state. Called on each
  // pointermove AND from the onUpdate of the tweens that animate `flat` and
  // `offset`, so a running ease and an active drag compose instead of one
  // clobbering the other.
  const render = () => {
    const m = metrics();
    if (!m) return;
    const { H, cardH, step, center, cards } = m;
    const f = stateRef.current.flat;

    cards.forEach((card, i) => {
      const pos = posOf(i, m);

      // Flat layout: plain evenly-spaced column.
      const flatY = center - cardH / 2 + pos;

      // Spotlight layout.
      let spotY: number;
      let spotScale = 1;
      let spotAlpha = 1;
      if (Math.abs(pos) < step / 2) {
        // The active card: dead centre, enlarged.
        spotY = center - cardH / 2;
        spotScale = ACTIVE_SCALE;
      } else if (Math.abs(pos) < step * 1.5) {
        // Immediate neighbours: shoved out to peek past the edge, clearing
        // room for the enlarged active card.
        spotY = pos < 0 ? -cardH + PEEK : H - PEEK;
      } else {
        // Everything else parks fully off-screen.
        spotY = pos < 0 ? -cardH - center : H + center;
        spotAlpha = 0;
      }

      gsap.set(card, {
        y: spotY + (flatY - spotY) * f,
        scale: spotScale + (1 - spotScale) * f,
        autoAlpha: spotAlpha + (1 - spotAlpha) * f,
      });
    });
  };

  // Ease toward the flat column while keeping the drag live.
  const goFlat = () => {
    gsap.to(stateRef.current, {
      flat: 1,
      duration: SNAP_DURATION,
      ease: SNAP_EASE,
      onUpdate: render,
      overwrite: true,
    });
  };

  // Settle: ease the nearest card to dead centre and the layout back to the
  // spotlight, both in one tween so they stay in lockstep. Shifting `offset`
  // by that card's own `pos` moves it to 0; because positions wrap, there is
  // never an end to hit.
  const settle = () => {
    const m = metrics();
    if (!m) return;
    let nearest = 0;
    let best = Infinity;
    m.cards.forEach((_, i) => {
      const d = Math.abs(posOf(i, m));
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    gsap.to(stateRef.current, {
      offset: stateRef.current.offset + posOf(nearest, m),
      flat: 0,
      duration: SNAP_DURATION,
      ease: SNAP_EASE,
      onUpdate: render,
      overwrite: true,
    });
  };

  // Kill both the pending advance and any advance in flight. `goFlat`/`settle`
  // would already overwrite the tweens (same target object), but a drag should
  // also cancel the *schedule*, which overwrite can't do.
  const stopAutoplay = () => {
    autoplayCallRef.current?.kill();
    autoplayCallRef.current = null;
    autoplayTlRef.current?.kill();
    autoplayTlRef.current = null;
  };

  // One step of the reel: `offset` moves by exactly one card while the layout
  // dips through flat and re-forms as the spotlight on the next card. Because
  // `settle` always leaves the active card at pos 0, +step lands the next one
  // dead centre — and posOf() wraps, so this never reaches an end.
  const advanceOne = () => {
    autoplayCallRef.current = null;
    const m = metrics();
    // Held off, not cancelled: something is deliberately keeping the reel
    // still, so re-check shortly instead of losing the loop for good.
    if (!m || !revealedRef.current || expandedRef.current !== null || hoveringRef.current) {
      queueAutoplay(AUTOPLAY_RETRY);
      return;
    }

    const tl = gsap.timeline({
      onUpdate: render,
      onComplete: () => {
        autoplayTlRef.current = null;
        // Keep `offset` from creeping toward float-precision trouble on a page
        // left open for hours. Dropping whole cycles is invisible — posOf()
        // already wraps by that same cycle. Re-measured rather than reusing
        // `m`: a resize mid-move changes the card height, and wrapping by a
        // stale cycle would shift every card by a non-multiple of the real one,
        // i.e. a visible jump.
        const end = metrics();
        if (end) stateRef.current.offset = gsap.utils.wrap(0, end.cycle, stateRef.current.offset);
        queueAutoplay();
      },
    });
    tl.to(
      stateRef.current,
      {
        offset: stateRef.current.offset + m.step,
        duration: AUTOPLAY_SHIFT,
        ease: 'power3.inOut',
      },
      0,
    )
      // Flattens fast, re-forms a little more slowly, so the beat lands on the
      // NEW card growing into the spotlight rather than on the old one leaving.
      .to(
        stateRef.current,
        { flat: 1, duration: AUTOPLAY_SHIFT * 0.4, ease: 'power2.out' },
        0,
      )
      .to(
        stateRef.current,
        { flat: 0, duration: AUTOPLAY_SHIFT * 0.55, ease: 'power2.inOut' },
        AUTOPLAY_SHIFT * 0.45,
      );
    autoplayTlRef.current = tl;
  };

  // Default delay is the hold — the visible stop between two moves.
  const queueAutoplay = (delay = AUTOPLAY_PERIOD - AUTOPLAY_SHIFT) => {
    stopAutoplay();
    if (prefersReducedMotion()) return;
    autoplayCallRef.current = gsap.delayedCall(delay, advanceOne);
  };

  // Resolved pre-paint so the JS branch matches the CSS breakpoint from the
  // first frame — the layout itself is CSS-driven, so there's no flash.
  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const cards = cardEls.current.filter((el): el is HTMLDivElement => el !== null);

    // MOBILE: hand everything to native scroll-snap. Clear any inline styles
    // a previous desktop pass left behind, then centre the scroller the way
    // the reference does.
    if (isMobile) {
      // Queried from the DOM, NOT from `cardEls` — this is the line that has
      // to undo GSAP's inline visibility/opacity/transform, and `cardEls` is
      // already all-nulls by the time it runs: the desktop branch's `ref`
      // prop goes away in the same commit that switches branches, so React
      // has detached every ref (called it with null) before this effect.
      // Reading refs here cleared an empty array and left the cards hidden.
      const domCards = Array.from(viewport.querySelectorAll<HTMLElement>('[data-card]'));
      gsap.killTweensOf(domCards);
      gsap.set(domCards, { clearProps: 'all' });

      // Touch/trackpad already scroll this natively — but there is no
      // browser-native way to click-and-drag an `overflow-x:auto` element
      // with a mouse. Anyone landing on this branch with a mouse (including
      // just resizing a desktop window narrow enough to trip the <=900px
      // breakpoint) got a carousel that looked scrollable but had no way to
      // move it. Wire a manual drag-to-scroll for `pointerType === 'mouse'`
      // only, so real touch keeps its native momentum/rubber-banding
      // untouched.
      let dragging = false;
      let startX = 0;
      let startScrollLeft = 0;
      let travelled = 0;
      // Where the reel is easing TOWARD. The drag and the release glide both
      // just move this; a single rAF loop (`tick`) closes the gap.
      let targetScroll = 0;
      let raf = 0;
      let snapSuspended = false;

      viewport.style.cursor = 'grab';

      // --- Endless loop --------------------------------------------------
      // `cycle`: width of one full set of real cards. `base`: the scrollLeft
      // that centres the middle copy. Both depend on card width, which is
      // `calc(100vw - 60px)`, so they are re-measured on resize rather than
      // computed once.
      const MIDDLE_COPY = Math.floor(MOBILE_LOOP_COPIES / 2);
      let cycle = 0;
      let base = 0;

      const centredScrollFor = (el: HTMLElement) =>
        el.offsetLeft - (viewport.clientWidth - el.offsetWidth) / 2;

      const measure = () => {
        const kids = viewport.children;
        const first = kids[0] as HTMLElement | undefined;
        const nextCycle = kids[REAL_CARD_COUNT] as HTMLElement | undefined;
        const middle = kids[MIDDLE_COPY * REAL_CARD_COUNT] as HTMLElement | undefined;
        if (!first || !nextCycle || !middle) {
          cycle = 0;
          return;
        }
        cycle = nextCycle.offsetLeft - first.offsetLeft;
        base = centredScrollFor(middle);
      };

      // Runs on every scroll event, NOT on a settle debounce. Shifting the
      // moment the band is crossed is what makes it invisible; an earlier
      // attempt waited 150ms after scrolling stopped, which meant the shift
      // could land while a finger was still down and confused the browser's
      // own tap-vs-scroll detection.
      const recentre = () => {
        if (!cycle) return;
        // Accumulated in whole cycles, and looped rather than a single ±cycle
        // step, so a hard fling that overshoots the band by more than one
        // cycle is corrected in one write instead of relying on the follow-up
        // scroll events to nibble it back.
        let delta = 0;
        while (viewport.scrollLeft + delta < base - cycle) delta += cycle;
        while (viewport.scrollLeft + delta > base + cycle) delta -= cycle;
        if (!delta) return;
        const prevBehavior = viewport.style.scrollBehavior;
        viewport.style.scrollBehavior = 'auto';
        viewport.scrollLeft += delta;
        viewport.style.scrollBehavior = prevBehavior;
        // A mouse drag positions from a remembered baseline, so that baseline
        // has to move with the shift or the next pointermove undoes it. The
        // easing target has to move by the same amount too, otherwise an
        // in-flight glide would keep pulling toward the pre-shift position and
        // visibly yank the reel a whole cycle backwards.
        if (dragging) startScrollLeft += delta;
        targetScroll += delta;
      };

      measure();
      viewport.scrollLeft = base;
      targetScroll = base;

      const onResize = () => {
        measure();
        viewport.scrollLeft = base;
        // Card widths are viewport-relative, so `base` moves on resize; the
        // easing target has to follow or the loop would glide back to a
        // position measured for the old width.
        targetScroll = base;
      };

      // CSS `snap-x snap-mandatory` and our own scrollLeft writes cannot
      // coexist: with mandatory snapping armed, the browser corrects the
      // position back toward the nearest card after every write. That is both
      // why the drag used to look dead AND why the release felt like a hard
      // snap — `endDrag` re-armed snapping before the smooth scroll ran, so the
      // browser yanked instantly to the nearest card and the animation never
      // got to play. So snapping stays off from pointerdown until the glide has
      // actually finished settling.
      const suspendSnap = () => {
        if (snapSuspended) return;
        snapSuspended = true;
        viewport.style.scrollSnapType = 'none';
        viewport.style.scrollBehavior = 'auto';
      };

      const restoreSnap = () => {
        if (!snapSuspended) return;
        snapSuspended = false;
        viewport.style.scrollSnapType = '';
        viewport.style.scrollBehavior = '';
      };

      // The scroll position that centres whichever card is nearest `from`.
      // Measures real card centres rather than rounding to a multiple of the
      // card step — the old rounding ignored the track's 30px side padding and
      // so parked every card slightly off-centre.
      const nearestCentredScroll = (from: number) => {
        const kids = Array.from(viewport.children) as HTMLElement[];
        if (kids.length === 0) return from;
        const mid = from + viewport.clientWidth / 2;
        let best = kids[0];
        let bestDist = Infinity;
        for (const kid of kids) {
          const dist = Math.abs(kid.offsetLeft + kid.offsetWidth / 2 - mid);
          if (dist < bestDist) {
            bestDist = dist;
            best = kid;
          }
        }
        return centredScrollFor(best);
      };

      // One loop drives both the drag-follow and the release glide, so letting
      // go simply changes the target and the follow rate — there is no handoff
      // between two different animation systems that could stutter.
      //
      // Reads `viewport.scrollLeft` fresh every frame instead of integrating
      // its own position, which is what lets `recentre()` shift the scroll
      // underneath it without the motion breaking.
      const tick = () => {
        raf = 0;
        const current = viewport.scrollLeft;
        const diff = targetScroll - current;
        if (Math.abs(diff) < 0.5) {
          viewport.scrollLeft = targetScroll;
          if (!dragging) {
            restoreSnap();
            recentre();
          }
          return;
        }
        viewport.scrollLeft = current + diff * (dragging ? MOBILE_DRAG_FOLLOW : MOBILE_SETTLE_FOLLOW);
        raf = requestAnimationFrame(tick);
      };

      const ensureTick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const stopTick = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        dragging = true;
        travelled = 0;
        startX = e.clientX;
        startScrollLeft = viewport.scrollLeft;
        // Start from where it actually is, so grabbing mid-glide picks the reel
        // up smoothly instead of jumping to a stale target.
        targetScroll = viewport.scrollLeft;
        viewport.style.cursor = 'grabbing';
        suspendSnap();
        e.preventDefault();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        travelled = Math.max(travelled, Math.abs(dx));
        // Only ever moves the target — `tick` eases the real position toward
        // it. This lag is the weight; writing scrollLeft here directly is what
        // made the drag feel harsh.
        targetScroll = startScrollLeft - dx;
        ensureTick();
      };

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        viewport.style.cursor = 'grab';
        // Aim at the card nearest where the drag was heading, then let the same
        // loop glide there at the gentler settle rate. Snap is re-armed by
        // `tick` once it arrives, never before.
        targetScroll = nearestCentredScroll(targetScroll);
        ensureTick();
      };

      // A drag still ends in a pointerup→click on whatever's under the
      // cursor, which would otherwise open that card. Capture-phase so this
      // runs before the card's own (bubble-phase) onClick.
      const onClickCapture = (e: MouseEvent) => {
        if (travelled > 6) {
          e.stopPropagation();
          e.preventDefault();
        }
      };

      viewport.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      viewport.addEventListener('click', onClickCapture, true);
      viewport.addEventListener('scroll', recentre, { passive: true });
      window.addEventListener('resize', onResize);

      return () => {
        stopTick();
        restoreSnap();
        viewport.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        viewport.removeEventListener('click', onClickCapture, true);
        viewport.removeEventListener('scroll', recentre);
        window.removeEventListener('resize', onResize);
      };
    }

    render();
    // Hidden until the intro reveals them (or the fallback below fires) —
    // but ONLY on the first, pre-intro pass.
    //
    // This effect re-runs whenever `isMobile` flips, and crossing the 901px
    // breakpoint unmounts/remounts the cards as brand-new DOM nodes. So on a
    // desktop→mobile→desktop resize this line used to hide a fresh set of
    // cards that nothing would ever reveal again: the intro effect below
    // only depends on `[armed]` (unchanged by a resize) and the reveal
    // fallback bails out on `revealedRef.current`, which the first intro
    // already set. Result: an empty reel until a hard reload.
    //
    // Once revealed, render() above has already written the correct
    // autoAlpha per card (1 for the active card and its two neighbours, 0
    // for the parked ones), so there is nothing to hide.
    if (!revealedRef.current) gsap.set(cards, { autoAlpha: 0 });

    const onResize = () => render();
    window.addEventListener('resize', onResize);

    // --- Drag ---------------------------------------------------------
    // Wired in this always-run mount effect, never gated on `armed`: cards
    // position themselves via gsap.set regardless, so gating drag on the
    // intro made a failure there look like "renders fine, won't drag".
    // Move/up live on `window` so a drag survives the pointer leaving the
    // reel, with no dependency on setPointerCapture.
    viewport.style.cursor = 'grab';
    let dragging = false;
    let lastY = 0;
    // Tap detection: remember where the press started and which card it
    // landed on, so a press that barely moves opens that card instead of
    // being treated as a (zero-distance) drag.
    let downX = 0;
    let downY = 0;
    let downCard: HTMLDivElement | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (expandedRef.current !== null) return; // reel is frozen while a card is open
      dragging = true;
      // Hands the reel to the visitor: no self-advance until they let go.
      stopAutoplay();
      lastY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
      downCard = (e.target as HTMLElement | null)?.closest<HTMLDivElement>('[data-card]') ?? null;
      viewport.style.cursor = 'grabbing';
      e.preventDefault();
      gsap.killTweensOf(cards);
      goFlat();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      // Dragging down moves cards down, so the offset runs opposite. No
      // clamping anywhere — the wrap in posOf() handles the endless loop.
      // `flat` keeps easing underneath via its own tween; render() blends
      // whatever value it has reached, so the drag never cancels the ease.
      stateRef.current.offset -= dy;
      render();
    };

    const endDrag = (e?: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      viewport.style.cursor = 'grab';
      // The reel resumes advancing on its own from wherever the visitor left
      // it — including on the tap-to-open path below, where advanceOne() holds
      // itself off (expandedRef) for as long as the card stays open.
      queueAutoplay();

      // Moved less than a few px? That was a click, not a drag — open the
      // card that was pressed.
      const travel = e ? Math.hypot(e.clientX - downX, e.clientY - downY) : Infinity;
      if (travel < 6 && downCard) {
        openCard(Number(downCard.dataset.card), downCard);
        // Settle underneath so the reel is in its resting state behind the
        // overlay, and lands correctly when the card closes again.
        settle();
        return;
      }

      settle();
    };

    // Mouse only: a finger "hovering" is meaningless, and on a touchscreen
    // laptop a tap fires pointerenter too — which would leave `hovering` stuck
    // true after the finger lifted and stall the reel permanently.
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hoveringRef.current = true;
    };
    const onPointerLeave = () => {
      hoveringRef.current = false;
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointerenter', onPointerEnter);
    viewport.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // If `armed` never arrives, still reveal rather than leaving a blank reel.
    const revealFallback = window.setTimeout(() => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      render();
      queueAutoplay();
    }, 2500);

    // Autoplay normally starts from the intro effect below, once the reveal pop
    // has played. This covers the OTHER way of arriving on the desktop branch:
    // resizing back across 901px, where the intro effect bails out on
    // `revealedRef` and so would never re-queue — leaving a reel that had
    // silently stopped advancing until a reload.
    if (revealedRef.current) queueAutoplay();

    return () => {
      window.clearTimeout(revealFallback);
      stopAutoplay();
      hoveringRef.current = false;
      window.removeEventListener('resize', onResize);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointerenter', onPointerEnter);
      viewport.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      gsap.killTweensOf(cards);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Capture the card's on-screen rect so the panel can fly out from exactly
  // where the card is (FLIP), then mount the overlay.
  const restoreSourceCard = () => {
    const src = sourceElRef.current;
    if (!src) return;
    src.style.visibility = '';
    sourceElRef.current = null;
  };

  const openCard = (index: number, el: HTMLElement) => {
    if (Number.isNaN(index)) return;
    const r = el.getBoundingClientRect();
    originRef.current = { top: r.top, left: r.left, width: r.width, height: r.height };

    // Hide the card being expanded for as long as the panel is open, so the
    // panel reads as THAT card having moved forward. The backdrop is only 85%
    // opaque, so otherwise you could still see the original sitting in the
    // reel behind it while its "copy" floated in the middle — which is exactly
    // the duplicate-looking effect this is meant to avoid.
    //
    // `visibility`, never `display: none` — the card must keep occupying its
    // slot, or the row would reflow and the scroll position would jump.
    //
    // Mobile only: on desktop GSAP owns `visibility` on every card (it writes
    // it via autoAlpha in render()), so it would just overwrite this on the
    // next frame. The desktop panel also covers its own source card anyway.
    restoreSourceCard();
    if (isMobile) {
      sourceElRef.current = el;
      el.style.visibility = 'hidden';
    }

    expandedRef.current = index;
    setExpanded(index);
  };

  const closeExpanded = () => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const o = originRef.current;
    if (!panel || !backdrop || !o) {
      expandedRef.current = null;
      setExpanded(null);
      return;
    }
    gsap.to(backdrop, { autoAlpha: 0, duration: 0.35, ease: 'power2.in' });
    gsap.to(panel, {
      top: o.top,
      left: o.left,
      width: o.width,
      height: o.height,
      borderRadius: 12,
      duration: 0.5,
      ease: 'expo.inOut',
      onComplete: () => {
        expandedRef.current = null;
        setExpanded(null);
      },
    });
  };

  // Play the open transition once the panel exists in the DOM. useLayoutEffect
  // so the panel is positioned on the card's rect BEFORE first paint —
  // otherwise it flashes at the centred size for one frame.
  useLayoutEffect(() => {
    if (expanded === null) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const o = originRef.current;
    if (!panel || !backdrop || !o) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let w: number;
    let h: number;
    if (isMobile) {
      // Full available width, but NOT full available height: the height is
      // capped to a card-like ratio (see MOBILE_PANEL_MAX_ASPECT) instead of
      // swallowing the whole screen, which was stretching it into a tall
      // column. Keeps a real band of backdrop on every side too (see
      // MOBILE_PANEL_*) so there is always somewhere comfortable to tap to
      // close, since there is no X button.
      const gapX = Math.max(MOBILE_PANEL_MIN_GAP, vw * MOBILE_PANEL_GAP_RATIO);
      const gapY = Math.max(MOBILE_PANEL_MIN_GAP, vh * MOBILE_PANEL_GAP_RATIO);
      w = vw - gapX * 2;
      h = Math.min(vh - gapY * 2, w * MOBILE_PANEL_MAX_ASPECT);
    } else {
      // Desktop: large, but always fully on screen — fit a 16:9 box inside
      // 82% width and 78% height, whichever constraint binds first.
      w = Math.min(vw * 0.82, 1120);
      h = (w * 9) / 16;
      if (h > vh * 0.78) {
        h = vh * 0.78;
        w = (h * 16) / 9;
      }
    }

    gsap.set(panel, {
      top: o.top,
      left: o.left,
      width: o.width,
      height: o.height,
      borderRadius: 12,
    });
    gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(panel, {
      top: (vh - h) / 2,
      left: (vw - w) / 2,
      width: w,
      height: h,
      borderRadius: 20,
      duration: 0.6,
      ease: 'expo.inOut',
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExpanded();
    };
    window.addEventListener('keydown', onKey);

    // Lock page scroll — both directions — while a card is open.
    //
    // `overflow: hidden` on <body> alone is not enough: iOS Safari happily
    // scrolls past it. Pinning the body with position:fixed at a negative top
    // equal to the current scroll offset is the reliable cross-browser lock;
    // it looks identical because the page is held exactly where it was, and
    // the scroll position is restored on close.
    //
    // padding-right compensates for the scrollbar that disappears when the
    // body stops scrolling — without it the page content jumps sideways by
    // the scrollbar's width on open and back again on close.
    const scrollY = window.scrollY;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      overscroll: document.documentElement.style.overscrollBehavior,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      window.removeEventListener('keydown', onKey);
      // Reveal the card again. This cleanup runs when `expanded` goes back to
      // null — i.e. at the END of the close animation, once the panel has
      // already shrunk back onto the card's slot — so the swap is invisible.
      // Covers every close path, plus unmounting while still open.
      restoreSourceCard();
      // Scroll stays locked for the whole transition, for the same reason.
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
      document.documentElement.style.overscrollBehavior = prev.overscroll;
      // Un-pinning the body would otherwise drop the page back to the top.
      window.scrollTo(0, scrollY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Intro reveal — their values: active pops 1.25→1.4, neighbours 0.85→1,
  // both on back.out(1.3) over 0.4s.
  useEffect(() => {
    // Mobile cards are plain flow content and already visible — no intro pop
    // (the reference doesn't run one there either).
    if (isMobile || !armed || revealedRef.current) return;
    revealedRef.current = true;
    const m = metrics();
    if (!m) return;

    render();

    const active: HTMLDivElement[] = [];
    const neighbours: HTMLDivElement[] = [];
    m.cards.forEach((card, i) => {
      const pos = Math.abs(posOf(i, m));
      if (pos < m.step / 2) active.push(card);
      else if (pos < m.step * 1.5) neighbours.push(card);
    });

    gsap.to([...active, ...neighbours], { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(
      active,
      { scale: 1.25 },
      { scale: ACTIVE_SCALE, ease: 'back.out(1.3)', duration: 0.4 },
    );
    gsap.fromTo(neighbours, { scale: 0.85 }, { scale: 1, ease: 'back.out(1.3)', duration: 0.4 });

    // First self-advance one full hold after the intro, so the card the visitor
    // lands on gets its beat before the reel starts moving.
    queueAutoplay();
    // `isMobile` is a real dependency, not just a guard: someone who loads
    // the page narrow and then widens it reaches desktop with `armed`
    // ALREADY true, so an `[armed]`-only dep list never re-ran this and the
    // reel sat hidden until the 2.5s fallback in the effect above bailed it
    // out. `revealedRef` still keeps the pop animation itself one-shot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, isMobile]);

  return (
    <div
      ref={viewportRef}
      aria-hidden="true"
      // MOBILE (<901px): full-bleed native horizontal scroll-snap carousel —
      //   negative margins cancel the hero's side padding so cards can run
      //   edge to edge, matching the reference's
      //   `width: calc(100% + 2*margin); margin-left: -margin`.
      // DESKTOP (>=901px): back to a fixed-size box whose children are
      //   absolutely positioned and driven by GSAP.
      // `22vw` / `min-w-[220px]` / `max-w-[320px]`: narrowed from an earlier
      // `34vw`/300–480px pass. The headline beside it (see PlansHero) must
      // fit as ONE unbroken line per side, and an 8-character phrase only
      // fits that line at a legible size if this reel gives up some width —
      // the max-w also keeps it from outgrowing the row's own `max-w-6xl`
      // cap on wide monitors, which used to squeeze the headline columns
      // toward zero.
      className={`relative -mx-4 flex h-auto touch-pan-x snap-x snap-mandatory gap-[15px] overflow-x-auto overflow-y-hidden px-[30px] md:-mx-6 min-[901px]:mx-0 min-[901px]:block min-[901px]:h-full min-[901px]:w-[22vw] min-[901px]:min-w-[220px] min-[901px]:max-w-[320px] min-[901px]:touch-none min-[901px]:snap-none min-[901px]:gap-0 min-[901px]:overflow-hidden min-[901px]:px-0 [&::-webkit-scrollbar]:hidden ${
        className ?? ''
      }`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', scrollbarWidth: 'none' }}
    >
      {/* Desktop cards are absolutely positioned — their layout contributes
          nothing to document flow, so the reel can never add page height
          (half-viewport track padding was what inflated the page
          previously). Horizontal centring uses left/right + mx-auto rather
          than a translate, so it can't fight the y transform gsap writes. */}
      {isMobile
        ? // In-flow, one-card-wide, snapping to centre — the reference's
          // `width: calc(100vw - 60px); max-width: 500px; scroll-snap-align:
          // center`.
          // `key` is branch-prefixed — see the desktop branch's note.
          // The real cards repeated `MOBILE_LOOP_COPIES` times, so the native
          // scroller can be recentred mid-scroll and appear endless (see
          // MOBILE_LOOP_COPIES). `data-card` carries the REAL index so
          // clicking any repeat opens the right card.
          Array.from({ length: MOBILE_LOOP_CARDS }, (_, i) => (
            <div
              key={`m-${i}`}
              data-card={i % REAL_CARD_COUNT}
              onClick={(e) => openCard(i % REAL_CARD_COUNT, e.currentTarget)}
              className="relative aspect-[16/9] w-[calc(100vw-60px)] max-w-[500px] shrink-0 snap-center rounded-xl bg-[#0b1340]"
            />
          ))
        : // Absolutely positioned; GSAP owns the transform. Opens via the
          // pointerdown/up tap detection in the effect above (so a drag
          // never counts as a click) — no onClick needed here. Cards are
          // 70% of the viewport width so the 1.4x active card still fits
          // without clipping.
          // `key` MUST stay branch-prefixed (`d-` here, `m-` on mobile).
          // Both branches render a plain <div> in the same parent slot, so a
          // shared `key={i}` made React reconcile them as the SAME element —
          // no unmount, same DOM node reused across the breakpoint. GSAP's
          // inline `visibility/opacity/transform` are invisible to React's
          // style diffing (they were never in a `style` prop), so they rode
          // along onto the mobile card and the whole carousel showed up
          // hidden the moment the window was resized. Distinct keys force a
          // real remount, which is the only thing that reliably guarantees a
          // clean node.
          // Padded reel count, so the loop's recycle point stays off-screen
          // even when there are only a few real cards. `data-card` carries the
          // REAL index (`i % REAL_CARD_COUNT`), so clicking any repeat of a
          // card opens that card rather than its position in the reel.
          Array.from({ length: REEL_CARD_COUNT }, (_, i) => (
            <div
              key={`d-${i}`}
              data-card={i % REAL_CARD_COUNT}
              ref={(el) => {
                cardEls.current[i] = el;
              }}
              className="absolute left-0 right-0 mx-auto aspect-[16/9] w-[70%] max-w-none rounded-xl bg-[#0b1340]"
              style={{ top: 0, willChange: 'transform, opacity' }}
            />
          ))}

      {/* Portalled to <body>: the reel is overflow-hidden, and a fixed child
          would also be trapped by any transformed ancestor. A portal sidesteps
          both without depending on the ancestor chain staying transform-free. */}
      {expanded !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div aria-hidden="true">
            {/* Black, NOT the card's navy (#0b1340) — a same-colour backdrop
                made the transition read as "a new card appeared on a navy
                wash" instead of "this card grew": the instant-opacity
                backdrop and the still-growing panel were indistinguishable,
                so the eye saw the whole screen snap to card-colour before
                the panel had visibly expanded. A neutral scrim keeps the
                panel legible as the same card the whole way through — it's
                the only thing on screen that's ever card-coloured. Still
                near-opaque (not translucent) so the reel's other cards don't
                show through as smudgy blobs behind it. */}
            <div
              ref={backdropRef}
              onClick={closeExpanded}
              className="fixed inset-0 z-[120] bg-black/85"
            />
            {/* No close button by design — tapping away (the backdrop)
                dismisses it. Escape still works as a keyboard equivalent. */}
            <div
              ref={panelRef}
              className="fixed z-[121] overflow-hidden bg-[#0b1340] shadow-2xl"
              style={{ position: 'fixed' }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
