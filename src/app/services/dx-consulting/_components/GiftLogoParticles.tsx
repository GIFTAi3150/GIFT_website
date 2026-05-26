'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

// SVG path data — same shield + G mark the home-hero badge uses, so the
// particle silhouette matches what visitors already know.
const SHIELD_PATH =
  'M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z';
const G_PATH_1 =
  'M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z';
const G_PATH_2 =
  'M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z';

const SHIELD_DEPTH = 30;
const G_DEPTH = 35;
const CX = 414;
const CY = 400;
const ART_SCALE = 0.003;
const G_Z_OFFSET = 5;

// Fewer particles than the sprite version: each is now a lit 3D sphere
// (12-tri icosahedron × 14k instances ≈ 168k tris/frame — heavier than
// 28k flat sprites but well within budget for an idle hero).
const SHIELD_COUNT = 14000;
const G_COUNT = 8500;
const TOTAL_COUNT = SHIELD_COUNT + G_COUNT;

// Slate-silver palette. Darker than near-white so the kick → glow lerp
// has visible headroom: rest length(vColor) ≈ 1.18, kicked white ≈ 1.73,
// giving a 0.55 dynamic range for the emissive smoothstep below.
const PARTICLE_COLOR_A = new THREE.Color('#7c8aa6');
const PARTICLE_COLOR_B = new THREE.Color('#a0aec8');
// Glow color applied to displaced particles — cool blue-white rather
// than pure white. Matches the reference's icy "lit pellet" aesthetic
// (white particles read as too neutral; the cyan cast feels colder and
// more alive against the slate base).
const GLOW_COLOR = new THREE.Color('#dfeefc');

// ---- Physics-based hover kicks ---------------------------------------
// Particles are modeled as masses on springs. Each frame: spring pulls
// them back to rest, damping bleeds off velocity, the cursor adds an
// IMPULSE (instant velocity change) to anything inside KICK_RADIUS. The
// impulse magnitude scales with how fast the cursor is moving — slow
// glide = gentle nudge, fast sweep = launch — so the cloud reacts to
// gesture, not just presence.
// Subtle, targeted hover — small radius so the cursor's effect is local,
// not a giant hole carved through the cloud.
const KICK_RADIUS = 0.18;
const KICK_BASE = 0.4;
// Speed amplification — the kick is now PURELY proportional to cursor
// speed (no constant baseline). At rest the cursor has no effect; the
// faster it moves, the stronger the displacement, up to a cap.
const KICK_SPEED_GAIN = 2.6;
const KICK_SPEED_CAP = 3.5;
// Minimum cursor speed (world units/sec) below which we skip the kick
// entirely. Cuts hand-jitter / micro-tremor at "rest" so a stationary
// cursor truly does nothing — matches the reference behavior where
// particles only respond when the cursor is actively moving.
const MIN_CURSOR_SPEED = 0.04;
// FIXED-HOME spring. Each particle springs toward ITS OWN assigned
// basePosition — never some other point. This is what guarantees the
// silhouette holds: 22,500 particles, 22,500 unique anchors, no two
// particles can pool onto the same spot.
//
// (Igloo.inc gets uniform fill without per-particle homes because they
// use a continuous SDF on the GPU — every point on the surface is
// equally attractive. Without an SDF, our only way to guarantee uniform
// fill is fixed assignments. We make up for the "particles can't migrate"
// constraint via a high-spatial-frequency flow field — see below.)
const SPRING_K = 18;
const DAMPING = 4.5;
// PER-PARTICLE NOISE — replaces the previous spatial flow field. The
// spatial flow gave NEIGHBORING particles similar force vectors, which
// the eye read as visible waves passing through the cloud. Independent
// per-particle oscillation (each at its own unique frequency derived
// from its random seed) eliminates that coordination: with thousands
// of unique clocks, no two particles ever sync up, so the motion stays
// individually chaotic instead of forming waves.
//
//   INDIV_AMP — noise force magnitude. Peak displacement per particle
//     ≈ INDIV_AMP × |H(ω_i)| where H is the spring's transfer function.
//     Particles whose ω_i happens to land near √SPRING_K ≈ 4.2 rad/s
//     resonate and get amplified excursions — those naturally become
//     the beads that "venture outside the form and come back," matching
//     the reference's individual-energy look.
//   INDIV_FREQ_BASE / SPREAD — per-particle oscillation rate range,
//     in rad/s. With base 1.8 and spread 1.5, frequencies span 1.8–11.2
//     rad/s, straddling resonance for natural amplitude variety.
const INDIV_AMP = 1.6;
const INDIV_FREQ_BASE = 1.8;
const INDIV_FREQ_SPREAD = 1.5;
// Visual-layer wobble — small high-frequency per-particle jitter on top
// of the flow/spring physics. Adds fine sparkle so individual beads look
// alive even when their physics-level flow is gentle.
const WOBBLE_AMP = 0.012;
const WOBBLE_BASE_FREQ = 4.0;
const WOBBLE_FREQ_SPREAD = 1.4;
// Velocity magnitude that maps to full glow. Low enough that even a
// gentle nudge lights up the bead — the position physics is now subtle,
// so we want the color signal to do most of the visual work.
const GLOW_VEL_REF = 0.35;
// Two-rate color lerp: snap on fast (when velocity is high) so glow
// appears immediately under the cursor; decay slow so the glow trail
// lingers visibly behind a moving cursor like a comet tail.
const COLOR_LERP_UP = 0.45;
const COLOR_LERP_DOWN = 0.05;

const parseShapes = (d: string): THREE.Shape[] => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`;
  const loader = new SVGLoader();
  const shapes: THREE.Shape[] = [];
  loader.parse(svg).paths.forEach((p) => p.toShapes(true).forEach((s) => shapes.push(s)));
  return shapes;
};

const buildBeveledGeometries = (
  shapes: THREE.Shape[],
  depth: number
): THREE.BufferGeometry[] =>
  shapes.map(
    (shape) =>
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 6,
        bevelSize: 4,
        bevelSegments: 8,
        curveSegments: 18,
      })
  );

// Sample N positions across a set of source geometries, allocating each
// geo a share roughly proportional to its vertex count. Writes into
// `out` starting at `outStartIndex × 3`.
const samplePoints = (
  geos: THREE.BufferGeometry[],
  count: number,
  out: Float32Array,
  outStartIndex: number,
  zShift = 0
) => {
  const totalVerts = geos.reduce((s, g) => s + g.attributes.position.count, 0);
  let written = 0;
  const sample = new THREE.Vector3();
  geos.forEach((geo, idx) => {
    const share =
      idx === geos.length - 1
        ? count - written
        : Math.round(count * (geo.attributes.position.count / totalVerts));
    const mesh = new THREE.Mesh(geo);
    const sampler = new MeshSurfaceSampler(mesh).build();
    for (let i = 0; i < share; i++) {
      sampler.sample(sample);
      const o = (outStartIndex + written + i) * 3;
      // SVG → world transform (matches the home badge's wrapping groups).
      out[o] = (sample.x - CX) * ART_SCALE;
      out[o + 1] = -(sample.y - CY) * ART_SCALE;
      out[o + 2] = (sample.z + zShift) * ART_SCALE;
    }
    written += share;
  });
};

function ParticleLogo() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Reusable Object3D for composing per-instance matrices each frame.
  // Allocating one inside useFrame would thrash GC.
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-create geometry + material so the InstancedMesh constructor
  // receives valid args at mount (passing `undefined` would leave the
  // mesh with a default empty BufferGeometry on first render, which
  // sometimes renders as nothing depending on r3f's reconciliation).
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.014, 0), []);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.35,
    });
    // Per-instance emissive boost. Wrapped in `#ifdef USE_INSTANCING_COLOR`
    // so the shader still compiles cleanly if instanceColor isn't set
    // yet on the first render — three's renderer will recompile with
    // the define once we attach instanceColor in the seeding effect.
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        #ifdef USE_INSTANCING_COLOR
          // Rest slate ≈ length 1.18, kicked-toward-white ≈ length 1.73.
          // smoothstep keeps resting beads matte and ramps emission hard
          // on kicked ones.
          float gGlow = smoothstep(1.2, 1.7, length(vColor));
          totalEmissiveRadiance += vColor * gGlow * 9.0;
        #endif
        `
      );
    };
    return m;
  }, []);

  // Window-level pointer tracking. .hero-particles has pointer-events:
  // none so the masthead title stays clickable; r3f's built-in `mouse`
  // never updates as a result. useThree's `gl.domElement` gives us the
  // actual r3f canvas reliably, no querySelector race.
  const { gl } = useThree();
  const ndcMouse = useRef({ x: 999, y: 999, inside: false });
  const ndc = useRef(new THREE.Vector3());
  const cursorWorld = useRef(new THREE.Vector3(999, 999, 999));
  const camDir = useRef(new THREE.Vector3());
  // Prev cursor world position + timestamp so we can compute cursor
  // velocity each frame (slow drag vs fast swipe drives kick intensity).
  const prevCursor = useRef({ x: 0, y: 0, t: 0, valid: false });
  const cursorVel = useRef({ x: 0, y: 0, mag: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ndcMouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcMouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ndcMouse.current.inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  // Bake per-particle rest positions, persistent random scale, and the
  // per-particle base tint. baseColors is the immutable "rest" tint
  // each particle returns to; instanceColors is the live buffer that
  // gets lerped toward GLOW_COLOR when the particle is displaced.
  const {
    basePositions,
    currentPositions,
    velocities,
    scales,
    instanceColors,
    baseColors,
    randoms,
  } = useMemo(() => {
    const shieldGeos = buildBeveledGeometries(parseShapes(SHIELD_PATH), SHIELD_DEPTH);
    const gGeos = [
      ...buildBeveledGeometries(parseShapes(G_PATH_1), G_DEPTH),
      ...buildBeveledGeometries(parseShapes(G_PATH_2), G_DEPTH),
    ];

    const basePositions = new Float32Array(TOTAL_COUNT * 3);
    samplePoints(shieldGeos, SHIELD_COUNT, basePositions, 0, 0);
    samplePoints(gGeos, G_COUNT, basePositions, SHIELD_COUNT, G_Z_OFFSET);

    // currentPositions starts at rest; the physics integrator updates
    // it each frame. velocities is the per-particle vx/vy/vz state for
    // the spring-mass model.
    const currentPositions = new Float32Array(basePositions);
    const velocities = new Float32Array(TOTAL_COUNT * 3);

    // Per-particle scale (random *once* so beads have varied sizes),
    // base tint, and three random phase seeds for the idle-jitter noise.
    const scales = new Float32Array(TOTAL_COUNT);
    const instanceColors = new Float32Array(TOTAL_COUNT * 3);
    const randoms = new Float32Array(TOTAL_COUNT * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < TOTAL_COUNT; i++) {
      scales[i] = 0.55 + Math.random() * 0.7;
      tint.copy(PARTICLE_COLOR_A).lerp(PARTICLE_COLOR_B, Math.random());
      instanceColors[i * 3] = tint.r;
      instanceColors[i * 3 + 1] = tint.g;
      instanceColors[i * 3 + 2] = tint.b;
      randoms[i * 3] = Math.random() * Math.PI * 2;
      randoms[i * 3 + 1] = Math.random() * Math.PI * 2;
      randoms[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    // Snapshot base tints so the per-frame color loop can re-derive the
    // (base ↔ glow) target without drifting over time.
    const baseColors = new Float32Array(instanceColors);

    shieldGeos.forEach((g) => g.dispose());
    gGeos.forEach((g) => g.dispose());
    return {
      basePositions,
      currentPositions,
      velocities,
      scales,
      instanceColors,
      baseColors,
      randoms,
    };
  }, []);

  // Seed the instance matrices + per-instance colors once. After this
  // useFrame keeps the matrix array warm.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const i3 = i * 3;
      dummy.position.set(basePositions[i3], basePositions[i3 + 1], basePositions[i3 + 2]);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // Per-instance color via InstancedBufferAttribute. Three's instanced
    // material picks this up automatically when set on .instanceColor.
    mesh.instanceColor = new THREE.InstancedBufferAttribute(instanceColors, 3);
    mesh.instanceColor.needsUpdate = true;
  }, [basePositions, scales, instanceColors, dummy]);

  useFrame((state, deltaRaw) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { camera, clock } = state;
    // Cap dt so a tab-switch pause doesn't deliver a giant force step
    // that explodes the simulation.
    const dt = Math.min(deltaRaw, 1 / 30);
    const t = clock.getElapsedTime();

    // ---- Project NDC cursor → world plane at z=0 ----------------------
    let cursorActive = false;
    if (ndcMouse.current.inside) {
      ndc.current.set(ndcMouse.current.x, ndcMouse.current.y, 0.5);
      ndc.current.unproject(camera);
      camDir.current.copy(ndc.current).sub(camera.position).normalize();
      if (Math.abs(camDir.current.z) > 1e-4) {
        const tPlane = -camera.position.z / camDir.current.z;
        cursorWorld.current
          .copy(camera.position)
          .add(camDir.current.multiplyScalar(tPlane));
        cursorActive = true;
      }
    }

    // ---- Cursor velocity (world units per second) --------------------
    // Used to amplify the kick — fast sweeps fling particles farther
    // than slow drags.
    if (cursorActive) {
      const now = performance.now() / 1000;
      const prev = prevCursor.current;
      if (prev.valid) {
        const elapsed = Math.max(now - prev.t, 1e-3);
        if (elapsed < 0.1) {
          cursorVel.current.x = (cursorWorld.current.x - prev.x) / elapsed;
          cursorVel.current.y = (cursorWorld.current.y - prev.y) / elapsed;
        } else {
          cursorVel.current.x = 0;
          cursorVel.current.y = 0;
        }
      }
      prev.x = cursorWorld.current.x;
      prev.y = cursorWorld.current.y;
      prev.t = now;
      prev.valid = true;
    } else {
      cursorVel.current.x = 0;
      cursorVel.current.y = 0;
      prevCursor.current.valid = false;
    }
    cursorVel.current.mag = Math.sqrt(
      cursorVel.current.x * cursorVel.current.x +
        cursorVel.current.y * cursorVel.current.y
    );

    const cx = cursorWorld.current.x;
    const cy = cursorWorld.current.y;
    const kr2 = KICK_RADIUS * KICK_RADIUS;
    // Speed factor is now PURELY proportional to cursor velocity — no
    // baseline of 1, so a stationary cursor produces no kick at all.
    const speedFactor = Math.min(
      KICK_SPEED_GAIN * cursorVel.current.mag,
      KICK_SPEED_CAP
    );
    const cursorMoving = cursorActive && cursorVel.current.mag > MIN_CURSOR_SPEED;
    const cvx = cursorVel.current.x;
    const cvy = cursorVel.current.y;

    // ---- Per-particle physics step -----------------------------------
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const i3 = i * 3;
      const px = currentPositions[i3];
      const py = currentPositions[i3 + 1];
      const pz = currentPositions[i3 + 2];

      // Fixed home — each particle springs back to ITS OWN assigned
      // basePosition. Uniform distribution across the logo is guaranteed
      // because every particle has a unique anchor; no two particles can
      // pool onto the same spot.
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      // Spring + damping pulling toward the fixed home.
      const sx = bx - px;
      const sy = by - py;
      const sz = bz - pz;
      let fx = SPRING_K * sx - DAMPING * velocities[i3];
      let fy = SPRING_K * sy - DAMPING * velocities[i3 + 1];
      let fz = SPRING_K * sz - DAMPING * velocities[i3 + 2];

      // PER-PARTICLE INDEPENDENT NOISE. Each particle has its OWN
      // oscillation frequency and phase, both derived from its random
      // seeds. Two neighboring particles see uncorrelated force vectors
      // → no wave-like coordination → motion reads as individual chaos
      // (the look the reference has, particles each doing their own
      // thing). Particles whose frequency is near the spring's natural
      // ≈4.2 rad/s resonate and get larger excursions automatically —
      // those are the "beads that venture outside the form."
      const sX = randoms[i3];
      const sY = randoms[i3 + 1];
      const sZ = randoms[i3 + 2];
      const fXrate = INDIV_FREQ_BASE + sX * INDIV_FREQ_SPREAD;
      const fYrate = INDIV_FREQ_BASE + sY * INDIV_FREQ_SPREAD;
      const fZrate = INDIV_FREQ_BASE + sZ * INDIV_FREQ_SPREAD;
      fx += Math.sin(t * fXrate + sX * 7.0) * INDIV_AMP;
      fy += Math.cos(t * fYrate + sY * 7.0) * INDIV_AMP;
      fz += Math.sin(t * fZrate + sZ * 7.0) * INDIV_AMP * 0.6;

      // Integrate spring + damping + idle.
      velocities[i3] += fx * dt;
      velocities[i3 + 1] += fy * dt;
      velocities[i3 + 2] += fz * dt;

      // Cursor kick — instant impulse added to velocity (not a force, so
      // it doesn't depend on dt). Direction = particle's rest position
      // pushed away from cursor + a touch of the cursor's velocity
      // vector so sweeping motion drags beads along the gesture.
      // Gated on `cursorMoving` so a STATIONARY cursor never disturbs
      // particles — matches the reference where the cloud only reacts
      // when the cursor is actively in motion.
      if (cursorMoving) {
        const cdx = bx - cx;
        const cdy = by - cy;
        const cdist2 = cdx * cdx + cdy * cdy;
        if (cdist2 < kr2 && cdist2 > 1e-6) {
          const cdist = Math.sqrt(cdist2);
          const falloff = 1 - cdist / KICK_RADIUS;
          const impulse = falloff * falloff * KICK_BASE * speedFactor;
          // Radial component (push outward).
          velocities[i3] += (cdx / cdist) * impulse;
          velocities[i3 + 1] += (cdy / cdist) * impulse;
          // Z-pop toward camera so the kick feels like a 3D punch — also
          // scaled by speedFactor so a still cursor doesn't pop particles
          // forward just by being inside the canvas.
          velocities[i3 + 2] += falloff * falloff * KICK_BASE * 0.4 * speedFactor;
          // Cursor-velocity component (drag along the sweep direction).
          velocities[i3] += cvx * falloff * 0.35;
          velocities[i3 + 1] += cvy * falloff * 0.35;
        }
      }

      // Integrate position from velocity.
      currentPositions[i3] += velocities[i3] * dt;
      currentPositions[i3 + 1] += velocities[i3 + 1] * dt;
      currentPositions[i3 + 2] += velocities[i3 + 2] * dt;

      // Visual-layer wobble — per-particle high-frequency oscillation
      // added to render position ONLY (not to velocity / current state).
      // Each particle's frequency comes from its seed, so the cloud has
      // ~14k independent micro-motions instead of one synchronized sway.
      // Spring physics (above) and cursor kicks still work normally:
      // they drive currentPositions, then we add wobble on top at draw.
      const wobX =
        Math.sin(t * (WOBBLE_BASE_FREQ + sX * WOBBLE_FREQ_SPREAD) + sX * 5.0) *
        WOBBLE_AMP;
      const wobY =
        Math.cos(t * (WOBBLE_BASE_FREQ * 0.9 + sY * WOBBLE_FREQ_SPREAD) + sY * 5.0) *
        WOBBLE_AMP;
      const wobZ =
        Math.sin(t * (WOBBLE_BASE_FREQ * 0.8 + sZ * WOBBLE_FREQ_SPREAD) + sZ * 5.0) *
        WOBBLE_AMP *
        0.5;

      // Write the matrix for this instance.
      dummy.position.set(
        currentPositions[i3] + wobX,
        currentPositions[i3 + 1] + wobY,
        currentPositions[i3 + 2] + wobZ
      );
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // ---- Glow color, driven by velocity magnitude -----------------
      // Beads moving fast are "energized" — lerp tint toward GLOW_COLOR
      // in proportion to |v|. The trail naturally fades as the spring
      // pulls them home and damping bleeds velocity off.
      const vx = velocities[i3];
      const vy = velocities[i3 + 1];
      const vz = velocities[i3 + 2];
      const vmag = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const glow = Math.min(1, vmag / GLOW_VEL_REF);
      const baseR = baseColors[i3];
      const baseG = baseColors[i3 + 1];
      const baseB = baseColors[i3 + 2];
      const targetR = baseR + (GLOW_COLOR.r - baseR) * glow;
      const targetG = baseG + (GLOW_COLOR.g - baseG) * glow;
      const targetB = baseB + (GLOW_COLOR.b - baseB) * glow;
      // Asymmetric lerp: lighting UP is fast (glow snaps on under cursor),
      // cooling DOWN is slow (the warm trail lingers behind the cursor).
      const upR = targetR > instanceColors[i3] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      const upG = targetG > instanceColors[i3 + 1] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      const upB = targetB > instanceColors[i3 + 2] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      instanceColors[i3] += (targetR - instanceColors[i3]) * upR;
      instanceColors[i3 + 1] += (targetG - instanceColors[i3 + 1]) * upG;
      instanceColors[i3 + 2] += (targetB - instanceColors[i3 + 2]) * upB;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL_COUNT]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}

// Lighting rig tuned to give the slate beads visible highlights + a
// gentle shadow side, matching the reference image's "lit pellet" look.
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} color="#cdd6e6" />
      <directionalLight position={[3, 4, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#9aadc9" />
    </>
  );
}

export default function GiftLogoParticles() {
  // Context-loss kill switch — see GiftLogo3D_PremiumBadge for rationale.
  // Unmount the Canvas rather than let R3F's default handler call
  // preventDefault and trigger Chrome's restoration loop.
  const [contextLost, setContextLost] = useState(false);
  if (contextLost) return <div className="hero-particles" aria-hidden />;
  return (
    <div className="hero-particles" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 38, near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              e.stopImmediatePropagation();
              setContextLost(true);
            },
            true,
          );
        }}
      >
        <SceneLights />
        <ParticleLogo />
      </Canvas>
    </div>
  );
}
