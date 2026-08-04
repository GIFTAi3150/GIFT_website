# LP what-we-do cards — recolour to the page palette

Spec for the three fan cards in the `/lp` what-we-do section
(`.lp-wcard-1/2/3` in `src/app/(lp)/lp.css`). Supersedes the colour block in
`docs/aiops-lp-what-cards-spec.md`; the geometry, the fan and everything else
in that spec are untouched.

## Why

The cards shipped in the madewithgsap reference's own pastels — `#a9f0c9`,
`#c7d9ff`, `#efefef`. They were picked as tints of this page's accents, but a
tint is not the accent: the LP speaks in four surfaces only, all of them at full
strength —

| token | value | where it already appears on the LP |
|---|---|---|
| `--lp-black` | `#050505` | hero, this section's own background |
| `--lp-paper` | `#ffffff` | the whole before/after timeline section directly above |
| `--lp-blue` | `#165dff` | every `.lp-eyebrow`, including this section's own 「WHAT WE DO」 |
| `--lp-line` | `#06c755` | the timeline's "with gift" rail, and the full-bleed CTA section directly below |

Washed pastel next to that vocabulary reads as a second brand. Reported by the
user, 2026-08-04: the cards don't match the page.

## The new set

The three cards become the page's own surfaces, in narrative order:

| card | copy | surface | why that one |
|---|---|---|---|
| 01 | 任せる業務を1つ決める | `--lp-paper` `#ffffff` | the blank sheet before anything is decided — and literally the paper of the section above it |
| 02 | 会社の文脈をAIに教える | `--lp-blue` `#165dff` | the work; the same blue as the eyebrow sitting directly above the fan |
| 03 | 無料AIエージェントとして試す | steel blue-grey `#b6c4d6` | `--lp-blue` with the saturation taken out — the same family as card 02, a step calmer, and the brightest-reading card at the top of the fan |

Card 03 shipped as `--lp-line` `#06c755` first, to rhyme with the CTA section
below it, and was rejected on sight (2026-08-04): the LINE green is right for a
CTA button and wrong as a 400px-tall surface, where it goes acidic and drags the
whole fan with it. The rhyme was not worth the card. Steel blue-grey replaces
it; do not propose a green card here again.

## Implementation

One block in `src/app/(lp)/lp.css`. Each card carries its whole ink scheme in
four custom properties so the title, body and watermark all follow the surface
from a single place, instead of three unrelated colour rules drifting apart.

### Edit 1 — `.lp-wcard` gains the ink variables

Find:

```css
  border-radius: var(--wcard-radius);
  color: var(--lp-black);
  text-align: center;
  /* No box-shadow — the reference has none, and shadowed rounded cards are the
     templated-SaaS look this site rejects. */
}
```

Replace with:

```css
  border-radius: var(--wcard-radius);
  /* The card's whole ink scheme, defaulting to the paper card. The three colour
     rules below override only what their surface changes, so a title, its body
     copy and its watermark can never drift onto different assumptions about how
     dark the card underneath them is. */
  --wcard-bg: var(--lp-paper);
  --wcard-ink: var(--lp-black);
  --wcard-body: rgba(5, 5, 5, 0.66);
  --wcard-num: rgba(5, 5, 5, 0.16);
  background: var(--wcard-bg);
  color: var(--wcard-ink);
  text-align: center;
  /* No box-shadow — the reference has none, and shadowed rounded cards are the
     templated-SaaS look this site rejects. */
}
```

### Edit 2 — the three surfaces

Find:

```css
/* Each card its own pastel, near-black text, exactly as the reference does it.
   Ours are tints of this page's existing --lp-line and --lp-blue plus a
   neutral, matching their 3-chromatic-plus-1-neutral ratio at our card count. */
.lp-wcard-1 {
  background: #a9f0c9;
}
.lp-wcard-2 {
  background: #c7d9ff;
}
.lp-wcard-3 {
  background: #efefef;
}
```

Replace with:

```css
/* One card per surface of the LP, in narrative order: the blank sheet, the
   work, the call to action. These are the page's OWN four colours at full
   strength — not tints of them. The reference's pastels (#a9f0c9 / #c7d9ff /
   #efefef) shipped here first and were rejected 2026-08-04: a washed tint next
   to a full-bleed #06c755 CTA and a #165dff eyebrow reads as a second brand.
   Do not re-introduce a pastel here; if a card needs to sit back, change its
   ORDER in the fan, not its saturation.

   Card 03 was --lp-line #06c755 for one iteration and was rejected on sight
   (2026-08-04): the LINE green is right for a CTA button and wrong as a
   400px-tall surface — at that size it goes acidic and drags the whole fan with
   it. It is now a steel blue-grey, the same hue family as --lp-blue with the
   saturation taken out, so the trio reads paper -> blue -> steel. Do not put a
   green card back.

   Text colour per card is a contrast requirement, not a taste one: white body
   copy on --lp-blue has to stay near-opaque to clear 4.5:1, and both light
   cards take a blue-black ink rather than a neutral grey, so the ink reads as
   something the surface itself would cast. */
.lp-wcard-1 {
  /* Paper. Inherits the base ink scheme unchanged — and it is the same white as
     the before/after section directly above this one. */
  background: var(--lp-paper);
}
.lp-wcard-2 {
  --wcard-bg: var(--lp-blue);
  --wcard-ink: var(--lp-white);
  /* .92, not a softer .78: below roughly .9 the blended body copy drops under
     4.5:1 on this blue and 13px/700 JP text is exactly the size that cannot
     afford it. Hierarchy on this card comes from size and weight instead. */
  --wcard-body: rgba(255, 255, 255, 0.92);
  --wcard-num: rgba(255, 255, 255, 0.22);
}
.lp-wcard-3 {
  /* Steel — --lp-blue desaturated and lifted. Deep enough that it never reads
     as a second white card beside 01, light enough to hold blue-black ink at
     ~10:1. */
  --wcard-bg: #b6c4d6;
  --wcard-ink: #0d1620;
  --wcard-body: rgba(13, 22, 32, 0.7);
  --wcard-num: rgba(13, 22, 32, 0.2);
}
```

### Edit 3 — the watermark follows its card

Find:

```css
  letter-spacing: -0.04em;
  color: rgba(5, 5, 5, 0.18);
  pointer-events: none;
```

Replace with:

```css
  letter-spacing: -0.04em;
  color: var(--wcard-num);
  pointer-events: none;
```

### Edit 4 — the body copy follows its card

Find:

```css
.lp-wcard p {
  position: relative;
  margin: 0;
  padding: 0 8%;
  color: rgba(5, 5, 5, 0.66);
```

Replace with:

```css
.lp-wcard p {
  position: relative;
  margin: 0;
  padding: 0 8%;
  color: var(--wcard-body);
```

## Verification

- `npx tsc --noEmit` must pass.
- **Do NOT run `npm run build`** — the user's dev server is running and a
  concurrent build corrupts its `.next` chunks. `tsc` only.
- Do not start a dev server or open a port. The user owns 3000.
- Grep-confirm that `#a9f0c9`, `#c7d9ff` and `#efefef` no longer appear as
  values in `lp.css` (they may remain inside the explanatory comment above
  `.lp-wcard-1`, which is intended), and that `rgba(5, 5, 5, 0.66)` and
  `rgba(5, 5, 5, 0.18)` are gone from the `.lp-wcard` block.

## Out of scope — do not touch

- The fan geometry, the 3675px wheel, `--wheel-step`, the scroll budget.
- The section background (`.lp-what-sec` stays `--lp-black`) and the heading.
- The mobile strip's layout rules — it uses the same `.lp-wcard-n` classes and
  picks the new colours up for free.
- Card order in `LpSteps.tsx` / the copy in `src/data/lp-variants.ts`.
