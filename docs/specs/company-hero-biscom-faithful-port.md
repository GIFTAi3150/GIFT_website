# /company Hero — Faithful biscom.jp/10th Port (Implementation Spec)

> **For the implementing agent (Sonnet):** This spec is the result of a full source-level
> reverse-engineering of https://biscom.jp/10th/ (their `index.js` bundle, `common.css`,
> `top.css`, and HTML were fetched and decoded on 2026-06-12). Every constant below is
> verified from their shipped code — do not re-derive or "improve" them. Follow the spec;
> where a GIFT adaptation is needed it is explicitly marked **[ADAPT]**.

---

## 0. Critical context — read first

1. **This hero has burned multiple sessions.** Procedural fakes of the biscom look were
   rejected repeatedly. The user has now explicitly asked for **the same hero, built the
   way biscom actually builds it**. Do not substitute procedural approximations for the
   asset-based layers described here.
2. **The single most important correction** (previous sessions got this wrong):
   - The full-screen background is **NOT** a video and **NOT** fully procedural. It is a
     **static gradient image texture** (`bg-top-visual_02.webp` — light-grey paper with a
     soft cyan→blue blob upper-left and baked-in grain) sampled by a WebGL shader that
     multiplies an **animated simplex-noise brightness gradient** + grain over it and
     warps the mesh with a gentle sine. The visible motion comes from the **animated
     gradient**, not from warping the image.
   - The famous prismatic rainbow light is **`bg.mp4`, played inside the logo
     letterforms**: a `<video>` sits in a container div that has
     `clip-path: url(#holeclip)` where `#holeclip` is an SVG `<clipPath>` of the
     letterform paths. The rainbow never covers the whole screen.
   - The warm orange streak upper-right is a **DOM `<img>`** (`img-blur-effect.avif`,
     orange→red blade light-leak) composited with `mix-blend-mode: hard-light`, flown in
     by GSAP. It is not part of any shader.
3. **Existing file:** `src/components/sections/HeroClipText.tsx` (used by
   `src/app/company/page.tsx` line ~92). It already contains correct adaptations to KEEP
   (listed in §4). Its current fragment shader (cyan paper + in-shader prism dispersion +
   in-shader orange leak) is the procedural fake — it gets replaced.
4. **Project hard rules:** never run `git commit`/`git push`; PowerShell + Windows Node
   (no WSL); kill any dev server / free ports before ending the turn; probe
   `127.0.0.1:3000` not `localhost` if dev returns silent 404s.

---

## 1. Verified reference anatomy (biscom.jp/10th "top-visual")

### 1.1 DOM structure (simplified, from their HTML/CSS)

```html
<div class="top-visual" id="js-top-visual"
     style="width:100vw;height:100svh;position:fixed;top:0;left:0;z-index:5">
  <div class="top-visual__inner">            <!-- z-index:2, centered by grid -->
    <div class="top-visual__logo">           <!-- aspect-ratio:1262/420, width ~ 100vw - margins -->
      <h1 class="logo-mask">                 <!-- width:0, holds only the clipPath defs -->
        <svg viewBox="0 0 1261.8 419.3">
          <defs><clipPath id="holeclip" clipPathUnits="objectBoundingBox">
            <path d="...letterforms..."/>    <!-- CSS scales paths to 0..1 box:
                 .logo-mask svg clipPath path { transform: scale(.00079, .00238) } -->
          </clipPath></defs>
        </svg>
      </h1>
      <div class="top-visual__logo-inner" style="clip-path:url(#holeclip); overflow:hidden">
        <video src="/10th/img/bg.mp4" loop muted playsinline preload="auto"></video>
        <!-- object-fit:cover; the prism-light film shows ONLY through the letters -->
      </div>
      <div class="top-visual__loader-logo">…Lottie intro, removed after load…</div>
    </div>
    <div class="top-visual__desc">…JP description lines…</div>
  </div>
  <div class="top-visual__bg">               <!-- absolute, 100% / 100svh -->
    <canvas id="js-top-visual-canvas"></canvas>
    <div class="top-visual__canvas-overlay"></div>  <!-- grey #bbb cover, fades + remove()s -->
  </div>
  <img id="js-top-blur-effect" src="img/img-blur-effect.avif">  <!-- orange blade, hard-light -->
  <div class="top-visual__attention">…scroll cue…</div>
</div>
```

Key point: **the clip-path is applied to the container div** (`.top-visual__logo-inner`),
not to the `<video>` itself — this is the cross-browser-safe pattern (works in Safari).

### 1.2 WebGL background (their `VisualBg` class, OGL)

- Renderer: `dpr: 1`, `antialias: false`, `alpha: true`, `depth: false`,
  `premultipliedAlpha: false`. Clear color `(0,0,0,1)`.
- Geometry: **plane 2×2 (clip space) with 20×40 segments** — the sine vertex warp
  displaces real interior vertices. (A 4-vertex quad only skews corners — this is a bug
  in our current port; fix it.)
- Texture: the preloaded `Image` of `bg-top-visual_02.webp` (1 image, no video).
- Uniforms (type "top"): `uResolution`, `uTime`, `uTexture`,
  `uProgress: 0`, `uLineLength: isMobile ? 6 : 8`, `uDuration: isMobile ? .85 : .72`,
  `uPremultiply: isSafari ? 1 : 0`, `uShowProgress: 0`.
- Render loop: rAF gated by an `isRender` flag (`show()`/`hide()`), and
  `uTime = (t * .001 * 100 | 0) / 100` (quantized to 0.01 s).

### 1.3 Their shaders, verbatim (translated comments)

Vertex (`precision lowp` in theirs — see **[ADAPT]** precision note in §4):

```glsl
precision highp float;        // [ADAPT] highp in BOTH stages (see gotcha §4.3)
attribute vec2 uv;
attribute vec3 position;
uniform float uTime;
varying vec2 vUv;
const float freq = 3.;
const float amp  = .05;
void main() {
  vUv = uv;
  vec3 pos = position;
  float time = uTime * .6;
  pos.y += sin((vUv.x * freq * .35) + time) * amp;
  pos.x += sin((vUv.y * freq * .3)  + time) * amp;
  gl_Position = vec4(pos, 1.0);
}
```

Fragment (type "top", their `ev` shader — this is the whole field look):

```glsl
precision highp float;
uniform vec2  uResolution;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress;      // 0..1  — SCROLL-OUT column wipe (not the load reveal!)
uniform float uLineLength;    // 8 desktop / 6 mobile
uniform float uDuration;      // .72 desktop / .85 mobile
uniform float uPremultiply;   // 1 on Safari only
uniform float uShowProgress;  // 0..1  — load reveal: flat grey -> textured field
varying vec2  vUv;

/* 3D simplex noise — use the snoiseColor implementation already present in
   HeroClipText.tsx (it is byte-identical to biscom's). */
float snoiseColor(vec3 v) { /* …keep existing… */ }

float random(vec2 st){
  const vec2 k = vec2(12.9898, 78.233);
  return fract(sin(dot(st, k)) * 43758.5453123);
}
float random_02(float x){ return fract(sin(x * 12.9898) * 43758.5453123); }

vec3 drawNoise(vec2 uv){
  float level = .08;
  float x = uv.x * (10.5 * level);
  float y = (uv.y * 4.5 + uTime) * level;
  float z = uTime * .25;
  return vec3(snoiseColor(vec3(x, y, z)));
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;

  vec4 tex = texture2D(uTexture, vUv);

  // load reveal: flat grey 0.73 -> image
  tex.rgb = mix(vec3(0.73), tex.rgb, uShowProgress);

  // near-static fine grain (uTime * .000001 — effectively frozen; do NOT animate faster)
  float rnd = random(st + (uTime * .000001));
  rnd = (smoothstep(0., 1., rnd) - .5) * .5;
  vec3 noisy = vec3(rnd);

  // THE animated element: slow simplex brightness gradient multiplied over the image
  vec3 gradient = drawNoise(st) * .4;
  gradient = smoothstep(-1.8, 1.2, gradient) + .2;
  gradient -= noisy * .19;
  tex.rgb *= gradient;

  // scroll-out column wipe: uLineLength columns, random per-column delay, bottom-up
  float colIndex = floor(st.x * uLineLength);
  float r        = random_02(colIndex);
  float delay    = r * (1. - uDuration);
  float maskHeight = clamp((uProgress - delay) / uDuration, 0., 1.) * 2.;
  float edgeWidth  = 0.38;
  float mask  = smoothstep(maskHeight - edgeWidth, maskHeight, st.y);
  float alpha = mask;            // alpha 1 = visible; columns wipe to transparent

  // brighten as it wipes out
  tex.rgb += uProgress * .8;

  // Safari premultiply toggle
  vec3 outRgb = mix(tex.rgb, tex.rgb * alpha, clamp(uPremultiply, 0.0, 1.0));
  gl_FragColor = vec4(outRgb, alpha);
}
```

**Note the role swap vs our current port:** biscom's *load* reveal is the
`uShowProgress` grey→image fade (plus a DOM overlay fade). The **column wipe is the
scroll-out transition**, scrubbed by ScrollTrigger as the user scrolls past the hero.
Our current port misuses the column wipe as the load reveal — fix per §3 Phase C.

### 1.4 Load timeline (their `Cy` function, GSAP)

Order and timings (ease `expo.out` unless noted):

1. `.top-visual__canvas-overlay` autoAlpha 1→0, duration 1, delay .2, `power2.inOut`,
   then `remove()` — canvas starts rendering before this completes (`P.show()` first).
2. `uShowProgress` value→1, duration .8, `power1.in` (grey → textured field).
3. Logo letterform groups wipe in with `clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)`
   + `x: -10→0` / `-20→0`, durations .7–1.75, staggers .16–.25.
4. Description lines: `y 25→0`, autoAlpha→1, duration 1.2, `quart.out`, stagger .12.
5. Logo video: autoAlpha→1 over .1s, then `video.play()`; `video.playbackRate = .85`.
6. Orange blur img: from `x:15vw, y:30vh (18svh mobile), rotate:18` → all 0,
   autoAlpha→1, duration 1.6, `power1.out`.
7. Scroll cue autoAlpha→1, duration .2.
8. Lenis `start()` only after the intro (page is scroll-locked during it).

### 1.5 Scroll behavior (ScrollTrigger, `b = 1400` desktop / `1200` mobile)

The hero is `position:fixed`; the page scrolls over it. Scrubbed (scrub:0) over
`start: "top 0px"` → `end: "top -1400px"`:

- logo `y → -85svh`; description `y → -80svh` + color shift.
- logo+desc autoAlpha→0 at scroll -450px (toggleActions, .3s) and the video pauses.
- `uProgress` 0→1 scrubbed (scrub:1) between `-350px` and `-(1400+250+innerHeight*0.2)px`
  — the column wipe eats the canvas bottom-up.
- orange img flies away (`y:-600, x:-450, rotate:-20`) and fades.
- past `-1400px`: whole hero autoAlpha→0 (.4s), `P.hide()` (rAF stops),
  `video.pause()`, class `is-hide` (pointer-events none).

---

## 2. Asset slots (GIFT-owned — do NOT ship any biscom file)

| Slot | Reference original | GIFT replacement |
|---|---|---|
| Field texture | `bg-top-visual_02.webp` (grey paper, cyan→blue blob upper-left, baked grain) | **Generate ours**: `scripts/gen-hero-field.mjs` (Playwright 2D canvas — the pattern existed before and was deleted; recreate per §3 Phase A) → `public/company/hero-field.webp` |
| Letterform video | `bg.mp4` (filmed prismatic light on pale-blue paper) | `public/company/hero-letters.mp4` — **asset slot**. Until the user supplies/approves a clip, fall back to the dark-multiply text treatment (current behavior, user-approved). Component takes `letterVideoSrc?: string`; absent → fallback. |
| Orange light-leak | `img-blur-effect.avif` (orange→red blade) | Generate `public/company/hero-leak.webp` in the same gen script: transparent canvas, diagonal blade of radial/linear orange→deep-red gradient (reference avg color `#7d300b`, hot core `#ff6a1f`), heavy blur. Composited `hard-light` in DOM. |

Texture recipe for `hero-field.webp` (1600×900, export webp q≈80):
1. Fill `#e9e9e9`.
2. Radial blob centered ~(20%, 24%), radius ~48% of width: core `#7fe8dd` (cyan) →
   `#4b6ee0` (blue) at ~55% → transparent. Slight darker navy smudge at the far-left
   edge around y 20–40%.
3. Subtle white radial lift on the right half (keeps the paper bright).
4. **Baked grain is mandatory**: per-pixel random ±6–8 RGB levels over the whole canvas
   (this is why the warp/gradient reads as texture; without grain the field looks flat —
   a previously-rejected failure mode).

---

## 3. Implementation phases

Work happens in `src/components/sections/HeroClipText.tsx` (rename NOT required; the
import in `src/app/company/page.tsx` stays). Read the whole file before editing.

### Phase A — assets
1. Recreate `scripts/gen-hero-field.mjs` (Playwright is already a devDependency; verify
   with `npm ls playwright`, else use `node:canvas`-free approach: launch chromium,
   draw on a 2D canvas in-page, screenshot/export). Generate `hero-field.webp` and
   `hero-leak.webp` per §2. Commit nothing; just produce files under `public/company/`.
2. Eyeball both against the reference: open https://biscom.jp/10th/ side by side.

### Phase B — WebGL field rewrite (core)
1. Replace the current FRAG with §1.3's fragment (keep the existing `snoiseColor` GLSL
   block verbatim; keep `precision highp float` in BOTH stages).
2. Replace the 4-vertex quad with a **20×40-segment indexed grid** spanning −1..1
   (positions) with matching 0..1 uvs; draw with `gl.drawElements(gl.TRIANGLES, …)`.
   Keep the existing 1.06 oversize trick (canvas CSS 106vw/106svh, buffer ×1.06) —
   biscom's edge-exposure answer is unclear, ours works; **keep it** and keep plane at
   exactly −1..1 (the oversize absorbs the ±.05 warp).
3. Texture upload: `gl.texImage2D` from an `Image` of `/company/hero-field.webp`.
   NPOT image ⇒ `CLAMP_TO_EDGE` both axes, `LINEAR` min/mag, no mipmaps, and
   `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)`. Declare `uniform sampler2D uTexture;`
   (a previous attempt forgot this — compile fails).
   Until the image loads, render with `uShowProgress = 0` (flat grey 0.73 — this IS the
   intended pre-load state, no skeleton needed).
4. New uniforms + values: `uLineLength = matchMedia('(max-width: 768px)') ? 6 : 8`,
   `uDuration = mobile ? .85 : .72`, `uPremultiply = isSafari ? 1 : 0`
   (`isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)`),
   `uShowProgress` starts 0, `uProgress` starts 0.
5. Quantize time like biscom: `uTime = Math.floor(elapsedSeconds * 100) / 100`.
6. **Keep** (do not regress): webglcontextlost capture-phase guard, LINK/COMPILE status
   logging, IntersectionObserver + visibilitychange rAF gating, dpr cap 1.0,
   `gift:logo-ready` event dispatch, the resize/layout machinery.

### Phase C — load sequence rework
1. Add a DOM overlay div (solid `#bbbbbb`) over the canvas; GSAP: autoAlpha 1→0,
   duration 1, delay .2, `power2.inOut`, onComplete remove from DOM.
2. GSAP `uShowProgress` 0→1, duration .8, `power1.in`, starting with the overlay fade.
3. Letters: keep the existing `clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)` wipe
   (duration 1.25, expo.out, start ≈ 0.45s) — already faithful.
4. Description: switch to per-element rise `y 25→0`, 1.2s, `quart.out` (currently 0.9
   power3.out — minor fidelity fix).
5. Orange leak `<img>` (`hero-leak.webp`): absolute, upper-right (~right:-5vw,
   top:-5svh, width ~55vw), `mixBlendMode:'hard-light'`, `pointerEvents:'none'`;
   GSAP from `{x:'15vw', y:'30vh', rotate:18, autoAlpha:0}` to all-zero/autoAlpha 1,
   1.6s `power1.out`, position ≈1.0s into the timeline.
6. **uProgress is NOT animated at load anymore** — it stays 0 (field fully visible).

### Phase D — scroll-out (the signature move)
**[ADAPT]** /company's hero is in normal flow; do not make it `position:fixed` (it would
fight the page's Lenis/GSAP setup in `CompanyAnimations.tsx` — read that file first).
Use the sticky-wrapper equivalent:

1. Wrap the hero section in a `<div style={{height:'200svh'}}>`; the existing
   `<section>` becomes `position:sticky; top:0; height:100svh`.
2. ScrollTrigger (gsap ScrollTrigger is already used on this page — register once):
   - trigger = wrapper, `start:'top top'`, `end:'bottom bottom'`, scrub.
   - Map progress 0→1 to: `uProgress` 0→1 (the column wipe), logo/text `y → -85svh`
     and `y → -80svh`, leak img `y:-600, x:-450, rotate:-20` + fade.
   - At progress ≥ ~0.35: fade logo+desc out (.3s) — use a threshold callback or a
     short nested tween, biscom uses a separate trigger at -450px.
   - `onLeave` (scrolled past): stop the rAF loop (reuse existing `stopLoop()`);
     `onEnterBack`: restart. (Equivalent of their `P.hide()/show()`.)
3. The next section (`#ceo-message`) scrolls over the wiped hero naturally.
4. If this phase causes layout/flash issues with `loading.tsx` (project gotcha:
   Suspense fallbacks must match redesigns), check `src/app/company/loading.tsx`
   — use the solid-color overlay pattern, color `#bbbbbb` to match the pre-load state.

### Phase E — letterform video (asset-gated, optional)
Only if `public/company/hero-letters.mp4` exists / user supplies a clip:
1. Add inside the letters layer: a wrapper div with `clipPath:'url(#gift-letter-clip)'`
   + `overflow:hidden`, containing `<video src loop muted playsInline preload="auto">`
   with `object-fit:cover`, `playbackRate = 0.85`, faded in (.1s) then `.play()` at the
   same timeline position as biscom (step 5 in §1.4).
2. Define `<clipPath id="gift-letter-clip" clipPathUnits="userSpaceOnUse">` inside the
   existing hero SVG, containing `<text>GIFT</text>` and `<text>INC.</text>` clones
   positioned by the **existing** `layout()` function (it already measures Forum and
   sets x/y/font-size — apply the same attributes to the clipPath text nodes).
   Clip the **container div**, not the video (Safari).
3. Keep the dark-multiply SVG text as the no-video fallback (prop or file-existence
   switch at build time — simplest: `letterVideoSrc?: string` prop, page passes it
   only when the asset ships).
4. Pause the video whenever the hero is off-screen or hidden (reuse the IO handler).

### Phase F — QA gate (must pass before reporting done)
1. `npm run build` then `npm run start` — test production locally (flash bugs hide in
   dev). Probe `http://127.0.0.1:3000/company`.
2. Console: zero WebGL warnings/errors; verify LINK_STATUS path prints nothing.
3. Visual checks: (a) flat grey → field fade on load, no black flash; (b) field shows
   the cyan/blue blob upper-left over grey paper with visible grain + slowly waving
   brightness; (c) scrolling wipes the field out in random-delayed columns, bottom-up,
   brightening as it goes; (d) leak blade flies in upper-right and reads orange
   (hard-light over pale field); (e) mobile viewport: 6 columns, .85 duration, no
   horizontal scroll; (f) navigate away/back 3+ times — no context-loss cascade.
4. Reduced motion: respect `prefers-reduced-motion` — skip GSAP intro (set end states),
   keep field static (`uTime` frozen) — **[ADAPT]**, biscom doesn't do this.
5. Kill the server and free port 3000 before finishing.

---

## 4. Project gotchas that WILL bite (from memory, all previously paid for)

1. **Shared-uniform precision link failure**: `uTime` is in both stages — declare
   `precision highp float` in BOTH or the program silently fails to link (black canvas).
   Always check `gl.getProgramParameter(prog, gl.LINK_STATUS)`.
2. **Context-loss guard**: keep the capture-phase `webglcontextlost` listener that
   `preventDefault()`s and cancels the rAF. Never remove it.
3. **No `Cache-Control: immutable` issues**: video in dev can throw
   `ERR_CACHE_OPERATION_NOT_SUPPORTED` — already fixed in `next.config.js`; if it
   reappears for the new video, it is the disk cache, NOT WebGL.
4. **Grain only reads at native res** — when screenshot-verifying, use native-size
   clips, never downscaled thumbnails (grain/dispersion vanish when scaled).
5. **`gift-near-black` is LIGHT (#EBEEF3)** — for dark use `gift-ink`.
6. **Do not run git write commands.** The user commits.

---

## 5. Acceptance summary

The /company hero, after this work, = light-grey grainy paper field (image texture ×
animated simplex gradient, sine-warped on a segmented mesh) + GIFT/INC. Forum
letterforms (dark multiply now; prism video through clip-path when the asset ships) +
JP description + orange hard-light leak blade upper-right + column-wipe scroll-out over
a 200svh sticky range. Load: grey cover → field fade → letters wipe → desc rise → leak
fly-in → scroll cue.
