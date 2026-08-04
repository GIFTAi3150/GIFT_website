# LP「what we do」= madewithgsap.com homepage card fan

**Supersedes `docs/aiops-lp-what-cards-spec.md` entirely.** That spec built a
travelling horizontal card row (effect070). The user rejected it — "not the
style we were aiming for" — and pointed instead at the card sequence on the
madewithgsap **homepage**, next to the "110 effects today." headline. This
document replaces that section's markup, CSS and motion. The effect070 code is
deleted, not layered over.

## Where the reference was read from

Not guessed, and not from the paywalled effect pages — this is the homepage's
own source, which is public:

- markup: `https://madewithgsap.com/` → `<section class="h-cards">`
- styles: `https://madewithgsap.com/assets/landing/style.css`
- motion: `https://madewithgsap.com/assets/landing/app2.js`

## What the reference actually does

The name `.circles` is literal, and it is the whole trick.

```css
.h-cards .container { height: 100vh; overflow: hidden }
.h-cards .pin-height { height: 400vh }
.h-cards .circles {
  position: relative;
  width: 3675px; aspect-ratio: 1;                    /* a 3675×3675 SQUARE */
  margin: 50vh 0 0 calc(-1*(3675px - 100vw)/2);      /* centred; top edge at 50vh */
}
.h-cards .circle {
  position: absolute; width: 100%; height: 100%;     /* each IS the full square */
  visibility: hidden;
}
.h-cards .circle.on { visibility: visible }
.h-cards .media {
  width: 100%; max-width: 338px; aspect-ratio: .85;
  border-radius: 20px; margin: 0 auto;
  transform: translate(0, -54%);                     /* sits ON the square's top edge */
  flex-direction: column; padding: 40px 0;
}
.h-cards span { font-size: 120px; opacity: .2; position: absolute; bottom: 32%; left: 0 }
```

Every `.circle` is a full-size copy of the same giant square, absolutely
stacked, each with its card pinned to the **top edge** of that square. Default
`transform-origin: 50% 50%` therefore puts every card's pivot at the square's
centre — a hub roughly **1837px below the top of the card**, far off-screen.

So rotating a `.circle` does not spin the card in place. It swings the card
along the rim of an enormous, very shallow circle. One 6.2° step moves a card
about `1853 × sin(6.2°) ≈ 199px` sideways while tilting it 6.2°. Card width is
338px, so consecutive cards overlap by ~41%: **a hand of playing cards being
fanned open.**

The driver, de-minified from `app2.js`:

```js
const s = 6.2;              // degrees per card
let a = -1;                 // last revealed index
ScrollTrigger.create({
  trigger: pinHeight, start: 'top top', end: 'bottom bottom',
  pin: container, scrub: true,
  onUpdate: (self) => {
    const t = Math.floor(self.progress * circles.length);
    if (t !== a && t < circles.length) {
      if (t > a) {
        circles[t].classList.add('on');
        gsap.set(circles[t], { rotation: t * s });
        gsap.from(circles[t], { scale: .94, ease: 'elastic.out(0.6, 0.3)', duration: .5 });
      } else if (t < a) {
        circles[a].classList.remove('on');
      }
      gsap.to(circlesWrap, { rotation: -t * s + s / 2 * t, ease: 'elastic.out(0.6, 0.3)', duration: .5 });
      a = t;
    }
  },
  onLeaveBack: () => { a = -1; circles[0].classList.remove('on'); }
});
```

`-t*s + (s/2)*t` simplifies to **`-3.1 × t`** — the group counter-rotates by
half a step per card, which keeps the growing fan symmetric about screen centre.
With their four cards the resting angles are −9.3°, −3.1°, +3.1°, +9.3°.

Below 900px they drop the wheel completely: `.pin-height` height goes `auto`,
`.circles` becomes `display: flex; width: max-content`, and the container turns
into an `overflow: auto; scroll-snap-type: x mandatory` swipe strip.

## What we change, and why

| Reference | Ours | Why |
|---|---|---|
| 4 cards | **3 cards** | We have three steps. Inventing a fourth means inventing copy. |
| ScrollTrigger `pin: container` | **`position: sticky`** | This page has no pin-spacer anywhere by design; `.lp-punch` already uses native sticky for the same reason. A sticky child of a tall wrapper is the same result with no spacer. |
| mint / lime / pale-blue / grey | **pale green / pale blue / light grey** | Same idea — each card its own pastel, near-black text. Ours are tints of this page's own `--lp-line` and `--lp-blue`, plus a neutral, mirroring their 3-chromatic + 1-neutral ratio. |
| mobile = scroll-snap swipe strip | **vertical stack** | An interactive card strip was killed once already on `/plans`; cards must be readable with zero interaction. |
| delta-based index updates | **index-based state** | See below — theirs has a real bug. |
| icon at top of card | **step title at top** | We have no icon set. Title carries it. |

### The one thing we deliberately do NOT copy

Their `onUpdate` mutates state from the **delta** (`t > a` reveals only
`circles[t]`; `t < a` hides only `circles[a]`). Any scroll fast enough to skip
an index — a flick, a trackpad throw, a scroll-position restore on reload —
leaves the skipped cards permanently hidden or permanently visible. Ours derives
the whole state from the index every time, so it is always self-consistent, and
fires the elastic pop only for genuinely new cards. The look is identical; it
just cannot desync.

### Geometry we keep exactly

The 3675px square, the 6.2° step, the −54% lift, the 338px card, `aspect-ratio:
.85`, `elastic.out(0.6, 0.3)` at 0.5s, and 100vh of scroll per card. These are
tuned values and the arc only reads right if the radius, the step and the card
width stay in proportion. **Do not "simplify" 3675px to a round number or
re-derive it from a vw unit** — it is a fixed pixel radius in the reference and
the arc is meant to be viewport-independent.

Resting angles with three cards: **−6.2°, 0°, +6.2°.**

---

## 1. Delete the effect070 implementation

### `src/app/(lp)/lp.css`
Delete **lines 624–825 inclusive** — the entire `/* ---- what we do ---- */`
block, from its header comment through the closing brace of the
`@media (max-width: 899px)` block that contains `.lp-wcard-lead h2`. Line 827
(`/* ---- button / cta ---- */`) must survive untouched. Insert §3 in its place.

### `src/app/(lp)/lp/_components/LpMotion.tsx`
Delete **both** of these blocks entirely:
- the `/* ---- steps ---- */` block — the
  `gsap.utils.toArray<HTMLElement>('.lp-wcard').forEach((card, i) => {...})`
  entrance, comment included.
- the `/* ---- what-we-do horizontal row ---- */` block — the whole
  `mm.add('(min-width: 900px)', () => { ... })` call, comment included.

Keep `const mm = gsap.matchMedia();` and keep `mm.revert();` in the cleanup —
§4 uses both.

---

## 2. Markup — `src/app/(lp)/lp/_components/LpSteps.tsx`

Replace the file's `return (...)` wholesale. Imports and props type unchanged.

```tsx
export default function LpSteps({ what }: LpStepsProps) {
  return (
    <section className="lp-section lp-dark lp-what-sec" aria-label="サービス内容">
      {/* Scroll budget. In live mode this is 300svh tall and the stage inside
          it is sticky, which is how the card sequence gets 100svh of scroll per
          card WITHOUT a ScrollTrigger pin — this page has no pin-spacer
          anywhere and must not gain one. With JS off this element has no height
          of its own and everything below is a plain stacked section. */}
      <div className="lp-what-scroll">
        <div className="lp-what-stage">
          <div className="lp-inner lp-what-head">
            <p className="lp-eyebrow">what we do</p>
            <h2>
              {what.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="lp-lead">{what.lead}</p>
          </div>

          {/* The wheel. In live mode this <ol> IS the reference's 3675px
              square: each <li> is a full-size absolutely-stacked copy of it
              whose transform-origin is the square's centre — a hub ~1837px
              below the cards. Rotating an <li> swings its card along that
              huge, shallow arc. It stays an <ol> because these are three
              ordered stages and the order is the meaning; do NOT flatten it
              with `display: contents`, which would destroy both the list
              semantics and the geometry. */}
          <ol className="lp-what-wheel">
            {what.steps.map((step, i) => (
              <li className="lp-wslot" key={step.title}>
                <article className={`lp-wcard lp-wcard-${i + 1}`}>
                  {/* Watermark. Duplicates the <ol>'s own numbering, so it is
                      hidden from screen readers rather than read out twice. */}
                  <span className="lp-wnum" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

---

## 3. CSS — `src/app/(lp)/lp.css`

Insert exactly this where lines 624–825 were.

```css
/* ----------------------------------------------------------- what we do

   Port of the card sequence on madewithgsap.com's homepage (the one beside
   "110 effects today."). Read off their own public style.css + app2.js, not
   guessed. Full derivation, including the geometry maths and the one bug we
   deliberately did not copy: docs/aiops-lp-what-fan-spec.md.

   The trick: .lp-what-wheel is a 3675px SQUARE and every .lp-wslot is a
   full-size absolutely-stacked copy of it, with its card pinned to the square's
   top edge. Default transform-origin therefore pivots each card around a hub
   ~1837px BELOW it, off-screen. Rotating a slot by 6.2° slides its card ~199px
   sideways along a very shallow arc while tilting it 6.2° — cards fan open like
   a hand of playing cards. Cards are 338px wide against a 199px step, so they
   overlap ~41%, which is where the "hand of cards" reading comes from.

   ⚠️ The 3675px radius, the 6.2° step and the 338px card are proportional to
   each other. Change one and the arc stops reading as an arc. Do not re-derive
   3675px from a vw unit — it is a fixed pixel radius in the reference too.

   ⚠️ Renders complete and readable without JS: the base rules are a plain
   centred grid of cards. Everything that makes them a wheel is scoped under
   `.lp-what-live`, which LpMotion adds on mount, after its reduced-motion bail
   and only at >=900px wide AND >=640px tall. Do not promote any of it into the
   base rules.
   -------------------------------------------------------------------------- */
.lp-what-sec {
  --wcard-w: 338px;
  /* Reference: width 3675px, aspect-ratio 1, so the hub is half of that below
     the square's top edge. */
  --wheel-d: 3675px;
  --wheel-step: 6.2deg;
  --wcard-radius: 20px;
}

/* -------------------------------------------------------- base (no JS) */
.lp-what-head {
  text-align: center;
}
.lp-what-wheel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(16px, 2vw, 28px);
  margin: clamp(40px, 5vw, 72px) 0 0;
  padding: 0;
  list-style: none;
}
.lp-wslot {
  display: block;
}

/* ---------------------------------------------------------------- card */
.lp-wcard {
  position: relative;
  width: 100%;
  max-width: var(--wcard-w);
  /* Reference value. Gives 338 x 398 — portrait, and tall enough that the
     number watermark reads in the gap between title and body. */
  aspect-ratio: 0.85;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 0;
  border-radius: var(--wcard-radius);
  color: var(--lp-black);
  text-align: center;
  /* No box-shadow — the reference has none, and shadowed rounded cards are the
     templated-SaaS look this site rejects. */
}
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

/* Watermark number. Reference: font-size 120px, opacity .2, absolute, pinned
   bottom 32% — it sits in the gap between the title and the body copy, behind
   both. */
.lp-wnum {
  position: absolute;
  bottom: 32%;
  left: 0;
  width: 100%;
  font-size: 120px;
  line-height: 1;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  color: rgba(5, 5, 5, 0.18);
  pointer-events: none;
}
.lp-wcard strong {
  position: relative;
  display: block;
  padding: 0 8%;
  font-size: 19px;
  line-height: 1.5;
  font-weight: 900;
  letter-spacing: -0.005em;
  /* JP orphan control — the manager objects to a lone trailing character. */
  text-wrap: balance;
}
.lp-wcard p {
  position: relative;
  margin: 0;
  padding: 0 8%;
  color: rgba(5, 5, 5, 0.66);
  font-size: 13px;
  line-height: 1.85;
  font-weight: 700;
}

/* ------------------------------- live (JS, >=900px wide, >=640px tall) */
/* Sticky, NOT ScrollTrigger pin. Same result, no pin-spacer — see the markup
   comment in LpSteps.tsx. */
.lp-what-live .lp-what-scroll {
  /* 100svh of scroll per card, matching the reference's 400vh for four.
     svh, not dvh: this is a scroll budget, and dvh would resize it when mobile
     chrome collapses. */
  height: 300svh;
}
.lp-what-live .lp-what-stage {
  position: sticky;
  top: 0;
  /* dvh, not svh: this one is a viewport FILL and must not under-fill. */
  height: 100dvh;
  overflow: hidden;
}
.lp-what-live .lp-what-head {
  padding-top: clamp(24px, 6vh, 72px);
}
/* The square. Absolutely positioned rather than in flow (the reference can use
   `margin: 50vh auto` because its heading is a different section; ours shares
   the stage with the heading, so the square has to overlay instead of stack).
   Geometry is otherwise identical: horizontally centred, top edge just past
   half the stage. */
.lp-what-live .lp-what-wheel {
  position: absolute;
  top: 54%;
  left: 50%;
  width: var(--wheel-d);
  aspect-ratio: 1;
  margin: calc(var(--wheel-d) / -2) 0 0 calc(var(--wheel-d) / -2);
  padding: 0;
  display: block;
  gap: 0;
}
/* Every slot is the whole square, so the default 50% 50% origin is the hub. */
.lp-what-live .lp-wslot {
  position: absolute;
  inset: 0;
  visibility: hidden;
}
.lp-what-live .lp-wslot.lp-on {
  visibility: visible;
}
/* Lifts the card off the square's top edge so it lands mid-stage. Reference
   value, unchanged. */
.lp-what-live .lp-wcard {
  transform: translate(0, -54%);
}

@media (max-width: 899px) {
  .lp-what-wheel {
    flex-direction: column;
    align-items: center;
  }
  .lp-wcard {
    /* JP body copy at phone widths sets the height, not an aspect ratio. */
    aspect-ratio: auto;
    min-height: 320px;
  }
}
```

Note the `margin: calc(var(--wheel-d) / -2) ...` on the live wheel: `top: 54%`
and `left: 50%` place the square's **centre**, then the negative margins pull it
back by half its size in each axis, putting its **top edge** at 54% of the stage
and its horizontal centre on screen centre. That is the same placement the
reference gets from `margin: 50vh 0 0 calc(-1*(3675px - 100vw)/2)`, expressed so
it does not depend on `100vw` (which includes the scrollbar and would drift the
fan a few px off-centre).

---

## 4. Motion — `src/app/(lp)/lp/_components/LpMotion.tsx`

Add this where the two deleted blocks were, inside the `gsap.context` callback.

```tsx
      /* ------------------------------------------------- what-we-do fan */
      // Port of the madewithgsap.com homepage card sequence. Cards are revealed
      // one per 100svh of scroll and fan open along a shallow arc. Derivation:
      // docs/aiops-lp-what-fan-spec.md.
      //
      // ⚠️ NO `pin: true`. This page has no pin-spacer anywhere and adding one
      // here would strand the sections around it. The stage is `position:
      // sticky` in CSS instead, and this trigger only reads progress.
      //
      // Height is in the query as well as width: the fan needs vertical room
      // for a heading above it and a 398px card below that. On a short laptop
      // window the two collide, so those viewports get the static grid.
      mm.add('(min-width: 900px) and (min-height: 640px)', () => {
        const sec = document.querySelector<HTMLElement>('.lp-what-sec');
        const scroll = sec?.querySelector<HTMLElement>('.lp-what-scroll');
        const wheel = sec?.querySelector<HTMLElement>('.lp-what-wheel');
        const slots = gsap.utils.toArray<HTMLElement>('.lp-wslot');
        if (!sec || !scroll || !wheel || !slots.length) return;

        // Degrees per card. Must match --wheel-step in lp.css.
        const STEP = 6.2;
        let shown = -1;

        sec.classList.add('lp-what-live');

        // ⚠️ State is derived from the index, never from the delta. The
        // reference reveals only slots[t] on the way down and hides only
        // slots[a] on the way up, so any scroll that skips an index — a flick,
        // a trackpad throw, a scroll-position restore on reload — desyncs it
        // permanently. Rebuilding the whole state each time cannot.
        const apply = (i: number) => {
          if (i === shown) return;
          slots.forEach((slot, n) => {
            const on = n <= i;
            slot.classList.toggle('lp-on', on);
            if (on) gsap.set(slot, { rotation: n * STEP });
          });
          // Pop only for a card that is genuinely new, so scrubbing back and
          // forth over one boundary doesn't re-trigger it endlessly.
          if (i > shown && i >= 0) {
            gsap.from(slots[i], {
              scale: 0.94,
              ease: 'elastic.out(0.6, 0.3)',
              duration: 0.5,
            });
          }
          // Counter-rotate the group by half a step per card so the fan stays
          // symmetric about screen centre as it grows. With three cards the
          // resting angles are -6.2, 0, +6.2.
          gsap.to(wheel, {
            rotation: i < 0 ? 0 : -(STEP / 2) * i,
            ease: 'elastic.out(0.6, 0.3)',
            duration: 0.5,
          });
          shown = i;
        };

        const indexOf = (progress: number) =>
          // clamped, because progress hits exactly 1 at the end and
          // floor(1 * 3) would be 3 — one past the last card.
          Math.min(slots.length - 1, Math.floor(progress * slots.length));

        const st = ScrollTrigger.create({
          trigger: scroll,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => apply(indexOf(self.progress)),
          // Fires on create and on every resize/refresh, which is what sets the
          // initial state and what restores it for someone landing mid-section.
          onRefresh: (self) => apply(indexOf(self.progress)),
          onLeaveBack: () => {
            shown = 0;
            apply(-1);
          },
        });

        return () => {
          st.kill();
          sec.classList.remove('lp-what-live');
          slots.forEach((slot) => slot.classList.remove('lp-on'));
          // Named props, not clearProps:'all' — 'all' is style.cssText = "",
          // which wipes React-owned inline styles too.
          gsap.set([...slots, wheel], { clearProps: 'transform' });
        };
      });
```

### Why `onLeaveBack` sets `shown = 0` before calling `apply(-1)`

`apply` early-returns when `i === shown`, and it must not early-return here.
Setting `shown` to anything other than `-1` first guarantees the call goes
through, hides every card and returns the group to 0°.

---

## 5. Verify

- `npx tsc --noEmit` passes.
- **Do NOT run `npm run build` or `npm run dev`.** The user owns port 3000 and a
  concurrent `next build` corrupts their running dev server's chunks. `tsc` only.
- Repo-wide grep for `lp-wcard-lead`, `lp-what-track`, `lp-what-row`,
  `lp-wsteps`, `lp-wchip`, `lp-what-live .lp-what-row`, `lp-sec-pad`,
  `--wcard-gap` returns **nothing outside `docs/`**. Those are all effect070
  leftovers.
- `lp.css` still has exactly one `/* ---- button / cta ---- */` block and it is
  intact.
- `lp-tl-*` is a DIFFERENT section (the flow timeline). Leave every one alone.
- Japanese strings are moved byte-for-byte, never retyped. Run
  `node scripts/check-encoding.mjs` and report the result.
- Do not commit, stage or push.

---

# Revision 1 — three corrections found reviewing the applied result

All applied. Recorded so this file matches the code.

### A. The wheel was parked off-screen (critical)

§3 had `top: 54%` together with
`margin: calc(var(--wheel-d) / -2) 0 0 calc(var(--wheel-d) / -2)`, and the note
under it claimed that combination puts the square's *top edge* at 54%. It does
not. `top` already places the top edge; the negative top margin then pulls the
box up by half a diameter, so the edge lands at `54% - 1837px` — roughly 1400px
above the stage, where `overflow: hidden` clips it. **The section would have
rendered completely empty on desktop.**

Only the horizontal margin should be negative:

```css
  top: clamp(440px, 54%, calc(100% - 210px));
  left: 50%;
  margin: 0 0 0 calc(var(--wheel-d) / -2);
```

### B. The vertical placement needed bounds, not a bare percentage

The card spans `top - 215px` to `top + 183px`. At 54% of a short window the
heading above and the card collide. Hence the `clamp()` in A: ~440px of headroom
reserved for the heading, ~210px reserved below the card, and 54% tracked
between those bounds — which is the reference's placement wherever there is room
for it. The `mm` gate rises from `min-height: 640px` to **`660px`** to match
(below that the clamp's own bounds cross).

### C. The block only handled the first concept

`page.tsx` maps `LP_SLUGS`, so `.lp-what-sec` renders **once per LP concept** —
the header comment at the top of `LpMotion.tsx` says exactly this, and every
other block in the file already iterates. §4 used `document.querySelector` for
the section and wheel but a document-wide `gsap.utils.toArray('.lp-wslot')` for
the slots. Concept A's wheel would therefore have been driven by *every*
concept's cards (`slots.length` = 3 × concepts, so `indexOf` produced indices
past the end of A's fan), and concept B's wheel by none.

§4 is now wrapped in
`gsap.utils.toArray<HTMLElement>('.lp-what-sec').forEach((sec) => { ... })`,
with `scroll`, `wheel` and `slots` all queried inside `sec`, and `shown` per
section. Per-section teardowns are collected into a `cleanups` array and run
from **one cleanup returned by the `mm.add` callback** — not returned from the
`forEach`, which discards return values.

`npx tsc --noEmit` clean and `scripts/check-encoding.mjs` clean after all three.

---

# Revision 2 — the fan collided with the heading (Revision 1 B was wrong)

Reported from a full-width desktop screenshot: card 01 sat on top of the lead
paragraph.

Revision 1 B added `top: clamp(440px, 54%, calc(100% - 210px))` and described it
as "~440px of headroom reserved for the heading". It is not. `top` places the
**wheel square**, and the card is lifted `translate(0, -54%)` of its own 397.6px
height off that edge, so the card's top is at `top - 215px`. A 440px floor
reserves **225px**. Measured against the live heading at 1512x900 —
`padding-top` 54 + eyebrow 33.8 + two h2 lines at 60px/1.35 = 163 + a two-line
lead at 20px/1.8 + 20 margin = 92 — the heading is **~343px**. At 900px tall the
54% term wins anyway (486 - 215 = 271) and the card lands 72px inside the lead.

The class of bug matters more than the number: **any constant here is a guess at
the height of Japanese copy that reflows with viewport width and differs per LP
concept.** So Revision 2 removes the constant instead of correcting it.

## The stage is a two-row grid

`.lp-what-live .lp-what-stage` becomes `grid-template-rows: auto minmax(0, 1fr)`
with a `clamp(8px, 1.6vh, 22px)` row gap. Row 1 is `.lp-what-head`, which takes
exactly the height it needs. Row 2 is a new `.lp-what-arena` wrapper around the
`<ol>` — `position: relative`, so it is the wheel's containing block — and it
takes whatever is left. The wheel is then placed at `top: calc(50% + 16px)` of
the arena: 50% would centre the square's top edge, and the +16px is 4% of the
card height, the difference between the card's -54% lift and a -50% centring, so
what ends up centred is the **card**. `minmax(0, 1fr)` and not `1fr`: a bare
`1fr` floors at content size and this row contains a 3675px square.

No measurement, no resize listener, no JS. The heading can be any height and any
number of lines and the fan simply gets the remainder.

## Live-mode type shrinks with viewport height

Centring in the remainder stops the collision but does not create room that is
not there. At the bottom of the live range the remainder has to hold a 398px
card plus ~17px of rotated overhang from the fanned outer cards. Three live-only
declarations buy it:

| | base | live |
|---|---|---|
| `.lp-what-head` padding-top | `clamp(24px, 6vh, 72px)` | `clamp(16px, 4.5vh, 72px)` |
| `h2` font-size | `clamp(32px, 4.8vw, 60px)` | `clamp(30px, min(4.8vw, 6.2vh), 60px)` |
| `.lp-lead` font-size | `clamp(16px, 1.8vw, 20px)` | `clamp(15px, min(1.8vw, 2.2vh), 20px)` |

At any normal desktop height the `vh` terms lose and the type is unchanged. At
660x1440 they bring the heading to ~235px, leaving a 414px arena for a 398px
card — the outer cards' corners rise into the row gap and clear the lead. The
`mm` gate therefore **stays at `min-height: 660px`**; raising it to fit the old
geometry would have taken the fan away from ordinary Windows laptops (~730px of
viewport at 150% scaling), which is a worse trade than a slightly smaller
headline on a short window.

## Mobile (<900px) is now a swipe strip

Unrelated to the collision, applied in the same pass. The three cards were a
vertical stack costing ~1000px of scroll for three peers; they are now a native
`scroll-snap-type: x mandatory` scroller running 0 -> -x, bleeding edge to edge
via `margin-inline: calc(var(--wstrip-gutter) * -1)` against a matching
`padding-inline` (`--wstrip-gutter` mirrors `.lp-section`'s horizontal padding,
so card 01 still lines up with the heading). Slots are `min(76vw, 320px)` so the
next card always peeks, with `scroll-snap-stop: always` so one flick moves one
card. Native only — no JS, no `scrollLeft` writes, no loop: every fling bug on
the /plans reel came from a rAF recentre fighting the browser's own scroll.
