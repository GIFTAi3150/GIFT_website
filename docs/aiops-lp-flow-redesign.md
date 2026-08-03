# LP flow section — redesign spec (2026-08-03)

Replaces the "two lanes + decorative SVG connector" comparison on `/lp` with a
**shared-axis comparison**.

## Why the old one failed

- The connector was a squiggle floating *below/beside* the nodes with an
  arrowhead. It carried no information the reader could decode — the manager's
  reaction was literally "it's just an arrow with lines, what is that".
- The two lanes were laid out independently, so stage *N* of `now` did not line
  up with stage *N* of `with gift`. The comparison the section exists to make
  never happened visually.
- The loop-vs-line metaphor only held for variant A (`また繰り返す`). Variant B's
  bad lane **halts** (`返信が止まる`) — a loop shape argues the wrong thing there.

## The new idea

One grid. Both lanes share the same column tracks, so same-index cells are
vertically aligned. Variant B pays this off immediately: both lanes start at
`問い合わせ` and end at `返信が止まる` vs `社員が返す`.

The connective tissue is a **2px rail welded to the bottom edge of each cell**.
Adjacent cells' rails touch, so they read as one continuous line — no separate
SVG, nothing to measure, nothing floating.

- **Bad lane**: rail fades out under stage 03 (mask gradient) and is **absent**
  under stage 04. The chain breaks before the payoff.
- **Good lane**: rail runs unbroken through 04 and terminates in a solid green
  square — a full stop.

That shape is true for both variants: *the bad sequence fails to complete, the
good one completes.* Whether it failed by looping or by halting is carried by the
copy, which is the manager's and stays verbatim.

**The outcome column is the hero.** Column 4 is wider (1.3fr vs 1fr) and set at
display scale, with a vertical hairline before it. The eye lands on
`辞める` / `辞めない` first and reads 01–03 as supporting detail.

## Scope

| File | Action |
|---|---|
| `src/app/(lp)/lp/_components/LpFlow.tsx` | rewrite markup |
| `src/app/(lp)/lp/_components/LpFlowConnector.tsx` | **delete** |
| `src/app/(lp)/lp.css` | replace the motion-story / flow-connector block + its `@media` rules |
| `src/app/(lp)/lp/_components/LpMotion.tsx` | replace the `flow lanes` block only |
| `src/data/lp-variants.ts` | **no change** — types and copy are untouched |

`LpLane` keeps its "exactly 4 nodes, last one is the terminal state" contract.

---

## 1. Markup — `LpFlow.tsx`

```tsx
import type { LpVariant } from '@/data/lp-variants';

// Shared-axis comparison. Both lanes render onto ONE grid (.lp-compare) via
// `display: contents` on the lane wrappers, so stage N of `now` lands in the
// same column as stage N of `with gift` — that alignment IS the argument, and
// it is why the lanes are not two independent blocks any more.
//
// There is no connector SVG. The line between stages is a 2px rail pinned to
// each cell's bottom edge; adjacent rails touch, so they read as one path.
// The bad lane's rail fades under stage 03 and is absent under 04 (the chain
// breaks before the payoff); the good lane's runs through and ends in a solid
// square. Same shape argues both variants — A's lane fails by repeating, B's by
// halting, but in both the sequence fails to COMPLETE.
//
// The lane wrappers exist only so LpMotion can query one lane at a time and so
// CSS can scope colour; they render no box of their own.
function Lane({ lane, variant }: { lane: LpVariant['flow']['bad']; variant: 'bad' | 'good' }) {
  const steps = lane.nodes.slice(0, -1);
  const outcome = lane.nodes[lane.nodes.length - 1];

  return (
    <div className={`lp-lane lp-lane-${variant}`}>
      <div className="lp-lane-id">
        <span className="lp-lane-eyebrow">{lane.eyebrow}</span>
        <strong className="lp-lane-name">{lane.label}</strong>
      </div>

      {steps.map((node, i) => (
        <div className="lp-cell" key={i}>
          <span className="lp-cell-idx" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="lp-cell-text">{node}</span>
          <i className="lp-cell-rail" aria-hidden="true" />
        </div>
      ))}

      <div className="lp-cell lp-cell-out">
        <span className="lp-cell-idx" aria-hidden="true">
          {String(lane.nodes.length).padStart(2, '0')}
        </span>
        <strong className="lp-out-text">{outcome}</strong>
        {/* Good lane only: the rail continues through the outcome and stops
            dead in a solid square. The bad lane deliberately renders NO rail
            here — the gap is the point. */}
        {variant === 'good' && (
          <>
            <i className="lp-cell-rail" aria-hidden="true" />
            <i className="lp-out-cap" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}

export default function LpFlow({ flow }: { flow: LpVariant['flow'] }) {
  return (
    <section className="lp-section" aria-label="導入前後の比較">
      <div className="lp-inner">
        <p className="lp-eyebrow">before / after</p>
        <h2>
          {flow.heading.map((line, i) => (
            <span className="lp-line" key={i}>
              {line}
            </span>
          ))}
        </h2>

        <div className="lp-compare">
          <Lane lane={flow.bad} variant="bad" />
          {/* The single heaviest line in the section: the axis the two lanes
              are measured against. Hidden on mobile, where the comparison
              turns vertical and the coloured spines divide the columns. */}
          <div className="lp-compare-axis" aria-hidden="true" />
          <Lane lane={flow.good} variant="good" />
        </div>

        <p className="lp-flow-punch">{flow.punch}</p>
      </div>
    </section>
  );
}
```

Notes:

- The eyebrow changes from `after the video` (which read as a dev note) to
  `before / after`. English label, not manager copy — safe to change.
- `slice(0, -1)` + last element relies on the documented "exactly 4 nodes"
  contract in `lp-variants.ts`. Do not add a runtime guard; the type comment is
  the contract.
- Indices and rails are `aria-hidden`; reading order stays
  bad-label → bad 01–04 → good-label → good 01–04.

---

## 2. CSS — `lp.css`

Delete the whole block from `/* ---- motion-story */` (`.lp-motion-story`)
through `.lp-flow-punch`, including the entire `flow connector` section and its
long comment. Delete the flow rules inside `@media (max-width: 920px)` and the
flow rules inside `@media (max-width: 560px)`. **Keep** `.lp-flow-punch` — it is
reused verbatim and `LpMotion` still targets it.

Insert in its place:

```css
/* ------------------------------------------------------ compare (flow)

   ONE grid carrying both lanes. The lane wrappers are `display: contents`, so
   their children place directly onto this grid — that is what makes stage N of
   `now` sit in the same column as stage N of `with gift`. On variant B the two
   lanes even share their first cell (問い合わせ), so the alignment does the
   whole job of the section: same input, opposite outcome.

   There is NO connector SVG any more (see docs/aiops-lp-flow-redesign.md). The
   path between stages is `.lp-cell-rail`, a 2px bar pinned to each cell's
   bottom edge; adjacent cells' rails touch, so they read as one continuous
   line without anything ever measuring layout.

   Column 4 is the outcome and is deliberately the loudest thing here: wider
   track, display type, hairline divider in front of it.
   -------------------------------------------------------------------------- */
.lp-compare {
  /* How far the rails float above the axis / the block's bottom border. Flush
     at 0 they read as a coloured edge ON those lines instead of as their own
     path — which was the whole problem with the connector this replaced.
     (Caught in review 2026-08-03; the first draft of this spec had bottom: 0.) */
  --lp-rail-inset: clamp(12px, 1.4vw, 18px);
  margin-top: clamp(34px, 5vw, 62px);
  display: grid;
  grid-template-columns: minmax(190px, 250px) repeat(3, minmax(0, 1fr)) minmax(0, 1.3fr);
  border-top: 1px solid rgba(17, 17, 17, 0.2);
  border-bottom: 1px solid rgba(17, 17, 17, 0.2);
}
/* Renders no box — it exists so LpMotion can animate one lane at a time and so
   the rules below can scope colour per lane. */
.lp-lane {
  display: contents;
}
/* The axis. The single heaviest rule in the section: the line the two lanes are
   compared across. Spans every column so it reads as one measurement, not as a
   table border. */
.lp-compare-axis {
  grid-column: 1 / -1;
  height: 2px;
  background: var(--lp-ink);
}

.lp-lane-id {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: clamp(22px, 2.6vw, 30px) clamp(18px, 2.4vw, 34px) clamp(24px, 3vw, 34px) 0;
}
.lp-lane-eyebrow {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.lp-lane-bad .lp-lane-eyebrow {
  color: var(--lp-red);
}
.lp-lane-good .lp-lane-eyebrow {
  color: var(--lp-line);
}
.lp-lane-name {
  display: block;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.25;
  letter-spacing: 0;
  font-weight: 900;
  color: var(--lp-ink);
  word-break: normal;
  text-wrap: balance;
}

.lp-cell {
  position: relative;
  min-height: 118px;
  padding: clamp(22px, 2.6vw, 30px) clamp(14px, 1.6vw, 22px) clamp(24px, 3vw, 34px) 0;
}
.lp-cell-idx {
  display: block;
  margin-bottom: 10px;
  color: rgba(17, 17, 17, 0.34);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
}
.lp-cell-text {
  display: block;
  color: var(--lp-ink);
  font-size: clamp(15px, 1.5vw, 18px);
  line-height: 1.45;
  font-weight: 900;
  word-break: normal;
  overflow-wrap: anywhere;
}
/* The payoff. Everything left of the divider is process; this is the result. */
.lp-cell-out {
  border-left: 1px solid rgba(17, 17, 17, 0.2);
  padding-left: clamp(18px, 2vw, 28px);
}
.lp-out-text {
  display: block;
  font-size: clamp(24px, 3.1vw, 40px);
  line-height: 1.25;
  letter-spacing: -0.01em;
  font-weight: 900;
  word-break: normal;
  text-wrap: balance;
}
.lp-lane-bad .lp-out-text {
  color: var(--lp-red);
}
.lp-lane-good .lp-out-text {
  color: var(--lp-line);
}

/* The path. Not decoration — it is the only thing that says whether the
   sequence completed. Bad lane: fades under 03, ABSENT under 04. Good lane:
   unbroken, ending in .lp-out-cap. */
.lp-cell-rail {
  position: absolute;
  left: 0;
  right: 0;
  /* NOT 0 — flush against the axis it stops reading as a path. */
  bottom: var(--lp-rail-inset);
  height: 2px;
  border-radius: 0;
}
.lp-lane-bad .lp-cell-rail {
  background: var(--lp-red);
}
.lp-lane-good .lp-cell-rail {
  background: var(--lp-line);
}
/* Stage 03 on the bad lane — the chain running out. `.lp-cell:nth-child(4)` is
   the third step, because child 1 of the lane is .lp-lane-id. */
.lp-lane-bad .lp-cell:nth-child(4) .lp-cell-rail {
  -webkit-mask-image: linear-gradient(90deg, #000 52%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 52%, transparent 100%);
}
/* The full stop. */
.lp-out-cap {
  position: absolute;
  right: 0;
  /* 10px square centred on the 2px rail. */
  bottom: calc(var(--lp-rail-inset) - 4px);
  width: 10px;
  height: 10px;
  background: var(--lp-line);
}
```

Then, **inside the existing `@media (max-width: 920px)` block**, replacing the
old flow rules:

```css
  /* The comparison rotates rather than degrading into two scrolled lists: two
     columns side by side, four aligned stage rows, and the rails become the
     lanes' coloured spines — which double as the divider, so no extra rule is
     needed between the columns. The bad lane's outcome still has no spine, so
     it visibly floats away from its own chain. */
  .lp-compare {
    grid-template-columns: 1fr 1fr;
    column-gap: clamp(14px, 4vw, 22px);
  }
  .lp-compare-axis {
    display: none;
  }
  .lp-lane-bad > * {
    grid-column: 1;
  }
  .lp-lane-good > * {
    grid-column: 2;
  }
  .lp-lane > *:nth-child(1) {
    grid-row: 1;
  }
  .lp-lane > *:nth-child(2) {
    grid-row: 2;
  }
  .lp-lane > *:nth-child(3) {
    grid-row: 3;
  }
  .lp-lane > *:nth-child(4) {
    grid-row: 4;
  }
  .lp-lane > *:nth-child(5) {
    grid-row: 5;
  }
  .lp-lane-id {
    padding: 20px 0 18px 14px;
  }
  .lp-cell {
    min-height: 0;
    padding: 16px 0 18px 14px;
    border-top: 1px solid rgba(17, 17, 17, 0.12);
  }
  .lp-cell-idx {
    display: none;
  }
  .lp-cell-out {
    border-left: 0;
    padding-left: 14px;
    padding-top: 20px;
  }
  /* Spine: the rail stands up and runs down the cell's left edge. */
  .lp-cell-rail {
    top: 0;
    bottom: 0;
    left: 0;
    right: auto;
    width: 2px;
    height: auto;
  }
  .lp-lane-bad .lp-cell:nth-child(4) .lp-cell-rail {
    -webkit-mask-image: linear-gradient(180deg, #000 52%, transparent 100%);
    mask-image: linear-gradient(180deg, #000 52%, transparent 100%);
  }
  .lp-out-cap {
    left: -4px;
    right: auto;
    bottom: 0;
  }
```

And inside the existing `@media (max-width: 560px)` block, replacing the old
`.lp-flow-label strong` rule (keep `.lp-flow-punch` as it is):

```css
  .lp-lane-name {
    font-size: clamp(20px, 5.8vw, 27px);
  }
  .lp-cell-text {
    font-size: clamp(13px, 3.9vw, 15px);
  }
  .lp-out-text {
    font-size: clamp(20px, 6.4vw, 30px);
  }
```

---

## 3. Motion — `LpMotion.tsx`

Replace **only** the `/* ---- flow lanes */` block. Everything else in the file
stays. Both standing GSAP rules still apply: no `once: true` on a timeline, no
`clearProps: 'all'`.

```ts
      /* ------------------------------------------------------ flow lanes */
      // This diagram IS the argument. Static, the reader takes it in at once and
      // moves on; played left to right it becomes a sequence with a consequence.
      //
      // The rails carry the meaning now that the connector SVG is gone: each
      // one scales out from its left edge in step with the cell above it, so
      // the path advances stage by stage. The bad lane simply runs out of
      // rails before the outcome — nothing special is animated to "break" it,
      // the gap is structural.
      gsap.utils.toArray<HTMLElement>('.lp-lane').forEach((lane) => {
        const id = lane.querySelector('.lp-lane-id');
        const cells = lane.querySelectorAll('.lp-cell');
        const rails = lane.querySelectorAll('.lp-cell-rail');
        const cap = lane.querySelector('.lp-out-cap');
        if (!cells.length) return;

        gsap.set(id, { opacity: 0, x: -20 });
        // y only, no x: the cells sit in fixed grid columns and must not appear
        // to slide between them.
        gsap.set(cells, { opacity: 0, y: 18 });
        gsap.set(rails, { scaleX: 0, transformOrigin: 'left center' });
        if (cap) gsap.set(cap, { scale: 0, transformOrigin: 'center center' });

        const tl = gsap
          .timeline({ scrollTrigger: enter(lane, 'top 78%') })
          .to(id, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
          .to(
            cells,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              // Slow enough to read as one-then-the-next rather than one block.
              stagger: 0.13,
              ease: 'power2.out',
            },
            '-=0.2',
          )
          .to(
            rails,
            { scaleX: 1, duration: 0.42, stagger: 0.13, ease: 'power1.out' },
            '<0.08',
          );

        if (cap) {
          // The only overshoot in the section, on the one mark that says the
          // sequence finished.
          tl.to(cap, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.1');
        }
      });
```

⚠️ Below 920px the rails are vertical spines, so `scaleX` would animate the
wrong axis. Match the CSS breakpoint with `gsap.matchMedia()` **or** — simpler
and preferred here — animate `scaleX` above 920px and `scaleY` below, chosen
once at setup:

```ts
        const vertical = window.matchMedia('(max-width: 920px)').matches;
        gsap.set(rails, {
          [vertical ? 'scaleY' : 'scaleX']: 0,
          transformOrigin: vertical ? 'center top' : 'left center',
        });
        // ...and tween the same key back to 1.
```

Read once per mount is acceptable: a viewport crossing 920px mid-session leaves
a rail at its final value either way, because the tween ends at 1 on both axes'
default scale of 1.

---

## 4. Verification

- `npx tsc --noEmit` clean.
- `npm run build` clean; no import of `LpFlowConnector` survives
  (`grep -r LpFlowConnector src/` returns nothing).
- `npm run dev`, open `/lp`, check at **1440px**, **1024px**, **900px**,
  **390px**:
  - stage cells of the two lanes line up column-for-column (≥921px) /
    row-for-row (≤920px);
  - the red rail visibly stops before the outcome; the green one reaches it and
    ends in a square;
  - no horizontal overflow at 390px;
  - both concepts (A and B) animate independently as you scroll into each.
- With OS "reduce motion" on, the section renders complete and static — rails
  full length, nothing hidden.
