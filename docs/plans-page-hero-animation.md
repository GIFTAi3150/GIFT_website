# /plans hero — madewithgsap.com hero effect, decoded

**Reference:** https://madewithgsap.com/ (hero only)
**Method:** plain `curl` of their public `style.css` + `app2.js`. No browser
automation. Every value below is quoted from their real source.
**Status:** implemented in `src/app/plans/_components/PlanCardStack.tsx`.

> This doc replaces three earlier partially-wrong passes. Where an earlier
> pass is contradicted, the version here is the correct one — it comes from
> reading their hero setup function end-to-end in one block instead of
> grepping fragments out of it.

---

## Plugins actually involved

Their page loads a lot of GSAP plugins (SplitText, Draggable, MorphSVG,
InertiaPlugin, matter-js). **The hero reel uses none of them.** It needs only
core `gsap` + `Observer`. Specifically:

- **No SplitText** — the headline is hand-split into `<span>`s in the HTML.
- **No Draggable** — dragging is raw pointer deltas via `Observer`.
- **No InertiaPlugin** — see below; this was the single biggest earlier error.

## The headline

Two word-groups, `.l` and `.r`, each word its own `<span>`, sitting at the far
left and far right of one absolutely-centred row. The centre gap between them
is where the reel lives:

```css
.h-hero .wording { position:absolute; left:0; top:50%; transform:translate(0,-50%); width:100% }
.h-hero .right   { width:calc(50% - 12.5vw - var(--grid-margin)) }  /* narrowed... */
.h-hero .container{ width:25vw; height:100%; margin:auto }          /* ...to leave this gap */
```

```js
const C = r.getBoundingClientRect().left - l.getBoundingClientRect().right; // the gap
gsap.fromTo(l.querySelectorAll("span"), {x:  C/2}, {x:0, stagger: .07, ease:"expo.inOut", duration:1, delay:1});
gsap.fromTo(r.querySelectorAll("span"), {x: -C/2}, {x:0, stagger:-.07, ease:"expo.inOut", duration:1, delay:1});
```

Both halves start bunched toward the centre gap and spring outward. Negative
stagger on the right half mirrors the play order so the two sides converge
symmetrically.

## The reel — how it actually works

Track = a plain flex column of 16:9 cards, `gap:5px`, `background:#000`, no
text on the card faces.

### 1. Movement is a `quickTo`, not inertia

```js
const w = gsap.quickTo(t, "y", { duration: .4, ease: "power4" });
...
onChange: e => { l = gsap.utils.clamp(-s, 0, l + e.deltaY); w(l); }
```

`quickTo` is an interpolating setter: you feed it a target each pointer move
and it continuously eases toward it. **That is the entire source of the reel's
weight and smoothness.** There is no momentum tween on release at all.

> Earlier passes used `InertiaPlugin` momentum here. That is what produced the
> "cards move on their own / never stop" behaviour — with no `resistance` set,
> InertiaPlugin coasts toward a ~10s cap on every release. The correct fix is
> not to tune resistance; it is to not use inertia at all.

### 2. The resting layout is a spotlight, not a column

This is their `v(index)` function. At rest there is **one** big card centred at
`scale:1.4`; its two immediate neighbours are flung out to peek exactly `40px`
past the top/bottom edge; every further card is pushed an extra half-viewport
beyond that, i.e. fully hidden.

```js
const c = window.innerHeight, i = c / 2;
const activeCenter = active.offsetTop + active.offsetHeight / 2;
trackY = -active.offsetTop + i - active.offsetHeight / 2;   // centre the active card

cards.forEach((card, n) => {
  if (n === index) return { y: 0, scale: 1.4 };
  const cardCenter = card.offsetTop + card.offsetHeight / 2;
  const natural = i + (cardCenter - activeCenter);          // where it'd sit
  const edge = n < index ? -card.offsetHeight/2 + 40        // peek past top
                         :  c + card.offsetHeight/2 - 40;   // peek past bottom
  const dir  = n < index ? -1 : 1;
  const isNeighbour = n === index-1 || n === index+1;
  return { y: isNeighbour ? edge - natural : edge - natural + dir * i, scale: 1 };
});
```

`u = 40` is their peek constant. Transitions use `expo.inOut`, `duration:.4`.

> Earlier passes rendered an evenly-spaced column with small offsets. That is
> why it read as "all merged into one box" — the defining visual of this
> effect is the single large card with thin slivers at the edges, which we
> simply weren't producing.

### 3. Press → flat, release → spotlight

```js
onPress:   gsap.to(cards, { y:0, scale:1, ease:"expo.inOut", duration:.4 })  // plain flow
onChange:  // track y only — cards stay flat
onRelease: v(closestIndex())                                                 // snap + spotlight
```

While you drag, the reel is an honest column scroll. The spotlight is applied
only once you let go. That press→flat / release→spotlight cycle is the trick.

### 4. Drag range

```js
const s = track.clientHeight - window.innerHeight;   // clamp is [-s, 0]
```

Clamped, not looping. (Their *autoplay* path separately recycles DOM order for
endless advance — see below — but dragging itself has hard ends.)

### 5. Things in the reference we deliberately did NOT port

- **Autoplay.** They auto-advance every `2.5s` (`gsap.delayedCall`, `0.8s`
  transition) and recycle DOM order so it never ends. Omitted because the user
  explicitly objected to cards moving on their own. Easy to add later.
- **Video playback** + `IntersectionObserver` play/pause — our cards are blank
  placeholders, not video.
- **Headline hide-on-drag.** They fade `.wording` out and a counter in while
  dragging, and tint the hero grey. Not ported; can be added if wanted.
- **Observer target = whole hero.** They attach the drag to the entire hero
  section so you can grab anywhere. Ours targets the reel only, so the drag
  can't swallow page scrolling elsewhere on the page.
- **gsap `Observer` itself.** They drive the drag with it; we use native
  pointer events. Observer resolves its event names once at import time and
  prefers `touchstart`/`touchmove` whenever `"ontouchstart" in documentElement`
  — true on any touchscreen Windows laptop, including this one — so a mouse
  never reaches it. Symptom: the reel dragged on mobile and was completely
  dead on desktop, with no console error. `type: "pointer"` does not help;
  `_eventTypes` is global and computed before `type` is read. Native
  `pointerdown`/`pointermove`/`pointerup` + `setPointerCapture` covers
  mouse/pen/touch uniformly and needs no plugin.

## Our adaptation

- `window.innerHeight` in their math → the reel container's own height, so the
  effect is self-contained instead of assuming a 100vh hero.
- Reel column `25vw` (min 240px), full height of the hero row
  (`min(620px, 72vh)`); below 901px the layout stacks and the reel shrinks.
- **901px breakpoint, not Tailwind's default `lg:` 1024px** — matches their own
  `@media (max-width:900px)` cutoff. At 1024 the split layout was collapsing to
  the mobile fallback on ordinary window sizes.
- `overflow-y: clip` + `overflow-x: visible` on the reel so the 1.4x active
  card can bleed sideways past the column (as it does on the reference) while
  still being clipped vertically. `overflow-y:hidden` cannot be used here — the
  spec forces the other axis to `auto`, adding a stray scrollbar.
- Cards are blank `#0b1340` rectangles. Real content is a separate, still
  undecided task.

## Build note

Branch `features/plans-page`, local only — not pushed, no preview URL, not
merged to `dev`, until the manager green-lights the page.
