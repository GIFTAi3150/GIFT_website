'use client';

/**
 * AoLiquidScene — the R3F mesh + ShaderMaterial that draws the page's ground:
 * loudsrl.com's "liquid paint" (the "Balatro" swirl), ported 1:1 in June and
 * approved as this page's hero. Now it is the whole page's plate (AoField),
 * and the scroll works it: AoField writes `liquidTargets` (zoom / spinSpeed /
 * contrast) from the hero pin and the CTA, and this scene lerps its uniforms
 * toward them every frame — chaos in the hero, calm under the sections, moving
 * again under the CTA.
 *
 * Why R3F/three and not raw WebGL: a raw-WebGL1 port rendered black on the
 * dev machine's integrated AMD (WebGL1 may clamp `highp` to mediump and the
 * iterated trig overflows). three.js renders on WebGL2 (guaranteed highp) —
 * the way loudsrl runs the identical shader on the same GPUs.
 *
 * The mesh is a clip-filling plane (camera fov:1 at z=1 makes the 2×2 plane
 * overfill the frustum) and the fragment samples gl_FragCoord / iResolution.
 */

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { liquidTargets } from './fieldBus';

/* ---- shaders: byte-for-byte from loudsrl's bundle ---- */
const VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

const FRAGMENT_SHADER = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec2 iResolution;
    uniform float u_zoom;
    uniform vec2 u_offset;

    uniform float spinRotation;
    uniform float spinSpeed;
    uniform vec4 colour1;
    uniform vec4 colour2;
    uniform vec4 colour3;
    uniform float contrast;
    uniform float lighting;
    uniform float spinAmount;
    uniform float pixelFilter;
    uniform float grainStrength;
    uniform float useGrain;
    uniform int effectDepth;

    varying vec2 vUv;

    float random(in vec2 st) {
      return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec4 effect(vec2 screenSize, vec2 screen_coords) {
      vec2 center = 0.5 * screenSize;
      float base_pixel = length(screenSize) / pixelFilter;
      float pixel_size = base_pixel / u_zoom;
      vec2 grid_uv = floor((screen_coords - center) / base_pixel) * base_pixel + center;

      vec2 uv0 = (grid_uv - center) / screenSize.y;
      uv0 /= u_zoom;
      uv0 += u_offset;

      float uv_len = length(uv0);
      float timeOffset = iTime;
      float speed = spinRotation * 0.2;
      speed = timeOffset * speed;
      speed += 302.2;
      float angle = atan(uv0.y, uv0.x) + speed - 20.0 * (spinAmount * uv_len + (1.0 - spinAmount));

      vec2 mid = 0.5 * (screenSize / length(screenSize));
      vec2 uv = vec2(
        uv_len * cos(angle) + mid.x,
        uv_len * sin(angle) + mid.y
      ) - mid;

      uv *= 20.0;

      speed = timeOffset * spinSpeed;
      vec2 uv2 = vec2(uv.x + uv.y);
      for(int i = 0; i < 20; i++) {
        if(i >= effectDepth) break;
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
          cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
          sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(0.711 * uv.x - uv.y);
      }

      float contrast_mod = (0.25 * contrast + 0.5 * spinAmount + 1.2);
      float paint_res = clamp(length(uv) * 0.035 * contrast_mod, 0.0, 2.0);
      float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
      float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
      float c3p = 1.0 - min(1.0, c1p + c2p);
      float light = (lighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
                  + lighting * max(c2p * 5.0 - 4.0, 0.0);

      vec4 baseColor = (0.3 / contrast) * colour1
                     + (1.0 - 0.3 / contrast) * (
                         colour1 * c1p
                       + colour2 * c2p
                       + vec4(colour3.rgb * c3p, colour1.a * c3p)
                       ) + light;

      float grain_noise = random(gl_FragCoord.xy + timeOffset);
      baseColor.rgb += (useGrain > 0.5 ? grainStrength : 0.0) * (grain_noise - 0.5);

      return baseColor;
    }

    void main() {
      gl_FragColor = effect(iResolution.xy, gl_FragCoord.xy);
    }
  `;

/**
 * The approved look (2026-09-04 palette pass): near-black navy base, the page's
 * royal indigo, bright periwinkle. Raw sRGB hex → vec4 0..1; three does NOT
 * linearise plain vec4 uniforms and a ShaderMaterial's gl_FragColor is not
 * re-encoded, so what is authored here is what displays.
 */
const PRESET = {
  spinRotation: 0,
  spinAmount: 0.25,
  colour1: '#0B1020',
  colour2: '#4F6AF0',
  colour3: '#BFCCFA',
  lighting: 0.42,
  pixelFilter: 1e4,
  grainStrength: 0.2,
  useGrain: false,
  effectDepth: 10,
};

/** Frame-rate-independent lerp factor: `k` per 60 Hz frame, whatever the rate. */
const rate = (k: number, dt: number) => 1 - Math.pow(1 - k, dt * 60);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hexVec4(hex: string): THREE.Vector4 {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return new THREE.Vector4(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1);
}

type Props = {
  /** True for the first ~2 s after mount — speeds the zoom-in settle, exactly
   *  like loudsrl's `isInit` (their 2000 ms setTimeout). */
  isInit?: boolean;
  /** Fired after the first few stable frames (lets the page reveal). */
  onReady?: () => void;
};

export default function AoLiquidScene({ isInit = true, onReady }: Props) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(1, 1) },
          u_zoom: { value: 100 },
          u_offset: { value: new THREE.Vector2(0, 0) },
          spinRotation: { value: PRESET.spinRotation },
          spinSpeed: { value: liquidTargets.spinSpeed },
          colour1: { value: hexVec4(PRESET.colour1) },
          colour2: { value: hexVec4(PRESET.colour2) },
          colour3: { value: hexVec4(PRESET.colour3) },
          contrast: { value: liquidTargets.contrast },
          lighting: { value: PRESET.lighting },
          spinAmount: { value: PRESET.spinAmount },
          pixelFilter: { value: PRESET.pixelFilter },
          grainStrength: { value: PRESET.grainStrength },
          useGrain: { value: PRESET.useGrain },
          effectDepth: { value: PRESET.effectDepth },
        },
      }),
    [],
  );

  // Live zoom. loudsrl seeds this at 100 (very magnified / near-flat) and lerps
  // it down to the rest zoom — the calm "pull-in" entry. Fast while isInit,
  // slow after, so the scroll-driven target changes read as a drift, not a cut.
  const zoomRef = useRef(100);
  const startRef = useRef<number | null>(null);
  const readyFired = useRef(false);
  const frameCount = useRef(0);

  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  useEffect(() => {
    (material.uniforms.iResolution.value as THREE.Vector2).set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
    );
  }, [size, viewport, material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    if (startRef.current === null) startRef.current = state.clock.getElapsedTime();
    const t = state.clock.getElapsedTime() - startRef.current;
    const dt = Math.min(delta, 0.1);

    u.iTime.value = t;
    (u.iResolution.value as THREE.Vector2).set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );

    zoomRef.current = lerp(zoomRef.current, liquidTargets.zoom, rate(isInit ? 0.2 : 0.05, dt));
    u.u_zoom.value = zoomRef.current;
    u.spinSpeed.value = lerp(u.spinSpeed.value, liquidTargets.spinSpeed, rate(0.08, dt));
    u.contrast.value = lerp(u.contrast.value, liquidTargets.contrast, rate(0.08, dt));

    frameCount.current += 1;
    if (!readyFired.current && frameCount.current >= 3) {
      readyFired.current = true;
      onReady?.();
    }
  });

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
