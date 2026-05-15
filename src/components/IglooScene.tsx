'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import IglooModel from './IglooModel';

// Standalone Canvas wrapper for the igloo. Lives next to the particle
// logo in the DX hero. Camera framing + lighting are tuned specifically
// for the igloo's scale (the GLB-rendered model is roughly unit-sized);
// adjust IglooModel's `scale` prop if the GLB itself is wildly off.
export default function IglooScene() {
  return (
    <div className="igloo-scene absolute inset-0">
      <Canvas
        // 3/4 view: camera offset to the right + slightly above the
        // igloo, looking at the centroid. Done at the camera (not the
        // group) because rotating the group would desync rapier's
        // world-space physics from the rendered transform.
        // 3/4 view roughly matching the Blender reference: pulled to
        // the right + elevated so the dome top is visible and the
        // tunnel is offset on the right side of the frame.
        camera={{ position: [2.9, 1.9, 3.8], fov: 36, near: 0.1, far: 50 }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Three-point lighting tuned for frosted ice. Rim light from
            BEHIND the igloo (negative Z) is the key piece — it lights
            the silhouette of every brick edge so the fragments visibly
            pop forward when they explode. */}
        <ambientLight intensity={0.55} color="#dde7f5" />
        <directionalLight position={[3, 4, 4]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#9aadc9" />
        <directionalLight position={[0, 2, -4]} intensity={1.0} color="#e8f4ff" />

        <IglooModel position={[0, -0.3, 0]} scale={1} />
      </Canvas>
    </div>
  );
}
