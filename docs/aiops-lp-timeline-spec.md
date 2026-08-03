# LP flow section v4 — step-by-step timeline (2026-08-03)

Fourth and current design for the `/lp` now-vs-with-gift section. Supersedes
`docs/aiops-lp-swap-spec.md` (v3, the sticky in-place word swap) and
`docs/aiops-lp-flow-redesign.md` (v2, the shared-axis grid).

**Built against a reference the client supplied**, after three rejections. Do not
depart from it on taste.

## The reference

Osmo — "Step-by-step Timeline", `osmo.supply/resource/step-by-step-timeline`
(category: Scroll Animations). Note the URL the client first sent,
`/preview?resource=step-by-step-timeline`, is a client-rendered wrapper that
returns "No preview selected" to any fetch; the real resource is at
`/resource/...`.

What it is:

- **Vertical** timeline, normal document flow. No pin, no sticky.
- A faint vertical progress line down the left.
- Circular numbered markers sitting on that line.
- Step heading + supporting text to the right of each marker.
- **Scroll-scrubbed** (`scrub: true`): a coloured fill bar tracks scroll
  progress down the rail.
- Markers flip `inactive → active`; the active marker takes a background
  colour, inverted text colour, and a soft ring.
- **Opacity tiers are the signature**: inactive `0.25`, seen `0.5`, current
  `1.0`. That tiering is what makes it read as expensive — copy it.
- Activation point defaults to screen centre.

## What changes for us

The client asked for **four steps: two "now", two "with gift"** — not both full
four-stage lanes. That is a real improvement, not just a trim: it turns a
side-by-side comparison into a **narrative arc**, problem → turn → resolution,
which is what a timeline form actually wants.

So the rail carries a **colour turn at its midpoint**: ink through the two `now`
steps, LINE green through the two `with gift` steps. The moment the story turns
becomes a visible event on the page.

### Which strings

Steps 3 and 4 of each lane — `nodes.slice(2)` — because those carry the
consequence. Index 0/1 are setup.

| | now | with gift |
|---|---|---|
| A案 | 教える → 辞める | 同じ品質で返す → 辞めない |
| B案 | 社長が外出中 → 返信が止まる | 回答案を出す → 社員が返す |

⚠️ This drops four of the manager's strings from the rendered page. They stay in
`src/data/lp-variants.ts` **untouched** — the selection happens in the component,
so restoring any of them is a one-line change. Do not edit the data file.

⚠️ Taking index 2/3 rather than 0/3 is deliberate: on variant B both lanes'
index 0 is 「問い合わせ」, so a 0/3 selection would render the same phrase as two
different steps of one timeline and read as a bug.

The lane labels 「また繰り返す」/「会社に残る」 and eyebrows `now`/`with gift`, unused
in v3, come back as the two phase headers. Every remaining piece of the
manager's `flow` copy is on the page.

## Structure

```
before / after
採用しても、また止まる。
AIなら、仕事が会社に残る。

     ┌ now ─ また繰り返す ────────────────
  ①  │  教える
     │
  ②  │  辞める
     │
     ├ with gift ─ 会社に残る ────────────   ← rail turns green here
  ③  │  同じ品質で返す
     │
  ④  │  辞めない

人を増やす前に、繰り返しの仕事をAIに残す。
```

## Two fills, not one gradient

The rail's colour turn is **two separate absolutely-positioned bars**, each
`height: 50%`, each `scaleY: 0 → 1` from `transform-origin: top`, sequenced on
one scrubbed timeline.

The obvious alternative — one bar with a `linear-gradient` and an animated
height — is wrong: a background gradient is sized to its own box, so as the bar
grows the gradient stretches with it and green appears at the bottom edge from
the very first pixel. Two bars have no such coupling and need no `@property`
registration or custom-property tweening.

⚠️ This depends on the midpoint of the list being at exactly 50% of its height.
It is, because the structure is symmetric: steps 1 and 3 both carry a phase
header, steps 2 and 4 both do not, all four have identical padding and all four
strings are one line. **Keep `padding-bottom` identical on all four steps** —
including the last one. Zeroing the last step's padding is the obvious "tidy-up"
and it silently shifts the colour boundary off the phase break.

⚠️ The rail must start at `top: 0`, not at half a marker down. An earlier draft
started it at the first marker's centre, which made the rail shorter than the
list while the phase boundary stayed at half the list — putting the true
boundary at ~48.6% and turning the rail green just below the 「with gift」 header
rather than at it. The overshoot above the first marker is hidden by the marker,
which is opaque and sits at z-index 1 on the same centre line.

## Fallback — must work with no JS and with reduced motion

Same pattern as before: the base CSS renders the **finished** state — all four
steps at full opacity, markers in their resolved styling, fills hidden. Every
dimmed/animated rule is scoped under `.lp-tl-live`, a class `LpMotion` adds on
mount, **below** its `prefers-reduced-motion` bail.

So: no JS → complete static timeline. Reduced motion → same. Otherwise → the
scrubbed piece.

## Note on the house style

Project standing rule rejects the templated-SaaS look — rounded cards, drop
shadows, badges. Circular numbered markers are the reference's defining element
and the client asked for this style, so they stay, but they stay **flat**: the
active "glow" is a hard `box-shadow: 0 0 0 6px` ring at low alpha, not a blur.
No cards, no surfaces, no elevation anywhere in this section.

---

## 1. `src/app/(lp)/lp/_components/LpFlow.tsx` — full rewrite

Filename and export stay `LpFlow`; `page.tsx` is untouched.

```tsx
import type { LpVariant } from '@/data/lp-variants';

// Step-by-step timeline, ported from the Osmo component the client supplied as
// a reference (osmo.supply/resource/step-by-step-timeline). Spec, including the
// three earlier designs this replaces and why each was rejected:
// docs/aiops-lp-timeline-spec.md.
//
// Four steps, not eight: two 「now」 then two 「with gift」, at the client's
// direction. That turns the side-by-side comparison into a narrative arc —
// problem, turn, resolution — which is the shape a timeline actually wants, and
// it lets the rail change colour at the midpoint so the turn is a visible event.
//
// ⚠️ Renders complete and static without JS. Every dimmed/animated rule is
// scoped under `.lp-tl-live`, which LpMotion adds on mount, after its
// reduced-motion bail. Do not move any of it into the base classes.
type Step = {
  text: string;
  phase: 'now' | 'gift';
  /** First step of its phase — the one that carries the phase header. */
  head?: { eyebrow: string; name: string };
};

export default function LpFlow({ flow }: { flow: LpVariant['flow'] }) {
  // Steps 3 and 4 of each lane: they carry the consequence, where 1 and 2 are
  // setup. NOT 1 and 4 — on variant B both lanes open on 「問い合わせ」, so that
  // selection would render one phrase as two different steps of a single
  // timeline and read as a bug.
  //
  // The other four strings stay in lp-variants.ts untouched; this is a display
  // choice, not a copy edit.
  const steps: Step[] = [
    ...flow.bad.nodes.slice(2).map((text, i) => ({
      text,
      phase: 'now' as const,
      ...(i === 0 ? { head: { eyebrow: flow.bad.eyebrow, name: flow.bad.label } } : {}),
    })),
    ...flow.good.nodes.slice(2).map((text, i) => ({
      text,
      phase: 'gift' as const,
      ...(i === 0 ? { head: { eyebrow: flow.good.eyebrow, name: flow.good.label } } : {}),
    })),
  ];

  return (
    <section className="lp-section lp-tl" aria-label="導入前後の比較">
      <div className="lp-inner">
        <p className="lp-eyebrow">before / after</p>
        <h2>
          {flow.heading.map((line, i) => (
            <span className="lp-line" key={i}>
              {line}
            </span>
          ))}
        </h2>

        {/* The rail is a sibling of the list, not a child of it: <ol> permits
            only <li>. .lp-tl-list is the positioning context both share, and it
            is also what LpMotion scrubs against — its height is the list's. */}
        <div className="lp-tl-list">
          <span className="lp-tl-rail" aria-hidden="true">
            {/* Faint track plus two fills — ink for the `now` half, green for
                the `with gift` half — each scaled from the top by the scrubbed
                timeline in LpMotion. Two bars rather than one gradient on
                purpose; see the spec. */}
            <i className="lp-tl-fill lp-tl-fill-now" />
            <i className="lp-tl-fill lp-tl-fill-gift" />
          </span>

          <ol className="lp-tl-steps">
            {steps.map((step, i) => (
              <li className={`lp-tl-step lp-tl-${step.phase}`} key={i}>
                <span className="lp-tl-node" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="lp-tl-body">
                  {step.head && (
                    <span className="lp-tl-phase">
                      <span className="lp-tl-phase-eyebrow">{step.head.eyebrow}</span>
                      <span className="lp-tl-phase-name">{step.head.name}</span>
                    </span>
                  )}
                  <p className="lp-tl-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="lp-flow-punch">{flow.punch}</p>
      </div>
    </section>
  );
}
```

---

## 2. `src/app/(lp)/lp.css`

Delete the entire `swap (flow)` block — from the `/* ---- swap (flow) */`
banner down to and including the last `.lp-swap-live` rule — **keeping
`.lp-flow-punch`**. Delete the `.lp-swap-*` rules appended to
`@media (max-width: 920px)`, and the swap rules in `@media (max-width: 560px)`.

Insert in place of the `swap (flow)` block:

```css
/* ------------------------------------------------------ timeline (flow)

   Step-by-step timeline, ported from the Osmo reference the client supplied.
   Rationale and the three designs this replaces: docs/aiops-lp-timeline-spec.md.

   Normal document flow — NO pin, NO sticky. The only scroll coupling is a
   scrubbed fill on the rail plus per-step active states, which is exactly what
   the reference does and is far less fragile than anything that pins.

   ⚠️ RENDERS COMPLETE AND STATIC WITHOUT JS. The rules in this first block are
   the finished state: full opacity, resolved markers, no fills. Everything that
   dims or animates lives under `.lp-tl-live`, added by LpMotion after its
   reduced-motion bail. Do not fold those into the base rules or a visitor with
   JS off gets a section dimmed to 22% forever.
   -------------------------------------------------------------------------- */
.lp-tl-list {
  position: relative;
  margin: clamp(34px, 5vw, 62px) 0 0;
  /* Marker diameter, and therefore the rail's x-position. One variable so the
     two can never drift apart. */
  --lp-tl-dot: clamp(34px, 3.4vw, 46px);
}
/* The list proper. .lp-tl-list is only the positioning wrapper it shares with
   the rail. */
.lp-tl-steps {
  margin: 0;
  padding: 0;
  list-style: none;
}
.lp-tl-rail {
  position: absolute;
  /* 0, not half a marker down: the rail must be exactly as tall as the list, or
     the phase boundary is no longer at 50% of it and the gift fill (pinned to
     top: 50%) turns green below the 「with gift」 header instead of at it. The
     overshoot above the first marker's centre is hidden by the marker itself,
     which is opaque and sits at z-index 1 on this same centre line. */
  top: 0;
  bottom: 0;
  left: calc(var(--lp-tl-dot) / 2 - 1px);
  width: 2px;
  background: rgba(17, 17, 17, 0.14);
}
.lp-tl-fill {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  transform: scaleY(0);
  transform-origin: center top;
}
.lp-tl-fill-now {
  top: 0;
  background: var(--lp-ink);
}
.lp-tl-fill-gift {
  top: 50%;
  background: var(--lp-line);
}

.lp-tl-step {
  position: relative;
  display: grid;
  grid-template-columns: var(--lp-tl-dot) minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 36px);
  align-items: start;
  /* ⚠️ IDENTICAL on all four steps, including the last. The rail's colour turn
     is two 50%-height bars, so the phase boundary is only at 50% while the
     steps stay symmetric. Zeroing the last step's padding shifts the turn off
     the phase break. */
  padding-bottom: clamp(38px, 6vw, 92px);
}
.lp-tl-node {
  position: relative;
  z-index: 1;
  width: var(--lp-tl-dot);
  height: var(--lp-tl-dot);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--lp-paper);
  color: var(--lp-white);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}
/* Resolved (and no-JS) marker styling. `.lp-tl-live` re-dims these. */
.lp-tl-now .lp-tl-node {
  background: var(--lp-ink);
}
.lp-tl-gift .lp-tl-node {
  background: var(--lp-line);
}

.lp-tl-phase {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: clamp(10px, 1.4vw, 18px);
  padding-bottom: clamp(10px, 1.4vw, 18px);
  border-bottom: 1px solid rgba(17, 17, 17, 0.14);
}
.lp-tl-phase-eyebrow {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.lp-tl-now .lp-tl-phase-eyebrow {
  color: var(--lp-ink);
}
.lp-tl-gift .lp-tl-phase-eyebrow {
  color: var(--lp-line);
}
.lp-tl-phase-name {
  color: rgba(17, 17, 17, 0.55);
  font-size: clamp(14px, 1.5vw, 19px);
  font-weight: 900;
  word-break: normal;
}
/* The content. Big, because these four phrases ARE the section. */
.lp-tl-text {
  margin: 0;
  color: var(--lp-ink);
  font-size: clamp(28px, 4.8vw, 68px);
  line-height: 1.3;
  letter-spacing: -0.01em;
  font-weight: 900;
  word-break: normal;
  text-wrap: balance;
}
.lp-tl-gift .lp-tl-text {
  color: var(--lp-line);
}

/* --------------------------------------------------- .lp-tl-live (JS on) -- */
/* The reference's signature: unseen steps sit at 0.22, seen ones fall back to
   0.5, the current one is at full. That tiering is what makes it read as
   considered rather than as a list that fades in. */
.lp-tl-live .lp-tl-step {
  opacity: 0.22;
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.lp-tl-live .lp-tl-step.is-past {
  opacity: 0.5;
}
/* AFTER .is-past on purpose — same specificity, so source order decides and the
   active step wins while it is both past and active. */
.lp-tl-live .lp-tl-step.is-active {
  opacity: 1;
}
.lp-tl-live .lp-tl-node {
  background: var(--lp-paper);
  color: rgba(17, 17, 17, 0.4);
  box-shadow: inset 0 0 0 2px rgba(17, 17, 17, 0.18);
  transition:
    background 0.4s ease,
    color 0.4s ease,
    box-shadow 0.4s ease;
}
/* A hard ring, not a blur. The reference glows; a soft shadow here would drag
   the section into the templated-SaaS look this project rejects. */
.lp-tl-live .lp-tl-now.is-active .lp-tl-node {
  background: var(--lp-ink);
  color: var(--lp-white);
  box-shadow: 0 0 0 6px rgba(17, 17, 17, 0.09);
}
.lp-tl-live .lp-tl-gift.is-active .lp-tl-node {
  background: var(--lp-line);
  color: var(--lp-white);
  box-shadow: 0 0 0 6px rgba(6, 199, 85, 0.16);
}
```

Append to the existing `@media (max-width: 920px)` block:

```css
  /* Phone: the rail and markers shrink but the structure is unchanged — a
     vertical timeline is already the right shape for a narrow screen. */
  .lp-tl-list {
    --lp-tl-dot: 30px;
  }
  .lp-tl-text {
    font-size: clamp(24px, 7.2vw, 40px);
  }
  .lp-tl-step {
    gap: 14px;
    padding-bottom: clamp(32px, 9vw, 54px);
  }
```

---

## 3. `src/app/(lp)/lp/_components/LpMotion.tsx`

Replace **only** the block under the `/* ---- flow swap */` comment. Everything
else in the file stays byte-identical, including the `enter()` helper, the
reduced-motion bail, and the refresh handling in the cleanup.

```ts
      /* --------------------------------------------------- flow timeline */
      // Step-by-step timeline (Osmo reference — see
      // docs/aiops-lp-timeline-spec.md). Two couplings, both cheap:
      //   1. one SCRUBBED timeline driving the rail's two fills, so the line
      //      tracks the scroll position exactly and reverses on the way up;
      //   2. one plain ScrollTrigger per step toggling active/past classes,
      //      which CSS transitions handle — no tween on opacity.
      // Normal flow, no pin and no sticky: nothing here can strand the page.
      //
      // `.lp-tl-live` is added here rather than in the markup so the no-JS and
      // reduced-motion paths keep the finished, full-opacity timeline — this
      // code sits below the prefers-reduced-motion bail at the top of the effect.
      gsap.utils.toArray<HTMLElement>('.lp-tl').forEach((section) => {
        const list = section.querySelector<HTMLElement>('.lp-tl-list');
        const steps = gsap.utils.toArray<HTMLElement>('.lp-tl-step', section);
        const fills = section.querySelectorAll<HTMLElement>('.lp-tl-fill');
        if (!list || !steps.length || fills.length !== 2) return;

        section.classList.add('lp-tl-live');

        // Where a step counts as "current". Just below centre, so a step reads
        // as active slightly before it reaches the middle of the screen.
        const LINE = '62%';

        // The two fills run back to back, so the ink half completes exactly as
        // the green half starts — at the phase break, which is the midpoint of
        // the list. `ease: 'none'` because with scrub the visitor's scroll IS
        // the easing; anything else fights the finger.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: list,
              start: `top ${LINE}`,
              end: `bottom ${LINE}`,
              scrub: true,
            },
          })
          .fromTo(fills[0], { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' })
          .fromTo(fills[1], { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' });

        steps.forEach((step) => {
          ScrollTrigger.create({
            trigger: step,
            start: `top ${LINE}`,
            end: `bottom ${LINE}`,
            // `is-past` latches on the way down and releases on the way back up,
            // so a step you have already read sits at 0.5 rather than snapping
            // back to 0.22.
            onEnter: () => step.classList.add('is-past'),
            onLeaveBack: () => step.classList.remove('is-past'),
            onToggle: (self) => step.classList.toggle('is-active', self.isActive),
          });
        });
      });
```

⚠️ Standing project rules, both satisfied above: no `once: true` on a timeline,
no `clearProps: 'all'`.

---

## 4. Verification

- `npx tsc --noEmit` clean; `npm run build` succeeds.
- `node scripts/check-encoding.mjs` clean.
- Zero remaining references anywhere in `src/` to the v3 classes: `lp-swap`,
  `lp-swap-live`, `lp-swap-row`, `lp-swap-slot`, `lp-swap-word`, `lp-swap-now`,
  `lp-swap-gift`, `lp-swap-idx`, `lp-swap-rail`, `lp-swap-state`,
  `lp-swap-head`, `lp-swap-pane`, `lp-swap-inner`, `lp-swap-stack`.
  `.lp-flow-punch` **must** survive.
- `src/data/lp-variants.ts` and `src/app/(lp)/lp/page.tsx` unchanged.
- Manual on `/lp` at **1440×900**, **1280×720**, **900px**, **390px**:
  - the fill tracks scroll and reverses on scroll-up;
  - the fill's colour changes exactly at the 「with gift」 phase header, not
    before or after it;
  - markers activate around screen centre; passed steps sit dimmer than the
    current one but brighter than unseen ones;
  - the rail passes through the centre of every marker at every width;
  - no horizontal overflow at 390px.
- With OS "reduce motion" on, and with JS disabled: all four steps at full
  opacity, markers resolved (ink for `now`, green for `with gift`), rail
  unfilled, nothing hidden.

---

## 5. v4.1 — closing the void under the timeline (2026-08-03)

The client reported "the gap is still there underneath the timeline" after a
first attempt that pulled `.lp-tl-list` up by `calc(var(--lp-tl-gap) * -0.7)`.
That attempt was aimed at the wrong term. Measured at 1440x900:

| contributor | size |
|---|---|
| last step's trailing `--lp-tl-gap`, minus the -0.7 pull-up | ~26px |
| **the punch pane's own internal offset** | **~263px** |

`.lp-punch-live .lp-punch-pane` is a `100dvh` sticky box that centres the line in
its top `74dvh` (`padding-bottom: 26dvh`). So the closing line can never appear
less than ~37dvh below the top of its own track, however much the timeline's
tail is trimmed. Shaving 60px off a 289px void is invisible — which is exactly
what the client saw.

### The lever: overlap, don't shrink

Two properties are in tension and must be decoupled:

- **where the line sits on screen while the pane is stuck** — 37dvh is right, it
  is the marquee's composition and must not move;
- **how far below the timeline the line first appears** — must be one breath,
  not a third of a screen.

Raising the line inside the pane (a bigger `padding-bottom`) changes both at
once: it buys ~90px of handoff and pays for it by parking the marquee near the
top of the screen with 70dvh of white under it. Rejected.

Instead pull the whole track up with a negative `margin-top` on
`.lp-punch-live`. The line keeps its 37dvh position while stuck; only the
handoff tightens. What it costs: the pane's box now overlaps the end of the
timeline, so for the first `|margin-top|` px of the stuck phase the last step
scrolls up *behind* the closing line. That is fine — the pane has no background
and its `overflow: hidden` clips only its own children — **provided the rail's
dead tail is dealt with (see below), or a hard-ended grey stub sits beside the
closing line.**

Separation between step 04's text and the top of the closing line, after the
change (line box derived from `font-size: clamp(...)` x `line-height: 1.2`):

| viewport | before | after |
|---|---|---|
| 1280x720 | 236px | 80px |
| 1440x900 | 289px | 101px |
| 1920x1080 | 354px | 134px |
| 390x844 (phone) | 393px | 97px |

### Edits — `src/app/(lp)/lp.css` only. No TSX changes.

**5a.** `.lp-tl-list` — make the pull-up cancel the last step's padding exactly.
The existing comment already claims it "cancels exactly"; `-0.7` did not.

```css
  margin-bottom: calc(var(--lp-tl-gap) * -1);
```

**5b.** `.lp-tl-rail` — fade the tail instead of shortening it. The rail must
keep `top: 0; bottom: 0` or the 50% colour boundary drifts off the phase break
(see the warning in section 2), so the stub cannot be cut geometrically. A mask
changes no geometry, and because it applies to the element and its descendants
as one group, the two fills fade with the track. Append to the rule:

```css
  /* The rail's final `--lp-tl-gap` is structural — the colour boundary is only
     at 50% while the rail is exactly as tall as the list — but with 5a and 5c
     that stub now hangs into the closing line's space and hard-stops there.
     Fade it out rather than cutting it: a mask moves nothing, and it applies
     to the two fills as a group so the green fill terminates with the track. */
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 calc(100% - var(--lp-tl-gap)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 calc(100% - var(--lp-tl-gap)),
    transparent 100%
  );
```

**5c.** `.lp-punch-live` — the actual fix. Add to the existing rule (which
currently only sets `height: 260svh`):

```css
  /* Overlap the timeline's tail so the closing line arrives one breath after
     step 04 instead of a third of a screen later. NOT a smaller pane or a
     bigger `padding-bottom` — both of those would move the line off its 37dvh
     resting position, which is the marquee's composition. Scoped to
     `.lp-punch-live` so the no-JS / reduced-motion fallback keeps the ordinary
     paragraph spacing. dvh, matching the pane geometry this cancels. */
  margin-top: -18dvh;
```

and in the existing `@media (max-width: 920px)` block, inside the rule that
already sets `height: 170svh`:

```css
    /* Bigger pull on a phone: the pane there is near-centred
       (`padding-bottom: 6dvh`), so the line starts ~47dvh down its own track
       instead of ~37dvh, and the void to close is correspondingly larger. */
    margin-top: -32dvh;
```

### Why LpMotion needs no change

The marquee's ScrollTrigger is `start: 'top top'` / `end: 'bottom bottom'` on
`.lp-punch`, and native sticky pins against the same box. A margin moves that
box; both read the moved position, so they stay in lockstep. `ScrollTrigger`
re-measures on its existing refresh. Nothing else keys off the track's offset.

### Verification

- `npx tsc --noEmit` clean. Do NOT run `npm run build` — the dev server is up
  and a production build corrupts its `.next` (project standing note).
- `node scripts/check-encoding.mjs` clean.
- On `/lp` at 1440x900 and 390px: step 04's text is followed by a single
  breath, then the closing line; the rail no longer hard-stops in that band but
  fades out under 04; the marquee still crosses the full width and still rests
  at the same height on screen as before.
- Reduced motion / JS off: unchanged from v4 — a static timeline followed by a
  normal `.lp-flow-punch` paragraph, no negative margin anywhere.
