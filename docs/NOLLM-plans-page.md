# NOLLM — /plans page manual (edit it yourself, no AI needed)

This is a plain-English manual for the **/plans page hero and its card grid**.
It is written so you can change things by hand, without asking an AI.

**Everything below is a real value copied from the real code**, not an example.

> **The carousel was removed 2026-07-31** on manager feedback: visitors must
> see the plan cards immediately on landing, with zero interaction — no
> dragging, no clicking to expand. The old carousel files
> (`PlanCardStack.tsx`, `PlanCardFace.tsx`) are still on disk, untouched and
> unimported, in case it is ever wanted back — they represented a lot of
> work. This manual now describes the plain static grid that replaced it.

---

## 1. The files

| File | What it holds |
|---|---|
| `src/app/plans/page.tsx` | The page itself. Fonts + metadata (page title / description), plus the card grid section below the hero. |
| `src/app/plans/_components/PlansHero.tsx` | The headline text, the background colour, the intro animation timings. (The pink button used to live here too — since 2026-07-31 it is on each card instead.) |
| `src/app/plans/_components/PlanCard.tsx` | **The card.** One static card, everything visible at once — no interaction — including its own pink CTA button. |
| `src/data/plans.ts` | **The words and prices on the cards.** One block per service. This is the file to edit for copy changes. Lives in the shared `src/data/` folder (next to `company.json`, `members.json` …) because the contact page reads it too — see section 3. |
| `src/app/plans/_components/PlanCardFace.tsx` | Retired carousel card layout. Kept on disk, no longer imported by the page — only `CARD_SURFACE_CLASS` (the card's grey background) is still reused, by `PlanCard.tsx`. |
| `src/app/plans/_components/PlanCardStack.tsx` | Retired carousel (drag, autoplay, click-to-expand). Kept on disk, no longer imported by the page. Do not delete either retired file — they stay revivable. |

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

## 3. Cards — what you can change

### ⭐ Changing what the cards SAY

Open **`src/data/plans.ts`**. It is a list of blocks, one per card, and it
looks like this:

```js
{
  slug: 'aiops-diagnosis',       // ⚠️ the link ID — see the warning below
  label: 'SERVICE A',            // the small grey capitals across the top
  name: 'AIOps 診断',             // the big white Japanese name
  summary: '業務を工程単位で…',    // one line of body copy, ALWAYS shown
  price: '380,000',              // digits only — the card draws the ¥ and the 〜
  priceCaption: '初回一括（税別）', // small line above the price
  specs: [                        // the three ruled rows on the card
    { k: '期間',     v: '4 週間' },
    { k: '対象業務', v: '5 業務まで' },
    { k: '成果物',   v: '導入ロードマップ' },
  ],
  image: '/img/services/services-dx-photo.png',  // a file in /public
},
```

The old "keep `name` to about 7 Japanese characters" guidance is **gone**. It
existed because the carousel's card was only ~220px wide on desktop; the grid
card is a fixed ~380px, with far more room, so a longer name is fine.

> ⚠️ **`slug` is not display text — do not translate it or tidy it up.** It is
> the ID that travels in the card button's link (`/contact?plan=aiops-diagnosis`)
> and it is how the contact page knows which service to write into the message.
> You can reword `label`, `name`, `summary`, the prices and the specs as freely
> as you like; changing a **slug** breaks any link to that plan that is already
> out in the world (in an email, a chat message, an ad). If you add a new
> service, give it a new lowercase-with-hyphens slug that no other block uses.

The one rule that still applies:

- **Keep `specs` to exactly 3 rows.** The card is laid out with those three
  hairline-ruled rows in mind; a 4th would still technically fit but was never
  designed for.

`summary` is now **always visible** — it used to be hidden on phones and only
shown when a carousel card was opened. There is no hidden/open state any
more, so it always prints under the name.

### ⭐ Changing how many cards there are

**Add or delete a block in `src/data/plans.ts`.** The grid draws one card per block
(`PLANS.map(...)` in `page.tsx`), so there is no count to keep in sync
anywhere. Any number works — the grid just gets more or fewer cards.

### ⭐ Changing the number of columns

In **`page.tsx`**, find the grid section below `<PlansHero />` and look for:

```jsx
<div className="grid grid-cols-1 gap-6 min-[901px]:grid-cols-3">
```

- `grid-cols-1` — always one column on narrow windows (phones), cards
  stacked vertically.
- `min-[901px]:grid-cols-3` — three columns from 901px and up. Change the `3`
  to `2` or `4` for a different desktop column count. `gap-6` is the space
  between cards, in both directions.

### ⭐ Card colour

Grey, since 2026-07-31 (it used to be a flat navy `#0b1340`). It is set in
**`CARD_SURFACE_CLASS`**, still defined at the top of `PlanCardFace.tsx` and
imported from there by `PlanCard.tsx` (the retired file is kept around
specifically so this one shared value doesn't have to be copied):

```js
export const CARD_SURFACE_CLASS =
  'bg-[linear-gradient(158deg,#4B5058_0%,#33383F_44%,#232629_100%)] ring-1 ring-inset ring-white/10';
```

It is a **gradient** on purpose — a flat grey made a row of cards read as a
stack of identical slabs.

For a flat colour instead, replace the `bg-[...]` part with e.g. `bg-[#33383F]`.
The `ring-*` part is the hairline edge, not a drop shadow — it is drawn *inside*
the rounded corner, which a normal border cannot do here without changing the
card's size.

> ⚠️ **This has to stay a CSS class, not a `style={{ ... }}` object.** It was
> written as an inline style once and the cards came out **transparent on
> phones** (see the old carousel's post-mortem, still written up in
> `PlanCardFace.tsx`'s comments, for why). The underscores are how Tailwind
> writes a space inside `bg-[...]`; they are not a typo.

The text colours are three constants near the top of `PlanCard.tsx`: `INK`
(white-ish), `MUTED` (grey), `ACCENT` (the pink square beside the label — the
same pink as the button, used once per card and nowhere else).

### Text sizes on the card

`PlanCard.tsx` uses plain pixel sizes (`fontSize: '22px'`, `'13px'`, etc.), not
the carousel's `cqw` proportional units. The carousel needed `cqw` because the
same card had to look right across a 3× range of widths (a small reel card up
to a 1.4×-scaled spotlight card). A grid card has one stable width per
breakpoint, so plain px is correct here and much easier to hand-edit — just
change the number.

### Rounded corners

`rounded-xl` on the card (in `PlanCard.tsx`, on the outer `<article>`).
Options: `rounded-lg` (less round), `rounded-2xl`, `rounded-3xl` (more round),
`rounded-none` (sharp).

### Photo band shape

`aspect-[16/10]` on the photo `<div>` near the top of `PlanCard.tsx`. Change to
`aspect-video` (16:9), `aspect-[4/3]`, etc.

---

### ⭐ The card button, and what it fills in on the contact form

Every card has its own pink button at the bottom, reading
「このプランを相談する」. Search for that text in **`PlanCard.tsx`** to change
the wording, and for `bg-[#FF4D6D]` to change the pink.

Clicking it goes to the contact page **and fills two things in for the
visitor**, so they don't have to describe what they were looking at:

1. The 「お問い合わせ種別」 dropdown is set to 「AIOps事業について」.
2. The message box is pre-written with the service's name and its description,
   like this:

```
「AIOps 診断」（SERVICE A）に興味があります。

■ サービス内容
業務を工程単位で棚卸しし、AI と自動化に置き換えられる範囲を洗い出します。

詳細なご説明とお見積もりをお願いいたします。
```

The visitor can edit or delete any of it before sending — it is an ordinary
message box, just not an empty one.

**Where each piece comes from:** the name and the description are read live out
of `src/data/plans.ts`, so if you reword a service there, the pre-written
message follows automatically. The sentences *around* them (「…に興味があります。」
and 「詳細なご説明とお見積もりをお願いいたします。」) are in
**`src/app/contact/page.tsx`** — search for `に興味があります` to reword them.

**The price is deliberately NOT included.** The figures are still placeholders
that have not been through 役員確認, and a price quoted inside a message the
customer appears to have written themselves reads like a commitment. Ask if you
want it added once the real numbers exist.

---

## 4. Headline — `PlansHero.tsx`

### The words

Near the top (around line 14):

```js
const TITLE_L = ['変える', '方法は、'];
const TITLE_R = ['ひとつ', 'じゃない。'];
```

`TITLE_L` is the first half of the sentence, `TITLE_R` the second. They render
as one continuous, centred line: 「変える方法は、ひとつじゃない。」. Each
string in an array is one chunk that animates in separately.

### The size

One size now, at every window width:

```js
text-[clamp(32px,5.5vw,64px)]
```

`clamp(minimum, scales-with-window, maximum)`. There is no longer a separate,
smaller desktop cap — that used to exist only to leave room for the carousel
that sat beside the headline. Since the carousel is gone, the headline is free
to run as large as any other page's hero heading.

The headline will only ever line-break **between** `TITLE_L` and `TITLE_R` —
never inside one of them (each half is `flex-nowrap`, so its own words stay
glued together; only the space between the two halves is allowed to wrap).

### Other colours (all in `PlansHero.tsx`)

| Thing | Value | Search for |
|---|---|---|
| Page background | `#f5f7ff` (very pale blue) | `bg-[#f5f7ff]` |
| Headline text | `#0b1340` | `text-[#0b1340]` |

(The pink button is no longer in this file — it moved onto each card. See
section 3.)

> The `#f5f7ff` background must stay the same in `PlansHero.tsx` AND in the
> grid `<section>` in `page.tsx` — they sit back to back with no colour seam
> between them. If you change one, change the other.

### The small mono label

**Removed on 2026-07-30** at the user's request — there used to be a
`Plans / 料金プラン（準備中）` line in small mono type above the headline. If you
ever want it back, it was a `<p>` with
`font-mono text-xs uppercase tracking-[0.2em] text-[#6b7aa8]`, placed as the
first child inside the `max-w-6xl` wrapper, before the headline.

### Animation timings

Inside the big `useEffect`. Numbers are **seconds** unless the code says
`setTimeout` (those are **milliseconds**).

| What | Value | Where |
|---|---|---|
| Headline starts rising + fading in | `delay: 0.35` | the `gsap.fromTo` call on the word spans |
| Gap between each word | `stagger: 0.07` | same call |
| Emergency "show everything" | `3000` ms | `safety` |

The last one is a safety net: if the font never loads, the hero is forced
visible instead of staying blank forever. Don't delete it.

The hero used to also arm a carousel's drag interactivity on its own timer
(`armTimer`, 1700ms). That is gone along with the carousel — nothing in the
hero waits on anything below it any more.

---

## 5. dvh, not vh or svh

This still applies anywhere a full-screen cover or hero is built on this site
(the standing rule, not specific to this page): use `dvh`, never `vh` or
`svh`. `svh` leaves a gap on phones when the browser address bar collapses.

The /plans hero itself is **no longer full-screen** — it is a compact band
(`px-4 py-20 md:px-6 lg:px-8 lg:py-24`, no min-height) sized to its own
content, specifically so the card grid below it is visible without scrolling
on a normal screen. There is nothing `dvh`-sized on this page any more, but if
you ever add a full-bleed section back, use `dvh`.

---

## 6. Known limitations (not bugs — just not done)

- **The card copy is invented.** Names, prices and spec rows are placeholders
  written 2026-07-31 (three AIOps services: 診断 → 業務自動化 → データ活用).
  Nothing has been through 役員確認. Edit `src/data/plans.ts` when the real numbers
  exist.
- **The card photos are borrowed** from `/public/img`, not shot for this page.

---

## 7. Troubleshooting

| Symptom | Most likely cause |
|---|---|
| Change did nothing | You didn't hard-reload — `Ctrl + Shift + R` |
| Whole page blank and nothing in the code looks wrong | Zombie dev server. Close all PowerShell windows running `npm run dev`, reopen one, run it again. This is a known recurring problem on this machine. |
| A card name wrapped awkwardly | `name` in `src/data/plans.ts` — try shortening it, or widen the card via the grid column count (section 3). |
| Card text runs off the edge of the card | A pixel size in `PlanCard.tsx` was raised too far — the card's own width is fixed, so unlike the old carousel there's no proportional scaling to fall back on. |
| Japanese text shows as `æ´»ç"¨` garbage | File got saved in the wrong encoding. Run `node scripts/check-encoding.mjs`. |
| Cards read as a stack of grey slabs with no card-to-card separation | Check `gap-6` in the grid's `className` in `page.tsx` hasn't been removed. |
| A whole card looks unstyled / transparent | `CARD_SURFACE_CLASS` was changed to an inline `style={{ ... }}` — it must stay a CSS class (section 3). |

---

## 8. Git

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

## 9. Related docs

- `docs/plans-page-hero-animation.md` — the original carousel reference site
  (madewithgsap.com) decoded: exact values and what was deliberately not
  copied. Only relevant now if the carousel is ever revived.
- `docs/plans-page-plan.md` — earlier planning notes. **Draft only**, the
  "roadmap spine" idea in it was never approved.
