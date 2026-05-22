'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  Environment,
  Center,
  Bounds,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';

// Hero asset for /services/finance-consulting. A simple 3D "$" glyph
// (177 KB, single "Text" mesh, originally gold) recolored to the
// page's cherry-red accent and rendered with a polished metallic
// material so it reads as a coin/enamel money symbol rather than a
// flat icon. Auto-rotates Y on a slow loop; the user can grab and
// drag (mouse or single-finger touch) to spin it freely, and a
// gentle sine-wave float adds life.

const MODEL_URL = '/models/dollar-sign.glb';
useGLTF.preload(MODEL_URL);

// Finance page palette — matches the CSS custom properties declared
// on .finance-page in finance.css. Cherry red is the page's signature
// accent voice.
const CHERRY = '#e63946';

// Recolor the GLB's mesh material to cherry with a metallic polish.
// The asset ships as a single "Text" mesh with one "Gold" material
// (baseColor RGB ~ 1, 0.78, 0.32). We clone the material per mesh
// before mutating so the cached GLB stays clean and a remount
// doesn't accumulate state.
function applyCherryFinish(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.userData.__cherryFinish) return;
    mesh.userData.__cherryFinish = true;

    const apply = (mat: THREE.Material): THREE.Material => {
      const cloned = mat.clone() as THREE.MeshStandardMaterial;
      if (cloned.color) cloned.color.set(CHERRY);
      // Metallic + low roughness gives the "polished red enamel"
      // look — strong specular highlights so the studio HDR
      // environment renders crisp reflections across the curves
      // of the glyph. Roughness too low → mirror; too high → matte
      // and the dollar reads flat. 0.28 is in the "lacquer" zone.
      cloned.metalness = 0.55;
      cloned.roughness = 0.28;
      if (cloned.emissive) cloned.emissive.set('#000');
      cloned.needsUpdate = true;
      return cloned;
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(apply);
    } else if (mesh.material) {
      mesh.material = apply(mesh.material);
    }
  });
}

function SpinningDollar({
  pauseRef,
}: {
  pauseRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  useEffect(() => {
    applyCherryFinish(scene);
  }, [scene]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    // Gentle vertical float — always on, even while the user is
    // dragging. Sine wave at 0.8 rad/s, ±0.05 world units. Reads
    // as "the dollar is suspended" without being distracting.
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
    // Y-axis auto-rotation — paused while user is dragging so the
    // cursor controls the orientation directly. ~18s per revolution.
    if (pauseRef.current) return;
    groupRef.current.rotation.y += delta * ((Math.PI * 2) / 18);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function DollarSignHero() {
  // Mount guard — R3F's <Canvas> serializes to an empty <canvas>
  // element on the server but the client hydrator immediately
  // attaches WebGL state, DPR-scaled attributes, and pointer
  // listeners. That delta blows up hydration. Deferring the Canvas
  // mount until after first client render keeps SSR output and the
  // initial client output identical (both: null).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Shared flag flipped on by OrbitControls.start / off by .end.
  // SpinningDollar reads this each frame and skips auto-rotate
  // while the user is actively dragging — keeps the gesture
  // 1:1 with the camera angle.
  const pauseRef = useRef(false);

  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 35, near: 0.1, far: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      // touch-action: pan-y so vertical page scroll passes through
      // the canvas on mobile — only horizontal drags get captured
      // by OrbitControls as rotation gestures.
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
    >
      {/* Warm directional rim + soft fill so the metallic cherry
          finish reads as polished enamel rather than flat plastic. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.3} />
      <directionalLight position={[-3, 2, -3]} intensity={0.45} color="#fff4e6" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        {/* `observe` removed intentionally — it makes Bounds refit the
            camera on every canvas-size change, and on mobile the URL
            bar sliding in/out during scroll counts as a size change.
            Combined with the per-frame position.y float in
            SpinningDollar, that produced a visible up-and-down glitch
            while scrolling. The initial fit still runs once on mount,
            which is all we need because the model never changes size. */}
        <Bounds fit clip margin={1.5}>
          <Center>
            <SpinningDollar pauseRef={pauseRef} />
          </Center>
        </Bounds>
      </Suspense>
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
