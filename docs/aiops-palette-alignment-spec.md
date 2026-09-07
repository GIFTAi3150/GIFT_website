# /services/aiops — palette alignment spec (2026-09-04)

## Problem

The AIOps page is the only page on the site running a **violet/purple** accent
family. Everything else — home, /company, /plans, /contact, /services/ai-training
— is **royal blue `#2563EB` on navy**. Side by side the AIOps page reads as a
different product (Stripe-purple), not as a GIFT page.

Two concrete offenders:

1. `dx-v3.css` accent family is centred on `#635bff` (hsl 243°) with true purple
   excursions `#7c3aed` / `#6d28d9` (hsl 267°) and lavender tints
   (`#8a82ff`, `#b3a9ff`, `#cfc8ff`, `#c4beff`, `#8b6bff`).
2. `navTheme.ts` → `DX_CONSULTING_THEME` uses a **coral `#FF4D6D`** accent and a
   violet `#635bff` logo shield. Every core page uses `#2563EB` / `#1D4ED8`.

## Site anchors (unchanged — these are the reference, not the target of edits)

| token | value | where |
| --- | --- | --- |
| hero navy bright | `#3d47c0` | HP hero gradient |
| hero navy mid | `#252d76` | HP hero gradient |
| hero navy deep | `#0a0e2b` | HP section floor |
| `ai.accent` | `#2563EB` | HP AIOps section, /contact, /plans, /company, nav |
| `ai.accent-h` | `#1D4ED8` | hover / pressed |
| `ai.cyan` | `#06B6D4` | sparkle accent |

## Decision

Rotate the AIOps accent family from violet (243–267°) into the site's
**royal-indigo band (221–235°)**, keeping every colour's *lightness* so contrast,
shadow weight and blur-blob depth are untouched. Purple is removed entirely.
The cyan sparkle (`#4cc2ff`) **stays** — the site already carries a cyan accent.

Two-tone system after the change:

- **Primary** `--blue: #4F6AF0` — royal indigo, sits between HP `#3d47c0` and
  `ai.accent #2563EB`. Keeps the page's own identity without leaving the family.
- **Deep** `--purple → #2563EB` — the site's royal blue. Used for the masthead
  italic accent word and one blur blob; separated from `--blue` by lightness
  (53% vs 63%), not by hue.

## Substitution table

Applies to `src/app/services/aiops/dx-v3.css` unless noted.

| old | new | role |
| --- | --- | --- |
| `#635bff` / `rgba(99, 91, 255, α)` | `#4F6AF0` / `rgba(79, 106, 240, α)` | `--blue`, page-wide glow, CTA shadows, deco rects |
| `#8a82ff` | `#7D93F7` | `--blue-bright` |
| `#b3a9ff` | `#A9BAFA` | `--blue-glow` |
| `#cfc8ff` | `#CBD8FB` | `--sky` |
| `#4a3fe0` | `#3D47C0` | `--cobalt` → HP hero bright navy |
| `#7c3aed` | `#2563EB` | `--purple` → site royal blue |
| `#6d28d9` | `#1D4ED8` | `--purple-deep` → site hover blue |
| `#e0daff` | `#DAE2FF` | hero subtitle tint |
| `#c8c2ff` | `#C2CEFA` | hero subtitle tint |
| `#eef0ff` | `#EDF2FF` | ColorBends stop |
| `#cdd3ff` | `#CCD8FB` | ColorBends stop |
| `#dfe0ff` | `#DEE6FF` | ColorBends stop |
| `#8b6bff` | `#6B7BF5` | ColorBends violet stop → indigo |
| `#c4beff` | `#BFCCFA` | hero shader `colour3` (`LiquidHeroScene.tsx` preset 0) |

`LiquidHeroScene.tsx` preset 0 becomes
`colour1 #060b24` (unchanged) / `colour2 #4F6AF0` / `colour3 #BFCCFA`.

`navTheme.ts` → `DX_CONSULTING_THEME`:

| key | old | new |
| --- | --- | --- |
| `accent` | `#FF4D6D` | `#2563EB` |
| `accentDeep` | `#E63950` | `#1D4ED8` |
| `logoShield` | `#635bff` | `#2563EB` |

## Deliberately unchanged

- `--paper #f5f7ff` / `--paper-2 #e6eeff` / `--paper-3 #d5e1ff` — already cool
  near-whites, in family with `ai.bg #F0F7FF`.
- `--ink #0b1340`, `--ink-2 #1e2a6b`, `--silver #6b7aa8`, `--line #c9d3f5` —
  already navy/blue; visually indistinguishable from the site navy at text size.
- `#4cc2ff` cyan, `#060b24` hero floor, `#f8fafe` / `#d2ddf0` section bands.
- Dead components (`LiquidHero.tsx`, `GiftLogoMark.tsx`, `AtomViewer.tsx`,
  `SvgLogoHero.tsx`, `RiveHero.tsx`, `VatParticles.tsx`) and `/dev/*` tools —
  not rendered by the page, left alone to keep the diff tight.

## Known adjacent issue (out of scope)

`src/styles/globals.css` → `.contact-hero-rects` carries `--dr-solid: #635bff` /
`--dr-ghost: rgba(99, 91, 255, 0.22)`, copied from the DX page. The /contact page
is otherwise `#2563EB` on `#0b1020`, so the same violet mismatch exists there.
Not touched here — flagged for a follow-up.

---

# Pass 2 — surfaces, neutrals and chrome (same day)

Pass 1 moved the *accents*. The page still wore its own neutral system, so it
still read as a separate site: a violet-white paper, a saturated navy-indigo
ink, its own section bands, a neutral blackish load cover, and page-specific
nav chrome. Pass 2 puts all of that on the site's existing tokens.

## Light surfaces → the `ai.*` token set

`ai.*` is the palette the homepage's own AIOps section uses, so the standalone
page now matches the section that links to it.

| token | old | new | site source |
| --- | --- | --- | --- |
| `--paper` | `#f5f7ff` | `#F0F7FF` | `ai.bg` |
| `--paper-2` | `#e6eeff` | `#E3EEFA` | ladder step |
| `--paper-3` | `#d5e1ff` | `#D2E2F4` | ladder step |
| `--ink` | `#0b1340` | `#0C0E1A` | `ai.ink` |
| `--ink-2` | `#1e2a6b` | `#252D76` | HP hero mid navy |
| `--silver` | `#6b7aa8` | `#5B6B8A` | `ai.muted` |
| `--line` | `#c9d3f5` | `#BFDBFE` | `ai.border` |

Intro band gradient `#f8fafe → #eef2fb → #dfe7f5 → #d2ddf0` becomes
`#F0F7FF → #E7F0FB → #D9E6F5 → #CBDCF0`; the shutter rows and the
`.stats` handoff fade follow it so no hard colour edge appears.
`rgba(11, 19, 64, α)` shadows/hairlines (11×) and `rgba(4, 8, 40, α)` (1×)
become `rgba(11, 16, 32, α)` — the site navy — so depth stays navy-tinted
rather than flat black.

`--silver` on `--paper` now measures 4.96:1 (was lighter, i.e. worse) — AA for
body text.

## Dark surfaces → one site navy `#0b1020`

The hero floor was `#060b24` and the load cover was a neutral blackish gradient
`#0b0b0e → #17181c`, while `/company` and `/services/ai-training` both use flat
`#0b1020`. All of it is now `#0b1020`:

- `dx-v3.css` dark band + flash-guard `::after`
- `loading.tsx`
- the inline cover in `DxV3Page.tsx`
- `layout.tsx` `#page-cover` recolour
- `LiquidHeroScene.tsx` preset 0 `colour1`

Because the cover and the hero floor are now the same colour, the
cover → hero handoff has no colour step. `layout.tsx`'s three dark-route
branches collapsed into one `darkRoutes` list, since all three share the navy.

## Nav chrome → `DEFAULT_THEME` values

`DX_CONSULTING_THEME` was the only light theme not on the site's default
chrome. It now carries the identical values (`#F0F7FF` bar, `#BFDBFE` border,
`#0C0E1A` ink, `#5B6B8A` muted, `#2563EB` accent/shield, `rgba(12,14,26,0.38)`
faint) — the same header the homepage, `/company`, `/plans` and `/contact` wear.

## Still deliberately unchanged

- `#4cc2ff` cyan sparkle — same hue (199°) as the site's `accent.cyan #00B4FF`,
  just a lighter tint. Already in family.
- White surfaces, card fills, `--ease`.
- **Typography.** The page runs Gen Interface JP + Inter italic + JetBrains
  Mono, which is not the site's Noto Sans JP / Poppins stack. That is a
  redesign, not a colour change, so it was left alone — flag if it should move.
- Dead components (`GiftLogoMark`, `SvgLogoHero`, `VatParticles`,
  `LiquidHero.tsx`, `AtomViewer`) still hold old violets; nothing renders them.
