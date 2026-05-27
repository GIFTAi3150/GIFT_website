'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import * as THREE from 'three';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';

// Real context losses are tolerated up to this count via Canvas remount.
// Past the threshold we stop trying — Chrome's GPU process is in a state
// that won't recover this session. Matches the per-component threshold
// that worked pre-Phase-3 (HeroLogoDelayed uses the same value).
const MAX_CONTEXT_LOSSES = 3;

// Single app-wide WebGL canvas. Lives in the root layout and persists
// across route changes. Each "3D moment" on a page renders into this
// canvas via drei's <View> + a tracker <div> placed in normal page flow.
//
// Why this exists:
//
// Previously each 3D surface mounted its own <Canvas>. Three Canvases
// on the DX page + one on the home page meant the GPU process churned
// contexts on every route change. Once Chrome's "guilty origin" heuristic
// trips (typically after 3 context losses in a session), it kills EVERY
// WebGL context on the origin until tab close — that's the "hero fails
// and now nothing 3D works anywhere" cascade.
//
// One Canvas in the shell removes the cascade by construction: there is
// only one context to lose, route changes don't tear it down, and drei's
// <View> handles per-page scenes via scissor + viewport on the shared
// surface.
//
// Phase 1 (this file) onboards the home page hero logo only. Hero3D and
// GiftLogoFluid on the DX page keep their own Canvas for now and will be
// migrated in follow-up phases.

export default function RootCanvas() {
  const [permanentFail, setPermanentFail] = useState(false);
  // canvasKey bumps remount the entire <Canvas> so we get a fresh WebGL
  // context after a genuine context loss. Without this we'd be staring at
  // a dead canvas until tab refresh.
  const [canvasKey, setCanvasKey] = useState(0);
  const lossCountRef = useRef(0);

  // R3F's events fire on the DOM element you pass via eventSource. We
  // can't reference document at module scope (SSR), so wire it up after
  // mount. Until then the Canvas runs without event forwarding, which is
  // fine — the hero logo has no pointer interaction.
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEventSource(document.documentElement);
  }, []);

  if (permanentFail) {
    // Nothing to render — pages fall back to their per-component static
    // visuals (HeroLogoDelayed shows LogoStaticFallback, etc.). Surface
    // a window event so consumers can switch to fallback mode instead of
    // spinning the loading placeholder forever.
    return null;
  }

  return (
    <Canvas
      // key bump triggers a clean remount of the Canvas (new GL context,
      // new renderer, new scene graph) after a recoverable context loss.
      key={canvasKey}
      // Canvas sits behind page content but covers the full viewport.
      // <View>'s scissor + viewport keep its scenes painting only where
      // their tracker <div>s sit, so the rest stays transparent.
      style={{
        position: 'fixed',
        inset: 0,
        // Sit ABOVE normal page content so View-painted pixels are
        // visible. The Canvas is transparent (alpha=0) everywhere except
        // the rects where Views actively paint, so it doesn't visually
        // block anything underneath. pointer-events:none keeps clicks
        // flowing through to page content as usual. Page-cover at z=9999
        // still wins until the logo signals ready.
        //
        // Slot the Canvas BETWEEN normal page content and overlay UI:
        //   z-10  hero content (Hero.tsx content wrapper)
        //   z-30  ← this Canvas
        //   z-40  mobile nav overlay (Header.tsx, opened state)
        //   z-50  sticky header
        //   z-9999 SSR page-cover
        // Below z=30 the painted logo gets hidden behind hero content;
        // above z=40 the logo paints OVER the mobile nav overlay.
        zIndex: 30,
        pointerEvents: 'none',
      }}
      dpr={[1, 1.5]}
      eventSource={eventSource ?? undefined}
      eventPrefix="client"
      // makeSafeRenderer attaches our `webglcontextlost` listener BEFORE
      // Three.js's own constructor-time listener, blocking the
      // preventDefault → restoration loop that ticks Chrome's guilty
      // counter. See src/lib/makeSafeRenderer.ts for the full rationale.
      gl={makeSafeRenderer(
        {
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.9,
          powerPreference: 'default',
          stencil: false,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        },
        () => {
          // Genuine context loss (synthetic dispose-time events are
          // filtered inside makeSafeRenderer, so we only get here for
          // real losses). Try a Canvas remount up to MAX_CONTEXT_LOSSES
          // times — covers transient driver hiccups and recovers without
          // a tab refresh. Past the threshold the GPU process is wedged
          // (Chrome's "guilty origin" state); stop retrying and let the
          // per-page static fallbacks take over.
          //
          // Why a counter instead of permanent-fail-on-first-loss: the
          // earlier behavior treated any context-loss signal as a
          // session-ending event, so a single transient loss (or any
          // synthetic dispose-time event that slipped through) wiped
          // every 3D surface on the site at once. Same blast radius as
          // the sessionStorage flag we rejected back in
          // project_webgl_session_failure_cache.md.
          lossCountRef.current += 1;
          if (lossCountRef.current >= MAX_CONTEXT_LOSSES) {
            setPermanentFail(true);
            return;
          }
          setCanvasKey((k) => k + 1);
        },
      )}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0);
      }}
    >
      <View.Port />
    </Canvas>
  );
}
