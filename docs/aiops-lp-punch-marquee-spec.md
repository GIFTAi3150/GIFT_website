# LP punch line — weight-shift marquee (2026-08-03, rev 2)

The closing line of the flow section (`.lp-flow-punch`) as a scroll-scrubbed
marquee whose letter weight peaks wherever the text crosses the **centre of the
screen**.

Scope is exactly two places on the page: `LpFlow` renders one punch line per
concept, and `page.tsx` renders `LpFlow` twice (A案 / B案). Nothing else gets
this treatment.

## ⚠️ rev 2 — the weight model in rev 1 was wrong

Rev 1 animated `font-weight` on the whole paragraph across the scrub: the entire
sentence got heavier, peaking at the timeline's midpoint. That is not the effect.

The client supplied a screenshot of the reference. **The bold zone is anchored to
the centre of the viewport and does not move.** The sentence travels through it,
and each character is heavy only while it is passing the centre — so the bold
region appears to slide along the sentence. In the screenshot roughly five
characters are bold mid-sentence while everything either side is light.

In the client's words: *"if we have the x axis and the length of the whole
sentence is idk 300 then the half is 150, so every time we are at 150px that part
gets bold in a considerable width."*

So weight is a function of **each character's screen x**, not of scroll progress:

```
weight(char) = 200 + 700 · smoothstep(1 − min(|charCentreX − viewportCentreX| / R, 1))
```

…recomputed every frame as the line moves. `R` is the radius of the bold window.

### Consequence: the sentence must be split per character

Rev 1 kept it as one paragraph, on the strength of the tutorial preview's claim
that the sentence "is treated as a single paragraph element". That refers to the
markup; the weight is unmistakably per character in the reference image.

**The earlier objection to splitting does not apply here.** The reason splitting
was rejected for the opacity reveal was Japanese line-breaking — per-character
boxes break `kinsoku` and would make the sentence unwrappable. In the marquee the
line is `white-space: nowrap` on a single line, so there is no wrapping to
protect. And the spans stay **plain inline** (weight needs no transform), so the
static fallback still wraps normally.

## Everything else from rev 1 stands

- **Variable font is mandatory.** `src/app/(lp)/layout.tsx` requests
  `wght@100..900` (a range → variable font). A `700;800;900` list serves three
  static instances and the weight would snap between them. Already applied; do
  not revert.
- `position: sticky`, never ScrollTrigger `pin`. No pin-spacer anywhere on the
  LP, so nothing above or below can have its offsets shifted.
- Track height in `svh` (scroll budget), pane height in `100dvh` (viewport fill).
- All marquee behaviour scoped under `.lp-punch-live`, added by `LpMotion` below
  its `prefers-reduced-motion` bail. Reduced motion and no-JS keep a plain
  static wrapping paragraph — horizontal travel is exactly what that setting
  exists to suppress.
- The timeline above is in normal flow and is not touched by any of this.

---

## 1. `src/app/(lp)/lp/_components/LpFlow.tsx`

REPLACE the punch paragraph:

```tsx
          <p className="lp-flow-punch">{flow.punch}</p>
```

…with:

```tsx
          {/* Split per character because the weight wave is anchored to the
              SCREEN, not to the sentence: each character is heavy only while it
              is passing the centre of the viewport, so every character needs its
              own weight. See docs/aiops-lp-punch-marquee-spec.md.

              Plain inline spans — weight needs no transform, so no inline-block.
              That keeps the static fallback a normally-wrapping Japanese
              paragraph; per-character inline-BLOCK would break kinsoku and make
              it unwrappable. Safe to split here only because the live marquee is
              nowrap on one line. */}
          <p className="lp-flow-punch">
            {Array.from(flow.punch).map((ch, i) => (
              <span className="lp-punch-char" key={i}>
                {ch}
              </span>
            ))}
          </p>
```

Nothing else in the file changes. The `.lp-punch` / `.lp-punch-pane` wrappers and
the `.lp-inner` nesting are already correct.

---

## 2. `src/app/(lp)/lp/_components/LpMotion.tsx`

REPLACE everything from the `// Travel is linear:` comment through the end of the
weight tweens — i.e. both `tl.fromTo(...)` calls and the trailing
`.to(line, { fontWeight: 200 ... }, 0.5)` — with the following. Keep the
`const tl = gsap.timeline({...})` block above it exactly as it is.

```ts
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
```

⚠️ Do **not** also tween `fontWeight` on `line`. A paragraph-level weight tween
would fight the per-character writes and is the exact bug rev 2 exists to fix.

⚠️ Standing project rules, both satisfied: no `once: true` on a timeline, no
`clearProps: 'all'`.

### Cleanup

`ScrollTrigger.addEventListener('refresh', ...)` is global and is **not** undone
by `ctx.revert()`. The existing cleanup at the bottom of the effect must also
remove it. Collect the handlers so they can be released:

Immediately before the `gsap.utils.toArray<HTMLElement>('.lp-punch')` loop, add:

```ts
      // ScrollTrigger's global refresh listeners survive ctx.revert(), so they
      // are tracked here and removed in the effect's cleanup below.
      const onRefresh: Array<() => void> = [];
```

Inside the loop, replace the bare `ScrollTrigger.addEventListener('refresh', paint);`
with:

```ts
        ScrollTrigger.addEventListener('refresh', paint);
        onRefresh.push(paint);
```

⚠️ `onRefresh` is declared inside the `gsap.context(() => { ... })` callback but
the cleanup runs outside it. Declare it **above** the `const ctx = gsap.context(`
line instead, at the top of the `useEffect` body, so both scopes can see it.

Then in the existing return block, add the removal alongside the current
teardown:

```ts
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      onRefresh.forEach((fn) => ScrollTrigger.removeEventListener('refresh', fn));
      ctx.revert();
    };
```

---

## 3. `src/app/(lp)/lp.css`

One change. In `.lp-punch-live .lp-flow-punch`, the `font-weight: 200`
declaration now only sets the pre-paint value; add `.lp-punch-char` below the
block so the fallback is explicit:

```css
/* Weight is written per character by LpMotion, from each one's distance to the
   centre of the screen. Unstyled otherwise — plain inline spans, so the static
   fallback wraps like ordinary Japanese text. Do NOT give these
   `display: inline-block`: it would break kinsoku in the wrapping fallback. */
.lp-punch-char {
  font-weight: inherit;
}
```

No other CSS changes. `.lp-punch`, `.lp-punch-pane`, the `svh`/`dvh` split and
the phone rules all stay as they are.

---

## 4. Verification

- `npx tsc --noEmit` clean; `npm run build` succeeds.
- `node scripts/check-encoding.mjs` clean.
- `wght@100..900` still present in `layout.tsx`; zero hits for `wght@700`.
- Zero hits for `pin:` in `LpMotion.tsx`.
- `.lp-flow-punch` still absent from the `'.lp-lead, .lp-cta-inner > p'` selector.
- No `fontWeight` tween remains on `line` — weight is only ever written inside
  `paint()`.
- `src/data/lp-variants.ts` and `page.tsx` unchanged.
- Manual on `/lp` at **1440×900** and **390px**, scrolling down and back up:
  - only the characters near the **centre of the screen** are bold, and the bold
    zone stays put while the sentence slides through it — this is the whole fix;
  - the bold zone covers several characters, not one, and fades off at its edges
    rather than switching;
  - weight **glides**; if it steps between a few thicknesses the variable font
    is not loading;
  - the timeline above still behaves exactly as before;
  - no horizontal page scrollbar at any point.
- With OS "reduce motion" on: a plain static wrapping paragraph at the base
  weight, no travel, no per-character weighting, section at normal height.
