# /company — Lottie Orbital-Sphere Background (Plan & Build Guide)

**Status:** NOT implemented yet. Investigation done, approach decided, asset not yet sourced.
**Goal:** Add a subtle animated "sphere / orbit" background behind the Mission, Vision, and Values
sections of `/company` to make the page feel more lively — replicating the look of the *Strength*
section on the reference site **https://alpha.plaid.co.jp/**.
**Decision (user, 2026-06-18):** Use **real Lottie**, the same technique the reference uses.

---

## 1. What the reference actually does (verified by reverse-engineering)

Investigated `alpha.plaid.co.jp` with raw HTML + a Playwright render. Findings are **certain**, not guessed:

- The site is built on **STUDIO** (`studio.design`, a Japanese no-code builder) on a **Nuxt** runtime.
- **Every animation on the page is a Lottie animation.** There are 12+ `<dotlottie-player>` web
  components, each loading a `.lottie` (dotLottie) file from `lottie.host`. They render to **SVG**.
- There is **no `<canvas>`, no WebGL/Three.js, and no `<video>`** anywhere on the page. The one
  `studioiframesandbox.com` embed is unrelated (a form/util box — contains no animation code).
- **Lottie is the export format of Adobe After Effects** (via the Bodymovin plugin). So the "sphere
  animation" is a **pre-authored, baked vector animation** dropped into the section background — not
  procedural code. The engineering effort was ~zero; the craft was in the motion design.
- **The Strength background specifically** = very thin, faint **curved arcs** (suggesting a sphere /
  orbit wireframe) sweeping across a pale grey-blue field, plus a few **slowly drifting dots**. It is
  minimal and abstract — *not* a glowing solid orb. (A large red blob near it belongs to the adjacent
  "Team" block, not Strength.)

**Implication for us:** we do not reproduce code — we obtain/author a matching Lottie asset and embed it.

---

## 2. Why this is cheap for us (no new dependency)

- `lottie-react@^2.4.1` is **already in package.json**. It plays Lottie **JSON** (`.json`).
- There is already a `public/lottie/` folder (`animation.json`, `saas-animation.json`, etc.) and an
  example component `public/lottie/LottieAnimation.tsx`. Follow that convention.
- A `.lottie` file (what PLAID uses) is just a zipped `.json` + assets. We can use a plain `.json`
  Lottie with the already-installed `lottie-react` — **no need to add `@lottiefiles/dotlottie-react`**.
  - *(Only add `@lottiefiles/dotlottie-react` if you specifically want the smaller `.lottie` container
    or the canvas renderer for perf. Not required.)*
- **No WebGL** → none of this site's documented WebGL context-loss landmines apply. This is the main
  reason Lottie was chosen over an R3F sphere.

---

## 3. STEP A — Get the Lottie asset (this is the real work)

You need one looping vector animation of **thin orbital arcs + a few drifting dots**, transparent
background, colored in our palette. Pick one route:

**Route 1 — LottieFiles marketplace (fastest).**
- Go to https://lottiefiles.com, search: `orbit`, `sphere wireframe`, `network globe`, `abstract lines`,
  `particles connect`, `constellation`. Prefer **shape-layer** (vector) animations, not ones with
  embedded raster images (those bloat the file and can't be recolored).
- Download as **Lottie JSON** (`.json`).
- **Recolor to our palette** (see §7): use the LottieFiles color editor on the site, OR the
  `lottie-colorify` npm helper, OR hand-edit the `c` (color) keys in the JSON. Easiest is to recolor in
  the LottieFiles web editor before download.

**Route 2 — Adobe After Effects + Bodymovin (authentic, full control).**
- Build the motion in AE (thin stroked ellipses rotating in 3D + small dots with position keyframes,
  8–16s seamless loop), then export with the **Bodymovin** / **LottieFiles AE plugin** to `.json`.
- This is exactly how PLAID's asset was almost certainly made and gives perfect palette + timing control.

**Route 3 — No After Effects.**
- **Jitter** (https://jitter.video, browser-based) or **Figma + a Lottie export plugin** can both export
  Lottie JSON from simpler timelines. Good middle ground if AE isn't available.

**Asset spec (hand to whoever makes it):**
- Transparent background, seamless loop **8–16s**, ease-in-out (no hard pops).
- 1–3 large **slow** arcs (thin strokes, ~1–2px at display size) + **4–8** small dots drifting.
- Keep it light: target **< ~150 KB** JSON, shape layers only, no embedded images.
- Deliver in our colors, or in a single flat color we can tint per section.
- Save to **`public/lottie/company-orbit.json`** (one shared asset is fine; recolor per section in code/JSON).

---

## 4. STEP B — Build the background component

Create **`src/app/company/_components/CompanySphereBg.tsx`**. Mirrors `public/lottie/LottieAnimation.tsx`
but is a full-bleed, viewport-gated, reduced-motion-aware background layer.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

type Props = {
  /** path under /public, e.g. "/lottie/company-orbit.json" */
  src?: string;
  /** 0–1; keep low so text stays readable */
  opacity?: number;
  className?: string;
};

export default function CompanySphereBg({
  src = "/lottie/company-orbit.json",
  opacity = 0.5,
  className = "",
}: Props) {
  const [data, setData] = useState<object | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // load JSON on the client only
  useEffect(() => {
    let alive = true;
    fetch(src).then((r) => r.json()).then((d) => alive && setData(d)).catch(() => {});
    return () => { alive = false; };
  }, [src]);

  // respect reduced motion + play only while in viewport (perf)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { lottieRef.current?.goToAndStop(0, true); return; }
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? lottieRef.current?.play() : lottieRef.current?.pause()),
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  if (!data) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={{ opacity }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }} // cover, not letterbox
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

Mount it in `page.tsx` via a **dynamic import with `ssr: false`** (Lottie touches `window`; this also
avoids hydration mismatch / CLS — same pattern already used for `AccessGlobe`):

```tsx
const CompanySphereBg = dynamic(() => import('./_components/CompanySphereBg'), { ssr: false });
```

---

## 5. STEP C — Mount into the three sections (exact anchors)

All three target sections are already `position: relative` with their text wrapped in a `z-10` div, so a
`z-0 absolute inset-0` child paints **above the section's background fill but below the text** — exactly
what we want. Insert `<CompanySphereBg .../>` as the **first child** of each section wrapper.

> File: `src/app/company/page.tsx` (line numbers are approximate — anchor on the classNames/ids).

1. **Mission** — `<section id="ceo-message" ...>` (~line 100). Background is cyan `rgb(156,203,218)`.
   Insert right after the opening `<section>` tag, before `<div className="relative z-10 ...">`.
   Use a darker / orange-tinted arc color for contrast on cyan. Suggested `opacity={0.45}`.

2. **Vision** — `<section className="relative overflow-hidden ... bg-white ...">` (~line 152).
   Background is **white**, so keep it very subtle. Insert before the `VISION` watermark `<span>`.
   Use light-grey / faint-orange arcs at low `opacity={0.3}` so the editorial text stays crisp.

3. **Values** — inside `#js-values-blc-bg` (~line 197), before `<section id="js-values-section">`.
   Background is **dark** (`rgba(27,23,16,0.65)` + orange radial glow), corners `rounded-2xl`
   `overflow-clip` (so the canvas auto-clips to the rounded card — good). Use **light/gold** arcs
   (e.g. `#f0d372` or warm white) at `opacity={0.4}`.

> If a single shared asset can't be recolored per section, ship 2–3 recolored copies
> (`company-orbit-dark.json`, `-light.json`, `-gold.json`) and pass `src` accordingly.

---

## 6. Readability, performance, accessibility

- **Readability first:** keep `opacity` low (0.3–0.5). After mounting, re-check text contrast on each
  section — the arcs must never compete with headings/body.
- **Perf:** Lottie renders SVG in the DOM; complex files get CPU-heavy. Use **one** asset per section,
  keep shape counts modest, and the IntersectionObserver gate (above) pauses it when off-screen.
  If you see jank with the SVG renderer, switch that asset to dotLottie + canvas renderer.
- **Reduced motion:** the component freezes at frame 0 when `prefers-reduced-motion: reduce` — keep that.
- **No WebGL** → no context-loss handling needed (the reason this approach was chosen).
- **Test like production:** `npm run build && npm run start`, then verify desktop + mobile, no layout
  shift, and no contrast regressions. (Project rule: always test flash/perf in a production build.)

---

## 7. Palette reference (verified from current code, 2026-06-18)

`/company` (the `company-palette` class on `<main>`) currently uses an **orange + cyan + dark-brown**
scheme — **not** the oxblood/bone in older notes (that memory is stale; current page wins):

| Use | Value |
| --- | --- |
| Primary accent (labels, rules, pills) | `#D95208` |
| Warm accent | `#F07A30` |
| Anti-values / deep accent | `#B84010` |
| Values number gold | `#f0d372` |
| Page background | `#EFF6F9` |
| Mission section bg (cyan) | `rgb(156, 203, 218)` |
| Values card bg (dark) | `rgba(27,23,16,0.65)` + glow `rgba(190,65,8,0.28)` |
| Heading ink / body | `#111B21` (`gift-ink`) / `#3A3A3A` (`gift-silver`) |

Theme the Lottie strokes from this table, per section (orange on cyan, faint grey/orange on white,
gold/warm-white on dark).

---

## 8. Open decisions for when we resume

1. All three sections, or just Mission + Vision? (Values is dark and already busy — optional.)
2. Asset source: LottieFiles (fast) vs After Effects (authentic) vs Jitter (no AE)?
3. One shared recolored asset vs distinct per-section assets?
4. Motion intensity — barely-there ambient (recommended, matches PLAID) vs more noticeable?

---

## 9. Reference artifacts

- Recon scratch (temp, may be cleared): `%TEMP%\plaid-recon\` — saved page model `page.json`, embed JS,
  sample `.lottie` files, and screenshots `el_strength_*.png`, `strength_view.png`.
- Reference Lottie host pattern: `lottie.host/<uuid>/<id>.lottie` played via `<dotlottie-player>`.
- Existing in-repo Lottie example to copy conventions from: `public/lottie/LottieAnimation.tsx`.
