# LP hero — copy drops below the film at ≤700px

## 1. Why, and why this is not a revert

The hero copy sits **on** the film (bottom-left, over `.lp-hero-scrim`). That
was set today, 2026-08-05, at the user's request, replacing a version that put
the copy in a black band under the film — **the band is what he objected to**.
`lp.css` records this at the top of the hero block (lines ~99–101), and
`.lp-hero`'s `padding: 0` comment calls the old band "the lower half of the
black the user objected to".

He has now asked for the copy to go under the film **on small screens**, because
at those widths the overlay covers the frame and "the users won't be seeing
nothing about the video itself". Both positions are correct, and they do not
conflict, because the objection was to the **slab**, not to the position:

- `.lp-hero-media` is `aspect-ratio: 1916 / 1080`. At 390px wide the film box is
  only **220px tall**. The copy block is ~140px and starts 20% up from the
  bottom, so it occupies roughly the middle of the frame — the subject of the
  shot — and the 音声オン button takes the corner. There is nothing left to see.
- The overlay also costs the copy ~18% of its width on the right
  (`padding: 0 max(18%, …)`), a guard that exists only to keep text off the
  film's burned-in caption. Below the film there is no caption to avoid, so the
  headline gets its full measure back — a real gain at 390px.

So: at ≤700px the copy moves into flow under the film with **tight** padding,
and the film is handed back clean. Above 700px nothing changes; the approved
overlay stays exactly as it is.

**The band must not come back.** Do not reintroduce
`padding: clamp(34px, 7vw, 76px)` on `.lp-hero`, and do not add vertical
breathing room beyond what §3 specifies. The copy sits close under the film and
the section ends shortly after it.

### Breakpoint: 700px

Not the file's usual 560px. At 700px the film box is already down to ~395px and
the overlay has started eating the frame, and the user hit this while *resizing*
— so the cramped state should never be visible on the way down, not just on
phones. Above 700px the film is ≥395px tall and the overlay reads as designed.

### Not touched

- **The crop ban.** `object-fit` and `aspect-ratio` on `.lp-hero-media` /
  `.lp-hero-video` are unchanged. This does not make the film taller; it stops
  the copy from covering what little of it there is. The real fix for a short
  phone hero remains a vertical 9:16 export — a content deliverable, per
  `docs/aiops-lp-hero-overlay.md` §2.
- **`.lp-sound`** stays on the film, bottom-left. It is small, it belongs to the
  video, and it was placed there deliberately (top-left was tried and rejected
  the same day).
- **`LpHero.tsx`** — no markup change at all. `.lp-hero-copy` is already a
  sibling of `.lp-hero-media` inside a `flex-direction: column` `.lp-hero`, so
  dropping `position: absolute` is enough to put it in flow underneath.
- **`LpMotion.tsx`** — no change. The hero's SplitText masked-line reveal and
  the scrubbed exit both target `.lp-hero-copy`'s h1/p by selector and work
  identically in flow. The exit also tweens `.lp-hero-scrim`, which is
  `display: none` at this width; tweening a hidden element is harmless.

## 2. Where it goes

`src/app/(lp)/lp.css`. If a `@media (max-width: 700px)` block already exists,
add these rules to it. If not, create one immediately **before** the
`@media (max-width: 820px)` block, so hero breakpoints stay in descending order
alongside the 820px and 560px blocks.

## 3. The rules

```css
  /* ---- Copy leaves the film and drops underneath it.

     The film is aspect-ratio 1916/1080, so by 700px its box is ~395px tall and
     by 390px it is ~220px. The copy block is ~140px and sits 20% up from the
     bottom, i.e. across the middle of the frame — at phone widths the overlay
     hides the shot it is supposed to be introducing.

     ⚠️ This is NOT the black band that was removed on 2026-08-05. That band was
     `padding: clamp(34px, 7vw, 76px)` on .lp-hero — a slab of dead black under
     the film. This is the copy sitting close under the frame with the padding
     below. Do not grow these numbers "for breathing room"; that is how the band
     comes back. */
  .lp-hero-copy {
    position: static;
    /* The 18% right inset above exists only to keep text off the film's
       burned-in caption. There is no caption to clear down here, so the
       headline gets its whole measure back — worth ~70px at 390px. */
    padding: 20px clamp(18px, 6vw, 84px) 30px;
    width: 100%;
  }
  /* The scrim's only job is legibility for copy ON the film. With the copy out
     of the frame it is just a stain across the shot. */
  .lp-hero-scrim {
    display: none;
  }
  /* Bigger than the base clamp's 38px floor, and now safe: the old
     `clamp(38px, 11.6vw, 56px)` bump was removed because it overflowed a
     220px-tall film box (see the note in the 560px block). Below the film there
     is no such ceiling — the constraint that killed it does not apply here. */
  .lp-hero-copy h1 {
    font-size: clamp(34px, 10.5vw, 48px);
    /* Flat black behind it now, not moving footage. */
    text-shadow: none;
  }
  .lp-hero-copy p {
    margin-top: 14px;
    font-size: clamp(15px, 4.2vw, 19px);
    /* Back to --lp-muted's .72. The .84 in the base rule was raised because 72%
       white loses its edges over footage; on flat black it does not. */
    color: var(--lp-muted);
    text-shadow: none;
  }
```

## 4. Verify

- `npx tsc --noEmit` clean. **Do not run `npm run build`** — the user's dev
  server is running and a concurrent build corrupts its chunks.
- Only ONE `@media (max-width: 700px)` block exists in `lp.css` afterwards.
- `.lp-hero` still has `padding: 0` — no band.
- `.lp-hero-media` and `.lp-hero-video` are byte-identical to before.
- `LpHero.tsx` and `LpMotion.tsx` are untouched.
