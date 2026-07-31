# NOLLM — /plans page manual (edit it yourself, no AI needed)

This is a plain-English manual for the **/plans page hero and its card carousel**.
It is written so you can change things by hand, without asking an AI.

**Everything below is a real value copied from the real code**, not an example.

---

## 1. The files

| File | What it holds |
|---|---|
| `src/app/plans/page.tsx` | The page itself. Fonts + metadata (page title / description). Very short. |
| `src/app/plans/_components/PlansHero.tsx` | The headline text, the pink CTA button, the background colour, the intro animation timings. |
| `src/app/plans/_components/PlanCardStack.tsx` | **The carousel.** Card size, drag, the click-to-expand overlay. |
| `src/app/plans/_components/planData.ts` | **The words and prices on the cards.** One block per service. This is the file to edit for copy changes. |
| `src/app/plans/_components/PlanCardFace.tsx` | How a card is laid out and coloured — the grey, the type sizes, where the photo sits. |

There is **nothing below the hero yet** — the pricing/tier section is not built.

> ⚠️ **All the service names and prices are made up.** They were written
> 2026-07-31 so the cards would have something to show, and nothing in them has
> been through 役員確認. Treat every figure as a placeholder.

---

## 2. How to see your change

Open PowerShell in `C:\Users\owner\Desktop\GIFT_website` and run:

```
npm run dev
```

Then open **http://127.0.0.1:3000/plans** in the browser.

> Use `127.0.0.1`, **not** `localhost`. On this machine `localhost` sometimes
> points at a dead process and shows a 404 for no reason.

**After you edit a file, always hard-reload the browser: `Ctrl + Shift + R`.**
A normal reload can keep the old JavaScript and make you think your change did
nothing.

When you are finished, press `Ctrl + C` in that PowerShell window to stop the
server and free the port.

### Before you call a change "done"

```
npm run build
```

If that prints `✓ Compiled successfully`, you did not break the build. If it
prints red errors, read the file + line number it names and undo your last edit.

---

## 3. The 901px rule (read this first — it explains most confusion)

The carousel is **two completely different things** depending on window width:

| Window width | What runs | Behaviour |
|---|---|---|
| **901px and wider** ("desktop") | JavaScript / GSAP | Cards stacked **vertically**, one big card in the middle, drag **up and down**, loops forever, **and advances by itself one card every 3 seconds** |
| **900px and narrower** ("mobile") | Native browser scrolling + a recentring trick | Cards in a **horizontal** row, swipe/drag **left and right**, also loops forever |

So if a change works on one and not the other, you almost certainly edited only
one of the two branches. In `PlanCardStack.tsx` look for:

```js
{isMobile
  ? ( ...the mobile cards...  )
  : ( ...the desktop cards... )}
```

**The number 901 appears in two places and they MUST stay equal:**

- In CSS as `min-[901px]:` (many times)
- In JavaScript as `window.matchMedia('(max-width: 900px)')`

901 and 900 look inconsistent but are correct: CSS says "901 and up", JS says
"900 and down". If you change one, change the other, or the layout and the
JavaScript will disagree and the carousel will misbehave.

---

## 4. Carousel — what you can change

All of these are at the **very top of `PlanCardStack.tsx`** (around line 38):

```js
const REAL_CARD_COUNT = PLANS.length;  // = 3 today, from planData.ts
const MIN_REEL_CARDS = 12;
const CARD_GAP = 5;
const ACTIVE_SCALE = 1.4;
const PEEK = 40;
const SNAP_EASE = 'expo.inOut';
const SNAP_DURATION = 0.4;
const AUTOPLAY_PERIOD = 3;
const AUTOPLAY_SHIFT = 0.85;
const AUTOPLAY_RETRY = 0.4;
```

### ⭐ The carousel moving by itself (desktop only)

On desktop the carousel does not wait to be dragged: it moves **one card at a
time**, stops, then moves again. Two numbers control it, both in **seconds**:

```js
const AUTOPLAY_PERIOD = 3;    // one card every 3 seconds, all in
const AUTOPLAY_SHIFT = 0.85;  // of those 3s, 0.85s is spent moving
```

So today: **0.85s of movement, then a 2.15s stop, then the next card.**

| I want to… | Change this |
|---|---|
| Slower / faster overall (longer or shorter stop) | `AUTOPLAY_PERIOD` — `4` = a new card every 4s, `2` = every 2s |
| The slide itself slower or snappier | `AUTOPLAY_SHIFT` — bigger = a lazier glide, smaller = a quicker step |
| Turn the self-advance **off** entirely | Set `AUTOPLAY_PERIOD = 0` — see the warning below |

> ⚠️ `AUTOPLAY_SHIFT` must stay **smaller** than `AUTOPLAY_PERIOD`. The stop is
> just the leftover (`PERIOD - SHIFT`), so making them equal removes the stop and
> making SHIFT the bigger of the two gives a negative delay — the reel would
> then move continuously with no pause, which is not what was asked for. If you
> want a long, slow glide, raise **both**.

`AUTOPLAY_RETRY = 0.4` is not a speed. It is how often the code re-checks while
the movement is deliberately being **held**, and there are four reasons it holds:

1. **The mouse is resting on the carousel.** It stays still while you point at
   it, so a card can never slide out from under the cursor as you go to click
   it. It picks back up ~0.4s after the mouse leaves.
2. **You are dragging.** Your drag always wins; the self-advance restarts after
   you let go.
3. **A card is open** (the expand overlay). Nothing moves behind it.
4. **The intro animation has not finished yet.** The first self-move happens one
   full stop *after* the cards appear, so the first card gets its own beat.

**It never runs on mobile / narrow windows** (that layout is the native
horizontal scroller — a phone carousel that moves while you are reading it is
worse than one that waits), and it never runs for a visitor whose computer is
set to **"reduce motion"**. Both of those are on purpose.

To switch it off for everyone, set `AUTOPLAY_PERIOD = 0`. That makes the delay
between moves negative, which GSAP treats as "immediately", so it would spin
without stopping — **not** off. If you really want it off, comment out the two
`queueAutoplay()` calls instead (search the file for `queueAutoplay(` — the ones
to comment are the bare `queueAutoplay();` lines, not the one inside
`advanceOne`). Dragging keeps working exactly as before.

### ⭐ Changing what the cards SAY

Open **`planData.ts`**. It is a list of blocks, one per card, and it looks like
this:

```js
{
  label: 'SERVICE A',            // the small grey capitals across the top
  name: 'AIOps 診断',             // the big white Japanese name
  summary: '業務を工程単位で…',    // one line, only shown when the card is opened
  price: '380,000',              // digits only — the card draws the ¥ and the 〜
  priceCaption: '初回一括（税別）', // small line above the price
  specs: [                        // the three ruled rows in the opened card
    { k: '期間',     v: '4 週間' },
    { k: '対象業務', v: '5 業務まで' },
    { k: '成果物',   v: '導入ロードマップ' },
  ],
  image: '/img/services/services-dx-photo.png',  // a file in /public
},
```

Two rules, both about things not fitting:

- **Keep `name` to about 7 Japanese characters.** The desktop card is only
  ~220px wide and the text column is a little over half of that. An 8th
  character wraps to a second line — which still fits, but reads tighter.
- **Keep `specs` to exactly 3 rows.** A 4th overflows the opened card on a
  phone, where the card is only about 1.25× as tall as it is wide.

`summary` is deliberately hidden on phones — there is no room, and the specs
and the price carry the real information.

### ⭐ Changing how many cards there are

**Add or delete a block in `planData.ts`.** The carousel counts the blocks
itself (`REAL_CARD_COUNT = PLANS.length`), so there is no number to keep in
sync. **3 is fine. 1 is fine.** It is safe at any number.

(The old instruction "edit `REAL_CARD_COUNT`" is out of date — that line now
reads the length of the list for you, so editing it by hand would just make the
reel disagree with the content.)

You do **not** need to touch `MIN_REEL_CARDS`, and you should leave it alone.
Here is what it does, so the behaviour isn't a mystery:

The desktop carousel loops forever by taking the card that scrolls off one end
and teleporting it to the other end. That only looks seamless while the
teleport happens **off-screen**. With very few cards, the teleport point lands
*inside* the visible area — so you would watch SERVICE A visibly jump from the
bottom to the top. (This was invisible while the cards were identical blank
rectangles. Now that each one has its own name, price and photo, it would be
obvious.)

So if you have fewer cards than the reel needs, **the desktop reel repeats
them** to fill the gap. With 3 services the reel reads A B C A B C … as you
spin it. That is how infinite carousels normally handle a short list — you
cannot have a true endless loop with 3 items any other way.

> **DECIDED (2026-07-30): the infinite loop stays, at every card count.**
> Even with only 3 services the desktop reel must spin endlessly with no
> hard end. Seeing the same service repeat as you spin is the accepted
> cost of that, and is not a bug to "fix". Do not swap the loop for a
> finite reel with end stops just because the list is short.

| You set `REAL_CARD_COUNT` to | Desktop reel actually spins | Each card repeats |
|---|---|---|
| 1 | 12 | 12× |
| 3 | 12 | 4× |
| 5 | 15 | 3× |
| 7 | 14 | 2× |
| 12 | 12 | 1× (no repeats) |
| 20 | 20 | 1× (no repeats) |

**Mobile repeats too, but for a different reason.** It is a *native* browser
scroller (kept native so touch keeps the browser's real momentum and
rubber-banding, which hand-written dragging never matches on a phone), and a
native scroller has hard ends. So the loop is faked:

```js
const MOBILE_LOOP_COPIES = 5;
```

The real cards are laid out 5 times in a row, and whenever you scroll a full
cycle away from the middle, the scroll position is silently shifted back by
exactly one cycle. The content either side of that shift is pixel-identical,
so you cannot see it happen — you just never reach an end.

**Leave `MOBILE_LOOP_COPIES` at 5.** It must be an **odd** number (so there is
a true middle copy) and 5 leaves a full cycle of spare runway on each side.
Lowering it to 3 removes that safety margin and you may hit a real dead end on
a hard flick.

Clicking any repeat of a card opens the correct real card, so the repeats do
not confuse the expand overlay — on either layout.

| I want to… | Change this | Notes |
|---|---|---|
| More / fewer cards | `REAL_CARD_COUNT` | Safe at any number, including 1. See above. |
| How often it advances by itself (**desktop**) | `AUTOPLAY_PERIOD` | Seconds per card, `3` now. See the autoplay section above. |
| How fast each self-advance slides (**desktop**) | `AUTOPLAY_SHIFT` | Seconds of movement, `0.85` now. Must stay below `AUTOPLAY_PERIOD`. |
| Space between cards while dragging | `CARD_GAP` | In pixels. Desktop only. |
| The middle card bigger / smaller | `ACTIVE_SCALE` | `1.4` = 40% bigger. Don't go much past `1.5` — it will get cut off at the sides. |
| How much of the next card peeks in at top/bottom | `PEEK` | In pixels. Bigger = more of the neighbour visible. |
| Snap speed after you let go (**desktop**) | `SNAP_DURATION` | Seconds. `0.4` now. Lower = snappier, higher = lazier. |
| Snap "feel" (**desktop**) | `SNAP_EASE` | Try `'power2.out'` (soft) or `'back.out(1.4)'` (slight overshoot). Must stay in quotes. |
| Drag weight (**mobile/narrow**) | `MOBILE_DRAG_FOLLOW` | See below. |
| Glide speed after you let go (**mobile/narrow**) | `MOBILE_SETTLE_FOLLOW` | See below. |

### Mobile drag feel

```js
const MOBILE_DRAG_FOLLOW = 0.18;
const MOBILE_SETTLE_FOLLOW = 0.11;
```

These are **not** durations. Each is "what fraction of the remaining distance
to close each frame" — so **lower = heavier and slower, higher = snappier**.

The reel deliberately does **not** jump straight to your cursor; it eases
toward it, always slightly behind. That lag *is* the premium feel — the
reference site did the same thing, and a direct 1:1 "card follows cursor
exactly" version (which is what this used to do) feels harsh and cheap.

Current feel:

| | Value | Covers 90% of the move in |
|---|---|---|
| While dragging | `0.18` | ~200ms |
| After you let go | `0.11` | ~333ms |

Sensible range is roughly `0.08` (very heavy, syrupy) to `0.30` (nearly
instant). Below `0.05` it feels broken/laggy.

> ⚠️ **Don't "fix" this by re-enabling snap earlier.** The reason the release
> used to *hard-snap* instead of gliding is that the old code switched CSS
> `scroll-snap` back on the instant you let go, and mandatory snap yanks
> straight to the nearest card — the smooth animation never got to run.
> Snapping is now deliberately kept off until the glide has fully finished.

### Card colour

Grey, since 2026-07-31 (it used to be a flat navy `#0b1340`). It is **one
place now** — `CARD_SURFACE_CLASS` at the top of `PlanCardFace.tsx`:

```js
export const CARD_SURFACE_CLASS =
  'bg-[linear-gradient(158deg,#4B5058_0%,#33383F_44%,#232629_100%)] ring-1 ring-inset ring-white/10';
```

The desktop card, the mobile card and the opened panel all use that one value,
so changing it here changes all three at once. It is a **gradient** on purpose —
a flat grey made the reel read as a stack of identical slabs.

For a flat colour instead, replace the `bg-[...]` part with e.g. `bg-[#33383F]`.
The `ring-*` part is the hairline edge, not a drop shadow — it is drawn *inside*
the rounded corner, which a normal border cannot do here without changing the
card's size.

> ⚠️ **These have to stay CSS classes, not a `style={{ ... }}` object.** They
> were written as an inline style first and the cards came out **transparent on
> phones** — see 6.7. The underscores are how Tailwind writes a space inside
> `bg-[...]`; they are not a typo.

The text colours are the three constants just below it: `INK` (white-ish),
`MUTED` (grey), `ACCENT` (the pink square beside the label — the same pink as
the button, used once per card and nowhere else).

### Text size on the cards — why it says `cqw` and not `px`

In `PlanCardFace.tsx` the sizes look like this:

```js
fontSize: '6.8cqw',
```

**`cqw` means "percent of the card's own width".** So `6.8cqw` is 6.8% of
however wide that card happens to be. The same card is ~150px wide in a small
desktop window, ~220px on a big monitor, up to 500px on a phone, and the middle
card is additionally blown up 1.4× — a fixed pixel size that looks right on one
of those overflows or vanishes on the others. Proportions look right on all of
them.

**To make all the card text bigger, multiply every `cqw` number in `ReelFace`
by the same amount** (e.g. all ×1.1). Changing just one will make that line
overflow its column — the numbers were chosen to fill the space almost exactly.
The budget is written out in the comment at the top of the file; the tightest
line is the Japanese name.

The opened panel uses `clamp(smallest, 3.1cqw, biggest)` instead, because that
one has to work both as a wide desktop box and as a tall phone box.

### Rounded corners

`rounded-xl` on the cards. Options: `rounded-lg` (less round), `rounded-2xl`,
`rounded-3xl` (more round), `rounded-none` (sharp).

### Card and carousel size

Find the long `className={...}` on the outer `<div>` (search for `snap-mandatory`):

- **Desktop carousel column width:** `min-[901px]:w-[22vw]`,
  `min-[901px]:min-w-[220px]`, `min-[901px]:max-w-[320px]`
- **Desktop card width:** `w-[70%]` (70% of that column)
- **Mobile card width:** `w-[calc(100vw-60px)]` with `max-w-[500px]`
- **Mobile gap between cards:** `gap-[15px]`
- **Card shape:** `aspect-[16/9]` → change to `aspect-square`, `aspect-[4/3]`, etc.

> ⚠️ **The desktop carousel width and the headline size are linked.** The
> carousel sits between the two headline halves. If you make the carousel
> **wider**, the headline gets less room and the Japanese text will wrap onto
> two lines — which was explicitly rejected. If you widen the carousel, you
> must also shrink the headline font size (section 5). Check it at several
> window widths, not just maximised.

### The click-to-expand overlay

Search for `bg-black/85` — that is the dark screen behind the opened card.
`/85` means 85% opaque; `/70` would show more of the page behind.

> Do **not** make this the same navy as the card (`#0b1340`). It was that
> colour before and it made the whole screen turn navy at once, so it looked
> like a new card appeared instead of the card you clicked growing.

To close it, you click the dark background or press `Escape`. There is no X
button on purpose.

**Because there is no X button, the dark background must always be big enough
to tap comfortably.** That is what these two constants at the top of the file
control:

```js
const MOBILE_PANEL_MIN_GAP = 44;
const MOBILE_PANEL_GAP_RATIO = 0.07;
```

On mobile and narrow windows the opened card leaves a band of background on
**all four sides**, whichever of these two is bigger:

- `MOBILE_PANEL_MIN_GAP` — a hard floor in pixels. `44` is the standard minimum
  comfortable touch target (both Apple and Google land on ~44px). **Don't go
  below 44** or you're back to a strip too thin for a thumb.
- `MOBILE_PANEL_GAP_RATIO` — `0.07` = 7% of the width/height, so the gap grows
  on bigger screens instead of staying a hairline.

Want the card **bigger** (less room to tap out)? Lower the ratio, e.g. `0.05`.
Want **more** room to tap out? Raise it, e.g. `0.10`.

Resulting sizes today:

| Screen | Opened card | Tap band (sides / top-bottom) |
|---|---|---|
| iPhone SE (375×667) | 287×574 | 44px / 47px |
| iPhone 15 (393×852) | 305×733 | 44px / 60px |
| iPad portrait (768×1024) | 660×881 | 54px / 72px |
| Narrow window (600×800) | 512×688 | 44px / 56px |
| Short window (700×450) | 602×362 | 49px / 44px |

**Desktop (901px+) is separate and unchanged:** `Math.min(vw * 0.82, 1120)`,
kept at 16:9, never taller than `vh * 0.78`. It already leaves plenty of margin.

Both are in the `useLayoutEffect` that starts `if (expanded === null) return;`.

---

## 5. Headline and button — `PlansHero.tsx`

### The words

Near the top (around line 13):

```js
const TITLE_L = ['変える', '方法は、'];
const TITLE_R = ['ひとつ', 'じゃない。'];
```

`TITLE_L` is the left side, `TITLE_R` the right. Each string is one chunk that
animates in separately. Keep them **short** — long chunks will not fit beside
the carousel on desktop.

### The size

Each half has two sizes in its `className`:

- Mobile: `text-[clamp(32px,6vw,72px)]`
- Desktop: `min-[901px]:text-[clamp(28px,3.2vw,38px)]`

`clamp(minimum, scales-with-window, maximum)`.

> ⚠️ The desktop maximum is **38px on purpose** — it is small enough that both
> chunks fit on **one single line** next to the carousel. Raising it will make
> the text wrap into a stack of words, which the manager rejected. `flex-nowrap`
> and `whitespace-nowrap` are also there to force one line — leave them.

### Other colours (all in `PlansHero.tsx`)

| Thing | Value | Search for |
|---|---|---|
| Page background | `#f5f7ff` (very pale blue) | `bg-[#f5f7ff]` |
| Headline text | `#0b1340` | `text-[#0b1340]` |
| Pink button | `#FF4D6D`, hover `#E63950` | `bg-[#FF4D6D]` |

### Button text, link and position

Search for `料金について相談する` (the button label) and `href="/contact"`.

**Position (desktop):** bottom-**right**, under the end of the sentence. That is
set explicitly with `min-[901px]:col-start-3 min-[901px]:row-start-2` on the
button's wrapper `<div>`.

**If you remove those two classes the button jumps to the bottom-LEFT** — the
grid auto-places it there, which is where it used to be and looked wrong (a
button orphaned in a corner, breaking the symmetry of the text·reel·text band
above it). Bottom-right follows reading order: the sentence ends on the right,
so the CTA is the next beat after it.

To move it elsewhere, change the column: `col-start-1` = left, `col-start-2` =
centred under the carousel, `col-start-3` = right. On mobile it is always
centred, stacked between the headline and the carousel — that is not affected
by these classes.

### The small mono label

**Removed on 2026-07-30** at the user's request — there used to be a
`Plans / 料金プラン（準備中）` line in small mono type above the headline. If you
ever want it back, it was a `<p>` with
`font-mono text-xs uppercase tracking-[0.2em] text-[#6b7aa8]`, placed as the
first child inside the `max-w-6xl` wrapper, before the grid.

### Animation timings

Inside the big `useEffect`. Numbers are **seconds** unless the code says
`setTimeout` (those are **milliseconds**).

| What | Value | Where |
|---|---|---|
| Headline starts | `delay: 1` | the two `gsap.fromTo` calls |
| Gap between the chunks | `stagger: 0.07` | same calls (right side is `-0.07` on purpose — it mirrors the order) |
| Button fades in | `delay: 2.1` | the `secondary` fromTo |
| Carousel becomes draggable | `1700` ms | `armTimer` |
| Emergency "show everything" | `3000` ms | `safety` |
| Carousel's first self-advance | `1700` ms + one hold (2.15s) | set in `PlanCardStack.tsx`, not here — see section 4 |

The last one is a safety net: if the font never loads, the hero is forced
visible instead of staying blank forever. Don't delete it.

---

## 6. ⛔ DANGER ZONE — things that WILL break it

These are real bugs that already happened on this page. Each one wasted hours.

### 6.1 Never give both card branches the same `key`

```jsx
{isMobile
  ? <div key={`m-${i}`} ... />   // ← the m- prefix
  : <div key={`d-${i}`} ... />}  // ← the d- prefix
```

**Keep the `m-` and `d-` prefixes.** If both say just `key={i}`, React thinks
they are the same element and reuses the same DOM node when you resize. GSAP
writes `visibility: hidden` directly onto that node on desktop, and it carries
over to mobile — so **the whole carousel disappears the moment you resize the
window**, and only comes back on a full page reload.

**Symptom:** carousel visible at full width, gone at every other width.

### 6.2 Never put `relative` and `absolute` in the same className

The desktop card must be `absolute` only. If both words are in the list,
Tailwind picks the winner by its own internal order — **not** the order you
typed — and `relative` wins. That drops all the cards into normal page flow
where they get clipped away.

**Symptom:** carousel completely gone on desktop too.

(A responsive version like `min-[901px]:absolute` on top of a base `relative`
is fine — the `min-[901px]:` prefix guarantees it wins. Plain words do not.)

### 6.3 Don't collect the cards from refs for cleanup

In the mobile branch, the line that clears GSAP's leftover styles uses:

```js
viewport.querySelectorAll('[data-card]')
```

**Not** the `cardEls` ref list. When React switches branches it wipes those refs
to `null` first, so the ref list is empty and the cleanup silently does nothing.

### 6.4 Don't add GSAP's `InertiaPlugin`

It was tried. With no resistance set it coasts for about 10 seconds, so the
carousel drifts around on its own and never settles. The user rejected this.

### 6.5 Don't use GSAP's `Observer` for dragging

It was tried. `Observer` decides which events to listen for once when it is
imported, and because **this laptop has a touchscreen** it binds touch events
only — so the mouse never works. Symptom: drag works on a phone, completely
dead on desktop, no error in the console. Use plain
`pointerdown`/`pointermove`/`pointerup` like the current code does.

### 6.6 Full-screen heights use `dvh`, not `vh` or `svh`

`min-h-[100dvh]` / `h-[100dvh]`. `svh` leaves a gap on phones when the browser
address bar collapses.

---

### 6.7 Never put a card's colour in a `style={{ ... }}` — and never use `clearProps: 'all'`

These are the same bug from two ends. It shipped on 2026-07-31 and the symptom
was: **the cards looked white and vanished into the page background — on phones
and narrow windows only, desktop was fine.**

The mobile branch has to wipe the transforms GSAP left on the cards when the
window crosses 901px. It used to do that with:

```js
gsap.set(domCards, { clearProps: 'all' })   // ← WRONG
```

`'all'` does not mean "everything GSAP set". In GSAP's own source it is
literally `style.cssText = ""` — it erases the element's **entire** inline
style attribute, including anything React wrote there. The card's grey was an
inline style, so it was deleted the instant that line ran; and because React
still believed it had applied that style, it never put it back. The card was
left with no background at all, showing the pale hero through it.

Both halves are now fixed and both should stay fixed:

1. The colour is **CSS classes** (`CARD_SURFACE_CLASS`), which `cssText` cannot
   touch.
2. That line names the three properties it actually needs to clear:
   `clearProps: 'transform,opacity,visibility'`.

**Symptom to recognise:** an element styled from React looks unstyled on one
layout only, and it is an element GSAP also touches.

## 7. Known limitations (not bugs — just not done)

- **Mobile drag smoothness.** Reworked: the drag now eases toward the cursor
  instead of tracking it 1:1, and the release glides instead of hard-snapping
  (see "Mobile drag feel" above). Tune with the two `MOBILE_*_FOLLOW`
  constants. Not yet tested on a real phone — only a resized desktop browser.
- **The eased drag applies to the MOUSE only.** Real touch is left on the
  browser's own native scrolling, because its momentum and rubber-banding beat
  anything hand-written on a phone. So the drag can feel slightly different
  with a finger than with a mouse — that is intentional, not a bug.
- **`touch-action: pan-x` on the mobile track.** Because of this, a finger that
  lands on the carousel can swipe it sideways but **cannot scroll the page up
  and down**. Changing `touch-pan-x` to `touch-auto` would let both work. Left
  as-is for now because it was not part of the requested change.
- **The card copy is invented.** Names, prices and spec rows are placeholders
  written 2026-07-31 (three AIOps services: 診断 → 業務自動化 → データ活用).
  Nothing has been through 役員確認. Edit `planData.ts` when the real numbers
  exist.
- **The card photos are borrowed** from `/public/img`, not shot for this page.
- **Nothing exists below the hero.** No pricing table yet.

---

## 8. Troubleshooting

| Symptom | Most likely cause |
|---|---|
| Carousel visible at full width, disappears at other widths | The `key` prefixes (6.1) |
| Carousel gone everywhere on desktop | `relative` + `absolute` clash (6.2) |
| Change did nothing | You didn't hard-reload — `Ctrl + Shift + R` |
| Whole page blank / carousel missing and nothing in the code looks wrong | Zombie dev server. Close all PowerShell windows running `npm run dev`, reopen one, run it again. This is a known recurring problem on this machine. |
| Headline wrapped into a stack of words on desktop | Font size too big, or carousel too wide (section 5 warning) |
| Drag works on phone but not desktop | Something switched to GSAP `Observer` (6.5) |
| Cards drift on their own and won't stop | `InertiaPlugin` got added back (6.4) |
| Desktop carousel never moves on its own | Mouse is resting on it (it holds while you point at it — move the cursor away), or the computer is set to "reduce motion", or the window is under 901px wide. All three are intended. |
| Desktop carousel slides without ever stopping | `AUTOPLAY_SHIFT` was set equal to or above `AUTOPLAY_PERIOD`, or `AUTOPLAY_PERIOD` was set to `0` to "turn it off" (section 4). |
| You can see a card visibly jump/teleport from one end to the other while dragging on desktop | Not enough cards in the reel. Someone lowered `MIN_REEL_CARDS` (section 4). Put it back to 12. |
| Horizontal carousel hits a dead end / stops scrolling | `MOBILE_LOOP_COPIES` was lowered, or made an even number. Put it back to 5. |
| Same card appears more than once on desktop | That is intentional when there are only a few services — see section 4. Not a bug. |
| Card text runs off the edge of the card | A `cqw` number in `PlanCardFace.tsx` was raised on its own. They are sized to fill the column almost exactly — raise them together or not at all (section 4). |
| A card name wrapped onto two lines | `name` in `planData.ts` is longer than ~7 Japanese characters. |
| Japanese text shows as `æ´»ç"¨` garbage | File got saved in the wrong encoding. Run `node scripts/check-encoding.mjs`. |

---

## 9. Git

This page lives on the branch **`features/plans-page`** and is **not merged
and not deployed**. Nobody outside can see it.

Useful commands:

```
git status                  # what you changed
git diff                    # the actual changes, line by line
git checkout -- <file>      # THROW AWAY your changes to one file
git stash                   # park all changes (get them back with: git stash pop)
```

If you break something badly and want to start over on one file, use
`git checkout -- <file>` — but be aware that only restores it back to the last
**commit**, and much of this page may still be uncommitted.

To see the live site branch instead, that is `dev`, which auto-deploys.

---

## 10. Related docs

- `docs/plans-page-hero-animation.md` — the original reference site
  (madewithgsap.com) decoded: exact values and what was deliberately not copied.
- `docs/plans-page-plan.md` — earlier planning notes. **Draft only**, the
  "roadmap spine" idea in it was never approved.
