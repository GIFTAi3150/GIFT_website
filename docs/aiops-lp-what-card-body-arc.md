# LP「what we do」card body — set it on a U, and make it readable

Status: spec, ready to apply. 2026-08-05.
Builds directly on `docs/aiops-lp-what-card-title-arc-rev3.md` (the title arch),
and **supersedes that document's §4.2**: the `--drop` property it introduced is
replaced here by a signed `--arc-y`, because one card now carries two arcs
pointing opposite ways and a one-directional property name cannot serve both.

## 1. What we are building

Two changes to the small paragraph at the bottom of each card:

1. **Set it on a U** — a circle whose centre is ABOVE the line, so the middle of
   each line is the low point and the ends ride up. The exact mirror of the
   title's arch, which the manager approved this morning.
2. **Make it bigger.** 13px is too small to read on a 338×398 card. It goes to
   **16px**, and the ink gets a small contrast lift to match.

The card ends up reading as **arch over bowl** — the title curving one way at the
top, the body curving the other at the bottom, with the `01` watermark between
them. That is the whole reason to keep the two radii close in *pixels* rather
than in em (see §4): two arcs of wildly different curvature on one card read as
an accident, not a pair.

```
   ┌──────────────────────────────┐
   │      料  AI  エー ジェ        │   ← title: arch, ends fall
   │  無                     ン ト │
   │                              │
   │            01                │
   │                              │
   │  問                      、  │   ← body: bowl, ends rise
   │    い 合  わ  せ 、 見 積     │
   └──────────────────────────────┘
```

## 2. Why the body copy needs authored line breaks

`.lp-wline` carries `white-space: nowrap`, and it has to: every token is given
its angle at render time based on its position along its line, so if the browser
rewrapped the line the tokens would keep angles computed for a segmentation that
no longer exists and the arc would visibly come apart. The title already solves
this with the authored `titleLines`. The body has no equivalent — it is one
string that wraps on its own — so the body gets `bodyLines`, authored the same
way and under the same invariant.

**Hard constraint that comes with it: no authored body line may exceed ~14em.**
That is what makes `nowrap` safe at every viewport. The breaks in §3 are all at
or under 14em, and the sizes in §5 are chosen so 14em fits the measure at both
the desktop 338px card and the 243px mobile card. If anyone adds copy later,
that is the number to check against.

## 3. `src/data/lp-variants.ts`

### 3.1 The type

Add `bodyLines` directly after `body` in `LpStep` (line ~35), mirroring the
existing `titleLines` doc comment:

```ts
  body: string;
  /**
   * Authored line breaks for the card's body copy. OPTIONAL — omit it and the
   * paragraph wraps on its own.
   *
   * Required for any step whose card is live, because the body is set on an arc
   * and `.lp-wline` is `white-space: nowrap`: each token is given its angle from
   * its position along its line, so a browser rewrap would leave every token
   * holding an angle for a segmentation that no longer exists. Same invariant as
   * `titleLines` — the concatenation MUST equal `body` exactly, since `body` is
   * what a screen reader would otherwise get.
   *
   * ⚠️ Keep every line at or under ~14em (≈14 full-width characters). That is
   * what lets `nowrap` be safe at the 243px mobile card. See
   * docs/aiops-lp-what-card-body-arc.md §2.
   */
  bodyLines?: readonly string[];
```

### 3.2 The six steps

Add a `bodyLines` to each of the six steps. **Do not retype the Japanese** —
build each array by splitting the existing `body` string in place, so the bytes
are carried over rather than re-entered. `body` itself is unchanged in all six.

Concept A (`what.steps`, lines ~153–169):

```ts
        {
          title: '任せる業務を1つ決める',
          titleLines: ['任せる業務を', '1つ決める'],
          body: '問い合わせ、見積、議事録、資料探しなど、面談で候補を絞ります。',
          bodyLines: ['問い合わせ、見積、', '議事録、資料探しなど、', '面談で候補を絞ります。'],
        },
        {
          title: '会社の文脈をAIに教える',
          titleLines: ['会社の文脈を', 'AIに教える'],
          body: '過去資料、対応履歴、社長の判断基準をAIが使える形にします。',
          bodyLines: ['過去資料、対応履歴、', '社長の判断基準を', 'AIが使える形にします。'],
        },
        {
          title: '無料AIエージェントとして試す',
          titleLines: ['無料AIエージェント', 'として試す'],
          body: 'まず1業務で動かし、御社で使えるかを確認します。',
          bodyLines: ['まず1業務で動かし、', '御社で使えるかを確認します。'],
        },
```

Concept B (`what.steps`, lines ~219–235):

```ts
        {
          title: '社長待ちの業務を特定する',
          titleLines: ['社長待ちの業務を', '特定する'],
          body: 'どこで仕事が止まっているかを面談で洗い出します。',
          bodyLines: ['どこで仕事が止まっているかを', '面談で洗い出します。'],
        },
        {
          title: '判断基準をAIに渡す',
          titleLines: ['判断基準を', 'AIに渡す'],
          body: '過去対応や社内ルールを、AIが参照できる形にします。',
          bodyLines: ['過去対応や社内ルールを、', 'AIが参照できる形にします。'],
        },
        {
          title: '確認待ちを減らす',
          titleLines: ['確認待ちを', '減らす'],
          body: '見積、問い合わせ、資料探しなどから無料で試します。',
          bodyLines: ['見積、問い合わせ、', '資料探しなどから', '無料で試します。'],
        },
```

Breaks are at 読点 wherever the copy offers one. The longest line in the set is
「御社で使えるかを確認します。」and「どこで仕事が止まっているかを」at 14em — the
ceiling §2 sets. Three of the six run to three lines because two would have put a
line at 18–20em, well past the card's measure.

**Verify by hand before moving on:** for each of the six, `bodyLines.join('')`
must equal `body` character for character.

## 4. `src/app/(lp)/lp/_components/LpSteps.tsx`

### 4.1 `ARC_R` becomes two radii

Rename `ARC_R` to `ARC_R_TITLE` (value unchanged) and add a body radius. Replace
the comment block and the constant at line ~53–64 with:

```tsx
// Radius of the circle each line of card type is set on, in em of that type's
// own font-size — so both curves scale with their font size and neither ever
// needs re-tuning per breakpoint.
//
// These are the ONLY place the curves are defined. The CSS just consumes the two
// custom properties ArcLine emits — do not try to express an arc in lp.css, it
// needs each token's position along the line and CSS cannot count.
//
// The two values are deliberately close in PIXELS, not in em: 14em at the 30px
// title is ~420px, 30em at the 16px body is ~480px. One card carries an arch and
// a bowl at once, and two arcs of visibly different curvature on one card read
// as an accident rather than as a pair. If either font size changes, move the
// other radius to keep the pixel radii within ~15% of each other.
//
// Smaller R = tighter curve. Below ~10 em-widths of half-line the end tokens tip
// past 25° and the line stops reading as a sentence; too large and it flattens
// back to a straight line. At these values the longest title line's ends tilt
// ~18° and the longest body line's ~13°.
const ARC_R_TITLE = 14;
const ARC_R_BODY = 30;
```

### 4.2 `ArcLine` takes a radius and a direction

Replace the whole `ArcLine` JSDoc + function with:

```tsx
/**
 * One line of card type, set on a circle so each token sits at its own angle and
 * the line bows. A rigid rotate() on the whole block was rejected 2026-08-04
 * precisely because every character in it shares one angle.
 *
 * `dir` picks which side of the line the circle's centre is on:
 *   - 'arch' — centre BELOW. The middle of the line is the high point and the
 *     ends fall away. This is the card TITLE (approved 2026-08-05, replacing a
 *     bowl that was rejected the same morning).
 *   - 'bowl' — centre ABOVE. The middle is the low point and the ends ride up.
 *     This is the card BODY.
 * The two are exact mirrors, so one sign drives both the vertical offset and the
 * rotation. Derivation of why the rotation sign must flip with the offset:
 * docs/aiops-lp-what-card-title-arc-rev3.md §2.
 *
 * All lines of one block share a radius, so they are arcs of the SAME circle:
 * congruent parallel curves whose vertical gap stays constant wherever they
 * overlap horizontally. Do not give the lines of one block different radii.
 */
function ArcLine({
  text,
  r,
  dir,
}: {
  text: string;
  r: number;
  dir: 'arch' | 'bowl';
}) {
  const tokens = tokenize(text);
  const widths = tokens.map(advance);
  const total = widths.reduce((sum, w) => sum + w, 0);
  const sign = dir === 'arch' ? 1 : -1;
  let x = 0;

  return (
    <span className="lp-wline">
      {tokens.map((token, i) => {
        // This token's centre, in em, measured from the line's centre.
        const d = x + widths[i] / 2 - total / 2;
        x += widths[i];
        const rad = d / r;
        return (
          <span
            className="lp-warc"
            key={i}
            style={
              {
                // The baseline is tangent to the circle. On an arch it descends
                // to the right of centre (clockwise, positive); on a bowl it
                // climbs (counter-clockwise, negative). Same sign as the offset.
                '--rot': `${(sign * rad * (180 / Math.PI)).toFixed(2)}deg`,
                // SIGNED, and positive is DOWN — the CSS applies it as-is. cos
                // is even, so both ends of a line move by the same amount.
                '--arc-y': `${(sign * r * (1 - Math.cos(rad))).toFixed(3)}em`,
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

`tokenize` and `advance` are unchanged. `tokenize` is still the right unit for
the body for the same reason it was for the title: it keeps 「AI」 whole and glues
「、」 and 「。」 onto the character before them, so a token never swings along the
arc leaving its punctuation behind.

### 4.3 The two call sites

The title call gains the two new props:

```tsx
                    <strong>
                      {(step.titleLines ?? [step.title]).map((line, li) => (
                        <ArcLine text={line} r={ARC_R_TITLE} dir="arch" key={li} />
                      ))}
                    </strong>
```

And the body `<p>` — currently `<p>{step.body}</p>` — becomes:

```tsx
                    {/* Body copy, set on a bowl — the mirror of the title's
                        arch above it. One ArcLine per authored line; the <p>
                        keeps the whole paragraph as one accessible string.
                        bodyLines is required for the arc to survive a resize;
                        the fallback exists only so a step authored without it
                        still renders. */}
                    <p>
                      {(step.bodyLines ?? [step.body]).map((line, li) => (
                        <ArcLine text={line} r={ARC_R_BODY} dir="bowl" key={li} />
                      ))}
                    </p>
```

Nothing else in the file changes.

## 5. `src/app/(lp)/lp.css`

### 5.1 `.lp-what-sec` — add a body-size token (after `--wtitle-size`, line ~666)

```css
  /* Body copy. 13px shipped first and was rejected 2026-08-05 as too small to
     read on the card. The CURVE for this one is ARC_R_BODY in LpSteps.tsx; see
     the note there about keeping the two arcs' pixel radii close. */
  --wbody-size: 16px;
```

### 5.2 `.lp-warc` — consume the signed offset (line ~825)

```css
/* One token on an arc. inline-block so it can be transformed while the browser
   still advances it with the font's real metrics. --arc-y is SIGNED and applied
   as-is — positive is down, so the title's arch and the body's bowl are the same
   rule with opposite inputs. Do not negate it here; the sign is ArcLine's. */
.lp-warc {
  display: inline-block;
  transform: translateY(var(--arc-y)) rotate(var(--rot));
}
```

### 5.3 `.lp-wcard p` (line ~829)

```css
/* Body copy, set on a bowl — see .lp-warc and ArcLine. The geometry arrives
   per-token as inline --rot / --arc-y; this rule only sizes and colours it.

   CENTRED (inherited from .lp-wcard). Each line's arc is symmetric about that
   line's own centre, so left-aligning would put every line's low point at a
   different x and the block would stop reading as one circle.

   MARGIN-BOTTOM is negative on purpose. translateY does not affect layout, so
   the bowl's ends hang ~0.4em ABOVE the block's layout box and the paragraph
   optically floats off the bottom of the card. -0.35em pulls it back down by
   about half the rise, spending ~6px of the card's 40px bottom padding. The
   title above uses the mirror of this (+0.35em, because its overhang points
   down). */
.lp-wcard p {
  position: relative;
  margin: 0 0 -0.35em;
  padding: 0 8%;
  color: var(--wcard-body);
  font-size: var(--wbody-size);
  line-height: 1.85;
  font-weight: 700;
}
```

### 5.4 Contrast — three edits, all small

The complaint was size, but 0.66 alpha was tuned for type that no longer exists.
In `.lp-wcard`:

```css
  --wcard-body: rgba(5, 5, 5, 0.76);
```

In `.lp-wcard-3`:

```css
  --wcard-body: rgba(13, 22, 32, 0.8);
```

`.lp-wcard-2` keeps `rgba(255, 255, 255, 0.92)` — it is already near-opaque.
**Its comment must be corrected**, because it justifies the value with a size
that just changed. Replace the comment above it with:

```css
  /* .92, not a softer .78: below roughly .9 the blended body copy drops under
     4.5:1 on this blue. The old note here pinned that to 13px type; the body is
     16px now and the ratio is no longer marginal, but hierarchy on this card
     comes from size and weight rather than from faded ink, so the value stays. */
```

### 5.5 Mobile — inside the existing `@media (max-width: 899px)` block

Add next to the existing `--wtitle-size` override, in the same rule:

```css
  /* The mobile card is min(76vw, 320px) — 243px at a 320px viewport. At 8%
     padding that is a 204px measure, and the longest authored body line is 14em,
     so the size has to come down and the padding has to open up for `nowrap` to
     stay safe. 14em x 14px = 196px inside a 219px measure at 5% padding. */
  --wbody-size: clamp(14px, 3.8vw, 16px);
```

and, as a sibling rule in the same media block:

```css
  .lp-wcard p {
    padding: 0 5%;
  }
```

## 6. Do not touch

`.lp-wnum`, `.lp-wline`, `.lp-wcard strong` (the title rule from rev 3 is
correct as it stands), the card background colours, everything under
`.lp-what-live`, `LpMotion.tsx`, and the three-card fan geometry
(`--wheel-d`, `--wheel-step`, `.lp-wslot`).

Do not add a `text-align` to `.lp-wcard p` — it inherits `center` from
`.lp-wcard`, and that is load-bearing for the arc.

## 7. Verify

1. `npx tsc --noEmit` — clean.
2. `node scripts/check-encoding.mjs` — clean.
3. **Do not run `npm run build`, `npm run dev`, or any server.** The user owns
   port 3000 and a build in this tree corrupts their running dev server's chunks.
4. Repo-wide grep for `--drop` and `--lift` returns **nothing** under
   `src/app/(lp)/`. Repo-wide grep for `ARC_R\b` returns nothing (both constants
   are now suffixed).
5. For each of the six steps, confirm `bodyLines.join('') === body`. State
   explicitly that you checked all six.
6. Hand-check one body line — 「面談で候補を絞ります。」 at `r = 30`, `dir="bowl"`.
   `tokenize` glues 「。」 to 「す」, so it is 10 tokens: nine of 1em plus 「す。」
   at 2em, `total = 11em`.
   - first token 「面」: `d = 0.5 − 5.5 = −5em`, `rad = −0.16667` →
     `--rot` ≈ **`9.55deg`** (positive), `--arc-y` ≈ **`-0.416em`** (negative =
     up, which is what makes it a bowl)
   - token 「を」 (index 5): `d = 0` → `0.00deg` / `-0.000em` or `0.000em`
   - last token 「す。」: `d = 9 + 1 − 5.5 = 4.5em`, `rad = 0.15` →
     `--rot` ≈ **`-8.59deg`**, `--arc-y` ≈ **`-0.337em`**
   If any `--arc-y` on a body token is positive, `sign` is wrong.
7. Do not commit, stage or push.

Report the diff, both command results, items 4/5/6, and anything that did not
match.
