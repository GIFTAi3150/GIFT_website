'use client';

/**
 * LiquidHero — full-bleed "liquid paint" WebGL backdrop.
 *
 * Faithful port of the loudsrl.com hero background. That site renders a single
 * fullscreen plane with the "Balatro" swirl-paint fragment shader (polar
 * domain-warp + turbulence loop + 3-colour band blend + film grain), driven
 * through a small set of presets whose uniforms it LERPs between on hover. We
 * reproduce the exact shader + the exact hero preset (dark navy / liquid
 * chrome) and the per-frame morph, but as raw WebGL on a transparent-capable
 * canvas — following this repo's context-loss convention (capture-phase
 * preventDefault, NO loseContext() on unmount; see AuroraLines.tsx +
 * MissionGrainBg.tsx + the raw-webgl-guilty-pattern memory).
 *
 *   <section className="relative">
 *     <LiquidHero className="z-0" presetIndex={hover ? 2 : 0} />
 *     ...content above...
 *   </section>
 *
 * Perf: 1 draw call, renders at 0.66x internal res (CSS upscales), pauses when
 * the section is offscreen or the tab is hidden, freezes on reduced-motion.
 */

import { useEffect, useRef } from 'react';

/* ----------------------------------------------------------------------------
 * Presets — lifted 1:1 from loudsrl's `liquidBackground` config array.
 * index 0 is the live hero look (dark navy / chrome). The rest are the colour
 * swaps their site morphs to on industry hover; kept here so we can retune.
 * Colours are hex; converted to 0..1 vec4 at upload time.
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
  // 0 — HERO: dark navy / liquid chrome. Tuned so the chrome is visible at EVERY
  // animation phase (loudsrl's exact values swept bright veins in/out, leaving
  // the frame near-black at rest): low contrast broadens the veins, high lighting
  // keeps them bright, colour3 lifted off pure black so voids read as navy.
  { spinRotation: 0, spinSpeed: 3, colour1: '#1a1a5c', colour2: '#a6a7c2', colour3: '#101038', contrast: 2.0, lighting: 0.9, spinAmount: 0.4, pixelFilter: 10000, grainStrength: 0.2, useGrain: false, effectDepth: 10 },
  // 1 — terracotta
  { spinRotation: 3, spinSpeed: 10, colour1: '#CF907B', colour2: '#DDB1A3', colour3: '#CF907B', contrast: 1.5, lighting: 0, spinAmount: 0.85, pixelFilter: 10000, grainStrength: 0.2, useGrain: false, effectDepth: 4 },
  // 2 — periwinkle blue (fits our --blue identity)
  { spinRotation: 0, spinSpeed: 0, colour1: '#9BABE9', colour2: '#637FDC', colour3: '#7F96E3', contrast: 2, lighting: 0.3, spinAmount: 0, pixelFilter: 10000, grainStrength: 0.5, useGrain: false, effectDepth: 5, zoom: 10 },
  // 3 — steel blue, grain
  { spinRotation: 1, spinSpeed: 1, colour1: '#89A3BD', colour2: '#57687F', colour3: '#000000', contrast: 3.5, lighting: 0.2, spinAmount: 2.5, pixelFilter: 10000, grainStrength: 0.2, useGrain: true, effectDepth: 2 },
  // 4 — lavender, pixelated
  { spinRotation: 0, spinSpeed: 0.5, colour1: '#C5ACCA', colour2: '#9780A8', colour3: '#806A97', contrast: 0.8, lighting: 0.2, spinAmount: 0.25, pixelFilter: 10, grainStrength: 0.2, useGrain: false, effectDepth: 7, zoom: 100 },
  // 5 — bone white
  { spinRotation: 0, spinSpeed: 2, colour1: '#fffffc', colour2: '#eeeee9', colour3: '#ddddda', contrast: 3, lighting: 0.15, spinAmount: 0.15, pixelFilter: 10000, grainStrength: 0.2, useGrain: false, effectDepth: 4 },
  // 6 — cyan / magenta neon
  { spinRotation: 0, spinSpeed: 10, colour1: '#00ffff', colour2: '#FF33FF', colour3: '#000000', contrast: 8, lighting: 0.05, spinAmount: 3, pixelFilter: 30, grainStrength: 1, useGrain: true, effectDepth: 3, zoom: 50 },
];

/* ---- shaders ---- */
const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Balatro effect(), verbatim from loudsrl's fragment shader. It samples
// gl_FragCoord + iResolution only (the original's vUv is unused), so this
// drops cleanly onto a fullscreen quad with no varyings. WebGL1-safe: the
// turbulence loop has a constant bound (20) and breaks on effectDepth.
const FRAG = `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform float u_zoom;
uniform vec2  u_offset;

uniform float spinRotation;
uniform float spinSpeed;
uniform vec4  colour1;
uniform vec4  colour2;
uniform vec4  colour3;
uniform float contrast;
uniform float lighting;
uniform float spinAmount;
uniform float pixelFilter;
uniform float grainStrength;
uniform float useGrain;
uniform int   effectDepth;

float random(in vec2 st){
  return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
}

vec4 effect(vec2 screenSize, vec2 screen_coords){
  vec2 center = 0.5 * screenSize;
  float base_pixel = length(screenSize) / pixelFilter;
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
  for(int i = 0; i < 20; i++){
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

void main(){
  gl_FragColor = effect(iResolution.xy, gl_FragCoord.xy);
}`;

/* hex "#rrggbb" -> [r,g,b] 0..1 */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = {
  className?: string;
  /** Which preset to morph toward. Parent flips this on hover/scroll. */
  presetIndex?: number;
  /** Override the preset table (e.g. swap to brand colours). */
  presets?: LiquidPreset[];
  /** Let the cursor push the field (u_offset). Default true. */
  interactive?: boolean;
  /** Play the "develop from static" intro on mount. Default true. */
  intro?: boolean;
  /** Intro duration in ms. Default 1500. */
  introMs?: number;
};

// "Develop from static" intro — the field starts as fast, pixelated, grainy
// chaos and resolves (eased) to the rest preset, like a signal locking in.
// Colours stay on the rest preset throughout (the look stays dark); only the
// structure/sharpness params animate.
const CHAOS = {
  pixelFilter: 34, // heavy blockiness (rest ~10000 = smooth)
  spinSpeed: 14, // fast churn (rest 2)
  effectDepth: 18, // max turbulence (rest 10)
  spinAmount: 2.0, // strong swirl (rest 0.25)
  contrast: 2.2,
  grain: 0.75, // strong static grain, fades to 0
  zoom: 7, // slightly pulled-in, settles to ~4
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function LiquidHero({
  className = '',
  presetIndex = 0,
  presets = LIQUID_PRESETS,
  interactive = true,
  intro = true,
  introMs = 1500,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  // live target index read inside the rAF loop without re-running the effect
  const targetRef = useRef(presetIndex);
  targetRef.current = presetIndex;
  const presetsRef = useRef(presets);
  presetsRef.current = presets;
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    // Repo convention: block context-loss restoration on a dying canvas
    // (capture phase, preventDefault); never call loseContext() ourselves.
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
    };
    canvas.addEventListener('webglcontextlost', onLost, true);

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[LiquidHero] shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[LiquidHero] link:', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      iTime: gl.getUniformLocation(prog, 'iTime'),
      iResolution: gl.getUniformLocation(prog, 'iResolution'),
      u_zoom: gl.getUniformLocation(prog, 'u_zoom'),
      u_offset: gl.getUniformLocation(prog, 'u_offset'),
      spinRotation: gl.getUniformLocation(prog, 'spinRotation'),
      spinSpeed: gl.getUniformLocation(prog, 'spinSpeed'),
      colour1: gl.getUniformLocation(prog, 'colour1'),
      colour2: gl.getUniformLocation(prog, 'colour2'),
      colour3: gl.getUniformLocation(prog, 'colour3'),
      contrast: gl.getUniformLocation(prog, 'contrast'),
      lighting: gl.getUniformLocation(prog, 'lighting'),
      spinAmount: gl.getUniformLocation(prog, 'spinAmount'),
      pixelFilter: gl.getUniformLocation(prog, 'pixelFilter'),
      grainStrength: gl.getUniformLocation(prog, 'grainStrength'),
      useGrain: gl.getUniformLocation(prog, 'useGrain'),
      effectDepth: gl.getUniformLocation(prog, 'effectDepth'),
    };

    // --- live (morphing) uniform state, seeded from the start preset ---
    const seed = presetsRef.current[targetRef.current] ?? LIQUID_PRESETS[0];
    const c1 = hexRgb(seed.colour1);
    const c2 = hexRgb(seed.colour2);
    const c3 = hexRgb(seed.colour3);
    const cur = {
      c1: [...c1] as number[],
      c2: [...c2] as number[],
      c3: [...c3] as number[],
      spinRotation: seed.spinRotation,
      spinSpeed: seed.spinSpeed,
      contrast: seed.contrast,
      lighting: seed.lighting,
      spinAmount: seed.spinAmount,
      pixelFilter: seed.pixelFilter,
      grainStrength: seed.grainStrength,
      useGrain: seed.useGrain ? 1 : 0,
      effectDepth: seed.effectDepth,
      zoom: seed.zoom ?? 4,
      offX: 0,
      offY: 0,
    };

    // --- size: render at 0.66x of the element, CSS scales up ---
    const SCALE = 0.66;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(r.width * SCALE));
      canvas.height = Math.max(2, Math.floor(r.height * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // --- mouse -> target offset (small, smoothed in the loop) ---
    let tOffX = 0,
      tOffY = 0;
    const onMove = (e: MouseEvent) => {
      if (!interactiveRef.current) return;
      const r = canvas.getBoundingClientRect();
      tOffX = ((e.clientX - r.left) / r.width - 0.5) * 0.12;
      tOffY = ((e.clientY - r.top) / r.height - 0.5) * -0.12;
    };
    // Only listen when interactive — a static backdrop attaches no global handler.
    if (interactiveRef.current) window.addEventListener('mousemove', onMove);

    // --- pause offscreen / hidden tab ---
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(canvas);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // reduced-motion or intro disabled -> skip straight to rest
    const introSec = intro && !reduced ? introMs / 1000 : 0;

    const t0 = performance.now();
    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      const elapsed = (now - t0) / 1000;
      const p = presetsRef.current[targetRef.current] ?? LIQUID_PRESETS[0];
      const K = 0.09;

      // Colours always ease toward the active preset (stays dark in/after intro).
      const t1 = hexRgb(p.colour1);
      const t2 = hexRgb(p.colour2);
      const t3 = hexRgb(p.colour3);
      for (let i = 0; i < 3; i++) {
        cur.c1[i] = lerp(cur.c1[i], t1[i], K);
        cur.c2[i] = lerp(cur.c2[i], t2[i], K);
        cur.c3[i] = lerp(cur.c3[i], t3[i], K);
      }

      if (elapsed < introSec) {
        // --- INTRO: resolve from static. Structure params ease chaos -> rest. ---
        const e = easeOutCubic(elapsed / introSec);
        // pixelFilter spans ~3 orders of magnitude -> interpolate geometrically
        // so de-pixelation reads smoothly rather than snapping sharp instantly.
        cur.pixelFilter = CHAOS.pixelFilter * Math.pow(p.pixelFilter / CHAOS.pixelFilter, e);
        cur.spinSpeed = lerp(CHAOS.spinSpeed, p.spinSpeed, e);
        cur.effectDepth = lerp(CHAOS.effectDepth, p.effectDepth, e);
        cur.spinAmount = lerp(CHAOS.spinAmount, p.spinAmount, e);
        cur.contrast = lerp(CHAOS.contrast, p.contrast, e);
        cur.spinRotation = lerp(0, p.spinRotation, e);
        cur.lighting = p.lighting;
        cur.grainStrength = lerp(CHAOS.grain, 0, e); // static noise fades out
        cur.useGrain = 1;
        cur.zoom = lerp(CHAOS.zoom, p.zoom ?? 4, e);
        cur.offX = 0;
        cur.offY = 0;
      } else {
        // --- REST: normal per-frame morph toward the active preset. ---
        cur.spinRotation = lerp(cur.spinRotation, p.spinRotation, K);
        cur.spinSpeed = lerp(cur.spinSpeed, p.spinSpeed, K);
        cur.contrast = lerp(cur.contrast, p.contrast, K);
        cur.lighting = lerp(cur.lighting, p.lighting, K);
        cur.spinAmount = lerp(cur.spinAmount, p.spinAmount, K);
        cur.pixelFilter = lerp(cur.pixelFilter, p.pixelFilter, K);
        cur.grainStrength = lerp(cur.grainStrength, p.grainStrength, K);
        cur.zoom = lerp(cur.zoom, p.zoom ?? 4, 0.04);
        cur.effectDepth = p.effectDepth; // snap (loudsrl snaps int depth)
        cur.useGrain = p.useGrain ? 1 : 0; // snap boolean
        cur.offX = lerp(cur.offX, tOffX, 0.06);
        cur.offY = lerp(cur.offY, tOffY, 0.06);
      }

      gl.uniform1f(U.iTime, reduced ? 0 : (now - t0) / 1000);
      gl.uniform2f(U.iResolution, canvas.width, canvas.height);
      gl.uniform1f(U.u_zoom, cur.zoom);
      gl.uniform2f(U.u_offset, cur.offX, cur.offY);
      gl.uniform1f(U.spinRotation, cur.spinRotation);
      gl.uniform1f(U.spinSpeed, cur.spinSpeed);
      gl.uniform4f(U.colour1, cur.c1[0], cur.c1[1], cur.c1[2], 1);
      gl.uniform4f(U.colour2, cur.c2[0], cur.c2[1], cur.c2[2], 1);
      gl.uniform4f(U.colour3, cur.c3[0], cur.c3[1], cur.c3[2], 1);
      gl.uniform1f(U.contrast, cur.contrast);
      gl.uniform1f(U.lighting, cur.lighting);
      gl.uniform1f(U.spinAmount, cur.spinAmount);
      gl.uniform1f(U.pixelFilter, cur.pixelFilter);
      gl.uniform1f(U.grainStrength, cur.grainStrength);
      gl.uniform1f(U.useGrain, cur.useGrain);
      gl.uniform1i(U.effectDepth, Math.round(cur.effectDepth));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost, true);
    };
    // shaders + listeners are static; morph reads refs, so no deps needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    />
  );
}
