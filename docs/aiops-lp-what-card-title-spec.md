# LP「what we do」card — display title (tilted poster setting)

Status: spec, ready to apply. 2026-08-04.
**⚠️ The title geometry in §1/§3.2 is SUPERSEDED by docs/aiops-lp-what-card-title-arc.md (rigid tilt rejected 2026-08-04). The 30px scale and the authored titleLines still stand.**
Touches: `src/app/(lp)/lp.css`, `src/app/(lp)/lp/_components/LpSteps.tsx`,
`src/data/lp-variants.ts`.

## 1. What is changing and why

The manager supplied a reference card (green surface, `BEGINNERS FRIENDLY`,
watermark `1`, small bold body). Everything in our card already matches it —
surface, radius, centred body copy, big low-alpha number watermark — **except the
title**, which is currently 19px/900 centred and reads as a caption rather than
the poster line the reference is built around.

Three properties make the reference's title read the way it does:

1. **Scale.** The title is roughly 2× the body's visual mass, not 1.4×. In the
   reference it is ~42px Latin caps in a ~333px card. Japanese glyphs are
   full-width, so the equivalent visual mass here is **30px**, not 42px.
2. **Tilt.** The block sits at about **−8°** (measured off the reference:
   ~40px of rise over ~275px of run = 8.3°), rotating counter-clockwise.
3. **Ragged-left setting.** The title is flush LEFT with a ragged right edge
   while the body stays centred. That mismatch is deliberate and is most of what
   separates the reference from a generic centred card.

Nothing else on the card changes. In particular:

- **Do not touch `.lp-wnum`.** Its `bottom: 32%` / `120px` are read off the
  madewithgsap reference (`docs/aiops-lp-what-fan-spec.md`) and they still land
  the number optically centred in the band the taller title leaves behind
  (title ink ends ≈126px from the card top, body starts ≈285px; the digit ink
  sits ≈174–260px). Do not "fix" it to a single digit either — `01`/`02`/`03`
  is this site's mono-label language.
- **Do not touch `.lp-wcard p`.** 13px/1.85/700 centred is already the
  reference's body setting.
- **Do not touch the card colours.** `docs/aiops-lp-what-cards-recolor.md` —
  pastel tints and the green card 03 were both rejected on 2026-08-04.
- **Do not add `overflow: hidden` to `.lp-wcard`.** The rotated title is kept
  inside the card by construction (§4); clipping it would be a licence to let it
  overflow later.

## 2. Line breaks are authored, not automatic

At 30px the title becomes a display line, and `text-wrap: balance` breaks
Japanese wherever the measure runs out. Left alone it produces
「無料AIエージェ / ントとして試す」 — a break inside エージェント. At 19px that
never showed; at 30px it is the first thing you see.

So each title gains an **optional** authored line array. The plain `title`
string stays and is still the React key and the fallback.

### 2.1 `src/data/lp-variants.ts`

Extend the type (keep the existing comment block above it untouched):

```ts
export type LpStep = {
  title: string;
  /**
   * Authored line breaks for the card's display title. OPTIONAL — omit it and
   * the title wraps on its own.
   *
   * The card title is set at 30px, where the browser's own Japanese line
   * breaking will happily split 「エージェント」 mid-word. These arrays are the
   * manager's copy, unchanged, with the break points chosen by hand. The
   * concatenation MUST equal `title` exactly: `title` is what a screen reader
   * would otherwise get, and it is also the React key.
   */
  titleLines?: readonly string[];
};
```

Add `titleLines` to all six steps. **The strings are the manager's verbatim copy
— splitting them is the only permitted edit. Do not reword, do not add
punctuation, do not insert spaces.**

`'ai-staff'` (A案), `what.steps`:

| # | `title` (unchanged) | `titleLines` |
|---|---|---|
| 1 | `任せる業務を1つ決める` | `['任せる業務を', '1つ決める']` |
| 2 | `会社の文脈をAIに教える` | `['会社の文脈を', 'AIに教える']` |
| 3 | `無料AIエージェントとして試す` | `['無料AIエージェント', 'として試す']` |

`president` (B案), `what.steps`:

| # | `title` (unchanged) | `titleLines` |
|---|---|---|
| 1 | `社長待ちの業務を特定する` | `['社長待ちの業務を', '特定する']` |
| 2 | `判断基準をAIに渡す` | `['判断基準を', 'AIに渡す']` |
| 3 | `確認待ちを減らす` | `['確認待ちを', '減らす']` |

Every first line is ≤ 8 full-width units, which is 240px at 30px against a
284px measure — so no authored line ever needs to wrap again. No line starts
with 「を」 or a small kana.

### 2.2 `src/app/(lp)/lp/_components/LpSteps.tsx`

Replace only the `<strong>` element inside `.lp-wcard`:

```tsx
{/* Display title. One <span> per authored line — see `titleLines` in
    lp-variants.ts. They are blocks, not <br>s, because each line is the
    thing that gets tilted and each still has to be able to wrap on its
    own if a narrow phone squeezes it. The <strong> keeps the whole title
    as one accessible string. */}
<strong>
  {(step.titleLines ?? [step.title]).map((line, li) => (
    <span className="lp-wline" key={li}>
      {line}
    </span>
  ))}
</strong>
```

Nothing else in the file changes — not the `<ol>`/`<li>`/`<article>` structure,
not `.lp-wnum`, not the `key={step.title}` on the `<li>`.

## 3. CSS

In `src/app/(lp)/lp.css`.

### 3.1 Add two tokens to `.lp-what-sec` (currently ~line 656)

```css
.lp-what-sec {
  --wcard-w: 338px;
  --wheel-d: 3675px;
  --wheel-step: 6.2deg;
  --wcard-radius: 20px;
  /* Display title. Both are single knobs on purpose — the tilt is the whole
     effect and the size is what the tilt is safe at (see the geometry note on
     .lp-wcard strong). Change one and re-check the other. */
  --wtitle-size: 30px;
  --wtitle-tilt: -8deg;
}
```

### 3.2 Replace the `.lp-wcard strong` rule (currently ~line 779)

```css
/* Display title — the card's poster line. Ported from the manager's reference
   card (2026-08-04): big, black-weight, flush LEFT with a ragged right, tilted
   counter-clockwise, against a body that stays centred. That left/centre
   mismatch is the effect; do not "tidy" the title back to centre.

   30px is the Japanese equivalent of the reference's ~42px Latin caps — CJK
   glyphs are full-width, so matching it by number would double the block.

   GEOMETRY — why 84% and why the tilt is safe. The box is 0.84 x 338 = 284px
   wide and two lines tall (2 x 30 x 1.12 = 67px). Rotating that by 8 degrees
   about its centre pushes the corners out to
   142 x cos8 + 33.5 x sin8 = 145px from the centre, i.e. 290px of the card's
   338px — 24px of clearance each side. A third line would still fit (299px).
   The card is deliberately NOT overflow:hidden, so if --wtitle-size or the
   width goes up, this is the sum that has to be redone. */
.lp-wcard strong {
  position: relative;
  display: block;
  width: 84%;
  margin: 0 auto;
  padding: 0;
  font-size: var(--wtitle-size);
  line-height: 1.12;
  font-weight: 900;
  /* Dense kanji at display size sets loose by default. */
  letter-spacing: -0.02em;
  text-align: left;
  transform: rotate(var(--wtitle-tilt));
  /* Purely visual: rotation must not move where the flex column puts the
     block, or the number watermark below it drifts card to card. */
  transform-origin: 50% 50%;
}
/* One authored line. `balance` is a safety net only — the breaks are authored
   in lp-variants.ts and no line should ever reach the measure. It matters at
   ~320px, where a line that did overflow would otherwise drop a single
   trailing character (the manager objects to those). */
.lp-wline {
  display: block;
  text-wrap: balance;
}
```

Note the old rule's `text-wrap: balance` moves from the `<strong>` to
`.lp-wline`, and its `padding: 0 8%` becomes `width: 84%` + `margin: 0 auto` —
same 8% inset, but now the tilt pivots about the text block instead of about a
padded full-width box, which is what keeps the corner maths above honest.

### 3.3 Mobile size, inside the existing `@media (max-width: 899px)` block

The card there is `min(76vw, 320px)`, not 338px, so the title has to come down
with it. Put this next to the other `.lp-wcard` rules in that block:

```css
  .lp-what-sec {
    /* The strip's card is min(76vw, 320px); at 320px viewport that is 243px
       wide and a 30px title would overrun the 84% measure. The floor keeps the
       longest first line (無料AIエージェント, 7 full-width + 2 Latin units)
       inside it at every phone width we support. */
    --wtitle-size: clamp(22px, 6.2vw, 27px);
  }
```

Do **not** use a `vw` size at desktop widths: in live fan mode the card is a
fixed 338px no matter how wide the window is, so `vw` there would size the
title against something the card cannot see.

## 4. Interaction with the fan (read before applying)

The three cards live on a rotating wheel — `.lp-wslot` gets `rotation: n * 6.2`
from LpMotion and the wheel counter-rotates by half a step. So a card is already
tilted up to ~±6° in the viewport, and the title's −8° is **on top of** that.
That is intended: the tilt belongs to the card, so it rides the card, exactly as
the type on a physical card would. Do not try to counter-rotate the title
against the wheel — that would make it the only element on the fan that is not
attached to its card.

No JS change. LpMotion never touches the card interior (`grep` it: no
`.lp-wcard`, no `strong`, no `.lp-wnum`) and it must not start.

## 5. Verify

1. `npx tsc --noEmit` — clean. **Do not run `npm run build` or `npm run dev`;**
   the user owns port 3000 and a build in this tree corrupts their running dev
   server's chunks.
2. Re-read the diff and confirm: `.lp-wnum`, `.lp-wcard p`, the three
   `.lp-wcard-N` colour rules, and every rule under `.lp-what-live` are
   untouched.
3. Confirm each `titleLines` array joins back to its `title` character for
   character.

Report what changed and anything that did not fit the spec — stop and say so
rather than inventing a value.
