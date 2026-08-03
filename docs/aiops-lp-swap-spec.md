# LP flow section v3 — 「入れ替え」 The Swap (2026-08-03)

Third design for the `/lp` now-vs-with-gift section. Supersedes
`docs/aiops-lp-flow-redesign.md` (v2, the shared-axis grid), which supersedes the
original SVG-connector version.

## Brief

- The **content is approved** — the manager likes the now / with gift comparison
  and all Japanese copy in `src/data/lp-variants.ts` is his, verbatim. Do not
  touch any of it.
- Both previous versions were rejected for **presentation**, not idea. v1: "just
  an arrow with lines, what is that". v2: "the idea is fine but it's just a
  simple static section".
- v2 already had reveal-on-enter motion and still read as static, so the ask is
  **scroll-DRIVEN** — scroll position scrubs the transformation.
- Stated quality bar: *"has to look like a high quality page, not something cheap
  … and something minimalistic."* Not contradictory — the target is expensive
  minimalism. Cheap minimalism is mid-sized type with even padding. Expensive
  minimalism is violent scale contrast, one accent used once, hard-edged motion
  with weight.

## The idea

The words **replace themselves in place**. One stack of four lines; scrolling
swaps each line from its `now` state to its `with gift` state, top to bottom.

```
01  求人を出す        →  業務を決める
02  面接する          →  AIが覚える
03  教える            →  同じ品質で返す
04  辞める            →  辞めない          ← 1.45× larger, the payoff
```

Each line lives in an `overflow: hidden` slot. The outgoing word translates up
and out; the incoming word translates up from below. Hard-edged mask, no fade —
fades are cheap, masked slides read as mechanical and precise.

**Asymmetric easing is the point.** Outgoing uses `power2.in` (accelerates away),
incoming uses `power3.out` (decelerates in), offset by 0.06. Symmetric easing
makes it a slot machine; asymmetric makes it feel weighted and choreographed.

Scrubbed, so the visitor controls it and it reverses on scroll-up.

## Technical approach — sticky, NOT ScrollTrigger `pin`

Confirmed: the `(lp)` route group does **not** use Lenis (grep for
`Lenis|ScrollSmoother|scrollerProxy` hits only `services/aiops`, `company`,
`achievements`, `globals.css`). Native scroll, so:

- A tall track (`.lp-swap`, `340svh`) containing a `position: sticky; top: 0`
  pane at `100dvh`.
- One scrubbed ScrollTrigger on the track, `start: 'top top'`,
  `end: 'bottom bottom'` — which is exactly the interval the sticky pane is
  stuck for.

Native sticky injects no pin-spacer, cannot desync on refresh, and cannot leave
the page scroll-locked. This project has already been burned by pin-adjacent
scroll locking (see the AIOps cover scroll-lock memory), so do not "improve"
this into `pin: true`.

Units follow the project rule: **`dvh` for the viewport-filling pane, `svh` for
the scroll budget.** A track in `vh`/`dvh` would silently lengthen when mobile
chrome collapses.

## Palette change — the red is gone

v1/v2 used `--lp-red` for the bad lane. Dropped here on purpose: red reads as an
error state and is the cheapest-looking colour in this palette. Now-words are
solid `--lp-ink`, gift-words are `--lp-line` green. Black → green is the entire
contrast, used once, at the payoff. `--lp-red` stays defined in `:root` (nothing
else uses it, but it is part of the ported mock palette).

## Fallback — this must work with no JS and with reduced motion

**Default CSS renders a complete, static, legible section**: track height `auto`,
pane not sticky, slots `overflow: visible`, both words shown stacked (now-word
ink, gift-word green beneath it). All the sticky/scroll behaviour is scoped under
`.lp-swap-live`, a class `LpMotion` adds on mount **after** its
`prefers-reduced-motion` bail. So:

- no JS → static stacked pairs, all information present
- reduced motion → same
- normal → JS adds `.lp-swap-live`, section becomes the scroll piece

The class flip changes the section height (auto → 340svh). That is safe here:
the section sits below a full-screen hero video and is never in view at mount,
and `LpMotion` already calls `ScrollTrigger.refresh()` on rAF and on `load`.

---

## 1. `src/app/(lp)/lp/_components/LpFlow.tsx` — full rewrite

Filename and export stay `LpFlow` — the data is still `variant.flow` and this is
still the flow argument. Only the presentation changed.

```tsx
import type { LpVariant } from '@/data/lp-variants';

// 「入れ替え」 — the words replace themselves in place as you scroll.
//
// Spec + why the two previous versions were rejected:
// docs/aiops-lp-swap-spec.md. Short version: an SVG connector read as
// meaningless decoration, and a static comparison grid read as "just a simple
// static section". The argument is the same one it always was — this is what
// happens now, this is what happens with us — but here the scroll POSITION
// drives it, so the visitor performs the transformation instead of reading a
// picture of it.
//
// Structure is a tall track (.lp-swap) with a sticky pane inside it, NOT a
// ScrollTrigger pin. See the spec for why: no pin-spacer, no refresh desync, no
// way to leave the page scroll-locked.
//
// ⚠️ Renders complete and static without JS. Everything scroll-related is
// scoped under `.lp-swap-live`, which LpMotion adds on mount — after its
// reduced-motion bail. Do not move any of that into the base classes.
function SwapRow({ now, gift, index }: { now: string; gift: string; index: number }) {
  return (
    <div className="lp-swap-row">
      <span className="lp-swap-idx" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      {/* The mask. `.lp-swap-now` is in flow and defines the slot height;
          `.lp-swap-gift` is absolutely stacked on top of it and waits below the
          mask edge until its turn. */}
      <span className="lp-swap-slot">
        <span className="lp-swap-word lp-swap-now">{now}</span>
        <span className="lp-swap-word lp-swap-gift">{gift}</span>
      </span>
    </div>
  );
}

export default function LpFlow({ flow }: { flow: LpVariant['flow'] }) {
  // Both lanes are guaranteed 4 nodes by the LpLane contract in lp-variants.ts,
  // and index i of one lane is the counterpart of index i of the other — that
  // pairing is what the swap animates. On variant B the pair at index 0 is
  // 問い合わせ → 問い合わせ, i.e. identical: same input, opposite outcome. That
  // is not a bug, it is the argument, and the row simply swaps a word for
  // itself.
  const pairs = flow.bad.nodes.map((now, i) => ({ now, gift: flow.good.nodes[i] }));

  return (
    <section className="lp-section lp-flow" aria-label="導入前後の比較">
      <div className="lp-swap">
        <div className="lp-swap-pane">
          <div className="lp-inner lp-swap-inner">
            <div className="lp-swap-head">
              <p className="lp-eyebrow">before / after</p>
              {/* The state readout. Same swap mechanic as the stack, at label
                  scale — it flips on the last row, because that is the row
                  where the outcome actually changes. */}
              <span className="lp-swap-state" aria-hidden="true">
                <span className="lp-swap-slot">
                  <span className="lp-swap-word lp-swap-now">{flow.bad.eyebrow}</span>
                  <span className="lp-swap-word lp-swap-gift">{flow.good.eyebrow}</span>
                </span>
              </span>
            </div>

            <h2>
              {flow.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  {line}
                </span>
              ))}
            </h2>

            <div className="lp-swap-stack">
              {pairs.map((pair, i) => (
                <SwapRow key={i} index={i} now={pair.now} gift={pair.gift} />
              ))}
            </div>

            <span className="lp-swap-rail" aria-hidden="true">
              <i />
            </span>
          </div>
        </div>
      </div>

      <div className="lp-inner">
        <p className="lp-flow-punch">{flow.punch}</p>
      </div>
    </section>
  );
}
```

⚠️ `.lp-section` already carries horizontal padding; the punch block keeps using
`.lp-inner` so it stays on the same measure as the pane's contents.

⚠️ The lane **labels** (`flow.bad.label` / `flow.good.label` — 「また繰り返す」/
「会社に残る」) are intentionally NOT rendered any more; the eyebrows (`now` /
`with gift`) carry the state instead. Leave the fields in the data — they are the
manager's copy and a future version may want them back.

---

## 2. `src/app/(lp)/lp.css`

Delete the entire `compare (flow)` block — from the
`/* ---- compare (flow) */` banner comment down to and including `.lp-out-cap` —
**keeping `.lp-flow-punch`**, which is reused and still targeted by GSAP. Then
delete the flow rules inside `@media (max-width: 920px)` (everything from
`.lp-compare` through `.lp-out-cap`, plus that block's leading comment) and the
`.lp-lane-name` / `.lp-cell-text` / `.lp-out-text` rules inside
`@media (max-width: 560px)`.

Insert in place of the `compare (flow)` block:

```css
/* ---------------------------------------------------------- swap (flow)

   「入れ替え」 — the words replace themselves in place as the page scrolls.
   Full rationale, including why the two previous designs were rejected:
   docs/aiops-lp-swap-spec.md.

   ⚠️ EVERYTHING HERE RENDERS STATIC AND COMPLETE WITHOUT JS. The rules in this
   first block are the fallback: both words visible, stacked, no sticky, no
   track height. LpMotion adds `.lp-swap-live` on mount (after its reduced-motion
   bail) and the `.lp-swap-live` rules further down turn it into the scroll
   piece. Do not fold any of those into the base rules — a visitor with JS off,
   or with "reduce motion" on, would get a section with half its words hidden
   behind a mask that never opens.

   ⚠️ This is native `position: sticky`, NOT ScrollTrigger's `pin`. The (lp)
   route group has no Lenis, so sticky is exact and cheap: no pin-spacer, no
   refresh desync, and no way to strand the page scroll-locked — a failure this
   project has already shipped once elsewhere.
   -------------------------------------------------------------------------- */
.lp-swap {
  position: relative;
}
.lp-swap-inner {
  display: flex;
  flex-direction: column;
}
.lp-swap-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
}
/* .lp-eyebrow already carries its own bottom margin; the head row owns the
   spacing instead so the eyebrow and the state readout sit on one baseline. */
.lp-swap-head .lp-eyebrow {
  margin: 0;
}
/* A standing caption, not a competing headline. At the inherited 60px it sat
   too close to the ~92px stack for the scale contrast the section is built on,
   and it ate enough of the 100dvh budget to risk clipping at 1280x600.
   Out-specifies the base `:where(.lp-section, .lp-cta) h2` (0,1,1 vs 0,0,1), so
   it also holds inside the 560px override. */
.lp-swap-inner h2 {
  font-size: clamp(20px, min(2.9vw, 4.4vh), 40px);
  line-height: 1.4;
}
.lp-swap-state {
  flex: 0 0 auto;
  color: var(--lp-ink);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lp-swap-stack {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.1vh, 16px);
}
.lp-swap-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(12px, 1.6vw, 26px);
  min-width: 0;
}
/* The quiet half of the scale contrast. Deliberately tiny against ~92px type —
   that gap IS the design. */
.lp-swap-idx {
  flex: 0 0 auto;
  width: 2.4em;
  color: rgba(17, 17, 17, 0.32);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
  /* Optical drop so the index reads as a margin note rather than sitting hard
     against the cap line. Not baseline alignment — see .lp-swap-row. */
  margin-top: 0.9em;
}
.lp-swap-slot {
  position: relative;
  display: block;
  min-width: 0;
}
.lp-swap-word {
  display: block;
  /* Japanese must not break mid-phrase — a wrapped word would make the slot two
     lines tall and throw off both the mask and the 100dvh budget. Sizes below
     are chosen so the longest string in the data, 「AIが過去対応を見る」, fits on
     one line at every width. */
  word-break: keep-all;
  overflow-wrap: normal;
  font-size: clamp(30px, min(7vw, 10.5vh), 92px);
  line-height: 1.18;
  letter-spacing: -0.01em;
  font-weight: 900;
}
.lp-swap-now {
  color: var(--lp-ink);
}
/* The single accent, spent once, at the payoff. */
.lp-swap-gift {
  color: var(--lp-line);
}
/* The outcome row is the payoff and is set larger than the process rows, so the
   stack has a silhouette instead of four identical lines. Both words in the row
   scale together — they share a slot. */
.lp-swap-row:last-child .lp-swap-word {
  font-size: clamp(38px, min(9.6vw, 14vh), 133px);
}
.lp-swap-state .lp-swap-word {
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}
.lp-swap-rail {
  display: block;
  height: 1px;
  background: rgba(17, 17, 17, 0.16);
  overflow: hidden;
}
.lp-swap-rail > i {
  display: block;
  height: 100%;
  background: var(--lp-ink);
  transform: scaleX(0);
  transform-origin: left center;
}

/* -- fallback layout (no JS / reduced motion): both words, stacked, static -- */
.lp-swap-gift {
  margin-top: 0.06em;
}
.lp-swap-rail {
  display: none;
}

/* -------------------------------------------------- .lp-swap-live (JS on) -- */
.lp-swap-live .lp-swap {
  /* svh, not vh/dvh: this is a SCROLL BUDGET. In vh it silently lengthens when
     mobile browser chrome collapses, and the last swap would then finish after
     the pane has already unstuck. */
  height: 340svh;
}
.lp-swap-live .lp-swap-pane {
  position: sticky;
  top: 0;
  /* dvh, not svh: this one FILLS the viewport and must keep filling it while
     the chrome collapses. */
  height: 100dvh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.lp-swap-live .lp-swap-inner {
  width: min(1120px, 100%);
  gap: clamp(14px, 3vh, 40px);
}
.lp-swap-live .lp-swap-stack {
  margin-top: clamp(8px, 2vh, 28px);
}
.lp-swap-live .lp-swap-slot {
  /* THE MASK, exactly one line box tall — so a word offset by 100% of its own
     height is hidden precisely, with no sliver showing. The earlier padding
     slack for glyph overshoot is gone on purpose: it made the slot taller than
     one line, which let the top edge of the waiting word peek through. The
     1.18 line-height already leaves ~0.09em of slack above and below the em
     box, which is enough for Japanese.
     Grid rather than absolute positioning: both words occupy the same cell, so
     the slot sizes to the WIDER of the two. The gift word is longer than the
     now word in nearly every row (教える → 同じ品質で返す), and with
     `word-break: keep-all` it cannot wrap — constrained to the now word's
     width it was overflowing straight into this mask. */
  display: grid;
  overflow: hidden;
}
.lp-swap-live .lp-swap-word {
  grid-area: 1 / 1;
}
.lp-swap-live .lp-swap-gift {
  /* Cancels the fallback stacking offset. */
  margin-top: 0;
  /* Waits exactly one line box below the mask edge. GSAP re-sets this on mount;
     the value here means a visitor who lands mid-section before the effect runs
     never sees both words overlapping. */
  transform: translateY(100%);
}
.lp-swap-live .lp-swap-rail {
  display: block;
  margin-top: auto;
}
```

Then append, at the end of the existing `@media (max-width: 920px)` block (which
after the deletions above will hold only the hero/other rules):

```css
  /* Phone: the stack is the whole section, so the head and the payoff row give
     up some scale to keep four lines inside 100dvh. Sizes still clear the
     longest string, 「AIが過去対応を見る」, on one line at 320px. */
  .lp-swap-word {
    font-size: clamp(24px, min(8vw, 7.2vh), 44px);
  }
  .lp-swap-row:last-child .lp-swap-word {
    font-size: clamp(30px, min(10.4vw, 9.6vh), 60px);
  }
  .lp-swap-idx {
    width: 2em;
  }
  .lp-swap-live .lp-swap {
    height: 300svh;
  }
```

---

## 3. `src/app/(lp)/lp/_components/LpMotion.tsx`

Replace **only** the block under the `/* ---- flow lanes */` comment. Everything
else in the file — hero, headings, eyebrows, steps, body/CTA — stays exactly as
it is, including the existing `enter()` helper and the reduced-motion bail at the
top of the effect (which is what makes the static fallback work).

```ts
      /* ------------------------------------------------------- flow swap */
      // 「入れ替え」. The section's whole argument is a transformation, so the
      // scroll POSITION drives it rather than a play-once reveal — the visitor
      // performs the swap instead of watching a picture of one. Scrubbed, so it
      // runs backwards on scroll-up for free.
      //
      // Adding `.lp-swap-live` here rather than in the markup is what makes the
      // no-JS / reduced-motion fallback real: this code is below the
      // prefers-reduced-motion bail at the top of the effect, so those visitors
      // keep the static stacked version with every word visible.
      //
      // Native sticky does the pinning (see lp.css) — deliberately NOT
      // ScrollTrigger `pin`, which injects a spacer, can desync on refresh, and
      // has stranded this codebase scroll-locked before.
      gsap.utils.toArray<HTMLElement>('.lp-section.lp-flow').forEach((section) => {
        const track = section.querySelector<HTMLElement>('.lp-swap');
        const rows = section.querySelectorAll<HTMLElement>('.lp-swap-row');
        const state = section.querySelector<HTMLElement>('.lp-swap-state');
        const rail = section.querySelector<HTMLElement>('.lp-swap-rail > i');
        if (!track || !rows.length) return;

        section.classList.add('lp-swap-live');

        const SWAP = 1;      // duration of one word exchange, in timeline units
        const STEP = 1.15;   // start-to-start gap; the 0.15 overlap keeps the
                             // stack feeling continuous rather than stepped
        const TAIL = 0.6;    // hold on the finished state before it releases
        const total = (rows.length - 1) * STEP + SWAP + TAIL;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track,
            // Exactly the interval the sticky pane is stuck for.
            start: 'top top',
            end: 'bottom bottom',
            // Small smoothing, not snap — gives the type weight without ever
            // decoupling it from the finger.
            scrub: 0.6,
          },
        });

        rows.forEach((row, i) => {
          const now = row.querySelector('.lp-swap-now');
          const gift = row.querySelector('.lp-swap-gift');
          const at = i * STEP;

          // yPercent is an ABSOLUTE target, not a delta: the outgoing word runs
          // 0 -> -100 (up and out through the mask), the incoming one runs
          // 100 -> 0 (up from below into the slot). Set the start explicitly
          // rather than letting GSAP infer it from the CSS translateY(100%).
          gsap.set(gift, { yPercent: 100 });

          // Asymmetric on purpose. Matched easings read as a slot machine;
          // out-fast / in-slow reads as weight. The 0.06 offset means the
          // incoming word is already moving before the outgoing one has
          // cleared, so the exchange overlaps instead of ping-ponging.
          tl.to(now, { yPercent: -100, duration: SWAP, ease: 'power2.in' }, at).to(
            gift,
            { yPercent: 0, duration: SWAP, ease: 'power3.out' },
            at + 0.06,
          );
        });

        // The readout flips on the LAST row — that is the row where the outcome
        // actually changes, so that is when the page is entitled to claim it.
        if (state) {
          const at = (rows.length - 1) * STEP;
          const now = state.querySelector('.lp-swap-now');
          const gift = state.querySelector('.lp-swap-gift');
          gsap.set(gift, { yPercent: 100 });
          tl.to(now, { yPercent: -100, duration: SWAP, ease: 'power2.in' }, at).to(
            gift,
            { yPercent: 0, duration: SWAP, ease: 'power3.out' },
            at + 0.06,
          );
        }

        if (rail) {
          tl.fromTo(rail, { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'none' }, 0);
        }
      });
```

⚠️ The two words have DIFFERENT targets. `yPercent` is absolute, not a delta:
the outgoing word runs `0 → -100`, the incoming word runs `100 → 0`. An earlier
draft of this spec set both to `-100`, which sent the incoming word straight
past its slot and out the top, leaving every row empty after the swap. Do not
re-unify them.

⚠️ Standing project rules still apply and are already satisfied above: no
`once: true` on a timeline, and no `clearProps: 'all'`.

---

## 4. Verification

- `npx tsc --noEmit` clean; `npm run build` succeeds.
- `node scripts/check-encoding.mjs` → no mojibake (this spec's code contains
  Japanese in comments).
- No surviving references to the deleted v2 classes anywhere in `src/`:
  `lp-compare`, `lp-lane`, `lp-cell`, `lp-out-`, `lp-motion-story`,
  `lp-flow-lane`, `lp-flow-body`, `lp-flow-track`, `lp-flow-node`,
  `lp-flow-label`, `lp-flow-connector`. `.lp-flow-punch` **is** expected to
  survive.
- Manual, on `/lp` at **1440×900**, **1280×720**, **900px**, **390px**:
  - scrolling scrubs the swaps; scrolling back up reverses them;
  - no word is ever clipped at the mask edge, top or bottom;
  - 「AIが過去対応を見る」 (variant B, row 02 — the longest string in the data)
    stays on one line at every width;
  - the whole pane, head through rail, fits inside one screen with no internal
    scrollbar;
  - both concepts A and B run independently as you scroll through the page.
- With OS "reduce motion" on, and again with JS disabled: the section is static,
  normal document height, and **every word of both lanes is visible**.
