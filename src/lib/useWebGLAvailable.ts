'use client';

import { useEffect, useState } from 'react';

// Probe whether the browser can hand us a fresh WebGL2 context right now
// USING THE SAME CONTEXT ATTRIBUTES Three.js requests. A naked
// `getContext('webgl2')` can succeed while Three.js's request with
// `{ antialias: true, alpha: true, depth: true, ... }` still fails —
// different attribute sets are validated separately by the driver,
// especially under GPU pressure. Probing with the real attribute set
// means a 'ready' result is a much stronger signal that the Canvas
// mount will succeed.

type Status = 'probing' | 'ready' | 'unavailable';

const PROBE_INTERVAL_MS = 250;
const MAX_PROBE_ATTEMPTS = 16; // ~4 s total before we give up

// Match what every R3F <Canvas> in this project requests. Three.js's
// WebGLRenderer constructor forwards these to canvas.getContext().
// `depth: true` is always added by Three.js even if not explicitly set,
// so include it here so the probe's request shape matches reality.
const PROBE_ATTRIBUTES: WebGLContextAttributes = {
  antialias: true,
  alpha: true,
  depth: true,
  stencil: false,
  failIfMajorPerformanceCaveat: false,
  preserveDrawingBuffer: false,
  powerPreference: 'default',
};

function tryProbe(): boolean {
  try {
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2', PROBE_ATTRIBUTES) as WebGL2RenderingContext | null;
    if (!gl) {
      const c2 = document.createElement('canvas');
      gl = c2.getContext('webgl', PROBE_ATTRIBUTES) as WebGLRenderingContext | null;
    }
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function useWebGLAvailable(): Status {
  const [status, setStatus] = useState<Status>('probing');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const probe = () => {
      if (cancelled) return;
      if (tryProbe()) {
        setStatus('ready');
        return;
      }
      attempts += 1;
      if (attempts >= MAX_PROBE_ATTEMPTS) {
        setStatus('unavailable');
        return;
      }
      window.setTimeout(probe, PROBE_INTERVAL_MS);
    };

    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
