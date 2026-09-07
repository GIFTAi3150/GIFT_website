'use client';

import { useEffect, useRef } from 'react';
import type { Renderer as OGLRenderer } from 'ogl';
import { setFieldController } from './fieldBus';

/**
 * Plasma — React Bits' `Backgrounds/Plasma` (OGL raymarch), ported onto this
 * site's WebGL conventions: the canvas lives in JSX, the context-loss
 * listener is registered BEFORE the renderer is created and never calls
 * preventDefault (guilty-counter memory), OGL is imported lazily, and the
 * whole thing sits in one fixed container behind the page.
 *
 * It is the page's background. A navy veil above the canvas is scrubbed by
 * AtScroll as the hero leaves the viewport (0 → VEIL_MAX), so below the hero
 * the writing is the focus and the plasma is only a faint pulse; under the
 * CTA the veil lifts a little (VEIL_CTA). Raymarch verbatim from React Bits;
 * the colour grade is ours (two site hues + pale cores) and the mouse
 * interaction is removed on request.
 */

// ── the knobs (React Bits props, fixed here) ─────────────────────────────────
// Colour: instead of upstream's single-hue tint, the raymarch's own phase
// picks between two site hues (electric blue ↔ periwinkle violet) and the hot
// cores go pale — richer than one colour, still the page's palette.
const COLOR_A = '#2a5cf5'; // electric blue
const COLOR_B = '#7d6cf0'; // periwinkle violet
const COLOR_HI = '#d9e6ff'; // pale cores
const SPEED = 0.6;
const DIRECTION: 'forward' | 'reverse' | 'pingpong' = 'forward';
const OPACITY = 1.0;
const MAX_DPR = 1.5;
const ORIGINAL_QUALITY = 60;
// The raymarch is framed off the viewport's SHORT axis, so a phone sees a
// narrow slice — a couple of huge lights. Zoom out there (uScale < 1 samples a
// wider region) so the same structure reads at phone width, and let more of it
// through the veil.
const SCALE_DESKTOP = 1.0;
const SCALE_PHONE = 0.6;
const VEIL_MAX_DESKTOP = 0.8; // below the hero the writing is the focus, the plasma a visible pulse
const VEIL_CTA_DESKTOP = 0.6; // the bookend lets more plasma through
const VEIL_MAX_PHONE = 0.66;
const VEIL_CTA_PHONE = 0.48;

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 0.5, 0.2];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
};

const VERT = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorHi;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform float uQuality;
uniform float uStepScale;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.0; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z += d = (abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4) * uStepScale;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
    if (i >= uQuality) break;
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  // grade: the raymarch's warm/cool phase chooses the hue, its energy the light
  float lum = clamp((rgb.r + rgb.g + rgb.b) / 3.0, 0.0, 1.0);
  float phase = clamp((rgb.r - rgb.b) * 0.5 + 0.5, 0.0, 1.0);
  vec3 base = mix(uColorA, uColorB, phase);
  vec3 finalColor = base * lum * 1.2 + uColorHi * pow(lum, 3.0) * 0.55;

  float alpha = clamp(length(rgb) * uOpacity, 0.0, 1.0);
  fragColor = vec4(finalColor, alpha);
}
`;

export default function AtPlasma() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const veil = veilRef.current;
    const main = document.querySelector<HTMLElement>('main.at-page');
    if (!canvas || !veil || !main) return;

    const isPhone = window.matchMedia('(max-width: 899px)').matches;
    const veilMax = isPhone ? VEIL_MAX_PHONE : VEIL_MAX_DESKTOP;
    const veilCta = isPhone ? VEIL_CTA_PHONE : VEIL_CTA_DESKTOP;

    // ── the veil: scrubbed by AtScroll, lifted under the CTA
    let scrollP = 0;
    let cta = false;
    const applyVeil = () => {
      const v = cta ? Math.min(veilCta, veilMax * scrollP) : veilMax * scrollP;
      veil.style.opacity = v.toFixed(3);
    };
    setFieldController({
      setScroll: (p) => {
        scrollP = p;
        applyVeil();
      },
      setActive: () => {},
      setCta: (on) => {
        cta = on;
        applyVeil();
      },
    });
    applyVeil();

    const ready = () => window.dispatchEvent(new Event('gift:logo-ready'));
    const fallback = () => {
      main.setAttribute('data-at-fallback', '');
      requestAnimationFrame(ready);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phone = isPhone;
    const renderScale = 0.55;
    const iterations = phone ? 52 : ORIGINAL_QUALITY;

    let disposed = false;
    let raf = 0;
    let renderer: OGLRenderer | null = null;
    let cleanupGl: (() => void) | null = null;

    // Context loss: registered BEFORE the renderer creates the context. No
    // preventDefault — that asks Chrome to restore and ticks the guilty
    // counter when it can't. Stop drawing; the CSS glow is the fallback.
    const onLost = () => {
      cancelAnimationFrame(raf);
      if (!disposed) fallback();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    (async () => {
      const ogl = await import('ogl');
      if (disposed) return;
      const { Renderer, Program, Mesh, Triangle } = ogl;

      try {
        renderer = new Renderer({
          canvas,
          webgl: 2,
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          premultipliedAlpha: false,
          powerPreference: 'high-performance',
          dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        });
      } catch {
        renderer = null;
      }
      if (!renderer || !renderer.gl) {
        fallback();
        return;
      }
      const rend = renderer;
      const gl = rend.gl;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uColorA: { value: new Float32Array(hexToRgb(COLOR_A)) },
          uColorB: { value: new Float32Array(hexToRgb(COLOR_B)) },
          uColorHi: { value: new Float32Array(hexToRgb(COLOR_HI)) },
          uSpeed: { value: SPEED * 0.4 },
          uDirection: { value: DIRECTION === 'reverse' ? -1 : 1 },
          uScale: { value: phone ? SCALE_PHONE : SCALE_DESKTOP },
          uOpacity: { value: OPACITY },
          uQuality: { value: iterations },
          uStepScale: { value: ORIGINAL_QUALITY / iterations },
        },
        depthTest: false,
        depthWrite: false,
      });
      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
        program.remove();
        geometry.remove();
        fallback();
        return;
      }
      const mesh = new Mesh(gl, { geometry, program });

      // ── sizing: a fraction of the container, stretched by CSS.
      // The container (.at-plasma) is fixed at 100lvh, so its box does not
      // move when a phone's address bar collapses. The buffer is sized from
      // it, not from window.innerHeight, and a resize is only honoured when
      // the width changes or the height moves by more than 25% (rotation, a
      // real window resize) — the gate ViewportFreeze uses. Without it every
      // address-bar toggle re-allocated the buffer (one blank frame) and
      // changed iResolution, which re-frames the raymarch (the height is its
      // focal length): the whole plasma zoomed and popped on every
      // scroll-direction change on mobile.
      const box: HTMLElement = canvas.parentElement ?? canvas;
      let cssW = 1;
      let cssH = 1;
      let lastW = window.innerWidth;
      let lastH = window.innerHeight;
      let settleTimer = 0;
      const setSize = () => {
        cssW = Math.max(1, box.clientWidth || window.innerWidth);
        cssH = Math.max(1, box.clientHeight || window.innerHeight);
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        rend.setSize(Math.max(1, Math.floor(cssW * renderScale)), Math.max(1, Math.floor(cssH * renderScale)));
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        const res = program.uniforms.iResolution.value as Float32Array;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      };
      let resizePending = false;
      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // width unchanged & a small height change = the browser's toolbar
        if (w === lastW && Math.abs(h - lastH) <= h * 0.25) return;
        if (resizePending) return;
        resizePending = true;
        requestAnimationFrame(() => {
          resizePending = false;
          setSize();
        });
        // iOS can report a stale innerHeight right after a rotation
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(setSize, 350);
      };
      window.addEventListener('resize', onResize);
      setSize();

      // ── loop (no pointer interaction — the plasma is a background, not a toy)
      let tabVisible = document.visibilityState !== 'hidden';
      const t0 = performance.now();
      let first = false;
      const frame = (t: number) => {
        if (disposed || !tabVisible) return;
        const tv = (t - t0) * 0.001;
        if (DIRECTION === 'pingpong') {
          const dur = 10;
          const seg = tv % dur;
          const fwd = Math.floor(tv / dur) % 2 === 0;
          const u = seg / dur;
          const sm = u * u * (3 - 2 * u);
          program.uniforms.uDirection.value = 1;
          program.uniforms.iTime.value = fwd ? sm * dur : (1 - sm) * dur;
        } else {
          program.uniforms.iTime.value = tv;
        }
        rend.render({ scene: mesh });
        if (!first) {
          first = true;
          ready();
        }
        if (!reduced) raf = requestAnimationFrame(frame);
      };
      const onVis = () => {
        tabVisible = document.visibilityState !== 'hidden';
        cancelAnimationFrame(raf);
        if (tabVisible && !reduced) raf = requestAnimationFrame(frame);
      };
      document.addEventListener('visibilitychange', onVis);
      raf = requestAnimationFrame(frame);

      cleanupGl = () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(settleTimer);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
        program.remove();
        geometry.remove();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanupGl?.();
      setFieldController(null);
      // keep the blocker attached across teardown; remove it last
      canvas.removeEventListener('webglcontextlost', onLost);
    };
  }, []);

  return (
    <div className="at-plasma" aria-hidden>
      <canvas ref={canvasRef} className="at-plasma__canvas" />
      <div ref={veilRef} className="at-veil" />
    </div>
  );
}
