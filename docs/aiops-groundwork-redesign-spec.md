# /services/aiops redesign — "Groundwork" (2026-09-07, night)

Branch: `redesign/knowledge-harness` (working tree, alongside the uncommitted /plans rev 4 —
the file sets are disjoint). Author: Fable. Copy untouched: every string from the old
`DxV3Page.tsx` constants now lives in `_components/aoContent.ts`; only the decorative numbering
("05 — エージェント事例", "Q.01"…) and the mono meta blocks were dropped.

User direction (2026-09-07 evening, verbatim intent): redesign /services/aiops; scrolling
animation; the site must feel smooth from section to section; Awwwards-worthy; the hero may
change; **the hero is the background now**, so whatever is built must fit the page theme; be
creative; similar style to the other pages.

What was on disk before this pass: HEAD (08dc2f5) plus an uncommitted diff that had already
removed the Spline shape cluster and the stats pillars from the old page. That diff is gone with
the old page (the whole file is replaced).

---

## 1. The idea — 根づく, so the ground is the subject

The page's copy is about AI taking root (根づく) once the company's knowledge is *arranged*
(整える). The hero's liquid — the manager-approved loudsrl "Balatro" paint, navy / indigo /
periwinkle — becomes the ground of the whole page: one fixed plate behind everything, like the
plasma on /services/ai-training and the light on /plans. Then the scroll works the ground itself:

- **Hero**: the liquid is at full turbulence (the approved preset). The pinned scene pulls the
  camera back into it (`u_zoom` 4 → 2.4) and *calms* it (`spinSpeed` 2 → 0.7, `contrast`
  5.5 → 3.6) while the four stanzas of the statement come up out of the depth. Chaos → order.
- **Sections**: a navy veil (0.82) over the calmed ground — the writing is the focus, the liquid a
  slow pulse behind it.
- **Thinking** (the thesis) is the one paper sheet.
- **CTA**: the veil lifts (0.5) and the liquid *speeds up again* (`spinSpeed` → 2.6): 「AIは会社の中で
  動き始めます」— it starts moving. The bookend pays off the hero.

No HP set piece is reused (no aurora, no fluid sim, no giant AI OPS rise). The title system is the
services convention (giant Poppins name + JP line), set as **AI / Ops.** — this page's own voice,
not the HP's all-caps word.

## 2. Structure (files)

```
page.tsx            metadata (unchanged text) + <main class="ao-page" data-flash-guard>
                    AoField · AoHero · AoCaps · AoPains · AoSteps · AoAgents · AoThinking · AoCta · AoScroll
                    <div class="ao-footer"><Footer/></div>
aiops.css           the page stylesheet (replaces dx-v3.css)
loading.tsx         unchanged (#0B1020 sheet)
_components/
  aoContent.ts      every string
  fieldBus.ts       AoField ⇄ AoScroll contract (setScene / setVeil / setCta / setActive)
  AoField.tsx       the fixed plate: dynamic R3F canvas + veil; error boundary; ready event
  AoLiquidCanvas.tsx  <Canvas> via makeSafeRenderer (context-loss blocker first), fov 1 camera
  AoLiquidScene.tsx   the Balatro ShaderMaterial (verbatim shader) + scroll-modulated targets
  AoHero.tsx        the scene: pinned frame, title, JP line, CTA, cue, the four stanzas
  AoHead.tsx        shared section head (label rule + h2 mask rise) — the only repeated motion
  AoCaps.tsx        the dial
  AoPains.tsx       the pile
  AoSteps.tsx       the flip board
  AoAgents.tsx      the fill
  AoThinking.tsx    paper sheet: marquee + the arrangement
  AoCta.tsx         bookend
  AoScroll.tsx      orchestrator (Lenis desktop, every ScrollTrigger, flash-guard release)
  CapLottie.tsx     kept (the six capability Lotties)
```

Deleted: `DxV3Page.tsx`, `dx-v3.css`, `ColorBends.tsx`, `LiquidHero.tsx` (old raw-WebGL1 port,
orphaned since June), `LiquidHeroBackground/Canvas/Scene.tsx` (superseded by AoField/AoLiquid*),
`AtomViewer.tsx`, `RiveHero.tsx` (orphans). The VAT/GiftLogoFluid files stay — `/dev/*` pages
import them.

Nav: `navTheme.ts` → `/services/aiops` now uses a navy theme (same values as ai-training).
The `#page-cover` dark-route list in `layout.tsx` already contains this route.

## 3. The plate (`AoField` + `AoLiquidScene`)

- `.ao-field` fixed, `100lvh` (not inset:0 — the phone address bar), z 0; every sibling z 1.
- Shader byte-for-byte the loudsrl Balatro (see the June memory). Preset 0 kept:
  `#0B1020 / #4F6AF0 / #BFCCFA`, contrast 5.5, lighting 0.42, spinSpeed 2, spinAmount 0.25,
  effectDepth 10. Entry = the approved zoom-in settle (`u_zoom` 100 → 4, 0.2/frame for 2 s).
- Scroll modulation, all lerped in `useFrame` (0.08/frame) toward targets the bus sets:

  | target | hero p=0 | hero p=1 | CTA |
  |---|---|---|---|
  | zoom | 4.0 | 2.4 | 2.4 |
  | spinSpeed | 2.0 | 0.7 | 2.6 |
  | contrast | 5.5 | 3.6 | 4.4 |

- Render scale: dpr capped 1.5 desktop, 1 phone; frameloop always (the page is the plate).
- `setActive(false)` when the tab is hidden → frameloop paused via `invalidate` gating.
- Fallback (no WebGL / context lost / boundary): `.ao-field` paints a navy radial bloom; the page
  is fully readable. `gift:logo-ready` fires after the 3rd frame or after 2.2 s, whichever first.

## 4. Sections and their mechanisms — one KIND each

| section | mechanism | kind | budget |
|---|---|---|---|
| Hero + statement | **the surface** — title recedes into the paint; the liquid's own uniforms are scrubbed; four stanzas dolly up out of the depth (scale 0.78→1→1.28, blur on desktop only) | WebGL uniform scrub + camera dolly | pinned 2.6 vh |
| Capabilities | **the dial** — six kanji titles on a wheel; scroll turns it; the title at 12 o'clock is live and its Lottie + body sit in the fixed panel | rotation | pinned 2.6 vh |
| Pains | **the pile** — the four questions fall in and stack with weight, then 「その課題に、GIFTが向き合います。」 lifts the pile away | gravity drop + lift | pinned 2.0 vh |
| How we work | **the flip board** — split-flap: the top half of the current step hinges down to reveal the next; six steps (the one place numbers are real) | rotateX hinge | pinned 2.4 vh |
| Agents | **the fill** — the industry word (建設 / 士業 / 小売 / 製造 / 不動産) stands hollow and fills bottom→top with liquid colour as its agent dossier rises beside it | typographic fill (clip) | pinned 3.0 vh |
| Thinking | paper sheet — the marquee runs (time, not scroll); the five nouns 商品 顧客 判断基準 ルール 仕事の流れ drift from scatter into one ordered row as the sheet passes (translate only) | arrangement (scatter → order) | flow |
| CTA | **the bookend** — veil lifts, liquid speeds up, copy rises | bg modulation + rise | flow |

Section-to-section: Lenis (desktop), every pinned frame is `position: sticky` inside a section
whose height is the budget (`--vh-frozen` px), so the frames hand over without a jump. The paper
sheet (Thinking) *covers* the last Agents frame (sticky cover, `.ao-agents` gets no exit budget),
which is the one cover transition on the page.

## 5. Palette / type

| token | value | use |
|---|---|---|
| `--ao-ink` | `#0B1020` | sheet, veil, cover, nav |
| `--ao-paper` | `#F3F1EB` | text on navy; the Thinking sheet |
| `--ao-blue` / `--ao-blue-light` | `#2563EB` / `#6D9BFF` | accent on paper / on navy |
| `--ao-indigo` / `--ao-peri` | `#4F6AF0` / `#BFCCFA` | the liquid's two lights (fill gradient, halo) |

Type: Poppins 700 (title, labels, dial index), Noto Sans JP 300 / 500 / 800, system mono.
Gen Interface JP + Inter + JetBrains links removed from `page.tsx` (no external font requests).

## 6. Knobs (tune here, don't restructure)

`AoField.tsx`: `VEIL_MAX 0.82 / VEIL_CTA 0.5`, `HERO_TARGETS`, `CTA_TARGETS`, `LERP 0.08`.
`AoScroll.tsx`: budgets `HERO_VH 2.6`, `CAPS_VH 2.6`, `PAINS_VH 2.0`, `STEPS_VH 2.4`,
`AGENTS_VH 3.0`; per-section phase windows are named constants at the top of each block.
`aiops.css`: title clamp `clamp(64px, min(17vw, 28vh), 320px)`; dial radius `--dial-r`.

## 7. Verification

`npx tsc --noEmit`, `npx next lint`, then `.inspect/ao-harness/shot.mjs W H [mobile]` against the
user's own dev server (never start one): 1536×730 and 390×844 touch, one screenshot per section,
rAF/s at the hero and the end, console errors, x-overflow.
