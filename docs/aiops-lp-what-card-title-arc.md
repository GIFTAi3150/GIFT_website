# LP「what we do」card title — rev 2: set it on a U-shaped arc

Status: spec, ready to apply. 2026-08-04.
**Supersedes the title geometry in `docs/aiops-lp-what-card-title-spec.md`.**
Everything else in that doc still stands — the 30px scale, the authored
`titleLines`, the untouched watermark, body copy and card colours.

## 1. What was wrong

Rev 1 rotated the whole title block by −8° — a rigid diagonal. **Rejected on
sight, 2026-08-04.** The reference is *curved*: the line is set on a circle, so
each character sits at its own angle and the line bows. A block `rotate()` can
never produce that, because every character in it shares one angle.

The bowl opens **upward — a U**. The circle's centre is ABOVE the line, the
middle of the line is the low point, and the ends ride up.

```
            card top
   ┌──────────────────────────────┐
   │  無                      ト  │   ← ends lifted, leaning outward
   │    料  AI  エー ジェ  ン     │   ← middle sits lowest, upright
   │                              │
   │      と し         す        │
   │         て  試               │
   │                              │
   │            01                │
   └──────────────────────────────┘
```

Both lines are set on the **same** circle, so where they overlap horizontally
the vertical gap between them stays constant — the pair reads as one curved
block, not two independently bent lines.

## 2. Approach, and why it is server-rendered

Each token gets two numbers derived from its distance `d` (in em) from the
centre of its own line, with `R` the circle's radius in em:

- `θ = d / R` radians
- **lift** `= R · (1 − cos θ)` em, applied as `translateY(−lift)` — always
  upward, largest at the ends, ~0 in the middle. This is what makes it a U.
- **rotation** `= −θ` degrees. Negative on the right-hand half: the baseline is
  tangent to the bowl, so a token right of centre has a baseline that *rises* to
  the right, which is a counter-clockwise CSS rotation. Left of centre the sign
  flips and the baseline descends into the middle.

Both are emitted as inline custom properties from the component. Two
consequences that matter:

- **No client JS, and no measurement.** The tokens stay in normal inline flow,
  so the *browser* still positions them with the font's real advances; the
  em-width table below is only used to decide how far along the arc each token
  is. An imperfect estimate shifts the curve by a pixel or two — it can never
  push text off its baseline or out of the card. The section's no-JS
  requirement is untouched.
- The curve is defined entirely in em, so it scales with `--wtitle-size` and
  needs no per-breakpoint tuning.

## 3. `src/app/(lp)/lp/_components/LpSteps.tsx`

### 3.1 Import

The file currently imports only the variant type. Add the React type it now
needs:

```tsx
import type { CSSProperties } from 'react';
import type { LpVariant } from '@/data/lp-variants';
```

### 3.2 New helpers — place them directly after the existing `Split` component

`tokenize` is reused as-is. It is the right unit here for a second reason: it
already keeps a Latin run whole (`AI` is one token, not two) and glues 長音符
and small kana to the character before them, so 「エー」 and 「ジェ」 swing along
the arc as the single glyph-clusters a reader sees.

```tsx
// Radius of the circle the card titles are set on, in em of the title's own
// font-size — so the curve scales with --wtitle-size and never needs re-tuning
// per breakpoint. 14em is ~420px at the desktop 30px title: the longest line
// (~8.9em) spans ~36° of it and its end tokens ride ~0.74em above the middle.
//
// This is the ONLY place the curve is defined. The CSS just consumes the two
// custom properties emitted below — do not try to express the arc in lp.css,
// it needs each token's position along the line and CSS cannot count.
//
// Smaller R = tighter bowl. Below ~10 the end tokens tip past 25° and the line
// stops reading as a sentence; above ~24 it flattens back to a straight line.
const ARC_R = 14;

// Advance widths in em, used ONLY to decide where along the arc a token sits.
// The browser still lays the tokens out itself with the font's real metrics, so
// an error here nudges the curve — it can never move text off its baseline.
// CJK is full-width by definition; 0.56em is a bold grotesque's rough average
// for ASCII, which on this page only ever has to cover 「AI」 and 「1」.
function advance(token: string): number {
  return Array.from(token).reduce(
    (sum, ch) => sum + (ch.charCodeAt(0) < 0x2e80 ? 0.56 : 1),
    0,
  );
}

/**
 * One line of a card title, set on a circle whose centre is ABOVE the line: the
 * middle of the line is the low point and the ends ride up — a U, not a
 * diagonal. A rigid rotate() on the whole block was rejected 2026-08-04
 * precisely because every character in it shares one angle.
 *
 * Both lines of a title use the same ARC_R, so they are arcs of the SAME
 * circle and the gap between them stays constant wherever they overlap.
 */
function ArcLine({ text }: { text: string }) {
  const tokens = tokenize(text);
  const widths = tokens.map(advance);
  const total = widths.reduce((sum, w) => sum + w, 0);
  let x = 0;

  return (
    <span className="lp-wline">
      {tokens.map((token, i) => {
        // This token's centre, in em, measured from the line's centre.
        const d = x + widths[i] / 2 - total / 2;
        x += widths[i];
        const rad = d / ARC_R;
        return (
          <span
            className="lp-warc"
            key={i}
            style={
              {
                // Negative right of centre: the baseline is tangent to the
                // bowl, so tokens on the right lean back, not forward.
                '--rot': `${(-rad * (180 / Math.PI)).toFixed(2)}deg`,
                // Always positive; the CSS negates it. cos is even, so both
                // ends lift by the same amount.
                '--lift': `${(ARC_R * (1 - Math.cos(rad))).toFixed(3)}em`,
              } as CSSProperties
            }
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}
```

### 3.3 The card title

Replace the rev-1 `<strong>` block (the one that maps `titleLines` to
`<span className="lp-wline">`) with:

```tsx
{/* Display title, set on an arc — see ArcLine above. One ArcLine per
    authored line; the <strong> keeps the whole title as a single
    accessible string. */}
<strong>
  {(step.titleLines ?? [step.title]).map((line, li) => (
    <ArcLine text={line} key={li} />
  ))}
</strong>
```

`.lp-wline` moves from being written here to being emitted by `ArcLine`, so the
element structure per line is unchanged apart from the token spans inside it.

Nothing else in the file changes: not `tokenize`, not `Split`, not the
`<ol>/<li>/<article>` structure, not `.lp-wnum`, not `key={step.title}`.

## 4. `src/app/(lp)/lp.css`

### 4.1 `.lp-what-sec` tokens (~line 660)

**Delete `--wtitle-tilt`.** It has no consumer left, and leaving a dead tilt
knob next to an arc invites someone to switch it back on. Keep `--wtitle-size`
and its comment, adjusted:

```css
  /* Display title. The SIZE lives here; the CURVE lives in ARC_R in
     LpSteps.tsx, because it needs each token's position along the line and CSS
     cannot count. Both are in em, so they stay in proportion on their own. */
  --wtitle-size: 30px;
```

### 4.2 Replace the rev-1 `.lp-wcard strong` + `.lp-wline` rules

```css
/* Display title — the card's poster line, set on a U-shaped arc. The geometry
   is per-token and arrives as inline --rot / --lift from ArcLine in
   LpSteps.tsx; these rules only consume it.
   Rev 1 rotated this whole block by -8deg and was rejected on sight
   (2026-08-04): one shared angle is a diagonal, not a curve. Do not put a
   transform back on the <strong>.

   CENTRED, not flush left. The arc is symmetric about each line's own centre,
   so left-aligning the lines would put each line's low point at a different x
   and the pair would stop reading as one circle.

   WIDTH. The longest line, 「無料AIエージェント」, is ~8.9em — 268px at 30px —
   against a 90% measure of 304px on the 338px card, and its end tokens tilt
   ~18deg which adds ~5px of bounding box each side. That is the number that
   sets 90%; if --wtitle-size goes up, redo it.

   MARGIN-TOP. translateY does not affect layout, so the arc's ends hang ~0.74em
   above the block's layout box. 0.35em pushes the block down by about half of
   that, which puts the curve's optical centre where a flat line would have sat
   and keeps the lifted ends clear of the card's 40px top padding. */
.lp-wcard strong {
  position: relative;
  display: block;
  width: 90%;
  margin: 0.35em auto 0;
  padding: 0;
  font-size: var(--wtitle-size);
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-align: center;
}
/* One line = one arc. `nowrap` because a rewrap would resegment the line while
   every token keeps the angle it was given for the old segmentation — the arc
   would visibly come apart. The authored breaks in lp-variants.ts plus the
   sizes above keep every line inside the measure at every width. */
.lp-wline {
  display: block;
  white-space: nowrap;
}
/* One token on the arc. inline-block so it can be transformed while the
   browser still advances it with the font's real metrics. */
.lp-warc {
  display: inline-block;
  transform: translateY(calc(var(--lift) * -1)) rotate(var(--rot));
}
```

Note `line-height` goes 1.12 → 1.25: a token rotated 18° is taller than its
box, and 1.12 let the end tokens of two stacked lines touch.

### 4.3 Mobile

The `--wtitle-size: clamp(22px, 6.2vw, 27px)` override inside
`@media (max-width: 899px)` is unchanged and still correct — at a 320px
viewport the card is 243px, the 90% measure is 219px, and the longest line at
22px is ~197px.

## 5. Do not touch

`.lp-wnum`, `.lp-wcard p`, `.lp-wcard-1/2/3`, anything under `.lp-what-live`,
`LpMotion.tsx`, and the six `titleLines` arrays in `src/data/lp-variants.ts`.

`.lp-warc` is deliberately NOT `.lp-wchar`: `.lp-what-live .lp-wchar` is the
heading-burst token and is styled and animated section-wide. Reusing that class
name inside the card would enlist the title in the burst.

## 6. Verify

1. `npx tsc --noEmit` — clean. The `as CSSProperties` cast on the inline custom
   properties is required; TS rejects `--rot` in a style object without it.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build` or `npm run dev`** and do not start a server:
   the user owns port 3000 and a build in this tree corrupts their dev server's
   chunks.
4. Sanity-check the emitted numbers by hand for one line — 「として試す」,
   5 tokens of 1em, total 5em: the first token's `d` is
   `0 + 0.5 − 2.5 = −2em`, so `--rot` ≈ `+8.19deg` and `--lift` ≈ `0.143em`;
   the last is the mirror, `−8.19deg` / `0.143em`; the middle token is
   `0deg` / `0em`. If the middle token is not exactly zero, `d` is wrong.

Report the diff, both command results, and anything that did not match.
