# LP「what we do」= effect070 card port

Reference: https://madewithgsap.com/effects/effect070 (code is paywalled; the
effect was read off the public demo reel at
`https://pub-8ca9b5847fbb4d4fb97b3497fb9521d5.r2.dev/video_OPTIM/070.mp4`,
1280×720 / 30fps / 5s, frame-extracted with ffmpeg).

## What the reference actually is

A horizontal row of equal-width, equal-gap, **flat** rounded cards on near-black,
travelling right → left:

- Card 0 is an **intro card** — solid red-orange gradient, small mono label top
  left, a place name, then a big display headline. It carries the section's
  title; it is not a content item.
- After it, content cards **alternate**: a red portrait card, then a light
  "quote" card, then red, then light…
- Light card internals: the sentence sits at the **top** at generous size with
  mixed emphasis (key phrases in near-black bold, connective words in grey);
  a small **chip at the bottom** = square thumbnail + name + role in mono caps.
- No drop shadows anywhere. Radius ≈ 22px. Cards ≈ 257×315 at 1280 wide, i.e.
  ~20vw, gap ~10vw. Three cards visible at a time; the row bleeds off both edges.

## What we build

Same card language, our palette, our constraints.

### Constraint: we have no photography

`project_pending_externals` — member photos are not available. So the
portrait/quote alternation is ported as a **colour** alternation instead:
LINE-green cards where the reference has red portraits, paper-white cards where
it has quote cards. The rhythm survives; the imagery requirement does not.

### Constraint: no pin-spacer on this page

`LpMotion.tsx` already documents that this page has **no** ScrollTrigger `pin`
anywhere, and `.lp-punch` uses native `position: sticky` instead. Do not
introduce a pin here. Horizontal travel is a plain scrubbed `x` tween.

### Constraint: not a carousel

`project_plans_carousel_infinite_loop_required` — an interactive/auto-looping
card reel was killed on `/plans`; cards must be readable without the visitor
doing anything. So: **no infinite loop, no drag, no autoplay, no `overflow-x:
auto`.** The row's travel is driven only by page scroll, it is finite, and it
ends with the last card fully on screen. Below 900px the row is a plain vertical
stack and there is no horizontal motion at all.

### Card sequence (4 cards)

| # | Card | Fill | Carries |
|---|------|------|---------|
| 0 | lead | LINE-green gradient | `lp-eyebrow` + `h2` + `lp-lead` |
| 1 | step 01 | paper | title + body + chip |
| 2 | step 02 | LINE-green gradient | title + body + chip |
| 3 | step 03 | paper | title + body + chip |

Alternation starts on the lead card, so green/paper reads as **rhythm**, not as
"step 02 is the important one".

---

## 1. Markup — `src/app/(lp)/lp/_components/LpSteps.tsx`

Replace the file's `return (...)` wholesale. Keep the import and props.

```tsx
export default function LpSteps({ what }: LpStepsProps) {
  return (
    <section className="lp-section lp-dark lp-what-sec" aria-label="サービス内容">
      {/* The track is a direct child of <section>, NOT of .lp-inner — same
          structural position as .lp-flow's .lp-punch, and for the same reason:
          the row has to be able to bleed past the 1120px measure and off the
          right edge of the screen. It inherits .lp-section's horizontal
          padding, so the lead card's left edge still lines up with every other
          section's content. Do not re-wrap this in .lp-inner. */}
      <div className="lp-what-track">
        <div className="lp-what-row">
          {/* Ported from the reference's intro card: mono label, then display
              headline. It is a heading block, not a list item, so it sits
              OUTSIDE the <ol>. */}
          <article className="lp-wcard lp-wcard-lead">
            <p className="lp-eyebrow">what we do</p>
            <h2>
              {what.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="lp-lead">{what.lead}</p>
          </article>

          {/* Still an <ol>: these are three ordered stages of one engagement and
              the order is the meaning. .lp-wsteps is itself a flex child of the
              row AND a flex container of the cards, which keeps list semantics
              intact — do NOT flatten this with `display: contents`. */}
          <ol className="lp-wsteps">
            {what.steps.map((step, i) => (
              <li className="lp-wcard lp-wcard-step" key={step.title}>
                <div className="lp-wcard-body">
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
                {/* Bottom chip = the reference's avatar + name/role block.
                    The visible number duplicates the <ol> semantics, so it is
                    hidden from screen readers rather than read out twice. */}
                <span className="lp-wchip" aria-hidden="true">
                  <i className="lp-wchip-mark">{String(i + 1).padStart(2, '0')}</i>
                  <span className="lp-wchip-label">STEP</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

## 2. CSS — `src/app/(lp)/lp.css`

**Delete** the existing block from the `.lp-what {` rule through the
`@media (max-width: 720px)` block that contains `.lp-step` / `.lp-num`
(currently lines ~637–702), including the explanatory comment above it that
describes the ruled-row design — that design is being replaced. Insert this in
its place.

```css
/* ----------------------------------------------------------- what we do

   Port of madewithgsap effect070: a row of flat, equal-width rounded cards on
   near-black that travels horizontally as the section is scrolled. Full notes,
   including what was deliberately NOT ported (photography, infinite loop,
   drag): docs/aiops-lp-what-cards-spec.md.

   This replaces the previous full-width ruled-row list. Flat is load-bearing —
   the reference has no drop shadows, and shadowed rounded cards are exactly the
   templated-SaaS look this site rejects.

   ⚠️ Renders complete and readable without JS: the base rules below are the
   WRAPPING layout. Everything that makes the row a single non-wrapping
   travelling line is scoped under `.lp-what-live`, which LpMotion adds on
   mount, after its reduced-motion bail and only above 900px. Do not promote
   any of it into the base rules.
   -------------------------------------------------------------------------- */
.lp-what-sec {
  --wcard-w: clamp(250px, 23vw, 336px);
  --wcard-gap: clamp(14px, 1.8vw, 26px);
  --wcard-radius: 22px;
}
.lp-what-track {
  /* Base = no clipping and no travel. .lp-what-live turns on the clip. */
  overflow: visible;
}
.lp-what-row,
.lp-wsteps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wcard-gap);
  align-items: stretch;
}
.lp-wsteps {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* -------------------------------------------------------------- the card */
.lp-wcard {
  flex: 0 0 auto;
  width: var(--wcard-w);
  min-height: clamp(320px, 29vw, 420px);
  display: flex;
  flex-direction: column;
  padding: clamp(20px, 1.9vw, 28px);
  border-radius: var(--wcard-radius);
  /* No box-shadow. See the header comment. */
}

/* Lead card — the reference's intro card, recoloured to LINE green. The
   gradient runs the same direction as the reference's (light corner top-left,
   deep corner bottom-right). Text is near-black, NOT white: white on #06c755
   is about 2.3:1 and fails contrast outright. */
.lp-wcard-lead {
  justify-content: space-between;
  background: linear-gradient(155deg, #0ae66d 0%, #06c755 44%, #04914b 100%);
  color: var(--lp-black);
}
.lp-wcard-lead .lp-eyebrow {
  color: rgba(5, 5, 5, 0.62);
}
/* Beats `.lp-what h2`'s old clamp — that was sized for a full-width heading and
   is far too big inside a ~300px card. */
.lp-wcard-lead h2 {
  margin: clamp(26px, 3vw, 44px) 0 0;
  color: var(--lp-black);
  font-size: clamp(23px, 1.95vw, 30px);
  line-height: 1.42;
  font-weight: 900;
  letter-spacing: -0.01em;
}
.lp-wcard-lead .lp-lead {
  margin: 14px 0 0;
  color: rgba(5, 5, 5, 0.7);
  font-size: clamp(12px, 0.95vw, 13.5px);
  line-height: 1.85;
  font-weight: 700;
}

/* Step cards. nth-child(2) is step 02 — the alternation continues the lead
   card's green, so the row reads green / paper / green / paper. */
.lp-wcard-step {
  justify-content: space-between;
  background: var(--lp-paper);
  color: var(--lp-ink);
}
.lp-wcard-step:nth-child(2) {
  background: linear-gradient(155deg, #0ae66d 0%, #06c755 44%, #04914b 100%);
}
/* Mirrors the reference's quote card: the sentence sits at the TOP, large, with
   the supporting line under it in grey. */
.lp-wcard-body strong {
  display: block;
  font-size: clamp(18px, 1.55vw, 23px);
  line-height: 1.5;
  font-weight: 900;
  letter-spacing: -0.005em;
  /* JP orphan control — the manager objects to a lone trailing character. */
  text-wrap: balance;
}
.lp-wcard-body p {
  margin: 12px 0 0;
  color: var(--lp-paper-muted);
  font-size: clamp(12px, 0.95vw, 13.5px);
  line-height: 1.9;
  font-weight: 700;
}
.lp-wcard-step:nth-child(2) .lp-wcard-body p {
  /* On green, the grey would mud out. */
  color: rgba(5, 5, 5, 0.7);
}

/* Bottom chip = the reference's avatar + name/role block. */
.lp-wchip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: clamp(20px, 2.4vw, 32px);
}
.lp-wchip-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--lp-black);
  color: var(--lp-line);
  font-size: 14px;
  font-style: normal;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.lp-wcard-step:nth-child(2) .lp-wchip-mark {
  color: var(--lp-white);
}
.lp-wchip-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(17, 17, 17, 0.42);
}
.lp-wcard-step:nth-child(2) .lp-wchip-label {
  color: rgba(5, 5, 5, 0.5);
}

/* ------------------------------------------------- live (JS, ≥900px only) */
/* One non-wrapping line that GSAP translates. Clipping lives here and not in
   the base rules so that a no-JS / reduced-motion visitor keeps the wrapping
   grid above, where every card is on screen and nothing is cut off. */
.lp-what-live {
  overflow: hidden;
}
.lp-what-live .lp-what-row,
.lp-what-live .lp-wsteps {
  flex-wrap: nowrap;
}
.lp-what-live .lp-what-row {
  will-change: transform;
}

@media (max-width: 899px) {
  /* Single column. Cards go full width and lose their fixed height — Japanese
     body copy at phone widths sets the height, not a clamp. */
  .lp-what-row,
  .lp-wsteps {
    flex-direction: column;
  }
  .lp-wcard {
    width: 100%;
    min-height: 0;
  }
  .lp-wcard-lead h2 {
    font-size: clamp(24px, 6.2vw, 34px);
  }
}
```

## 3. Motion — `src/app/(lp)/lp/_components/LpMotion.tsx`

**Replace** the whole `/* ---- steps ---- */` block (the
`gsap.utils.toArray<HTMLElement>('.lp-step')` forEach, currently lines ~167–182,
comment included) with the following.

```tsx
      /* ----------------------------------------------------------- steps */
      // Card entrance. Runs at every width, including the mobile stack, and is
      // independent of the horizontal travel below: this writes opacity/y on
      // the CARDS, that writes x on the ROW. Different elements, different
      // properties — they cannot fight. (Two triggers writing the same property
      // on the same element is the failure mode called out at .lp-flow-punch.)
      gsap.utils.toArray<HTMLElement>('.lp-wcard').forEach((card, i) => {
        gsap.set(card, { opacity: 0, y: 24 });
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          // Cards sit side by side, so they share one enter moment; the index
          // delay is what turns that into a sweep across the row.
          delay: Math.min(i, 3) * 0.08,
          scrollTrigger: enter(card),
        });
      });
```

Then add this **after** that block, still inside the `gsap.context` callback:

```tsx
      /* ----------------------------------------- what-we-do horizontal row */
      // Port of madewithgsap effect070's travelling card row. Scrubbed to page
      // scroll — no pin, no autoplay, no drag, no overflow-x scroller. See
      // docs/aiops-lp-what-cards-spec.md for why each of those is excluded.
      //
      // ⚠️ NO `pin: true`. This page has no pin-spacer anywhere (see the punch
      // marquee note below) and adding one here would strand the sections
      // around it.
      mm.add('(min-width: 900px)', () => {
        gsap.utils.toArray<HTMLElement>('.lp-what-track').forEach((track) => {
          const row = track.querySelector<HTMLElement>('.lp-what-row');
          if (!row) return;

          // Only clip and travel if the row is actually wider than the track.
          // At very wide viewports all four cards already fit, and translating
          // a row that does not overflow would drag content off-screen for no
          // reason.
          const overflow = () => row.scrollWidth - track.clientWidth;
          if (overflow() <= 0) return;

          track.classList.add('lp-what-live');

          gsap.to(row, {
            // Function-based so invalidateOnRefresh re-measures on resize and
            // after fonts land — a fixed number here would be wrong the moment
            // the Japanese webfont swaps in and changes the cards' width.
            x: () => -overflow(),
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              start: 'top 82%',
              // Ends while the section is still fully on screen, so the last
              // card is readable at rest rather than arriving as it leaves.
              end: 'bottom bottom',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          return () => {
            track.classList.remove('lp-what-live');
          };
        });
      });
```

`mm` does not exist yet. Declare it once, immediately before the
`const ctx = gsap.context(() => {` line:

```tsx
    const mm = gsap.matchMedia();
```

and revert it in the cleanup, alongside the existing `ctx.revert()`:

```tsx
      mm.revert();
```

(Order does not matter; put it on the line after `ctx.revert()`.)

## 4. Verify

- `npx tsc --noEmit` must pass.
- **Do NOT run `npm run build` or `npm run dev`.** The user owns port 3000 and a
  concurrent `next build` corrupts their running dev server's chunks. `tsc` only.
- Grep the repo for `lp-step`, `lp-num`, `lp-what-head`, `lp-steps` and confirm
  there are no remaining references outside this change (`lp-tl-step` and
  `lp-tl-*` are a DIFFERENT section — leave every one of those alone).
- Confirm `lp.css` contains **zero** `@media (max-width: 720px)` blocks and no
  longer mentions `.lp-num`. The file's only 720px query lived inside the deleted
  `.lp-step` block; this section's breakpoint is now 899px, matching the
  `mm.add('(min-width: 900px)')` guard in LpMotion. (An earlier draft of this
  line said "exactly one" — that was wrong.)

---

# Revision 1 — the row has to actually travel, and line up

§1–§3 above are applied. Reviewing the applied result against real viewport
numbers found two defects in the spec itself. Both are corrected here; this
section supersedes the earlier text where they conflict.

### Defect A — the travel never activates

`LpMotion` measures `row.scrollWidth - track.clientWidth` **before** adding
`.lp-what-live`. At that moment the row is still `flex-wrap: wrap`, and a
wrapping flex row's `scrollWidth` is by definition its container's width — the
cards wrap instead of overflowing. So `overflow()` is always `<= 0`, the guard
returns early, `.lp-what-live` is never added, and the section renders as a
static wrapped grid at every width. The measurement must happen in the
non-wrapping state.

### Defect B — four cards are narrower than a desktop viewport, and start too far left

At 1920px: cards `clamp(250px, 23vw, 336px)` → 336, gaps → 26, so the row is
`4×336 + 3×26 = 1422px` against a ~1752px track. Even with Defect A fixed there
is nothing to travel. Widening the card pitch to hold ~3 cards on screen at
every desktop width is what makes the travel exist at all — the reference shows
three at a time with the row bleeding off both edges, and that ratio is the
effect.

Second half: `.lp-what-track` is a child of `.lp-section`, so it starts at the
section's padding (84px at 1920), while every other section's content is inside
`.lp-inner` — `width: min(1120px, 100%); margin: 0 auto` — which starts at
400px. The lead card would hang 316px left of the entire rest of the page. The
comment in `LpSteps.tsx` claiming the edges line up is wrong and is corrected
below.

The fix is one offset, expressed so it is self-correcting: the row's leading
padding is `max(<section padding>, (100% - 1120px) / 2)`, where `100%` resolves
against the track. Above the measure that reproduces `.lp-inner`'s centring
exactly; below it, the section padding wins — which is also where `.lp-inner` is
at those widths. No breakpoint, no magic number, no duplicated max-width.

Live-mode only, the track additionally bleeds out to the screen edges with a
negative inline margin, so the clip happens at the viewport edge like the
reference rather than 84px inside it. The leading padding above keeps the lead
card's left edge correct despite the bleed.

---

## R1.1 CSS — `src/app/(lp)/lp.css`

**Replace** the `.lp-what-sec` rule:

```css
.lp-what-sec {
  --wcard-w: clamp(250px, 23vw, 336px);
  --wcard-gap: clamp(14px, 1.8vw, 26px);
  --wcard-radius: 22px;
}
```

with:

```css
.lp-what-sec {
  /* Pitch is set so ~3 cards are on screen at every desktop width, which is
     what leaves 300–550px of row hanging off the right edge to travel. The
     earlier, narrower values made the whole row fit inside a 1920px viewport,
     so there was nothing to scrub. Do not shrink these without re-checking
     that (4 × w + 3 × gap) still exceeds the track at 1920. */
  --wcard-w: clamp(272px, 26vw, 452px);
  --wcard-gap: clamp(18px, 3.4vw, 60px);
  --wcard-radius: 22px;
  /* Must stay in sync with .lp-section's horizontal padding. */
  --lp-sec-pad: clamp(18px, 6vw, 84px);
}
```

**Add** to the `.lp-what-row, .lp-wsteps` group — as a separate rule directly
after it, since it must apply to the row only and never to `.lp-wsteps`:

```css
/* Aligns the lead card's left edge with .lp-inner (width: min(1120px, 100%);
   margin: 0 auto) in every other section. Above 1120px this reproduces the
   centring offset; below it the section padding wins, which is where .lp-inner
   sits at those widths too. `100%` resolves against the track. */
.lp-what-row {
  padding-inline-start: max(0px, (100% - 1120px) / 2);
}
```

**Replace** the card's `min-height` line — the card got ~35% wider, so the old
height made it square rather than portrait like the reference:

```css
  min-height: clamp(320px, 29vw, 420px);
```

with:

```css
  min-height: clamp(340px, 32vw, 520px);
```

**Replace** the two type sizes that were scaled for the narrower card.
In `.lp-wcard-lead h2`:

```css
  font-size: clamp(23px, 1.95vw, 30px);
```
→
```css
  font-size: clamp(24px, 2.05vw, 33px);
```

In `.lp-wcard-body strong`:

```css
  font-size: clamp(18px, 1.55vw, 23px);
```
→
```css
  font-size: clamp(19px, 1.7vw, 26px);
```

**Replace** the `.lp-what-live` rule:

```css
.lp-what-live {
  overflow: hidden;
}
```

with:

```css
/* Full-bleed to the screen edges so the row is clipped at the viewport like the
   reference, not 84px inside it. Live-mode only — the base wrapping layout
   stays inside the section padding, where wrapped cards need a right margin. */
.lp-what-live {
  overflow: hidden;
  margin-inline: calc(var(--lp-sec-pad) * -1);
}
/* The track is now full-page-width, so the leading padding has to absorb the
   section padding as well to keep the lead card on .lp-inner's left edge. */
.lp-what-live .lp-what-row {
  padding-inline-start: max(var(--lp-sec-pad), (100% - 1120px) / 2);
}
```

Everything else in §2 stands. The `@media (max-width: 899px)` block needs no
change: below the measure `max(0px, (100% - 1120px) / 2)` already resolves to
`0`, and `.lp-what-live` is never added at those widths.

## R1.2 Motion — `src/app/(lp)/lp/_components/LpMotion.tsx`

Inside the `mm.add('(min-width: 900px)', ...)` block, **replace**:

```tsx
          // Only clip and travel if the row is actually wider than the track.
          // At very wide viewports all four cards already fit, and translating
          // a row that does not overflow would drag content off-screen for no
          // reason.
          const overflow = () => row.scrollWidth - track.clientWidth;
          if (overflow() <= 0) return;

          track.classList.add('lp-what-live');
```

with:

```tsx
          // ⚠️ Add the class BEFORE measuring. A wrapping flex row's
          // scrollWidth IS its container width — the cards wrap instead of
          // overflowing — so measuring first always reported zero overflow and
          // the row never went live. `.lp-what-live` is what makes it one
          // non-wrapping line, which is the only state worth measuring.
          track.classList.add('lp-what-live');

          // Then bail if it still does not overflow (a very wide viewport), so
          // a row that already fits is never translated off-screen for no
          // reason — and drop the class again so the base wrapping layout,
          // which has the right margins for that case, comes back.
          const overflow = () => row.scrollWidth - track.clientWidth;
          if (overflow() <= 0) {
            track.classList.remove('lp-what-live');
            return;
          }
```

The rest of the block — the tween, the ScrollTrigger config, and the
`return () => { track.classList.remove('lp-what-live'); }` cleanup — is
unchanged.

## R1.3 Markup — `src/app/(lp)/lp/_components/LpSteps.tsx`

The comment above `.lp-what-track` currently claims the track inherits the
section padding "so the lead card's left edge still lines up". That is no longer
how alignment is achieved. **Replace** that comment block with:

```tsx
      {/* The track is a direct child of <section>, NOT of .lp-inner — same
          structural position as .lp-flow's .lp-punch, and for the same reason:
          the row has to be able to bleed past the 1120px measure and off the
          right edge of the screen. Alignment is NOT inherited from the section
          padding — the lead card's left edge is put back on .lp-inner's edge by
          .lp-what-row's padding-inline-start. See docs/aiops-lp-what-cards-spec.md
          §R1.1. Do not re-wrap this in .lp-inner. */}
```

## R1.4 Verify

- `npx tsc --noEmit` passes. Still **no** `npm run build` / `npm run dev`.
- `lp.css` contains no remaining `--wcard-w: clamp(250px` and no
  `min-height: clamp(320px, 29vw, 420px)`.
- `padding-inline-start` appears exactly twice in `lp.css`, both on
  `.lp-what-row` (base and `.lp-what-live`).
- `margin-inline` appears on `.lp-what-live` and the value is negative.

---

# Revision 2 — the matchMedia cleanup was being discarded

Applied. Recorded here so the file matches the code.

The `mm.add('(min-width: 900px)', ...)` block returned its
`() => track.classList.remove('lp-what-live')` cleanup **from the `forEach`
callback**, not from the `mm.add` callback. `Array.prototype.forEach` discards
whatever its callback returns, so `matchMedia` never received a cleanup at all.

Symptom: resize (or rotate) from ≥900px down to <900px and GSAP reverts the
tween, but `.lp-what-live` stays on the track. At mobile widths that leaves the
negative `margin-inline` full-bleed and `overflow: hidden` applied to a vertical
card stack — the cards get indented on the left and run flush off the right
screen edge. Only reachable via a resize across the breakpoint, but it is a real
broken state, not a cosmetic one.

Fix, in `LpMotion.tsx`: collect the tracks that actually went live in a `const
live: HTMLElement[] = []` declared at the top of the `mm.add` callback,
`live.push(track)` after the overflow guard passes, and return one cleanup from
the `mm.add` callback that clears the class on all of them.

```tsx
      mm.add('(min-width: 900px)', () => {
        const live: HTMLElement[] = [];

        gsap.utils.toArray<HTMLElement>('.lp-what-track').forEach((track) => {
          /* …guards, class add, overflow bail… */
          live.push(track);
          gsap.to(row, { /* …unchanged… */ });
        });

        return () => {
          live.forEach((track) => track.classList.remove('lp-what-live'));
        };
      });
```

`npx tsc --noEmit` clean after this change.
