'use client';

// VAT playback — Phase 3 of the DX hero bake pipeline (Plans.md T-010).
//
// Renders the baked particle cloud for one shape by reconstructing positions
// in a vertex shader (pos = basePose + delta×scale) from the compressed VAT.
// There is NO GPGPU solver here — just one texture sample per particle per
// frame — so it runs on every device including phones (the whole point of the
// bake). Plays the frames ping-pong (0→N-1→0) so the stochastic shimmer loops
// with no visible seam.
//
// Structure: the outer component lives in page DOM and loads the asset, then
// renders a drei <View> that portals the scene INTO the shared RootCanvas.
// The animated scene (useFrame) must live INSIDE the View so R3F hooks run
// within the Canvas context.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { loadVat, type VatData } from './loadVat';

export type VatShape = 'head' | 'logo' | 'pet';

const VERT = /* glsl */ `
  uniform sampler2D uDelta;
  uniform vec3 uScale;
  uniform float uFrameA;       // current frame (integer)
  uniform float uFrameB;       // next frame (integer, wraps)
  uniform float uMix;          // 0..1 blend between A and B
  uniform float uGridCols;
  uniform vec2 uTile;          // (texW, texH)
  uniform vec2 uDeltaTexSize;  // (width, height)
  uniform float uPointSize;
  attribute vec2 aTexel;
  varying float vGlow;

  // Locate a frame's tile in the packed delta atlas, then this particle's
  // texel inside it. NearestFilter → exact lookup. Returns the decoded delta.
  vec3 sampleDelta(float frame) {
    float col = mod(frame, uGridCols);
    float row = floor(frame / uGridCols);
    vec2 tileOrigin = vec2(col * uTile.x, row * uTile.y);
    vec2 uv = (tileOrigin + aTexel) / uDeltaTexSize;
    vec3 enc = texture2D(uDelta, uv).rgb;
    return ((enc * 255.0) - 128.0) / 127.0 * uScale;
  }

  void main() {
    // Interpolate between the two captured frames → continuous motion instead
    // of a 30fps snap. Forward-only loop (B wraps to 0) → never reverses.
    vec3 delta = mix(sampleDelta(uFrameA), sampleDelta(uFrameB), uMix);

    // 'position' is the float16 mean pose baked as the geometry's positions.
    vec3 pos = position + delta;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Perspective-attenuated point size (pixels). -mv.z ≈ 4 at the camera, so
    // uPointSize ≈ final pixel size at the cloud's center.
    gl_PointSize = uPointSize * (4.0 / -mv.z);

    float mag = max(max(uScale.x, uScale.y), uScale.z);
    vGlow = clamp(length(delta) / max(mag, 1e-4), 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying float vGlow;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, r);
    // Brand indigo bead on the light DX background; brightens with motion.
    vec3 cool = vec3(0.388, 0.357, 1.0);   // #635bff
    vec3 hot  = vec3(0.62, 0.64, 1.0);
    gl_FragColor = vec4(mix(cool, hot, vGlow), alpha);
  }
`;

function VatScene({ data }: { data: VatData }) {
  const pointsRef = useRef<THREE.Points>(null);
  const tRef = useRef(0);

  // Build geometry + material once per loaded shape.
  const points = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // mean pose IS the geometry's position attribute → `position` in the shader
    geom.setAttribute('position', new THREE.BufferAttribute(data.aBase, 3));
    geom.setAttribute('aTexel', new THREE.BufferAttribute(data.aTexel, 2));

    const width = data.gridCols * data.texW;
    const height = data.gridRows * data.texH;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uDelta: { value: data.deltaTex },
        uScale: { value: new THREE.Vector3(...data.scale) },
        uFrameA: { value: 0 },
        uFrameB: { value: 1 },
        uMix: { value: 0 },
        uGridCols: { value: data.gridCols },
        uTile: { value: new THREE.Vector2(data.texW, data.texH) },
        uDeltaTexSize: { value: new THREE.Vector2(width, height) },
        uPointSize: { value: 3.5 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      // Opaque round beads that WRITE depth → correct front/back occlusion as
      // the cloud spins, with no blend-order sparkle. The fragment shader
      // discards outside the circle, so points stay round. (Transparent +
      // depthWrite:false was causing the rotating cloud to flicker because
      // overlapping particles blended in fixed geometry order, not depth order.)
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });

    const pts = new THREE.Points(geom, mat);
    pts.scale.setScalar(0.7); // match GiftLogoFluid framing
    pts.frustumCulled = false;
    return pts;
  }, [data]);

  // Dispose GPU resources when the shape changes / unmounts.
  useEffect(() => {
    return () => {
      points.geometry.dispose();
      (points.material as THREE.ShaderMaterial).dispose();
      data.deltaTex.dispose();
    };
  }, [points, data]);

  useFrame((state, dt) => {
    const mat = points.material as THREE.ShaderMaterial;
    // Forward-only loop at 30fps with sub-frame interpolation. The fractional
    // playhead drives uMix so motion is continuous, and frame B wraps to 0 so
    // it loops forward without the ping-pong reversal that felt like a stop.
    tRef.current += Math.min(dt, 1 / 15);
    const playhead = tRef.current * 30;
    const fA = Math.floor(playhead) % data.frames;
    mat.uniforms.uFrameA.value = fA;
    mat.uniforms.uFrameB.value = (fA + 1) % data.frames;
    mat.uniforms.uMix.value = playhead - Math.floor(playhead);
    // Slow Y spin to match the live hero.
    points.rotation.y = state.clock.getElapsedTime() * 0.6;
  });

  return <primitive object={points} />;
}

export default function VatParticles({ shape = 'logo' }: { shape?: VatShape }) {
  const [data, setData] = useState<VatData | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    loadVat(`/vat/dx-hero-${shape}.vat.bin`)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[vat] load failed:', err);
      });
    return () => {
      alive = false;
    };
  }, [shape]);

  return (
    <View style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={38} near={0.1} far={50} />
      {data && <VatScene data={data} />}
    </View>
  );
}
