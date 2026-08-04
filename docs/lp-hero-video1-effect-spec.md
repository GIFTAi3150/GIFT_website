# LP hero — cinematic pass on video1 (B案 社長待ち訴求)

Requested 2026-08-04: "a bit more of an effect" on video1, the president/B案
hero (`/video/lp-video1.mp4`). Scoped to that variant only — A案's hero
(video2) just got its final cut and wasn't part of the ask.

## Constraint that shapes every choice below

**The film's frame is never cropped or geometrically transformed.** See the
block comment on `.lp-hero-media` in `lp.css` (line ~60): the CM has a
burned-in Japanese caption running down its RIGHT EDGE
(「やっぱり、俺がいないと回らないな。」), which is the film's punchline.
`object-fit: cover` and any `transform: scale()` on the video element were
explicitly rejected twice already for eating that edge. So every effect here
is an **overlay layer or a filter**, never a transform, and never anything
that pushes content outside `.lp-hero-media`'s existing box.

## What's changing

Three additive layers, president variant only:

1. **Vignette** — soft radial darkening at the four corners. Tuned so the
   right-edge midline (where the caption actually runs) stays close to full
   brightness; only the corners darken.
2. **Film grain** — static (non-animated) SVG turbulence noise, very low
   opacity, `mix-blend-mode: overlay`. Adds texture/presence without motion.
3. **Slightly stronger grade** — bump the existing `contrast`/`saturate`
   filter a bit further for this variant only, plus a touch of `brightness`
   down to sell "graded footage" rather than "raw clip."

Nothing here touches `LpHero.tsx`'s video-ready/hydration logic — that code
has hard-won load-bearing comments about canplay races; leave it alone. This
is CSS-only plus one data attribute for scoping.

## File 1 — `src/app/(lp)/lp/page.tsx`

Add a `data-lp-variant` attribute to the per-concept `<section>` so CSS can
target one variant without new component props (the hero/flow/steps
components stay fully data-driven, untouched).

Change:

```tsx
        return (
          <section key={slug} aria-label={data.conceptName}>
```

to:

```tsx
        return (
          <section key={slug} aria-label={data.conceptName} data-lp-variant={slug}>
```

(`slug` is already in scope from the `.map()` — this is a one-line addition,
nothing else in the loop changes.)

## File 2 — `src/app/(lp)/lp.css`

Insert a new block immediately after the existing hero filter/transition
rules — i.e. right after this block (currently ~line 121-125):

```css
.lp-hero-video {
  transition: opacity 500ms ease;
}
```

Insert:

```css
/* -------------------------------------------------- video1 cinematic pass
   B案 (president) only, requested 2026-08-04. Overlay + filter ONLY — see
   the "film is never cropped" block comment above .lp-hero-media. Nothing
   here transforms or resizes the video element.
   -------------------------------------------------------------------------- */
[data-lp-variant='president'] .lp-hero-video,
[data-lp-variant='president'] .lp-hero-poster {
  /* Slightly stronger than the shared contrast(1.06) saturate(1.04) — a
     touch more grade, plus a hair of brightness down so it reads as
     produced footage rather than a raw clip. */
  filter: contrast(1.12) saturate(1.1) brightness(0.97);
}
/* Vignette. Ellipse is wider than tall (120%/100%) so it falls off faster
   top/bottom than left/right, and the dark ramp only starts at 60% — at the
   right-edge midline (where the burned-in caption runs) that keeps the
   overlay under ~0.18 alpha even at its darkest point on that line. Corners
   go to 0.3. */
[data-lp-variant='president'] .lp-hero-media::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(120% 100% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.3) 100%);
}
/* Static film grain. Not animated — motion here would compete with the
   footage itself. Tiled SVG feTurbulence, blended so it reads as texture
   rather than a visible overlay. */
[data-lp-variant='president'] .lp-hero-media::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 160px 160px;
}
```

Notes for the executor:
- `[data-lp-variant='president'] .lp-hero-video, [data-lp-variant='president'] .lp-hero-poster` has higher specificity than the existing unscoped `.lp-hero-video, .lp-hero-poster` rule (attribute selector + class, vs. class alone), so it wins without `!important` and without touching the original rule.
- `.lp-hero-media` is already `position: relative`, so the two pseudo-elements position correctly against it with no other changes needed.
- The existing `.lp-sound` button is `z-index: 2`; these overlays are `z-index: 1`, so the sound toggle stays on top and clickable.
- Do not add anything for the `ai-staff` (video2/A案) variant — out of scope for this pass.

## Verification

- `npx tsc --noEmit` — must be clean.
- **Do not run `npm run build` or start a dev server** — the user owns port
  3000; running `next build` alongside their running `next dev` corrupts its
  chunks (see project memory on this).
- Report back the exact diff. No visual check needed from the executor — the
  user will look at it on their own running preview.
