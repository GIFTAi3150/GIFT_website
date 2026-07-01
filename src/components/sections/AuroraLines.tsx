'use client';

/**
 * AuroraLines — flowing silk-ribbon lines on a TRANSPARENT canvas.
 * No background, no text — just the glowing lines. Drop it over any section.
 *
 *   <section className="relative">
 *     <AuroraLines className="z-[1] pointer-events-none" />
 *     ...content...
 *   </section>
 *
 * The field always animates by itself (time-driven). Two positioning modes:
 *   - default            -> canvas is absolute, fills + scrolls WITH the section
 *   - fixedBackground    -> canvas is position:fixed, fills the viewport and is
 *                           clipped to the parent section each frame. The field
 *                           then stays locked to the SCREEN while the section
 *                           scrolls past it (background-attachment: fixed), and
 *                           never paints outside the section. Use this when you
 *                           want a still-on-scroll backdrop that keeps animating.
 *
 * Perf: 1 draw call, renders at 0.5x internal res, pauses when the section is
 * offscreen or the tab is hidden. Raw WebGL — follows the repo context-loss
 * convention (capture-phase preventDefault listener, NO loseContext() on
 * unmount; see MissionGrainBg.tsx + the raw-webgl-guilty-pattern memory).
 */

import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  ribbons?: number; // number of lines (default 7)
  speed?: number; // global speed multiplier (default 1)
  intensity?: number; // line brightness (default 1)
  colorA?: [number, number, number]; // first color, 0..1 RGB
  colorB?: [number, number, number]; // last color,  0..1 RGB
  mouseParallax?: boolean; // field leans toward cursor (default true)
  fixedBackground?: boolean; // pin to the screen + clip to the parent section (default false)
};

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uSpeed;
uniform float uIntensity;
uniform vec3  uColA;
uniform vec3  uColB;

#define RIBBONS_MAX 16
uniform int uRibbons;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = uv*2.0 - 1.0;
  p.x *= uRes.x/uRes.y;

  float t = uTime*0.12*uSpeed;
  p += (uMouse - 0.5)*0.35;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float yPrev = 0.0;
  float n = float(uRibbons);

  for (int i = 0; i < RIBBONS_MAX; i++) {
    if (i >= uRibbons) break;
    float fi = float(i);
    float freq  = 0.6 + fi*0.33;
    float speed = (mod(fi,2.0)<1.0 ? 1.0 : -1.0) * (0.7 + fi*0.17);
    float amp   = 0.55 - fi*0.045;
    float y = sin(p.x*freq + t*speed*2.0 + yPrev*2.2) * amp;
    float offset = -0.52 + fi*(1.04/max(n-1.0, 1.0));
    float dist = abs(p.y - y*0.7 + offset);
    float band = 0.018 / max(dist, 0.002);   // bright core line
    float glow = exp(-dist*2.0);             // wide soft aura
    vec3 c = mix(uColA, uColB, fi/max(n-1.0, 1.0));
    float e = (band*0.055 + glow*0.055) * uIntensity;
    col += c * e;
    alpha += e;
    yPrev = y;
  }

  alpha = clamp(alpha, 0.0, 1.0);
  // premultiplied alpha output -> blends correctly over any page background
  gl_FragColor = vec4(col, alpha);
}`;

export default function AuroraLines({
  className = '',
  ribbons = 7,
  speed = 1,
  intensity = 1,
  colorA = [0.2, 0.8, 1.0],
  colorB = [0.58, 0.38, 1.0],
  mouseParallax = true,
  fixedBackground = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true, // transparent canvas
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;

    // Repo convention: block context-loss restoration on a dying canvas
    // (capture phase, preventDefault) and never call loseContext() ourselves.
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
    };
    canvas.addEventListener('webglcontextlost', onLost, true);

    // --- compile ---
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[AuroraLines] shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[AuroraLines] link:', gl.getProgramInfoLog(prog));
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
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      speed: gl.getUniformLocation(prog, 'uSpeed'),
      intensity: gl.getUniformLocation(prog, 'uIntensity'),
      colA: gl.getUniformLocation(prog, 'uColA'),
      colB: gl.getUniformLocation(prog, 'uColB'),
      ribbons: gl.getUniformLocation(prog, 'uRibbons'),
    };

    // static uniforms
    gl.uniform1f(U.speed, speed);
    gl.uniform1f(U.intensity, intensity);
    gl.uniform3f(U.colA, colorA[0], colorA[1], colorA[2]);
    gl.uniform3f(U.colB, colorB[0], colorB[1], colorB[2]);
    gl.uniform1i(U.ribbons, Math.min(Math.max(ribbons, 1), 16));

    gl.clearColor(0, 0, 0, 0);

    // --- size: render at 0.5x of the element, CSS scales up ---
    // In fixedBackground mode the canvas is a viewport-filling fixed layer, so
    // its box == the viewport; otherwise it == the section it sits in.
    const SCALE = 0.5;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(r.width * SCALE));
      canvas.height = Math.max(2, Math.floor(r.height * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // --- fixed-background clip: keep the fixed viewport canvas masked to the
    // parent section's on-screen rect, so it stays put while the section scrolls
    // and never paints over neighbouring sections. ---
    // (canvas's immediate parent is this component's own wrapper div — the CSS
    // fallback gradient's sibling — so the true consumer host is one level up.)
    const host = canvas.parentElement?.parentElement ?? null;
    const updateClip = () => {
      if (!host) return;
      const r = host.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const top = Math.max(0, r.top);
      const right = Math.max(0, vw - r.right);
      const bottom = Math.max(0, vh - r.bottom);
      const left = Math.max(0, r.left);
      canvas.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    };
    if (fixedBackground) updateClip();

    // --- mouse (smoothed) ---
    let mx = 0.5,
      my = 0.5,
      smx = 0.5,
      smy = 0.5;
    const onMove = (e: MouseEvent) => {
      if (!mouseParallax) return;
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener('mousemove', onMove);

    // --- visibility: pause offscreen / hidden tab. Watch the SECTION (the fixed
    // canvas itself is always on screen, so it can't gate visibility). ---
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // Fully hide the fixed layer once the section is gone so no clipped
        // sliver lingers at the viewport edge while the loop is paused.
        if (fixedBackground && !visible) canvas.style.clipPath = 'inset(100%)';
      },
      { threshold: 0 },
    );
    io.observe(fixedBackground && host ? host : canvas);

    // --- reduced motion: hold a static frame ---
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const t0 = performance.now();
    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (fixedBackground) updateClip(); // re-mask to the section as it scrolls
      smx += (mx - smx) * 0.04;
      smy += (my - smy) * 0.04;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, reduced ? 0 : (now - t0) / 1000);
      gl.uniform2f(U.mouse, smx, smy);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      // Reduced-motion: the field never changes, but in fixed mode we must keep
      // looping to track the clip as the page scrolls — only stop when neither
      // the field nor the clip can change.
      if (reduced && !fixedBackground) cancelAnimationFrame(rafRef.current);
    };
    rafRef.current = requestAnimationFrame(frame);

    // --- cleanup ---
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ribbons, speed, intensity, mouseParallax, fixedBackground, ...colorA, ...colorB]);

  const rgba = (c: [number, number, number], a: number) =>
    `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;

  return (
    <div
      className={className}
      style={
        fixedBackground
          ? { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }
          : { position: 'absolute', inset: 0 }
      }
    >
      {/* CSS-only fallback — visible from first paint (no JS needed), so there's
          no flat empty gap while the WebGL canvas hydrates + compiles on a real
          network. The canvas draws over this once its first frame is ready. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(155deg, ${rgba(colorA, 0.16)} 0%, transparent 45%, ${rgba(colorB, 0.14)} 100%)`,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        aria-hidden="true"
      />
    </div>
  );
}
