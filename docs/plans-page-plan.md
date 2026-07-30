# /plans page — build plan & procedure

**Status:** planning only, no code written yet.
**Date:** 2026-07-29

---

## Goal

Add a new `/plans` page presenting GIFT's AIOps plans/services. Exact plan tiers and
pricing are **not decided yet** — the page ships with placeholder content until the
business side locks those down. Visual bar: reuse the `/services/aiops` design system
(colors, fonts, and its scroll-animation tech) but it must not read as a reskin of that
page — same technology, different motion vocabulary. (Revised 2026-07-29 — animation
was originally scoped down to "simple fades only"; user wants the scroll-driven feel
back, just expressed differently than the aiops cascade/orbit.)

## Constraints

- **No pricing yet.** Placeholder tiers/features/pricing only — never a real number that
  reads as committed.
- **Reuse, don't reinvent, the visual system.**
  - Palette: `DX_CONSULTING_THEME` in `src/lib/navTheme.ts` (bg `#f5f7ff`, accent
    `#FF4D6D` / `#E63950`, ink `#0b1340`, muted `#6b7aa8`, border `#c9d3f5`, bgAlt
    `#e6eeff`) — same tokens `/services/aiops` uses for its nav chrome.
  - Fonts: Gen Interface JP (Latin+JP harmonized, via jsDelivr CDN — see
    `src/app/services/aiops/page.tsx` `DxFontsLink`), Inter italic for accent words only
    (Gen Interface JP has no real italic face), JetBrains Mono for code/terminal-style
    labels if needed.
- **Reuse the scroll-animation tech, not the motion itself.** GSAP + ScrollTrigger +
  Lenis smooth scroll (same stack as `/services/aiops`) are fair game — that
  infrastructure is proven and its bugs are already worked out on this site. But the
  actual motion vocabulary must be distinct from aiops's cascade/orbit so `/plans`
  doesn't feel like the same page twice. No viewport-**pinning** (that's where aiops's
  complexity and its scroll-dead bug history live) — scrub/enter-triggers only.
  See "Animation concept" below.
- No WebGL/canvas hero.
- **Must not go live before it's ready.** `dev` is currently wired as the Vercel
  Production branch and `www.gift-inc.org` points at it — pushing to `dev` now means
  shipping to the real domain, not just an internal preview. See procedure below.

## Procedure

1. **Branch:** create `features/plans-page` off `dev`. All work happens here.
2. **Build locally:** `npm run dev`, iterate against `http://localhost:3000/plans`
   (or 127.0.0.1 — see `wslrelay` localhost gotcha in memory if `localhost` 404s).
3. **Review checkpoint:** show the user the page running locally (or a preview
   deployment of the feature branch, which Vercel will build separately from
   Production) before merging anything into `dev`.
4. **Merge to `dev` only on explicit go-ahead.** That merge is the point it goes live
   on `www.gift-inc.org`, so treat it like any other production push.
5. **Post-merge:** confirm on the live domain, same as other page ships.

Until pricing/plans are finalized, keep the page reachable but clearly provisional
(e.g. a visible "準備中 / 価格は個別見積もり" disclaimer) rather than gating it behind
an env flag or hiding it from nav — simplest option, and consistent with how other
still-evolving pages on this site behave.

## Content structure (draft — react/adjust before build)

Deliberately avoiding the generic-SaaS-pricing-page tells (rounded cards + drop
shadows, checkmark/x feature lists, "Most Popular" ribbon badges, icon-in-a-circle
decoration — see memory `feedback_design_no_generic_ai_look`). Structure instead
continues this site's own editorial/mono-terminal visual grammar:

- **Hero** — page title + one-liner tying back to the AIOps roadmap language already
  established on `/services/aiops`. Static background at most (solid color or the
  existing `ColorBends` component), no canvas hero.
- **Roadmap spine (replaces "plans grid")** — the 3 tiers are presented as stages along
  the existing 学習 → 実装 → 定着 roadmap, connected by a single vertical rule, not as
  interchangeable pricing cards. Each stage: mono-label phase code eyebrow (`01 — 学習`),
  stage name in Gen Interface JP Display, asymmetric two-column body (narrow label /
  audience column + wider feature-list column with hairline dividers, no icons), and a
  right-aligned mono "spec line" for price (`PRICE ―――――――― お問い合わせください`)
  instead of a price tag/badge. Whichever stage should draw the eye gets emphasis via
  oversized/bleeding phase-number typography, not a colored badge or border.
- **Add-on / à la carte row** (optional) — smaller list of individual AIOps service
  line items that don't fit the 3-tier shape.
- **Disclaimer line** — pricing under finalization / consult-based, so nothing reads
  as a committed rate card.
- **CTA band → `/contact`** — same pattern as other service pages.

## Animation concept

Reuses aiops's GSAP + ScrollTrigger + Lenis stack, but a distinct motion vocabulary —
no cascade card-slide, no orbit/atom viewer, no viewport pinning:

- **Scroll-drawn spine** — the vertical rule connecting the three stages is an SVG path
  whose `stroke-dashoffset` is scrubbed directly to scroll position, so it draws itself
  as the user scrolls down.
- **Terminal-typing reveal** — each stage's mono eyebrow label types in
  character-by-character on scroll-enter (enter-triggered, not scrubbed).
- **Scale-linked emphasis** — the emphasized stage's phase number scales up slightly as
  it scrolls into view (subtle scrub-linked transform, no pin).
- **Price spec-line print-in** — the price line prints in with a blinking mono cursor
  on scroll-enter.

Known gotchas to inherit from aiops (don't relearn these the hard way — see memory):
- Use `toggleActions: 'play none none none'` for enter-triggered reveals, never
  `gsap.timeline({ scrollTrigger: { once: true } })` — that combination self-kills mid
  refresh and crashes (`project_gsap_timeline_once_crash`). Plain tweens /
  `ScrollTrigger.create` / `.batch()` are safe.
- Skip Lenis on touch/mobile viewports (`project_dx_navigation_flash_fix`).
- If any trigger position depends on late-loading fonts, refresh `ScrollTrigger` on
  `document.fonts.ready` **and** a bounded settle timer, not just on mount —
  client-side App Router navigation never fires `window 'load'`
  (`project_aiops_pending_bugs` scroll-dead bug class).

## Open decisions

- [ ] Do the 3 plan tiers map 1:1 to 学習/実装/定着, or is a different cut better?
- [ ] Exact placeholder copy for each tier's feature bullets.
- [ ] Include the à la carte/add-on row, or keep the page to just the 3-tier grid?
- [ ] Nav entry: add `/plans` to the main nav now (pointing at a page that says
      "準備中"), or leave it unlinked until content is closer to final?

## Verification checklist (before merging `features/plans-page` → `dev`)

- [ ] `tsc` / `next build` clean.
- [ ] Visual check at mobile / tablet / desktop breakpoints (real browser, not just
      SwiftShader/headless — matches this project's standing rule for visual checks).
- [ ] JP text lines checked for orphan trailing characters (`text-wrap: balance`
      pattern per memory `feedback_jp_orphan_words`).
- [ ] Palette/font match confirmed against `/services/aiops` side-by-side.
- [ ] No fabricated pricing numbers anywhere in the shipped copy.
