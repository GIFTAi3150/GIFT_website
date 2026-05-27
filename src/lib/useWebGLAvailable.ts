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

const PROBE_INITIAL_DELAY_MS = 500; // grace period for prior page's R3F cleanup to flush
const PROBE_INTERVAL_MS = 250;
const MAX_PROBE_ATTEMPTS = 32; // ~8 s total before we give up

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

// Verify a depth+stencil renderbuffer attachment actually completes — this
// catches the Edge/ANGLE failure mode where `getContext()` returns non-null
// but the GPU refuses the depth/stencil setup Three.js needs (browser fires
// `webglcontextcreationerror` with "OES_packed_depth_stencil support is
// required" and Three.js's WebGLRenderer constructor throws). Without this,
// the basic getContext probe lies — says "ready", then Canvas mount throws
// synchronously inside React commit.
function verifyDepthStencil(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
      // WebGL2 has DEPTH24_STENCIL8 built-in. Confirm an FBO completes.
      const fb = gl.createFramebuffer();
      const rb = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, 1, 1);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.deleteFramebuffer(fb);
      gl.deleteRenderbuffer(rb);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }
    // WebGL1 fallback path needs the depth_texture / packed_depth_stencil
    // extension Three.js relies on internally.
    const ext =
      gl.getExtension('WEBGL_depth_texture') ||
      gl.getExtension('MOZ_WEBGL_depth_texture') ||
      gl.getExtension('WEBKIT_WEBGL_depth_texture');
    return !!ext;
  } catch {
    return false;
  }
}

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
    const ok = verifyDepthStencil(gl);
    // Intentionally DO NOT call WEBGL_lose_context.loseContext() here. That
    // call ticks Chrome's per-origin "guilty" counter — call it enough times
    // in one session and Chrome flips the origin into "Web page caused
    // context loss and was blocked" state, refusing all WebGL until the
    // tab is fully killed. Letting the temp canvas drop out of scope is
    // enough; the browser releases its context on its own schedule. See
    // project_raw_webgl_guilty_pattern.md for the long form.
    return ok;
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

    // Wait for prior-page R3F contexts (e.g. DX page GPGPU) to finish
    // releasing before probing. Probing at t=0 on a navigation often
    // finds the GPU still mid-cleanup and returns false negatives.
    window.setTimeout(probe, PROBE_INITIAL_DELAY_MS);
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
