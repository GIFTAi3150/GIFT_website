'use client';

// ============================================================================
//  GPU PARTICLE LOGO — fluid-style animation via GPGPU compute.
//
//  How this is different from GiftLogoParticles.tsx (the CPU version):
//
//  - Particle positions and velocities live in WebGL FLOAT TEXTURES, not JS
//    typed arrays. Every frame, two fragment shaders read those textures,
//    compute new values, and write to ping-pong buffers (GPUComputationRenderer
//    handles the swap).
//
//  - The motion model is "advect particles through a curl-noise velocity
//    field." Curl noise = curl of a scalar potential function → mathematically
//    divergence-free → particles flow in smooth swirls without converging or
//    diverging anywhere (no clumping, no rarefaction).
//
//  - This is the same architecture igloo.inc uses, but without the full
//    Navier-Stokes pressure projection (curl noise is already divergence-free
//    analytically, so we skip the expensive Poisson solve). Their cursor
//    "splats" velocity into a real fluid sim; ours adds velocity directly to
//    nearby particles, which is cheaper but visually close for a hero scene.
//
//  - Render uses InstancedMesh with a custom vertex shader that samples
//    each instance's position from the GPU position texture. So the CPU never
//    touches particle positions — they live entirely on the GPU.
// ============================================================================

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

// The "head" form is split between TWO GLBs now:
//   - HEAD_PATH (bob-marley.glb): single mesh "BobMarleyBust" — the
//     particle silhouette samples from here, so the cloud renders as
//     Bob Marley's bust on land/head form. (Previously this was
//     face-skull.glb's face meshes — a women's head — which is now
//     unused for particle sampling.)
//   - SKULL_PATH (face-skull.glb): still the source of the gold
//     "Skull" sub-mesh that ramps in on cursor-hover. Bob-marley.glb
//     has no internal skull mesh, so the hover-reveal skull stays
//     wired to face-skull.glb.
const HEAD_PATH = '/models/bob-marley.glb';
const SKULL_PATH = '/face-skull.glb';
useGLTF.preload(HEAD_PATH);
useGLTF.preload(SKULL_PATH);

// ---- Logo geometry (same SVG paths the CPU version uses, kept identical
// so the silhouette matches and we can hot-swap components) ----------------
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
// G_Z_OFFSET pushes the inner G forward of the shield's front face so it
// reads as a distinct foreground layer rather than blending into the
// shield's silhouette. Was 5 (barely separated); 25 puts G clearly in
// front of the 30-unit-deep shield extrusion, so the letterform stays
// visible whether or not the form is rotated.
const G_Z_OFFSET = 25;

// ---- Particle grid size ---------------------------------------------------
// Positions live in a TEX_W × TEX_H float texture. 192² = 36,864 particles —
// up from 128² so the shield outline reads denser. The compute pass scales
// linearly with count, so per-frame cost roughly doubles vs 128², but on
// a modern GPU that's still cheap.
const TEX_W = 192;
const TEX_H = 192;
const PARTICLE_COUNT = TEX_W * TEX_H;
// Split between the shield outline and the inner G. Flipped from 0.55
// to 0.45 so the G now gets the MAJORITY (~20.3k particles) and the
// shield has ~16.6k. The shield is a big bulky outline that reads fine
// with fewer particles; the G is a small precise letterform that
// needs density to be legible.
const SHIELD_RATIO = 0.45;
const SHIELD_COUNT = Math.floor(PARTICLE_COUNT * SHIELD_RATIO);
const G_COUNT = PARTICLE_COUNT - SHIELD_COUNT;

// ---- SVG → 3D surface samples (same logic as CPU version) ----------------
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

// ---- GIFT pet (PixelRobot mascot) shape sampler --------------------------
// The mascot is a pixel-art SVG made of <rect>s on a 24×24 viewBox. To
// sample particles onto it, we distribute particles across the rect areas
// in proportion to each rect's pixel count. Coordinates are mapped from
// the 24×24 SVG space to sim space, centered at the origin.
const PET_RECTS: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 11, y: 3, w: 2, h: 2 },     // antenna top
  { x: 11, y: 5, w: 2, h: 1 },     // antenna stem
  { x: 7, y: 6, w: 10, h: 1 },     // body bevel top
  { x: 6, y: 7, w: 12, h: 10 },    // body main
  { x: 7, y: 17, w: 10, h: 1 },    // body bevel bottom
  { x: 4, y: 11, w: 2, h: 2 },     // left arm
  { x: 18, y: 11, w: 2, h: 2 },    // right arm
  { x: 11, y: 18, w: 2, h: 3 },    // leg
];
// Eye cutouts — particles that would sample inside these regions get
// re-rolled, so the rendered pet has empty eye sockets. We make these
// regions LARGER than the visible 2×2 eyes in the original SVG (3.5×3.5
// each) to leave a margin: particles' ambient oscillation could otherwise
// swing into the cleared zone, blurring the eye sockets. With this margin
// + the pet-mode motion attenuation in the shader (uWPet weight), the eyes
// stay readable even while the cloud is animating.
const PET_EYE_RECTS: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 8.25, y: 9.25, w: 3.5, h: 3.5 },     // left eye (centered on original 10, 11)
  { x: 12.25, y: 9.25, w: 3.5, h: 3.5 },    // right eye (centered on original 14, 11)
];
const isInEye = (px: number, py: number): boolean => {
  for (const e of PET_EYE_RECTS) {
    if (px >= e.x && px < e.x + e.w && py >= e.y && py < e.y + e.h) return true;
  }
  return false;
};

// Scale per pixel — mascot rect-frame is 16 wide × 18 tall; with 0.045
// per pixel that's a pet of width 0.72 and height 0.81 in sim space,
// noticeably smaller and more vertical than the logo's ~1.4 width.
const PET_SCALE = 0.045;

const samplePetPositions = (count: number, out: Float32Array) => {
  const totalArea = PET_RECTS.reduce((s, r) => s + r.w * r.h, 0);
  let written = 0;
  PET_RECTS.forEach((r, idx) => {
    const share =
      idx === PET_RECTS.length - 1
        ? count - written
        : Math.round((count * r.w * r.h) / totalArea);
    for (let i = 0; i < share; i++) {
      // Rejection sample: re-roll until the point is not inside an eye
      // region. The body rect (the only one that overlaps eyes) covers
      // ~120 px² and the two eyes cover 8 px², so on average each sample
      // takes ~1.07 attempts. Hard cap iterations at 20 just in case.
      let px = 0;
      let py = 0;
      for (let attempt = 0; attempt < 20; attempt++) {
        px = r.x + Math.random() * r.w;
        py = r.y + Math.random() * r.h;
        if (!isInEye(px, py)) break;
      }
      const o = (written + i) * 3;
      // Center the mascot at origin and flip Y (SVG is Y-down, three.js
      // is Y-up). Use a tiny random Z so the pet isn't perfectly flat
      // when rotating around its Y axis.
      out[o] = (px - 12) * PET_SCALE;
      out[o + 1] = -(py - 12) * PET_SCALE;
      out[o + 2] = (Math.random() - 0.5) * 0.04;
    }
    written += share;
  });
};

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
      out[o] = (sample.x - CX) * ART_SCALE;
      out[o + 1] = -(sample.y - CY) * ART_SCALE;
      out[o + 2] = (sample.z + zShift) * ART_SCALE;
    }
    written += share;
  });
};

// ---- Velocity-FIELD update fragment shader -------------------------------
// This is the persistent fluid layer — a 2D velocity field in world space
// that the cursor splats into and that dissipates over time. Particles
// sample this field every frame to pick up the velocity at their location.
//
//   Each texel of textureVelocityField corresponds to a world XY cell
//   inside [uFieldOrigin, uFieldOrigin + uFieldSize]. The shader runs
//   ONCE per texel per frame:
//     - Read the field's velocity at this cell from the previous frame
//     - Apply dissipation (uFieldDissipation, e.g. 0.985 → ~1% loss/frame)
//     - Add a cursor "splat" — Gaussian of cursor velocity centered at
//       cursor's world position, scaled by cursor speed (so a stationary
//       cursor adds nothing)
//
// This is the same "splat into a velocity texture" technique igloo uses
// from Stable Fluids. We still skip the pressure projection (no Poisson
// solve) because it would require 5+ extra passes per frame, but the
// three other Stam-fluid ingredients ARE here now and give most of the
// visual lift:
//
//   (1) SEMI-LAGRANGIAN SELF-ADVECTION — every cell pulls its value from
//       upstream by one timestep, so splats *travel* along their own
//       velocity instead of decaying in place. Streams now ride across
//       the form rather than fading where the cursor stopped.
//   (2) VORTICITY CONFINEMENT (Fedkiw 2001) — re-injects the small-scale
//       rotation that dissipation eats. This is the single biggest
//       "alive flowing" lever in fluid sims — without it the field
//       looks like advected smoke; with it, vortices persist and curl.
//   (3) VELOCITY-COUPLED SPLAT RADIUS — gentle cursor moves leave tight
//       focused pokes; fast strokes leave wide sweeps (matches igloo's
//       behavior of widening the splat with cursor speed).
const FIELD_SHADER = /* glsl */ `
  uniform float uDt;
  uniform vec2 uCursorPos;
  uniform vec2 uCursorVel;
  uniform float uCursorSpeed;
  uniform vec2 uFieldOrigin;
  uniform vec2 uFieldSize;
  uniform float uFieldDissipation;
  uniform float uSplatRadius;
  uniform float uSplatStrength;
  uniform float uVorticityStrength;

  // Curl (vorticity scalar) at a cell — central differences on the four
  // neighbours: ω = ∂v/∂x − ∂u/∂y. Each call costs four texture taps.
  float curlAt(vec2 uv) {
    vec2 texel = 1.0 / resolution.xy;
    vec2 vL = texture2D(textureVelocityField, uv - vec2(texel.x, 0.0)).xy;
    vec2 vR = texture2D(textureVelocityField, uv + vec2(texel.x, 0.0)).xy;
    vec2 vB = texture2D(textureVelocityField, uv - vec2(0.0, texel.y)).xy;
    vec2 vT = texture2D(textureVelocityField, uv + vec2(0.0, texel.y)).xy;
    return 0.5 * ((vR.y - vL.y) - (vT.x - vB.x));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 texel = 1.0 / resolution.xy;
    vec2 worldXY = uFieldOrigin + uv * uFieldSize;

    // ===== (1) Semi-Lagrangian self-advection =====
    // The velocity now at this cell came from where the fluid WAS dt
    // seconds ago. Tracing backwards by (vel * dt) and reading the field
    // there is what turns "splat decays in place" into "splat rides its
    // own velocity downstream." uvDelta converts world-space velocity
    // (units/sec) into UV-space displacement using the field's world size.
    vec2 curVel = texture2D(textureVelocityField, uv).xy;
    vec2 uvDelta = curVel * uDt / uFieldSize;
    vec2 upstreamUv = clamp(uv - uvDelta, vec2(0.0), vec2(1.0));
    vec2 vel = texture2D(textureVelocityField, upstreamUv).xy;

    // ===== (2) Dissipation =====
    // Per-frame exponential decay (0.98 → e-fold time ~0.83 sec at 60fps).
    vel *= uFieldDissipation;

    // ===== (3) Vorticity confinement (Fedkiw 2001) =====
    // F = ε · h · (N × ω) where N = ∇|ω| / |∇|ω||. In 2D the cross with
    // a scalar curl rotates the gradient 90°, so we compute the
    // perpendicular-gradient of |ω| directly:
    //   F = ε · (∂|ω|/∂y, −∂|ω|/∂x) · ω
    // This injects force tangent to existing vortices, sustaining them
    // against dissipation. The "swirl that keeps swirling" is what makes
    // a fluid look alive instead of muddy.
    float wL = curlAt(uv - vec2(texel.x, 0.0));
    float wR = curlAt(uv + vec2(texel.x, 0.0));
    float wB = curlAt(uv - vec2(0.0, texel.y));
    float wT = curlAt(uv + vec2(0.0, texel.y));
    float wC = curlAt(uv);
    vec2 vortForce = 0.5 * vec2(abs(wT) - abs(wB), abs(wR) - abs(wL));
    vortForce /= length(vortForce) + 1e-4;
    vortForce *= wC * uVorticityStrength;
    vel += vortForce * uDt;

    // ===== (4) Cursor splat with velocity-coupled radius =====
    // Stationary cursor (uCursorSpeed = 0) injects nothing — the
    // velocity multiplier gates the splat. The gaussian's "tightness"
    // (1 / 2σ²) shrinks as cursor speed rises, so a brisk sweep leaves
    // a wider, broader stripe of velocity than a careful poke does.
    vec2 toCursor = worldXY - uCursorPos;
    float d2 = dot(toCursor, toCursor);
    float speedSmooth = smoothstep(0.0, 1.0, clamp(uCursorSpeed, 0.0, 1.0));
    float invSigma2 = uSplatRadius * mix(2.0, 0.6, speedSmooth);
    float gauss = exp(-d2 * invSigma2) * uCursorSpeed;
    vel += uCursorVel * gauss * uSplatStrength;

    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

// ---- Velocity-update fragment shader -------------------------------------
// LAYERED motion model:
//   1. HIGH-FREQUENCY CURL NOISE — fluid character (the igloo look) but
//      the temporal frequency is cranked WAY up (8x faster than the slow
//      "wavy" version that previously dominated). At this speed, the field
//      reverses direction multiple times per second, so particles never
//      have time to accumulate visible coordinated drift across the form.
//   2. PER-PARTICLE NOISE — each particle has its own hash-derived clock,
//      breaking up any residual coordination from the curl field.
//   3. CURSOR SPLATS — strong (matches igloo's "particles flow when you
//      sweep the cursor"). Gated by cursor speed: a stationary cursor
//      does nothing.
//   4. TIGHT SPRING — keeps every particle bound to its assigned home,
//      so the silhouette is rock-steady throughout.
//
// The trade-off: at this temporal speed the curl looks more like
// "turbulence" than "ocean swells." That's intentional — slow curl = waves,
// fast curl = turbulence, only the latter doesn't look wavy.
const VELOCITY_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uDt;
  uniform sampler2D uHomeTex;
  uniform sampler2D uHomePetTex;
  uniform sampler2D uHomeHeadTex;
  // Per-form weights that always sum to ~1.0. The spring target is the
  // weighted sum of (logo, pet, head) home textures, so any in-between
  // state during a morph is a smooth interpolation between the active
  // pair (the third weight stays at 0). Same with motionScale.
  uniform float uWLogo;
  uniform float uWPet;
  uniform float uWHead;
  uniform float uIndivAmp;
  uniform float uFreqBase;
  uniform float uFreqSpread;
  uniform float uCurlAmp;
  uniform float uSpringK;
  uniform float uDamping;
  // Velocity-field sampling (the persistent fluid layer).
  uniform vec2 uFieldOrigin;
  uniform vec2 uFieldSize;
  uniform float uFieldDrag;
  // Sparse outward "breath" bursts — magnitude of the temporary home
  // offset (sim-space units), and the hash threshold that decides
  // which particles can ever burst.
  uniform float uBreathAmp;
  uniform float uBreathFilter;
  // Slow-curl home displacement — amplitude of the persistent "river"
  // drift in sim-space units. 0 disables.
  uniform float uSlowDriftAmp;

  float hash(vec2 p, float salt) {
    return fract(sin(dot(p + salt, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Fast-turbulence 2D curl noise. SPATIAL frequencies (S1, S2) are moderate
  // so the form still has organized currents; TEMPORAL frequencies (the t*N
  // multipliers) are cranked high so each current reverses before particles
  // can drift far. Same divergence-free curl-of-potential math as a real
  // fluid sim, just with the time scrolled fast.
  vec2 fastCurl(vec2 p, float t) {
    const float S1 = 5.0;
    const float S2 = 10.0;
    float t1 = t * 4.5;
    float t2 = t * 6.8;

    float sx1 = sin(p.x * S1 + t1);
    float cx1 = cos(p.x * S1 + t1);
    float sy1 = sin(p.y * S1 + t1 * 1.2);
    float cy1 = cos(p.y * S1 + t1 * 1.2);
    vec2 c1 = vec2(-sx1 * sy1, -cx1 * cy1) * S1;

    float sx2 = sin(p.x * S2 + t2 * 1.1);
    float cx2 = cos(p.x * S2 + t2 * 1.1);
    float sy2 = sin(p.y * S2 + t2 * 1.3);
    float cy2 = cos(p.y * S2 + t2 * 1.3);
    vec2 c2 = vec2(-sx2 * sy2, -cx2 * cy2) * S2 * 0.35;

    return c1 + c2;
  }

  // Slow-evolving 2D curl, used as a HOME-position drift (not a force).
  // Igloo's hero has a slow rotating reference frame on its SDF sampler
  // that creates a non-zero average velocity at rest — every motion
  // source in our stack is either zero-mean (fastCurl, per-particle
  // sin/cos, breath) or cursor-gated (splat field), so without this the
  // cloud has no "rivers" of coherent drift between cursor events.
  // Sampling at HOME coords (stable per particle) makes each particle's
  // drift direction consistent over short intervals; the slow temporal
  // term lets the rivers gently meander over many seconds.
  vec2 slowCurl(vec2 p, float t) {
    const float S = 2.5;
    float t1 = t * 0.3;
    float sx = sin(p.x * S + t1);
    float cx = cos(p.x * S + t1);
    float sy = sin(p.y * S + t1 * 1.2);
    float cy = cos(p.y * S + t1 * 1.2);
    return vec2(-sx * sy, -cx * cy);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    // Spring target: weighted sum of every form's home position. Weights
    // sum to ~1, so the result is a true interpolation. During a morph
    // only two of the three weights are non-zero (the source fades to 0
    // while the target ramps to 1), so this is equivalent to a 2-way
    // mix between exactly the right pair.
    vec4 homeLogo4 = texture2D(uHomeTex, uv);
    vec3 homeLogo = homeLogo4.xyz;
    // .w is 1 for shield particles, 0 for inner-G particles — baked
    // into the logo home texture in JS so we can gate motion sources
    // selectively (rivers on the shield, sharp G in the middle).
    float isShield = homeLogo4.w;
    vec3 homePet = texture2D(uHomePetTex, uv).xyz;
    vec3 homeHead = texture2D(uHomeHeadTex, uv).xyz;
    vec3 home = homeLogo * uWLogo + homePet * uWPet + homeHead * uWHead;

    // Ambient motion scale — full strength on the logo, attenuated on
    // the pet (small eye sockets must stay crisp) and on the head
    // (facial features blur if particles oscillate too much). Same
    // weighted-sum trick as the home position.
    float motionScale = uWLogo * 1.0 + uWPet * 0.4 + uWHead * 0.5;

    // ===== Slow coherent drift =====
    // Displace each particle's home along a low-frequency curl pattern.
    // Sampling at HOME coords (not pos) keeps each particle's drift
    // direction stable, so the cloud reads as coherent "river" currents
    // meandering across the form.
    // The driftWeight gate makes this fire ONLY on shield particles when
    // the logo form is active — the inner G stays sharp because its
    // particles get zero drift. Pet and head forms drift everywhere
    // (no inner/outer distinction). With the gate in place we can run
    // the amplitude higher than before so rivers actually read on the
    // shield, instead of being damped down low enough to spare the G.
    float driftWeight = uWLogo * isShield + uWPet + uWHead;
    vec2 slowDrift = slowCurl(home.xy, uTime) * uSlowDriftAmp * motionScale * driftWeight;
    home.xy += slowDrift;

    // ---- (1) Fast-turbulence curl noise → fluid character without waves.
    vec2 curl = fastCurl(pos.xy, uTime) * uCurlAmp * motionScale;

    // ---- (2) Per-particle noise → breaks remaining coordination, adds
    //          individual bead energy.
    float sX = hash(uv, 0.0);
    float sY = hash(uv, 1.7);
    float sZ = hash(uv, 3.4);
    float fX = uFreqBase + sX * uFreqSpread;
    float fY = uFreqBase + sY * uFreqSpread;
    float fZ = uFreqBase + sZ * uFreqSpread;
    vec3 indiv;
    indiv.x = sin(uTime * fX + sX * 19.0) * uIndivAmp * motionScale;
    // Y component is 1.5× stronger → particles "stream" up and down
    // within the silhouette more than they slide side-to-side. Gives
    // the cloud the visible vertical-current feel from references like
    // igloo where beads visibly travel along the form.
    indiv.y = cos(uTime * fY + sY * 23.0) * uIndivAmp * 1.5 * motionScale;
    indiv.z = sin(uTime * fZ + sZ * 17.0) * uIndivAmp * 0.5 * motionScale;

    // ---- (3) Sample the persistent VELOCITY FIELD at this particle's
    //          world XY position. The field carries cursor-splatted
    //          velocity that has persisted from previous frames (and is
    //          slowly dissipating). Drag force pulls particle's velocity
    //          toward the field's local velocity — particles passing
    //          through a "wind" in the field get accelerated by it.
    vec2 fieldUV = (pos.xy - uFieldOrigin) / uFieldSize;
    fieldUV = clamp(fieldUV, 0.0, 1.0);
    vec2 fieldVel = texture2D(textureVelocityField, fieldUV).xy;
    vec2 fieldDrag = (fieldVel - vel.xy) * uFieldDrag;

    // ---- (3.5) Sparse breath bursts — each particle has its own
    //            long cycle, and only a small subset (filtered by
    //            uBreathFilter on a fresh hash) is ever eligible. A
    //            brief window in each cycle nudges the SPRING TARGET
    //            outward — not the velocity directly — so the bounded
    //            spring dynamics handle the out-and-back travel
    //            automatically. Net effect: tiny groups of particles
    //            occasionally drift just outside the silhouette, then
    //            get pulled back home, giving the cloud the "alive,
    //            twitching" character igloo's particles have without
    //            scattering the whole form.
    float breathHash = hash(uv, 7.7);
    float breathOn = step(uBreathFilter, breathHash);
    float breathPeriod = 7.0 + sX * 11.0;             // 7–18 sec per particle
    float breathT = mod(uTime + sZ * 13.0, breathPeriod);
    float burstWidth = 1.1;                            // active window length
    float pulseT = clamp(breathT / burstWidth, 0.0, 1.0);
    // sin(πt) is a smooth 0→1→0 pulse; step() zeroes it outside the window.
    float burst = step(breathT, burstWidth) * sin(pulseT * 3.14159);
    // Outward direction: mostly radial from form centroid (origin in
    // sim space), with a small random-per-particle jitter so the
    // outbreaks don't all point dead-radially. Add a small constant
    // so the normalize() is well-defined for particles sampled near
    // the center of the form.
    vec3 randDir = vec3(sX - 0.5, sY - 0.5, sZ - 0.5) * 2.0;
    vec3 rawDir = home + randDir * 0.3;
    vec3 outwardDir = rawDir / (length(rawDir) + 1e-4);
    // Breath bursts get the same shield-only gate as the rivers — on
    // the logo form, inner-G particles never burst (their letterform
    // is too small to tolerate a sudden outward displacement). Pet and
    // head forms burst everywhere via the uWPet + uWHead contribution.
    vec3 breathOffset = outwardDir * burst * uBreathAmp * breathOn * motionScale * driftWeight;

    // ---- (4) Spring + damping → silhouette stays solid.
    // The spring target is "home plus breath offset" — when a particle
    // is mid-burst its home is briefly displaced outward, so the spring
    // pulls it out, then back to true home once the pulse ends.
    //
    // Spring stiffness is FORM-DEPENDENT. The logo's inner G is small
    // and needs tight K=55 to hold its letterform sharp. The pet and
    // head are larger and benefit from looser K (~28) so a cursor
    // splat visibly scatters their particles instead of merely
    // "bending" the form — at K=55 the spring snaps particles back
    // before the disruption is even readable. Damping is reduced the
    // same proportion so particles oscillate naturally on their longer
    // travel before settling.
    float formFactorSpring = 0.5 + 0.5 * uWLogo;
    float effectiveK = uSpringK * formFactorSpring;
    float effectiveDamping = uDamping * formFactorSpring;
    vec3 effectiveHome = home + breathOffset;
    vec3 spring = (effectiveHome - pos) * effectiveK;
    vec3 damp = -vel * effectiveDamping;

    vec3 force = vec3(curl + fieldDrag, 0.0) + indiv + spring + damp;
    vec3 newVel = vel + force * uDt;

    gl_FragColor = vec4(newVel, 1.0);
  }
`;

// ---- Position-update fragment shader -------------------------------------
// Integrates position from velocity. That's all — pure Eulerian step on the
// values produced by the velocity shader this frame.
const POSITION_SHADER = /* glsl */ `
  uniform float uDt;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;

    pos += vel * uDt;

    gl_FragColor = vec4(pos, 1.0);
  }
`;

// ---- Inner component: runs inside the R3F Canvas ------------------------
function FluidParticles({ formIdx }: { formIdx: number }) {
  const { gl, camera, size } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Outer group owns the responsive scale + continuous Y rotation, so
  // both the particle cloud AND the skull (when in head form) rotate
  // and resize together. Without this the skull would sit static while
  // the particles spun around it.
  const groupRef = useRef<THREE.Group>(null);
  // Smoothed skull opacity. Target = uWHead × cursorOverHead; ref so we
  // can lerp toward it each frame without triggering re-renders.
  const skullOpacityRef = useRef(0);

  // Head silhouette comes from a GLB. useGLTF suspends until the asset
  // loads (handled by the <Suspense> boundary wrapped around this
  // component); after that the scene is available synchronously.
  // We pull from two separate GLBs:
  //   - bobScene (bob-marley.glb) for the particle silhouette
  //   - skullScene (face-skull.glb) for the gold "Skull" sub-mesh
  //     used on hover-reveal — bob-marley.glb has no such sub-mesh.
  const { scene: headScene } = useGLTF(HEAD_PATH);
  const { scene: skullScene } = useGLTF(SKULL_PATH);

  // Mirror the form index prop into a ref so useFrame can read it
  // without re-subscribing on every prop change. Indices map to the
  // weight uniforms via WEIGHT_TARGETS below.
  const formIdxRef = useRef(formIdx);
  useEffect(() => {
    formIdxRef.current = formIdx;
  }, [formIdx]);

  // Responsive mesh scale. The simulation runs in fixed sim-space coords
  // (so we don't have to re-bake home positions on resize), and we apply
  // a uniform scale to the InstancedMesh's modelMatrix at render time.
  // Held in a ref so useFrame can read the latest scale when it converts
  // cursor world coords → sim coords (otherwise the splat would land in
  // the wrong place after a resize).
  const scaleRef = useRef(0.7);
  // Mobile-aware cursor strength multiplier. The velocity cap below
  // already prevents touch "jump" events from catapulting particles, so
  // we don't need to attenuate strength as hard as the original 0.35 —
  // that was making mobile feel dead. 0.75 keeps it readable as a touch
  // interaction while staying below desktop intensity.
  const cursorStrengthRef = useRef(1.0);
  useEffect(() => {
    const w = size.width;
    let s: number;
    let strength: number;
    if (w < 640) {
      s = 0.5;                   // mobile — small, leaves room for stacked content
      strength = 0.75;           // mobile cursor — responsive but not catapult
    } else if (w < 1024) {
      s = 0.6;                   // tablet
      strength = 0.85;
    } else {
      s = 0.7;                   // desktop — was effectively 1.0 before
      strength = 1.0;
    }
    scaleRef.current = s;
    cursorStrengthRef.current = strength;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(s);
    }
  }, [size.width]);

  // Cursor state (world coords on z=0 plane + measured velocity).
  // lastMoveT is wall-clock timestamp (seconds) of the most recent
  // pointermove event — used by useFrame to detect the cursor going
  // idle and clamp the splat to zero, matching igloo's "150ms-idle
  // kills velocity injection" behavior. Without that, the EMA-smoothed
  // velocity bleeds residual energy into the field for a few frames
  // after the cursor stops moving.
  const cursor = useRef({
    pos: new THREE.Vector2(999, 999),
    prev: new THREE.Vector2(0, 0),
    vel: new THREE.Vector2(0, 0),
    speed: 0,
    inside: false,
    lastT: 0,
    lastMoveT: 0,
    ndcX: 999,
    ndcY: 999,
  });

  // Initialize all instance matrices to identity. Three's InstancedMesh
  // constructor zero-fills instanceMatrix (not identity), and zero matrices
  // collapse every instance to the origin — so without this, the GPU-driven
  // positions in our vertex shader would still be multiplied by zero and
  // nothing would render. We never animate instanceMatrix afterwards; all
  // position changes flow through the position texture.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const identity = new THREE.Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mesh.setMatrixAt(i, identity);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Window-level pointer tracking. .hero-particles has pointer-events: none,
  // so we attach to window and map NDC ourselves (same approach as the CPU
  // version).
  useEffect(() => {
    const canvasEl = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      cursor.current.ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      cursor.current.ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      cursor.current.inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      cursor.current.lastMoveT = performance.now() / 1000;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  // One-time GPGPU setup: bake home positions, allocate textures, register
  // velocity + position compute variables, wire dependencies.
  const sim = useMemo(() => {
    const homePositions = new Float32Array(PARTICLE_COUNT * 3);
    const shieldGeos = buildBeveledGeometries(parseShapes(SHIELD_PATH), SHIELD_DEPTH);
    const gGeos = [
      ...buildBeveledGeometries(parseShapes(G_PATH_1), G_DEPTH),
      ...buildBeveledGeometries(parseShapes(G_PATH_2), G_DEPTH),
    ];
    samplePoints(shieldGeos, SHIELD_COUNT, homePositions, 0, 0);
    samplePoints(gGeos, G_COUNT, homePositions, SHIELD_COUNT, G_Z_OFFSET);
    shieldGeos.forEach((g) => g.dispose());
    gGeos.forEach((g) => g.dispose());

    const gpu = new GPUComputationRenderer(TEX_W, TEX_H, gl);

    // Initial position texture = home positions (so the logo is visible
    // immediately, before the velocity field has had a chance to perturb it).
    const dtPos = gpu.createTexture();
    const posData = dtPos.image.data as unknown as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posData[i * 4] = homePositions[i * 3];
      posData[i * 4 + 1] = homePositions[i * 3 + 1];
      posData[i * 4 + 2] = homePositions[i * 3 + 2];
      posData[i * 4 + 3] = 1;
    }

    // Initial velocity texture is all zeros (createTexture zeros by default).
    const dtVel = gpu.createTexture();

    // Read-only home position textures (the velocity shader samples them
    // every frame to compute the spring target). We bake THREE — one for
    // the GIFT logo silhouette, one for the pet (PixelRobot) shape, and
    // one for the head (bob-marley.glb) — and blend between them via the
    // per-form weight uniforms (uWLogo, uWPet, uWHead) which useFrame
    // animates whenever the user steps the form arrow.
    const homeData = new Float32Array(PARTICLE_COUNT * 4);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      homeData[i * 4] = homePositions[i * 3];
      homeData[i * 4 + 1] = homePositions[i * 3 + 1];
      homeData[i * 4 + 2] = homePositions[i * 3 + 2];
      // .w channel encodes "is shield particle" (1 = shield outline,
      // 0 = inner G). The velocity shader reads this to gate the slow
      // home drift — rivers flow across the shield but bypass the
      // inner G, so the small letterform stays sharp and readable.
      homeData[i * 4 + 3] = i < SHIELD_COUNT ? 1 : 0;
    }
    const homeTex = new THREE.DataTexture(
      homeData,
      TEX_W,
      TEX_H,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    homeTex.needsUpdate = true;

    // Pet shape — sampled from the PixelRobot mascot rects.
    const petPositions = new Float32Array(PARTICLE_COUNT * 3);
    samplePetPositions(PARTICLE_COUNT, petPositions);
    const petHomeData = new Float32Array(PARTICLE_COUNT * 4);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      petHomeData[i * 4] = petPositions[i * 3];
      petHomeData[i * 4 + 1] = petPositions[i * 3 + 1];
      petHomeData[i * 4 + 2] = petPositions[i * 3 + 2];
      petHomeData[i * 4 + 3] = 1;
    }
    const petHomeTex = new THREE.DataTexture(
      petHomeData,
      TEX_W,
      TEX_H,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    petHomeTex.needsUpdate = true;

    // Head shape — sampled from bob-marley.glb. The model is a single
    // mesh ("BobMarleyBust") with no internal sub-meshes to exclude,
    // so we sample from every mesh the scene exposes. Particles are
    // distributed across meshes in proportion to vertex count — same
    // weighting strategy the previous face-skull head used, kept here
    // so the code generalises if a future GLB has multiple sub-meshes
    // (e.g. hair vs face).
    const headPositions = new Float32Array(PARTICLE_COUNT * 3);
    const faceMeshes: THREE.Mesh[] = [];
    headScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        faceMeshes.push(obj);
      }
    });
    let totalHeadWeight = 0;
    const headWeights = faceMeshes.map((m) => {
      const w = m.geometry.attributes.position.count;
      totalHeadWeight += w;
      return w;
    });
    let headWritten = 0;
    const headSample = new THREE.Vector3();
    if (faceMeshes.length > 0 && totalHeadWeight > 0) {
      faceMeshes.forEach((mesh, idx) => {
        const share =
          idx === faceMeshes.length - 1
            ? PARTICLE_COUNT - headWritten
            : Math.round((PARTICLE_COUNT * headWeights[idx]) / totalHeadWeight);
        mesh.updateMatrixWorld(true);
        const sampler = new MeshSurfaceSampler(mesh).build();
        for (let i = 0; i < share; i++) {
          sampler.sample(headSample);
          headSample.applyMatrix4(mesh.matrixWorld);
          const o = (headWritten + i) * 3;
          headPositions[o] = headSample.x;
          headPositions[o + 1] = headSample.y;
          headPositions[o + 2] = headSample.z;
        }
        headWritten += share;
      });
    }
    // Fill any unwritten slots (e.g. the GLB had no face meshes) with
    // the origin so the texture is well-defined.
    for (let i = headWritten; i < PARTICLE_COUNT; i++) {
      const o = i * 3;
      headPositions[o] = headPositions[o + 1] = headPositions[o + 2] = 0;
    }

    // Normalize head to match the logo's sim-space bbox: center on
    // origin, scale so the max horizontal extent matches the logo's.
    // Without this the head would render either tiny or enormous
    // depending on the GLB's authoring units, and its center could
    // be off-axis (HeadSkullScene uses Y=0.26 as a frame center).
    let lminX = Infinity, lmaxX = -Infinity, lminY = Infinity, lmaxY = -Infinity;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = homePositions[i * 3];
      const y = homePositions[i * 3 + 1];
      if (x < lminX) lminX = x;
      if (x > lmaxX) lmaxX = x;
      if (y < lminY) lminY = y;
      if (y > lmaxY) lmaxY = y;
    }
    const logoHalfExtent = Math.max(lmaxX - lminX, lmaxY - lminY) / 2;
    let hminX = Infinity, hmaxX = -Infinity;
    let hminY = Infinity, hmaxY = -Infinity;
    let hminZ = Infinity, hmaxZ = -Infinity;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = headPositions[i * 3];
      const y = headPositions[i * 3 + 1];
      const z = headPositions[i * 3 + 2];
      if (x < hminX) hminX = x;
      if (x > hmaxX) hmaxX = x;
      if (y < hminY) hminY = y;
      if (y > hmaxY) hmaxY = y;
      if (z < hminZ) hminZ = z;
      if (z > hmaxZ) hmaxZ = z;
    }
    const headCx = (hminX + hmaxX) / 2;
    const headCy = (hminY + hmaxY) / 2;
    const headCz = (hminZ + hmaxZ) / 2;
    const headHalfExtent = Math.max(hmaxX - hminX, hmaxY - hminY) / 2;
    // 0.95 = sit just inside the logo's silhouette rather than matching
    // its full extent, so the head has a little breathing room when the
    // morph completes.
    const headFitScale = headHalfExtent > 1e-4
      ? (logoHalfExtent * 0.95) / headHalfExtent
      : 1;
    const headHomeData = new Float32Array(PARTICLE_COUNT * 4);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o3 = i * 3;
      const o4 = i * 4;
      headHomeData[o4]     = (headPositions[o3]     - headCx) * headFitScale;
      headHomeData[o4 + 1] = (headPositions[o3 + 1] - headCy) * headFitScale;
      headHomeData[o4 + 2] = (headPositions[o3 + 2] - headCz) * headFitScale;
      headHomeData[o4 + 3] = 1;
    }
    const headHomeTex = new THREE.DataTexture(
      headHomeData,
      TEX_W,
      TEX_H,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    headHomeTex.needsUpdate = true;

    // Seed the initial particle-position texture with HEAD positions
    // (the default landing form). dtPos was first filled with logo
    // positions when it was created above (we needed a non-zero seed
    // before headHomeData was computed); we now overwrite that with
    // the head silhouette so the page opens directly on the head
    // rather than playing a logo→head morph on first render.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o4 = i * 4;
      posData[o4]     = headHomeData[o4];
      posData[o4 + 1] = headHomeData[o4 + 1];
      posData[o4 + 2] = headHomeData[o4 + 2];
      posData[o4 + 3] = 1;
    }

    // Skull mesh — the same GLB carries a "Skull" sub-mesh tucked inside
    // the head. We extract it, bake its GLB-world transform into the
    // geometry (so we can re-parent it under our normalized group), and
    // prep its materials for opacity-driven reveal. The skull stays
    // invisible until the cursor hovers over the head silhouette while
    // the head form is active (handled in useFrame). We sample the GLB's
    // ORIGINAL scene meshes for the head silhouette above, but mutate
    // a clone of the skull so the cached GLB stays clean.
    let skullObject: THREE.Mesh | null = null;
    const skullMaterials: Array<THREE.Material & { opacity: number }> = [];
    // Source the Skull sub-mesh from face-skull.glb (skullScene) — the
    // primary head silhouette is now sampled from bob-marley.glb,
    // which has no Skull mesh of its own. The skull stays as the
    // hover-reveal layer with its original animation.
    skullScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === 'Skull') {
        obj.updateMatrixWorld(true);
        const cloned = obj.clone();
        // Clone geometry then bake the GLB world matrix into it so the
        // mesh can be re-parented without losing its in-scene placement.
        cloned.geometry = obj.geometry.clone();
        cloned.geometry.applyMatrix4(obj.matrixWorld);
        // Normalize the skull to live at origin with unit half-extent.
        // Previously the skull's native face-skull.glb coordinates
        // happened to overlap the particle silhouette's (also from
        // face-skull.glb) so passing Bob's headOffset/headFitScale
        // to the primitive worked. Now the silhouette comes from
        // bob-marley.glb — completely different coordinate space —
        // so applying Bob's transform to face-skull-space geometry
        // dropped the skull onto Bob's chin. Normalizing here means
        // the skull lives in a known reference frame; the render below
        // places it explicitly inside Bob's bust with a Y offset and
        // a smaller scale (since a skull is INSIDE the head, not the
        // size of the whole bust including shoulders).
        cloned.geometry.computeBoundingBox();
        const sBox = cloned.geometry.boundingBox;
        if (sBox) {
          const sCenter = new THREE.Vector3();
          sBox.getCenter(sCenter);
          const sSize = new THREE.Vector3();
          sBox.getSize(sSize);
          const sHalfExtent = Math.max(sSize.x, sSize.y, sSize.z) / 2;
          if (sHalfExtent > 1e-4) {
            cloned.geometry.applyMatrix4(
              new THREE.Matrix4().makeTranslation(-sCenter.x, -sCenter.y, -sCenter.z)
            );
            cloned.geometry.applyMatrix4(
              new THREE.Matrix4().makeScale(
                1 / sHalfExtent,
                1 / sHalfExtent,
                1 / sHalfExtent
              )
            );
          }
        }
        cloned.position.set(0, 0, 0);
        cloned.rotation.set(0, 0, 0);
        cloned.scale.set(1, 1, 1);
        cloned.updateMatrix();
        const prepMat = (m: THREE.Material) => {
          const c = m.clone();
          c.transparent = true;
          // Skull starts hidden — opacity ramps in/out from useFrame based
          // on (head-weight × cursor-over-head). Without `transparent: true`
          // Three would still render it at full alpha regardless of opacity.
          (c as THREE.Material & { opacity: number }).opacity = 0;
          skullMaterials.push(c as THREE.Material & { opacity: number });
          return c;
        };
        cloned.material = Array.isArray(obj.material)
          ? obj.material.map(prepMat)
          : prepMat(obj.material);
        skullObject = cloned;
      }
    });

    // Velocity-FIELD texture — a 2D wind field in world space, separate from
    // particle-velocity. Cursor splats inject velocity here; particles
    // sample this field to "feel" the wind as they pass through it.
    const dtField = gpu.createTexture();

    const fieldVar = gpu.addVariable('textureVelocityField', FIELD_SHADER, dtField);
    const velVar = gpu.addVariable('textureVelocity', VELOCITY_SHADER, dtVel);
    const posVar = gpu.addVariable('texturePosition', POSITION_SHADER, dtPos);

    // Dependencies: field reads itself (persistence/dissipation).
    // Velocity reads itself, position, AND the field (to sample wind).
    // Position reads itself + velocity.
    gpu.setVariableDependencies(fieldVar, [fieldVar]);
    gpu.setVariableDependencies(velVar, [velVar, posVar, fieldVar]);
    gpu.setVariableDependencies(posVar, [velVar, posVar]);

    // Shared world-space window the velocity field covers. Logo lives in
    // roughly [-0.7, 0.7]² in XY, so we pad to [-0.85, 0.85]² so cursor
    // splats just outside the logo also register.
    const fieldOrigin = new THREE.Vector2(-0.85, -0.85);
    const fieldSize = new THREE.Vector2(1.7, 1.7);

    // FIELD-shader uniforms.
    fieldVar.material.uniforms.uDt = { value: 0.016 };
    fieldVar.material.uniforms.uCursorPos = { value: new THREE.Vector2(999, 999) };
    fieldVar.material.uniforms.uCursorVel = { value: new THREE.Vector2(0, 0) };
    fieldVar.material.uniforms.uCursorSpeed = { value: 0 };
    fieldVar.material.uniforms.uFieldOrigin = { value: fieldOrigin };
    fieldVar.material.uniforms.uFieldSize = { value: fieldSize };
    // 0.98 per frame → e-fold time ~0.83 sec. Middle ground: trails are
    // visible long enough for the glow to register, but they don't
    // persist forever.
    fieldVar.material.uniforms.uFieldDissipation = { value: 0.98 };
    // Gaussian radius — bigger = tighter splat. 25 → significant velocity
    // within ~0.17 world units of cursor.
    fieldVar.material.uniforms.uSplatRadius = { value: 25.0 };
    // How much velocity to inject per cursor-speed unit. Middle ground
    // between "particles fly off" (1.5) and "no mobility" (0.6).
    fieldVar.material.uniforms.uSplatStrength = { value: 1.0 };
    // Fedkiw vorticity-confinement strength. Igloo runs at ~10; we pick
    // a touch higher because our field decays faster (0.98/frame vs
    // their 0.98 over their own timestep) and the vortices need a
    // proportionally stronger nudge to persist. Larger → swirlier and
    // more "alive"; too large → unstable cyclones that fight the spring.
    fieldVar.material.uniforms.uVorticityStrength = { value: 12.0 };

    // VELOCITY-shader (particle) uniforms.
    velVar.material.uniforms.uTime = { value: 0 };
    velVar.material.uniforms.uDt = { value: 0.016 };
    velVar.material.uniforms.uHomeTex = { value: homeTex };
    velVar.material.uniforms.uHomePetTex = { value: petHomeTex };
    velVar.material.uniforms.uHomeHeadTex = { value: headHomeTex };
    // Start with the HEAD fully active (default landing form) and the
    // other forms at zero. useFrame animates these toward the active
    // form's target row each tick, producing a smooth cross-fade
    // between any two forms.
    velVar.material.uniforms.uWLogo = { value: 0 };
    velVar.material.uniforms.uWPet = { value: 0 };
    velVar.material.uniforms.uWHead = { value: 1 };
    // Tuning notes:
    //   Two ambient motion sources, both bounded by the spring (K=40):
    //     - Curl peak ≈ S1 + S2·0.35 = 8.5, times uCurlAmp = 0.3 → 2.55
    //     - Per-particle peak = uIndivAmp = 2.0
    //   At HIGH temporal curl frequency (4.5/6.8 rad/s ≫ slow waves), the
    //   spring tracks the curl with attenuated amplitude, so effective
    //   displacement is well below the steady-state value of 0.07.
    //   The CURSOR no longer applies force directly — it splats into the
    //   velocity field (see FIELD_SHADER), and particles get pulled by
    //   the field via uFieldDrag.
    // Pumped ambient motion: bigger amplitude, slower frequencies, and
    // longer per-particle frequency spread. Particles now visibly travel
    // ~6–8% of logo width on their own (vs. ~3% before) so the cloud
    // reads as constantly flowing inside the silhouette instead of just
    // shimmering in place.
    velVar.material.uniforms.uCurlAmp = { value: 0.3 };
    // Reduced from 3.2 → 2.4 so the inner G of the logo reads
    // crisply. Per-particle oscillation at 3.2 was blurring the
    // small interior letterform; 2.4 keeps each bead visibly alive
    // without smearing the silhouette.
    velVar.material.uniforms.uIndivAmp = { value: 2.4 };
    velVar.material.uniforms.uFreqBase = { value: 2.5 };
    velVar.material.uniforms.uFreqSpread = { value: 10.0 };
    // Bumped from 40 → 55 to tighten the spring. Combined with the
    // lower uIndivAmp above, the small G inside the shield holds its
    // shape better against the slow drift + breath bursts.
    velVar.material.uniforms.uSpringK = { value: 55 };
    velVar.material.uniforms.uDamping = { value: 5 };
    // Field-sampling uniforms — must share values with FIELD shader so
    // both use the same world-to-UV mapping.
    velVar.material.uniforms.uFieldOrigin = { value: fieldOrigin };
    velVar.material.uniforms.uFieldSize = { value: fieldSize };
    // How aggressively particles get dragged toward the field's velocity.
    // 5.0 brings back the responsive mobility (particle reaches ~63% of
    // field velocity in ~0.2 sec) without the previous catapult behaviour
    // (which came from uSplatStrength = 1.5 + uFieldDrag = 6).
    velVar.material.uniforms.uFieldDrag = { value: 5.0 };
    // Breath bursts — sparse "particles ventures briefly out of line"
    // effect. uBreathAmp is the max outward home-offset in sim-space
    // units; 0.10 = ~10% of the form's half-extent, visible but small.
    // uBreathFilter is the per-particle hash threshold: 0.93 means only
    // the top ~7% of particles ever burst, so at any moment only a few
    // dozen are visibly out of formation across the whole cloud.
    // Reduced from 0.1 → 0.06 so breath bursts displace less and the
    // inner G doesn't get visibly chunked when bursts fire near it.
    velVar.material.uniforms.uBreathAmp = { value: 0.06 };
    velVar.material.uniforms.uBreathFilter = { value: 0.93 };
    // Slow-curl home drift — gives the cloud persistent "river"
    // currents even at rest. Bumped back up to 0.06 now that the
    // shader gates drift to shield-only on the logo form (the
    // driftWeight = uWLogo * isShield + uWPet + uWHead expression).
    // The inner G stays sharp because its drift is zero; the shield
    // gets clearly visible rivers without smearing the letterform.
    velVar.material.uniforms.uSlowDriftAmp = { value: 0.06 };

    posVar.material.uniforms.uDt = { value: 0.016 };

    const err = gpu.init();
    if (err !== null) {
      // eslint-disable-next-line no-console
      console.error('[GiftLogoFluid] GPGPU init failed:', err);
    }

    return {
      gpu,
      fieldVar,
      velVar,
      posVar,
      homeTex,
      // Skull rendering (only used when the head form is active + cursor
      // is hovering it). headOffset + headFitScale put the skull into the
      // same normalized sim space the head particle silhouette lives in.
      skullObject: skullObject as THREE.Mesh | null,
      skullMaterials,
      headOffset: [
        -headCx * headFitScale,
        -headCy * headFitScale,
        -headCz * headFitScale,
      ] as [number, number, number],
      headFitScale,
      headHalfExtent: headHalfExtent * headFitScale,
    };
  }, [gl, headScene, skullScene]);

  // Instanced geometry: each instance has a baked UV pointing to its slot
  // in the GPU position texture. The vertex shader uses that UV to look up
  // where the instance should be placed in world space.
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.014, 0);
    const uvs = new Float32Array(PARTICLE_COUNT * 2);
    // Per-particle binary size jitter — uniform across all UV slots so
    // the cloud has visible "grain" in every form (igloo's discrete
    // 0.85/1.15 split). We earlier tried splitting the size budget by
    // shield-vs-G (small shield, large G) to make the inner G readable,
    // but that bakes per UV slot at mount — when the cloud morphs to
    // head or pet, those same slots map sequentially through different
    // face/body sub-meshes and one half of the form ends up tiny while
    // the other half ends up huge. The form-dependent size scaling
    // (logo's G gets enlarged) is now done in the vertex shader using
    // an `instIsShield` per-particle flag + the uWLogo material uniform,
    // so this attribute is back to a uniform random grain.
    const sizes = new Float32Array(PARTICLE_COUNT);
    const isShieldAttr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Center-of-texel UV (offset by 0.5/W) so we sample exact texels, not
      // edges where bilinear filtering would mix neighbors.
      uvs[i * 2] = (i % TEX_W + 0.5) / TEX_W;
      uvs[i * 2 + 1] = (Math.floor(i / TEX_W) + 0.5) / TEX_H;
      sizes[i] = Math.random() < 0.5 ? 0.85 : 1.15;
      isShieldAttr[i] = i < SHIELD_COUNT ? 1 : 0;
    }
    geo.setAttribute('instUv', new THREE.InstancedBufferAttribute(uvs, 2));
    geo.setAttribute('instSize', new THREE.InstancedBufferAttribute(sizes, 1));
    geo.setAttribute('instIsShield', new THREE.InstancedBufferAttribute(isShieldAttr, 1));
    return geo;
  }, []);

  // Material: standard PBR shading, but we hijack the vertex shader via
  // onBeforeCompile to inject the per-instance position from the GPU
  // position texture. Storing the compiled shader in a ref so we can
  // update its uniform from useFrame after every compute step.
  const shaderRef = useRef<THREE.WebGLProgramParametersWithUniforms | null>(null);
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x9aaccc,
      metalness: 0.4,
      roughness: 0.35,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uPositionTex = { value: null };
      shader.uniforms.uVelocityTex = { value: null };
      // Form weight for the logo silhouette (0 in pet/head, 1 in logo).
      // Drives the form-dependent size scaling below — only the logo
      // form enlarges its G particles and shrinks its shield ones.
      // Synced from useFrame.
      shader.uniforms.uWLogo = { value: 1 };
      // Glow tuning — speed thresholds must sit ABOVE the ambient idle
      // velocity (≈0.4–0.6 u/s from curl + per-particle noise) so resting
      // particles don't pick up any glow. Cursor-driven motion peaks at
      // 1.5–2.5 u/s, so glow ramps over that range.
      //   vSpeed ≤ 1.0 → 0 glow (particles look idle)
      //   vSpeed = 2.5 → full red glow (cursor-flung particles)
      shader.uniforms.uGlowSpeedMin = { value: 1.0 };
      shader.uniforms.uGlowSpeedMax = { value: 2.5 };
      shader.uniforms.uGlowIntensity = { value: 7.0 };
      // Brand cherry red from finance-consulting (--cherry: #e63946).
      // (The DX page proper is a blue/purple palette — no red defined —
      // so we borrow this for the glow accent.)
      shader.uniforms.uGlowColor = { value: new THREE.Color('#e63946') };
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         attribute vec2 instUv;
         attribute float instSize;
         attribute float instIsShield;
         uniform sampler2D uPositionTex;
         uniform sampler2D uVelocityTex;
         uniform float uWLogo;
         varying float vSpeed;`
      );
      // Inject the per-instance position offset + sample the velocity
      // texture to compute per-instance speed (passed to the fragment
      // shader via vSpeed for the glow effect below). `position` is the
      // icosahedron-local vertex, so multiplying it by the final size
      // before adding the instance offset scales each bead individually.
      //
      // Final size = instSize (uniform random grain) × formFactor:
      //   - Logo form (uWLogo=1): G particles (isShield=0) scale to ~1.6×,
      //     shield particles (isShield=1) scale to ~0.75×. Makes the
      //     small inner letterform pop against the bulk shield outline.
      //   - Pet/head forms (uWLogo=0): formFactor = 1.0 so every bead
      //     keeps its random-grain size, no per-half-of-form asymmetry.
      //   - During a morph (uWLogo between 0 and 1): the form factor
      //     interpolates smoothly so the transition reads as continuous.
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `vec3 instPos = texture2D(uPositionTex, instUv).xyz;
         vec3 instVel = texture2D(uVelocityTex, instUv).xyz;
         vSpeed = length(instVel);
         float logoSize = mix(1.6, 0.75, instIsShield);
         float formFactor = mix(1.0, logoSize, uWLogo);
         vec3 transformed = position * instSize * formFactor + instPos;`
      );
      // Fragment side: pick up vSpeed and the glow uniforms, add emissive
      // light proportional to speed. smoothstep gives a soft on/off so the
      // glow only kicks in once a particle is moving meaningfully, not
      // on tiny ambient noise.
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         varying float vSpeed;
         uniform float uGlowSpeedMin;
         uniform float uGlowSpeedMax;
         uniform float uGlowIntensity;
         uniform vec3 uGlowColor;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float glow = smoothstep(uGlowSpeedMin, uGlowSpeedMax, vSpeed);
         totalEmissiveRadiance += uGlowColor * glow * uGlowIntensity;`
      );
      shaderRef.current = shader;
    };
    return mat;
  }, []);

  // Per-frame: update cursor in world coords, push uniforms, run GPU
  // compute, then point the render material at the freshly-written
  // position texture.
  const cursorWorld = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());
  const ndcVec = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const safeDt = Math.min(dt, 1 / 30);
    const elapsed = state.clock.getElapsedTime();

    // Unproject NDC cursor to world-space at z=0 (same approach as CPU
    // version — gives consistent kick geometry).
    let cursorActive = false;
    if (cursor.current.inside) {
      ndcVec.current.set(cursor.current.ndcX, cursor.current.ndcY, 0.5);
      ndcVec.current.unproject(camera);
      camDir.current.copy(ndcVec.current).sub(camera.position).normalize();
      if (Math.abs(camDir.current.z) > 1e-4) {
        const tPlane = -camera.position.z / camDir.current.z;
        cursorWorld.current
          .copy(camera.position)
          .add(camDir.current.multiplyScalar(tPlane));
        cursorActive = true;
      }
    }

    // Cursor velocity in world units/sec. Touch sampling on mobile is
    // irregular (10–60Hz depending on device + browser), so the per-frame
    // raw velocity can spike or stutter even during a steady drag. We
    // apply an exponential moving average (low-pass filter) to smooth
    // those samples into a continuous velocity signal — particles get
    // a clean trajectory instead of jittering between samples.
    if (cursorActive) {
      const now = performance.now() / 1000;
      const prev = cursor.current.lastT;
      const elapsedT = Math.max(now - prev, 1e-3);
      if (prev > 0 && elapsedT < 0.1) {
        const rawVelX = (cursorWorld.current.x - cursor.current.prev.x) / elapsedT;
        const rawVelY = (cursorWorld.current.y - cursor.current.prev.y) / elapsedT;
        // EMA factor: lower α = more smoothing but slower response.
        // 0.3 = each frame mixes 30% of the raw sample with 70% of the
        // previous smoothed value → ~3-frame e-fold time.
        const ALPHA = 0.3;
        cursor.current.vel.x = cursor.current.vel.x * (1 - ALPHA) + rawVelX * ALPHA;
        cursor.current.vel.y = cursor.current.vel.y * (1 - ALPHA) + rawVelY * ALPHA;
      } else {
        cursor.current.vel.set(0, 0);
      }
      cursor.current.prev.set(cursorWorld.current.x, cursorWorld.current.y);
      cursor.current.lastT = now;
      cursor.current.pos.set(cursorWorld.current.x, cursorWorld.current.y);
      cursor.current.speed = cursor.current.vel.length();
      // CAP the cursor velocity — touch events on mobile can register
      // huge instantaneous speeds (sparse sampling → finger appears to
      // teleport between samples). Without a cap, a single touch jump
      // creates a splat strong enough to catapult particles across the
      // canvas. 3.5 u/s leaves headroom for a brisk sweep while still
      // catching the catastrophic touch-jump case.
      const MAX_CURSOR_SPEED = 3.5;
      if (cursor.current.speed > MAX_CURSOR_SPEED) {
        const factor = MAX_CURSOR_SPEED / cursor.current.speed;
        cursor.current.vel.multiplyScalar(factor);
        cursor.current.speed = MAX_CURSOR_SPEED;
      }
    } else {
      cursor.current.vel.set(0, 0);
      cursor.current.speed = 0;
      cursor.current.pos.set(999, 999);
    }

    // Push uniforms. Two gates kill the splat:
    //   (a) instantaneous EMA-smoothed speed must be > 0.04 (filters
    //       out tiny jitter velocities), and
    //   (b) the cursor must have moved within the last 150ms (matches
    //       igloo's idle-detection — parked-cursor doesn't keep bleeding
    //       energy into the field even though the EMA decays gradually).
    //  Together these zero the cursor splat the moment the user stops
    //  moving, so the field's residual motion can dissipate cleanly.
    const wallNow = performance.now() / 1000;
    const cursorIdle = wallNow - cursor.current.lastMoveT > 0.15;
    const effectiveCursorSpeed =
      cursor.current.speed > 0.04 && !cursorIdle
        ? cursor.current.speed * cursorStrengthRef.current
        : 0;

    // COUNTER-ROTATE + UNSCALE the cursor for the field shader. The field
    // lives in SIM space (untransformed coords), but the cursor is
    // unprojected from the SCREEN (world / rendered space). The mesh has
    // both a Y-axis rotation AND a uniform scale applied via modelMatrix:
    //     rendered = R_y · S · sim
    //     rendered_x = S · (sim_x·cos(θ) + sim_z·sin(θ))
    //     rendered_y = S · sim_y
    // To splat at the sim-space location whose RENDERED position matches
    // the cursor (with sim_z ≈ 0 for our flat logo):
    //     sim_x = rendered_x · cos(θ) / S
    //     sim_y = rendered_y / S
    // Without dividing by S, a smaller mesh would still "claim" the full
    // world coord space and the splat would land outside the visible logo.
    const meshAngleY = elapsed * 0.6;
    const cosA = Math.cos(meshAngleY);
    const invS = 1 / scaleRef.current;
    const simCursorX = cursor.current.pos.x * cosA * invS;
    const simCursorY = cursor.current.pos.y * invS;
    const simCursorVelX = cursor.current.vel.x * cosA * invS;
    const simCursorVelY = cursor.current.vel.y * invS;

    const fu = sim.fieldVar.material.uniforms;
    fu.uDt.value = safeDt;
    fu.uCursorPos.value.set(simCursorX, simCursorY);
    fu.uCursorVel.value.set(simCursorVelX, simCursorVelY);
    fu.uCursorSpeed.value = effectiveCursorSpeed;

    const vu = sim.velVar.material.uniforms;
    vu.uTime.value = elapsed;
    vu.uDt.value = safeDt;
    // Animate the per-form weights toward the active form's target row.
    // Each form has exactly one weight at 1 and the rest at 0; the
    // exponential ease (≈10%/frame) takes ~1.5 sec to complete a morph,
    // which is enough for the cloud to visibly travel between silhouettes.
    // Index map: 0 = head (default), 1 = logo, 2 = pet.
    const idx = formIdxRef.current;
    const targetHead = idx === 0 ? 1 : 0;
    const targetLogo = idx === 1 ? 1 : 0;
    const targetPet  = idx === 2 ? 1 : 0;
    const morphLerp = Math.min(safeDt * 6.0, 0.5);
    vu.uWLogo.value += (targetLogo - vu.uWLogo.value) * morphLerp;
    vu.uWPet.value  += (targetPet  - vu.uWPet.value)  * morphLerp;
    vu.uWHead.value += (targetHead - vu.uWHead.value) * morphLerp;
    sim.posVar.material.uniforms.uDt.value = safeDt;

    // Compute new velocity, then new position (ping-pong handled internally).
    sim.gpu.compute();

    // Wire the freshly-written position + velocity textures into the
    // render material. The vertex shader uses the position to place each
    // instance; the velocity drives the per-particle glow.
    const posTex = sim.gpu.getCurrentRenderTarget(sim.posVar).texture;
    const velTex = sim.gpu.getCurrentRenderTarget(sim.velVar).texture;
    if (shaderRef.current) {
      shaderRef.current.uniforms.uPositionTex.value = posTex;
      shaderRef.current.uniforms.uVelocityTex.value = velTex;
      // Share the logo-form weight so the vertex shader can apply the
      // shield/G size split only when on the logo form (and smoothly
      // interpolate during morphs). Guarded with an existence check —
      // on first frames after HMR or compile cache hits, the shader's
      // uniforms map can lag behind the JS, and accessing .value on
      // an undefined entry crashes the render loop.
      if (shaderRef.current.uniforms.uWLogo) {
        shaderRef.current.uniforms.uWLogo.value = vu.uWLogo.value;
      }
    }

    // Non-stop continuous turntable spin — the logo turns left/right
    // around its vertical axis, so the camera sees the front face, then
    // the side profile (showing the SVG extrusion depth), then the back.
    // `elapsed` is monotonic and never resets, so rotation.y grows
    // unbounded → spin never stops. 0.6 rad/s → 360° every ~10.5s.
    // Rotation is on the outer GROUP (not the mesh) so the skull mesh
    // — when visible — spins with the particle cloud instead of sitting
    // still at the center.
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.6;
      groupRef.current.rotation.x = 0;
    }

    // Skull reveal: requires THREE conditions, multiplied together so
    // any one missing zeroes it out:
    //   (1) Head form is the active morph (uWHead ≈ 1) — the skull is
    //       part of the head, so it makes no sense during logo/pet.
    //   (2) Cursor sits INSIDE the head's normalized bbox — "you're
    //       looking at the head."
    //   (3) Cursor is actively MOVING — a stationary cursor resting on
    //       the head keeps the skull hidden. Without this gate the
    //       skull would linger any time the user paused with the
    //       pointer parked over the silhouette.
    // Speed is smoothstepped over [0.04, 0.15] u/s so the gate eases in
    // and out instead of clicking on at a hard threshold — avoids
    // flicker when the cursor velocity hovers right around the cutoff.
    const headHalfExtent = sim.headHalfExtent;
    const positionallyOverHead =
      cursor.current.inside &&
      Math.abs(simCursorX) < headHalfExtent &&
      Math.abs(simCursorY) < headHalfExtent;
    const speedRaw = (cursor.current.speed - 0.04) / (0.15 - 0.04);
    const speedClamp = Math.max(0, Math.min(1, speedRaw));
    const speedGate = speedClamp * speedClamp * (3 - 2 * speedClamp);
    // Cap final opacity at 0.85 so particles in front of the skull
    // still read clearly against it.
    const skullTarget =
      (positionallyOverHead ? speedGate : 0) * vu.uWHead.value * 0.85;
    const skullFade = 1 - Math.exp(-8.0 * safeDt);
    skullOpacityRef.current = THREE.MathUtils.lerp(
      skullOpacityRef.current,
      skullTarget,
      skullFade
    );
    for (const m of sim.skullMaterials) {
      m.opacity = skullOpacityRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, PARTICLE_COUNT]}
        // Positions are computed in the vertex shader, so the default frustum
        // culling (based on local geometry bounds) would cull the whole mesh.
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      />
      {sim.skullObject && (
        <primitive
          object={sim.skullObject}
          // Skull is now origin-centered with unit half-extent (see
          // normalization in the useMemo above). Bob's bust spans
          // ±sim.headHalfExtent on its dominant axis with the head
          // occupying the upper portion — the +Y offset (~30% of the
          // half-extent) places the skull inside Bob's head instead
          // of his chin/center, and the scale (~40% of the half-extent)
          // sizes it as a skull-inside-head rather than skull-the-size-
          // of-bust. Tune these two constants if the skull lands too
          // high/low or too big/small relative to Bob's silhouette.
          position={[0, sim.headHalfExtent * 0.3, 0]}
          scale={sim.headHalfExtent * 0.4}
        />
      )}
    </group>
  );
}

// Lighting rig matches the CPU version so the bead look is consistent.
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} color="#cdd6e6" />
      <directionalLight position={[3, 4, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#9aadc9" />
    </>
  );
}

// Available particle forms in display order. 0 = head (sampled from
// bob-marley.glb, the default landing form), 1 = GIFT logo silhouette,
// 2 = pet (PixelRobot) silhouette. Left/right arrows step through this
// list and wrap around at the ends. Extend the array to add more forms
// later — the shader takes one weight uniform per form and the
// per-frame animation routine in useFrame maps index → target weights.
const FORM_VALUES = [0, 1, 2] as const;

export default function GiftLogoFluid() {
  // Index into FORM_VALUES. The Canvas animates the GPU weight uniforms
  // smoothly toward this index's target row each frame, so every step
  // plays as a particle-flow cross-fade between two forms.
  const [formIdx, setFormIdx] = useState(0);

  // Pause the GPU sim when the hero is off-screen. Without this the
  // FBO ping-pong keeps running all the way down the page, contending
  // with Hero3D + the orbit-tile videos and visibly tanking framerate
  // around the capabilities section. IntersectionObserver flips frameloop
  // between 'always' (visible) and 'never' (R3F skips renders entirely).
  const heroRef = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { threshold: 0, rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-cycle the form every 12 seconds while the hero is on-screen.
  // Gated on frameloop so when the user scrolls past, we stop firing
  // setState (would otherwise keep ticking and re-rendering invisibly).
  useEffect(() => {
    if (frameloop !== 'always') return;
    const id = window.setInterval(() => {
      setFormIdx((i) => (i + 1) % FORM_VALUES.length);
    }, 12_000);
    return () => window.clearInterval(id);
  }, [frameloop]);

  // Mount guard. R3F's <Canvas> serializes to an empty <canvas> on
  // the server but the client hydrator immediately attaches WebGL
  // state, sets DPR-scaled width/height, and registers pointer
  // listeners — that delta blows up hydration with a "server HTML
  // doesn't match client" error. Deferring the Canvas mount until
  // after first client render keeps SSR output and the initial
  // client output identical (both: just the heroRef'd div).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="hero-particles" ref={heroRef}>
        {mounted && (
        <Canvas
          frameloop={frameloop}
          camera={{ position: [0, 0, 4.2], fov: 38, near: 0.1, far: 50 }}
          dpr={[1, 2]}
          // ACES tone mapping + an environment map make the skull's gold
          // PBR material actually read as metal. Without these the gold
          // looks like flat opaque mustard because there's no reflection
          // for the metallic channel to sample. Same setup HeadSkullScene
          // uses, ported here so the skull preserves its sheen.
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
        >
          <SceneLights />
          {/* Suspense boundary: useGLTF inside FluidParticles + the
              Environment HDR both suspend until they load. With no
              boundary R3F would throw. */}
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <FluidParticles formIdx={formIdx} />
          </Suspense>
        </Canvas>
        )}
        {/* Touch-capture overlay — invisible, sized via CSS to roughly the
            logo's visible region. Inside this rect, touch-action: none
            keeps the gesture for the particles (vertical swipes register
            as particle drags instead of page scrolls). Outside this rect,
            touches pass through the canvas (pointer-events: none) to the
            page and scroll normally. */}
        <div className="hero-particles-touch" aria-hidden />
      </div>
    </>
  );
}
