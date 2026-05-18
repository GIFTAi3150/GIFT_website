'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const MODEL_PATH = '/face-skull.glb';
const HEAD_Y_CENTER = 0.26;

// Particle budget: full density on desktop, ~half on mobile so the per-frame
// physics loop stays smooth on mid-range phones. Decided once on first render
// — doesn't react to resize because re-allocating + re-sampling mid-session
// would visibly stutter.
const DESKTOP_PARTICLE_COUNT = 25000;
const MOBILE_PARTICLE_COUNT = 14000;
const MOBILE_BREAKPOINT_PX = 768;
function pickParticleCount() {
  if (typeof window === 'undefined') return DESKTOP_PARTICLE_COUNT;
  return window.innerWidth < MOBILE_BREAKPOINT_PX
    ? MOBILE_PARTICLE_COUNT
    : DESKTOP_PARTICLE_COUNT;
}

// World-space frame the camera should always fit. Head bbox is roughly
// 1.8 wide × 1.6 tall after the alignment, so 2.0 × 1.8 leaves a touch of
// padding on both axes regardless of viewport orientation.
const HEAD_FRAME_WIDTH = 2.0;
const HEAD_FRAME_HEIGHT = 1.8;

// ---- Physics (mirrored from GiftLogoParticles) ----------------------------
const SPRING_K = 18;
const DAMPING = 4.5;
const INDIV_AMP = 1.3;
const INDIV_FREQ_BASE = 1.8;
const INDIV_FREQ_SPREAD = 1.5;
const WOBBLE_AMP = 0.01;
const WOBBLE_BASE_FREQ = 4.0;
const WOBBLE_FREQ_SPREAD = 1.4;

// ---- Cursor kick ----------------------------------------------------------
const KICK_RADIUS = 0.22;
const KICK_BASE = 0.7;
const KICK_SPEED_GAIN = 2.6;
const KICK_SPEED_CAP = 3.5;
const MIN_CURSOR_SPEED = 0.04;

// ---- Glow color -----------------------------------------------------------
const GLOW_VEL_REF = 0.35;
const COLOR_LERP_UP = 0.45;
const COLOR_LERP_DOWN = 0.05;
// Match GiftLogoFluid exactly — slate-blue base bracketing 0x9aaccc, cherry-red
// glow (finance-consulting brand color). Keeps the head visually part of the
// same particle family as the hero logo cloud below it on the DX page.
const PARTICLE_COLOR_A = new THREE.Color('#8ba0c6');
const PARTICLE_COLOR_B = new THREE.Color('#adbed6');
const GLOW_COLOR = new THREE.Color('#e63946');

// Adjusts camera Z to keep the head's bounding box fully on-screen at any
// viewport aspect — fixes portrait phones where the default Z=2.6 + fov=32
// would crop the head horizontally.
function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    // Distance to fit both head dimensions in frame, take the larger.
    const zForHeight = HEAD_FRAME_HEIGHT / 2 / Math.tan(vfov / 2);
    const zForWidth = HEAD_FRAME_WIDTH / 2 / Math.tan(hfov / 2);
    const z = Math.max(zForHeight, zForWidth);
    camera.position.set(0, HEAD_Y_CENTER, z);
    camera.lookAt(0, HEAD_Y_CENTER, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function ParticleHead() {
  const { scene } = useGLTF(MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Locked at first mount so resizing the window mid-session doesn't trigger
  // a buffer reallocation + visible re-seed.
  const PARTICLE_COUNT = useMemo(() => pickParticleCount(), []);

  const setup = useMemo(() => {
    const faceMeshes: THREE.Mesh[] = [];
    const skullMaterials: THREE.Material[] = [];
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.name === 'Skull') {
        // Skull starts INVISIBLE — gets faded in only while cursor is on
        // the face so the gold doesn't leak through gaps in the cloud at rest.
        const prepSkull = (m: THREE.Material) => {
          const c = m.clone();
          c.transparent = true;
          c.opacity = 0;
          skullMaterials.push(c);
          return c;
        };
        obj.material = Array.isArray(obj.material)
          ? obj.material.map(prepSkull)
          : prepSkull(obj.material);
        return;
      }
      if (obj instanceof THREE.Mesh && obj.name !== 'Skull') {
        const prep = (m: THREE.Material) => {
          const c = m.clone();
          c.transparent = true;
          c.opacity = 0;
          c.depthWrite = false;
          c.colorWrite = false;
          return c;
        };
        obj.material = Array.isArray(obj.material)
          ? obj.material.map(prep)
          : prep(obj.material);
        faceMeshes.push(obj);
      }
    });

    // Allocate per-particle buffers.
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const baseColors = new Float32Array(PARTICLE_COUNT * 3);

    // Sample each face mesh, proportional to its vertex count.
    let totalWeight = 0;
    const weights = faceMeshes.map((m) => {
      const w = m.geometry.attributes.position.count;
      totalWeight += w;
      return w;
    });

    let written = 0;
    const pos = new THREE.Vector3();
    const throwawayNormal = new THREE.Vector3();
    const throwawayColor = new THREE.Color();
    const throwawayUV = new THREE.Vector2();
    const tint = new THREE.Color();

    if (faceMeshes.length > 0 && totalWeight > 0) {
      faceMeshes.forEach((mesh, idx) => {
        const share =
          idx === faceMeshes.length - 1
            ? PARTICLE_COUNT - written
            : Math.round((PARTICLE_COUNT * weights[idx]) / totalWeight);
        mesh.updateMatrixWorld(true);
        const sampler = new MeshSurfaceSampler(mesh).build();
        for (let i = 0; i < share; i++) {
          sampler.sample(pos, throwawayNormal, throwawayColor, throwawayUV);
          pos.applyMatrix4(mesh.matrixWorld);
          const o = (written + i) * 3;
          positions[o] = pos.x;
          positions[o + 1] = pos.y;
          positions[o + 2] = pos.z;
          // Slate-silver tint per particle, randomly interpolated between the
          // two palette anchors. Same approach the logo uses, so the head
          // reads as part of the same particle family.
          tint.copy(PARTICLE_COLOR_A).lerp(PARTICLE_COLOR_B, Math.random());
          baseColors[o] = tint.r;
          baseColors[o + 1] = tint.g;
          baseColors[o + 2] = tint.b;
        }
        written += share;
      });
    }

    // Per-particle state for the physics loop.
    const currentPositions = new Float32Array(positions);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const scales = new Float32Array(PARTICLE_COUNT);
    const instanceColors = new Float32Array(baseColors); // start matched to base
    const randoms = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      scales[i] = 0.55 + Math.random() * 0.7;
      randoms[i * 3] = Math.random() * Math.PI * 2;
      randoms[i * 3 + 1] = Math.random() * Math.PI * 2;
      randoms[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    return {
      faceMeshes,
      skullMaterials,
      basePositions: positions,
      currentPositions,
      velocities,
      scales,
      instanceColors,
      baseColors,
      randoms,
    };
  }, [cloned]);

  // Slightly bigger beads + a touch of metalness so the face reads in 3D.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.013, 0), []);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.55,
    });
    // Lighter emissive boost than the logo (face colors are darker than slate
    // so we don't want as aggressive a glow).
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        #ifdef USE_INSTANCING_COLOR
          // Same threshold + boost the logo uses (slate beads → cyan-white).
          float gGlow = smoothstep(1.2, 1.7, length(vColor));
          totalEmissiveRadiance += vColor * gGlow * 9.0;
        #endif
        `
      );
    };
    return m;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { basePositions, scales, instanceColors } = setup;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      dummy.position.set(basePositions[i3], basePositions[i3 + 1], basePositions[i3 + 2]);
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(instanceColors, 3);
    mesh.instanceColor.needsUpdate = true;
  }, [setup, dummy]);

  const { camera, pointer } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const cursorWorld = useRef(new THREE.Vector3(999, 999, 999));
  const prevCursor = useRef({ x: 0, y: 0, z: 0, t: 0, valid: false });
  const cursorVel = useRef({ x: 0, y: 0, z: 0, mag: 0 });
  // Skull opacity smoothed independently of the physics. 0 = hidden, 1 = full.
  const skullOpacity = useRef(0);
  // Lerp speed for skull fade in/out — quicker than the kick decay so the
  // reveal feels immediate when the cursor enters the face.
  const SKULL_FADE_LERP = 8.0;

  useFrame((state, deltaRaw) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { clock } = state;
    const dt = Math.min(deltaRaw, 1 / 30);
    const t = clock.getElapsedTime();
    const {
      basePositions,
      currentPositions,
      velocities,
      scales,
      instanceColors,
      baseColors,
      randoms,
      faceMeshes,
    } = setup;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(faceMeshes, false);
    const cursorActive = hits.length > 0;
    if (cursorActive) cursorWorld.current.copy(hits[0].point);

    // Fade skull in/out based on whether the cursor is on the face.
    const skullTarget = cursorActive ? 1 : 0;
    const skullFactor = 1 - Math.exp(-SKULL_FADE_LERP * dt);
    skullOpacity.current = THREE.MathUtils.lerp(
      skullOpacity.current,
      skullTarget,
      skullFactor
    );
    setup.skullMaterials.forEach((m) => {
      (m as THREE.Material & { opacity: number }).opacity = skullOpacity.current;
    });

    if (cursorActive) {
      const now = performance.now() / 1000;
      const prev = prevCursor.current;
      if (prev.valid) {
        const elapsed = Math.max(now - prev.t, 1e-3);
        if (elapsed < 0.1) {
          cursorVel.current.x = (cursorWorld.current.x - prev.x) / elapsed;
          cursorVel.current.y = (cursorWorld.current.y - prev.y) / elapsed;
          cursorVel.current.z = (cursorWorld.current.z - prev.z) / elapsed;
        } else {
          cursorVel.current.x = cursorVel.current.y = cursorVel.current.z = 0;
        }
      }
      prev.x = cursorWorld.current.x;
      prev.y = cursorWorld.current.y;
      prev.z = cursorWorld.current.z;
      prev.t = now;
      prev.valid = true;
    } else {
      cursorVel.current.x = cursorVel.current.y = cursorVel.current.z = 0;
      prevCursor.current.valid = false;
    }
    cursorVel.current.mag = Math.hypot(
      cursorVel.current.x,
      cursorVel.current.y,
      cursorVel.current.z
    );

    const cx = cursorWorld.current.x;
    const cy = cursorWorld.current.y;
    const cz = cursorWorld.current.z;
    const kr2 = KICK_RADIUS * KICK_RADIUS;
    const speedFactor = Math.min(KICK_SPEED_GAIN * cursorVel.current.mag, KICK_SPEED_CAP);
    const cursorMoving = cursorActive && cursorVel.current.mag > MIN_CURSOR_SPEED;
    const cvx = cursorVel.current.x;
    const cvy = cursorVel.current.y;
    const cvz = cursorVel.current.z;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const px = currentPositions[i3];
      const py = currentPositions[i3 + 1];
      const pz = currentPositions[i3 + 2];
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      const sx = bx - px;
      const sy = by - py;
      const sz = bz - pz;
      let fx = SPRING_K * sx - DAMPING * velocities[i3];
      let fy = SPRING_K * sy - DAMPING * velocities[i3 + 1];
      let fz = SPRING_K * sz - DAMPING * velocities[i3 + 2];

      const sX = randoms[i3];
      const sY = randoms[i3 + 1];
      const sZ = randoms[i3 + 2];
      const fXr = INDIV_FREQ_BASE + sX * INDIV_FREQ_SPREAD;
      const fYr = INDIV_FREQ_BASE + sY * INDIV_FREQ_SPREAD;
      const fZr = INDIV_FREQ_BASE + sZ * INDIV_FREQ_SPREAD;
      fx += Math.sin(t * fXr + sX * 7.0) * INDIV_AMP;
      fy += Math.cos(t * fYr + sY * 7.0) * INDIV_AMP;
      fz += Math.sin(t * fZr + sZ * 7.0) * INDIV_AMP * 0.6;

      velocities[i3] += fx * dt;
      velocities[i3 + 1] += fy * dt;
      velocities[i3 + 2] += fz * dt;

      if (cursorMoving) {
        const cdx = bx - cx;
        const cdy = by - cy;
        const cdz = bz - cz;
        const cdist2 = cdx * cdx + cdy * cdy + cdz * cdz;
        if (cdist2 < kr2 && cdist2 > 1e-6) {
          const cdist = Math.sqrt(cdist2);
          const falloff = 1 - cdist / KICK_RADIUS;
          const impulse = falloff * falloff * KICK_BASE * speedFactor;
          velocities[i3] += (cdx / cdist) * impulse;
          velocities[i3 + 1] += (cdy / cdist) * impulse;
          velocities[i3 + 2] += (cdz / cdist) * impulse;
          velocities[i3] += cvx * falloff * 0.35;
          velocities[i3 + 1] += cvy * falloff * 0.35;
          velocities[i3 + 2] += cvz * falloff * 0.35;
        }
      }

      currentPositions[i3] += velocities[i3] * dt;
      currentPositions[i3 + 1] += velocities[i3 + 1] * dt;
      currentPositions[i3 + 2] += velocities[i3 + 2] * dt;

      const wobX =
        Math.sin(t * (WOBBLE_BASE_FREQ + sX * WOBBLE_FREQ_SPREAD) + sX * 5.0) * WOBBLE_AMP;
      const wobY =
        Math.cos(t * (WOBBLE_BASE_FREQ * 0.9 + sY * WOBBLE_FREQ_SPREAD) + sY * 5.0) *
        WOBBLE_AMP;
      const wobZ =
        Math.sin(t * (WOBBLE_BASE_FREQ * 0.8 + sZ * WOBBLE_FREQ_SPREAD) + sZ * 5.0) *
        WOBBLE_AMP *
        0.5;

      dummy.position.set(
        currentPositions[i3] + wobX,
        currentPositions[i3 + 1] + wobY,
        currentPositions[i3 + 2] + wobZ
      );
      dummy.scale.setScalar(scales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Glow toward GLOW_COLOR on velocity; decay back toward each particle's
      // OWN texture-sampled color (not a global tint).
      const vx = velocities[i3];
      const vy = velocities[i3 + 1];
      const vz = velocities[i3 + 2];
      const vmag = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const glow = Math.min(1, vmag / GLOW_VEL_REF);
      const baseR = baseColors[i3];
      const baseG = baseColors[i3 + 1];
      const baseB = baseColors[i3 + 2];
      const tR = baseR + (GLOW_COLOR.r - baseR) * glow;
      const tG = baseG + (GLOW_COLOR.g - baseG) * glow;
      const tB = baseB + (GLOW_COLOR.b - baseB) * glow;
      const upR = tR > instanceColors[i3] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      const upG = tG > instanceColors[i3 + 1] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      const upB = tB > instanceColors[i3 + 2] ? COLOR_LERP_UP : COLOR_LERP_DOWN;
      instanceColors[i3] += (tR - instanceColors[i3]) * upR;
      instanceColors[i3 + 1] += (tG - instanceColors[i3 + 1]) * upG;
      instanceColors[i3 + 2] += (tB - instanceColors[i3 + 2]) * upB;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <primitive object={cloned} />
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, PARTICLE_COUNT]}
        castShadow={false}
        receiveShadow={false}
      />
    </>
  );
}

useGLTF.preload(MODEL_PATH);

interface HeadSkullSceneProps {
  /** Show OrbitControls (for inspecting). Disable on the hero embed so page
   *  scroll passes through the canvas without wheel-zoom hijacking it. */
  enableOrbit?: boolean;
  /** Tailwind classes for the wrapping div — overrides default full-screen
   *  dark background. */
  className?: string;
  /** Hide the bottom helper text (visible on the test page, hidden on the hero). */
  showHelperText?: boolean;
}

export default function HeadSkullScene({
  enableOrbit = true,
  className = 'relative h-screen w-full bg-neutral-900',
  showHelperText = true,
}: HeadSkullSceneProps = {}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, HEAD_Y_CENTER, 2.6], fov: 32 }}
        // Cap dpr at 1.5 — on retina mobile this halves the fragment cost vs
        // dpr=2 with negligible visual difference for particle clouds.
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <ambientLight intensity={0.45} color="#cdd6e6" />
        <directionalLight position={[3, 4, 4]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#9aadc9" />
        <Environment preset="studio" />

        <ResponsiveCamera />
        <ParticleHead />

        {enableOrbit && (
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={8}
            target={[0, HEAD_Y_CENTER, 0]}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            minPolarAngle={Math.PI / 2.3}
            maxPolarAngle={Math.PI / 1.85}
          />
        )}
      </Canvas>

      {showHelperText && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm text-white/70">
          Sweep the cursor across the head — fast motion punches a hole, the skull fades in
        </div>
      )}
    </div>
  );
}
