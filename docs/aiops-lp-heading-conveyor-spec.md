# LP — heading rotator (madewithgsap effect053)

> ## ⛔ SUPERSEDED — DIRECTION REJECTED (2026-08-04)
>
> Built, then killed by the user: *"lets forget about this animation it dont
> fit those 2 text."* Reverted out of the tree in full. Kept only so the
> effect053 derivation in §1 does not have to be redone — **do not re-apply
> §3 to these two blocks.** The hero copy and the before/after heading are
> back on their original entrance tweens and are awaiting a new reference.

Applies the effect053 motion to the LP's two headline blocks, at the user's
direction (2026-08-04):

1. **the hero copy** — `.lp-hero-copy` (h1 + sub), both concepts
2. **the before/after heading** — the eyebrow + `h2` at the top of `.lp-tl`

Nothing else on the page changes.

> **Third revision.** v1 flew each block as one rigid unit — rejected on sight
> ("completely wrong"). v2 fixed the per-line stagger but still had one fixed
> text per block, so it read as an entrance-and-exit, not a rotator. v3 (this
> document) gives each block a real two-beat rotation, which is what the
> reference actually is. §1 explains why the first two failed; do not
> re-derive them.

---

## 1. What the reference actually does

The published page is paywalled; the demo reel is not, and the page's own HTML
references it — verify that before trusting the filename:

```
curl -sL https://madewithgsap.com/effects/effect053 | grep -oE '[^"]*\.mp4'
  -> https://pub-8ca9b5847fbb4d4fb97b3497fb9521d5.r2.dev/video_OPTIM/053.mp4
```

Read as a 4fps contact sheet plus a 30fps strip across each transition.

It is a **quote rotator**. Three quotes occupy ONE slot in turn. A quote leaves
to the left, shrinking, at the same moment the next blooms in from the right —
**the two cross, and the slot is never empty.** That simultaneity is the whole
effect.

Two properties that are easy to miss and that both earlier attempts got wrong:

**(a) The unit on the conveyor is the LINE, not the quote.** A quote's three
lines ride the same path independently, staggered, line 1 leading and line 3
trailing by ~40% of the transition. The tell: in any transition frame the two
quotes show *opposite* size gradients — outgoing runs small→large top to
bottom, incoming runs large→small. A rigid block can't produce that, and
neither can a 3D `rotateX` (a tilt would gradient both the same way).

**(b) The swap is the point.** With only one text per slot there is nothing to
cross with, the slot empties, and no amount of easing or travel tuning brings
the feel back. This is why v2 still felt wrong despite (a) being fixed.

Scale runs ~0.1 at the ends to exactly 1.0 at rest; no rotation, no blur, no
opacity ramp, no reflow (uniform `transform: scale()`, never a `font-size`
tween — the incoming quote keeps its line breaks at 0.1 scale).

### How a 3-quote rotator maps onto fixed copy

Both blocks already carry two beats; we were stacking them instead of rotating
them. Each block becomes **one enter-only unit plus one two-beat slot**:

| block | enter-only (flies in, stays) | rotating slot, 2 beats |
| ----- | ---------------------------- | ---------------------- |
| `.lp-hero-copy` | `h1` | the sub `<p>` |
| `.lp-h53-in` | `.lp-eyebrow` | the `h2` |

The enter-only unit is what stops the composition ever going empty — the
reference has the same thing in its static attribution line.

⚠️ **The heading's resting state is beat 2 alone.** On 案A both beats are
complete sentences, so that reads. On 案B they are two halves of one sentence
(「社長で止まる仕事を、」→「AIで流れる仕事に変える。」) and the final frame
loses its subject. The user was shown this tradeoff and accepted it
(2026-08-04). Do not "fix" it.

---

## 2. Numbers

```
MIN        0.14                      scale at both ends of the path
OUT()      window.innerWidth * 1.08  off-screen travel, re-measured on refresh
IN_D       0.18                      one unit's fly-in, in timeline units
step       (1 - IN_D) / beats.length  -> 0.41 for two beats
LEAD       0.06                      slot lags its enter-only unit by this
EASE       power2.inOut              on x and scale, every segment
SCRUB      0.4
```

Beat *i* enters at `i * step + LEAD` and — unless it is the last — exits at
`(i + 1) * step + LEAD`. For two beats that is:

```
beat 0   enter 0.06 -> 0.24     hold        exit 0.47 -> 0.65
beat 1                          enter 0.47 -> 0.65     hold to 1.0
```

Beat 0's exit and beat 1's entrance occupy **exactly the same window**. That
overlap is the swap; it is the one number that must not be loosened.

**Lock total duration to 1.0** with an empty spacer tween, so the last beat
rests to the end of the range instead of the timeline finishing early.

### Triggers differ per block, on purpose

| block | trigger | start | end |
| ----- | ------- | ----- | --- |
| hero | the enclosing `.lp-hero` | `top top` | `bottom top` |
| heading | the block | `top 95%` | `top 25%` |

The hero's rotation is driven by scrolling **through the hero**, not by the
copy crossing the viewport. This is load-bearing: on a phone the hero copy sits
*above the fold* at load, so a crossing-based range would resolve to progress
~0.5 on arrival and the visitor would land on a half-rotated slot with beat 1
showing and beat 0 already gone. Anchored to `.lp-hero`, progress is 0 at
scroll 0 on every device.

The heading is always scrolled into, so it has no such constraint; `top 95%` →
`top 25%` puts the swap at roughly the vertical middle of the screen and leaves
beat 1 resting while the heading is still comfortably in view.

`OUT` is a **function** and every trigger sets `invalidateOnRefresh: true`: it
is measured in viewport pixels, so a resize, an orientation change or a late
webfont has to re-measure it — the rule the punch marquee already follows.

`1.08 × innerWidth`, not less: transform origin is the LEFT edge, so travel is
measured from the line's own margin rather than screen centre, and that margin
can sit a full viewport width from the far edge.

**Transform origin is `0% 50%`.** These units are full-measure blocks holding
left-aligned text; scaling about the centre drags the type toward the middle of
the measure and the heading loses its left margin.

---

## 3. Files

### 3.1 `src/data/lp-variants.ts`

`hero.sub` becomes the slot's beats, so it turns into an array — the same shape
`flow.heading` already uses. **No words change**; both are split at an existing
`。` boundary. `LpHero.tsx` is the only consumer (verified by grep).

In the `LpVariant` type:

```ts
  hero: {
    /** One line. Short and blunt — it has to land in 3 seconds. */
    h1: string;
    /**
     * One string per BEAT of the sub's rotator slot — the beats swap through a
     * single line of space as the hero scrolls (see
     * docs/aiops-lp-heading-conveyor-spec.md). Two of them. Split at a 。, so
     * the manager's copy is untouched; without JS they render as two ordinary
     * stacked lines.
     */
    sub: string[];
```

`ai-staff`:

```ts
      sub: ['採用して、教えて、辞められる。', 'その繰り返し、いつまで続けますか。'],
```

`president`:

```ts
      sub: ['社員の手が止まるたびに、社長の名前が出る。', 'それ、会社の知識が社長に集まりすぎています。'],
```

### 3.2 `src/app/(lp)/lp/_components/LpHero.tsx`

Only the sub paragraph changes (line 147). Replace:

```jsx
        <p>{hero.sub}</p>
```

with:

```jsx
        {/* Rotator slot: the two beats swap through one line of space as the
            hero scrolls. `.lp-rot-live` — which stacks them into a single grid
            cell — is added by LpMotion, so without JS this stays two ordinary
            stacked lines. Spec: docs/aiops-lp-heading-conveyor-spec.md. */}
        <p className="lp-rot">
          {hero.sub.map((beat, i) => (
            <span className="lp-rot-line" key={i}>
              {beat}
            </span>
          ))}
        </p>
```

### 3.3 `src/app/(lp)/lp/_components/LpFlow.tsx`

The heading's `h2` becomes the slot. Only the `<h2>` inside `.lp-h53-in`
changes — the `.lp-h53` track and everything else stays exactly as it is:

```jsx
          {/* Rotator slot — see the note in LpHero.tsx. `.lp-line` stays for
              the base block/spacing rules; `.lp-rot-line` is what the motion
              layer drives. */}
          <h2 className="lp-rot">
            {flow.heading.map((line, i) => (
              <span className="lp-line lp-rot-line" key={i}>
                {line}
              </span>
            ))}
          </h2>
```

### 3.4 `src/app/(lp)/lp.css`

**Delete** the four-selector rule added last round (the one with
`transform-origin: 0% 50%` listing `.lp-hero-copy > h1, .lp-hero-copy > p,
.lp-h53-in > .lp-eyebrow, .lp-h53-in h2 .lp-line`). Leave `.lp-h53 { ... }`
untouched. In its place:

```css
/* The rotator's beats. `display: block` is the STATIC state and is what a
   visitor with JS off or reduce-motion set gets: two ordinary stacked lines,
   which is exactly how this copy read before the effect existed. */
.lp-rot-line {
  display: block;
}
/* Live only. Stacking both beats into one grid cell is what makes them share a
   slot — and it is why it must never be a base rule: without the motion layer
   the two would sit on top of each other, unreadable. LpMotion adds this class
   below its reduced-motion bail, the same contract as `.lp-tl-live`,
   `.lp-punch-live` and `.lp-what-live`.

   Grid rather than absolute positioning so the slot's height is the TALLER
   beat's own height — these lines wrap to two on a phone, and a fixed
   one-line height would clip them. */
.lp-rot-live {
  display: grid;
}
.lp-rot-live > .lp-rot-line {
  grid-area: 1 / 1;
  /* Beats the `h2 .lp-line + .lp-line` spacing rule, which is written with
     :where() and so carries zero specificity. */
  margin-top: 0;
}
/* Everything the conveyor moves. Origin is the LEFT edge: these are
   full-measure blocks holding left-aligned text, so scaling about 50% would
   drag the type toward the middle of the measure. At rest the transform
   resolves to an exact identity matrix, so the type stays crisp. */
.lp-rot-line,
.lp-hero-copy > h1,
.lp-h53-in > .lp-eyebrow {
  transform-origin: 0% 50%;
  will-change: transform;
}
```

### 3.5 `src/app/(lp)/lp/_components/LpMotion.tsx`

Replace the whole `/* ------ heading conveyor */` block — its comment header
and the `gsap.utils.toArray(...).forEach(...)` under it, including the `UNITS`
const — with the following. Everything else in the file stays as it is: the
hero's opacity-only tween, the two `.filter(...)` exclusions, and every block
below.

```ts
      /* -------------------------------------------------- heading rotator */
      // Port of madewithgsap effect053. The reference rotates three quotes
      // through ONE slot: a quote shrinks away to the left at the same moment
      // the next blooms in from the right, so the slot is never empty. That
      // simultaneous crossing IS the effect — an entrance and a separate exit
      // is not the same thing, and was rejected as "completely wrong".
      //
      // Each block here is one enter-only unit that flies in and stays (the h1
      // / the eyebrow — the reference has the same thing in its static
      // attribution) plus one slot carrying two beats that swap.
      //
      // Full derivation, the measured curve, and the two earlier attempts and
      // why they failed: docs/aiops-lp-heading-conveyor-spec.md.
      //
      // ⚠️ Beat 0's exit and beat 1's entrance occupy exactly the same window.
      // Do not stagger them apart "so you can read both" — that is v2, and it
      // is the thing that did not work.
      //
      // ⚠️ No pin and no sticky. Transform-only inside a clip window; nothing
      // here can change the document height or strand a section.
      gsap.utils
        .toArray<HTMLElement>('.lp-hero-copy, .lp-h53-in')
        .forEach((block) => {
          const slot = block.querySelector<HTMLElement>('.lp-rot');
          if (!slot) return;
          const beats = gsap.utils.toArray<HTMLElement>(':scope > .lp-rot-line', slot);
          if (beats.length < 2) return;

          // Flies in once and stays. Scoped to the block, so concept A's h1 can
          // never be driven by concept B's timeline.
          const lead = gsap.utils.toArray<HTMLElement>(
            ':scope > h1, :scope > .lp-eyebrow',
            block,
          );

          // Stacks the beats into one grid cell. Added HERE, not in the markup:
          // below the reduced-motion bail at the top of this effect, so a
          // visitor with JS off or reduce-motion set keeps two readable stacked
          // lines instead of two lines on top of each other.
          slot.classList.add('lp-rot-live');

          // Scale at both ends of the path. 0.14 is the reference's own edge
          // size — small enough to read as distance, large enough that the line
          // is still recognisably the words arriving.
          const MIN = 0.14;
          // A FUNCTION, and every trigger below invalidates on refresh: this is
          // measured in viewport pixels, so a resize or an orientation change
          // has to re-measure it. 1.08 because transform-origin is the LEFT
          // edge, so travel is measured from the line's own margin, not from
          // screen centre — anything under 1.0 leaves the shrunken line parked
          // visibly on screen instead of off it.
          const out = () => window.innerWidth * 1.08;

          const IN_D = 0.18;
          const LEAD = 0.06;
          const step = (1 - IN_D) / beats.length;

          const isHero = block.classList.contains('lp-hero-copy');
          const hero = block.closest<HTMLElement>('.lp-hero');

          const tl = gsap.timeline({
            scrollTrigger: {
              // ⚠️ The hero rotates against the HERO SECTION, not against its
              // own crossing of the viewport. On a phone the copy sits above
              // the fold at load, and a crossing-based range would resolve to
              // ~0.5 progress on arrival — the visitor would land on a
              // half-rotated slot with beat 0 already gone. Anchored to the
              // section, progress is 0 at scroll 0 on every device.
              trigger: isHero ? (hero ?? block) : block,
              start: isHero ? 'top top' : 'top 95%',
              end: isHero ? 'bottom top' : 'top 25%',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });

          // Pins total duration at exactly 1, so the last beat rests to the end
          // of the range instead of the timeline finishing early.
          tl.to({}, { duration: 1 }, 0);

          // Slow at the ends, fast through the middle — one power2.inOut is
          // within a frame or two of the reference's measured curve.
          lead.forEach((el, i) => {
            tl.fromTo(
              el,
              { x: out, scale: MIN },
              { x: 0, scale: 1, duration: IN_D, ease: 'power2.inOut' },
              i * 0.05,
            );
          });

          // Every beat after the first starts parked off-screen right. `fromTo`
          // already applies its from-values on creation, but this is stated
          // explicitly because the failure mode if it ever stops doing so is
          // both headline beats rendering on top of each other in the shared
          // grid cell.
          gsap.set(beats.slice(1), { x: out, scale: MIN });

          beats.forEach((beat, i) => {
            tl.fromTo(
              beat,
              { x: out, scale: MIN },
              { x: 0, scale: 1, duration: IN_D, ease: 'power2.inOut' },
              i * step + LEAD,
            );
            // The last beat never leaves — it is the resting state.
            if (i < beats.length - 1) {
              tl.to(
                beat,
                { x: () => -out(), scale: MIN, duration: IN_D, ease: 'power2.inOut' },
                (i + 1) * step + LEAD,
              );
            }
          });
        });
```

---

## 4. Constraints this must not break

- **Renders complete and static without JS.** Every transform and the
  slot-stacking class are written by LpMotion, below its
  `prefers-reduced-motion` bail. `lp.css` sets no transform on any of it.
- **Per section, never `document.querySelector`.** `page.tsx` maps `LP_SLUGS`,
  so every selector matches twice; all lookups above are scoped to `block`.
- **No `pin`.** There is no pin-spacer anywhere on this page.
- **No `clearProps: 'all'`** and **no `once: true`** on a timeline's
  ScrollTrigger. Both are standing rules in this file.
- `.lp-hero`'s `overflow: hidden` and `.lp-h53`'s `overflow-x: clip` are what
  hide the parked/departed beats. Do not remove either.

## 5. Verification

- `npx tsc --noEmit` clean.
- **Do NOT run `npm run build` or `npm run dev`** — the user owns port 3000 and
  a build against a live dev server corrupts its chunks on this project.
- Report the diff and the tsc output. If anything above does not match the file
  as you find it, stop and say so rather than guessing.
