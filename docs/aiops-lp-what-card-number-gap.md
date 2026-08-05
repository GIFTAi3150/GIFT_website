# LP「what we do」card — put the watermark number in flow

Status: spec, ready to apply. 2026-08-05.
Follows `docs/aiops-lp-what-card-body-arc.md`, which is what broke this.

## 1. The bug, and why re-tuning the constant is the wrong fix

Reported 2026-08-05 from a narrowed browser: the body copy sits on top of the
`01` / `02` watermark.

`.lp-wnum` is `position: absolute; bottom: 32%`, i.e. pinned to a fraction of the
card's height. `32%` is not a layout relationship — it is a constant that happens
to have cleared the paragraph *as the paragraph was when it was written*: two
lines of 13px copy, 48px tall, with no negative bottom margin. Measured on the
338×398 desktop card:

| | before the body change | now |
|---|---|---|
| watermark bottom edge | 270.6px from card top | 270.6px |
| paragraph top edge | 310px | **268px** |
| clearance | 39px | **−2px — they overlap** |

The body went to 16px, to three lines on half the steps, and gained a −0.35em
bottom margin. All three push its top edge upward; the watermark did not move,
because nothing connects the two.

Mobile is worse for a second reason: the card there is `min-height: 320px` with
`aspect-ratio: auto`, so `32%` resolves to a *smaller* absolute offset on a
shorter card — the watermark descends toward the paragraph exactly as the space
available shrinks. And a fixed 120px number on a 243px-wide card is half the
card's width.

Picking a new percentage would re-encode the same assumption and break again the
next time the copy changes. **The fix is to give the number a real layout
relationship to the paragraph**: make it an in-flow flex item.

## 2. What changes

`.lp-wcard` is already `display: flex; flex-direction: column;
justify-content: space-between` with two in-flow children (`<strong>`, `<p>`).
The watermark becomes the third, sitting between them, and `space-between` then
distributes the free space into two gaps that can never go negative. A `gap` on
the card sets the floor for when there is no free space to distribute.

Nothing about the look changes on a normal desktop card — the number already sat
in the band between title and body, and it is not currently overlapped by either
(check the screenshot: 「1つ決める」clears `01`). What changes is that the
clearance is now produced by the layout instead of asserted by a number.

The watermark keeps `aria-hidden` and its low-alpha `--wcard-num` ink. It is
still decoration; it is just decoration the box model knows about.

## 3. `src/app/(lp)/lp/_components/LpSteps.tsx`

Move the `<span className="lp-wnum">` block so it sits **between** `<strong>` and
`<p>`, comment included. It is currently the first child of `<article>`. Nothing
else in the file changes — not the text, not the classes, not `aria-hidden`.

Order becomes: `<strong>` → `<span className="lp-wnum">` → `<p>`.

Replace the existing watermark comment with one that says why the position in
the source now matters:

```tsx
                    {/* Watermark. Duplicates the <ol>'s own numbering, so it is
                        hidden from screen readers rather than read out twice.
                        Its position HERE, between the title and the body, is
                        load-bearing: it is an in-flow flex item and the card's
                        `space-between` is what holds it clear of both. It used
                        to be absolutely positioned at `bottom: 32%`, which was a
                        constant guessing at the paragraph's height and collided
                        with it the moment the body copy grew. See
                        docs/aiops-lp-what-card-number-gap.md. */}
```

Using CSS `order` to reshuffle it without moving it would work, but DOM order
should match visual order when there is no reason for it not to.

## 4. `src/app/(lp)/lp.css`

### 4.1 `.lp-what-sec` — add a size token, after `--wbody-size`

```css
  /* Watermark number. The reference's 120px was sized for its card, before ours
     grew a three-line body; 108px is what fits the 338px card with the title,
     the body and two real gaps. Mobile takes it down again in the media block —
     120px on a 243px-wide card is half the card. */
  --wnum-size: 108px;
```

### 4.2 `.lp-wcard` — add the gap

Add to the existing rule, next to `justify-content: space-between`:

```css
  /* Floor under the two gaps `space-between` produces. On the fixed-height
     desktop card there is free space to distribute and this never binds; on the
     mobile card, whose height is its content, it is the only thing separating
     the watermark from the copy. */
  gap: clamp(12px, 4%, 18px);
```

### 4.3 `.lp-wnum` — drop the absolute positioning

```css
/* Watermark number — an in-flow flex item between the title and the body, NOT
   absolutely positioned. It was `position: absolute; bottom: 32%` until
   2026-08-05, which is a constant standing in for "just above the paragraph"
   and stopped being true the moment the paragraph grew to three 16px lines.
   Derivation: docs/aiops-lp-what-card-number-gap.md. Do not put `position` back
   on this — the clearance is the card's `space-between` plus its `gap`. */
.lp-wnum {
  font-size: var(--wnum-size);
  line-height: 1;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  color: var(--wcard-num);
  pointer-events: none;
}
```

`position`, `bottom`, `left` and `width` are all removed. Width is no longer
needed — as a column flex item it stretches to the card, and `text-align:
center` still comes from `.lp-wcard`.

### 4.4 `.lp-wcard strong` and `.lp-wcard p` — remove `position: relative`

Both carry `position: relative` for one reason only: to stack above the
absolutely-positioned watermark. That watermark no longer exists, so both
declarations are dead. Delete the `position: relative;` line from each rule and
leave everything else in both rules untouched.

### 4.5 Mobile — inside the existing `@media (max-width: 899px)` block

Add to the same `.lp-what-sec` rule that already overrides `--wtitle-size` and
`--wbody-size`:

```css
    /* 108px on the 243px-wide mobile card is 44% of it. This tracks the card
       instead: 28vw is ~90px at a 320px viewport and reaches the desktop 108px
       at ~386px, where the card is wide enough to carry it. */
    --wnum-size: clamp(72px, 28vw, 108px);
```

## 5. The arithmetic to check against

Desktop card, 338×398, three-line body — the worst case in the current copy:

| | height |
|---|---|
| padding | 40 + 40 = 80 |
| `<strong>` | 2 × 30 × 1.25 + 0.35em = 85.5 |
| `.lp-wnum` | 108 |
| `<p>` | 3 × 16 × 1.85 − 0.35em = 83.2 |
| **content total** | **356.7** |
| free space | 398 − 356.7 = 41.3 → **two gaps of ~20.6px** |

20.6px of layout gap, plus the empty band inside the number's own line box below
the digits, puts roughly 35px of visual air between `01` and the first line of
copy. The `gap` floor of 13.5px (4% of 338) never binds here.

Mobile at a 320px viewport, card 243px wide: 80 + 62.7 + 89.6 + 72.8 = 305.1
plus two 12px gaps = 329px, against `min-height: 320px` — so the card grows ~9px
and both gaps hold at their 12px floor.

⚠️ Desktop slack is 41px. A four-line body, or a title that wrapped to three
lines, would eat it and the card would grow past its `aspect-ratio`, breaking the
fan's uniformity. If copy ever gets longer, `--wnum-size` is the knob.

## 6. Do not touch

The card colours, `.lp-warc`, `.lp-wline`, the arc geometry in `LpSteps.tsx`
(`ARC_R_TITLE`, `ARC_R_BODY`, `ArcLine`, `sign`), `bodyLines`/`titleLines` in
`src/data/lp-variants.ts`, everything under `.lp-what-live`, `LpMotion.tsx`, and
the three-card fan geometry (`--wheel-d`, `--wheel-step`, `.lp-wslot`).

Do not add `overflow: hidden` to `.lp-wcard` — the title's arch and the body's
bowl both hang outside their layout boxes by design and would be clipped.

## 7. Verify

1. `npx tsc --noEmit` — clean.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build`, `npm run dev`, or any server.** The user owns
   port 3000 and a build in this tree corrupts their running dev server's chunks.
4. Grep `.lp-wnum`'s rule and confirm it contains no `position`, `bottom`, `left`
   or `width` declaration.
5. Grep `src/app/(lp)/lp.css` for `position: relative` and confirm neither
   `.lp-wcard strong` nor `.lp-wcard p` still has one.
6. Confirm in `LpSteps.tsx` that the source order inside `<article>` is
   `<strong>`, then `<span className="lp-wnum">`, then `<p>`.
7. Do not commit, stage or push.

Report the diff, both command results, items 4–6, and anything that did not
match.
