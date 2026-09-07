# /plans — Knowledge Harness redesign spec ("the harnessing")

2026-09-07 · branch `redesign/knowledge-harness` · replaces the static 2026-08-18 build.

**Rev 4 (2026-09-07, evening):** rev 1 (word-fragment lattice), rev 2 (filaments of light →
ruled lines) and rev 3 (a live three.js glass orb, re-created because the reference clip was
a third party's file) were all rejected. The manager then supplied `designpro-background-kit`
— the approved animated background as a licensed 6 s H.264 loop — so the field is now "the
light": that loop, mirrored, played on a fixed plate behind the whole page. No WebGL is left
on this route. Hero, sections, and the bus contract are unchanged. See the Field section.

Every string on the page still comes from `src/app/plans/_components/khContent.ts`
(manager copy, real prices). This redesign adds motion and layout only; it adds
no content (rev 1's decorative word list is gone with rev 2).

## Idea

A harness gathers loose lines into one controlled bundle. The product gathers
scattered company knowledge into one structured memory. The page shows exactly
that, once, as its hero — and then every section below has its own, different
kind of motion. Nothing on this page reuses a mechanism from `/`, `/company`,
`/services/aiops` or `/services/ai-training` (no fluid, aurora, plasma, liquid,
terrain, Spline shapes, typewriter, focus band, deck, slot, transfer) — and
not the rev-1 text-fragment lattice or the rev-2 ruled lines either.

Palette = the site's navy pages: ground `#0b1020`, paper `#f3f1eb`, blue
`#2563eb`, blue-light `#6d9bff`. Type = Poppins 700 for the Latin name and
figures, Noto Sans JP 300/500/800 for everything Japanese. Same tokens as
ai-training, `kh-` prefixed, so the two product pages read as siblings.

## Sections → mechanism (one KIND per section)

| # | Section | id | Mechanism | Ground |
|---|---|---|---|---|
| 0 | Field | — | **the light** — a fixed video plate behind the whole page (`KhField`): the manager's approved background loop, mirrored so its turning ribbon of light keeps the right and its black corner keeps the left. Always playing, everywhere. State = `order` 0→1 (the frame settles and the light is drawn off the centre) and `veil` (dimmed to a ghost under the sections) | — |
| 1 | Hero | `#hero` | **the harnessing** — pinned; land is the loop at full strength behind the giant name, then scrolling settles the frame and gathers the light off the centre. Once gathered, the name yields to the coda「導入後の変化 / AIが全社の記憶を持って動く。」 | navy |
| 2 | Features | `#features` | **the index** — pinned cabinet of six drawers, one per feature. Closed drawers are a column of giant verbs (はじめやすい / 貯まる / 見つかる / 標準セット / 広がる / 守れる); scrolling walks the open drawer down the stack, heights and type sizes interpolate | navy |
| 3 | Pricing | `#pricing` | **折半 — the fold** — the ledger (216 + 38 + 45 = 299) typeset plainly, then the 299万円 sheet folds in half on a hinge as you scroll; the back of the flap carries 149.5万円・実質半額 with its condition. Half the sheet, half the price. No strikethrough | paper (the one light section) |
| 4 | Glossary | `#glossary` | **the marker** — the definition of Claude Team Standard is fully visible; a highlighter sweeps through it character by character with the scroll | navy |
| 5 | Support | `#support` | **the companion (伴走)** — sticky head on the left, a vertical rail with a mark that stays level with the reader while the five items scroll past; the item beside the mark is lit | navy |
| 6 | CTA | `#cta` | **the bookend** — the veil lifts and the loop comes back out of the ghost (the memory base "moving"); copy rises in with a scrub | navy |

Shared, allowed repeats (same as ai-training): section label rule grows + text
slides; h2 line rises out of its mask. Hero load intro = masked rises.

## Field (`KhField.tsx`, `fieldBus.ts`) — "the light" (rev 4)

Rev 1 (word fragments → a text lattice), rev 2 (filaments of light → ruled
lines) and rev 3 (a live three.js glass orb, re-creating a reference clip we
had no licence to) were all rejected on 2026-09-07. Rev 4 stops re-creating
anything: the manager supplied `designpro-background-kit`, an integration kit
built around **the approved animated background itself** — a 6 s / 60 fps
H.264 loop, 1924 × 1076, 3.2 MB, no audio, moov atom already at the front — and
the field now just plays it.

So there is **no WebGL on this page any more**: no `useWebGLAvailable` probe,
no renderer, no `makeSafeRenderer`, no context-loss path, no three.js in the
route's bundle. `khOrb.ts` is deleted.

### The asset

- `public/videos/kh-field.mp4` — the loop.
  `/videos/` (plural) on purpose: `next.config.js` gives only that prefix the
  `Accept-Ranges` + dev `no-store` headers a looping `<video>` needs, and
  `/video/*.mp4` does not have them (ERR_CACHE_OPERATION_NOT_SUPPORTED).
- `public/img/kh-field-poster.jpg` — the kit's poster, 50 KB. It is the
  `<video poster>`, so `object-fit`/`object-position` crop it exactly like the
  frames: it is the first paint, the reduced-motion still, AND the fallback if
  the loop never loads. There is no separate fallback state.

### The plate (`KhField.tsx`)

Inside the fixed `.kh-field` box, painted in DOM order (1 nests 2, which
holds the `<video>`):

1. `.kh-field__media` — the parallax box. Bleeds 110 px past the plate top and
   bottom; KhField writes its `translate3d` directly (clamped to 100 px), NOT
   through a custom property — an unregistered custom property on `.kh-field`
   invalidates the whole subtree's computed style, which would re-resolve the
   settle box's `filter()` every scroll frame for nothing.
2. `.kh-field__zoom` — the settle box. `scaleX(-1) scale(1.08 − 0.08·order)`
   plus `brightness(1 − 0.13·order) saturate(1.02 − 0.1·order)`.
   **`scaleX(-1)` is the whole framing decision**: as shot, the loop's mass of
   light turns through the left and centre of the frame and the right stays
   black — the exact half the giant name needs. Mirrored, the black corner
   lands under the kicker and KNOWLEDGE / HARNESS, and the light turns through
   the empty right. Desktop `object-position: 50% 50%` (at 16:9 the crop keeps
   ~90% of the width, so the value does almost nothing there); phone `27% 50%`,
   which picks the band carrying the arc high in the frame — a phone keeps only
   ~26% of the width, and the copy sits at the BOTTOM there, so the light
   belongs in the empty top half.
3. `.kh-field__scrim` — the fixed composition. A light left column of ink
   (0.82 → 0) as insurance for the frames where the tail swings back across,
   top and bottom bands for the fixed header and the scroll cue, and last the
   kit's own 14% shade tinted to this page's ink instead of pure black. On a
   phone it becomes a vertical scrim instead, because the copy is centred.
4. `.kh-field__focus` — **the harnessing**, and the one thing the hero's scroll
   does to the light: a centred radial ink wash at `0.62·order` (0.68 on a
   phone) draws the light off the centre and leaves it as a rim, so the coda
   takes a clean field. Land (order 0) is the loop at full strength — that is
   the first impression; order 1 is the light gathered and contained.
5. `.kh-field__veil` — the ground under the sections.

### The bus (contract UNCHANGED, so KhScroll and every section stay as they are)

- `order` → `--kh-o` on `.kh-field`; everything above is a `calc()` off it.
- `veil` → the veil's opacity, `0.85 · veil`, lifted to `0.55` under the CTA.
  One element written at two speeds: the hero's scrub sets
  `transition-duration: 0ms` (easing there would lag the reader's finger), the
  CTA's toggle sets `700ms`. They never overlap, so **there is no rAF loop and
  no eased `ctaMix` in this component at all**.
- `scrollY` → the parallax translate.
- `cta` → lifts the veil for the bookend, and nothing else. `heroActive` is
  accepted and ignored — the bus method stays because KhScroll still reports it.

**Playback never stops** (the user's call after seeing rev 4). There is no
scroll gating and no visibility gating: a `pause` listener puts the loop
straight back, so a background tab, an OS interruption or a hydration hiccup
self-heals, and `visibilitychange` only ever kicks it (never pauses). The one
thing that holds it is `prefers-reduced-motion`, where the whole page is static
anyway. The `pause` listener MUST be removed before the cleanup's `pause()` or
the teardown restarts the video. Under the sections the loop keeps turning
beneath the 85% veil — dimmed, not stopped.
- Reduced motion: `--kh-o` 1, veil 1, never played, no parallax; CSS also drops
  the settle and the focus wash so the still frame sits at its natural size.
- `gift:logo-ready` on the video's `loadeddata`, its `error`, or a 900 ms cap
  (the hero intro waits on it; KhScroll's own cap is 2.4 s).

Nothing here measures or resizes — `object-fit: cover` does it, so the
ViewportFreeze resize gate the orb needed is gone too. The box stays fixed at
`100lvh` (not `inset: 0`, which on phones follows the address bar and re-crops
the video on every scroll).

### No playback control

The kit ships an optional pause/play button. It is not used: it is a floating
circle that reads as generic product UI on an editorial page, and every other
decorative background on this site (the HP fluid sim, the aurora, Plasma) is
likewise unpausable. `prefers-reduced-motion` is honoured instead.

## Hero (`KhHero.tsx`)

Sticky stage (`--svh-frozen`) + spacer 2.2 × `--vh-frozen`. Progress p over the
section (top top → bottom bottom):

- kicker top-left: rule + ナレッジハーネス (stays)
- `[data-hero-block]`: `KNOWLEDGE` / `HARNESS` (two lines, Poppins 700,
  `clamp(56px, min(15vw, 26vh), 300px)`, the biggest writing on the page), then
  the JP headline 社内の知識を「全社の記憶基盤」に with the bracketed phrase
  800/blue-light, then HERO.body at 300 weight, max 30em.
  - p 0.56→0.72: opacity 1→0, y 0→−48
- `[data-hero-coda]` (centred): mono label 導入後の変化 + statement
  AIが全社の記憶を持って動く。`clamp(30px, 4.6vw, 72px)` 800 paper
  - p 0.66→0.84: opacity 0→1, y 56→0
- field order = smoothstep(0.02, 0.6, p)
- scroll cue bottom-centre, hidden on first scroll
- Load intro: `[data-hero-in]` masked rises (yPercent 112 → 0, expo.out,
  stagger 0.07) started on `gift:logo-ready` or a 2.4 s cap. KhField fires
  that event after its first draw.

## Index (`KhFeatures.tsx`)

Sticky stage + spacer 2.6 × vh. Inside: KhHead (Features / できること) then the
cabinet: a flex column that fills the rest of the stage.

- six `.kh-drawer[data-drawer]` with `--open` 0..1 set by KhScroll
- `flex-grow: calc(1 + 3.8 * var(--open))`, `min-height: 52px`, hairline top
- closed: verb (kicker) `clamp(18px, 2.4vw, 32px)` 800 paper at left; title
  300 muted at right (nowrap, ellipsis on phones)
- open: verb `clamp(34px, 4.4vw, 62px)` blue-light, title 800 20px + body 300
  15px slide up into view (opacity/translate from `--open`)
- p → a = k + smoothstep(0.3, 0.7, f) where k = floor(p·5), f = frac —
  plateaus so each drawer holds open; open_i = 1 − clamp(|a − i|, 0, 1)
- reduced motion: no pin, every drawer open, stacked

## Pricing (`KhPricing.tsx`) — the one paper section

1. KhHead (Pricing / 料金) + lead
2. 月額 9万円 headline row with termNote (static)
3. the ledger: three rows (item / detail / amount) + 合計 299 — plain dl, blue rule
   above the total
4. **the fold** `.kh-fold`: sticky (`top: header + 24px`) for a 1.1 × vh spacer.
   Sheet height `min(58vh, 560px)`, perspective 1600px.
   - top half `.kh-fold__top`: the giant `299` 万円 (Poppins 700
     `clamp(120px, 22vw, 320px)`) centred on the FULL sheet, clipped to its
     upper half; label 2年間フルセット合計 top-left
   - flap `.kh-fold__flap` (bottom half, `transform-origin: top`,
     `rotateX(−θ)`, θ 0→180° = smoothstep of the spacer progress):
     - front face: the lower half of the same 299 (clone, translated −50%)
     - back face (pre-rotated 180°, paper a shade darker): mono condition
       「補助金の交付を受けた場合」→ label お客様の実質負担 → `149.5` 万円 +
       実質半額 aside (blue) → subsidy body 14px
   - shading: front overlay opacity sin(θ)·0.5 for θ<90; back overlay
     0.45→0 for θ 90→180; a soft shadow on the top half grows with θ
   - the condition is on the same face as the figure it qualifies — never
     separated (khContent rule)
5. taxNote

Reduced motion: no sticky, flap shown folded (θ=180) — the 149.5 face — and
the 299 stays readable in the ledger above.

## Glossary (`KhGlossary.tsx`)

Two columns: left, `.kh-label` Glossary + the term `Claude Team Standard`
(Poppins 700 `clamp(26px, 3vw, 44px)`) with とは in JP 300; right, the body as
character spans `.kh-mark__c`. KhScroll toggles `is-on` (blue 26% background,
`box-decoration-break: clone`) over trigger body top 78% → bottom 42%.

## Support (`KhSupport.tsx`)

Grid `minmax(0,4fr) 40px minmax(0,8fr)`; left sticky KhHead + lead; middle the
rail (1px line, full height) with `.kh-support__mark` `position: sticky;
top: 50%` (a 10px paper dot with a 24px tick); right the five items
`.kh-support__item[data-support-item]`, title 800 `clamp(19px,1.6vw,24px)`,
detail 300 15px, hairline between. KhScroll: each item gets a trigger
start `top 58%` end `bottom 42%` toggling `is-here` (paper vs 40% muted).
Phone: single column, rail hidden, items at full contrast.

## CTA (`KhCta.tsx`)

Transparent navy, min-height svh-frozen, `[data-cta-rise]` y 110→0 scrub over
top bottom → top 25%; a toggle trigger drives `field.setCta`. Lead + `cta-btn
cta-btn--kh` (paper outline, blue fill on hover — the site's directional
button). No second hover effect on top of CtaHoverHydrator.

## Page plumbing

- `page.tsx`: metadata unchanged; `<main className="kh-page" data-flash-guard="">`
  → `<KhField/>` `<KhHero/>` `<KhFeatures/>` `<KhPricing/>` `<KhGlossary/>`
  `<KhSupport/>` `<KhCta/>` `<KhScroll/>`; `<div className="kh-footer"><Footer/></div>`;
  `import './plans.css'`.
- `loading.tsx`: fixed `#0b1020` overlay, no skeleton.
- No fallback state: the loop's own poster is the fallback (see the Field section), so `data-kh-fallback` and its CSS are gone.
- Flash guard: `.kh-page[data-flash-guard] > * { visibility: hidden }` +
  `::after` navy cover; KhScroll releases it in a rAF at the end of its effect.
- Lenis desktop only (≥900px); ScrollTrigger.refresh on `gift:vh-frozen-change`
  and `fonts.ready`.
- Viewport units: fills use `var(--svh-frozen)`, budgets `var(--vh-frozen)`.
- Dead code removed: `PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx`
  (unimported since 2026-07-31). `src/data/plans.ts` keeps only what
  `/contact` reads.
- Nav label 料金プラン and the `/plans` route are left as they are (flagged
  separately: the label promises a price list, the page is a product page).
- Mobile (≤899px): stages align to flex-start with `padding-top: header + 16px`;
  name `clamp(44px, 18.5vw, 96px)`; cabinet open grow 5.2; fold sheet
  `min(56vh, 480px)`; support single column.

## Verification

`npx tsc --noEmit` (never `next build` while the user's dev server is up).
Probe on the user's server at 127.0.0.1:3000 only when asked.
