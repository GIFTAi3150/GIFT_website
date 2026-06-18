# /services/aiops — Flash + Scroll-Dead Fix Plan (handoff)

**Author:** Opus (diagnosis only — fixes to be applied by the implementing model)
**Date:** 2026-06-18
**Page:** `/services/aiops` (the old "dx-v3" DX template, renamed)
**Component:** `src/app/services/aiops/_components/DxV3Page.tsx`
**CSS:** `src/app/services/aiops/dx-v3.css`

Two bugs, root-caused via a 5-investigator + adversarial-verify workflow. One fix is already
in the working tree (applied inadvertently by a diagnostic sub-agent); one is specified below
and NOT yet applied.

---

## Bug A — Hero background text flashes / "jumps suddenly into the screen"

### Root cause (confidence ~0.95)
`.dx-v3 .hero-bg-lane` and `.hero-bg-track--ltr/--rtl` had their CSS animations
(`dx-hero-lane-in` opacity 0→1, and the infinite marquees) applied **unconditionally from
mount**. The flash-guard hides the hero with `visibility:hidden`, but per the CSS Animations
spec `visibility:hidden` does **not** pause an animation's clock. So:

- **Warm/fast reveal** (fonts cached → guard drops ~1 rAF after mount): `dx-hero-lane-in` is
  only ~16ms in, so all six lanes visibly fade in (staggered to 1.4s) and the marquees snap
  from `translateX(0)` the instant the cover lifts = the "sudden pop."
- **Slow/cold reveal** (2500ms font cap): the animation already finished invisibly, so the
  lanes appear at full opacity — different symptom, same defect.

`.atom-viewer` never had this problem because it is `opacity:0` statically and its fade only
runs on `.dx-v3:not([data-flash-guard])`. The hero-bg lacked that gating.

### Fix — ⚠️ ALREADY IN WORKING TREE (review & keep)
`dx-v3.css` is already modified (uncommitted). The change gates the animations behind the
guard and holds the lanes invisible until it drops — identical pattern to `.atom-viewer`:

```css
.dx-v3 .hero-bg-lane {
  overflow: hidden;
  opacity: 0;                 /* hold invisible while guard is up + during per-lane delay */
}
.dx-v3:not([data-flash-guard]) .hero-bg-lane {
  animation: dx-hero-lane-in 1s ease both;   /* clock starts only when guard drops */
}
.dx-v3:not([data-flash-guard]) .hero-bg-track--ltr { animation: dx-hero-ltr var(--dur, 40s) linear infinite; }
.dx-v3:not([data-flash-guard]) .hero-bg-track--rtl { animation: dx-hero-rtl var(--dur, 40s) linear infinite; }
```

- **Keep it** (recommended) — it is correct, complete, and verified.
- To revert to a pure diagnosis-only tree instead: `git checkout -- src/app/services/aiops/dx-v3.css`
- No JS change. The inline cover + `::after` cover still bridge the handoff seam; this is the
  defense that makes the bg-text *fade* in instead of *pop*.

---

## Bug B — Scroll animations dead on first entry (work after reload/re-nav)

### Root cause (confidence ~0.8 on the mechanism class)
Trigger positions are finalised by `ScrollTrigger.refresh()`. The DX template's intended design
(per project memory) uses **three** refresh lifecycle points: `rAF`, `document.fonts.ready`,
and `window 'load'`. In the current AIOps code only `rAF` (inside `revealAndRefresh`) reliably
runs on a client-side navigation, because:

- `window 'load'` **does not fire on an App-Router client-side navigation** (the SPA document
  already finished loading). The `readyState === 'complete'` branch only schedules a single
  `setTimeout(…, 50)` refresh — far too early on a cold route.
- `document.fonts.ready` was folded into the reveal **race** (`Promise.race([… , 2500ms])`),
  so if the 2500ms cap wins, the reveal refresh fires *before* fonts finish.

Result: on the first (cold) navigation into the page, late font-subset reflow (every heading /
mono label re-measures) shifts the tall pinned stacks after the last refresh, so every
scrub/pinned trigger is measured against a stale position and never advances = "dead." A hard
**reload** fires a real `window 'load'` (final refresh ⇒ works); a **re-nav** has warm assets
so the page is already settled at the reveal refresh (⇒ works).

### REJECTED theory — do NOT chase this
The "late **Lottie** inflates the orbit stack → stale trigger" theory was investigated and
**refuted**: `CapLottie` renders `null` until its JSON loads, and the orbit tiles / `.cap-video`
are fixed/`vh` height, and the pinned stacks are `vh`-sized (`280vh`, `360vh`, `160vh`). Lottie
loading does **not** change document height. A `ResizeObserver` on `.dx-v3 scrollHeight` would
never fire for it. (This is also why the DotsGrid "observe-the-element" pattern doesn't apply
here — the late resource is fonts, not a resizing canvas.)

### Fix — NOT YET APPLIED
`DxV3Page.tsx`, the reveal block (currently ~lines 1497–1530). Restore the missing standalone
`document.fonts.ready` refresh + add one bounded settle refresh, and fix cleanup. All refreshes
are idempotent and cheap.

```js
    const fontsSettled = Promise.race([
      Promise.all(heroFontLoads).then(() => document.fonts.ready),
      new Promise((resolve) => window.setTimeout(resolve, 2500)),
    ]);
    rafId = requestAnimationFrame(() => {
      fontsSettled.then(() => revealAndRefresh());
    });

    // ---- Post-settle ScrollTrigger.refresh() — restore the missing lifecycle points ----
    // The only refresh guaranteed to run AFTER the page fully settles used to be
    // window 'load' — but it does NOT fire on an App-Router client-side navigation,
    // so a cold first nav left every scrub/pinned trigger measured against a stale
    // (pre-font-reflow) layout = scroll animations dead until a reload/re-nav.
    // Refresh independently when fonts are truly ready, on real load, and once more
    // after a bounded settle window. All idempotent.
    const refreshIfAlive = () => { if (alive) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refreshIfAlive);                 // (1) all fonts done (not raced)
    if (document.readyState === 'complete') {
      window.setTimeout(refreshIfAlive, 50);                   // (2) warm client-nav first pass
    } else {
      window.addEventListener('load', refreshIfAlive, { once: true }); // hard load
    }
    const settleTimer = window.setTimeout(refreshIfAlive, 1200); // (3) cold-asset/late-font tail

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('load', refreshIfAlive);
      window.clearTimeout(settleTimer);
      pixelatedMM.revert();
      triggers.forEach((t) => t.kill());
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
      document.querySelector('.dx-v3')?.setAttribute('data-flash-guard', '');
    };
```

This replaces the old `onWindowLoad` (renamed to `refreshIfAlive`, same behavior) and adds the
two missing lifecycle points. Touches nothing in the flash-guard order, Lenis, the touch-skip,
or the Inter-italic accents — no regression to the DX flash shape, the mobile italic-crop fix,
or mobile scroll.

---

## Ordered fix list

| # | File | Anchor | Change | Bug | Risk |
|---|------|--------|--------|-----|------|
| 1 | `dx-v3.css` | `.hero-bg-lane` / `.hero-bg-track--*` (~3351–3375) | **Already applied** — guard-gate hero-bg animations + `opacity:0` base. Review & keep. | A (flash) | none |
| 2 | `DxV3Page.tsx` | reveal block (~1497–1530) | Add standalone `document.fonts.ready` refresh + bounded settle refresh; fix cleanup. | B (scroll-dead) | low |

---

## Out of scope (do NOT bundle in)
- **Color mismatch** `#page-cover` `#F0F7FF` vs dx-v3 covers `#f5f7ff` (5-unit R diff). Real but
  minor, and changing `layout.tsx` body/html color is **site-wide** (affects HP reveal). Defer
  to a separate, separately-tested change.
- **`ScrollToTopOnRouteChange` first-mount skip** (H4 Fix 1) — REJECTED. Its predicted asymmetry
  is inverted vs the report; the 3-rAF loop exists for a documented reason (App-Router late
  scroll-restoration + destroyed-Lenis last RAF) and `revealAndRefresh` already re-syncs Lenis.
- **Moving the inline cover out of `.dx-v3`** (H4 Fix 3) — unnecessary; the inline cover is
  visible exactly when needed (after `removeAttribute('data-flash-guard')`).

---

## Verification protocol (mandatory — applies to both fixes)
Per project rule, verify flash/timing bugs in a **production build**, not dev HMR:

```
npm run build && npm run start
```

Then in DevTools:
1. **Network → Slow 3G** (forces the cold-asset / late-font window that triggers Bug B).
2. **Bug B:** from another route (e.g. `/`), click a link to `/services/aiops` (a *client-side*
   nav — this is the failing path, not a hard reload). Disable cache. Scroll → all pinned/scrub
   sections (orbit, cascade, pains, cases) must animate on the **first** entry.
3. **Bug A:** hard reload AND client-nav into the page; the six hero bg-text lanes must **fade
   in** (never appear pre-formed or snap in), and the marquees must not pop.
4. Re-check mobile (≤899px, Lenis skipped) — both fixes must hold on touch.
