# /company redesign — "Terrain" (2026-09-02)

Branch: `redesign/about-page-main-alignment`. Author: Fable (design). Executor applies verbatim.
Goal from the manager: an Awwwards-grade `/company`, colours matching the homepage, a
unique WebGL hero that fits a *company* page, and the Lottie backgrounds replaced by
animation that belongs to the page's scrolling.

---

## 1. Concept

**The ground GIFT was born on.** The Mission copy's spine is 現場 — "GIFTは、現場から生まれた
会社です / 現場こそが、変化の起点". The hero is a living **topographic map**: fine luminous
contour lines of a slowly breathing landscape, drawn in the homepage's navy + periwinkle
light. The company name **GIFT / INC.** is not text laid *over* the map — it is *made of* it:
inside the letterforms the contours are dense and bright, outside they are sparse and dim, so
the name reads as land lit from within. The cursor is a きっかけ: it raises the ground under it
and sends contour rings outward. On scroll the light **spreads out of the letters across the
whole field** (the gift given), the map dims and tilts into a horizon, and the Mission text
arrives over that calm ground. One scene, one metaphor, driven by scroll.

Why this and not a fluid, particles or shapes: the homepage hero is already the fluid sim; DX
hero shapes/warp were rejected; contour terrain is rare on the web, reads editorial rather than
"tech template", costs one fragment pass (no FBOs, no TDR risk, phone-safe), and ties directly
to the page's own words.

## 2. Palette / type — homepage-derived, nothing new

| token | value | source on `/` |
|---|---|---|
| `--c-navy` | `#0b1020` | Hero + WhoWeAre base |
| `--c-navy-2` / `--c-navy-3` | `#111827` / `#1a2440` | WhoWeAre gradient stops |
| `--c-abyss` | `#050c1a` | AIOps section |
| `--c-peri` / `--c-peri-bright` / `--c-peri-light` | `#363b9e` / `#3d47c0` / `#7c7ae0` | giant "AI OPS", hero-navy.bright, static hero glow |
| `--c-blue` / `--c-blue-mid` / `--c-blue-light` | `#2563EB` / `#3b82f6` / `#60a5fa` | nav accent, WhoWeAre rule, labels |
| `--c-paper` / `--c-light` | `#F8F6F2` / `#F0F7FF` | HPAbout paper, body/nav |
| `--c-ink` | `#111B21` | ink |

Type: **Poppins 700** (`font-display`) for EN display + labels, **Noto Sans JP** 300/500/800
(`font-sans`) for JP, **Anton** (`font-nube-display`) for the single giant closing word,
system mono (`font-mono`) for indices/counters. Forum/Shippori are no longer used on this page
(they stay loaded in `fonts.ts` — other files still reference them; not touched here).

JP rules: headings `line-height ≥ 1.25`, tracking never below `-0.01em`, short lines get
`text-wrap: balance` (global h1–h6 rule already does this), body `<p>` keeps the global
`auto-phrase` + `pretty`. Mission body is phrase-segmented with U+200B so the word-scrub can
never break inside a phrase (same trick as `WhoWeAre.tsx`).

## 3. Page structure & rhythm

```
<main class="company-page" data-flash-guard>
  1  .co-scene (relative)                                  ── navy, ONE WebGL scene ──
       .co-scene__stick  sticky 100dvh   ← TerrainHero: canvas + hero UI (h1, eyebrow, meta, cue)
       .co-scene__spacer calc(var(--vh-frozen) * .6)      ← hero scroll budget (spread + calm)
       #mission          relative z1, transparent          ← text scrolls OVER the calmed map
  2  #vision   paper #F8F6F2, sticky statement, scroll-scrubbed line wipes + scroll-driven marquee
  3  #why      abyss #050c1a + AuroraLines (HP AIOps echo), "reading focus" scrub, link → /services/aiops
  4  #values   light #F0F7FF, sticky rail + counter, 3 editorial rows, anti-values struck through on scroll
  5  #information  DARK — the globe's own field + gradation (see §18), 会社概要 table + sticky globe
  6  #contact-cta  navy, giant Anton CONTACT rising on scroll, button
  <CompanyScroll/>  (GSAP + Lenis orchestrator, rendered LAST so its effect runs after all children)
</main>
<Footer/>  (light — same dark→light seam as the homepage)
```

Dark → light → dark → light → light → dark as first built; Information went dark in §18, so the
rhythm is now dark → light → dark → light → **dark → dark** into the footer's light seam. Every
section has its **own** scroll behaviour (the manager vetoed reusing one motion across a page):

| section | motion (all scroll-driven unless noted) |
|---|---|
| Hero | WebGL: load reveal (contours rise from the valleys), pointer hill + rings, scrub: letters spread → field calms + tilts, UI lifts |
| Mission | phrase-by-phrase opacity scrub per paragraph + a 1px rail that fills; h2 char reveal (enter) |
| Vision | sticky; 3 statement lines wipe in (clip-path) in sequence, rule draws, EN sub fades; background word marquee translates with scroll |
| Why AIOps | each paragraph brightens as it reaches the reading band and dims as it leaves (focus), mono index follows |
| Values | row hairlines draw as rows enter; sticky counter 01/02/03 flips; anti-values get a strike line drawn by scroll |
| Information | rows slide in (enter), globe sticky |
| CTA | giant word rises/scales with scroll |

Removed: every Lottie (`CompanySphereBg`, `StrengthDots`, the 8 `public/lottie/company-*.json`,
the generator + source JSONs), the biscom hero (`HeroClipText` + `public/company/*`), the dead
company components. See §9.

## 4. Non-negotiable engineering rules (from project memory)

- Scroll **budgets** use `calc(var(--vh-frozen) * N)`; viewport **fills** use `100dvh`. Listen
  for `VH_FROZEN_CHANGE` → `ScrollTrigger.refresh()`. (Fixes the Instagram WebView jump that
  `HANDOVER.md` lists as still open on `/company`.)
- `gsap.timeline({scrollTrigger:{once:true}})` is a crash — timelines use
  `toggleActions: 'play none none none'`; `once:true` only on tweens/`ScrollTrigger.create`.
- Never `clearProps:'all'`. Never let GSAP own `yPercent` on auto-height elements.
- Raw WebGL: no `preventDefault()` in `webglcontextlost`, never call `loseContext()`; on loss
  stop the loop and show the static fallback. Dispatch `gift:logo-ready` after the first frame
  (or immediately on fallback) so the root `#page-cover` drops.
- Flash guard: `data-flash-guard` on `<main>`, released in a rAF at the END of the
  orchestrator effect; guard `::after` paints `#0b1020` (the page's true first colour).
- Lenis desktop-only (`max-width: 899px` → native scroll).
- `loading.tsx` = solid `#0b1020` fixed overlay. `layout.tsx` cover recoloured to `#0b1020` for
  `/company` (1-line addition next to the existing `/services/aiops` branch).
- Verify with `npx tsc --noEmit` only — never `npm run build` while the dev server may be up.
- Internal links use `next/link`.

## 5. Files

| action | path |
|---|---|
| CREATE | `src/app/company/company.css` (§6) |
| CREATE | `src/app/company/_components/TerrainHero.tsx` (§7) |
| CREATE | `src/app/company/_components/CompanyScroll.tsx` (§8) |
| REPLACE | `src/app/company/page.tsx` (§10) |
| REPLACE | `src/app/company/loading.tsx` (§11) |
| EDIT | `src/app/layout.tsx` cover colour (§11) |
| DELETE | see §9 |

Everything below is final code. Copy verbatim; do not restyle, rename or "improve".

## 6. `src/app/company/company.css` (CREATE — replaces `company-redesign.css`)

```css
/* /company — "Terrain" redesign (2026-09-02). Palette = homepage. Spec: docs/company-redesign-spec.md */

.company-page {
  --c-navy: #0b1020;
  --c-navy-2: #111827;
  --c-navy-3: #1a2440;
  --c-abyss: #050c1a;
  --c-peri: #363b9e;
  --c-peri-bright: #3d47c0;
  --c-peri-light: #7c7ae0;
  --c-blue: #2563eb;
  --c-blue-mid: #3b82f6;
  --c-blue-light: #60a5fa;
  --c-paper: #f8f6f2;
  --c-light: #f0f7ff;
  --c-ink: #111b21;
  --c-line-dark: rgba(255, 255, 255, 0.12);
  --c-line-light: rgba(17, 27, 33, 0.14);
  --header-h: 80px; /* Header is h-20 fixed */
  background: var(--c-navy);
  color: var(--c-ink);
}

/* ── Flash guard: first paint is the navy scene; hide children until GSAP has
      applied every initial state (released in a rAF at the end of CompanyScroll). */
.company-page[data-flash-guard] > * { visibility: hidden; }
.company-page[data-flash-guard]::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: #0b1020;
  visibility: visible;
  pointer-events: none;
}

/* ── Shared editorial pieces ─────────────────────────────────────────── */
.co-container {
  margin-inline: auto;
  max-width: 72rem;
  padding-inline: 16px;
}
@media (min-width: 768px)  { .co-container { padding-inline: 24px; } }
@media (min-width: 1024px) { .co-container { padding-inline: 32px; } }

.co-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.co-label__rule {
  display: inline-block;
  width: 32px;
  height: 1px;
  background: currentColor;
  transform-origin: left center;
}
.co-label__text {
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.co-label--dark  { color: var(--c-blue-light); }
.co-label--light { color: var(--c-blue); }

.co-h2 {
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 800;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.35;
  letter-spacing: -0.01em;
}
.co-h2 .co-h2__char { display: inline-block; } /* SplitText chars get this via gsap.set */

.co-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* body copy on dark sections — overrides the global <p> colour */
.co-body-dark p { color: rgba(255, 255, 255, 0.78); }
.co-body-light p { color: var(--c-ink); }

/* Dark-bg outline button (the global .cta-btn--company is blue-on-light). */
.cta-btn--on-navy { border-color: #ffffff; color: #ffffff; }
.cta-btn--on-navy::before { background-color: #2563eb; }
.cta-btn--on-navy:hover,
.cta-btn--on-navy:focus-visible { border-color: #2563eb; color: #ffffff; }

/* ── 1. Scene: hero + mission share one sticky WebGL layer ───────────── */
.co-scene { position: relative; background: var(--c-navy); }
.co-scene__stick {
  position: sticky;
  top: 0;
  height: 100dvh;           /* fill — dvh, never svh */
  overflow: hidden;
  z-index: 0;
}
.co-scene__spacer { height: calc(var(--vh-frozen) * 0.6); } /* budget — frozen px */

.co-hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
/* static fallback (no WebGL / context lost / reduced motion): navy + periwinkle
   breath + the letters as DOM text. Hidden unless [data-active]. */
.co-hero__fallback {
  position: absolute;
  inset: 0;
  display: none;
  background:
    radial-gradient(ellipse 55% 45% at 22% 38%, rgba(124, 122, 224, 0.28) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 82% 18%, rgba(61, 71, 192, 0.22) 0%, transparent 70%),
    linear-gradient(180deg, #0b1020 0%, #0a0f24 60%, #050c1a 100%);
}
.co-hero__fallback[data-active] { display: block; }
.co-hero__fb-words {
  position: absolute;
  left: var(--hero-pad, 16px);
  top: 19%;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: var(--hero-fs, 120px);
  line-height: 0.86;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: -0.02em;
}
.co-hero__fb-words span { display: block; }

.co-hero__ui { position: absolute; inset: 0; pointer-events: none; }
.co-hero__ui > * { pointer-events: auto; }
.co-hero__eyebrow {
  position: absolute;
  left: var(--hero-pad, 16px);
  top: calc(var(--header-h) + 22px);
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
}
.co-hero__title {
  position: absolute;
  left: var(--hero-pad, 16px);
  bottom: clamp(56px, 11dvh, 112px);
  margin: 0;
  max-width: 22ch;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 500;
  font-size: clamp(18px, 2vw, 26px);
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-wrap: balance;
}
.co-hero__sub {
  position: absolute;
  left: var(--hero-pad, 16px);
  bottom: clamp(30px, 6dvh, 64px);
  margin: 0;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-blue-light);
}
.co-hero__meta {
  position: absolute;
  right: var(--hero-pad, 16px);
  bottom: clamp(30px, 6dvh, 64px);
  margin: 0;
  color: rgba(255, 255, 255, 0.45);
  text-align: right;
}
@media (max-width: 767px) { .co-hero__meta { display: none; } }

.co-hero__cue {
  position: absolute;
  left: 50%;
  bottom: clamp(20px, 4dvh, 40px);
  transform: translateX(-50%);
  width: 1px;
  height: min(88px, 9dvh);
  overflow: hidden;
}
.co-hero__cue span {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  animation: coCueLoop 2.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes coCueLoop {
  0%   { transform: translateY(-100%); }
  50%  { transform: translateY(0); }
  100% { transform: translateY(100%); }
}
@media (prefers-reduced-motion: reduce) { .co-hero__cue span { animation: none; } }

/* Mission — flows over the calmed map. Legibility floor via gradient. */
.co-mission {
  position: relative;
  z-index: 1;
  padding: clamp(96px, 14vh, 160px) 0 clamp(120px, 18vh, 200px);
  background: linear-gradient(180deg, rgba(11, 16, 32, 0) 0%, rgba(11, 16, 32, 0.45) 18%, rgba(11, 16, 32, 0.72) 100%);
}
.co-mission__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 40px;
}
@media (min-width: 1024px) {
  .co-mission__grid { grid-template-columns: 4fr 7fr; gap: 64px; }
}
.co-mission__head { position: relative; }
@media (min-width: 1024px) {
  .co-mission__head { position: sticky; top: calc(var(--header-h) + 40px); align-self: start; }
}
.co-mission__en {
  margin: 18px 0 0;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: clamp(15px, 1.4vw, 19px);
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.55);
}
.co-mission__en em { font-style: normal; color: var(--c-blue-light); }
.co-mission__body { position: relative; padding-left: 28px; }
@media (min-width: 1024px) { .co-mission__body { padding-left: 40px; } }
.co-mission__body p {
  margin: 0 0 1.6em;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: clamp(16px, 1.25vw, 18px);
  line-height: 2.05;
  color: rgba(255, 255, 255, 0.86);
  word-break: keep-all;        /* phrase boxes (U+200B) decide the breaks */
  overflow-wrap: anywhere;
}
.co-mission__body p:last-of-type { margin-bottom: 0; }
.co-rail {
  position: absolute;
  left: 0;
  top: 0.55em;
  bottom: 0.55em;
  width: 1px;
  background: rgba(255, 255, 255, 0.12);
}
.co-rail__fill {
  position: absolute;
  inset: 0;
  background: var(--c-blue-light);
  transform-origin: top center;
  transform: scaleY(0);
}
.co-mission__sign {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--c-line-dark);
  font-family: var(--font-noto-jp), sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
}
.co-mission__sign strong { display: block; font-weight: 500; font-size: 18px; color: #ffffff; }

/* ── 2. Vision — sticky statement on paper ───────────────────────────── */
.co-vision { position: relative; background: var(--c-paper); color: var(--c-ink); }
.co-vision__spacer { height: calc(var(--vh-frozen) * 2.1); }
.co-vision__stick {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.co-vision__grain {
  position: absolute;
  inset: 0;
  background-size: 256px 256px;
  background-repeat: repeat;
  mix-blend-mode: multiply;
  opacity: 0.3;
  pointer-events: none;
}
.co-vision__marquee {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 900;
  font-size: clamp(140px, 24vw, 320px);
  line-height: 1;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  color: rgba(17, 27, 33, 0.045);
  pointer-events: none;
  will-change: transform;
}
.co-vision__inner { position: relative; width: 100%; }
.co-vision__line {
  display: block;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 800;
  font-size: clamp(30px, min(6.2vw, 9.5vh), 78px);  /* vh-bounded: see giant-text-crop memory */
  line-height: 1.28;
  letter-spacing: -0.01em;
  color: var(--c-ink);
  clip-path: inset(0 100% 0 0);   /* wiped in by scroll */
  text-wrap: balance;
}
.co-vision__line--accent { color: var(--c-blue); }
.co-vision__rule {
  margin-top: clamp(24px, 4vh, 44px);
  width: 72px;
  height: 1px;
  background: var(--c-blue);
  transform-origin: left center;
  transform: scaleX(0);
}
.co-vision__en {
  margin: 20px 0 0;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(17, 27, 33, 0.55);
  opacity: 0;
}

/* ── 3. Why AIOps — abyss + aurora, reading focus ────────────────────── */
.co-why {
  position: relative;
  overflow: hidden;
  background: var(--c-abyss);
  padding: clamp(96px, 14vh, 160px) 0;
}
.co-why__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
@media (min-width: 1024px) { .co-why__grid { grid-template-columns: 4fr 7fr; gap: 64px; } }
@media (min-width: 1024px) {
  .co-why__head { position: sticky; top: calc(var(--header-h) + 40px); align-self: start; }
}
.co-why__para {
  position: relative;
  padding-left: 0;
  margin: 0 0 2.2em;
  opacity: 0.22;
}
@media (min-width: 768px) { .co-why__para { padding-left: 56px; } }
.co-why__para p {
  margin: 0;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: clamp(16px, 1.25vw, 18px);
  line-height: 2.05;
  color: rgba(255, 255, 255, 0.88);
}
.co-why__para--lead p {
  font-weight: 500;
  font-size: clamp(19px, 1.9vw, 26px);
  line-height: 1.7;
  color: #ffffff;
  text-wrap: balance;
}
.co-why__idx {
  position: absolute;
  left: 0;
  top: 0.9em;
  display: none;
  color: var(--c-blue-light);
}
@media (min-width: 768px) { .co-why__idx { display: block; } }
.co-why__link { margin-top: 16px; }

/* ── 4. Values — sticky rail + editorial rows ────────────────────────── */
.co-values { position: relative; background: var(--c-light); padding: clamp(96px, 14vh, 160px) 0; }
.co-values__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; }
@media (min-width: 1024px) { .co-values__grid { grid-template-columns: 4fr 8fr; gap: 64px; } }
@media (min-width: 1024px) {
  .co-values__rail { position: sticky; top: calc(var(--header-h) + 40px); align-self: start; }
}
.co-counter {
  margin-top: 28px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: rgba(17, 27, 33, 0.45);
}
.co-counter__now {
  display: inline-block;
  min-width: 2ch;
  font-family: var(--font-poppins), sans-serif;
  font-weight: 700;
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}
.co-value {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px 24px;
  padding: 36px 0 40px;
}
@media (min-width: 768px) { .co-value { grid-template-columns: 56px minmax(0, 1fr); padding: 44px 0 48px; } }
.co-value__line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  background: var(--c-ink);
  transform-origin: left center;
  transform: scaleX(0);
}
.co-value:last-of-type::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--c-line-light);
}
.co-value__idx { color: var(--c-blue); padding-top: 0.6em; }
.co-value__title {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px 18px;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--c-ink);
}
.co-value__tag { color: rgba(17, 27, 33, 0.5); }
.co-value__body {
  margin: 0;
  grid-column: 1 / -1;
  max-width: 62ch;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: clamp(15px, 1.15vw, 17px);
  line-height: 1.95;
  color: var(--c-ink);
}
@media (min-width: 768px) { .co-value__body { grid-column: 2; } }

.co-never { margin-top: 72px; }
.co-never__title {
  margin: 0 0 24px;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 800;
  font-size: clamp(20px, 2vw, 26px);
  line-height: 1.4;
  color: var(--c-ink);
}
.co-never__item {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid var(--c-line-light);
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 500;
  font-size: clamp(17px, 1.5vw, 21px);
  line-height: 1.6;
  color: var(--c-ink);
}
.co-never__item:last-child { border-bottom: 1px solid var(--c-line-light); }
.co-never__x { color: var(--c-blue); }
.co-never__text { position: relative; display: inline-block; }
.co-never__strike {
  position: absolute;
  left: -2px;
  right: -2px;
  top: 55%;
  height: 2px;
  background: var(--c-blue);
  transform-origin: left center;
  transform: scaleX(0);
}

/* ── 5. Information (会社概要 + Access) ───────────────────────────────── */
.co-info { position: relative; background: var(--c-paper); padding: clamp(96px, 14vh, 160px) 0; }
.co-info__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 56px; }
@media (min-width: 1024px) { .co-info__grid { grid-template-columns: 6fr 5fr; gap: 80px; } }
.co-info__rows { margin-top: 40px; border-top: 1px solid var(--c-ink); }
.co-info__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 4px 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--c-line-light);
}
@media (min-width: 640px) { .co-info__row { grid-template-columns: 160px minmax(0, 1fr); padding: 20px 0; } }
.co-info__row dt {
  color: var(--c-blue);
  padding-top: 0.35em;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.12em;
}
.co-info__row dd {
  margin: 0;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: 17px;
  line-height: 1.8;
  color: var(--c-ink);
}
@media (min-width: 1024px) {
  .co-info__access { position: sticky; top: calc(var(--header-h) + 40px); align-self: start; }
}
.co-globe {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--c-line-light);
  background: #04101c;
}
@media (min-width: 640px) { .co-globe { aspect-ratio: 4 / 3; } }
@media (min-width: 1024px) { .co-globe { aspect-ratio: 5 / 5.4; } }
.co-info__addr {
  margin: 20px 0 0;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: 15px;
  line-height: 1.9;
  color: var(--c-ink);
}
.co-info__addr strong { display: block; font-weight: 500; font-size: 17px; }

/* ── 6. CTA — giant word ─────────────────────────────────────────────── */
.co-cta {
  position: relative;
  overflow: hidden;
  background: var(--c-navy);
  padding: clamp(96px, 16vh, 180px) 0 clamp(80px, 12vh, 140px);
  text-align: center;
}
.co-cta__meta {
  position: absolute;
  left: 16px;
  top: 28px;
  color: rgba(255, 255, 255, 0.35);
}
@media (min-width: 768px)  { .co-cta__meta { left: 24px; } }
@media (min-width: 1024px) { .co-cta__meta { left: max(32px, calc((100vw - 72rem) / 2 + 32px)); } }
.co-cta__word {
  display: block;
  font-family: var(--font-anton), Impact, sans-serif;
  font-size: clamp(64px, min(17vw, 22vh), 280px);
  line-height: 0.95;
  letter-spacing: -0.01em;
  color: var(--c-peri);
  text-decoration: none;
  opacity: 0;
  transform: translateY(90px) scale(0.96);
  transition: color 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}
.co-cta__word:hover,
.co-cta__word:focus-visible { color: var(--c-blue-light); outline: none; }
.co-cta__lead {
  margin: 28px auto 0;
  font-family: var(--font-noto-jp), sans-serif;
  font-weight: 300;
  font-size: clamp(16px, 1.4vw, 19px);
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.7);
  text-wrap: balance;
}
.co-cta__btn { margin-top: 32px; }

@media (prefers-reduced-motion: reduce) {
  .co-vision__line { clip-path: none; }
  .co-vision__rule, .co-value__line, .co-never__strike { transform: none; }
  .co-vision__en, .co-cta__word { opacity: 1; transform: none; }
  .co-why__para { opacity: 1; }
  .co-rail__fill { transform: scaleY(1); }
}
```

## 7. `src/app/company/_components/TerrainHero.tsx` (CREATE)

Raw WebGL (no three.js on this page — keeps `/company` ~600 KB lighter than an R3F mount). One
fullscreen triangle, one fragment pass. Letters come from a 2048×1024 mask texture drawn with
the real Poppins 700 on a 2D canvas (mip-biased sampling of that same texture is the halo).
Scroll is read from a plain object that a scrubbed GSAP tween writes into.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MASK_W = 2048; // POT so WebGL1 can mipmap it
const MASK_H = 1024;

const VERT = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// GLSL ES 1.0 so the same source runs on WebGL1 (with OES_standard_derivatives)
// and WebGL2. Uniforms live only in the fragment stage — no precision-mismatch
// link failures (see project_webgl_uniform_precision_link).
const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;      // 0..1, y up
uniform float uMouseAmp;   // 0..1
uniform float uReveal;     // 0..1 load reveal
uniform float uScroll;     // 0..1 hero scrub
uniform sampler2D uMask;   // letters, white on black, y down
uniform float uMaskOn;

/* 3D simplex noise — Ashima / Ian McEwan, MIT */
vec3 mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289v4(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289v4(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159-0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i =floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g =step(x0.yzx,x0.xyz);
  vec3 l =1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))+
    i.y+vec4(0.0,i1.y,i2.y,1.0))+
    i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j =p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x =x_*ns.x+ns.yyyy;
  vec4 y =y_*ns.x+ns.yyyy;
  vec4 h =1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    p = p * 2.02 + vec3(11.3, 7.1, 3.7);
    a *= 0.5;
  }
  return s;
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;                 // y up
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float s1 = smoothstep(0.0, 0.55, uScroll);        // spread: the letters' light leaves them
  float s2 = smoothstep(0.30, 1.0, uScroll);        // calm: dim, widen, tilt to a horizon

  // perspective fan-out as the map tilts
  p.x = (p.x - aspect * 0.5) * (1.0 + s2 * 0.9 * (1.0 - uv.y)) + aspect * 0.5;
  p.y *= 1.0 + s2 * 0.6;

  // --- breathing terrain ---
  float t = uTime * 0.09;
  float h = fbm(vec3(p * 1.15 + vec2(0.0, t * 0.35), t)) * 0.5 + 0.5;

  // --- pointer: hill under the cursor + rings travelling outward ---
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  float d = distance(p, m);
  h += uMouseAmp * 0.30 * exp(-d * d * 12.0);
  h += uMouseAmp * 0.045 * sin(d * 34.0 - uTime * 5.0) * exp(-d * 4.5);

  // --- letters (texture is y-down) ---
  vec2 muv = vec2(uv.x, 1.0 - uv.y);
  float mk   = texture2D(uMask, muv).r * uMaskOn;
  float mask = smoothstep(0.40, 0.60, mk);
  float glow = texture2D(uMask, muv, 5.0).r * uMaskOn;      // mip bias = free blur
  float bloom = smoothstep(0.25, 1.0, uReveal) * (1.0 - s1);
  float letterAmt = mask * bloom;
  float haloAmt   = glow * bloom;

  // --- contour density: sparse outside, dense inside; both widen when calm ---
  float widen = mix(1.0, 0.55, s2);
  float nOut = mix(16.0, 40.0, s1) * widen;
  float nIn  = 40.0 * widen;
  float n    = mix(nOut, nIn, letterAmt);
  float v    = h * n;
  float f    = abs(fract(v) - 0.5);
  float w    = fwidth(v) * 1.15;
  float line = 1.0 - smoothstep(0.0, w, f);
  float idx  = 1.0 - smoothstep(0.0, w * 1.6, abs(fract(v / 5.0) - 0.5) * 5.0); // every 5th = index contour
  line = max(line, idx * 0.85);

  // load reveal: contours are drawn from the valleys upward
  float rev = smoothstep(uReveal * 1.25 - 0.18, uReveal * 1.25 + 0.02, h);
  line *= (1.0 - rev);

  // --- colour ---
  vec3 navy  = vec3(0.043, 0.063, 0.125);   // #0b1020
  vec3 abyss = vec3(0.020, 0.047, 0.102);   // #050c1a
  vec3 peri  = vec3(0.239, 0.278, 0.753);   // #3d47c0
  vec3 blue  = vec3(0.376, 0.647, 0.980);   // #60a5fa
  vec3 white = vec3(0.86, 0.90, 1.0);

  float vig = smoothstep(0.2, 1.15, distance(uv, vec2(0.5, 0.45)) * 1.15);
  vec3 col = mix(navy, abyss, vig);
  col += peri * 0.10 * h * (1.0 - s2 * 0.7);
  col += peri * 0.16 * letterAmt;   // lifted floor inside the letters
  col += peri * 0.22 * haloAmt;     // halo outside the edges

  vec3 lineCol = mix(peri, blue, smoothstep(0.35, 0.85, h));
  lineCol = mix(lineCol, white, smoothstep(0.82, 0.98, h) * 0.6);
  float aOut  = mix(0.28, 0.85, s1);
  float alpha = mix(aOut, 1.0, letterAmt) * mix(1.0, 0.16, s2);
  alpha *= 1.0 + uMouseAmp * 0.9 * exp(-d * d * 5.0);
  col += lineCol * line * alpha;

  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.035; // grain
  gl_FragColor = vec4(col, 1.0);
}
`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;

function padFor(w: number): number {
  // Matches the site container: max-w 72rem (1152px) + px-4 / md:px-6 / lg:px-8
  if (w >= 1024) return Math.max(32, (w - 1152) / 2 + 32);
  if (w >= 768) return 24;
  return 16;
}

export default function TerrainHero() {
  const stickRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef     = useRef<HTMLDivElement>(null);
  const cueRef    = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const stick = stickRef.current;
    const canvas = canvasRef.current;
    const scene = stick?.parentElement ?? null;
    if (!stick || !canvas || !scene) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    const spacer = scene.querySelector<HTMLElement>('.co-scene__spacer');

    const uiItems = uiRef.current
      ? Array.from(uiRef.current.querySelectorAll<HTMLElement>('[data-hero-ui]'))
      : [];

    let logoReadySent = false;
    const sendLogoReady = () => {
      if (logoReadySent) return;
      logoReadySent = true;
      window.dispatchEvent(new Event('gift:logo-ready'));
    };

    // ── layout numbers shared by the mask painter and the DOM fallback ──
    const applyLayoutVars = (pad: number, fs: number) => {
      stick.style.setProperty('--hero-pad', `${pad}px`);
      stick.style.setProperty('--hero-fs', `${fs}px`);
    };
    applyLayoutVars(padFor(window.innerWidth), 120);

    // ── UI intro / scroll (runs in every path, WebGL or not) ──
    const cue = cueRef.current;
    let scrollCue: gsap.core.Tween | null = null;
    const hideCue = () => {
      if (scrollCue) { scrollCue.kill(); scrollCue = null; }
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.2, overwrite: true });
      window.removeEventListener('scroll', hideCue);
    };
    if (cue) gsap.set(cue, { autoAlpha: 0 });
    window.addEventListener('scroll', hideCue, { passive: true, once: true });

    const introTl = gsap.timeline({ paused: true });
    if (reducedMotion) {
      gsap.set(uiItems, { autoAlpha: 1 });
    } else {
      gsap.set(uiItems, { autoAlpha: 0, y: 22 });
      introTl.to(uiItems, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.9);
      if (cue) introTl.to(cue, { autoAlpha: 1, duration: 0.3 }, 2.2);
    }

    const state = { reveal: reducedMotion ? 1 : 0, scroll: 0 };
    let revealStarted = false;
    const startReveal = () => {
      if (revealStarted) return;
      revealStarted = true;
      introTl.play();
      if (!reducedMotion) gsap.to(state, { reveal: 1, duration: 2.2, ease: 'power2.out', delay: 0.1 });
    };

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: () => '+=' + Math.round(((spacer?.offsetHeight ?? window.innerHeight * 0.6) / 0.6) * 0.95),
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    scrollTl.to(state, { scroll: 1, ease: 'none', duration: 1 }, 0);
    if (uiItems.length) {
      scrollTl.to(uiItems, { autoAlpha: 0, y: -32, ease: 'none', duration: 0.3, stagger: 0.02 }, 0.12);
    }

    // ── WebGL ──
    const attrs: WebGLContextAttributes = {
      antialias: false, alpha: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance',
    };
    let gl: GL | null = null;
    let isGL2 = false;
    try {
      gl = canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null;
      isGL2 = !!gl;
      if (!gl) gl = canvas.getContext('webgl', attrs) as WebGLRenderingContext | null;
    } catch { gl = null; }

    let rafId = 0;
    let running = false;
    const stopLoop = () => { running = false; cancelAnimationFrame(rafId); };

    const goFallback = () => {
      stopLoop();
      setFallback(true);
      sendLogoReady();
      startReveal();
    };

    if (!gl) {
      goFallback();
      return () => {
        hideCue();
        introTl.kill();
        scrollTl.scrollTrigger?.kill();
        scrollTl.kill();
      };
    }

    // Context loss: NO preventDefault (that asks Chrome to restore and ticks the
    // guilty counter when it can't). Stop and show the static fallback.
    const onLost = () => goFallback();
    canvas.addEventListener('webglcontextlost', onLost);

    if (!isGL2 && !gl.getExtension('OES_standard_derivatives')) {
      canvas.removeEventListener('webglcontextlost', onLost);
      goFallback();
      return () => { hideCue(); introTl.kill(); scrollTl.scrollTrigger?.kill(); scrollTl.kill(); };
    }

    const glc = gl; // lowercase on purpose: `glc.useProgram` trips react-hooks/rules-of-hooks
    const compile = (type: number, src: string) => {
      const s = glc.createShader(type)!;
      glc.shaderSource(s, src);
      glc.compileShader(s);
      if (!glc.getShaderParameter(s, glc.COMPILE_STATUS)) {
        console.error('[TerrainHero] shader:', glc.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const fragSrc = (isGL2 ? '' : '#extension GL_OES_standard_derivatives : enable\n') + FRAG;
    const vs = compile(glc.VERTEX_SHADER, VERT);
    const fs = compile(glc.FRAGMENT_SHADER, fragSrc);
    const prog = glc.createProgram()!;
    if (!vs || !fs) { goFallback(); return () => { hideCue(); introTl.kill(); scrollTl.kill(); }; }
    glc.attachShader(prog, vs);
    glc.attachShader(prog, fs);
    glc.linkProgram(prog);
    if (!glc.getProgramParameter(prog, glc.LINK_STATUS)) {
      console.error('[TerrainHero] link:', glc.getProgramInfoLog(prog));
      goFallback();
      return () => { hideCue(); introTl.kill(); scrollTl.kill(); };
    }
    glc.useProgram(prog);

    // one triangle covers clip space — no index buffer
    const buf = glc.createBuffer()!;
    glc.bindBuffer(glc.ARRAY_BUFFER, buf);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), glc.STATIC_DRAW);
    const aPos = glc.getAttribLocation(prog, 'position');
    glc.enableVertexAttribArray(aPos);
    glc.vertexAttribPointer(aPos, 2, glc.FLOAT, false, 0, 0);

    const U = {
      res: glc.getUniformLocation(prog, 'uRes'),
      time: glc.getUniformLocation(prog, 'uTime'),
      mouse: glc.getUniformLocation(prog, 'uMouse'),
      amp: glc.getUniformLocation(prog, 'uMouseAmp'),
      reveal: glc.getUniformLocation(prog, 'uReveal'),
      scroll: glc.getUniformLocation(prog, 'uScroll'),
      mask: glc.getUniformLocation(prog, 'uMask'),
      maskOn: glc.getUniformLocation(prog, 'uMaskOn'),
    };

    // ── letter mask texture ──
    const tex = glc.createTexture()!;
    glc.activeTexture(glc.TEXTURE0);
    glc.bindTexture(glc.TEXTURE_2D, tex);
    glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, 1, 1, 0, glc.RGBA, glc.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    glc.uniform1i(U.mask, 0);
    glc.uniform1f(U.maskOn, 0);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = MASK_W;
    maskCanvas.height = MASK_H;
    const mctx = maskCanvas.getContext('2d');
    const family =
      getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() ||
      'Poppins, sans-serif';

    let w = 1, h = 1;
    const drawMask = () => {
      if (!mctx || !w || !h) return;
      const pad = padFor(w);
      mctx.setTransform(MASK_W / w, 0, 0, MASK_H / h, 0, 0);
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, w, h);
      mctx.fillStyle = '#fff';
      mctx.textBaseline = 'alphabetic';
      mctx.font = `700 100px ${family}`;
      const giftW = mctx.measureText('GIFT').width || 235;
      const maxW = w - pad * 2;
      const target = w < 768 ? maxW * 0.98 : Math.min(maxW * 0.62, 760);
      let size = (100 * target) / giftW;
      size = Math.min(size, (h * 0.46) / (2 * 0.86));
      size = Math.max(size, 56);
      mctx.font = `700 ${size}px ${family}`;
      const top = h * 0.19;
      const lineH = size * 0.86;
      const cap = size * 0.72;
      mctx.fillText('GIFT', pad, top + cap);
      mctx.fillText('INC.', pad, top + lineH + cap);
      applyLayoutVars(pad, size);

      glc.activeTexture(glc.TEXTURE0);
      glc.bindTexture(glc.TEXTURE_2D, tex);
      glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, false);
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, glc.RGBA, glc.UNSIGNED_BYTE, maskCanvas);
      glc.generateMipmap(glc.TEXTURE_2D);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR_MIPMAP_LINEAR);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
      glc.uniform1f(U.maskOn, 1);
    };

    // Wait for the real Poppins before painting (a fallback-font paint followed by
    // a swap would visibly re-shape the letters); 1.5 s cap so a slow font never
    // holds the reveal hostage.
    let maskPainted = false;
    const paintOnce = () => {
      if (maskPainted) return;
      maskPainted = true;
      drawMask();
      startReveal();
    };
    const fontSpec = `700 100px ${family}`;
    if (typeof document.fonts?.load === 'function') {
      document.fonts.load(fontSpec).then(paintOnce, paintOnce);
    } else {
      paintOnce();
    }
    const fontCap = window.setTimeout(paintOnce, 1500);

    // ── sizing ──
    const dprCap = isMobile ? 1 : 1.25;
    let maskResizeTimer = 0;
    const resize = () => {
      const r = stick.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      glc.viewport(0, 0, canvas.width, canvas.height);
      glc.uniform2f(U.res, canvas.width, canvas.height);
      if (maskPainted) {
        window.clearTimeout(maskResizeTimer);
        maskResizeTimer = window.setTimeout(drawMask, 150);
      }
    };
    resize();
    // Only re-lay-out on WIDTH change or a large height change (mobile URL bar
    // jitter must not re-rasterise the letters mid-scroll).
    let lastW = window.innerWidth, lastH = window.innerHeight;
    const onResize = () => {
      const cw = window.innerWidth, ch = window.innerHeight;
      if (cw === lastW && Math.abs(ch - lastH) < ch * 0.25) return;
      lastW = cw; lastH = ch;
      resize();
    };
    window.addEventListener('resize', onResize);

    // ── pointer / wander ──
    const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, energy: 0, amp: 0, seen: false };
    let prevX = 0.5, prevY = 0.55;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      const dx = nx - prevX, dy = ny - prevY;
      prevX = nx; prevY = ny;
      mouse.tx = nx; mouse.ty = ny; mouse.seen = true;
      mouse.energy = Math.min(1, mouse.energy + Math.hypot(dx, dy) * 14);
    };
    if (!isTouch && !reducedMotion) window.addEventListener('pointermove', onMove, { passive: true });

    // ── render loop (gated on visibility) ──
    let last = 0, elapsed = 0, frames = 0;
    const render = (now: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(render);
      if (!last) last = now;
      if (!reducedMotion) elapsed += Math.min(64, now - last);
      last = now;
      const tSec = elapsed * 0.001;

      let amp: number;
      if (isTouch || reducedMotion) {
        if (!reducedMotion) {
          mouse.tx = 0.5 + 0.32 * Math.sin(tSec * 0.21);
          mouse.ty = 0.55 + 0.22 * Math.cos(tSec * 0.17);
        }
        amp = reducedMotion ? 0 : 0.45;
      } else {
        mouse.energy *= 0.965;
        mouse.amp += (mouse.energy - mouse.amp) * 0.15;
        amp = mouse.seen ? 0.2 + 0.8 * mouse.amp : 0;
      }
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      glc.uniform1f(U.time, tSec);
      glc.uniform2f(U.mouse, mouse.x, mouse.y);
      glc.uniform1f(U.amp, amp);
      glc.uniform1f(U.reveal, state.reveal);
      glc.uniform1f(U.scroll, state.scroll);
      glc.drawArrays(glc.TRIANGLES, 0, 3);

      frames += 1;
      if (frames === 2) sendLogoReady();
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      last = 0;
      rafId = requestAnimationFrame(render);
    };

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) startLoop(); else stopLoop();
    }, { threshold: 0 });
    io.observe(stick);
    const onVis = () => { if (document.hidden) stopLoop(); else if (onScreen) startLoop(); };
    document.addEventListener('visibilitychange', onVis);
    startLoop();

    // belt-and-braces: never leave the root cover up because a frame never came
    const readyCap = window.setTimeout(sendLogoReady, 2500);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(fontCap);
      window.clearTimeout(readyCap);
      window.clearTimeout(maskResizeTimer);
      hideCue();
      introTl.kill();
      scrollTl.scrollTrigger?.kill();
      scrollTl.kill();
      canvas.removeEventListener('webglcontextlost', onLost);
      glc.deleteTexture(tex);
      glc.deleteBuffer(buf);
      glc.deleteProgram(prog);
      glc.deleteShader(vs);
      glc.deleteShader(fs);
      // never loseContext(): it ticks Chrome's guilty counter (project memory)
    };
  }, []);

  return (
    <div ref={stickRef} className="co-scene__stick">
      <canvas ref={canvasRef} className="co-hero__canvas" aria-hidden />

      <div className="co-hero__fallback" data-active={fallback ? '' : undefined} aria-hidden>
        <div className="co-hero__fb-words">
          <span>GIFT</span>
          <span>INC.</span>
        </div>
      </div>

      <div ref={uiRef} className="co-hero__ui">
        <p className="co-hero__eyebrow co-mono" data-hero-ui>About us — 会社概要</p>
        <h1 className="co-hero__title" data-hero-ui>人生が変わるきっかけを、贈る。</h1>
        <p className="co-hero__sub" data-hero-ui>Gift an opportunity.</p>
        <p className="co-hero__meta co-mono" data-hero-ui>Est. 2018 — Sapporo, Japan</p>
        <div ref={cueRef} className="co-hero__cue" aria-hidden><span /></div>
      </div>
    </div>
  );
}
```

Notes for the executor: keep the shader strings byte-for-byte; the letters are intentionally
NOT DOM text (the fallback words are the only DOM copy of them). The `h1` is the page's only
`<h1>`.

## 8. `src/app/company/_components/CompanyScroll.tsx` (CREATE — replaces `CompanyAnimations.tsx` + `CeoMessageReveal.tsx`)

```tsx
'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';

gsap.registerPlugin(ScrollTrigger, SplitText);

const ZWSP = String.fromCharCode(0x200b);
const E = 'expo.out';

// Same grain the homepage About section bakes (HPAbout.tsx) — paper texture.
function makeGrainUrl(size = 256, amplitude = 18): string {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const id = ctx.createImageData(size, size);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.floor((Math.random() - 0.5) * 2 * amplitude);
    d[i] = 128 + n;
    d[i + 1] = 128 + n;
    d[i + 2] = 128 + n;
    d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c.toDataURL();
}

/**
 * Scroll orchestrator for /company. Rendered LAST inside <main> so this effect
 * runs after every section's own effect; the flash guard is released in a rAF
 * at the very end, after all initial states exist (see project_dx_navigation_flash_fix).
 */
export default function CompanyScroll() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('main.company-page');
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;

    const grain = root.querySelector<HTMLElement>('.co-vision__grain');
    if (grain) grain.style.backgroundImage = `url(${makeGrainUrl()})`;

    const release = () => requestAnimationFrame(() => root.removeAttribute('data-flash-guard'));

    if (reduced) {
      // company.css's reduced-motion block paints every final state.
      release();
      return;
    }

    // ---- Lenis: desktop only. Touch scroll doesn't deliver continuous events,
    //      so Lenis starves ScrollTrigger on phones (project memory). ----
    let lenis: Lenis | null = null;
    let lenisRaf: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      // ---- Section labels: rule grows, text slides in (timeline → toggleActions, never once) ----
      root.querySelectorAll<HTMLElement>('.co-label').forEach((label) => {
        const rule = label.querySelector<HTMLElement>('.co-label__rule');
        const text = label.querySelector<HTMLElement>('.co-label__text');
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (text) gsap.set(text, { opacity: 0, x: -14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: label, start: 'top 88%', toggleActions: 'play none none none' },
        });
        if (rule) tl.to(rule, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' });
        if (text) tl.to(text, { opacity: 1, x: 0, duration: 0.55, ease: E }, '-=0.25');
      });

      // ---- h2 char reveal on enter (tween + once is safe) ----
      root.querySelectorAll<HTMLElement>('[data-co-heading]').forEach((el) => {
        const split = SplitText.create(el, { type: 'chars' });
        splits.push(split);
        gsap.set(split.chars, { opacity: 0, y: 40, display: 'inline-block' });
        gsap.to(split.chars, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.025, ease: E,
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      });

      // ---- Generic fade-up (signature, address, buttons) ----
      root.querySelectorAll<HTMLElement>('[data-co-fade]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.85, ease: E,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });

      // ---- Mission: phrase-by-phrase scrub. Copy is U+200B-segmented so a
      //      "word" is a phrase box; breaks only ever fall between phrases. ----
      const missionParas = Array.from(root.querySelectorAll<HTMLElement>('#mission [data-co-phrases]'));
      if (missionParas.length) {
        const split = SplitText.create(missionParas, {
          type: 'words',
          wordsClass: 'co-w',
          wordDelimiter: { delimiter: ZWSP, replaceWith: '' },
        });
        splits.push(split);
        gsap.set(split.words, { display: 'inline-block', whiteSpace: 'nowrap', opacity: 0.14 });
        missionParas.forEach((p) => {
          const words = Array.from(p.querySelectorAll<HTMLElement>('.co-w'));
          if (!words.length) return;
          gsap.to(words, {
            opacity: 1, duration: 0.5, stagger: 0.05, ease: 'none',
            scrollTrigger: { trigger: p, start: 'top 78%', end: 'bottom 45%', scrub: 0.35 },
          });
        });
      }
      const railFill = root.querySelector<HTMLElement>('#mission .co-rail__fill');
      const missionBody = root.querySelector<HTMLElement>('#mission .co-mission__body');
      if (railFill && missionBody) {
        gsap.to(railFill, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: missionBody, start: 'top 60%', end: 'bottom 60%', scrub: 0.3 },
        });
      }

      // ---- Vision: sticky statement, lines wipe in sequence; marquee rides the scroll ----
      const vSpacer = root.querySelector<HTMLElement>('.co-vision__spacer');
      const vLines = Array.from(root.querySelectorAll<HTMLElement>('.co-vision__line'));
      const vRule = root.querySelector<HTMLElement>('.co-vision__rule');
      const vEn = root.querySelector<HTMLElement>('.co-vision__en');
      if (vSpacer && vLines.length) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: vSpacer, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        });
        vLines.forEach((line, i) => {
          tl.fromTo(
            line,
            { clipPath: 'inset(0 100% 0 0)', x: -24 },
            { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 0.28, ease: 'none' },
            0.06 + i * 0.24,
          );
        });
        if (vRule) tl.to(vRule, { scaleX: 1, duration: 0.1, ease: 'none' }, 0.8);
        if (vEn) tl.to(vEn, { opacity: 1, duration: 0.1, ease: 'none' }, 0.86);
      }
      const vSection = root.querySelector<HTMLElement>('#vision');
      const marquee = root.querySelector<HTMLElement>('.co-vision__marquee');
      if (vSection && marquee) {
        gsap.fromTo(marquee, { xPercent: 0 }, {
          xPercent: -22, ease: 'none',
          scrollTrigger: { trigger: vSection, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
        });
      }

      // ---- Why AIOps: reading focus — bright in the band, dim outside it ----
      root.querySelectorAll<HTMLElement>('.co-why__para').forEach((para) => {
        const keep = para.hasAttribute('data-co-keep');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: para, start: 'top 88%', end: keep ? 'top 40%' : 'bottom 12%', scrub: 0.35 },
        });
        tl.fromTo(para, { opacity: 0.22 }, { opacity: 1, duration: 0.32, ease: 'none' });
        if (!keep) {
          tl.to(para, { opacity: 1, duration: 0.36, ease: 'none' });
          tl.to(para, { opacity: 0.32, duration: 0.32, ease: 'none' });
        }
      });

      // ---- Values: hairline draws, content enters, sticky counter follows ----
      const counterNow = root.querySelector<HTMLElement>('[data-co-counter]');
      root.querySelectorAll<HTMLElement>('.co-value').forEach((row, i) => {
        const line = row.querySelector<HTMLElement>('.co-value__line');
        const idx = row.querySelector<HTMLElement>('.co-value__idx');
        const title = row.querySelector<HTMLElement>('.co-value__title');
        const body = row.querySelector<HTMLElement>('.co-value__body');
        if (line) {
          gsap.to(line, {
            scaleX: 1, ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 62%', scrub: 0.3 },
          });
        }
        const items = [idx, title, body].filter((n): n is HTMLElement => !!n);
        if (items.length) {
          gsap.fromTo(items, { opacity: 0, y: 26 }, {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: E,
            scrollTrigger: { trigger: row, start: 'top 82%', once: true },
          });
        }
        if (counterNow) {
          const label = String(i + 1).padStart(2, '0');
          const setCounter = () => {
            if (counterNow.textContent === label) return;
            counterNow.textContent = label;
            gsap.fromTo(counterNow, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: E });
          };
          ScrollTrigger.create({
            trigger: row, start: 'top 55%', end: 'bottom 55%',
            onEnter: setCounter, onEnterBack: setCounter,
          });
        }
      });

      // ---- Anti-values: the strike is drawn by the scroll ----
      root.querySelectorAll<HTMLElement>('.co-never__item').forEach((item) => {
        const strike = item.querySelector<HTMLElement>('.co-never__strike');
        const text = item.querySelector<HTMLElement>('.co-never__text');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: item, start: 'top 72%', end: 'top 42%', scrub: 0.3 },
        });
        if (strike) tl.to(strike, { scaleX: 1, ease: 'none', duration: 1 }, 0);
        if (text) tl.to(text, { opacity: 0.45, ease: 'none', duration: 1 }, 0);
      });

      // ---- Information rows ----
      const rows = gsap.utils.toArray<HTMLElement>('.co-info__row');
      if (rows.length) {
        gsap.set(rows, { opacity: 0, x: -28 });
        gsap.to(rows, {
          opacity: 1, x: 0, duration: 0.6, stagger: 0.06, ease: E,
          scrollTrigger: { trigger: rows[0], start: 'top 86%', once: true },
        });
      }

      // ---- CTA: the giant word rises with the scroll ----
      const ctaSection = root.querySelector<HTMLElement>('#contact-cta');
      const ctaWord = root.querySelector<HTMLElement>('.co-cta__word');
      if (ctaSection && ctaWord) {
        gsap.to(ctaWord, {
          opacity: 1, y: 0, scale: 1, ease: 'none',
          scrollTrigger: { trigger: ctaSection, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
        });
      }
    }, root);

    // ---- Refresh points: fonts, late layout, frozen-vh re-measure ----
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    const t1 = window.setTimeout(refresh, 800);
    const t2 = window.setTimeout(refresh, 2000);
    window.addEventListener(VH_FROZEN_CHANGE, refresh);

    release();

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener(VH_FROZEN_CHANGE, refresh);
      ctx.revert();
      splits.forEach((s) => { try { s.revert(); } catch { /* ignore */ } });
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
```

## 9. Deletions (all tracked in git — recoverable; nothing else imports them, verified by grep)

```
src/components/sections/HeroClipText.tsx
src/app/company/_components/CompanyAnimations.tsx
src/app/company/_components/CeoMessageReveal.tsx
src/app/company/_components/CompanySphereBg.tsx
src/app/company/_components/StrengthDots.tsx
src/app/company/_components/MissionGrainBg.tsx
src/app/company/_components/CompanyMarquee.tsx
src/app/company/_components/CompanyStatsBar.tsx
src/app/company/_components/StaggeredInfoTable.tsx
src/app/company/company-redesign.css
src/app/dev/capture-company-hero/page.tsx        (dev tool for the old hero; /dev/* is 301'd anyway)
public/company/hero-field.webp
public/company/hero-iridescent-loop.mp4
public/company/hero-iridescent-loop.webm
public/company/hero-leak.webp
public/lottie/company-orbit-hero.json
public/lottie/company-orbit-blob.json
public/lottie/company-orbit-strength.json
public/lottie/company-orbit-values.json
public/lottie/company-strength-dots.json
public/lottie/company-strength-dots-tall.json
public/lottie/company-strength-dots-values.json
public/lottie/company-strength-dots-values-tall.json
scripts/generate-company-orbit.mjs
scripts/company-orbit.source.json
scripts/company-strength-dots.source.json
scripts/company-strength-dots-tall.source.json
```

KEEP: `src/app/company/_components/AccessGlobe.tsx` (reused), `StoryTimeline.tsx` (History is
parked "一旦非表示" — file stays, it is simply no longer imported), every other `public/lottie/*`,
`fonts.ts`, `navTheme.ts` (COMPANY_THEME already equals HOME_THEME).

## 10. `src/app/company/page.tsx` (REPLACE whole file)

All Japanese copy is the existing approved copy, unchanged. The Mission paragraphs are the same
sentences segmented into phrase units with U+200B (`ph([...])`) for the scrub. One new line of
copy: the CTA lead — 「まずは、お話から。」 as first written, replaced on the manager's
instruction (2026-09-02) with 「お気軽にお問い合わせください」, no trailing 。 as they wrote it.

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Footer from '@/components/layout/Footer';
import AuroraLines from '@/components/sections/AuroraLines';
import company from '@/data/company.json';
import TerrainHero from './_components/TerrainHero';
import CompanyScroll from './_components/CompanyScroll';
import './company.css';

const AccessGlobe = dynamic(() => import('./_components/AccessGlobe'), { ssr: false });

export const metadata: Metadata = {
  title: '会社概要',
  description:
    'GIFTがAIOpsに取り組む理由、その背景と思想。会社情報・ミッション・ビジョン・バリューをご紹介します。',
  alternates: { canonical: '/company' },
};

// Phrase boundaries for the Mission scrub: each unit becomes one unbreakable
// inline-block, so lines only ever break between phrases (same device as WhoWeAre).
const ZWSP = String.fromCharCode(0x200b);
const ph = (parts: string[]) => parts.join(ZWSP);

const MISSION = [
  ph(['GIFTは、', '現場から', '生まれた', '会社です。', '人と組織が', '毎日向き合い、', '成果を', '積み上げる——', 'そんな現場を、', '私たちは', '長年にわたって', '動かしてきました。']),
  ph(['その経験の中で、', '私たちは', '気づきました。', 'どれだけ', '優れた', 'ツールが', 'あっても、', '使いこなせる', '人と、', '使い続けられる', '仕組みが', 'なければ、', '何も', '変わらない。', '現場こそが、', '変化の', '起点だと', 'いうことを。']),
  ph(['AIが', '急速に', '普及するいま、', 'この問いは', 'さらに', '切実に', 'なっています。', '多くの企業で', 'AIが', '「導入されたまま', '止まっている」', '現実が', 'あります。', '技術の', '問題では', 'ありません。', '現場の仕事に', '溶け込んで', 'いないから、', '人が', '使わないのです。']),
  ph(['GIFTが', 'AIOpsに', '取り組むのは、', 'この課題を、', '私たち自身の', '現場経験から', '解けると', '確信している', 'からです。', '人とAIが、', '毎日の', '業務の中で', '一緒に動く——', 'その状態を', 'つくることが、', '私たちの', '使命です。']),
];

const WHY = [
  'GIFTはもともと、大規模な現場組織を運営してきた会社です。エンジニアではない多くのスタッフが、毎日の業務の中で成果を出す——そんな環境を長年にわたって動かしてきました。',
  'その経験から、私たちは確信しています。AIが本当に力を発揮するのは、ツールを導入したときではなく、現場の一人ひとりが日常的に使いこなせるようになったときだということを。',
  'AIを動かすのは、会社の中身です。業務の流れ、判断基準の言語化、顧客との対話ルール——それらが整ってはじめて、AIは現場で成果を出す存在になります。私たちはその「中身」をつくることを、現場で学んできました。',
  '専門知識がなくても、AIを使いこなせる組織をつくる。GIFTがAIOpsに取り組む理由は、ここにあります。',
];

const infoRows = [
  { label: '会社名', value: `${company.name} / ${company.nameEn}` },
  { label: '設立', value: company.founded },
  { label: '代表取締役', value: company.ceo },
  { label: '所在地', value: company.address },
  { label: 'TEL', value: company.phone },
  { label: '事業内容', value: 'AIOps事業' },
  { label: 'インボイス番号', value: company.invoiceNumber },
];

const values = [
  { num: '01', title: '素直に吸収する。', label: '学び', body: '新しいツールも、他者の意見も、まずは受け止める。学び続ける姿勢が、私たちの成長を加速させます。' },
  { num: '02', title: '寄り添って動かす。', label: '共感', body: 'お客様の隣に立ち、課題を共に背負う。理解した上で、本当に意味のある一歩を一緒に進めます。' },
  { num: '03', title: '熱を伝染させる。', label: '情熱', body: '一人の本気が、チームを、お客様を、社会を動かす。私たちは熱量で、人と未来を巻き込みます。' },
];

const antiValues = ['古いやり方にしがみつく', '受け身で、変化を恐れる'];

const GMAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

function Label({ text, tone }: { text: string; tone: 'dark' | 'light' }) {
  return (
    <div className={`co-label co-label--${tone}`}>
      <span className="co-label__rule" aria-hidden />
      <span className="co-label__text">{text}</span>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <>
      <main className="company-page" data-flash-guard="">

        {/* ── 1. Scene: hero + mission over one sticky WebGL terrain ─────── */}
        <div className="co-scene">
          <TerrainHero />
          <div className="co-scene__spacer" aria-hidden />

          <section id="mission" className="co-mission co-body-dark">
            <div className="co-container co-mission__grid">
              <div className="co-mission__head">
                <Label text="Mission" tone="dark" />
                <h2 className="co-h2 text-white" data-co-heading>
                  <span className="block">関わるすべての人に、</span>
                  <span className="block">
                    人生が変わる<span className="text-[#60a5fa]">きっかけ</span>を贈る。
                  </span>
                </h2>
                <p className="co-mission__en">
                  Gift an <em>opportunity.</em>
                </p>
              </div>

              <div className="co-mission__body">
                <div className="co-rail" aria-hidden>
                  <span className="co-rail__fill" />
                </div>
                {MISSION.map((text, i) => (
                  <p key={i} data-co-phrases>{text}</p>
                ))}
                <div className="co-mission__sign" data-co-fade>
                  株式会社GIFT 代表取締役
                  <strong>{company.ceo}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── 2. Vision — sticky statement on paper ──────────────────────── */}
        <section id="vision" className="co-vision">
          <div className="co-vision__spacer">
            <div className="co-vision__stick">
              <div className="co-vision__grain" aria-hidden />
              <div className="co-vision__marquee" aria-hidden>
                Vision — Vision — Vision — Vision — Vision — Vision —
              </div>
              <div className="co-container co-vision__inner">
                <Label text="Vision" tone="light" />
                <h2 className="m-0">
                  <span className="co-vision__line">AIが当たり前の時代にこそ、</span>
                  <span className="co-vision__line co-vision__line--accent">人の心を動かす</span>
                  <span className="co-vision__line">会社であり続ける。</span>
                </h2>
                <div className="co-vision__rule" aria-hidden />
                <p className="co-vision__en">Move hearts, even in the age of AI.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Why AIOps — abyss + aurora (homepage AIOps echo) ─────────── */}
        <section id="why" className="co-why co-body-dark">
          <AuroraLines
            className="pointer-events-none absolute inset-0"
            ribbons={5}
            intensity={0.5}
            mouseParallax={false}
          />
          <div className="co-container co-why__grid relative z-10">
            <div className="co-why__head">
              <Label text="Why AIOps" tone="dark" />
              <h2 className="co-h2 text-white" data-co-heading>
                <span className="block">なぜ、GIFTは</span>
                <span className="block">AIOpsなのか。</span>
              </h2>
            </div>
            <div>
              {WHY.map((text, i) => {
                const lead = i === WHY.length - 1;
                return (
                  <div
                    key={i}
                    className={`co-why__para${lead ? ' co-why__para--lead' : ''}`}
                    data-co-keep={lead ? '' : undefined}
                  >
                    <span className="co-why__idx co-mono" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p>{text}</p>
                  </div>
                );
              })}
              <div className="co-why__link" data-co-fade>
                <Link href="/services/aiops" className="cta-btn cta-btn--on-navy">
                  <span>AIOps事業を見る</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Values — sticky rail + editorial rows ───────────────────── */}
        <section id="values" className="co-values co-body-light">
          <div className="co-container co-values__grid">
            <div className="co-values__rail">
              <Label text="Values" tone="light" />
              <h2 className="co-h2" data-co-heading>価値観</h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'rgba(17,27,33,0.6)' }}>
                GIFTが大切にしている3つの行動指針
              </p>
              <div className="co-counter co-mono" aria-hidden>
                <span className="co-counter__now" data-co-counter>01</span>
                <span>/ 03</span>
              </div>
            </div>

            <div>
              {values.map((v) => (
                <article key={v.num} className="co-value">
                  <span className="co-value__line" aria-hidden />
                  <span className="co-value__idx co-mono">{v.num}</span>
                  <h3 className="co-value__title">
                    {v.title}
                    <span className="co-value__tag co-mono">( {v.label} )</span>
                  </h3>
                  <p className="co-value__body">{v.body}</p>
                </article>
              ))}

              <div className="co-never">
                <Label text="We'll never" tone="light" />
                <h3 className="co-never__title">私たちが、選ばない姿勢。</h3>
                {antiValues.map((item) => (
                  <div key={item} className="co-never__item">
                    <span className="co-never__x co-mono" aria-hidden>×</span>
                    <span className="co-never__text">
                      {item}
                      <span className="co-never__strike" aria-hidden />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Information — 会社概要 + Access ─────────────────────────── */}
        <section id="information" className="co-info co-body-light">
          <div className="co-container co-info__grid">
            <div>
              <Label text="Company information" tone="light" />
              <h2 className="co-h2" data-co-heading>会社概要</h2>
              <dl className="co-info__rows">
                {infoRows.map((row) => (
                  <div key={row.label} className="co-info__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="co-info__access">
              <Label text="Access" tone="light" />
              <div className="co-globe">
                <AccessGlobe />
              </div>
              <p className="co-info__addr" data-co-fade>
                <strong>{company.name}</strong>
                {company.address}
                <br />
                TEL: {company.phone}
              </p>
              <a
                href={GMAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="animated-button animated-button--company mt-6"
                data-co-fade
              >
                <span className="text">Google Mapsで開く</span>
                <span className="circle" />
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── 6. CTA — the page's one giant word ─────────────────────────── */}
        <section id="contact-cta" className="co-cta">
          <p className="co-cta__meta co-mono">Sapporo, Japan — Est. 2018</p>
          <div className="co-container">
            <Link href="/contact" className="co-cta__word" aria-label="お問い合わせ">
              CONTACT
            </Link>
            <p className="co-cta__lead">まずは、お話から。</p>
            <div className="co-cta__btn" data-co-fade>
              <Link href="/contact" className="cta-btn cta-btn--on-navy">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <CompanyScroll />
      </main>
      <Footer />
    </>
  );
}
```

## 11. `loading.tsx` + `layout.tsx`

`src/app/company/loading.tsx` (REPLACE whole file):

```tsx
// Suspense fallback for /company — solid-colour overlay in the page's true
// first-paint colour (navy terrain scene). No skeleton content: anything
// content-shaped drifts out of sync on the next redesign (project memory).
export default function CompanyLoading() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: '#0b1020' }} />;
}
```

`src/app/layout.tsx` — inside the inline `#page-cover` script, extend the existing
`/services/aiops` branch (change ONLY this block):

```js
                if (location.pathname.indexOf('/services/aiops') === 0) {
                  cover.style.background = 'linear-gradient(160deg, #0b0b0e 0%, #17181c 100%)';
                } else if (location.pathname.indexOf('/company') === 0) {
                  // /company: navy WebGL terrain hero — the light default would
                  // flash before the dark scene paints.
                  cover.style.background = '#0b1020';
                }
```

## 12a. Corrections applied after the visual review (2026-09-02, Fable) — the repo files are authoritative

Found by a Playwright probe against the dev server (1440×900, 1536×730, 390×844) and fixed
directly in the repo. The code blocks above predate these; where they differ, the repo wins.

1. **Shader failed to compile on every browser** — `fwidth: no matching overloaded function`.
   A GLSL ES 1.00 shader on a **WebGL2** context has no `fwidth` (the extension directive is
   WebGL1-only). Fix: one `FRAG_BODY`, two headers — WebGL1 = `#extension
   GL_OES_standard_derivatives` + `#define SAMPLE texture2D` / `OUT_COLOR gl_FragColor`;
   WebGL2 = `#version 300 es` + `out vec4 fragColor` + `#define SAMPLE texture` /
   `OUT_COLOR fragColor`; matching `VERT_GL1` (`attribute`) / `VERT_GL2` (`in`).
2. `const G = gl` → `const glc = gl`: a PascalCase alias makes `G.useProgram` look like a React
   hook to `react-hooks/rules-of-hooks` (a `next build` blocker).
3. `disposed` flag in TerrainHero: Strict Mode re-runs the effect and the first run's pending
   `document.fonts.load()` callback painted into a deleted texture.
4. DOM fallback letters (`.co-hero__fb-words`) now carry `data-hero-ui`, and `uiItems` is
   queried from the stick, so they intro-fade and scroll out like the rest of the UI.
5. **Headings**: a bare char split turns every character into a break opportunity and the JP
   orphan rules die (desktop showed 「関わるすべ / ての人に、」). Headings are now U+200B
   phrase-segmented in `page.tsx` and split `type: 'words, chars'` with the ZWSP delimiter;
   words are `inline-block; nowrap`. Mission h2 is three explicit lines.
6. `.co-mission__grid` / `.co-why__grid` desktop columns 4fr/7fr → **5fr/6fr** (head column was
   too narrow for the 44px h2).
7. `.co-vision__line`: min font 30px → **24px** (13 chars must fit 390px — a lone 「、」 was
   orphaned) and `word-break: normal; overflow-wrap: normal` so kinsoku applies.
8. `.co-why` `overflow: hidden` → **`overflow: clip`** (hidden made the section the scroll
   container and the sticky head never stuck).
9. `.co-hero__title` `max-width: 22ch` → `min(16.5em, 100% - 32px)` (15 JP chars on one line).
10. Vision grain opacity 0.3 → 0.25; `.co-value__tag` 12px / 0.06em tracking (mono tracking on
    JP read as 「( 学 び )」).

## 12. Verification (executor) — in this order, report raw output

1. `npx tsc --noEmit` — must be clean. **Never** run `npm run build` or `npm run dev` (the
   owner's dev server may be up; a build corrupts its `.next` chunks).
2. `npx eslint "src/app/company/**/*.{ts,tsx}" src/app/layout.tsx` — report; fix only errors in
   the files this spec creates.
3. `npm run check:encoding` — must be clean (Japanese copy; mojibake guard).
4. Grep `src/` for any remaining reference to a deleted module/asset:
   `HeroClipText|CompanySphereBg|StrengthDots|CompanyAnimations|CeoMessageReveal|MissionGrainBg|CompanyMarquee|CompanyStatsBar|StaggeredInfoTable|company-redesign.css|hero-field.webp|hero-iridescent|generate-company-orbit`
   — expect zero hits outside comments in `LiquidHero.tsx` (a comment; leave it).
5. Do not commit or push. Report: files created/replaced/deleted, each command's output,
   anything skipped or ambiguous — stop and report rather than guess on any design question.

## 13. Why AIOps background v2 — "Strata" (2026-09-02, after the manager's reaction)

The manager rejected the `AuroraLines` echo: "too similar to the main HP". Lesson recorded in
memory: match the homepage's palette and type, never its set pieces.

**Replacement concept.** The hero is the ground seen from above (contour map). Why AIOps is the
ground in **cross-section**: geological strata. Surface layers are thin, crowded and turbulent
(the noisy 現場); the deeper you read, the layers become wider, straighter and brighter — the
company's 中身（業務の流れ・判断基準の言語化・対話ルール）put in order, which is exactly what the
copy says AI needs. Layers parallax at different rates with the scroll (surface moves most, so
you *descend*), and breathe slowly in time. 2D canvas, ~14 polylines per frame, 30 fps cap,
paused offscreen, one static frame under reduced motion. Same wrapper contract as AuroraLines
(`className` = absolute inset-0 layer; a static base gradient paints before the first frame).

`src/app/company/_components/StrataBg.tsx` (CREATE):

```tsx
'use client';

import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  layers?: number;    // default 14
  intensity?: number; // line/band opacity multiplier, default 1
};

export default function StrataBg({ className = '', layers = 14, intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = Math.min(Math.max(Math.round(layers), 4), 24);
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCALE = isMobile ? 0.5 : 0.6;
    const SAMPLES = isMobile ? 48 : 80;

    let W = 2, H = 2;
    const resize = (): boolean => {
      const r = canvas.getBoundingClientRect();
      const nw = Math.max(2, Math.floor(r.width * SCALE));
      const nh = Math.max(2, Math.floor(r.height * SCALE));
      if (nw === W && nh === H) return false;
      W = nw; H = nh;
      canvas.width = W;
      canvas.height = H;
      return true;
    };
    let roTimer = 0;
    const scheduleResize = () => {
      if (roTimer) clearTimeout(roTimer);
      roTimer = window.setTimeout(() => {
        roTimer = 0;
        if (resize() && drawnOnce) draw(lastSec, lastProg);
      }, 160);
    };
    const ro = new ResizeObserver(scheduleResize);
    ro.observe(canvas);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    // Per-layer phases/frequencies fixed at mount so the strata never re-roll.
    const seeds = Array.from({ length: n }, (_, i) => ({
      p1: i * 1.37 + 0.4, p2: i * 2.11 + 1.9, p3: i * 0.73 + 3.1,
      f1: 1.6 + ((i * 7) % 5) * 0.18,
      f2: 3.1 + ((i * 3) % 4) * 0.27,
      f3: 6.2 + ((i * 5) % 3) * 0.4,
    }));

    const xs = new Float32Array(SAMPLES + 1);
    const ys = new Float32Array(SAMPLES + 1);
    const prevYs = new Float32Array(SAMPLES + 1);
    let drawnOnce = false;
    let lastSec = 0;
    let lastProg = 0.5;

    const draw = (time: number, prog: number) => {
      ctx.clearRect(0, 0, W, H);
      const aspect = W / H;
      const par = (prog - 0.5) * H * 0.16; // parallax budget (surface layers use most of it)

      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);                     // 0 = surface, 1 = deepest
        const depth = Math.pow(t, 1.12);           // spacing widens with depth
        const baseY = H * (0.04 + depth * 0.94);
        const amp = H * (0.055 * (1 - t) * (1 - t) + 0.004); // turbulent top, calm bottom
        const shift = par * (1 - t) * 0.9;
        const s = seeds[i];
        const tt = time * (0.10 + (1 - t) * 0.12);

        for (let k = 0; k <= SAMPLES; k++) {
          const u = k / SAMPLES;
          const x = u * aspect * 2.4;
          const nz =
            Math.sin(x * s.f1 + s.p1 + tt) * 0.55 +
            Math.sin(x * s.f2 - s.p2 + tt * 1.6) * 0.3 +
            Math.sin(x * s.f3 + s.p3 - tt * 0.7) * 0.15;
          xs[k] = u * W;
          ys[k] = baseY + nz * amp + shift;
        }

        // band between the previous layer and this one — alternating, deeper = denser
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(xs[0], prevYs[0]);
          for (let k = 1; k <= SAMPLES; k++) ctx.lineTo(xs[k], prevYs[k]);
          for (let k = SAMPLES; k >= 0; k--) ctx.lineTo(xs[k], ys[k]);
          ctx.closePath();
          const fa = (i % 2 === 0 ? 0.035 : 0.065) * (0.5 + t) * intensity;
          ctx.fillStyle = `rgba(61, 71, 192, ${fa})`;
          ctx.fill();
        }

        // the stratum line: dim periwinkle at the surface → brighter sky-blue deep
        const r = Math.round(61 + (96 - 61) * t);
        const g = Math.round(71 + (165 - 71) * t);
        const b = Math.round(192 + (250 - 192) * t);
        const la = (0.12 + 0.24 * t) * intensity;
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let k = 1; k <= SAMPLES; k++) ctx.lineTo(xs[k], ys[k]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${la})`;
        ctx.stroke();

        prevYs.set(ys);
      }
      drawnOnce = true;
    };

    // Scroll progress of this layer through the viewport: 0 = top edge at the
    // viewport bottom, 1 = bottom edge at the viewport top. Read per frame; no
    // GSAP coupling needed.
    const progress = () => {
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };

    const FRAME_MS = 1000 / 30;
    let lastFrame = -Infinity;
    const t0 = performance.now();
    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (reduced && drawnOnce) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      lastSec = reduced ? 0 : (now - t0) / 1000;
      lastProg = reduced ? 0.5 : progress();
      draw(lastSec, lastProg);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (roTimer) clearTimeout(roTimer);
      ro.disconnect();
      io.disconnect();
    };
  }, [layers, intensity]);

  return (
    <div className={className} style={{ position: 'absolute', inset: 0 }}>
      {/* static base: abyss at the surface, a touch more blue at depth — paints before frame 1 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #050c1a 0%, #060e22 55%, #0a1330 100%)',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
```

`page.tsx`: replace the `AuroraLines` import with `import StrataBg from './_components/StrataBg';`
and the `<AuroraLines … />` element with
`<StrataBg className="pointer-events-none absolute inset-0" layers={14} intensity={1} />`.
`AuroraLines.tsx` stays (the homepage uses it).

## 18. Information — the globe's field becomes the section (2026-09-02, requested)

Manager: make the Information background "the same bg as our globe … for the whole bg and put
it some gradiantion to it". The globe panel was a `#04101c` box cut into paper, which read as a
screenshot pasted onto the page; now that field IS the section and the panel is transparent, so
it runs straight through and only the hairline marks the frame. Safe to do because `cobe` builds
its context with `alpha: true` and clears to `(0,0,0,0)` — the canvas is transparent everywhere
the sphere is not, so nothing paints an opaque rectangle over the gradient.

**The gradation** is three layers on `.co-info`: a periwinkle bloom behind the globe column
(`rgba(54,59,158,.26)` at 78 % 20 %), a fainter blue one opposite it (`rgba(37,99,235,.10)` at
6 % 60 %), and a vertical ramp `#04101c → #050f1e 42% → --c-navy 86% → 100%`. Both blooms are
deliberately sized to fade out well above the bottom edge and the ramp holds `--c-navy` over the
last 14 %: the CTA below is flat `--c-navy`, and a first cut whose bloom survived to the boundary
drew a visible horizontal seam across the page there.

**Everything inside had to flip** from ink-on-paper to light-on-dark: section class
`co-body-light → co-body-dark`, both labels `tone="light" → "dark"`, 会社概要 gets `text-white`,
the table's top rule `--c-ink → rgba(255,255,255,.34)`, row rules `--c-line-light →
--c-line-dark`, `dt --c-blue → --c-blue-light`, `dd`/address to white at 88 %/82 %. The Maps
button is the shared light-page `animated-button--company` (blue on paper, near-black label on
the expanding circle), so `.co-info` scopes an override: ring and label `--c-blue-light`, white
label on hover. Left alone: the globe itself, the info-card overlay (already dark), Access
layout, and every scroll behaviour.

## 17. Why AIOps background — liquid spheres in OGL (2026-09-02, requested)

Requested by the user, not proposed: "put some animation on the bg with a webgl using ogl …
spheres 3 or four that look like liquid". This is a background layer only — the v4 stage
mechanism (§16) is untouched and stays the section's scroll device.

**Concept.** Four spheres joined by a polynomial smooth-min (`uK`, base 0.62) so they bridge
and pull apart like drops of liquid. One OGL fragment pass (`Renderer` + `Triangle` +
`Program`, ESSL 1.00 so the same shader runs on WebGL1 and WebGL2) sphere-traces the field,
keeping the closest approach for a soft anti-aliased edge. The shader's background is the
section's own CSS gradient evaluated in **section space** (`uBgOff`/`uBgScale` = where the
canvas sits inside the section), so the canvas edge is invisible and the static fallback is
the same picture minus the spheres. Grain 0.03 like the hero.

**Shaded as GLASS, not solid balls** (manager, same day the first version shipped: "the main
actor should be the writing in why aiops not the blob … make it transparent but visible").
`shadeGlass()` returns colour AND a per-pixel alpha, and the alpha is where the transparency
lives: `0.05` straight through the middle — a watermark, not a surface — rising to only ~`0.47`
at grazing angles (`fres = (1−n·v)^2.6`), with the tight glint floored in via
`max(a, sp1·0.60)` so a drop still catches the light, and a small lift in the folds. These
numbers were halved once already after "the blob is still too strong, it has to be more
transparent". Colour is a thin periwinkle tint through the body
(`PERI·0.42`) blending to the environment reflection at the rim (`reflect` → vertical ramp
abyss → peri/blue), plus a blue Fresnel edge, a white Blinn-110 key glint and a broad blue
fill glint. What you see is the rim, the glints and the seams where two drops merge; the
middle is essentially the background. The previous version — an opaque `BODY` fill with
diffuse terms — is gone. `uAmt` (1 desktop / 0.9 phone) is now only a nudge.

**Motion.** Orbits are computed on the CPU (`ORBITS` in `WhyLiquidBg.tsx`): per sphere a
Lissajous path (x/y/z amplitude, 0.11–0.21 rad/s, spread phases → 30–50 s periods; some pair
is always merging or letting go) plus 5 % radius breathing. x amplitudes and radii scale with
`clamp(aspect·0.95, 0.5, 1)` so a portrait phone keeps the cluster in view. The cluster centre
leans toward the pointer (±0.35 scene units, eased 0.04/frame; desktop only) and rides
slowly upward with the section's read (`(progress − 0.5)·0.8`) — a depth layer, not a scrub.

**Every viewport, re-proportioned on portrait.** It was briefly desktop-only, then the manager
asked for it back on phones "resized at a proper size". A phone's visible half-width at the
cluster's depth is only ~1.0 scene unit against ~3.5 on a wide desktop, so the desktop numbers
put ONE blob across ~70 % of the screen — a foreground object, not a background (built that
way once; it looked wrong). `fit(aspect)` interpolates on `k = (aspect − 0.46) / 1.14`:
radius ×`0.34 → 0.72`, sideways drift ×`0.34 → 1.0`, vertical drift ×`1.30 → 1.0`. Portrait
therefore gets a tight horizontal roam so drops stay in frame and a longer vertical travel
that uses the tall frame. `uK` follows the radius scale — a fixed smooth-min radius against
small spheres merges them into one mush. The radius row was pulled down twice on the
manager's word (both ends, desktop included): the largest drop is now ≈ 24 % of screen width
on a wide desktop and ≈ 32 % on a phone.
**Note the stage is the opposite:** desktop-only, see §16b.

**Cost / safety.** The canvas is a viewport-sized `position: sticky` stage inside an absolute
wrapper the height of the section (constant pixel count however tall the section; `overflow:
clip` on the section keeps sticky alive). Render scale 70 % of DPR capped at 1 on desktop,
55 % capped at 0.8 on phones (a DPR-3 phone draws 312×675 for a 390×844 CSS box) — a soft
background needs no device resolution and raymarch cost is per pixel. March steps are baked
into the shader source at startup (ESSL 1.00 needs a constant loop bound): 80 desktop, 52
phone, which four convex blobs converge well inside. Phones also blend the blobs back to
`uAmt 0.82`, since the copy sits straight over them with no stage column to hide behind.
`ogl` still loads as its own chunk via `import('ogl')` inside the effect, so it never blocks
first paint. A `#ifdef GL_FRAGMENT_PRECISION_HIGH` guard falls back to `mediump` rather than
failing to compile on an old WebGL1 phone.
Loop runs only while `#why` intersects and the tab is visible; resize only on width change or
>25 % height change (URL bar). `webglcontextlost` listener registered BEFORE `new Renderer`
(OGL has no loss handling of its own), no `preventDefault`, never `loseContext()`; on loss or
any shader/link failure the canvas simply never gets `data-ready` and the CSS gradient shows.
Reduced motion draws one still frame. New dependency: `ogl@1.0.11` (ESM, bundled types).

**Knobs.** The alpha line in `shadeGlass()` (`0.05 + 0.42·fres`) is the transparency dial —
raise the constant to make the drops more present, raise the `fres` factor for a harder edge.
Then `fit()` (per-aspect composition — the phone sizing lives here), `uK` base `0.62`
(bridging distance), `ORBITS` (sizes/speeds), the `env`/`fres`/glint weights in `shadeGlass()`,
`steps` and the dpr factors in `resize()` (render cost), `uAmt`, pointer lean `0.35`,
parallax `0.8`.

## 16b. Why AIOps stage — desktop only (2026-09-02, same day as §17)

The manager screenshotted the phone view of the stage and asked for it gone: "that thing is
still being shown on the mobile … i want to keep that on desktop but not on mobile". So
`@media (max-width: 1023px) { .co-why__stage { display: none } }` — the SAME breakpoint as the
liquid background (§17), and `CompanyScroll` skips building the timeline there (`stageOn`).
Below 1024px the section is now the four paragraphs as plain type over the plain gradient.

It was also broken on phones, which is probably what drew the eye: the band is `42dvh`
(min 300px) with `var(--header-h)` + 12px of padding, leaving ~262px of content box on a 390×844
phone, while four blocks at `clamp(50px, 8vh, 84px)` + three 6px gaps + the 現場 ground line
need ~326px. `justify-content: flex-end` + `overflow: clip` pushed the overflow upward, so the
blue AI block was clipped along its top edge on every phone size. Deleted with the band: the
`margin/padding-inline` override for 768–1023px and the `.co-why__ground` phone padding.
**If the stage is ever wanted back on phones, shrink the blocks first — do not just unhide it.**

## 16. Why AIOps v4 — the thesis builds itself (2026-09-02, after the fourth reaction)

v3 (inertia) was rejected too: "that animation and the bg still ain't fitting for a proper
showing to my manager". Pattern across all three rejections: every Why attempt was a *quiet,
text-level* effect, while the sections that survived (hero, Vision, Values) are pinned, big and
obviously scroll-driven. So v4 changes kind: a visible, scrubbed construction that SHOWS the
argument.

**Concept.** Paragraph 3 names the 中身 AI needs: 業務の流れ / 判断基準の言語化 / 顧客との
対話ルール. A sticky **stage** (right column on desktop, `top: header+32px`, `min(72vh,640px)`;
a `42dvh` band pinned at the top on phones with the text scrolling beneath it) holds a ground
line labelled 現場. One scrubbed timeline over the text column (`start: 'top 72%'`,
`end: 'bottom 55%'`, scrub 0.6): the three foundation blocks slide in from alternating sides
(`xPercent ∓135 → 0`, `power3.out`) and stack on the ground; the blue **AI** block drops from
above (`yPercent −420 → 0`, `power2.in`); the stack compresses on impact (`scaleY .96`,
origin bottom) and springs back (`back.out(2.5)`); the three foundations light up
(border/background → blue). The four paragraphs are plain readable type (bold lead + light
rest, no numbering). Reduced motion shows the built state. Repo files: `company.css`
("3. Why AIOps"), `page.tsx` (`co-why__stage` markup, stage first in DOM), `CompanyScroll.tsx`.
**Two backgrounds and three text effects have now been rejected on this section — the next
change here needs a re-brief with the manager, not another variation.**

## 15. Why AIOps v3 — inertia (2026-09-02, after the manager's third reaction)

Rejected: the aurora bg (v1, "too similar to the main HP"), the strata bg (v2, "still doesn't
convince me"), the mono indices, and the reading-focus opacity scrub (both versions). Two
backgrounds down = no third animated background: the surface is a plain deep-navy gradient
(`--c-navy → --c-abyss`) and the effect lives on the text.

**Concept — velocity, not position.** Every other section answers "where am I in the scroll";
this one answers "how am I scrolling". Each paragraph is a bold opening sentence (Noto 500,
the final one 800 and larger) plus a light continuation; the nine blocks (8 sentences + the
link) are `[data-co-inertia-item]`. A `gsap.ticker` loop reads `ScrollTrigger.getVelocity()`
(Lenis on desktop, native on phones), normalises it (÷1800 px/s, clamp ±1), runs it through a
light spring (`vel += (target − v)·0.18; vel *= 0.72; v += vel`) and writes three
`quickSetter`s per block: `y = v·34px·d`, `skewY = v·5.5°·(0.55+0.45d)`,
`scaleY = 1+|v|·0.05`, with `d = i/(n−1)` so lower blocks lag and shear more (the column fans
like fabric). Below a threshold everything is reset to identity — at rest the text is plain
text. The loop runs only while `#why` is within a viewport (`onToggle`). `StrataBg.tsx` was
deleted; the sticky head and the label/heading reveal stay. Repo files are the code.

## 14. Values v2 — the kinetic push machine (2026-09-02, after the manager's second reaction)

Rejected (strike 1 on Values): the sticky rail with the 01/03 counter, the mono indices, the
hairlines drawing on scroll, the fade-up rows and the scroll-drawn strike-through. The manager's
words: "I don't like at all the numbering neither the scrolling animation … you are repeating
the same animation throughout many sections". So: no numbers, and a mechanism that exists
nowhere else on the page — no opacity, no line-draw, no clip wipe, no reveal-on-enter.

**Concept.** One pinned viewport (sticky 100dvh inside a `calc(var(--vh-frozen) * 3.8)`
spacer). Each value = tag + title + body as one `<li>` of a **masked stack** (all items share
one grid cell, so they are equal height); the scroll pushes the current item up and out while
the next rises in, with holds between (`translateY((i − vs) × 100%)`). Behind the text a giant
**outlined kanji** for the active value (学 / 共 / 熱, `-webkit-text-stroke`, transparent fill)
pushes DOWN while the text pushes up (`translateY((vs − i) × 110dvh)`; a first cut used a
sideways exit, which left ghost glyphs lingering behind the next title). The 4th state is
選ばない姿勢: the two anti-values are **hollow** outlined type — never inked, never chosen —
which replaces the strike-through with typography. Everything is driven by ONE number, `--vs`
(0..3), set on `.co-values__inner` by a scrubbed GSAP proxy with `power3.inOut` pushes of 0.35
after holds of 0.65 (timeline 0.65→1, 1.65→2, 2.65→3, tail hold to 3.35). Reduced motion unpins
and lists the four states in flow. The repo files are the code: `company.css` (§ "4. Values"),
`page.tsx` (`values[].kanji`, the `co-values__*` markup), `CompanyScroll.tsx` (the
`valuesInner` block).

