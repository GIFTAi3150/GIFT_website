# LP punch marquee — full traverse + readable pace

Fix spec for the closing weight-shift marquee on `/lp`
(`.lp-punch` / `.lp-flow-punch`, section `LpFlow.tsx`).
Supersedes the travel and budget numbers in
`docs/aiops-lp-punch-marquee-spec.md`; everything else in that spec stands.

## Reported symptom

On a phone the sentence 「人を増やす前に、繰り返しの仕事をAIに残す。」 is cropped at
the frame edges and the section ends before the sentence has finished crossing.

## Root cause 1 — the travel is a % of the sentence, not a crossing of the screen

`LpMotion.tsx` animates `xPercent: 62 → -62`, i.e. 124% of the LINE's own width.
A full crossing needs `lineWidth + paneWidth`, so 124% is only enough when

```
1.24·W ≥ W + V   →   W ≥ 4.17·V        (W = line width, V = pane width)
```

Real ratios on this page:

| viewport | font-size | W (≈20.7em) | V (pane) | W/V | needed | actual |
|---|---|---|---|---|---|---|
| 390×844 phone | 50.7px | ~1050px | 343px | 2.9× | ±66% | ±62% |
| 1440×900 laptop | 117px | ~2425px | 1272px | 1.9× | ±77% | ±62% |

So the head is already inside the frame at progress 0 and the tail is still
inside it at progress 1 — on desktop by ~3 characters at each end. The line
never enters and never exits. `xPercent` cannot fix this by being bigger,
because the required percentage depends on `V/W`, which is different at every
viewport. It has to be measured in pixels.

## Root cause 2 — the mobile budget is one flick

`.lp-punch-live` is `170svh` on ≤920px with a `100dvh` sticky pane, so the pane
is stuck for `170svh − 100dvh` ≈ **450px** on a 390×844 phone, while the line
has ~1400px to cross: **3.1px of travel per px of scroll**. One swipe consumes
the entire interval, and with `scrub: 0.5` the remaining travel eases out after
the pane has already unstuck and started scrolling away. That is the "it stops
right before the end" half of the report.

Target pace: **~1.5px of travel per px of scroll on mobile, ~2px on desktop**
(desktop's current pace — hold it, since the crossing gets ~23% longer).

---

## Change 1 — `src/app/(lp)/lp/_components/LpMotion.tsx`

### 1a. Add `invalidateOnRefresh` to the punch ScrollTrigger

Find (inside `gsap.utils.toArray<HTMLElement>('.lp-punch').forEach(...)`):

```tsx
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            // Exactly the interval the sticky pane is stuck for.
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        });
```

Replace with:

```tsx
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
```

### 1b. Replace the percentage travel with a measured full crossing

Find:

```tsx
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
```

Replace with:

```tsx
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
```

Note for the executor: `line.offsetWidth` is the untransformed layout width, so
it stays correct no matter where the tween currently has the line. Do not
substitute `getBoundingClientRect().width`, which would feed the tween's own
transform back into its distance.

### 1c. Re-measure once the webfont has swapped

Both `paint()` and the new `travel()` measure text, and the LP's variable font
can swap in after `load`. Find, near the end of the effect:

```tsx
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    window.addEventListener('load', refresh);
```

Replace with:

```tsx
    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    window.addEventListener('load', refresh);
    // The punch marquee's crossing distance is measured off rendered text, so a
    // webfont that swaps in after `load` changes it. Cheap and idempotent — this
    // is the same refresh the two lines above already schedule.
    document.fonts?.ready.then(refresh);
```

Nothing else in that cleanup block changes; `ctx.revert()` already clears the
transform, and `x` reverts exactly like `xPercent` did.

---

## Change 2 — `src/app/(lp)/lp.css`

### 2a. Desktop budget: 260svh → 300svh

The crossing gets ~23% longer on desktop (3007px → ~3730px on a 1440-wide
window), so the budget grows with it or the pace speeds up by the same 23%.

Find:

```css
.lp-punch-live {
  /* svh — this is a SCROLL BUDGET, and in vh it lengthens when mobile chrome
     collapses, which would leave the line still travelling after the pane has
     unstuck. */
  height: 260svh;
```

Replace with:

```css
.lp-punch-live {
  /* Scroll budget for the crossing. The pane is stuck for (height − 100dvh) and
     the line has to travel (paneWidth + lineWidth) in that distance — ~3730px on
     a 1440-wide window, which at the current ~2px of travel per px of scroll
     needs ~1800px. 300svh − 100dvh is that. Was 260svh, correct only while the
     travel was 20% short of an actual crossing; do not put it back without
     shortening the crossing too.

     svh — this is a SCROLL BUDGET, and in vh it lengthens when mobile chrome
     collapses, which would leave the line still travelling after the pane has
     unstuck. */
  height: 300svh;
```

### 2b. Mobile budget: 170svh → 230svh

In the `@media (max-width: 920px)` block. Find:

```css
  /* Shorter travel and smaller type on a phone: the line still crosses, but a
     260svh commitment for one sentence is too much of a small screen. */
  .lp-punch-live {
    height: 170svh;
```

Replace with:

```css
  /* Smaller type on a phone — but NOT a shorter crossing. The sentence is ~3× the
     screen wide here, so it needs about a screen of scroll to get through. At the
     old 170svh the pane was stuck for ~450px against ~1400px of travel: one flick
     consumed the whole interval and the `scrub: 0.5` tail then played out after
     the pane had unstuck, so the section left mid-sentence. 230svh − 100dvh
     ≈ 900px ≈ 1.5px of travel per px of scroll. */
  .lp-punch-live {
    height: 230svh;
```

Leave `margin-top: -32dvh`, `padding-bottom: 6dvh` and the mobile `font-size`
clamp exactly as they are — they set where the line rests and how big it is,
neither of which is the bug.

---

## Verification

- `npx tsc --noEmit` must pass.
- **Do NOT run `npm run build`** — the user's dev server is running and a
  concurrent build corrupts its `.next` chunks. `tsc` only.
- Do not start a dev server or open a port. The user owns 3000.
- Grep-check afterwards that `xPercent` no longer appears anywhere in the
  `.lp-punch` block of `LpMotion.tsx`, and that `lp.css` contains no remaining
  `260svh` or `170svh`.

## Out of scope — do not touch

- `paint()`, the smoothstep weight curve, and the bold-window `radius`.
- The `.lp-punch-char` split in `LpFlow.tsx`.
- The static / reduced-motion fallback: every rule stays scoped under
  `.lp-punch-live`, and no horizontal travel may leak into the base rules.
- The copy in `src/data/lp-variants.ts`.
