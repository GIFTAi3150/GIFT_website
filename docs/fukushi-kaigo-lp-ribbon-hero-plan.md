# /fukushi-kaigo-lp hero — ribbon knot (real-time WebGL)

Reference: a knot of twisted ribbons, one face white with printed text, the other a solid
colour, the text scrolling along the ribbons. We take the technique, not the brand: our navy
hero, our blues, and only this page's own words on the ribbons.

## Goal
- Full-bleed WebGL layer behind the whole navy hero (desktop and mobile).
- Centrepiece: 5 flat, twisted ribbons looped into a knot. Front face white with blue text,
  back face solid blue. Unlit, with a light facing-angle shade for depth.
- Nothing to hover. Motion is ambient: text scrolls along each ribbon, the knot turns slowly,
  a mouse tilts it a little, scrolling turns it a little more.

## Step 1 — Tooling
- `scripts/fukushi-kaigo-lp/package.json`: `three` + `esbuild` (own `node_modules`, gitignored,
  same pattern as `scripts/ai-catalog`).
- `scripts/fukushi-kaigo-lp/build-ribbon.mjs`: esbuild bundles `ribbon/src/ribbon-hero.js`
  (tree-shaken three, minified ESM) into `public/fukushi-kaigo-lp/assets/ribbon-hero.js`, copies
  three's LICENSE, and stamps `?rev=<hash>` into the page's script tag.

## Step 2 — Markup and layout
- `.gift-hero-bg` stays the full-bleed layer; it gets a second canvas for the ribbons above the
  existing text-wall canvas. The wall is dimmed on desktop and hidden on mobile.
- A `.gift-hero-stage` element takes the old photo slot (desktop: right columns under the
  headline; mobile: between the headline and the CTA). It is empty; it only reserves space and
  tells the script where to centre the knot.

## Step 3 — Ribbon geometry
- Each ribbon follows a closed `CatmullRomCurve3` through 8 points on a tilted ring with radial
  noise (fixed seeds, so the knot is designed, not random each load). Five rings at different
  tilts wrap one centre, like bands around a ball.
- 600 samples per ribbon; closed Frenet frames give tangent / normal / binormal.
- Width direction = normal rotated around the tangent by `twists · 2π · s + phase`
  (whole twists, so the loop closes cleanly).
- UVs: `u` = arc length, `v` = 0..1 across the ribbon.

## Step 4 — Text textures
- One canvas per ribbon (2048 × 160): white ground, blue `#2563EB` text, Noto Sans JP 800, phrases
  joined with ／. Wait for `document.fonts.load` with the exact strings first.
- The texture repeats an integer number of times along each ribbon (from arc length ÷ tile
  length), so the text tiles seamlessly around the loop. Mipmaps + max anisotropy.
- Copy (all from this page):
  1. 介護・障がい福祉・保育 ／ 現場の作業を、ぜんぶ書き出しました
  2. AI SKILL CATALOG ／ 851本 ／ 12事業 ／ 作業名で引ける
  3. real task names from the catalogue (送迎の遅れ一斉連絡 ／ シフト表のたたき台 ／ …)
  4. the 12 sector names in catalogue order
  5. LINEでカタログを受け取る ／ 無料の個別相談も

## Step 5 — Shader
- One `ShaderMaterial` per ribbon, `DoubleSide`.
- Front (`gl_FrontFacing`): texture at `(u · repeat − time · speed, v)`. Back: solid blue.
- Shade: `mix(0.78, 1.0, |N·V|)` so turns read as depth; no lights.
- Reveal: `discard` where `s > reveal(t)`, staggered per ribbon, so the knot draws itself in
  over ~1.6 s.

## Step 6 — Motion
- Text speed differs per ribbon (some reverse).
- Knot: slow Y rotation + gentle bob. Mouse tilts ±0.15 rad (eased, mouse only). Scrolling
  through the hero adds up to ~0.6 rad of turn.
- Reduced motion: one still frame, fully revealed, no loop.

## Step 7 — Placement
- On resize, read `.gift-hero-stage`'s rect, convert its centre to world space at the knot's
  depth, and scale the knot to fit the stage height (it may overflow the stage; the canvas is
  full-bleed so nothing clips).

## Step 8 — Robustness and performance
- `webglcontextlost` listener with `stopImmediatePropagation` registered BEFORE
  `new WebGLRenderer` (repo rule); never `forceContextLoss`. On loss: stop the loop, fall back.
- DPR ≤ 2 (≤ 1.5 on small screens), antialias on. Pause when the hero is off screen or the tab is
  hidden. ~6k vertices, 5 small textures.
- No WebGL: the stage collapses on mobile, the navy band stays.

## Step 9 — Verify
- Build, `node --check`, encoding check.
- Playwright on the user's dev server (never start one): desktop 1440 and mobile 390
  screenshots at reveal and settled, headline readability, reduced-motion and no-WebGL runs,
  zero console errors.
