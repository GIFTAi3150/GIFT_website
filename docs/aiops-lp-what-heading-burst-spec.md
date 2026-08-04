# LP what-we-do — heading burst

The section heading is blown apart, character by character, when card 02 lands.
Scoped to the desktop live fan only. Section: `.lp-what-sec`
(`LpSteps.tsx` / `LpMotion.tsx` / `lp.css`).

## The reference, read properly

madewithgsap.com homepage, `assets/landing/app2.js` (public, minified — sliced
with `node -e "s.indexOf('Matter')"`, not grep; a `.{0,700}` regex on a 39KB
single-line file backtracks forever).

It is **not** a text effect. The title is run through **Matter.js**:

```js
// build — one physics body per character, at its measured screen box
b = Engine.create({ gravity: { x: 0, y: 0 } })          // ZERO gravity
each .char-inner -> Bodies.rectangle(cx, cy, w, h, { frictionAir: .08, restitution: .4, density: .001 })
                    dirX/dirY = unit vector from the TITLE'S CENTRE to that char

// blow
Body.setVelocity(body, { x: dirX * v * 1.5 + rand(-1, 1),
                         y: dirY * v * 1.5 - (8 + 5 * rand) })   // v = 9 + 10*rand
Body.setAngularVelocity(body, rand(-.25, .25))
// then, in SHUFFLED order, delay = .4 + .006 * i
gsap.to(char, { scale: .8,      duration: .2, ease: 'back.in(2)'  })
gsap.to(char, { autoAlpha: 0,   duration: .2, ease: 'power3.in'   })

// ticker writes translate(dx,dy) rotate(rad) scale(s) per char
// trigger: ScrollTrigger on the CARDS section, onEnter -> build + blow
// onLeaveBack -> fromTo back to 0, stagger { each: .006, from: 'random' }, expo.out .4
```

So: a radial burst outward from the title's centre, with an upward kick, random
spin, decaying by air friction, then a shuffled fade 0.4s in. The cards' arrival
is what fires it.

## What we take, and what we don't

**We do not add matter-js.** The physics here has no collisions worth having —
every body flies away from a common centre in open space with zero gravity, so
it is a decaying ballistic burst and nothing else. Matter applies
`v *= (1 - frictionAir)` per step, i.e. exponential decay, which is exactly the
shape of a GSAP `power4.out` tween. Two tweens reproduce it; a 28KB physics
engine on an LP does not earn its transfer cost.

The reference's own numbers, converted from px/frame at 60fps to total distance
(`Σ 0.92ⁿ = 12.5` frames' worth):

| reference | per frame | × 12.5 = travel | ours |
|---|---|---|---|
| outward speed | 13.5–28.5px | 169–356px | `random(170, 360)` |
| upward kick | 8–13px | 100–163px | `random(100, 165)` |
| angular | ±0.25 rad | ±3.1 rad | `random(-170, 170)` deg |
| settle time | 36 frames | 0.6s | `duration: 0.75` |

**The whole heading is blown** — eyebrow, h2 and lead. The reference blows
`.title-l` only and leaves its paragraph to a different effect entirely; we tried
that first and the quiet `y: -18` fade on the small type read as a mismatch
against the shattering h2 (client, 2026-08-04). All three now fly on the same
timeline, with the small type at ~60% of the h2's energy: `random(100, 220)`
outward, `random(60, 110)` of lift, ±120° of spin. At a third of the h2's size
the full 360px throw reads as confetti rather than as one event.

That is only safe because of how the copy is split. The h2 is `white-space:
nowrap` on one line, so it can be split one span per character with nothing left
to break. **The lead wraps**, and an inline-block is an atomic wrap opportunity
that the browser's kinsoku does not apply across — split naively, a line can
start with 「、」 or break 「AI」 down the middle. So `LpSteps` tokenises instead
of splitting: Latin runs stay whole, 行頭禁則 characters (、。・！？, closing
brackets, small kana, 長音符) glue onto the token before them, and spaces glue on
too — with `white-space: pre` on the live span, since a trailing space inside an
inline-block is otherwise trimmed at a line end and the eyebrow's words would
jam together. 行末禁則 (opening brackets) is deliberately not implemented: no
copy on this page contains one.

The fade stagger is `{ amount: 0.3 }`, not `{ each }`: the lead takes the unit
count to ~75, and a per-unit stagger would spread the fade across 0.9s, leaving
stragglers dissolving over card 01. `amount` distributes a fixed total however
long the copy gets.

## The one thing the reference does not have to solve

Its title is a separate pinned section; ours shares the sticky stage with the
fan (`grid-template-rows: auto minmax(0, 1fr)` — heading row, arena row). Blow
the heading away and its row keeps its height, leaving ~340px of empty black
above a bottom-heavy fan.

So the burst has a second half: **the arena rises by `arena.offsetTop / 2`**,
which is exactly half of (heading row + row gap) — i.e. the arena's box ends up
centred in the stage instead of in row 2. `offsetTop` is a layout measurement
and is not affected by the transform we are about to write, so it stays correct
across repeat blows. It starts 0.15s after the scatter, so the words leave first
and the cards move into the space they vacated.

## The clip edges (added after review — the first pass got this wrong)

The stage is `overflow: hidden` and must stay that way: the wheel inside it is a
3675px square that would otherwise hand the document a horizontal scrollbar.
While the stage is stuck its top and bottom edges are the viewport's, so a
character clipped there is simply a character leaving the screen — free. Its
left and right edges are not: `.lp-section`'s padding insets them by up to 84px,
and a character sliced on an invisible vertical line 84px inside the window
reads as a rendering bug, not as motion.

Measured at 1440px: the outermost character of 「御社の社員にします。」 sits ~330px
from the heading's centre and would travel another 170–360px outward, i.e. up to
~93px past the clip edge — while still fully opaque, since the fade does not
start until 0.4s. It would have been visible on every play.

So the burst bounds **x, and only x**, per character, by the room that character
actually has: each entry in `dirs` carries `room: { left, right }` measured
against the stage box, and the x target is `gsap.utils.clamp(-room.left,
room.right, …)`. Characters near the edges decelerate into it instead of being
cut; y stays unbounded because both horizontal edges of the stage are the
window's own.

## Trigger point

`apply(i)` in the existing fan block already derives all state from the card
index. Blow at **`i >= 0`** — card 01, the moment its own entrance starts. That
is the effect the client asked for and it is the reference's own causality: the
cards' arrival is what destroys the title.

It only works because the budget carries a **lead-in**. Card 01 used to land at
`progress === 0`, the same instant the sticky stage sticks, so triggering on it
would have blown the heading apart before anyone read a word of it. So:

- `.lp-what-live .lp-what-scroll` is **360svh**: 60svh of lead-in plus 100svh
  per card. `LEAD = 1 / 6` in LpMotion is the same split and the two must move
  together.
- Below `LEAD`, `indexOf()` returns **-1** — a state `apply()` already renders
  (it is what `onLeaveBack` rewinds to), so no card is shown and the heading has
  the stage to itself.
- For that stretch the heading is **centred in the stage** by `centre()`, a
  transform-only shift of `(stage.clientHeight - head.offsetHeight) / 2`. Row 1
  is `auto`-height at the top of the grid, and a title pinned to the top edge
  with half a screen of black under it reads as a section that failed to load.
  Transform, not layout, so `arena.offsetTop` — which the burst's lift is
  measured from — is untouched. Re-run from the trigger's `onRefresh`, since
  both terms depend on viewport height.

The sequence a visitor actually sees: heading rises into the centre → holds
there alone for 60svh → card 01 begins its entrance → the heading detonates and
the arena lifts, so the cards rise into the space the words just vacated.

Reversible, like everything else in `apply()`: scrolling back below the boundary
re-assembles the words.

---

## Change 1 — `src/app/(lp)/lp/_components/LpSteps.tsx`

Split the h2 lines per character. Find:

```tsx
            <h2>
              {what.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  {line}
                </span>
              ))}
            </h2>
```

Replace with:

```tsx
            {/* Split per character for the burst in LpMotion — each one flies
                off on its own vector, so each one needs its own box.

                Plain inline spans, NOT inline-block: inline spans create no line
                break opportunities of their own, so the static fallback wraps and
                applies kinsoku exactly like unsplit Japanese text. `display:
                inline-block` arrives only under `.lp-what-live`, where the line is
                a single nowrap line on a >=900px viewport and there is no wrapping
                left to break. Same reasoning as `.lp-punch-char` in LpFlow. */}
            <h2>
              {what.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  {Array.from(line).map((ch, j) => (
                    <span className="lp-wchar" key={j}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
```

## Change 2 — `src/app/(lp)/lp.css`

Insert immediately after the `.lp-what-live .lp-what-head .lp-lead { ... }` rule
(the last of the three height-aware type rules, before the comment beginning
"The square."):

```css
/* Heading characters, live mode only. There is deliberately NO base rule for
   `.lp-wchar` — without JS these are inert inline spans and the heading is
   ordinary wrapping Japanese text. Only here, where the line is guaranteed to be
   one line on a >=900px viewport, do they become transformable boxes.

   The nowrap is not decoration: an inline-block per character WOULD introduce
   break opportunities that ignore kinsoku, so the line is pinned to one line for
   as long as the characters are boxes. */
.lp-what-live .lp-what-head h2 .lp-line {
  white-space: nowrap;
}
.lp-what-live .lp-wchar {
  display: inline-block;
}
```

## Change 3 — `src/app/(lp)/lp/_components/LpMotion.tsx`

All of this goes INSIDE the existing
`gsap.utils.toArray<HTMLElement>('.lp-what-sec').forEach((sec) => { ... })`
block in the `mm.add('(min-width: 900px) and (min-height: 660px)', ...)`
callback — it must stay per-section, because page.tsx renders the section once
per LP concept.

### 3a. Build the burst, above `const apply = ...`

Find:

```tsx
          // Degrees per card. Must match --wheel-step in lp.css.
          const STEP = 6.2;
          let shown = -1;
```

Replace with:

```tsx
          // Degrees per card. Must match --wheel-step in lp.css.
          const STEP = 6.2;
          let shown = -1;

          /* ------------------------------------------------ heading burst */
          // The heading is blown apart when card 02 lands. Ported from the
          // madewithgsap homepage, which runs its title through Matter.js;
          // full derivation and the px/frame -> px conversion table are in
          // docs/aiops-lp-what-heading-burst-spec.md.
          //
          // No physics engine here on purpose: with zero gravity, no walls and
          // no collisions that matter, Matter's `v *= (1 - frictionAir)` per
          // step is plain exponential decay, which is what a `power4.out` tween
          // already is. The reference's numbers are reproduced as distances.
          const head = sec.querySelector<HTMLElement>('.lp-what-head');
          const arena = sec.querySelector<HTMLElement>('.lp-what-arena');
          const lines = gsap.utils.toArray<HTMLElement>('.lp-what-head h2 .lp-line', sec);
          const chars = gsap.utils.toArray<HTMLElement>('.lp-what-head h2 .lp-wchar', sec);
          // The eyebrow and the lead do NOT shatter — the reference blows its
          // title only. It also keeps the JP lead paragraph unsplit, so its
          // kinsoku and text-wrap: balance are never in play.
          const quiet = gsap.utils.toArray<HTMLElement>(
            '.lp-what-head .lp-eyebrow, .lp-what-head .lp-lead',
            sec,
          );
          let blown = false;
          let burst: gsap.core.Timeline | null = null;

          const blow = () => {
            if (blown || !head || !chars.length) return;
            blown = true;

            // ⚠️ The h2's entrance tween (the generic heading block near the top
            // of this file) animates clipPath: inset() on the LINE and only
            // clears it on complete. A fast scroll can still have it live when
            // the burst starts, and an inset() on the line would clip every
            // character the moment it leaves the line box. Settle the line
            // first, then blow.
            gsap.killTweensOf(lines);
            gsap.set(lines, { opacity: 1, y: 0, clearProps: 'clipPath' });
            gsap.killTweensOf(quiet);

            // Outward direction per character, measured NOW: it depends on the
            // viewport size and on where the sticky stage currently sits, so it
            // cannot be computed once at build time.
            const box = head.getBoundingClientRect();
            const cx = box.left + box.width / 2;
            const cy = box.top + box.height / 2;
            const dirs = chars.map((c) => {
              const r = c.getBoundingClientRect();
              const dx = r.left + r.width / 2 - cx;
              const dy = r.top + r.height / 2 - cy;
              // || 1 guards the character that happens to sit exactly on the
              // centre — its direction is arbitrary, but it must not be NaN.
              const len = Math.hypot(dx, dy) || 1;
              return { x: dx / len, y: dy / len };
            });

            burst?.kill();
            burst = gsap.timeline();
            burst
              // Flight. power4.out is the frictionAir decay curve; the random
              // ranges are the reference's per-frame velocities converted to
              // total distance.
              .to(
                chars,
                {
                  x: (i: number) =>
                    dirs[i].x * gsap.utils.random(170, 360) + gsap.utils.random(-30, 30),
                  y: (i: number) =>
                    dirs[i].y * gsap.utils.random(170, 360) - gsap.utils.random(100, 165),
                  rotation: () => gsap.utils.random(-170, 170),
                  duration: 0.75,
                  ease: 'power4.out',
                },
                0,
              )
              // The fade is late and shuffled, exactly like the reference: the
              // characters are already well clear of the heading before any of
              // them start to go, which is what makes it read as thrown rather
              // than dissolved.
              .to(
                chars,
                {
                  autoAlpha: 0,
                  scale: 0.8,
                  duration: 0.2,
                  ease: 'power3.in',
                  stagger: { each: 0.012, from: 'random' },
                },
                0.4,
              )
              .to(quiet, { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' }, 0)
              // Second half of the effect, and the one thing the reference does
              // not need: its title is a separate pinned section, ours shares
              // this stage with the fan. `arena.offsetTop` is (heading row + row
              // gap), so half of it re-centres the arena's box in the stage and
              // closes the void the heading leaves behind. offsetTop is a layout
              // read and is unaffected by the transform written here, so it stays
              // correct on a repeat blow.
              .to(
                arena,
                { y: -(arena?.offsetTop ?? 0) / 2, duration: 0.8, ease: 'power3.inOut' },
                0.15,
              );
          };

          const restore = () => {
            if (!blown) return;
            blown = false;
            burst?.kill();
            burst = gsap.timeline();
            burst
              .to(
                chars,
                {
                  x: 0,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.45,
                  ease: 'expo.out',
                  stagger: { each: 0.006, from: 'random' },
                },
                0,
              )
              .to(quiet, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
              .to(arena, { y: 0, duration: 0.6, ease: 'power3.inOut' }, 0);
          };
```

### 3b. Fire it from `apply()`

Find, at the end of the `apply` function:

```tsx
            gsap.to(wheel, {
              rotation: i < 0 ? 0 : -(STEP / 2) * i,
              ease: 'elastic.out(0.6, 0.3)',
              duration: 0.5,
            });
            shown = i;
          };
```

Replace with:

```tsx
            gsap.to(wheel, {
              rotation: i < 0 ? 0 : -(STEP / 2) * i,
              ease: 'elastic.out(0.6, 0.3)',
              duration: 0.5,
            });
            // Card 02 is what knocks the heading out — not card 01, which lands
            // while the heading is still being read. Both directions, because
            // apply() rebuilds state from the index and scrolling back up has to
            // put the words back. The blown/restore guards make repeat calls at
            // the same index free.
            if (i >= 1) blow();
            else restore();
            shown = i;
          };
```

### 3c. Clean up with the rest of the section

Find:

```tsx
          cleanups.push(() => {
            st.kill();
            sec.classList.remove('lp-what-live');
            slots.forEach((slot) => slot.classList.remove('lp-on'));
            // Named props, not clearProps:'all' — 'all' is style.cssText = "",
            // which wipes React-owned inline styles too.
            gsap.set([...slots, wheel], { clearProps: 'transform' });
          });
```

Replace with:

```tsx
          cleanups.push(() => {
            st.kill();
            burst?.kill();
            blown = false;
            sec.classList.remove('lp-what-live');
            slots.forEach((slot) => slot.classList.remove('lp-on'));
            // Named props, not clearProps:'all' — 'all' is style.cssText = "",
            // which wipes React-owned inline styles too.
            gsap.set([...slots, wheel], { clearProps: 'transform' });
            // A resize down to the static grid must not leave characters parked
            // mid-flight or invisible: visibility is included because autoAlpha
            // writes it.
            if (chars.length) {
              gsap.set([...chars, ...quiet], {
                clearProps: 'transform,opacity,visibility',
              });
            }
            if (arena) gsap.set(arena, { clearProps: 'transform' });
          });
```

---

## Verification

- `npx tsc --noEmit` must pass. If the `gsap.core.Timeline` type annotation does
  not resolve, report it — do not swap it for `any`.
- **Do NOT run `npm run build`** — the user's dev server is running and a
  concurrent build corrupts its `.next` chunks. `tsc` only.
- Do not start a dev server or open a port. The user owns 3000.
- Confirm by reading back that every new block sits INSIDE the
  `.lp-what-sec` forEach, not in the `mm.add` callback body around it: a
  `const` declared outside the forEach would be shared by both LP concepts.

## Out of scope — do not touch

- The fan geometry, `STEP`, `--wheel-step`, the 300svh budget, `indexOf()`.
- The generic heading / eyebrow / lead entrance tweens near the top of the file.
- The punch marquee.
- The mobile strip and the static fallback — `.lp-wchar` deliberately has no
  base CSS rule, and nothing above may add one.
