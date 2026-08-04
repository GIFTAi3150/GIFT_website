# LP what-we-do strip — mouse drag below 900px

## The bug

Below 900px the fan is replaced by a swipe strip: `.lp-what-wheel` becomes a
native `overflow-x: auto` scroller with `scroll-snap-type: x mandatory` and
`scrollbar-width: none`.

On a phone that is complete — the finger scrolls it. On a **narrow desktop
window** it is unreachable:

- a mouse wheel over a horizontal scroller does nothing in Chrome (vertical
  wheel is not translated to horizontal scroll without Shift),
- the scrollbar is deliberately hidden, so there is nothing to drag,
- and nothing in the page says the strip is scrollable at all.

Reported 2026-08-04: "I can't drag the cards."

## The fix, and what it deliberately is not

Mouse drag on the strip. **Only** for `pointerType === 'mouse'` — touch pointers
never enter the handler, so a phone keeps 100% native scrolling and the
tap-vs-scroll behaviour that a scrollLeft write during a touch gesture is known
to break on this machine.

Explicitly NOT done:

- **No rAF easing loop on `scrollLeft`.** That family of bugs cost /plans several
  sessions (a proportional ease that can never converge because scrollLeft
  rounds to whole pixels). Landing uses the browser's own
  `scrollTo({ behavior: 'smooth' })`.
- **No layout change.** The strip stays one layout below 900px. Splitting the
  breakpoint on `(pointer: fine)` / `(pointer: coarse)` would fix the symptom
  with zero JS, but it means two fallbacks to maintain and hybrid devices report
  the wrong one.
- **No autoplay, no loop, no re-centring.** Nothing moves unless a pointer moves
  it.

## Mechanics

1. **pointerdown** (mouse, primary button, and only if the strip actually
   overflows): record `clientX` and `scrollLeft`, capture the pointer so the
   drag survives leaving the element, add `.lp-wdrag`, and `preventDefault()` so
   the browser does not start a text selection instead.
2. **pointermove**: `scrollLeft = startLeft - (clientX - startX)`. Nothing else —
   no easing, no momentum.
3. **pointerup / pointercancel**: land on the nearest card with
   `scrollTo({ left: i * pitch, behavior: 'smooth' })`, where `pitch` is measured
   as `slots[1].offsetLeft - slots[0].offsetLeft` rather than recomputed from the
   `min(76vw, 320px)` width and the 12px gap. Snap positions are exactly
   `0, pitch, 2·pitch`: `scroll-padding-inline` matches the strip's own
   `padding-inline`, so slot 0's snap position is `scrollLeft: 0`.

**Snap has to come off for the duration of the drag** (`.lp-wdrag` sets
`scroll-snap-type: none`). With `x mandatory` live, the browser re-snaps after
every programmatic `scrollLeft` write, so the strip judders against the cursor
instead of following it.

**And it has to come back only once the landing scroll has finished** — restoring
`x mandatory` mid-flight cuts the smooth scroll short. So `.lp-wdrag` is removed
on `scrollend`, with a 500ms timeout as the fallback for browsers that do not
fire it (Safari). Both paths run the same idempotent `settle()`.

The `cursor: grab` / `grabbing` pair is the only thing that advertises any of
this. It costs touch devices nothing — they have no cursor.

---

## Change 1 — `src/app/(lp)/lp.css`

In the `@media (max-width: 899px)` block. FIND:

```css
    overflow-x: auto;
    /* Keeps a horizontal swipe from arming the browser's back gesture. */
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--wstrip-gutter);
    scrollbar-width: none;
  }
  .lp-what-wheel::-webkit-scrollbar {
    display: none;
  }
```

REPLACE WITH:

```css
    overflow-x: auto;
    /* Keeps a horizontal swipe from arming the browser's back gesture. */
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--wstrip-gutter);
    scrollbar-width: none;
    /* The only thing that advertises the mouse drag LpMotion binds here. A
       narrow desktop window cannot reach this strip otherwise: a vertical wheel
       is not translated to horizontal scroll, and the scrollbar is hidden two
       lines up. Touch devices have no cursor, so it costs them nothing. */
    cursor: grab;
  }
  .lp-what-wheel::-webkit-scrollbar {
    display: none;
  }
  /* Set by LpMotion for the duration of a mouse drag only. Snap MUST be off
     while the pointer is down: with `x mandatory` live the browser re-snaps
     after every programmatic scrollLeft write, so the strip judders against the
     cursor instead of following it. It is restored once the landing scroll has
     finished — see the scrollend handling in LpMotion. */
  .lp-what-wheel.lp-wdrag {
    cursor: grabbing;
    scroll-snap-type: none;
    user-select: none;
  }
```

## Change 2 — `src/app/(lp)/lp/_components/LpMotion.tsx`

A new `mm.add`, immediately after the closing `});` of the existing
`mm.add('(min-width: 900px) and (min-height: 660px)', ...)` block. FIND:

```tsx
        // ⚠️ Returned from the mm.add callback, NOT from the forEach — forEach
        // discards return values, so a per-section cleanup returned there is
        // silently dropped and `.lp-what-live` survives a resize down to the
        // static grid, where its sticky stage and 300svh budget are both wrong.
        return () => cleanups.forEach((fn) => fn());
      });
```

REPLACE WITH:

```tsx
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
```

## Verification

- `npx tsc --noEmit` must pass. `scrollend` is not in every TS DOM lib — if it
  errors on the listener name, report the exact error rather than casting to
  `any`.
- **Do NOT run `npm run build`** — the user's dev server is running and a
  concurrent build corrupts its `.next` chunks. `tsc` only.
- Do not start a dev server or open a port.

## Out of scope

- The fan, the burst, the breakpoint itself, the strip's widths/gaps/snap rules.
- Any change to touch behaviour.
