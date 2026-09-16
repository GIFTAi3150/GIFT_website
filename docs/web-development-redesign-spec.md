# /services/web-development — "The Build" (2026-09-09)

Branch: `feature/homepage-dev-maintenance-lp`. Author: Fable. Copy = the approved offer text
(no initial fee, ¥30,000/month before tax, custom design up to 10 pages, server/domain/SSL,
minor updates, 18-month term; AI course ¥120,000/month, 6 months). Every string lives in
`_components/wdContent.ts`.

User direction (2026-09-09): build the page with Awwwards-grade scrolling animation, a scroll
animation in each section, transitions that feel natural.

What was replaced: an untracked Codex-ported draft (`_components/gift-content/`, moved to
`.inspect/web-development-codex-draft/`). It carried the patterns the manager has rejected
before — decorative `01…10` labels on every section, rounded shadowed cards, the same
fade-up reveal in most sections (see memory: one mechanism per section, no generic AI look).

---

## 1. Structure

`page.tsx` → `<main class="wd-page" data-flash-guard>` holding the hero and eleven sections,
then `WdScroll` (the orchestrator, rendered LAST so its effect runs after every section),
then the Footer outside `<main>`.

The page is a stack of opaque **sheets** (navy / paper / blue). Two kinds of section:

- **stage** (`[data-stage]`, `--budget` in `--vh-frozen` units): a tall wrapper with a
  sticky `.wd-frame` (`height: var(--svh-frozen)`). A scrubbed proxy tween reads
  progress 0→1 over `top top → bottom bottom` and a `place(p)` function writes the
  mechanism. No GSAP pin anywhere (same pattern as aiops/ai-training).
- **flow**: normal-height sections with local triggers.

### The seam (the transition system, not a section mechanism)

For every consecutive pair of sections one ScrollTrigger on the incoming section
(`top bottom → top top`) writes two CSS variables:

- `--wd-out` on the outgoing section: its whole box lags down `12vh` (`transform`) and a
  navy shade rises over it (`::after`, opacity ≤ 0.55). Because every section is opaque
  and `overflow: clip`, the lagging content sinks under the incoming sheet.
- `--wd-in` on the incoming section: the sheet's top corners flatten from 48px to 0.

Result: every sheet slides over the one before it with depth, uniformly, whatever the
section's own mechanism is. The hero has its own exit instead (parallax at three depths).

## 2. Sections and mechanisms (one KIND each)

| #   | section                        | sheet     | mechanism                                                                                                                                                                                                                           | budget |
| --- | ------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0   | Hero (kept)                    | navy      | entrance stagger + typewriter; exit = 3-depth parallax                                                                                                                                                                              | —      |
| 1   | Manifesto つくる。その先まで。 | navy      | **the lock** — the two words travel in from opposite edges and lock; 先 fills blue at the click; the giant asterisk turns like a gear                                                                                               | 1.5    |
| 2   | Worries                        | navy      | **the strike** — four worries written large; a blue stroke crosses each out in turn (per-line via `box-decoration-break: clone`), then the answer rises                                                                             | 2.2    |
| 3   | All included                   | paper     | **the build** — a browser frame assembles: design block → 10 page sheets → the 0 stamp → https + lock → the news row flips → the frame narrows into a phone. The six-item index beside it stays fully visible; the active row opens | 3.4    |
| 4   | Preparation                    | paper     | **the handover** — 文章 / 写真 / ロゴ slide across the divider from 御社 to GIFT; what stays on your side is only 基本情報＋写真                                                                                                    | 2.0    |
| 5   | 10 pages                       | blue      | **the spread** — ten sheets in a pile fan out into the 5×2 sitemap grid                                                                                                                                                             | 1.8    |
| 6   | Compare                        | paper     | **the column** — the GIFT column drops into the ledger; the rest is quiet                                                                                                                                                           | flow   |
| 7   | Approach AI×HUMAN              | navy      | **the join** — the image is two halves that travel together and meet; × appears at the seam; copy rises with it                                                                                                                     | 1.7    |
| 8   | Plans                          | navy      | **the separation** — the two plan sheets part from one stack as the section enters (settled before the reading zone; both always visible)                                                                                           | flow   |
| 9   | Terms                          | navy      | quiet ledger, shared head only                                                                                                                                                                                                      | flow   |
| 10  | Flow                           | paper     | **the route** — a path drawn through the four steps; a dot travels it with the scroll and lights each step                                                                                                                          | flow   |
| 11  | FAQ                            | paper     | accordion (native details, WAAPI height)                                                                                                                                                                                            | flow   |
| 12  | Closing                        | navy→blue | **the aperture** — a blue disc opens from the mascot's corner over the section; lines rise; the poster returns as a bookend                                                                                                         | flow   |

Shared (allowed repeats): section label rule + text, h2 line mask rise.

## 3. Palette / type

| token                           | value                 | use                                                               |
| ------------------------------- | --------------------- | ----------------------------------------------------------------- |
| `--wd-navy`                     | `#0b1020`             | ground, navy sheets, cover, loading, header (`AI_TRAINING_THEME`) |
| `--wd-navy-2`                   | `#111a33`             | AI plan sheet                                                     |
| `--wd-paper`                    | `#f3f1eb`             | paper sheets, text on navy                                        |
| `--wd-blue` / `--wd-blue-light` | `#2563eb` / `#6d9bff` | accent on paper / on navy; the blue sheets                        |
| `--wd-sky`                      | `#bfccfa`             | periwinkle secondary on navy                                      |

Type: Poppins 700 (giant figures, wordmarks, price), Noto Sans JP 300 / 500 / 800, system mono
for labels. Giant sizes use `clamp(px, min(vw, vh), px)` so short-wide viewports do not crop.
Headings and short lines carry `text-wrap: balance` (JP orphan rule).

## 4. Viewport units

Fill heights: `var(--svh-frozen)`. Budgets: `var(--vh-frozen)`. Live `vh` only inside
transforms and font sizes. Refresh on `gift:vh-frozen-change`, `gift:route-styles-ready`,
`fonts.ready`, `load`, plus one bounded 1200 ms refresh (first client-nav font reflow).

## 5. Mobile (≤ 899px) and reduced motion

Lenis desktop-only; scrub 0.15 on touch. Stages keep working through sticky. Layout changes:
build = frame above the index; join = top/bottom halves; spread = 2×5; route = narrow zigzag.
Reduced motion: `data-wd-static` on `<main>`; CSS defaults are the final states, so the page
reads without JS; the build shows its full desktop state with every index row open.

## 6. Verification

`npx tsc --noEmit`, `npx next lint --dir src/app/services/web-development`,
`npm run check:encoding`. Visual pass on the user's :3000 when it is up (never start one).
