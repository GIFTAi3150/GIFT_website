'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

/**
 * WebGL warp interstitial.
 *
 * Shared state object lives outside the component tree so the GSAP
 * timeline can write `intensity` and `hueShift` while the R3F scene
 * reads them per-frame. Module-level singleton is fine because there
 * is only ever one WarpTransition mounted on the page.
 */
const warpState = {
  intensity: 0,   // 0 → 1, drives particle speed, alpha, glow size
  hueShift: 0,    // 0 → 140 degrees, rotates the global color palette
};

type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: number, opts?: { immediate?: boolean }) => void;
};

const BRAND_WORDS = [
  'dx-consulting', 'ai', 'saas', 'rpa', 'L-step', 'automation',
  'workflow', 'transform', 'digital', 'cloud', 'data', 'ml',
  'api', 'scale', 'no-code', 'agents', 'gpt', 'crm', 'pipeline',
  'realtime', 'kanban', 'webhook',
];

// ============================================================
// Tunnel constants — defines the rectangular corridor the
// camera is "falling" through. Width/height larger than they'd
// appear visually because the camera is partially inside.
// ============================================================
const TUNNEL_HALF_W = 280;
const TUNNEL_HALF_H = 280;
const TUNNEL_Z_FAR = -3800;    // vanishing point depth (far end)
const TUNNEL_Z_NEAR = 900;     // past camera — recycle point

// ============================================================
// TUNNEL STREAKS — line streaks running along Z on the 4 walls
// of the corridor. Each streak moves toward the camera; as it
// passes, it recycles to the far end. Reads as "falling through
// a square wireframe tunnel."
// ============================================================
function WarpParticles({ count = 480 }: { count?: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  // wall: 0=top, 1=bottom, 2=left, 3=right
  // u: position along the wall's perpendicular axis (-1 to +1)
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      wall: Math.floor(Math.random() * 4),
      u: -1 + Math.random() * 2,
      z: TUNNEL_Z_FAR + Math.random() * (TUNNEL_Z_NEAR - TUNNEL_Z_FAR),
      speed: 40 + Math.random() * 60,
      hue: 200 + Math.random() * 80,
      // Long light trails — each streak spans 800-1800 units along Z
      // so they read as long ribbons of light streaking past, like a
      // classic hyperspace warp effect, instead of short dashes.
      trailLen: 800 + Math.random() * 1000,
    }));
  }, [count]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 2 * 3), 3)
    );
    geom.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(count * 2 * 3), 3)
    );
    return geom;
  }, [count]);

  const scratchColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const lines = linesRef.current;
    if (!lines) return;
    const intensity = warpState.intensity;
    if (intensity < 0.01) {
      lines.visible = false;
      return;
    }
    lines.visible = true;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = geometry.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Move forward (toward camera at z=800). Higher intensity = faster.
      p.z += p.speed * intensity * 1.2;
      if (p.z > TUNNEL_Z_NEAR) {
        p.z = TUNNEL_Z_FAR;
        p.wall = Math.floor(Math.random() * 4);
        p.u = -1 + Math.random() * 2;
        p.hue = 200 + Math.random() * 80;
      }

      // Map (wall, u) → (x, y) on the corridor surface
      let x = 0;
      let y = 0;
      switch (p.wall) {
        case 0: x = p.u * TUNNEL_HALF_W; y = TUNNEL_HALF_H; break;
        case 1: x = p.u * TUNNEL_HALF_W; y = -TUNNEL_HALF_H; break;
        case 2: x = -TUNNEL_HALF_W; y = p.u * TUNNEL_HALF_H; break;
        default: x = TUNNEL_HALF_W; y = p.u * TUNNEL_HALF_H; break;
      }

      // Streak runs along Z — head closer to camera, tail behind.
      const headZ = p.z;
      const tailZ = p.z - p.trailLen;

      const i6 = i * 6;
      positions[i6] = x;
      positions[i6 + 1] = y;
      positions[i6 + 2] = tailZ;
      positions[i6 + 3] = x;
      positions[i6 + 4] = y;
      positions[i6 + 5] = headZ;

      // Color brightens as streak approaches camera, fades after passing.
      // Visibility window: z in [-3000, 600]. Peaks around z = 0 to 400.
      const zNorm = (p.z + 3000) / 3600; // 0 at far, 1 at near
      const distAlpha = Math.min(1, Math.max(0, zNorm * 1.6 - 0.05));
      const passFade = p.z > 400 ? Math.max(0, 1 - (p.z - 400) / 500) : 1;
      const alpha = distAlpha * passFade * intensity;

      const hue = ((p.hue + warpState.hueShift) % 360) / 360;
      scratchColor.setHSL(hue, 0.95, 0.65);
      const r = scratchColor.r * alpha;
      const g = scratchColor.g * alpha;
      const b = scratchColor.b * alpha;
      colors[i6] = r * 0.4;        // tail dimmer
      colors[i6 + 1] = g * 0.4;
      colors[i6 + 2] = b * 0.4;
      colors[i6 + 3] = r;           // head bright
      colors[i6 + 4] = g;
      colors[i6 + 5] = b;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

// ============================================================
// CENTER GLOW — multi-layered bright glow at origin. Without
// the bloom post-process to spread brightness, we fake the
// halo by stacking 3 spheres of decreasing opacity at
// increasing sizes. Cheap but readable.
// ============================================================
function CenterGlowLayer({
  baseScale,
  baseOpacity,
}: {
  baseScale: number;
  baseOpacity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scratchColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const intensity = warpState.intensity;
    mesh.visible = intensity > 0.01;
    if (!mesh.visible) return;

    mesh.scale.setScalar(baseScale * (0.5 + intensity * 1.5));

    const mat = mesh.material as THREE.MeshBasicMaterial;
    const hue = ((325 + warpState.hueShift) % 360) / 360;
    scratchColor.setHSL(hue, 1.0, 0.7);
    mat.color.copy(scratchColor);
    mat.opacity = baseOpacity * intensity;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        color="#ff4d8f"
        transparent
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function CenterGlow() {
  // Three concentric layers: tight bright core + medium halo + soft
  // outer bloom. Positioned at the far end of the tunnel so it reads
  // as the "light at the end" — the destination the warp is racing
  // toward. Additive blending stacks them into a vivid bright flare.
  return (
    <group position={[0, 0, TUNNEL_Z_FAR + 600]}>
      <CenterGlowLayer baseScale={80} baseOpacity={1.0} />
      <CenterGlowLayer baseScale={220} baseOpacity={0.45} />
      <CenterGlowLayer baseScale={500} baseOpacity={0.18} />
    </group>
  );
}

// ============================================================
// TEXT STREAKS — brand words flying outward radially. Drei <Text>
// uses MSDF for crisp text in 3D space.
// ============================================================
function WarpTextInstance({ word, seed }: { word: string; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  // Scatter texts within the corridor space at random (x, y) and
  // staggered z depths so they aren't all bunched together.
  const state = useRef({
    x: (Math.random() - 0.5) * TUNNEL_HALF_W * 1.6,
    y: (Math.random() - 0.5) * TUNNEL_HALF_H * 1.6,
    z: TUNNEL_Z_FAR + ((seed * 137.508) % (TUNNEL_Z_NEAR - TUNNEL_Z_FAR)),
    speed: 28 + Math.random() * 30,
    hue: 200 + Math.random() * 80,
  });
  const scratchColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const intensity = warpState.intensity;
    group.visible = intensity > 0.01;
    if (!group.visible) return;

    const s = state.current;
    s.z += s.speed * intensity * 1.2;
    if (s.z > TUNNEL_Z_NEAR) {
      s.z = TUNNEL_Z_FAR;
      s.x = (Math.random() - 0.5) * TUNNEL_HALF_W * 1.6;
      s.y = (Math.random() - 0.5) * TUNNEL_HALF_H * 1.6;
      s.hue = 200 + Math.random() * 80;
    }
    group.position.set(s.x, s.y, s.z);
    // Reset rotation — text floats facing the camera, not rotated radially.
    group.rotation.set(0, 0, 0);

    const text = group.children[0] as THREE.Mesh | undefined;
    if (text) {
      const mat = text.material as THREE.MeshBasicMaterial;
      const hue = ((s.hue + warpState.hueShift) % 360) / 360;
      scratchColor.setHSL(hue, 0.9, 0.7);
      // Same brightness curve as the wall streaks
      const zNorm = (s.z + 3000) / 3600;
      const distAlpha = Math.min(1, Math.max(0, zNorm * 1.6 - 0.05));
      const passFade = s.z > 400 ? Math.max(0, 1 - (s.z - 400) / 500) : 1;
      const alpha = distAlpha * passFade * intensity;
      mat.color.setRGB(
        scratchColor.r * alpha,
        scratchColor.g * alpha,
        scratchColor.b * alpha
      );
      mat.opacity = alpha;
    }
  });

  return (
    <group ref={groupRef}>
      <Text
        fontSize={22}
        anchorX="center"
        anchorY="middle"
        material-transparent
        material-toneMapped={false}
        material-depthWrite={false}
        material-blending={THREE.AdditiveBlending}
      >
        {word}
      </Text>
    </group>
  );
}

function WarpTextSwarm() {
  return (
    <>
      {Array.from({ length: 36 }, (_, i) => (
        <WarpTextInstance
          key={i}
          word={BRAND_WORDS[i % BRAND_WORDS.length]}
          seed={i}
        />
      ))}
    </>
  );
}

// ============================================================
// SCENE — composes everything + post-processing
// ============================================================
function WarpScene() {
  // No scene background — canvas is alpha: true so it's transparent
  // until particles draw. The HTML dot beneath the canvas (scaling
  // to fill the viewport during the first 25% of scroll) provides
  // the black backdrop the warp needs.
  return (
    <>
      <WarpParticles count={400} />
      <CenterGlow />
      <WarpTextSwarm />
    </>
  );
}

// ============================================================
// MAIN — fixed-position overlay that scroll-scrubs over the
// HERO's pin. The hero itself gets pinned for 300vh of scroll,
// and during that pin the warp overlay plays in sync. No
// separate section between hero and intro — the warp lives
// "inside" the hero's scroll, conceptually triggered by the
// black dot in the hero.
// ============================================================
export default function WarpTransition() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const overlay = overlayRef.current;
    const dot = dotRef.current;
    if (!overlay || !dot) return;

    const hero = document.querySelector<HTMLElement>('.dx-v3 .hero');
    if (!hero) return;

    // ============================================================
    // WHEEL/TOUCH LOCK approach (no ScrollTrigger pin).
    //
    // Why not pin? A ScrollTrigger pin adds a tall scroll-spacer
    // below the pinned element. While the user scrolls through that
    // spacer, scrollY advances through document coords — which means
    // any other ScrollTriggers below (intro text light-up, manifesto
    // PNG drift, etc.) silently scrub past *behind* the warp overlay.
    // By the time the warp ends, those animations are already played
    // and look "done" when the user finally sees them.
    //
    // Instead: when the user reaches the hero and scrolls down, we
    // freeze scrollY and turn wheel/touch deltas into warp progress.
    // Document scroll resumes only when the warp finishes — so intro
    // and manifesto get their first scroll-trigger encounter fresh.
    // ============================================================

    let progress = 0;
    let smoothedProgress = 0;
    let inWarp = false;
    // If the user landed already past the hero (refresh, back-button,
    // anchor link), mark the warp as done so we don't ambush them when
    // they scroll the wheel.
    let warpDone = window.scrollY > 50;
    if (warpDone) {
      progress = 1;
      smoothedProgress = 1;
    }
    let raf = 0;

    const getLenis = () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__dxLenis as LenisLike | undefined;

    const updateOverlay = () => {
      const p = smoothedProgress;

      // Overlay opacity: fade in 0-3%, hold 3-96%, fade out 96-100%
      let opacity = 1;
      if (p < 0.03) opacity = p / 0.03;
      else if (p > 0.96) opacity = Math.max(0, (1 - p) / 0.04);
      overlay.style.opacity = String(opacity);
      overlay.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';

      // Dot scale: 1 → 260 across the first 15% of progress, eased
      // (quadratic) so it accelerates like falling into the void.
      const dotProgress = Math.min(1, p / 0.15);
      const eased = dotProgress * dotProgress;
      const scale = 1 + eased * 259;
      dot.style.transform = `translate(-50%, -50%) scale(${scale})`;

      // Warp particles
      let intensity = 0;
      if (p > 0.12 && p < 0.85) intensity = (p - 0.12) / 0.73;
      else if (p >= 0.85 && p <= 0.96) intensity = 1;
      else if (p > 0.96) intensity = Math.max(0, 1 - (p - 0.96) / 0.04);
      warpState.intensity = intensity;

      // Three hue zones across progress
      let hueShift = 0;
      if (p < 0.33) hueShift = (p / 0.33) * 60;
      else if (p < 0.66) hueShift = 60 + ((p - 0.33) / 0.33) * 90;
      else hueShift = 150 + ((p - 0.66) / 0.34) * 90;
      warpState.hueShift = hueShift;
    };

    const tick = () => {
      // Lerp toward target progress so wheel ticks read as scrub, not jumps.
      smoothedProgress += (progress - smoothedProgress) * 0.08;
      updateOverlay();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const isAtHeroTop = () => window.scrollY <= 10;

    const enterWarp = () => {
      if (inWarp || warpDone) return;
      inWarp = true;
      const l = getLenis();
      if (l) l.stop();
    };

    const exitWarpForward = () => {
      // Warp completed — release scroll and glide the user to the
      // intro section. Doing it as a smooth lenis.scrollTo lets the
      // intro/manifesto ScrollTriggers fire freshly as scrollY
      // advances through their ranges for the first time.
      if (!inWarp && warpDone) return;
      inWarp = false;
      warpDone = true;
      const l = getLenis();
      // CRITICAL: re-enable lenis BEFORE scrollTo. lenis.stop() from
      // enterWarp persists otherwise and the page becomes scroll-locked
      // even after the warp finishes.
      if (l) l.start();
      const intro = document.querySelector<HTMLElement>('.dx-v3 .intro');
      if (l && intro) {
        const target = intro.getBoundingClientRect().top + window.scrollY;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l.scrollTo as any)(target, { duration: 1.4 });
      }
    };

    const exitWarpBackward = () => {
      // User scrubbed back to start — release scroll and let them
      // scroll up out of the hero normally.
      if (!inWarp) return;
      inWarp = false;
      const l = getLenis();
      if (l) l.start();
    };

    // Each wheel "click" on a typical mouse is ~100px deltaY. Need
    // ~40 clicks to traverse warp = WHEEL_BUDGET ~ 4000. Trackpads
    // generate many smaller deltas so they integrate naturally.
    const WHEEL_BUDGET = 4000;
    const TOUCH_BUDGET = 900;

    const onWheel = (e: WheelEvent) => {
      const goingDown = e.deltaY > 0;

      if (!inWarp) {
        if (goingDown && !warpDone && isAtHeroTop() && progress < 1) {
          enterWarp();
          progress = Math.min(1, progress + e.deltaY / WHEEL_BUDGET);
          e.preventDefault();
        }
        return;
      }

      if (goingDown) {
        progress = Math.min(1, progress + e.deltaY / WHEEL_BUDGET);
        e.preventDefault();
        // Trigger exit the moment progress hits 1, not on the NEXT
        // wheel event — otherwise users who stop scrolling exactly
        // at the end get stuck with lenis still locked.
        if (progress >= 1) exitWarpForward();
      } else {
        progress = Math.max(0, progress + e.deltaY / WHEEL_BUDGET);
        e.preventDefault();
        if (progress <= 0) exitWarpBackward();
      }
    };

    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const dy = lastTouchY - t.clientY;
      lastTouchY = t.clientY;
      const goingDown = dy > 0;

      if (!inWarp) {
        if (goingDown && !warpDone && isAtHeroTop() && progress < 1) {
          enterWarp();
          progress = Math.min(1, progress + dy / TOUCH_BUDGET);
          e.preventDefault();
        }
        return;
      }

      if (goingDown) {
        progress = Math.min(1, progress + dy / TOUCH_BUDGET);
        e.preventDefault();
        if (progress >= 1) exitWarpForward();
      } else if (dy < 0) {
        progress = Math.max(0, progress + dy / TOUCH_BUDGET);
        e.preventDefault();
        if (progress <= 0) exitWarpBackward();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      const l = getLenis();
      if (l) l.start();
    };
  }, [mounted]);

  return (
    <div ref={overlayRef} className="warp-overlay" aria-hidden>
      <div ref={dotRef} className="warp-dot" />
      {mounted && (
        <Canvas
          className="warp-canvas"
          camera={{ position: [0, 0, 400], fov: 60, near: 0.1, far: 6000 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
        >
          <WarpScene />
        </Canvas>
      )}
    </div>
  );
}
