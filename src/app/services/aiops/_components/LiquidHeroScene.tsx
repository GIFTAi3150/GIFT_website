'use client';

/**
 * LiquidHeroScene — the R3F mesh + ShaderMaterial that draws loudsrl.com's
 * "liquid paint" hero, ported 1:1 from the real site.
 *
 * Source of truth: loudsrl.com ships this as React-Three-Fiber on three.js
 * r178. We pulled the EXACT vertex + fragment shaders, the 7-entry preset
 * table, the initial-uniform object and the per-frame morph straight out of
 * their production bundle (_next/static/chunks/c20cbd4e319b5ace.js) — nothing
 * here is guessed. The shader is the "Balatro" swirl: pixel-grid quantise →
 * polar domain-warp → bounded turbulence loop → 3-colour band blend → grain.
 *
 * Why R3F and not raw WebGL: an earlier hand-rolled raw-WebGL-1 port rendered
 * pure black on the dev machine's integrated AMD GPU. loudsrl runs the SAME
 * shader fine on that same GPU because three.js renders on a WebGL2 context
 * (guaranteed highp fragment precision); a WebGL1 context can silently clamp
 * `precision highp float` to mediump, overflowing the iterated trig loop →
 * black. Rendering exactly the way loudsrl does (three.js / WebGL2) is the fix.
 *
 * The mesh is a clip-filling plane (camera fov:1 at z=1 makes the 2×2 plane
 * massively overfill the frustum) and the fragment samples gl_FragCoord /
 * iResolution only — vUv is written but unused, exactly as on loudsrl.
 */

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

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

/* ----------------------------------------------------------------------------
 * Preset table — the `hI` array from loudsrl's Redux `liquidBackground` slice,
 * lifted exactly. Index 0 (`hL`, the default) is the live hero look: deep navy
 * with bright liquid-chrome veins. The rest are the colour swaps their site
 * morphs to on industry hover; kept so we can retune without re-deriving them.
 * `colourN` are raw sRGB hex (uploaded as vec4 0..1; three does NOT linearise
 * plain vec4 uniforms, and the ShaderMaterial output is not re-encoded, so what
 * we author here is what displays — no sRGB pow() needed, matching loudsrl).
 * -------------------------------------------------------------------------- */
export type LiquidPreset = {
  spinRotation: number;
  spinSpeed: number;
  colour1: string;
  colour2: string;
  colour3: string;
  contrast: number;
  lighting: number;
  spinAmount: number;
  pixelFilter: number;
  grainStrength: number;
  useGrain: boolean;
  effectDepth: number;
  zoom?: number;
};

export const LIQUID_PRESETS: LiquidPreset[] = [
  // 0 — HERO: near-black navy base / brand royal indigo / bright periwinkle — high contrast to pop against bg
  { spinRotation: 0, spinSpeed: 2, colour1: '#0B1020', colour2: '#4F6AF0', colour3: '#BFCCFA', contrast: 5.5, lighting: 0.42, spinAmount: 0.25, pixelFilter: 1e4, grainStrength: 0.2, useGrain: false, effectDepth: 10 },
  // 1 — terracotta
  { spinRotation: 3, spinSpeed: 10, colour1: '#CF907B', colour2: '#DDB1A3', colour3: '#CF907B', contrast: 1.5, lighting: 0, spinAmount: 0.85, pixelFilter: 1e4, grainStrength: 0.2, useGrain: false, effectDepth: 4 },
  // 2 — periwinkle blue
  { spinRotation: 0, spinSpeed: 0, colour1: '#9BABE9', colour2: '#637FDC', colour3: '#7F96E3', contrast: 2, lighting: 0.3, spinAmount: 0, pixelFilter: 1e4, grainStrength: 0.5, useGrain: false, effectDepth: 5, zoom: 10 },
  // 3 — steel blue, grain
  { spinRotation: 1, spinSpeed: 1, colour1: '#89A3BD', colour2: '#57687F', colour3: '#000000', contrast: 3.5, lighting: 0.2, spinAmount: 2.5, pixelFilter: 1e4, grainStrength: 0.2, useGrain: true, effectDepth: 2 },
  // 4 — lavender, pixelated
  { spinRotation: 0, spinSpeed: 0.5, colour1: '#C5ACCA', colour2: '#9780A8', colour3: '#806A97', contrast: 0.8, lighting: 0.2, spinAmount: 0.25, pixelFilter: 10, grainStrength: 0.2, useGrain: false, effectDepth: 7, zoom: 100 },
  // 5 — bone white
  { spinRotation: 0, spinSpeed: 2, colour1: '#fffffc', colour2: '#eeeee9', colour3: '#ddddda', contrast: 3, lighting: 0.15, spinAmount: 0.15, pixelFilter: 1e4, grainStrength: 0.2, useGrain: false, effectDepth: 4 },
  // 6 — cyan / magenta neon
  { spinRotation: 0, spinSpeed: 10, colour1: '#00ffff', colour2: '#FF33FF', colour3: '#000000', contrast: 8, lighting: 0.05, spinAmount: 3, pixelFilter: 30, grainStrength: 1, useGrain: true, effectDepth: 3, zoom: 50 },
];

/** loudsrl's `hP`: hex "#rrggbb" -> Vector4 raw sRGB 0..1, alpha 1. */
function hexVec4(hex: string): THREE.Vector4 {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return new THREE.Vector4(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1);
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A resolved morph target — the preset with colours as Vector4s. */
type LiquidConfig = {
  spinRotation: number;
  spinSpeed: number;
  colour1: THREE.Vector4;
  colour2: THREE.Vector4;
  colour3: THREE.Vector4;
  contrast: number;
  lighting: number;
  spinAmount: number;
  pixelFilter: number;
  grainStrength: number;
  useGrain: boolean;
  effectDepth: number;
  zoom?: number;
};

function resolveConfig(p: LiquidPreset): LiquidConfig {
  return {
    spinRotation: p.spinRotation,
    spinSpeed: p.spinSpeed,
    colour1: hexVec4(p.colour1),
    colour2: hexVec4(p.colour2),
    colour3: hexVec4(p.colour3),
    contrast: p.contrast,
    lighting: p.lighting,
    spinAmount: p.spinAmount,
    pixelFilter: p.pixelFilter,
    grainStrength: p.grainStrength,
    useGrain: p.useGrain,
    effectDepth: p.effectDepth,
    zoom: p.zoom,
  };
}

type Props = {
  /** Which preset to render/morph toward. Hero = 0. */
  presetIndex?: number;
  /** Override the preset table (e.g. swap to brand colours). */
  presets?: LiquidPreset[];
  /** True for the first ~2s after mount — speeds the zoom-in settle, exactly
   *  like loudsrl's `isInit` (their 2000ms setTimeout). */
  isInit?: boolean;
  /** Fired after the first few stable frames (lets the parent reveal). */
  onReady?: () => void;
};

export default function LiquidHeroScene({
  presetIndex = 0,
  presets = LIQUID_PRESETS,
  isInit = true,
  onReady,
}: Props) {
  // Seed material from the active preset's initial uniform set (loudsrl's `M`).
  const material = useMemo(() => {
    const seed = presets[presetIndex] ?? LIQUID_PRESETS[0];
    return new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        u_zoom: { value: 10 },
        u_offset: { value: new THREE.Vector2(0, 0) },
        spinRotation: { value: seed.spinRotation },
        spinSpeed: { value: seed.spinSpeed },
        colour1: { value: hexVec4(seed.colour1) },
        colour2: { value: hexVec4(seed.colour2) },
        colour3: { value: hexVec4(seed.colour3) },
        contrast: { value: seed.contrast },
        lighting: { value: seed.lighting },
        spinAmount: { value: seed.spinAmount },
        pixelFilter: { value: seed.pixelFilter },
        grainStrength: { value: seed.grainStrength },
        useGrain: { value: seed.useGrain },
        effectDepth: { value: seed.effectDepth },
      },
    });
    // material is rebuilt only if the preset table identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presets]);

  const config = useMemo(
    () => resolveConfig(presets[presetIndex] ?? LIQUID_PRESETS[0]),
    [presets, presetIndex],
  );

  // Live zoom value. loudsrl seeds this ref at 100 (very magnified / near-flat)
  // and lerps it down to the rest zoom (~4) — the calm "pull-in" entry. Fast
  // (0.2/frame) while isInit, slow (0.05) after.
  const zoomRef = useRef(100);
  // Clock origin so iTime starts at 0 on (re)mount, matching loudsrl.
  const startRef = useRef<number | null>(null);
  const readyFired = useRef(false);
  const frameCount = useRef(0);

  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  // keep the drawing-buffer resolution uniform correct on resize too
  useEffect(() => {
    (material.uniforms.iResolution.value as THREE.Vector2).set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
    );
  }, [size, viewport, material]);

  useFrame((state) => {
    const u = material.uniforms;
    if (startRef.current === null) startRef.current = state.clock.getElapsedTime();
    const t = state.clock.getElapsedTime() - startRef.current;

    u.iTime.value = t;
    (u.iResolution.value as THREE.Vector2).set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );

    // --- zoom-in entry settle (loudsrl's exact branch logic) ---
    if (config.zoom != null) {
      zoomRef.current = lerp(zoomRef.current, config.zoom, isInit ? 0.02 : 0.001);
    } else {
      zoomRef.current = lerp(zoomRef.current, 4, isInit ? 0.2 : 0.05);
    }
    u.u_zoom.value = zoomRef.current;

    // --- per-uniform morph toward the active preset (0.09/frame) ---
    // Vector4 colours lerp; effectDepth snaps; spinAmount snaps when settling
    // to a small value at low spin (matches loudsrl's special case); booleans
    // assign. u_offset stays (0,0): the hero is static / non-interactive.
    u.colour1.value.lerp(config.colour1, 0.09);
    u.colour2.value.lerp(config.colour2, 0.09);
    u.colour3.value.lerp(config.colour3, 0.09);
    u.spinRotation.value = lerp(u.spinRotation.value, config.spinRotation, 0.09);
    u.spinSpeed.value = lerp(u.spinSpeed.value, config.spinSpeed, 0.09);
    u.contrast.value = lerp(u.contrast.value, config.contrast, 0.09);
    u.lighting.value = lerp(u.lighting.value, config.lighting, 0.09);
    u.spinAmount.value =
      config.spinAmount < 1 && config.spinSpeed < 10
        ? config.spinAmount
        : lerp(u.spinAmount.value, config.spinAmount, 0.09);
    u.pixelFilter.value = lerp(u.pixelFilter.value, config.pixelFilter, 0.09);
    u.grainStrength.value = lerp(u.grainStrength.value, config.grainStrength, 0.09);
    u.effectDepth.value = config.effectDepth; // snap (int)
    u.useGrain.value = config.useGrain;

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
