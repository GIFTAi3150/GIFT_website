# /services/ai-training redesign — v8 "Plasma" (2026-09-04, night)

Branch: `redesign/ai-training`. Author: Fable. Copy untouched: every string comes from
`_components/aiTrainingContent.ts`.

User direction (2026-09-04 night, verbatim intent): use https://reactbits.dev/backgrounds/plasma
as the background of the whole page; once the reader scrolls past the hero it becomes opaque so
the focus is on the writing. Earlier the same evening: "AI TRAINING" is the title and must be the
biggest writing in the hero.

History on this page (do not return to): v1 halftone dots, v2 3D letters, v3 silk, v4 marbling,
v5 stroke field, v6 ink model ("horror movie"), v7 glass cube (expansion "unnatural", bg "low
quality"). The section mechanisms below survived every round without comment.

---

## 1. Structure

One navy sheet. A fixed OGL canvas (`AtPlasma.tsx`) behind the page runs React Bits' Plasma
raymarch, tinted to the page accent. A navy veil (`.at-veil`) sits between the canvas and the
sections; `AtScroll` scrubs it from 0 to `VEIL_MAX 0.8` while the hero scrolls out
(`bottom 92% → bottom 28%` of `.at-scene`), so every section below reads on a near-solid ground
with a visible pulse behind. Under the CTA the veil drops to `VEIL_CTA 0.6`. Pricing is the one
opaque paper sheet.

Hero: full-viewport, scrolls naturally (no pin). AI TRAINING in Poppins 700, two lines, up to
300px (`clamp(56px, min(15vw, 27vh), 300px)`; phone `18.5vw`), kicker 法人向けAI研修, the JP
headline 「使ってみた」から「使いこなす」へ。 under it, outline button, mono meta, scroll cue.
Load intro = masked rises on `gift:logo-ready` (dispatched after the plasma's first frame).

## 2. Plasma port (`AtPlasma.tsx`)

Raymarch verbatim from React Bits (`src/content/Backgrounds/Plasma/Plasma.jsx`). Differences:
- canvas lives in JSX; `webglcontextlost` listener registered BEFORE `new Renderer` and never
  calls `preventDefault` (guilty-counter memory); on loss → `data-at-fallback` (CSS bloom).
- `import('ogl')` lazily inside the effect (SSR-safe), `webgl: 2`, `alpha: true`.
- colour grade is ours: the raymarch's warm/cool phase picks between two site hues
  (`COLOR_A #2a5cf5` electric blue ↔ `COLOR_B #7d6cf0` periwinkle violet), the hot cores go
  pale (`COLOR_HI #d9e6ff`). Upstream's single-hue tint looked flat.
- mouse interaction REMOVED (user: "I don't want no interaction with my mouse").
- `lightMode` dropped (page is dark).

Knobs: `SPEED 0.6`, `DIRECTION forward`, `SCALE 1.0`, `OPACITY 1.0`, `MAX_DPR 1.5`, render
scale 0.55 (phone 0.5), iterations 60 (phone 42), `VEIL_MAX 0.8` (user asked for the plasma to
stay "a bit more visible"), `VEIL_CTA 0.6`.

## 3. Palette / type

| token | value | use |
|---|---|---|
| `--at-ink` | `#0B1020` | ground, header/footer (`AI_TRAINING_THEME`), veil, cover, loading |
| `--at-paper` | `#F3F1EB` | text on navy; the Pricing sheet |
| `--at-blue` / `--at-blue-light` | `#2563EB` / `#6D9BFF` | accent on paper / on navy, plasma tint |
| `--at-ink-2/3/4` | `#111827` / `#1A2440` / `#232C5E` | deck sheets 1–3 (sheet 4 = blue) |

Type: Poppins 700 (title, labels, price figures), Noto Sans JP 300/500/800, system mono.

## 4. Sections and their mechanisms (one KIND each)

| section | mechanism | files |
|---|---|---|
| Hero | plasma + veil scrub as it leaves | `AtPlasma`, `AtHero` |
| Statement | none (hero coda) | `AtStatement` |
| Concerns | **typewriter** — chars typed by scroll, caret follows (pinned 1.7 vh) | `AtConcerns` |
| Reasons | **focus band** — defocused ghost + crisp copy clipped to a fixed 32–68 % band | `AtReasons` |
| Flow | **deck** — sticky sheets cover each other; the covered one scales/shades | `AtFlow` |
| Courses | **slot sentence** — 営業/記録/数字 rolls, panels slide (pinned 2.2 vh) | `AtCourses` |
| Pricing | **transfer** — 40 recedes, 10 comes forward (paper sheet) | `AtPricing` |
| FAQ | accordion | `AtFaq` |
| CTA | veil lifts a little; copy rises in | `AtCta` |

Shared (the only repeats): label rule + h2 mask rise (`AtHead`). Lenis desktop only.

## 5. Verification

`tsc --noEmit` + `eslint` clean. Visual probe: `.inspect/at-harness/plasma.mjs W H [mobile]`
against the user's dev server on 3000 (d3d11 flags), run 2026-09-04 night: no console errors,
no x-overflow, GL path active, 44–54 rAF/s at 1536×730 and 60 at 390×844 (dpr 2, touch). The
JP headline now flows under TRAINING inside `.at-hero__block` (it overlapped before).
