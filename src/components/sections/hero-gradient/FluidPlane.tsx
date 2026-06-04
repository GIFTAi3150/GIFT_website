'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  VERT_MAIN,
  VERT_POISSON,
  VERT_ADVECTION,
  VERT_SPLAT,
  VERT_DISPLAY,
  FRAG_ADVECTION,
  FRAG_DIVERGENCE,
  FRAG_POISSON,
  FRAG_PRESSURE,
  FRAG_SPLAT,
  FRAG_DISPLAY,
} from './fluid.glsl';

// --- simulation constants, lifted verbatim from the reference component ---
const SIM_DPR = 0.2; // fluid runs at 1/5 of the display resolution
const DT = 0.008; // fixed timestep (reference `pg`)
const ITERATIONS = 32; // jacobi pressure iterations
const DISSIPATION = 0.99; // velocity decay per advection
const FORCE_BIAS = 28; // splat force multiplier (ref default 20)
const RADIUS = 55; // splat radius (in sim texels)
const DISTORTION_STRENGTH = 0.8; // UV warp magnitude (ref default 0.5)
const CHROMATIC_STRENGTH = 0.6; // RGB-split magnitude (ref default 0.5)

// Placeholder hero image. The reference warps a real photo/gradient set in
// Framer; this generates an equivalent soft colour field so the mechanism is
// visible. Swap `makeGradientTexture` for a loaded image when the real art is
// ready — nothing else changes.
const IMG_W = 1600;
const IMG_H = 900;

function makeGradientTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = IMG_W;
  c.height = IMG_H;
  const ctx = c.getContext('2d')!;

  // base vertical wash — vivid periwinkle, matching the reference's live-
  // sampled ramp (#4547c4 top → #2b2f86 mid → #0f132f bottom).
  const base = ctx.createLinearGradient(0, 0, 0, IMG_H);
  base.addColorStop(0, '#363b9e');
  base.addColorStop(0.55, '#242974');
  base.addColorStop(1, '#101535');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, IMG_W, IMG_H);

  // periwinkle glows for the cursor to smear. Brightest at top-right
  // (reference highlight #6f6dda). All stay in the blue family so the field
  // reads as a clean vivid blue, not a muddy multi-hue wash.
  const glow = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, IMG_W, IMG_H);
  };
  ctx.globalCompositeOperation = 'lighter';
  glow(IMG_W * 0.82, IMG_H * 0.16, IMG_W * 0.5, 'rgba(104,104,182,0.34)'); // top-right highlight
  glow(IMG_W * 0.3, IMG_H * 0.3, IMG_W * 0.5, 'rgba(64,66,165,0.3)'); // periwinkle
  glow(IMG_W * 0.6, IMG_H * 0.78, IMG_W * 0.45, 'rgba(82,80,180,0.18)'); // soft violet-blue
  ctx.globalCompositeOperation = 'source-over';

  // Film grain, baked into the image so it warps WITH the fluid (matching the
  // reference, whose grain lives in the source texture — not a screen overlay).
  // Monochrome luminance noise = a fine speckle / "dots" texture.
  const GRAIN = 13; // amplitude on a 0–255 channel
  const id = ctx.getImageData(0, 0, IMG_W, IMG_H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 2 * GRAIN;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(id, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  // NoColorSpace (default) + raw ShaderMaterial output = pixel passthrough,
  // matching the reference. Do NOT set SRGBColorSpace here or the raw shader
  // double-darkens (see project_raw_shadermaterial_srgb memory note).
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeRT(w: number, h: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export default function FluidPlane({ onReady }: { onReady?: () => void }) {
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const readyFired = useRef(false);
  const frameCount = useRef(0);

  // Materials, scenes and geometry are built once. Render targets and
  // resolution-dependent uniforms are (re)sized in the effect below.
  const sim = useMemo(() => {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsGeo = new THREE.PlaneGeometry(2, 2); // fullscreen passes, clip space
    const splatGeo = new THREE.PlaneGeometry(1, 1); // small splat quad

    const base = { depthTest: false, depthWrite: false } as const;

    const advection = new THREE.ShaderMaterial({
      ...base,
      vertexShader: VERT_ADVECTION,
      fragmentShader: FRAG_ADVECTION,
      uniforms: {
        texelSize: { value: new THREE.Vector2(1, 1) },
        velocity: { value: null },
        deltaTime: { value: DT },
        dissipation: { value: DISSIPATION },
        maxAspect: { value: new THREE.Vector2(1, 1) },
      },
    });
    const divergence = new THREE.ShaderMaterial({
      ...base,
      vertexShader: VERT_MAIN,
      fragmentShader: FRAG_DIVERGENCE,
      uniforms: {
        texelSize: { value: new THREE.Vector2(1, 1) },
        bounce: { value: true },
        velocity: { value: null },
        deltaTime: { value: DT },
      },
    });
    const poisson = new THREE.ShaderMaterial({
      ...base,
      vertexShader: VERT_POISSON,
      fragmentShader: FRAG_POISSON,
      uniforms: {
        texelSize: { value: new THREE.Vector2(1, 1) },
        bounce: { value: true },
        pressure: { value: null },
        divergence: { value: null },
      },
    });
    const pressure = new THREE.ShaderMaterial({
      ...base,
      vertexShader: VERT_MAIN,
      fragmentShader: FRAG_PRESSURE,
      uniforms: {
        texelSize: { value: new THREE.Vector2(1, 1) },
        bounce: { value: true },
        deltaTime: { value: DT },
        pressure: { value: null },
        velocity: { value: null },
      },
    });
    const splat = new THREE.ShaderMaterial({
      ...base,
      vertexShader: VERT_SPLAT,
      fragmentShader: FRAG_SPLAT,
      blending: THREE.AdditiveBlending,
      uniforms: {
        texelSize: { value: new THREE.Vector2(1, 1) },
        center: { value: new THREE.Vector2(0, 0) },
        radius: { value: new THREE.Vector2(RADIUS, RADIUS) },
        force: { value: new THREE.Vector2(0, 0) },
        forceBias: { value: FORCE_BIAS },
      },
    });

    const mainTexture = makeGradientTexture();
    const display = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      vertexShader: VERT_DISPLAY,
      fragmentShader: FRAG_DISPLAY,
      uniforms: {
        src: { value: null },
        mainTexture: { value: mainTexture },
        fitScale: { value: new THREE.Vector2(1, 1) },
        distortionStrength: { value: DISTORTION_STRENGTH },
        chromaticStrength: { value: CHROMATIC_STRENGTH },
      },
    });

    // one scene per solver material; meshes never frustum-cull (shaders write
    // clip space directly so the camera is decorative).
    const sceneOf = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
      const scene = new THREE.Scene();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      scene.add(mesh);
      return scene;
    };

    return {
      camera,
      fsGeo,
      splatGeo,
      advection,
      divergence,
      poisson,
      pressure,
      splat,
      display,
      mainTexture,
      advScene: sceneOf(fsGeo, advection),
      divScene: sceneOf(fsGeo, divergence),
      poiScene: sceneOf(fsGeo, poisson),
      presScene: sceneOf(fsGeo, pressure),
      splatScene: sceneOf(splatGeo, splat),
    };
  }, []);

  // Render targets: two velocity buffers (A/B), one divergence, two pressure
  // (ping-pong). Recreated on resize.
  const rt = useRef<{
    velA: THREE.WebGLRenderTarget;
    velB: THREE.WebGLRenderTarget;
    div: THREE.WebGLRenderTarget;
    pA: THREE.WebGLRenderTarget;
    pB: THREE.WebGLRenderTarget;
  } | null>(null);

  useEffect(() => {
    const simW = Math.max(2, Math.round(size.width * SIM_DPR));
    const simH = Math.max(2, Math.round(size.height * SIM_DPR));

    rt.current?.velA.dispose();
    rt.current?.velB.dispose();
    rt.current?.div.dispose();
    rt.current?.pA.dispose();
    rt.current?.pB.dispose();
    rt.current = {
      velA: makeRT(simW, simH),
      velB: makeRT(simW, simH),
      div: makeRT(simW, simH),
      pA: makeRT(simW, simH),
      pB: makeRT(simW, simH),
    };

    // resolution-dependent uniforms
    const texel = new THREE.Vector2(1 / simW, 1 / simH);
    const maxDim = Math.max(simW, simH);
    const maxAspect = new THREE.Vector2(maxDim / simW, maxDim / simH);
    for (const m of [
      sim.advection,
      sim.divergence,
      sim.poisson,
      sim.pressure,
      sim.splat,
    ]) {
      (m.uniforms.texelSize.value as THREE.Vector2).copy(texel);
    }
    (sim.advection.uniforms.maxAspect.value as THREE.Vector2).copy(maxAspect);

    // object-fit: cover for the display image
    const imgAspect = IMG_W / IMG_H;
    const viewAspect = size.width / size.height;
    const fit = sim.display.uniforms.fitScale.value as THREE.Vector2;
    if (viewAspect > imgAspect) fit.set(1, imgAspect / viewAspect);
    else fit.set(viewAspect / imgAspect, 1);
  }, [size, sim]);

  const prevPointer = useRef(new THREE.Vector2(0, 0));
  const pointer = useRef(new THREE.Vector2(0, 0));
  const hasPointer = useRef(false);

  // Track the pointer on `window`, not via R3F's canvas-scoped state.pointer:
  // the hero's foreground content sits on top of the canvas and would
  // otherwise swallow every pointer event. NDC is computed against the canvas
  // rect (+y up), matching the reference's `eventSource: window` mode.
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      pointer.current.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      );
      hasPointer.current = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  useFrame((state) => {
    const gl = state.gl;
    const t = rt.current;
    if (!t) return;

    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;

    const pass = (
      target: THREE.WebGLRenderTarget,
      scene: THREE.Scene,
      clear: boolean,
    ) => {
      gl.setRenderTarget(target);
      if (clear) gl.clear();
      gl.render(scene, sim.camera);
    };

    // 1. advect velocity  (velA -> velB)
    sim.advection.uniforms.velocity.value = t.velA.texture;
    pass(t.velB, sim.advScene, true);

    // 2. splat cursor force additively into velB. force = pointer velocity in
    //    NDC (tracked on window above), matching the reference.
    const p = pointer.current;
    if (hasPointer.current) {
      (sim.splat.uniforms.center.value as THREE.Vector2).set(p.x, p.y);
      (sim.splat.uniforms.force.value as THREE.Vector2).set(
        p.x - prevPointer.current.x,
        p.y - prevPointer.current.y,
      );
      pass(t.velB, sim.splatScene, false);
    }
    prevPointer.current.set(p.x, p.y);
    hasPointer.current = true;

    // 3. divergence of velB -> div
    sim.divergence.uniforms.velocity.value = t.velB.texture;
    pass(t.div, sim.divScene, true);

    // 4. jacobi pressure solve (ping-pong pA/pB), starting from zero pressure
    sim.poisson.uniforms.divergence.value = t.div.texture;
    gl.setRenderTarget(t.pA);
    gl.clear();
    let read = t.pA;
    let write = t.pB;
    for (let i = 0; i < ITERATIONS; i++) {
      sim.poisson.uniforms.pressure.value = read.texture;
      pass(write, sim.poiScene, true);
      const tmp = read;
      read = write;
      write = tmp;
    }

    // 5. subtract pressure gradient: velB - grad(p) -> velA
    sim.pressure.uniforms.velocity.value = t.velB.texture;
    sim.pressure.uniforms.pressure.value = read.texture;
    pass(t.velA, sim.presScene, true);

    // 6. hand the final velocity field to the display pass; R3F renders the
    //    display mesh to the screen after this callback returns.
    sim.display.uniforms.src.value = t.velA.texture;

    gl.setRenderTarget(null);
    gl.autoClear = prevAutoClear;

    // Signal readiness after a few frames (not the very first, which can be a
    // grey/unstable frame before the gradient texture and FBOs settle) so the
    // hero's ball-expand entrance reveals stable content.
    frameCount.current += 1;
    if (!readyFired.current && frameCount.current >= 3) {
      readyFired.current = true;
      onReady?.();
    }
  });

  useEffect(() => {
    return () => {
      rt.current?.velA.dispose();
      rt.current?.velB.dispose();
      rt.current?.div.dispose();
      rt.current?.pA.dispose();
      rt.current?.pB.dispose();
      sim.mainTexture.dispose();
      sim.fsGeo.dispose();
      sim.splatGeo.dispose();
      for (const m of [
        sim.advection,
        sim.divergence,
        sim.poisson,
        sim.pressure,
        sim.splat,
        sim.display,
      ]) {
        m.dispose();
      }
    };
  }, [sim]);

  // The visible fullscreen quad. Its material samples the fluid velocity and
  // warps the hero image. Geometry is its own PlaneGeometry(2,2).
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={sim.display} attach="material" />
    </mesh>
  );
}
