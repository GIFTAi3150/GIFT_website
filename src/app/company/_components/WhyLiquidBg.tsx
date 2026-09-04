'use client';

import { useEffect, useRef } from 'react';
import type { Renderer as OGLRenderer } from 'ogl';

/**
 * Why AIOps background — four liquid spheres. All viewports.
 *
 * One OGL fragment pass raymarches four spheres joined by a smooth-min, so they
 * bridge and pull apart like drops of liquid as they drift on slow Lissajous
 * orbits. They are shaded as GLASS, not solid balls — the copy is the subject
 * of this section, so the middle of a drop is nearly the background seen
 * through a faint tint and only the grazing rim, the glints and the seams
 * where two drops merge are actually opaque. The canvas is viewport-sized and
 * sticky inside the section, so the cost is constant however tall the section
 * is; its background reproduces the section's own CSS gradient in section
 * space, so the canvas edge is invisible and the static fallback (no WebGL,
 * context lost, shader failure) is pixel-identical minus the spheres.
 *
 * Portrait is re-proportioned, not just shrunk. A phone's view is narrow in x
 * and tall in y, so `fit()` rescales radii, pulls the sideways drift in and
 * lengthens the vertical travel — and the smooth-min radius scales with the
 * radii, or small spheres would merge into one mush. Phones also get fewer
 * march steps, a lower render scale and a slightly softer blend, so the white
 * type stays legible over the glossy tops.
 */

// ESSL 1.00 on purpose: no derivatives needed, so one shader serves WebGL1 and
// WebGL2 alike (no #version juggling — see the terrain-hero memory). highp is
// guaranteed in WebGL2 fragment shaders but not WebGL1, hence the guard.
const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform vec2  uRes;       // drawing-buffer size
uniform float uTime;
uniform vec4  uSph[4];    // xyz = centre, w = radius (scene units)
uniform float uK;         // smooth-min radius: how close two blobs are when they bridge
uniform float uAmt;       // blob opacity over the background (legibility on phones)
uniform float uBgOff;     // canvas top inside the section, 0..1 of section height
uniform float uBgScale;   // canvas height / section height

#define FAR   14.0
#define FOCAL 2.4

const vec3 NAVY  = vec3(0.043, 0.063, 0.125);   // #0b1020
const vec3 ABYSS = vec3(0.020, 0.047, 0.102);   // #050c1a
const vec3 PERI  = vec3(0.239, 0.278, 0.753);   // #3d47c0
const vec3 BLUE  = vec3(0.376, 0.647, 0.980);   // #60a5fa

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float map(vec3 p) {
  float d = length(p - uSph[0].xyz) - uSph[0].w;
  d = smin(d, length(p - uSph[1].xyz) - uSph[1].w, uK);
  d = smin(d, length(p - uSph[2].xyz) - uSph[2].w, uK);
  d = smin(d, length(p - uSph[3].xyz) - uSph[3].w, uK);
  return d;
}
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.0015;
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

/* Glass, not a solid ball. The copy is the subject of this section, so the
   drops are rendered the way a real transparent one reads: the middle is
   almost entirely the background seen through a faint tint, and what you
   actually SEE is the grazing rim (Fresnel), the specular glints and the
   darker seams where two drops merge. Returns colour + per-pixel alpha. */
vec4 shadeGlass(vec3 p, vec3 rd) {
  vec3 n = calcNormal(p);
  vec3 v = -rd;
  float ndv  = clamp(dot(n, v), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.6);

  // occlusion in the folds where two blobs bridge — what sells the liquid
  float ao = clamp(map(p + n * 0.22) / 0.22, 0.0, 1.0);
  ao = mix(0.55, 1.0, ao);

  vec3 L1 = normalize(vec3(-0.55,  0.85, 0.60));   // key, upper-left
  vec3 L2 = normalize(vec3( 0.80, -0.35, 0.30));   // fill, lower-right
  float sp1 = pow(clamp(dot(n, normalize(L1 + v)), 0.0, 1.0), 110.0);
  float sp2 = pow(clamp(dot(n, normalize(L2 + v)), 0.0, 1.0), 26.0);

  // glossy environment: lit sky above, dark floor below
  vec3 r   = reflect(rd, n);
  float et = clamp(r.y * 0.65 + 0.40, 0.0, 1.0);
  vec3 env = mix(ABYSS, mix(PERI, BLUE, 0.45), smoothstep(0.1, 1.0, et));

  // thin periwinkle tint through the body, the environment at the rim
  vec3 col = mix(PERI * 0.36, env, 0.30 + 0.70 * fres);
  col += BLUE * fres * 0.34;
  col *= ao;
  col += vec3(0.85, 0.90, 1.0) * sp1 * 0.70;
  col += BLUE * sp2 * 0.09;

  // Alpha is where the transparency lives, and it is deliberately low: ~0.05
  // straight through the middle (a watermark, not a surface), rising to ~0.45
  // only at grazing angles, with the tight glint floored in so a drop still
  // catches the light. Raise these two constants to make the drops stronger.
  float a = 0.05 + 0.42 * fres;
  a = max(a, sp1 * 0.60);
  a += sp2 * 0.03;
  a *= mix(0.82, 1.0, ao);
  return vec4(col, clamp(a, 0.0, 1.0));
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 sp = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);
  vec3 ro = vec3(0.0, 0.0, 5.2);
  vec3 rd = normalize(vec3(sp, -FOCAL));

  // background = the section's CSS gradient, evaluated in section space
  float sy = uBgOff + (1.0 - uv.y) * uBgScale;
  vec3 col = mix(NAVY, ABYSS, clamp(sy, 0.0, 1.0));

  // sphere-trace; remember the closest approach for a soft, anti-aliased edge
  float t = 0.0, dMin = 1e5, tMin = 0.0, hit = 0.0;
  for (int i = 0; i < STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    float ad = d / max(t, 1.0);
    if (ad < dMin) { dMin = ad; tMin = t; }
    if (d < 0.001 * max(t, 1.0)) { hit = 1.0; break; }
    t += d;
    if (t > FAR) break;
  }
  float px  = 2.0 / (uRes.y * FOCAL);                       // one pixel, angular
  float cov = hit > 0.5 ? 1.0 : 1.0 - smoothstep(0.0, px * 1.5, dMin);
  if (cov > 0.002) {
    vec3 p = ro + rd * (hit > 0.5 ? t : tMin);
    vec4 g = shadeGlass(p, rd);
    col = mix(col, g.rgb, clamp(cov * g.a * uAmt, 0.0, 1.0));
  }

  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.03;   // grain
  gl_FragColor = vec4(col, 1.0);
}
`;

// Each sphere drifts on its own Lissajous orbit (amplitude / rad·s⁻¹ / phase per
// axis). Periods of 30–50 s, phases spread, so at any moment some pair is
// bridging or letting go. Amplitudes and radii are re-proportioned per aspect
// by fit() below — these are the wide-desktop values.
const ORBITS = [
  { r: 0.95, ax: 1.30, ay: 0.75, az: 0.35, fx: 0.13, fy: 0.17, fz: 0.11, px: 0.0, py: 1.7, pz: 0.4 },
  { r: 0.72, ax: 1.40, ay: 0.85, az: 0.40, fx: 0.19, fy: 0.12, fz: 0.15, px: 2.1, py: 0.6, pz: 2.5 },
  { r: 0.58, ax: 1.20, ay: 0.95, az: 0.30, fx: 0.12, fy: 0.21, fz: 0.13, px: 4.0, py: 3.1, pz: 1.2 },
  { r: 0.46, ax: 1.50, ay: 0.70, az: 0.45, fx: 0.21, fy: 0.15, fz: 0.18, px: 1.0, py: 4.6, pz: 3.3 },
];

const PHONE_MQ = '(max-width: 1023px)';
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Composition per aspect ratio. k = 0 at a 9:19.5 phone, 1 at a wide desktop.
 * The visible half-width at the cluster's depth is only ~1.0 scene unit on a
 * portrait phone against ~3.5 on a wide desktop, so the same numbers there
 * would put a single blob across 70 % of the screen — a foreground object, not
 * a background. Portrait therefore shrinks the radii to ~46 % (the largest blob
 * lands near 44 % of screen width), pulls the sideways drift in so blobs stay
 * in frame, and lengthens the vertical travel to use the tall frame.
 */
function fit(aspect: number) {
  const k = clamp((aspect - 0.46) / (1.6 - 0.46), 0, 1);
  return {
    r: 0.34 + 0.38 * k,   // radius scale — 0.34 portrait → 0.72 wide desktop
    x: 0.34 + 0.66 * k,   // sideways drift
    y: 1.30 - 0.30 * k,   // vertical drift
  };
}

export default function WhyLiquidBg() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = (ogl: typeof import('ogl')): (() => void) | null => {
      const { Mesh, Program, Renderer, Triangle } = ogl;
      const wrap = wrapRef.current;
      const hold = holdRef.current;
      const canvas = canvasRef.current;
      const section = wrap?.parentElement ?? null;
      if (!wrap || !hold || !canvas || !section) return null;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isTouch = window.matchMedia('(hover: none)').matches;
      const phoneNow = () => window.matchMedia(PHONE_MQ).matches;

      let disposed = false;
      let rafId = 0;
      let running = false;
      const stopLoop = () => { running = false; cancelAnimationFrame(rafId); };

      // Context loss: the listener must exist BEFORE the renderer creates the
      // context (at the target, listeners fire in registration order). No
      // preventDefault — that asks Chrome to restore and ticks the guilty counter
      // when it can't. Stop drawing; the section's CSS gradient is the fallback.
      const onLost = () => { stopLoop(); canvas.removeAttribute('data-ready'); };
      canvas.addEventListener('webglcontextlost', onLost);

      // OGL throws inside its constructor when no context can be made.
      let renderer: OGLRenderer | null = null;
      try {
        renderer = new Renderer({
          canvas,
          dpr: 1,
          alpha: false,
          depth: false,
          stencil: false,
          antialias: false,
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          autoClear: false,
          webgl: 2,
        });
      } catch {
        renderer = null;
      }
      if (!renderer || !renderer.gl) {
        canvas.removeEventListener('webglcontextlost', onLost);
        return null;
      }
      const gl = renderer.gl;
      const rend = renderer;

      // March steps are a compile-time constant (ESSL 1.00 needs a constant loop
      // bound), so they are baked per device class at startup: the scene is four
      // convex blobs, which sphere-tracing converges on fast, and 52 is plenty
      // for a soft background at phone resolution.
      const steps = phoneNow() ? 52 : 80;

      const uniforms = {
        uRes: { value: [1, 1] as number[] },
        uTime: { value: 0 },
        uSph: { value: ORBITS.map(() => [0, 0, 0, 1]) },
        uK: { value: 0.62 },
        uAmt: { value: 1 },
        uBgOff: { value: 0 },
        uBgScale: { value: 1 },
      };
      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: VERT,
        fragment: `#define STEPS ${steps}\n${FRAG}`,
        uniforms,
        depthTest: false,
        depthWrite: false,
        cullFace: false,
      });
      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
        // OGL already console.warn'd the shader log; keep the CSS gradient.
        program.remove();
        geometry.remove();
        canvas.removeEventListener('webglcontextlost', onLost);
        return null;
      }
      const mesh = new Mesh(gl, { geometry, program });

      // ── sizing ──
      // Raymarching cost scales with pixels and a soft background does not need
      // device resolution: render at a fraction of the DPR. OGL pins the CSS size
      // in px on setSize; hand it back to the stylesheet (100 %) so URL-bar
      // jitter between real resizes just stretches the buffer instead of
      // re-allocating it mid-scroll.
      let w = 1;
      let h = 1;
      const resize = () => {
        const r = hold.getBoundingClientRect();
        w = Math.max(1, Math.round(r.width));
        h = Math.max(1, Math.round(r.height));
        const phone = phoneNow();
        const dpr = window.devicePixelRatio || 1;
        rend.dpr = Math.min(phone ? 0.8 : 1, dpr * (phone ? 0.55 : 0.7));
        rend.setSize(w, h);
        canvas.style.width = '';
        canvas.style.height = '';
        uniforms.uRes.value = [canvas.width, canvas.height];
        // phones: hold the drops back a touch further — the text sits straight
        // over them there, with no stage column to hide behind. Only a nudge
        // now that the glass alpha does the real work.
        uniforms.uAmt.value = phone ? 0.9 : 1;
      };

      // ── pointer: the whole cluster leans gently toward the cursor ──
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = 1 - (e.clientY / window.innerHeight) * 2;
      };
      if (!isTouch && !reducedMotion) window.addEventListener('pointermove', onMove, { passive: true });

      // ── one frame ──
      const sph = uniforms.uSph.value;
      const draw = (t: number) => {
        if (disposed) return;
        // where the canvas sits inside the section → gradient + parallax
        const sr = section.getBoundingClientRect();
        const hr = hold.getBoundingClientRect();
        const secH = Math.max(1, sr.height);
        uniforms.uBgOff.value = (hr.top - sr.top) / secH;
        uniforms.uBgScale.value = hr.height / secH;
        const vh = window.innerHeight || 1;
        const progress = clamp((vh - sr.top) / (secH + vh), 0, 1);   // 0 entering … 1 gone

        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;

        const f = fit(w / h);
        const cx = pointer.x * 0.35 * f.x;
        const cy = pointer.y * 0.25 + (progress - 0.5) * 0.8;   // rides up slowly with the read
        for (let i = 0; i < ORBITS.length; i++) {
          const o = ORBITS[i];
          const v = sph[i];
          v[0] = cx + o.ax * f.x * Math.sin(t * o.fx + o.px);
          v[1] = cy + o.ay * f.y * Math.sin(t * o.fy + o.py);
          v[2] = o.az * Math.sin(t * o.fz + o.pz);
          v[3] = o.r * f.r * (1 + 0.05 * Math.sin(t * 0.35 + i * 1.3));   // breathing
        }
        // the bridging distance has to follow the radii, or small spheres merge
        // into one mush instead of reading as separate drops
        uniforms.uK.value = 0.62 * f.r;
        uniforms.uTime.value = t;
        rend.render({ scene: mesh });
        if (!canvas.hasAttribute('data-ready')) canvas.setAttribute('data-ready', '');
      };

      // ── render loop (gated on visibility) ──
      let last = 0;
      let elapsed = 0;
      const frame = (now: number) => {
        if (!running) return;
        rafId = requestAnimationFrame(frame);
        if (!last) last = now;
        elapsed += Math.min(64, now - last);
        last = now;
        draw(elapsed * 0.001);
      };
      const startLoop = () => {
        if (running || disposed) return;
        running = true;
        last = 0;
        rafId = requestAnimationFrame(frame);
      };

      let onScreen = false;
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (reducedMotion) return;
        if (onScreen && !document.hidden) startLoop(); else stopLoop();
      }, { threshold: 0 });
      io.observe(section);
      const onVis = () => {
        if (document.hidden) stopLoop();
        else if (onScreen && !reducedMotion) startLoop();
      };
      document.addEventListener('visibilitychange', onVis);

      // Only re-size on a WIDTH change or a large height change (mobile URL bar).
      let lastW = window.innerWidth;
      let lastH = window.innerHeight;
      const onResize = () => {
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        if (cw === lastW && Math.abs(ch - lastH) < ch * 0.25) return;
        lastW = cw;
        lastH = ch;
        resize();
        if (reducedMotion) draw(0);
      };
      window.addEventListener('resize', onResize);

      resize();
      if (reducedMotion) draw(0);   // one still: the composition without the motion

      return () => {
        disposed = true;
        stopLoop();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeAttribute('data-ready');
        program.remove();
        geometry.remove();
        // never loseContext(): it ticks Chrome's guilty counter (project memory)
      };
    };

    // `ogl` stays a separate chunk: the page's first paint does not wait on it.
    let cancelled = false;
    let dispose: (() => void) | null = null;
    import('ogl')
      .then((ogl) => { if (!cancelled) dispose = init(ogl); })
      .catch(() => { /* chunk failed to load: the CSS gradient stays */ });

    return () => {
      cancelled = true;
      dispose?.();
      dispose = null;
    };
  }, []);

  return (
    <div ref={wrapRef} className="co-why__bg" aria-hidden>
      <div ref={holdRef} className="co-why__bg-stick">
        <canvas ref={canvasRef} className="co-why__bg-canvas" />
      </div>
    </div>
  );
}
