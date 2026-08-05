# LP hero motion — masked line reveal in, scrubbed masked exit out

Status: spec, ready to apply. 2026-08-05.
Approved by the user 2026-08-05 after a research pass. **Removes the hero from
the effect097 line-spread** and gives it its own motion.

## 1. Why the hero stops using the line-spread

Three structural reasons, none of them taste:

1. **It animates the one axis this frame cannot spare.** effect097 works by
   varying `letter-spacing` — making lines physically wider is its entire
   mechanism. The film's burned-in caption owns the right ~15% of the frame,
   which is why `.lp-hero-copy` already carries an asymmetric right padding. An
   effect whose job is to widen lines is in direct conflict with the only hard
   spatial constraint this hero has.
2. **It is keyed to the wrong clock.** effect097 maps *absolute viewport
   position* to tracking: settled at or above 62% of the screen, opening below.
   The hero copy is anchored 20% up a frame that is roughly one viewport tall,
   so it permanently sits at ~61–80% of the screen — parked in the loose half of
   the curve with no runway to travel through it. That is why the sub and the
   lower headline lines currently *arrive* with their tracking blown open. It is
   not a tuning problem: the effect is built for copy that scrolls through the
   viewport, and this copy does not.
3. **The vocabulary was already spent.** Letter-spacing is the timeline section,
   font-weight is the punch marquee, rotation/arc is the cards. The standing
   rule is that one motion is not reused across the page, and the first thing
   anyone sees was running the page's shared effect.

## 2. What replaces it

`SplitText` with **`mask: 'lines'`**, which wraps every rendered line in a div
with `overflow: clip`. That wrapper is the point: **every movement happens behind
a clip edge, so the copy's horizontal extent never changes.** The effect is
structurally incapable of reaching the caption — that is why this family was
chosen over a skew, a wave, or the spread.

Three parts, all on the same idea — *the copy gets out of the film's way*:

- **Arrival.** Lines rise out from behind their own masks, `yPercent 118 → 0`,
  staggered top-down, headline first and sub trailing. Plays once per hero when
  it comes into view.
- **Departure.** A scrubbed timeline on `.lp-hero`: lines retreat back behind
  their masks going up, **bottom line first**, while the whole copy block drifts
  up. Because it is a scrub and not a play-once, it is fully reversible — no
  "fades out when you scroll back up" glitch.
- **The scrim leaves with the copy.** `.lp-hero-scrim` fades to 0 on the same
  scrub. The scrim exists only to keep the copy legible; once the copy is gone it
  is just dimming the film for no reason. So the darkening lifts as you scroll
  and the visitor is handed the clean frame — burned-in punchline included — at
  full contrast.

Line-level and not character-level, deliberately: Japanese line breaking (禁則処理)
is the browser's job and splitting to characters takes it away. `autoSplit: true`
re-splits on resize and on late webfonts, which is exactly when the rendered
breaks change.

GSAP is 3.15.0 and `SplitText` is already imported in `LpMotion.tsx`, so `mask`
costs nothing new. Native CSS scroll-driven animations were considered and
rejected: ~84% support, not Baseline, and this codebase has a documented history
of iOS-specific motion failures.

## 3. `src/app/(lp)/lp/_components/LpHero.tsx` — one added element

The scrim is currently `.lp-hero::before`. GSAP cannot tween a pseudo-element,
and routing it through a CSS custom property would animate a full-viewport
gradient through style recalc every frame. It becomes a real element so its
`opacity` can be animated directly, which the compositor can handle.

Add as the **first** child of `<section className="lp-hero">`, immediately before
`<div className="lp-hero-media">`:

```tsx
      {/* Legibility scrim for the overlaid copy. A real element rather than a
          pseudo-element because LpMotion fades it out on scroll — the copy is
          what it exists for, so it leaves when the copy leaves and hands the
          frame back clean. Geometry and the reason it stops before the right
          edge: .lp-hero-scrim in lp.css. */}
      <div className="lp-hero-scrim" aria-hidden="true" />
```

Nothing else in the file changes.

## 4. `src/app/(lp)/lp.css`

### 4.1 `.lp-hero::before` becomes `.lp-hero-scrim`

Keep the entire existing comment block and the entire `background` value
**verbatim**. Only the selector and the positioning change — a real element needs
`position: absolute` rather than inheriting the pseudo-element's behaviour, and
it no longer needs `content`.

Amend the comment's last line (currently the sentence beginning "Uses ::before
because ::after is the scanline texture…") to:

```
   A real element, not ::before: LpMotion fades this out on the hero's exit
   scrub and GSAP cannot tween a pseudo-element. z-index 1 puts it above the
   video and below .lp-hero-copy and .lp-sound, which are both z-index 2. */
```

and the rule becomes:

```css
.lp-hero-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: /* ← unchanged, copy the existing two linear-gradients exactly */;
}
```

The `content: '';` declaration is removed. **Do not retype the gradient stops** —
move the existing value across as-is.

### 4.2 Nothing else

No CSS is needed for the split lines. SplitText sets `display: block` on the
lines and `overflow: clip` on the mask wrappers itself.

⚠️ Do **not** add `overflow-clip-margin` to the mask wrappers. It is tempting
(the h1's `text-shadow` is clipped at each line box) but it enlarges the clip
region, and a line parked at `yPercent: 118` would then leak a sliver into view.
The only visible cuts are at the very top of the first line and the very bottom
of the last, in a 0.55-alpha blur over footage — accept them.

## 5. `src/app/(lp)/lp/_components/LpMotion.tsx`

### 5.1 Take the hero out of the line-spread

At the spread block, change the target list from

```tsx
        .toArray<HTMLElement>('.lp-hero-copy, .lp-tl .lp-inner')
```

to

```tsx
        .toArray<HTMLElement>('.lp-tl .lp-inner')
```

and add to the block comment above it, after the 「Derivation」 line:

```
      // ⚠️ The HERO deliberately does not use this. It animates letter-spacing,
      // i.e. line WIDTH, and the film's burned-in caption owns the right edge of
      // that frame. The hero has its own motion above, which moves only
      // vertically and only behind a clip edge. Do not add '.lp-hero-copy' back
      // to this selector — see docs/aiops-lp-hero-motion-spec.md §1.
```

Everything else in the spread block — `MAX`, `SETTLE`, `RANGE`, `measure`,
`paint`, the `.lp-sline` class, its ScrollTrigger — is unchanged.

### 5.2 Track the exit timelines for cleanup

`gsap.context` only auto-collects animations created during its own synchronous
run. The exit timelines are built later, from a callback, so they must be tracked
by hand — the same pattern this file already uses for `onRefresh`.

Directly below the existing `const onRefresh: Array<() => void> = [];` add:

```tsx
    // Hero exit timelines. Built from an onComplete callback (see below), which
    // is after gsap.context() has finished collecting, so ctx.revert() will not
    // catch them. Tracked here and killed in the effect's cleanup instead.
    const heroExits: gsap.core.Timeline[] = [];
```

and in the cleanup at the bottom of the effect, directly above `ctx.revert();`:

```tsx
      heroExits.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
```

### 5.3 Replace the hero block

Replace the whole existing `/* --- hero --- */` block (the comment plus the
`gsap.utils.toArray<HTMLElement>('.lp-hero-copy').forEach(...)` call — everything
up to but NOT including the `// The SCROLL cue is the one thing that loops.`
comment) with:

```tsx
      /* ------------------------------------------------------------ hero */
      // Masked line reveal in, scrubbed masked exit out. The full argument for
      // this over the letter-spacing spread that used to run here — including
      // why a horizontal effect is structurally wrong for this frame — is in
      // docs/aiops-lp-hero-motion-spec.md.
      //
      // The idea in one line: the copy gets out of the film's way. Lines retreat
      // behind their own masks, the block drifts up, and the scrim goes with
      // them, so scrolling hands the visitor the clean frame — burned-in
      // punchline included — at full contrast.
      gsap.utils.toArray<HTMLElement>('.lp-hero').forEach((hero) => {
        const copy = hero.querySelector<HTMLElement>('.lp-hero-copy');
        const scrim = hero.querySelector<HTMLElement>('.lp-hero-scrim');
        if (!copy) return;

        const parts = gsap.utils.toArray<HTMLElement>('h1, p', copy);
        if (!parts.length) return;

        let exit: gsap.core.Timeline | null = null;

        // Built only once the intro has finished, and that ordering is
        // load-bearing. A scrubbed tween records its start values the first time
        // it renders, and ScrollTrigger renders it at progress 0 on every
        // refresh — of which this file schedules several (rAF, window load,
        // fonts.ready). Created up front it would either record the intro's
        // hidden yPercent as "settled", or stomp the intro's own from-state at
        // scroll 0. Created after, it records the real resting state.
        //
        // Known edge: scrolling within the intro's 0.9s means the exit is born
        // already part-way through its range and snaps to it. Rare, small, and
        // strictly better than the two failure modes above.
        const buildExit = (lines: HTMLElement[]) => {
          exit?.scrollTrigger?.kill();
          exit?.kill();

          exit = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              // A distance, NOT 'bottom top' or a percentage of the hero. On a
              // phone this hero is ~220px tall against an 844px viewport, so any
              // end expressed against the viewport resolves BEFORE the start and
              // the whole exit would be complete at scroll 0. Taking the smaller
              // of the two keeps the exit proportional on both.
              end: () =>
                '+=' + Math.round(Math.min(hero.offsetHeight, window.innerHeight) * 0.6),
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          exit
            // from: 'end' — the BOTTOM line goes first, so the block peels
            // upward rather than sliding off as a slab.
            .to(
              lines,
              {
                yPercent: -118,
                duration: 0.55,
                stagger: { each: 0.08, from: 'end' },
              },
              0,
            )
            // Counter-drift on the container. Small: the lines are already
            // travelling, this only stops the block from feeling pinned.
            .to(copy, { yPercent: -9, duration: 1 }, 0);

          if (scrim) exit.to(scrim, { opacity: 0, duration: 0.8 }, 0);

          heroExits.push(exit);
        };

        // One SplitText across BOTH the h1 and the p, not one each: `self.lines`
        // then holds every line of the block in source order, which is what the
        // single staggered intro and the single exit timeline need.
        //
        // mask: 'lines' wraps each line in a div with `overflow: clip`. That
        // wrapper is the entire mechanism — it is what lets a line travel a full
        // line-height without ever being visible outside its own box, and what
        // keeps every pixel of this effect off the caption.
        //
        // Lines are LINES, not characters: Japanese line breaking is the
        // browser's job and a character split takes it away. autoSplit re-splits
        // on resize and on late webfonts, i.e. exactly when the rendered breaks
        // change — so the animation is rebuilt inside onSplit and never holds a
        // reference to a line element that a re-split has replaced.
        SplitText.create(parts, {
          type: 'lines',
          linesClass: 'lp-hline',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => {
            const lines = self.lines as HTMLElement[];
            // Returned, so GSAP reverts and rebuilds it on the next re-split.
            return gsap.from(lines, {
              yPercent: 118,
              duration: 0.9,
              stagger: 0.09,
              ease: 'power4.out',
              scrollTrigger: enter(copy, 'top 95%'),
              onComplete: () => buildExit(lines),
            });
          },
        });
      });
```

Note `118` and not `100`: a line parked at exactly 100% sits flush with its
mask's edge, and a sub-pixel rounding error there shows a hairline of the glyph
tops. The extra 18% costs nothing because it is hidden either way.

## 6. Do not touch

The `.lp-scroll` loop, the headings block, the spread block's internals, the
punch marquee, the what-we-do fan, `LpFlow.tsx`, `LpSteps.tsx`, the hero's
`aspect-ratio`, `object-fit: contain`, and `.lp-hero-copy`'s asymmetric padding.

Do not put `object-fit: cover` on the video and do not give `.lp-hero` or
`.lp-hero-media` a height — both crop the caption. That ban is unrelated to this
change and still absolute.

## 7. Verify

1. `npx tsc --noEmit` — clean. If `mask` is rejected on the SplitText vars type,
   **stop and report** rather than casting it away; it would mean the installed
   GSAP is older than the docs assume.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build`, `npm run dev`, or any server.** The user owns
   port 3000 and a build in this tree corrupts their running dev server's chunks.
4. Grep `LpMotion.tsx` for `lp-hero-copy` and confirm it appears only inside the
   new hero block — never in the spread block's selector.
5. Confirm `heroExits` is declared once, pushed to in `buildExit`, and killed in
   the cleanup before `ctx.revert()`.
6. Confirm `lp.css` has no `.lp-hero::before` rule left and exactly one
   `.lp-hero-scrim` rule, and that the gradient value inside it is
   character-identical to what `.lp-hero::before` had.
7. Confirm `LpHero.tsx` renders `.lp-hero-scrim` as the first child of
   `section.lp-hero`.
8. Do not commit, stage or push.

Report the diff, both command results, items 4–7, and anything that did not
match.
