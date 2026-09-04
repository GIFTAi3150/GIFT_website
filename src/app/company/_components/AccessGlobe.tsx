'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import company from '@/data/company.json';
import { useWebGLAvailable } from '@/lib/useWebGLAvailable';

// Interactive globe for the About page's Access section. Uses `cobe`
// (https://cobe.vercel.app) — same lightweight WebGL globe Vercel runs
// on their homepage. No external API, no token, no map tiles.
//
// Interaction model:
//   - Drag horizontally over the globe → spin it manually.
//   - Hover ONLY the green marker dot → info card with HQ address
//     fades in from the top-right of the globe container. Hovering
//     the empty parts of the globe / canvas does nothing.
//   - Click the green dot (tap without drag) → card pins itself open;
//     close it via × or follow the "Google Mapsで開く" CTA inside it
//     to navigate to the actual address.
//   - Auto-rotates while idle; respects prefers-reduced-motion.
//
// To detect "hovering the marker," we replicate cobe's own projection
// math (lat/lng → 3D vec → screen NDC) every frame and store the
// marker's pixel position + occlusion state in refs. Pointermove on
// the container then just checks distance from the cursor to that
// position — no DOM queries, no overlay buttons, no flickering.

const SAPPORO: [number, number] = [43.0642, 141.3469];
const MARKER_COLOR: [number, number, number] = [0.145, 0.388, 0.922]; // page primary #2563EB
const GMAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  company.address
)}`;
const CLICK_MOVEMENT_THRESHOLD = 6; // px — anything smaller is a click, larger is a drag
const HOVER_RADIUS_PX = 28; // pointer-to-marker distance counted as "hovering the dot"

// Globe surface radius cobe uses internally (constant 0.8). Markers
// are drawn at 0.8 + markerElevation; default elevation is 0.05, so
// the rendered marker sits at radius 0.85.
const GLOBE_RADIUS = 0.8;
const MARKER_ELEVATION = 0.05;
const MARKER_RADIUS = GLOBE_RADIUS + MARKER_ELEVATION;
const GLOBE_RADIUS_SQ = GLOBE_RADIUS * GLOBE_RADIUS; // 0.64 — the visible disk

// Replicates cobe's projection (see cobe/dist/index.esm.js): the
// marker's lat/lng on the globe, scaled to its drawn radius, rotated
// by the current phi/theta, projected to normalized canvas coords.
// Returns container-space pixels + an `occluded` flag matching what
// cobe's marker shader hides on screen.
function projectMarker(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  cssWidth: number,
  cssHeight: number,
): { x: number; y: number; occluded: boolean } {
  // lat/lng → unit sphere vector (cobe's convention), then scaled to
  // the marker's drawn radius (0.85). Skipping the scale was the
  // source of an earlier bug where the projected position was ~4%
  // off and the hover hotspot didn't line up with the painted dot.
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(latRad);
  const tx = -cosLat * Math.cos(lngRad) * MARKER_RADIUS;
  const ty = Math.sin(latRad) * MARKER_RADIUS;
  const tz = cosLat * Math.sin(lngRad) * MARKER_RADIUS;

  // Apply the globe's current rotation (phi = spin, theta = tilt).
  const cTheta = Math.cos(theta);
  const sTheta = Math.sin(theta);
  const cPhi = Math.cos(phi);
  const sPhi = Math.sin(phi);

  const rx = cPhi * tx + sPhi * tz;
  const ry = sPhi * sTheta * tx + cTheta * ty - cPhi * sTheta * tz;
  const rz = -sPhi * cTheta * tx + sTheta * ty + cPhi * cTheta * tz;

  const aspect = cssWidth / cssHeight;
  const ndcX = (rx / aspect + 1) / 2;
  const ndcY = (-ry + 1) / 2;

  // Cobe's marker shader DRAWS the marker when `rz >= 0` (on the
  // front of the globe) OR `rx² + ry² >= 0.64` (projects outside the
  // visible globe disk — i.e., the marker is "peeking around" the
  // limb). Occluded is therefore the negation of that:
  //   rz < 0 AND rx² + ry² < 0.64
  // The previous version had the inversion flipped, which silently
  // marked the FRONT-FACING marker as occluded so hover never fired.
  const occluded = rz < 0 && rx * rx + ry * ry < GLOBE_RADIUS_SQ;

  return {
    x: ndcX * cssWidth,
    y: ndcY * cssHeight,
    occluded,
  };
}

export default function AccessGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // `hovering` is true only when the pointer is within HOVER_RADIUS_PX
  // of the projected marker AND the marker is on the front of the
  // globe. `pinned` is the click-to-keep-open latch (sticky after a
  // tap, cleared by the × button).
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  // Probe WebGL before letting cobe construct the globe. createGlobe
  // calls getContext('webgl') under the hood; if the GPU is still
  // releasing contexts from a previous route, that returns null and
  // cobe throws. The probe waits until WebGL is actually available.
  const webglStatus = useWebGLAvailable();
  // cobe can still throw after a 'ready' probe (a context lost between the
  // probe and construction). Without this the panel kept its frame and
  // showed nothing, which reads as a broken image.
  const [globeFailed, setGlobeFailed] = useState(false);

  useEffect(() => {
    if (webglStatus !== 'ready') return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      const { width, height } = container.getBoundingClientRect();
      return {
        width: Math.max(width, 1),
        height: Math.max(height, 1),
      };
    };
    let { width, height } = measure();

    let phi = 0;
    const theta = 0.3;
    let dragOffset = 0;
    let pointerDownX: number | null = null;
    // Last computed marker position (in container CSS pixels). Updated
    // by the raf loop, read by the pointermove + click handlers.
    const markerPos = { x: 0, y: 0, occluded: false };

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    let globe: ReturnType<typeof createGlobe>;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: height * dpr,
        phi,
        theta,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: MARKER_COLOR,
        glowColor: [1, 1, 1],
        markers: [{ location: SAPPORO, size: 0.1, id: 'sapporo' }],
      });
    } catch (error) {
      console.warn('[AccessGlobe] static fallback:', error);
      setGlobeFailed(true);
      return;
    }

    let rafId = 0;
    let visible = false;
    const tick = () => {
      if (visible) {
        if (pointerDownX === null && !reducedMotion) {
          phi += 0.003;
        }
        const effectivePhi = phi + dragOffset / 200;
        globe.update({
          phi: effectivePhi,
          theta,
          width: width * dpr,
          height: height * dpr,
        });
        const proj = projectMarker(
          SAPPORO[0],
          SAPPORO[1],
          effectivePhi,
          theta,
          width,
          height,
        );
        markerPos.x = proj.x;
        markerPos.y = proj.y;
        markerPos.occluded = proj.occluded;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0.01 },
    );
    io.observe(container);

    const ro = new ResizeObserver(() => {
      const next = measure();
      width = next.width;
      height = next.height;
    });
    ro.observe(container);

    // Translate a clientX/Y into container-local coords + ask whether
    // it's inside the marker's hover hotspot. Returns false when the
    // marker is occluded so hovering the spot where the marker WOULD
    // be (if it weren't rotated to the back of the globe) doesn't
    // trigger the card.
    const isPointerOnMarker = (clientX: number, clientY: number) => {
      if (markerPos.occluded) return false;
      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const dx = localX - markerPos.x;
      const dy = localY - markerPos.y;
      return dx * dx + dy * dy < HOVER_RADIUS_PX * HOVER_RADIUS_PX;
    };

    // ─── Drag on canvas ───
    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX - dragOffset;
      canvas.style.cursor = 'grabbing';
    };
    const onCanvasPointerMove = (e: PointerEvent) => {
      if (pointerDownX !== null) {
        dragOffset = e.clientX - pointerDownX;
      }
    };
    const onPointerEnd = (e: PointerEvent, wasLeave: boolean) => {
      if (pointerDownX !== null) {
        // Click (small movement, ended on the canvas, on the marker)
        // → pin the card. Anywhere else = no card opens, but the drag
        // still gets folded back into phi so the globe doesn't snap.
        if (
          !wasLeave &&
          Math.abs(dragOffset) < CLICK_MOVEMENT_THRESHOLD &&
          isPointerOnMarker(e.clientX, e.clientY)
        ) {
          setPinned(true);
        }
        phi += dragOffset / 200;
        dragOffset = 0;
      }
      pointerDownX = null;
      canvas.style.cursor = 'grab';
    };
    const onPointerUp = (e: PointerEvent) => onPointerEnd(e, false);
    const onCanvasPointerLeave = (e: PointerEvent) => onPointerEnd(e, true);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onCanvasPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onCanvasPointerLeave);
    canvas.addEventListener('pointercancel', onCanvasPointerLeave);
    canvas.style.cursor = 'grab';

    // ─── Hover detection on the container ───
    // Container scope (not canvas) so moving the pointer from canvas
    // into the info card itself doesn't fire pointerleave and hide
    // the card before the user can interact with it.
    const onContainerPointerMove = (e: PointerEvent) => {
      // Don't recompute hover during an active drag; cursor should
      // stay "grabbing" and the user isn't trying to peek the card.
      if (pointerDownX !== null) return;
      const over = isPointerOnMarker(e.clientX, e.clientY);
      setHovering(over);
      canvas.style.cursor = over ? 'pointer' : 'grab';
    };
    const onContainerPointerLeave = () => {
      setHovering(false);
    };
    container.addEventListener('pointermove', onContainerPointerMove);
    container.addEventListener('pointerleave', onContainerPointerLeave);

    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 700ms ease-out';
    requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onCanvasPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onCanvasPointerLeave);
      canvas.removeEventListener('pointercancel', onCanvasPointerLeave);
      container.removeEventListener('pointermove', onContainerPointerMove);
      container.removeEventListener('pointerleave', onContainerPointerLeave);
    };
  }, [webglStatus]);

  const closeCard = () => {
    setPinned(false);
    setHovering(false);
  };

  const visible = hovering || pinned;
  // No GL (probing, unavailable, or cobe threw): the frame must still read as
  // a deliberate locator rather than an empty box. Shown during 'probing' too,
  // so the panel is never blank — the globe simply replaces it once running.
  const showStatic = webglStatus !== 'ready' || globeFailed;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ touchAction: 'pan-y', display: showStatic ? 'none' : 'block' }}
      />

      {showStatic && (
        <div className="co-globe__static" aria-hidden>
          <span className="co-globe__pin" />
          <span className="co-globe__city">SAPPORO</span>
          <span className="co-globe__coords">
            {SAPPORO[0].toFixed(4)}° N / {SAPPORO[1].toFixed(4)}° E
          </span>
        </div>
      )}

      {/* Info card overlay — slides in from the top-right ONLY when
          the pointer is within HOVER_RADIUS_PX of the green marker,
          or when the marker was clicked (pinned). */}
      <div
        role="dialog"
        aria-label="GIFT本社のアドレス"
        className={`pointer-events-none absolute right-3 top-3 max-w-[280px] rounded-xl border border-white/10 bg-gift-ink/95 p-5 text-left text-white shadow-[0_24px_48px_-16px_rgba(11,19,64,0.45)] backdrop-blur-md transition-all duration-300 ease-out ${
          visible
            ? 'translate-y-0 opacity-100 [pointer-events:auto]'
            : '-translate-y-2 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={closeCard}
          aria-label="閉じる"
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[#2563EB]">
          HQ · SAPPORO
        </p>
        <p className="mb-2 font-sans text-[15px] font-semibold leading-tight">
          {company.name}
        </p>
        <p className="mb-4 font-sans text-[12px] font-light leading-[1.6] text-white/80">
          {company.address}
        </p>
        <a
          href={GMAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-transform hover:scale-[1.03]"
        >
          Google Mapsで開く
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
