'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

// ---- Config -----------------------------------------------------------
const IGLOO_PATH = '/models/igloo.glb';
const ICE_COLOR = '#DCE8F0';
const RIM_COLOR = '#E8F4FF';

// How far each brick rises when the cursor is over the igloo. Subtle —
// the dome should ripple, not bloom. Per-frame lerp factor below
// controls how fast it settles in/out.
const HOVER_LIFT = 0.1;
const LIFT_LERP = 0.18;

// Seconds the bricks fly free before they start tweening back. Matches
// the user's spec (4s post-explosion).
const RESET_DELAY = 4;
// Seconds the return-tween takes once it begins.
const RESET_TWEEN = 1.1;
// Multiplier on the outward impulse direction.
const KICK_IMPULSE = 2.2;
const KICK_UP_BIAS = 1.4;
// Random torque so bricks tumble as they fly.
const KICK_TORQUE = 0.35;

// Score popup lifetime.
const POPUP_LIFETIME = 1.2;
const POPUP_FLOAT_PX = 80;

// ---- Material builder -------------------------------------------------
// MeshPhysicalMaterial tuned for a frosted-ice look, plus an onBeforeCompile
// injection that adds a fresnel rim glow on the silhouette edges. Same
// material is reused across every igloo mesh (cheaper, looks consistent).
function buildIceMaterial(): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: ICE_COLOR,
    roughness: 0.6,
    metalness: 0,
    transmission: 0.15,
    thickness: 0.5,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.2,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: new THREE.Color(RIM_COLOR) };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform vec3 uRimColor;
      `
    );
    // Fresnel rim glow injected after the emissivemap step: brighter at
    // glancing angles, faded toward the center of each surface. Pow
    // tightens the rim band into a thin edge highlight.
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      vec3 vDirView = normalize(vViewPosition);
      float fresnel = 1.0 - max(dot(vDirView, normal), 0.0);
      fresnel = pow(fresnel, 2.5);
      totalEmissiveRadiance += uRimColor * fresnel * 0.75;
      `
    );
  };
  return mat;
}

// ---- Types ------------------------------------------------------------
type Brick = {
  name: string;
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
};

type Popup = {
  id: number;
  position: [number, number, number];
  value: number;
  startTime: number;
};

// ---- Single brick (rigid body) ---------------------------------------
// Wraps a cloned mesh in a Rapier RigidBody. Starts dynamic-and-asleep
// at its original world transform. Parent triggers an explosion via the
// `explodeSeq` counter; this component compares to the last seq seen
// and fires an impulse on change. After RESET_DELAY, schedules a tween
// back to the rest transform (switches body to kinematicPosition for
// the tween, then back to dynamic+asleep when done).
function BrickRB({
  brick,
  material,
  center,
  explodeSeq,
  isHovered,
}: {
  brick: Brick;
  material: THREE.Material;
  center: THREE.Vector3;
  explodeSeq: number;
  isHovered: boolean;
}) {
  const rbRef = useRef<RapierRigidBody>(null);
  const lastSeqRef = useRef(0);
  // Brick state machine. 'idle' = kinematic at rest, drive position via
  // setNextKinematicTranslation each frame (cheap; required for hover
  // lift to feel smooth). 'exploded' = dynamic, rapier owns it.
  // 'returning' = kinematic, tween back to rest.
  const stateRef = useRef<'idle' | 'exploded' | 'returning'>('idle');
  const liftRef = useRef(0);
  const tweenRef = useRef<{
    active: boolean;
    startT: number;
    fromPos: THREE.Vector3;
    fromQuat: THREE.Quaternion;
  } | null>(null);

  // React to a new explosion sequence: flip to dynamic, apply impulse +
  // torque, schedule the return tween. The hover lift is suppressed
  // automatically because the per-frame loop only lerps in 'idle' state.
  useEffect(() => {
    if (explodeSeq === lastSeqRef.current) return;
    lastSeqRef.current = explodeSeq;
    const rb = rbRef.current;
    if (!rb) return;

    stateRef.current = 'exploded';
    liftRef.current = 0;
    rb.setBodyType(0 /* RigidBodyType.Dynamic */, true);
    rb.wakeUp();

    // Impulse direction: from centroid → brick's current world position
    // (slight upward bias so bricks pop UP and out). Random torque adds
    // tumble. Both vary per-brick so the explosion looks organic.
    const t = rb.translation();
    const dir = new THREE.Vector3(t.x - center.x, t.y - center.y, t.z - center.z);
    if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
    dir.normalize();
    const force = KICK_IMPULSE * (0.8 + Math.random() * 0.6);
    rb.applyImpulse(
      { x: dir.x * force, y: dir.y * force + KICK_UP_BIAS, z: dir.z * force },
      true
    );
    rb.applyTorqueImpulse(
      {
        x: (Math.random() - 0.5) * KICK_TORQUE,
        y: (Math.random() - 0.5) * KICK_TORQUE,
        z: (Math.random() - 0.5) * KICK_TORQUE,
      },
      true
    );

    // Schedule the return-tween start.
    const id = window.setTimeout(() => {
      const rb2 = rbRef.current;
      if (!rb2) return;
      const ct = rb2.translation();
      const cr = rb2.rotation();
      tweenRef.current = {
        active: true,
        startT: performance.now() / 1000,
        fromPos: new THREE.Vector3(ct.x, ct.y, ct.z),
        fromQuat: new THREE.Quaternion(cr.x, cr.y, cr.z, cr.w),
      };
      rb2.setBodyType(2 /* KinematicPositionBased */, true);
      stateRef.current = 'returning';
    }, RESET_DELAY * 1000);
    return () => window.clearTimeout(id);
  }, [explodeSeq, center]);

  useFrame(() => {
    const rb = rbRef.current;
    if (!rb) return;

    if (stateRef.current === 'returning') {
      const tw = tweenRef.current;
      if (!tw || !tw.active) return;
      const now = performance.now() / 1000;
      const t = Math.min(1, (now - tw.startT) / RESET_TWEEN);
      const e = t * t * (3 - 2 * t);
      rb.setNextKinematicTranslation({
        x: tw.fromPos.x + (brick.position.x - tw.fromPos.x) * e,
        y: tw.fromPos.y + (brick.position.y - tw.fromPos.y) * e,
        z: tw.fromPos.z + (brick.position.z - tw.fromPos.z) * e,
      });
      const q = tw.fromQuat.clone().slerp(brick.quaternion, e);
      rb.setNextKinematicRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
      if (t >= 1) {
        tw.active = false;
        // Drop back to idle — keep as kinematicPosition so the hover
        // lerp below keeps driving it (vs sleeping a dynamic body and
        // losing immediate hover response).
        stateRef.current = 'idle';
        liftRef.current = 0;
      }
      return;
    }

    if (stateRef.current === 'idle') {
      // Lerp the lift toward the hover target so the brick rises smoothly
      // when the pointer enters and settles back when it leaves.
      const target = isHovered ? HOVER_LIFT : 0;
      liftRef.current += (target - liftRef.current) * LIFT_LERP;
      rb.setNextKinematicTranslation({
        x: brick.position.x,
        y: brick.position.y + liftRef.current,
        z: brick.position.z,
      });
      rb.setNextKinematicRotation({
        x: brick.quaternion.x,
        y: brick.quaternion.y,
        z: brick.quaternion.z,
        w: brick.quaternion.w,
      });
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      colliders="hull"
      // Start kinematic. We drive position/rotation each frame for the
      // hover lift; the explosion switches the body to dynamic so rapier
      // can simulate the tumble + gravity, then we switch back.
      type="kinematicPosition"
      position={brick.position.toArray()}
      quaternion={[brick.quaternion.x, brick.quaternion.y, brick.quaternion.z, brick.quaternion.w]}
      linearDamping={0.25}
      angularDamping={0.25}
    >
      <mesh
        geometry={brick.geometry}
        material={material}
        scale={brick.scale.toArray() as [number, number, number]}
      />
    </RigidBody>
  );
}

// ---- Score popup -----------------------------------------------------
// Float-up + fade-out HTML overlay anchored to a world position. CSS
// transition handles the animation; component just renders for its
// lifetime and unmounts when expired.
function ScorePopup({ popup }: { popup: Popup }) {
  const [translated, setTranslated] = useState(false);

  // Apply the float-up + fade transition one tick after mount so the
  // CSS transition sees the initial → final state change.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setTranslated(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <Html position={popup.position} center style={{ pointerEvents: 'none' }}>
      <div
        className="font-display font-extrabold text-2xl text-white"
        style={{
          textShadow: '0 0 10px rgba(103,232,249,0.85), 0 0 22px rgba(103,232,249,0.55)',
          transform: translated ? `translateY(-${POPUP_FLOAT_PX}px)` : 'translateY(0px)',
          opacity: translated ? 0 : 1,
          transition: `transform ${POPUP_LIFETIME}s cubic-bezier(0.22,1,0.36,1), opacity ${POPUP_LIFETIME}s ease-out`,
          willChange: 'transform, opacity',
        }}
      >
        +{popup.value}
      </div>
    </Html>
  );
}

// ---- Main component --------------------------------------------------
export default function IglooModel({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(IGLOO_PATH);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [explodeSeq, setExplodeSeq] = useState(0);
  const [isHovered, setHovered] = useState(false);
  const popupIdRef = useRef(0);
  const lastClickRef = useRef(0);

  // Parse the loaded scene once: build the shared ice material, walk
  // every mesh, sort into fixed-vs-brick by name. For bricks we capture
  // their world transform + clone the geometry, then mark them invisible
  // in the source scene so we can render them under RigidBody control.
  const { sceneRoot, bricks, sharedMaterial, center } = useMemo(() => {
    const sharedMaterial = buildIceMaterial();
    const bricks: Brick[] = [];
    // Make sure world matrices reflect the loaded hierarchy before we
    // read world transforms below.
    scene.updateMatrixWorld(true);

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = sharedMaterial;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      if (/^(Sphere|Cylinder)\.\d+$/.test(mesh.name)) {
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        mesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);
        bricks.push({
          name: mesh.name,
          geometry: mesh.geometry,
          position: worldPos,
          quaternion: worldQuat,
          scale: worldScale,
        });
        // Hide the original — we'll render the clone via RigidBody so
        // rapier owns its transform without fighting the GLB hierarchy.
        mesh.visible = false;
      }
    });

    // Center = mean of all brick positions. Cheap proxy for the dome
    // centroid; used to compute outward-impulse direction.
    const center = new THREE.Vector3();
    if (bricks.length) {
      bricks.forEach((b) => center.add(b.position));
      center.multiplyScalar(1 / bricks.length);
    }
    return { sceneRoot: scene, bricks, sharedMaterial, center };
  }, [scene]);

  // (Auto-rotation removed — the group has a static 3/4 rotation set on
  // the JSX below. Idle motion now comes from the per-brick hover lift.)

  // Garbage-collect expired popups so the array doesn't grow unbounded.
  useEffect(() => {
    if (!popups.length) return;
    const id = window.setInterval(() => {
      const now = performance.now() / 1000;
      setPopups((ps) => ps.filter((p) => now - p.startTime < POPUP_LIFETIME + 0.1));
    }, 300);
    return () => window.clearInterval(id);
  }, [popups.length]);

  const handleClick = (e: { stopPropagation: () => void }) => {
    // Debounce: ignore clicks while bricks are still flying / returning.
    const now = performance.now() / 1000;
    if (now - lastClickRef.current < RESET_DELAY + RESET_TWEEN) return;
    lastClickRef.current = now;

    e.stopPropagation();
    // Bump the seq counter — BrickRB instances watch this and explode.
    setExplodeSeq((s) => s + 1);

    // Spawn one popup per brick at its current world position. Random
    // value 30-99, "+" prefix, white text with cyan shadow glow.
    const newPopups: Popup[] = bricks.map((b) => ({
      id: ++popupIdRef.current,
      // Add the group's world translation since brick positions are in
      // its local space.
      position: [b.position.x, b.position.y, b.position.z],
      value: 30 + Math.floor(Math.random() * 70),
      startTime: now,
    }));
    setPopups((ps) => [...ps, ...newPopups]);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        // stopPropagation prevents the event bubbling to the canvas and
        // re-triggering for nested meshes. We only want one "enter" per
        // hover so setHovered is idempotent and cheap.
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <Physics gravity={[0, -9.81, 0]}>
        {/* Visible dome + tunnel come from the GLTF scene — bricks were
            marked invisible during parsing so they don't double-render. */}
        <primitive object={sceneRoot} />
        {bricks.map((brick) => (
          <BrickRB
            key={brick.name}
            brick={brick}
            material={sharedMaterial}
            center={center}
            explodeSeq={explodeSeq}
            isHovered={isHovered}
          />
        ))}
      </Physics>
      {popups.map((p) => (
        <ScorePopup key={p.id} popup={p} />
      ))}
    </group>
  );
}

// Tell drei to start fetching the GLB before the component mounts —
// shaves the first-frame wait when the user lands on the page.
useGLTF.preload(IGLOO_PATH);
