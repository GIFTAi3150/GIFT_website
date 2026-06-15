'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';

const GLB   = '/gift-atom-icon.glb';
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

// ── Ring base speeds (rad/s) ──────────────────────────────────────────────────
const SPEED_A = 0.50;
const SPEED_B = 0.38;
const SPEED_C = 0.44;
const SPEED_Y = 0.07;

// ── Physics constants ─────────────────────────────────────────────────────────
const DISP_SPRING = 3.5;
const DISP_DAMP   = 3.8; // ≈ 2·√3.5 → slightly overdamped, no oscillation
const RESTITUTION = 0.82;

// ── Orbital position functions ────────────────────────────────────────────────
// Radii are set to ~2.8-3.1 so spheres orbit clearly OUTSIDE all three ring
// tubes (ring major radii are ~1.9-2.2; this gives ≥0.55 unit clearance).
const orbitBlue = (t: number, out: THREE.Vector3): void => {
  const a = 0.785 + t * 0.40;
  out.set(2.9 * Math.cos(a), 0.29 * Math.sin(t * 0.65 + 0.2), 2.9 * Math.sin(a));
};
const orbitPink = (t: number, out: THREE.Vector3): void => {
  const a = 4.55 + t * 0.55;
  out.set(2.8 * Math.cos(a), 2.8 * Math.sin(a), 0.16 * Math.sin(t * 1.2 + 0.5));
};
const orbitOrange2 = (t: number, out: THREE.Vector3): void => {
  const a = 3.86 - t * 0.45;
  out.set(0.27 * Math.sin(t * 0.95 + 1.0), 2.9 * Math.cos(a), 2.9 * Math.sin(a));
};
const orbitOrange1 = (t: number, out: THREE.Vector3): void => {
  const a = 3.30 + t * 0.28;
  const sinT = 0.643, cosT = 0.766;
  const bob  = 0.19 * Math.sin(t * 0.8 + 0.3);
  out.set(2.9 * Math.cos(a), -2.9 * Math.sin(a) * sinT + bob * cosT, 2.9 * Math.sin(a) * cosT);
};
const orbitAccent = (t: number, out: THREE.Vector3): void => {
  const a = 1.22 + t * 0.18;
  const cosφ = 0.766, sinφ = 0.643;
  out.set(
    3.1 * Math.cos(a) * cosφ,
    3.1 * Math.cos(a) * sinφ,
    3.1 * Math.sin(a) + 0.33 * Math.sin(t * 0.5 + 2.5),
  );
};

// ── Physics body ──────────────────────────────────────────────────────────────
type PhysBody = {
  disp:      THREE.Vector3;
  dispVel:   THREE.Vector3;
  prevOrb:   THREE.Vector3;
  curOrb:    THREE.Vector3;
  curOrbVel: THREE.Vector3;
  orbitFn:   (t: number, out: THREE.Vector3) => void;
  radius:    number;
  mass:      number;
};

const SPHERE_DEFS = [
  { key: 'blue',    orbitFn: orbitBlue,    radius: 0.30, mass: 1.0 },
  { key: 'pink',    orbitFn: orbitPink,    radius: 0.26, mass: 0.8 },
  { key: 'orange1', orbitFn: orbitOrange1, radius: 0.34, mass: 1.2 },
  { key: 'orange2', orbitFn: orbitOrange2, radius: 0.28, mass: 0.9 },
  { key: 'accent',  orbitFn: orbitAccent,  radius: 0.28, mass: 0.9 },
] as const;

type SphereKey = (typeof SPHERE_DEFS)[number]['key'];

// ── Scene ─────────────────────────────────────────────────────────────────────
function AtomScene({ mobile }: { mobile: boolean }) {
  const { nodes, scene } = useGLTF(GLB, DRACO);
  const { camera, size } = useThree();

  const groupRef  = useRef<THREE.Group>(null);
  const ringA     = useRef<THREE.Object3D | null>(null);
  const ringB     = useRef<THREE.Object3D | null>(null);
  const ringC     = useRef<THREE.Object3D | null>(null);
  const sBlue     = useRef<THREE.Object3D | null>(null);
  const sOrange1  = useRef<THREE.Object3D | null>(null);
  const sOrange2  = useRef<THREE.Object3D | null>(null);
  const sPink     = useRef<THREE.Object3D | null>(null);
  const sAccent   = useRef<THREE.Object3D | null>(null);
  const accentLight = useRef<THREE.PointLight>(null);

  // ── Physics state ─────────────────────────────────────────────────────────
  const physRef    = useRef<Map<SphereKey, PhysBody>>(new Map());
  const physInited = useRef(false);

  // Scratch vectors — zero per-frame allocations
  const _n    = useRef(new THREE.Vector3());
  const _rv   = useRef(new THREE.Vector3());
  const _tmp  = useRef(new THREE.Vector3());

  useEffect(() => {
    ringA.current    = (nodes['Ring_A']         as THREE.Object3D) ?? null;
    ringB.current    = (nodes['Ring_B']         as THREE.Object3D) ?? null;
    ringC.current    = (nodes['Ring_C']         as THREE.Object3D) ?? null;
    sBlue.current    = (nodes['Sphere_Blue']    as THREE.Object3D) ?? null;
    sOrange1.current = (nodes['Sphere_Orange1'] as THREE.Object3D) ?? null;
    sOrange2.current = (nodes['Sphere_Orange2'] as THREE.Object3D) ?? null;
    sPink.current    = (nodes['Sphere_Pink']    as THREE.Object3D) ?? null;
    sAccent.current  = (nodes['Sphere_Accent']  as THREE.Object3D) ?? null;
    physInited.current = false;
    physRef.current.clear();
  }, [nodes]);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = mobile ? 50 : 54;
    camera.position.set(0, 0.5, mobile ? 6.0 : 5.2);
    camera.updateProjectionMatrix();
  }, [camera, mobile, size.width]);

  useFrame((state, delta) => {
    const t  = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // ── 1. First-frame init ───────────────────────────────────────────────
    if (!physInited.current) {
      const tPrev = t - dt;
      SPHERE_DEFS.forEach(({ key, orbitFn, radius, mass }) => {
        const curOrb  = new THREE.Vector3();
        const prevOrb = new THREE.Vector3();
        orbitFn(t,     curOrb);
        orbitFn(tPrev, prevOrb);
        physRef.current.set(key, {
          disp:      new THREE.Vector3(),
          dispVel:   new THREE.Vector3(),
          prevOrb,
          curOrb,
          curOrbVel: new THREE.Vector3(),
          orbitFn,
          radius,
          mass,
        });
      });
      physInited.current = true;
    }

    const bodies = physRef.current;

    // ── 2. Update orbital positions + displacement spring ─────────────────
    bodies.forEach((body) => {
      body.orbitFn(t, body.curOrb);
      body.curOrbVel.copy(body.curOrb).sub(body.prevOrb).divideScalar(dt);
      body.prevOrb.copy(body.curOrb);

      _tmp.current
        .copy(body.disp).multiplyScalar(-DISP_SPRING)
        .addScaledVector(body.dispVel, -DISP_DAMP);
      body.dispVel.addScaledVector(_tmp.current, dt);
      body.disp.addScaledVector(body.dispVel, dt);
    });

    // ── 3. Sphere–sphere elastic collision ────────────────────────────────
    const bodyArr = [...bodies.entries()];
    for (let i = 0; i < bodyArr.length; i++) {
      for (let j = i + 1; j < bodyArr.length; j++) {
        const [, a] = bodyArr[i];
        const [, b] = bodyArr[j];

        const posA = _tmp.current.copy(a.curOrb).add(a.disp);
        _n.current.copy(b.curOrb).add(b.disp).sub(posA);
        const dist    = _n.current.length();
        const minDist = a.radius + b.radius;
        if (dist >= minDist || dist < 0.001) continue;

        _n.current.divideScalar(dist);

        _rv.current
          .copy(a.curOrbVel).add(a.dispVel)
          .sub(_tmp.current.copy(b.curOrbVel).add(b.dispVel));
        const vn = _rv.current.dot(_n.current);

        if (vn > 0) {
          const impulse = -(1 + RESTITUTION) * vn / (1 / a.mass + 1 / b.mass);
          a.dispVel.addScaledVector(_n.current,  impulse / a.mass);
          b.dispVel.addScaledVector(_n.current, -impulse / b.mass);
        }

        const overlap   = minDist - dist;
        const totalMass = a.mass + b.mass;
        a.disp.addScaledVector(_n.current, -overlap * (b.mass / totalMass));
        b.disp.addScaledVector(_n.current,  overlap * (a.mass / totalMass));
      }
    }

    // ── 4. Apply positions to Three.js nodes ──────────────────────────────
    const sw = (amp: number, freq: number, off: number) =>
      amp * Math.sin(t * freq + off);

    const applyBody = (node: THREE.Object3D | null, key: SphereKey) => {
      const b = bodies.get(key);
      if (!node || !b) return;
      node.position.copy(b.curOrb).add(b.disp);
    };

    applyBody(sBlue.current,    'blue');
    applyBody(sPink.current,    'pink');
    applyBody(sOrange2.current, 'orange2');
    applyBody(sOrange1.current, 'orange1');
    applyBody(sAccent.current,  'accent');

    if (sBlue.current)    sBlue.current.scale.setScalar   (1 + sw(0.05, 1.1, 0.0));
    if (sPink.current)    sPink.current.scale.setScalar    (1 + sw(0.07, 1.5, 1.0));
    if (sOrange2.current) sOrange2.current.scale.setScalar (1 + sw(0.04, 1.3, 2.0));
    if (sOrange1.current) sOrange1.current.scale.setScalar (1 + sw(0.06, 0.9, 1.5));
    if (sAccent.current) {
      sAccent.current.scale.setScalar(1 + sw(0.09, 0.7, 0.8));
      const bAcc = bodies.get('accent');
      if (bAcc && !mobile) {
        accentLight.current?.position.copy(bAcc.curOrb).add(bAcc.disp);
      }
    }

    // ── 5. Ring rotation ──────────────────────────────────────────────────
    if (ringA.current) ringA.current.rotation.z += delta * SPEED_A * (1 + 0.12 * Math.sin(t * 0.31));
    if (ringB.current) ringB.current.rotation.x += delta * SPEED_B * (1 + 0.10 * Math.sin(t * 0.24 + 1.0));
    if (ringC.current) ringC.current.rotation.y += delta * SPEED_C * (1 + 0.09 * Math.sin(t * 0.19 + 2.1));

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * SPEED_Y;
      groupRef.current.rotation.x = 0.05 * Math.sin(t * 0.14);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {!mobile && (
        <pointLight ref={accentLight} color="#7dd3fc" intensity={0.55} distance={5.5} decay={2} />
      )}
    </group>
  );
}

useGLTF.preload(GLB, DRACO);

export default function AtomViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 900;

  return (
    <div ref={containerRef} className="atom-viewer" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.5, 5.2], fov: 54 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        frameloop={reduced ? 'never' : 'always'}
        shadows={false}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]}   intensity={2.5} />
        <directionalLight position={[-4, -2, -4]} intensity={0.8} color="#c4b5fd" />
        <pointLight       position={[0, 0, 4]}    intensity={0.5} />

        <Suspense fallback={null}>
          <AtomScene mobile={isMobile} />
          <AdaptiveDpr pixelated />
        </Suspense>
      </Canvas>
    </div>
  );
}
