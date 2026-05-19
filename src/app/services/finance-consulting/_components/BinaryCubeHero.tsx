'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Center, Bounds, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/binary-cube.glb';
useGLTF.preload(MODEL_URL);

// Finance page palette — matches the CSS custom properties declared
// on .finance-page in finance.css. Keep these in sync if the page
// palette ever shifts.
const PAGE_PAPER = '#f3f1e7';
const PAGE_INK = '#0a0908';
const PAGE_CHERRY = '#e63946';

// Walk every mesh in the loaded scene and recolor it based on which
// digit shape the mesh represents. The asset packs 512 cells in an
// 8×8×8 grid; each cell is one of two distinct geometries:
//   - 48-vertex   shape → the digit "1" (simple extruded shape)
//   - 976-vertex  shape → the digit "0" (curved/sculpted shape)
// The native asset randomly assigns 8 saturated colors across BOTH
// shapes, so we can't classify by material — we classify by the
// geometry's vertex count instead.
//
// The native materials are also SHARED (~65 meshes per material), so
// setting .color on one bleeds into ~64 siblings. We clone per-mesh
// to scope the color change. A flag on userData prevents a second
// recolor pass from re-cloning (useGLTF caches the scene globally,
// so this effect could re-run on a hot reload).
const ZERO_SHAPE_VERTEX_COUNT_THRESHOLD = 100; // anything above this is the "0" geometry

function recolorToPalette(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.userData.__finRecolored) return;
    mesh.userData.__finRecolored = true;

    const geom = mesh.geometry as THREE.BufferGeometry;
    const vCount = geom.attributes.position?.count ?? 0;
    const isZero = vCount > ZERO_SHAPE_VERTEX_COUNT_THRESHOLD;
    const targetColor = isZero ? PAGE_INK : PAGE_CHERRY;

    const cloneAndTint = (mat: THREE.Material): THREE.Material => {
      const cloned = mat.clone() as THREE.MeshStandardMaterial;
      if (cloned.color) cloned.color.set(targetColor);
      if (cloned.emissive) cloned.emissive.set('#000');
      cloned.needsUpdate = true;
      return cloned;
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(cloneAndTint);
    } else if (mesh.material) {
      mesh.material = cloneAndTint(mesh.material);
    }
  });
}

// Auto-rotating wrapper. Spins on its own Y axis at ~22s/revolution
// (matches the cadence of the original CSS keyframe so the hero
// rhythm is unchanged). The spin keeps running independently of the
// user-driven OrbitControls camera, so dragging picks a new viewing
// angle but the object keeps rotating beneath it — what felt right
// during a quick interaction test, and means the cube never goes
// "dead" if the user has dragged it to a weird angle.
function SpinningCube({
  pauseRef,
}: {
  pauseRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  useEffect(() => {
    recolorToPalette(scene);
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (pauseRef.current) return; // user is actively dragging
    // 22s per revolution → (2π / 22) rad/sec.
    groupRef.current.rotation.y += delta * ((Math.PI * 2) / 22);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function BinaryCubeHero() {
  // Shared flag: true while the user is grabbing the cube (mouse or
  // touch). SpinningCube checks this each frame and skips its auto-
  // rotate increment so the drag feels direct — without this the
  // visual orientation would keep drifting under the user's finger.
  const pauseRef = useRef(false);

  // Mount guard. R3F's <Canvas> renders a <canvas> on the server with
  // no WebGL state, then the client hydrator adds attributes,
  // event listeners, and DPR-scaled width/height — that delta blows
  // up hydration with a "server HTML doesn't match client" error.
  // Hero3D uses the same guard for the same reason. Deferring the
  // Canvas mount until after first client render keeps SSR output
  // and initial client output identical (both: an empty div).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [3.4, 2.4, 4.6], fov: 32, near: 0.01, far: 100 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      // touch-action: pan-y lets vertical scroll pass through the
      // canvas on mobile (so the page isn't trapped when the cube
      // fills a chunk of viewport) — only horizontal drags get sent
      // to OrbitControls as rotation gestures.
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 7, 4]} intensity={1.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Bounds fit clip observe margin={1.05}>
          <Center>
            <SpinningCube pauseRef={pauseRef} />
          </Center>
        </Bounds>
      </Suspense>
      {/* Drag-to-rotate on desktop (mouse) AND mobile (single-finger
          touch). Zoom + pan are off so neither page scroll nor pinch
          gestures get hijacked. Damping gives the spin some weight
          after release. onStart/onEnd flip pauseRef so the auto-spin
          doesn't fight the user mid-drag. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.85}
        onStart={() => {
          pauseRef.current = true;
        }}
        onEnd={() => {
          pauseRef.current = false;
        }}
      />
    </Canvas>
  );
}
