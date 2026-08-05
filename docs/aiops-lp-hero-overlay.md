# LP hero — copy moves onto the film, black bands go

Status: spec, ready to apply. 2026-08-05.
Requested by the user 2026-08-05: *"the video i dont like it has like a black
thing underneath it and above it, the text can be on top of the video."*

## 1. What this does and does not change

**It does NOT reintroduce cropping.** The ⚠️ block comment on `.lp-hero` stays,
and every word of it still applies: the CM carries burned-in Japanese text down
the **right edge** of the frame, that line is the punchline, and
`object-fit: cover` eats it. Nothing here puts `cover` back.

What was actually wrong was the *layout around* the film, not the film's fit.
The hero is a column — film on top, copy underneath on `--lp-black`, plus
`padding-bottom: clamp(34px, 7vw, 76px)` of more black under that. That black
band is what the user is pointing at. The fix is to stop giving the copy its own
black strip and put it inside the frame:

- `.lp-hero` loses its padding, so its box becomes exactly the film's box.
- `.lp-hero-copy` becomes absolutely positioned **inside** that box.
- A scrim anchored to the **bottom-left** keeps the copy legible, and dies out
  well before the right edge so it never dims the caption.
- The two pieces of furniture that would now collide — the sound button
  (bottom-left) and `SCROLL` (bottom-right, i.e. straight onto the caption) —
  move to top-left and bottom-centre.

Result: no black above, none below, copy on the film, film uncropped.

### Measurements this is built on

Both `public/video/lp-video1.mp4` and `lp-video2.mp4` are **1280×722 with
non-square pixels** (SAR 172919:172800), giving a display aspect ratio of
**479:270 = 1.774074**. `1916 / 1080` — the value already on `.lp-hero-media` —
is exactly that ratio. **Leave it alone.** In particular do not "correct" it to
`1280 / 722`; that is the storage ratio (1.77285), ignores the pixel aspect, and
would introduce the very letterbox this change is removing.

Neither file has baked-in black bars. The frame is full-bleed office footage
with the yellow burned-in caption at roughly 84–89% of the width, mid-height.

## 2. The one real cost, stated up front

The film is 1.774:1 and a phone is about 0.46:1. A fixed-ratio film cannot fill
an arbitrary viewport without either cropping it or putting bars somewhere —
those are the only two options, and cropping is barred. So the hero is now
exactly as tall as the film is wide ÷ 1.774:

| viewport | hero height | note |
|---|---|---|
| 1920 | 1082px | taller than the fold; copy is anchored 20% up so it stays on screen |
| 1512 | 852px | ≈ full window |
| 768 | 433px | comfortable |
| 390 | 220px | **cramped** — a quarter of the screen, and the copy has to shrink to fit inside it |

At 390px the headline has to come down to ~25px for the copy block to fit in a
220px frame. That is the honest cost of putting the copy inside an uncropped
16:9 frame on a phone. It is applied here because it is what was asked for; the
proper fix is the separate **vertical (9:16) export** the original comment names,
which would let the phone hero be full-height with the caption repositioned for
that frame. Flag this to the user rather than quietly reverting it.

## 3. `src/app/(lp)/lp/_components/LpHero.tsx` — comments only

No markup changes. `.lp-hero-copy` and `.lp-scroll` stay exactly where they are
in the tree — they become absolutely positioned children of `.lp-hero`, whose box
is now the film's box, which is the containing block we want.

### 3.1 The stale header comment (lines ~11–14)

It claims a 100dvh hero, which has not been true since the column layout landed.
Replace with:

```tsx
// Full-bleed video hero. The <section> is exactly the film's own box — the film
// runs edge to edge at its native ratio and is NEVER cropped (see the block
// comment on .lp-hero in lp.css), and the headline sits ON the film rather than
// in a black band under it. The height comes from .lp-hero-media's aspect-ratio;
// this component only handles the poster/video crossfade and the reduced-motion
// gate.
```

### 3.2 The sound-button comment (lines ~119–123)

It says "bottom-right", which was already wrong (the CSS puts it left, to clear
the caption) and is about to be wrong twice. Replace with:

```tsx
        {/* Sound toggle. Sits ON the film, TOP-left. Left because the CM's
            burned-in caption runs down the right edge; top because the headline
            now occupies the bottom-left of the frame. Labelled in Japanese
            rather than being a bare speaker glyph — a lone icon reads as
            decoration and gets ignored, and the whole point is that people
            notice they can turn the sound on. */}
```

## 4. `src/app/(lp)/lp.css`

### 4.1 The `.lp-hero` block comment — amend, do not delete

The existing ⚠️ comment ends with:

```
   So the hero is now a column: the complete frame on top, the headline
   underneath it. Do not "restore" the overlay hero, and do not put `cover`
   back on .lp-hero-video, without a separately-cropped vertical export.
```

Those two sentences are now half wrong (the overlay IS restored) and half more
important than ever (the crop ban stands). Replace **only those two sentences**
with:

```
   So the film keeps its own box at its own ratio, and the hero IS that box —
   full-bleed, nothing above it, nothing below it. The headline sits ON the
   frame, bottom-left, over a scrim that fades out before it reaches the right
   edge (2026-08-05, at the user's request — the previous version put the copy
   in a black band under the film and the band is what he objected to).

   ⚠️ THE CROP BAN IS UNAFFECTED BY THAT. Do not put `cover` back on
   .lp-hero-video, and do not give .lp-hero-media a height that fights its
   aspect-ratio — either one crops the caption off. The film being shorter than
   a phone screen is a known, accepted cost; the fix for it is a separate
   VERTICAL (9:16) export with the caption recomposed for that frame, not a
   crop. See docs/aiops-lp-hero-overlay.md §2.
```

Everything above those sentences — the whole explanation of why `cover` is
banned — stays verbatim.

### 4.2 `.lp-hero` — drop the padding, add the scrim

```css
.lp-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Zero. The film is the hero: no top padding (there is no site header on an
     LP), and no bottom padding, because the copy is now inside the frame rather
     than in a band below it. The `clamp(34px, 7vw, 76px)` that used to be here
     was the lower half of the black the user objected to. */
  padding: 0;
  background: var(--lp-black);
  isolation: isolate;
}
/* Legibility scrim for the overlaid copy. Anchored BOTTOM-LEFT and, critically,
   dead before the right edge: the horizontal ramp is fully transparent by 70% of
   the width and the caption sits at ~84–89%, so the burned-in punchline is never
   dimmed. The vertical ramp is deliberately the weaker of the two — the copy is
   left-aligned, so most of the darkening should come from the left, not from a
   full-width bottom bar that would wash the whole frame.
   z-index 1: above the video, below .lp-hero-copy and .lp-sound (both z-index 2).
   Uses ::before because ::after is the scanline texture and, on the president
   variant, .lp-hero-media's own ::before/::after are the vignette and grain. */
.lp-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(
      to right,
      rgba(5, 5, 5, 0.78) 0%,
      rgba(5, 5, 5, 0.55) 30%,
      rgba(5, 5, 5, 0.12) 55%,
      rgba(5, 5, 5, 0) 70%
    ),
    linear-gradient(to top, rgba(5, 5, 5, 0.55) 0%, rgba(5, 5, 5, 0) 46%);
}
```

### 4.3 `.lp-sound` — bottom-left becomes top-left

In the existing rule, replace the `bottom` declaration with a `top`. The `left`
declaration and its comment stay exactly as they are.

```css
  /* TOP, not bottom — the headline now occupies the bottom-left of the frame.
     Left stays left for the reason below. */
  top: clamp(12px, 2vw, 24px);
```

### 4.4 The `.lp-hero::after` comment — the gradient is back

The comment above `.lp-hero::after` currently opens:

```
/* The mock's darkening gradient over the film is GONE, and must stay gone
   while the headline sits below the video rather than on top of it. It existed
   only to keep white type legible over moving footage; with nothing overlaid
   it would just dim the film for no reason. */
```

Its premise ("the headline sits below the video") no longer holds. Replace those
four lines with:

```
/* Scanline texture. The mock's darkening gradient came BACK on 2026-08-05, when
   the headline moved on top of the film — it is .lp-hero::before above, scoped
   to the bottom-left so it never touches the caption. This ::after is only the
   texture and is unrelated to it. */
```

The rule itself is unchanged.

### 4.5 `.lp-hero-copy` — overlay it

```css
/* The copy sits ON the film, bottom-left. It is a sibling of .lp-hero-media,
   positioned against .lp-hero — which, now that .lp-hero has no padding, is
   exactly the film's box. */
.lp-hero-copy {
  position: absolute;
  left: 0;
  right: 0;
  /* NOT `bottom: 0`. On a wide monitor the film's box is taller than the
     viewport, so copy pinned to the frame's bottom edge would land below the
     fold. 20% up keeps it on screen from a 390px phone to a 1920px monitor
     without measuring anything or capping the film's height. */
  bottom: 20%;
  z-index: 2;
  width: min(1000px, 100%);
  margin: 0 auto;
  /* Right inset is far larger than left, and that asymmetry is the whole point:
     the burned-in caption runs down the right edge of the frame and the copy
     must never reach it. 18% of the copy column is ~70px on a phone and 180px at
     the column's full width, against a caption that starts at ~84%. */
  padding: 0 max(18%, clamp(18px, 6vw, 84px)) 0 clamp(18px, 6vw, 84px);
}
```

### 4.6 `.lp-hero-copy h1` — one added declaration

Add to the existing rule, leaving everything else (including the Japanese
typography block comment above it) untouched:

```css
  /* The type is now over moving footage, not flat black. The scrim does most of
     the work; this covers the frames where a bright highlight drifts under a
     glyph. */
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.55);
```

### 4.7 `.lp-hero-copy p` — lift it off the footage

Change the existing `color` declaration and add a shadow:

```css
  /* .84, up from --lp-muted's .72: that value was tuned against flat black, and
     72% white over footage loses its edges. */
  color: rgba(255, 255, 255, 0.84);
  text-shadow: 0 1px 16px rgba(0, 0, 0, 0.5);
```

`max-width`, `margin`, `font-size`, `font-weight` and `text-wrap` are unchanged.

### 4.8 `.lp-scroll` — bottom-right lands on the caption

```css
/* Bottom-CENTRE. It used to be bottom-right, which was fine when it sat in the
   black band under the film and is not fine now that the hero is the film: the
   right edge is where the burned-in caption runs. Centre is clear of both the
   caption (right) and the headline (left). */
.lp-scroll {
  position: absolute;
  left: 50%;
  bottom: clamp(12px, 2.4%, 26px);
  transform: translateX(-50%);
  z-index: 2;
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
}
```

`right`, `writing-mode` and the old `bottom` are all removed — the vertical
writing mode was there to hug the right edge and reads as clutter in the centre.

### 4.9 Narrow screens — a new media query

Add immediately after the `.lp-scroll` rule:

```css
/* Below ~700px the film's box is short enough that the desktop type scale would
   fill it top to bottom. The copy shrinks to fit inside the frame rather than
   the frame growing to fit the copy — growing it would mean cropping. See
   docs/aiops-lp-hero-overlay.md §2 for why this is accepted and what the real
   fix is. */
@media (max-width: 700px) {
  .lp-hero-copy {
    bottom: 12%;
    padding-right: max(22%, 20px);
  }
  .lp-hero-copy h1 {
    font-size: clamp(23px, 6.4vw, 34px);
  }
  .lp-hero-copy p {
    margin-top: 12px;
    font-size: clamp(13px, 3.4vw, 16px);
    line-height: 1.7;
  }
}
```

## 5. Do not touch

`.lp-hero-media` (its `aspect-ratio: 1916 / 1080` is the film's true display
ratio — see §1), `.lp-hero-video` / `.lp-hero-poster` and their `object-fit:
contain`, the `[data-lp-variant='president']` vignette and grain rules, the
`.lp-sound` `left` declaration and its comment, and everything from
`/* -------- section */` onward.

Do not add `height`, `min-height` or `max-height` to `.lp-hero` or
`.lp-hero-media`. Any of them fights the aspect ratio and produces either a crop
or the bars this change exists to remove.

## 6. Verify

1. `npx tsc --noEmit` — clean.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build`, `npm run dev`, or any server.** The user owns
   port 3000 and a build in this tree corrupts their running dev server's chunks.
4. Grep `src/app/(lp)/lp.css` for `object-fit` and confirm the only values are
   `contain` — no `cover` anywhere.
5. Confirm `.lp-hero` has `padding: 0` and that no `height`/`min-height`/
   `max-height` was added to `.lp-hero` or `.lp-hero-media`.
6. Confirm `.lp-sound` has a `top` and no `bottom`, and still has its original
   `left` declaration and comment.
7. Confirm `.lp-hero-media` still reads `aspect-ratio: 1916 / 1080`.
8. Do not commit, stage or push.

Report the diff, both command results, items 4–7, and anything that did not
match.
