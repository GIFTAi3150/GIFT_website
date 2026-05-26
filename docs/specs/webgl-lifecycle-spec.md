# WebGL Lifecycle Spec — Lazy-Mount + Dispose-When-Far

**Status**: draft, not yet implemented
**Author**: 2026-05-26 session
**Goal**: Each WebGL surface allocates a context only while it could be on screen, and releases that context to the browser's per-origin pool when the user scrolls far past or navigates away. No surface holds a slot it isn't using.

---

## Why

Chromium budgets ~16 WebGL contexts per origin. Today most of our surfaces mount the moment the page hydrates and never release until route change. On a long DX scroll session you can end with 3 live contexts (Hero3D + Fluid + Particles) — and the next page's hero races against R3F's 500ms dispose to claim its slot. That's the source of our "WebGL probe failing on nav" pattern and is why `HeroLogoDelayed` has the 2000ms `MIN_PLACEHOLDER_MS` warmup (a wait, not a cause).

Pausing `frameloop` (which `Hero3D` and `GiftLogoFluid` do) saves per-frame CPU/GPU work but does **not** release the context — the slot stays consumed.

The fix is to make *creation* and *destruction* both viewport-driven, not page-driven.

---

## What changes

| Surface | Today | Target |
|---|---|---|
| `HeroLogoDelayed` (homepage logo) | mounts on hydrate after 2s timer | mount on viewport-near, unmount on viewport-far |
| `GiftLogoFluid` (DX) | mounts on hydrate, pauses frameloop | mount on viewport-near, unmount on viewport-far |
| `GiftLogoParticles` (DX) | mounts on hydrate, runs forever | mount on viewport-near, unmount on viewport-far |
| `DollarSignHero` (Finance) | mounts on hydrate, runs forever | mount on viewport-near, unmount on viewport-far |
| `AccessGlobe` (Company, cobe — not R3F) | mounts on hydrate, runs forever | mount on viewport-near, unmount on viewport-far |
| `Hero3D` (DX) | mounts on viewport-near (already lazy) | add unmount-on-viewport-far; rest unchanged |

After this change, the 2000ms timer in `HeroLogoDelayed.tsx:138` can be deleted — the homepage hero will no longer be racing against draining contexts from the previous page, because it won't even try to claim a slot until its section is on screen.

---

## Shared primitive: `useViewportMount`

New hook in `src/lib/useViewportMount.ts`. One pattern, used by every surface.

```ts
type ViewportMountState = 'dormant' | 'mounting' | 'active' | 'releasing';

interface Options {
  /** rootMargin for the "should mount" trigger — pre-warms before the section
   *  is on screen. Default: '100% 0px' (one viewport above + below). */
  preMountMargin?: string;
  /** rootMargin for the "should release" trigger — only releases when the
   *  section is well past the visible area. Default: '300% 0px'. */
  releaseMargin?: string;
  /** Delay before transitioning active → releasing, in ms. Prevents the
   *  release fire from happening on quick scroll-bys. Default: 1500. */
  releaseDebounceMs?: number;
}

export function useViewportMount(
  ref: React.RefObject<HTMLElement>,
  options?: Options,
): { shouldMount: boolean; isVisible: boolean };
```

Internal behavior:
- Two `IntersectionObserver`s on the same ref, with different `rootMargin`.
- `preMountMargin` IO: when intersecting → set `shouldMount = true` immediately. Sets `isVisible` per actual intersection.
- `releaseMargin` IO: when *not* intersecting for ≥ `releaseDebounceMs` → set `shouldMount = false`. Cancels the timer if the user scrolls back.
- Both IOs disconnect on unmount.

Return values map to consumer code:
- `shouldMount` → gate `<Canvas>` (or `createGlobe`) creation. False = no context allocated.
- `isVisible` → for R3F surfaces that want `frameloop={isVisible ? 'always' : 'never'}` during the brief pre-mount-but-not-yet-visible window.

The hook does **not** wrap WebGL probing — that's the existing `useWebGLAvailable` and stays per-surface. Composition order: `useViewportMount` first, then `useWebGLAvailable`, then render the Canvas.

---

## Per-surface migration notes

| Surface | Notes / risks |
|---|---|
| `HeroLogoDelayed` | Wrap with `useViewportMount`. Delete `MIN_PLACEHOLDER_MS` and the timer effect — no longer needed. Keep `CanvasErrorBoundary` for the rare race that still slips through. |
| `Hero3D` | Replace bespoke IO at lines 1007-1021 with `useViewportMount`. Add release half (currently missing). Keep `frameloop` wiring. |
| `GiftLogoFluid` | Replace IO at 1497-1503 with `useViewportMount`. Today it only toggles frameloop — extend to gate the `<Canvas>` itself. The GPUComputationRenderer FBO state is fully reconstructible on remount. |
| `GiftLogoParticles` | Add `useViewportMount`; gate the `<Canvas>` on `shouldMount`. Surface samples a logo SVG — re-sampling on remount is one-shot, no concern. |
| `DollarSignHero` | Add `useViewportMount`; gate the `<Canvas>` on `shouldMount`. No internal scroll state to preserve. |
| `AccessGlobe` (cobe) | Different shape — cobe is not R3F, uses `createGlobe(canvas, opts)` and exposes `globe.destroy()`. Wrap the existing `useEffect` body in `if (!shouldMount) return;`. Cleanup branch calls `globe.destroy()` AND removes the canvas's old WebGL context via the existing pattern. Verify cobe's destroy actually releases the GL context (it does, per source). |

---

## Risks

1. **Remount pop-in.** Surface that's been unmounted then re-enters the viewport will show ~200-400ms of black/static while the Canvas re-creates and the model re-loads. The 1-viewport `preMountMargin` mitigates this — by the time the user actually sees the section, the warmup has already started. Risk highest on cheap mobile.
2. **State loss on remount.** Any client-only state inside the Canvas (camera position the user has dragged to, animation phase, etc.) is lost. Mitigation: lift the persistent state to a parent ref outside the Canvas if any surface needs it. Per the audit, only `AccessGlobe` has persistent state (the spin position) — we can checkpoint `phi` to a ref before destroy and restore on next mount.
3. **The release-debounce is conservative-on-purpose.** 1.5s release delay means if a user scrolls past then immediately back, we don't churn. Trade: a section briefly above the visible area still costs a context. Acceptable — the budget pressure comes from cross-page nav, not in-page scroll.
4. **cobe globe in AccessGlobe is the riskiest cleanup.** Cobe's `destroy()` should free the context but it's not R3F-managed; verify with `chrome://gpu` after.

---

## Migration order (suggested)

1. Land `useViewportMount.ts` + tests.
2. Migrate `HeroLogoDelayed` (biggest single win, lowest blast radius — homepage only).
3. Verify on cold home-load + nav from /services/dx → / (the original failure case). If clean, delete `MIN_PLACEHOLDER_MS`.
4. Migrate `Hero3D` (low risk — already uses IO, just adopting the shared shape + adding release).
5. Migrate `GiftLogoFluid` and `GiftLogoParticles` (DX page, paired so we test the page as a whole).
6. Migrate `DollarSignHero` (Finance, standalone).
7. Migrate `AccessGlobe` last (cobe-specific cleanup needs its own verification pass).

---

## Out of scope

- Replacing R3F. We keep R3F as the host; this spec is only about *when* its `<Canvas>` mounts.
- Cross-surface context budgeting (e.g., "if 3 are mounted, downgrade the oldest"). Not needed if per-surface gating is tight — origin budget is 16, we'd never come close.
- The 16-context Chromium limit itself. We work within it; we don't try to lobby for more via `failIfMajorPerformanceCaveat: false` tweaks.
- Server-rendered/static fallbacks. Existing `LogoStaticFallback` pattern stays — this spec is about context allocation timing, not the fallback story.

---

## Decisions locked 2026-05-26

1. **Release debounce: 1500ms.** Default in the hook. Tunable per-surface if a specific scene needs different behavior.
2. **Pre-mount margin: 100%.** Matches existing `Hero3D` value — proven on that surface, no reason to diverge.
3. **Dev-mode logger: yes.** Hook accepts `{ debugLabel?: string }`; in `NODE_ENV !== 'production'` it logs `[viewport-mount:Hero3D] mount`, `release`, etc. Off by default, opt-in per surface.

Ready to implement starting with `useViewportMount.ts` + `HeroLogoDelayed` migration as the first PR.
