# LP「what we do」card title — rev 3: flip the arc to an inverted U

Status: spec, ready to apply. 2026-08-05.
**Supersedes the arc *direction* in `docs/aiops-lp-what-card-title-arc.md`.**
Everything else in that document still stands unchanged: `tokenize`, the em-width
`advance` table, `ARC_R = 14`, the server-rendered no-JS approach, the 90%
measure, `--wtitle-size`, `line-height: 1.25`, the watermark, body copy and card
colours.

## 1. What changes

Rev 2 set each title line on a circle whose centre is **above** the line: the
middle of the line was the low point and the ends rode up — a **U**. Rejected
2026-08-05: the manager wants the mirror.

The circle's centre moves **below** the line. The middle of the line is now the
**high** point and the ends fall away — an **inverted U / arch**.

```
             card top
   ┌──────────────────────────────┐
   │      料  AI  エー ジェ        │   ← middle sits highest, upright
   │  無                     ン ト │   ← ends dropped, leaning outward
   │                              │
   │         て  試               │
   │      と し         す        │
   │                              │
   │            01                │
   └──────────────────────────────┘
```

Both lines still ride the **same** `ARC_R`, so they remain congruent parallel
curves and the vertical gap between them stays constant wherever they overlap
horizontally. That property is direction-independent — do not give the two lines
different radii to "make the arch nest better".

## 2. The maths, and why both signs flip

Screen coordinates, x right and **y down**. Put the line's midpoint at the
origin. `φ = d / R` where `d` is the token's distance in em from its line's
centre.

| | rev 2 (U) | rev 3 (arch) |
|---|---|---|
| circle centre | `(0, −R)` — above | **`(0, +R)` — below** |
| token position | `(R sin φ, −R(1−cos φ))` | **`(R sin φ, +R(1−cos φ))`** |
| vertical offset | `−R(1−cos φ)` → **up** | **`+R(1−cos φ)` → down** |
| unit tangent | `(cos φ, −sin φ)` | **`(cos φ, +sin φ)`** |
| CSS rotation | `−φ` | **`+φ`** |

`cos` is even in both cases, so the two ends move by the same amount and the
curve stays symmetric.

The rotation sign is not a free choice — it follows from the tangent. On an arch,
a token right of centre sits on a baseline that **descends** to the right, which
is a clockwise (positive) CSS rotation; left of centre the sign flips and the
baseline climbs into the middle. Set the rotation without flipping it and every
token leans the wrong way against its own curve, which reads as a mistake rather
than as a curve.

## 3. `src/app/(lp)/lp/_components/LpSteps.tsx`

### 3.1 `ARC_R` comment (line ~53–64)

Two words are now wrong — the end tokens ride *below* the middle, and "bowl" is
the shape we just removed. Replace the comment block above `const ARC_R = 14;`
with:

```tsx
// Radius of the circle the card titles are set on, in em of the title's own
// font-size — so the curve scales with --wtitle-size and never needs re-tuning
// per breakpoint. 14em is ~420px at the desktop 30px title: the longest line
// (~8.9em) spans ~36° of it and its end tokens fall ~0.74em below the middle.
//
// This is the ONLY place the curve is defined. The CSS just consumes the two
// custom properties emitted below — do not try to express the arc in lp.css,
// it needs each token's position along the line and CSS cannot count.
//
// Smaller R = tighter arch. Below ~10 the end tokens tip past 25° and the line
// stops reading as a sentence; above ~24 it flattens back to a straight line.
const ARC_R = 14;
```

The value `14` does not change.

### 3.2 `ArcLine` — the doc comment

Replace the JSDoc block above `function ArcLine` with:

```tsx
/**
 * One line of a card title, set on a circle whose centre is BELOW the line: the
 * middle of the line is the high point and the ends fall away — an inverted U,
 * an arch. A rigid rotate() on the whole block was rejected 2026-08-04 precisely
 * because every character in it shares one angle; the U-shaped version of this
 * same arc was rejected 2026-08-05 in favour of the arch. Derivation of both
 * signs: docs/aiops-lp-what-card-title-arc-rev3.md.
 *
 * Both lines of a title use the same ARC_R, so they are arcs of the SAME
 * circle and the gap between them stays constant wherever they overlap.
 */
```

### 3.3 `ArcLine` — the two emitted properties

`--lift` is renamed to `--drop`. This is not cosmetic: a property named `lift`
that moves text downward is a trap for the next person, and the CSS no longer
negates it. Replace the `style={...}` object with:

```tsx
              {
                // POSITIVE right of centre: on an arch the baseline descends to
                // the right, which is a clockwise CSS rotation. Left of centre
                // the sign flips and the baseline climbs into the middle.
                '--rot': `${(rad * (180 / Math.PI)).toFixed(2)}deg`,
                // Always positive, and the CSS applies it downward as-is. cos is
                // even, so both ends fall by the same amount.
                '--drop': `${(ARC_R * (1 - Math.cos(rad))).toFixed(3)}em`,
              } as CSSProperties
```

The only functional edits in the whole file are the dropped `-` in front of
`rad` and the property rename. `d`, `rad`, `tokenize`, `advance`, the `<span
className="lp-warc">` element and the `as CSSProperties` cast are all unchanged.

## 4. `src/app/(lp)/lp.css`

### 4.1 `.lp-wcard strong` (line ~783–814)

Replace the comment block **and** the rule. The `margin` is the one real layout
change: `translateY` does not affect layout, so with the U the arc's ends hung
*above* the block's layout box and `margin-top: 0.35em` pushed the block down to
compensate. On an arch the overhang is *below*, so the top compensation is
removed and the same 0.35em is reserved underneath instead.

```css
/* Display title — the card's poster line, set on an inverted-U arc: the middle
   of each line is the high point and the ends fall away. The geometry is
   per-token and arrives as inline --rot / --drop from ArcLine in LpSteps.tsx;
   these rules only consume it.

   Two rejected ancestors, both worth not repeating. Rev 1 rotated this whole
   block by -8deg (2026-08-04): one shared angle is a diagonal, not a curve — do
   not put a transform back on the <strong>. Rev 2 set the same arc as a U, ends
   lifted (2026-08-05): the arch is the direction the manager asked for, and
   flipping it back means flipping BOTH the rotation sign in ArcLine and the
   margin below, not just one.

   CENTRED, not flush left. The arc is symmetric about each line's own centre,
   so left-aligning the lines would put each line's high point at a different x
   and the pair would stop reading as one circle.

   WIDTH. The longest line, 「無料AIエージェント」, is ~8.9em — 268px at 30px —
   against a 90% measure of 304px on the 338px card, and its end tokens tilt
   ~18deg which adds ~5px of bounding box each side. That is the number that
   sets 90%; if --wtitle-size goes up, redo it.

   MARGIN. translateY does not affect layout, so the arc's ends now hang ~0.74em
   BELOW the block's layout box. The rev-2 `margin-top: 0.35em` existed to push
   the block down away from an overhang that pointed up, and is therefore gone —
   keeping it would have shoved the arch's descending ends toward the watermark.
   The 0.35em moves to the bottom, where it reserves roughly half the descent in
   layout so nothing below can creep into it. */
.lp-wcard strong {
  position: relative;
  display: block;
  width: 90%;
  margin: 0 auto 0.35em;
  padding: 0;
  font-size: var(--wtitle-size);
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-align: center;
}
```

### 4.2 `.lp-warc` (line ~823–828)

```css
/* One token on the arc. inline-block so it can be transformed while the browser
   still advances it with the font's real metrics. --drop is applied as-is, not
   negated: on an arch the ends move DOWN. */
.lp-warc {
  display: inline-block;
  transform: translateY(var(--drop)) rotate(var(--rot));
}
```

### 4.3 `.lp-what-sec` token comment (line ~663)

No code change. `--wtitle-size` and its comment are correct as written.

## 5. Do not touch

`.lp-wline`, `.lp-wnum`, `.lp-wcard p`, `.lp-wcard-1/2/3`, everything under
`.lp-what-live`, `LpMotion.tsx`, and `src/data/lp-variants.ts`.

In particular **the three-card fan is already an arch and is not part of this
change** — its hub sits ~1837px below the cards, so card 01 and card 03 already
sit lower than card 02. Do not touch `--wheel-d`, `--wheel-step`, `.lp-wslot` or
the `rotation` calls in `LpMotion.tsx`.

`.lp-warc` keeps its class name. Renaming it to `.lp-wchar` would enlist the
title in the section-wide heading burst.

## 6. Verify

1. `npx tsc --noEmit` — clean.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build`, `npm run dev`, or any server.** The user owns
   port 3000 and a build in this tree corrupts their running dev server's chunks.
4. Repo-wide grep for `--lift` returns **nothing** under `src/app/(lp)/`.
5. Hand-check one line — 「として試す」, 5 tokens of 1em, `total` 5em:
   - first token: `d = 0 + 0.5 − 2.5 = −2em` → `--rot` ≈ **`-8.19deg`**,
     `--drop` ≈ `0.143em`
   - last token: the mirror → `--rot` ≈ **`+8.19deg`**, `--drop` ≈ `0.143em`
   - middle token: `0deg` / `0em`
   The signs are the *opposite* of rev 2's. If the first token is positive, the
   `-` in front of `rad` was not removed.
6. Do not commit, stage or push.

Report the diff, both command results, and anything that did not match.
