'use client';

import { useEffect, useState } from 'react';

// Classify whether this device's GPU can sustain a LIVE per-frame GPGPU
// fluid solver (GiftLogoFluid on the DX hero). That solver runs 3 full-res
// compute passes + vorticity confinement every frame; on weak GPUs a single
// frame can blow past Windows' ~2 s GPU watchdog, triggering a TDR driver
// reset that surfaces as `webglcontextlost {statusMessage:'(none)'}` — i.e.
// the crash documented in project_giftlogofluid_crash.md.
//
// This is a CAPABILITY tier, not an availability probe (that's
// useWebGLAvailable). We read the UNMASKED_RENDERER string once and route
// weak hardware to a static fallback so it never runs the solver at all.
//
// Bias: fail toward 'weak'. A false 'weak' costs a capable machine the live
// effect (it still gets the static logo); a false 'capable' costs a weak
// machine a crash. The asymmetry says: when unsure, don't run the solver.

export type GpuTier = 'probing' | 'capable' | 'weak';

function classify(): Exclude<GpuTier, 'probing'> {
  try {
    // Respect reduced-motion — no heavy continuous animation for these users.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'weak';

    // Real touch-only devices (phones / tablets): coarse PRIMARY pointer AND
    // NO fine pointer available anywhere. A touchscreen laptop/desktop also
    // reports a coarse pointer, but it ALSO exposes a fine pointer (trackpad /
    // mouse) via any-pointer — so this correctly EXCLUDES touchscreen PCs,
    // which the old `coarse && innerWidth < 1024` rule wrongly bucketed as
    // phones. Mobile GPUs can't sustain the solver; touchscreen-PC GPUs can.
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const hasFinePointer = window.matchMedia?.('(any-pointer: fine)').matches ?? false;
    const touchOnly = coarse && !hasFinePointer;
    if (touchOnly) return 'weak';

    // Low device memory is a strong weak signal (not in standard TS lib types).
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof mem === 'number' && mem > 0 && mem < 4) return 'weak';

    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return 'weak';

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : '';

    // Software renderers — no real GPU behind them.
    if (/swiftshader|llvmpipe|basic render|software/.test(renderer)) return 'weak';
    // Intel integrated graphics — the documented TDR crasher for this solver.
    // (Intel Arc discrete is rare in this audience; accept the false-negative.)
    if (/intel/.test(renderer)) return 'weak';
    // Mobile GPU families that slipped past the form-factor check.
    if (touchOnly && /mali|adreno|powervr|videocore|apple gpu/.test(renderer)) return 'weak';

    return 'capable';
  } catch {
    return 'weak';
  }
}

export function useGpuTier(): GpuTier {
  // Always start 'probing' so SSR and first client paint agree (the static
  // fallback shows for both); the real classification lands after mount.
  const [tier, setTier] = useState<GpuTier>('probing');
  useEffect(() => {
    const result = classify();
    // DEBUG 2026-05-29: surface WHY a machine was classified, so we can see
    // the real renderer string and tune the gate (remove once tuned).
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
      const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
      const renderer = gl && dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '(unavailable)';
      // eslint-disable-next-line no-console
      console.warn('[gpu-tier]', result, '| renderer:', renderer, '| reducedMotion:',
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
        '| coarse:', window.matchMedia?.('(pointer: coarse)').matches,
        '| anyFinePointer:', window.matchMedia?.('(any-pointer: fine)').matches,
        '| deviceMemory:', (navigator as Navigator & { deviceMemory?: number }).deviceMemory);
    } catch { /* ignore */ }
    setTier(result);
  }, []);
  return tier;
}
