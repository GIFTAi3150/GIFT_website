'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MASK_W = 2048; // POT so WebGL1 can mipmap it
const MASK_H = 1024;

const VERT_GL1 = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;
const VERT_GL2 = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// One fragment body, two headers. WebGL1 = ESSL 1.00 + OES_standard_derivatives
// (for fwidth); WebGL2 = ESSL 3.00, where fwidth is core — an ESSL 1.00 shader on
// a WebGL2 context has NO fwidth ("no matching overloaded function"). `#version`
// must be the very first character of the source. Uniforms live only in the
// fragment stage — no precision-mismatch link failures.
const FRAG_HEAD_GL1 = `#extension GL_OES_standard_derivatives : enable
precision highp float;
#define SAMPLE texture2D
#define OUT_COLOR gl_FragColor
`;
const FRAG_HEAD_GL2 = `#version 300 es
precision highp float;
out vec4 fragColor;
#define SAMPLE texture
#define OUT_COLOR fragColor
`;
const FRAG_BODY = `
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;      // 0..1, y up
uniform float uMouseAmp;   // 0..1
uniform float uReveal;     // 0..1 load reveal
uniform float uScroll;     // 0..1 hero scrub
uniform sampler2D uMask;   // letters, white on black, y down
uniform float uMaskOn;

/* 3D simplex noise — Ashima / Ian McEwan, MIT */
vec3 mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 mod289v4(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec4 permute(vec4 x){ return mod289v4(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159-0.85373472095314*r; }
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i =floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g =step(x0.yzx,x0.xyz);
  vec3 l =1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))+
    i.y+vec4(0.0,i1.y,i2.y,1.0))+
    i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j =p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x =x_*ns.x+ns.yyyy;
  vec4 y =y_*ns.x+ns.yyyy;
  vec4 h =1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    p = p * 2.02 + vec3(11.3, 7.1, 3.7);
    a *= 0.5;
  }
  return s;
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;                 // y up
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float s1 = smoothstep(0.0, 0.55, uScroll);        // spread: the letters' light leaves them
  float s2 = smoothstep(0.30, 1.0, uScroll);        // calm: dim, widen, tilt to a horizon

  // perspective fan-out as the map tilts
  p.x = (p.x - aspect * 0.5) * (1.0 + s2 * 0.9 * (1.0 - uv.y)) + aspect * 0.5;
  p.y *= 1.0 + s2 * 0.6;

  // --- breathing terrain ---
  float t = uTime * 0.09;
  float h = fbm(vec3(p * 1.15 + vec2(0.0, t * 0.35), t)) * 0.5 + 0.5;

  // --- pointer: hill under the cursor + rings travelling outward ---
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);
  float d = distance(p, m);
  h += uMouseAmp * 0.30 * exp(-d * d * 12.0);
  h += uMouseAmp * 0.045 * sin(d * 34.0 - uTime * 5.0) * exp(-d * 4.5);

  // --- letters (texture is y-down) ---
  vec2 muv = vec2(uv.x, 1.0 - uv.y);
  float mk   = SAMPLE(uMask, muv).r * uMaskOn;
  float mask = smoothstep(0.40, 0.60, mk);
  float glow = SAMPLE(uMask, muv, 5.0).r * uMaskOn;         // mip bias = free blur
  float bloom = smoothstep(0.25, 1.0, uReveal) * (1.0 - s1);
  float letterAmt = mask * bloom;
  float haloAmt   = glow * bloom;

  // --- contour density: sparse outside, dense inside; both widen when calm ---
  float widen = mix(1.0, 0.55, s2);
  float nOut = mix(16.0, 40.0, s1) * widen;
  float nIn  = 40.0 * widen;
  float n    = mix(nOut, nIn, letterAmt);
  float v    = h * n;
  float f    = abs(fract(v) - 0.5);
  float w    = fwidth(v) * 1.15;
  float line = 1.0 - smoothstep(0.0, w, f);
  float idx  = 1.0 - smoothstep(0.0, w * 1.6, abs(fract(v / 5.0) - 0.5) * 5.0); // every 5th = index contour
  line = max(line, idx * 0.85);

  // load reveal: contours are drawn from the valleys upward
  float rev = smoothstep(uReveal * 1.25 - 0.18, uReveal * 1.25 + 0.02, h);
  line *= (1.0 - rev);

  // --- colour ---
  vec3 navy  = vec3(0.043, 0.063, 0.125);   // #0b1020
  vec3 abyss = vec3(0.020, 0.047, 0.102);   // #050c1a
  vec3 peri  = vec3(0.239, 0.278, 0.753);   // #3d47c0
  vec3 blue  = vec3(0.376, 0.647, 0.980);   // #60a5fa
  vec3 white = vec3(0.86, 0.90, 1.0);

  float vig = smoothstep(0.2, 1.15, distance(uv, vec2(0.5, 0.45)) * 1.15);
  vec3 col = mix(navy, abyss, vig);
  col += peri * 0.10 * h * (1.0 - s2 * 0.7);
  col += peri * 0.16 * letterAmt;   // lifted floor inside the letters
  col += peri * 0.22 * haloAmt;     // halo outside the edges

  vec3 lineCol = mix(peri, blue, smoothstep(0.35, 0.85, h));
  lineCol = mix(lineCol, white, smoothstep(0.82, 0.98, h) * 0.6);
  float aOut  = mix(0.28, 0.85, s1);
  float alpha = mix(aOut, 1.0, letterAmt) * mix(1.0, 0.16, s2);
  alpha *= 1.0 + uMouseAmp * 0.9 * exp(-d * d * 5.0);
  col += lineCol * line * alpha;

  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.035; // grain
  OUT_COLOR = vec4(col, 1.0);
}
`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;

function padFor(w: number): number {
  // Matches the site container: max-w 72rem (1152px) + px-4 / md:px-6 / lg:px-8
  if (w >= 1024) return Math.max(32, (w - 1152) / 2 + 32);
  if (w >= 768) return 24;
  return 16;
}

export default function TerrainHero() {
  const stickRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef     = useRef<HTMLDivElement>(null);
  const cueRef    = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const stick = stickRef.current;
    const canvas = canvasRef.current;
    const scene = stick?.parentElement ?? null;
    if (!stick || !canvas || !scene) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    const spacer = scene.querySelector<HTMLElement>('.co-scene__spacer');

    // Everything that must intro-fade and scroll-out together, including the
    // DOM fallback letters (WebGL letters fade inside the shader instead).
    const uiItems = Array.from(stick.querySelectorAll<HTMLElement>('[data-hero-ui]'));

    let logoReadySent = false;
    const sendLogoReady = () => {
      if (logoReadySent) return;
      logoReadySent = true;
      window.dispatchEvent(new Event('gift:logo-ready'));
    };

    // ── layout numbers shared by the mask painter and the DOM fallback ──
    const applyLayoutVars = (pad: number, fs: number) => {
      stick.style.setProperty('--hero-pad', `${pad}px`);
      stick.style.setProperty('--hero-fs', `${fs}px`);
    };
    applyLayoutVars(padFor(window.innerWidth), 120);

    // ── UI intro / scroll (runs in every path, WebGL or not) ──
    const cue = cueRef.current;
    let scrollCue: gsap.core.Tween | null = null;
    const hideCue = () => {
      if (scrollCue) { scrollCue.kill(); scrollCue = null; }
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: 0.2, overwrite: true });
      window.removeEventListener('scroll', hideCue);
    };
    if (cue) gsap.set(cue, { autoAlpha: 0 });
    window.addEventListener('scroll', hideCue, { passive: true, once: true });

    const introTl = gsap.timeline({ paused: true });
    if (reducedMotion) {
      gsap.set(uiItems, { autoAlpha: 1 });
    } else {
      gsap.set(uiItems, { autoAlpha: 0, y: 22 });
      introTl.to(uiItems, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.9);
      if (cue) introTl.to(cue, { autoAlpha: 1, duration: 0.3 }, 2.2);
    }

    const state = { reveal: reducedMotion ? 1 : 0, scroll: 0 };
    let revealStarted = false;
    const startReveal = () => {
      if (revealStarted) return;
      revealStarted = true;
      introTl.play();
      if (!reducedMotion) gsap.to(state, { reveal: 1, duration: 2.2, ease: 'power2.out', delay: 0.1 });
    };

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: () => '+=' + Math.round(((spacer?.offsetHeight ?? window.innerHeight * 0.6) / 0.6) * 0.95),
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    scrollTl.to(state, { scroll: 1, ease: 'none', duration: 1 }, 0);
    if (uiItems.length) {
      scrollTl.to(uiItems, { autoAlpha: 0, y: -32, ease: 'none', duration: 0.3, stagger: 0.02 }, 0.12);
    }

    // ── WebGL ──
    const attrs: WebGLContextAttributes = {
      antialias: false, alpha: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance',
    };
    let gl: GL | null = null;
    let isGL2 = false;
    try {
      gl = canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null;
      isGL2 = !!gl;
      if (!gl) gl = canvas.getContext('webgl', attrs) as WebGLRenderingContext | null;
    } catch { gl = null; }

    let rafId = 0;
    let running = false;
    // Flipped in cleanup. Strict Mode / HMR re-runs this effect, and a pending
    // document.fonts.load() callback from the first run would otherwise paint
    // into a deleted texture ("bindTexture: attempt to use a deleted object").
    let disposed = false;
    const stopLoop = () => { running = false; cancelAnimationFrame(rafId); };

    const goFallback = () => {
      stopLoop();
      setFallback(true);
      sendLogoReady();
      startReveal();
    };

    if (!gl) {
      goFallback();
      return () => {
        hideCue();
        introTl.kill();
        scrollTl.scrollTrigger?.kill();
        scrollTl.kill();
      };
    }

    // Context loss: NO preventDefault (that asks Chrome to restore and ticks the
    // guilty counter when it can't). Stop and show the static fallback.
    const onLost = () => goFallback();
    canvas.addEventListener('webglcontextlost', onLost);

    if (!isGL2 && !gl.getExtension('OES_standard_derivatives')) {
      canvas.removeEventListener('webglcontextlost', onLost);
      goFallback();
      return () => { hideCue(); introTl.kill(); scrollTl.scrollTrigger?.kill(); scrollTl.kill(); };
    }

    const glc = gl;
    const compile = (type: number, src: string) => {
      const s = glc.createShader(type)!;
      glc.shaderSource(s, src);
      glc.compileShader(s);
      if (!glc.getShaderParameter(s, glc.COMPILE_STATUS)) {
        console.error('[TerrainHero] shader:', glc.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const fragSrc = (isGL2 ? FRAG_HEAD_GL2 : FRAG_HEAD_GL1) + FRAG_BODY;
    const vs = compile(glc.VERTEX_SHADER, isGL2 ? VERT_GL2 : VERT_GL1);
    const fs = compile(glc.FRAGMENT_SHADER, fragSrc);
    const prog = glc.createProgram()!;
    if (!vs || !fs) { goFallback(); return () => { hideCue(); introTl.kill(); scrollTl.kill(); }; }
    glc.attachShader(prog, vs);
    glc.attachShader(prog, fs);
    glc.linkProgram(prog);
    if (!glc.getProgramParameter(prog, glc.LINK_STATUS)) {
      console.error('[TerrainHero] link:', glc.getProgramInfoLog(prog));
      goFallback();
      return () => { hideCue(); introTl.kill(); scrollTl.kill(); };
    }
    glc.useProgram(prog);

    // one triangle covers clip space — no index buffer
    const buf = glc.createBuffer()!;
    glc.bindBuffer(glc.ARRAY_BUFFER, buf);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), glc.STATIC_DRAW);
    const aPos = glc.getAttribLocation(prog, 'position');
    glc.enableVertexAttribArray(aPos);
    glc.vertexAttribPointer(aPos, 2, glc.FLOAT, false, 0, 0);

    const U = {
      res: glc.getUniformLocation(prog, 'uRes'),
      time: glc.getUniformLocation(prog, 'uTime'),
      mouse: glc.getUniformLocation(prog, 'uMouse'),
      amp: glc.getUniformLocation(prog, 'uMouseAmp'),
      reveal: glc.getUniformLocation(prog, 'uReveal'),
      scroll: glc.getUniformLocation(prog, 'uScroll'),
      mask: glc.getUniformLocation(prog, 'uMask'),
      maskOn: glc.getUniformLocation(prog, 'uMaskOn'),
    };

    // ── letter mask texture ──
    const tex = glc.createTexture()!;
    glc.activeTexture(glc.TEXTURE0);
    glc.bindTexture(glc.TEXTURE_2D, tex);
    glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, 1, 1, 0, glc.RGBA, glc.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
    glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    glc.uniform1i(U.mask, 0);
    glc.uniform1f(U.maskOn, 0);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = MASK_W;
    maskCanvas.height = MASK_H;
    const mctx = maskCanvas.getContext('2d');
    const family =
      getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() ||
      'Poppins, sans-serif';

    let w = 1, h = 1;
    const drawMask = () => {
      if (disposed || !mctx || !w || !h) return;
      const pad = padFor(w);
      mctx.setTransform(MASK_W / w, 0, 0, MASK_H / h, 0, 0);
      mctx.fillStyle = '#000';
      mctx.fillRect(0, 0, w, h);
      mctx.fillStyle = '#fff';
      mctx.textBaseline = 'alphabetic';
      mctx.font = `700 100px ${family}`;
      const giftW = mctx.measureText('GIFT').width || 235;
      const maxW = w - pad * 2;
      const target = w < 768 ? maxW * 0.98 : Math.min(maxW * 0.62, 760);
      let size = (100 * target) / giftW;
      size = Math.min(size, (h * 0.46) / (2 * 0.86));
      size = Math.max(size, 56);
      mctx.font = `700 ${size}px ${family}`;
      const top = h * 0.19;
      const lineH = size * 0.86;
      const cap = size * 0.72;
      mctx.fillText('GIFT', pad, top + cap);
      mctx.fillText('INC.', pad, top + lineH + cap);
      applyLayoutVars(pad, size);

      glc.activeTexture(glc.TEXTURE0);
      glc.bindTexture(glc.TEXTURE_2D, tex);
      glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, false);
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGBA, glc.RGBA, glc.UNSIGNED_BYTE, maskCanvas);
      glc.generateMipmap(glc.TEXTURE_2D);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR_MIPMAP_LINEAR);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
      glc.uniform1f(U.maskOn, 1);
    };

    // Wait for the real Poppins before painting (a fallback-font paint followed by
    // a swap would visibly re-shape the letters); 1.5 s cap so a slow font never
    // holds the reveal hostage.
    let maskPainted = false;
    const paintOnce = () => {
      if (disposed || maskPainted) return;
      maskPainted = true;
      drawMask();
      startReveal();
    };
    const fontSpec = `700 100px ${family}`;
    if (typeof document.fonts?.load === 'function') {
      document.fonts.load(fontSpec).then(paintOnce, paintOnce);
    } else {
      paintOnce();
    }
    const fontCap = window.setTimeout(paintOnce, 1500);

    // ── sizing ──
    const dprCap = isMobile ? 1 : 1.25;
    let maskResizeTimer = 0;
    const resize = () => {
      const r = stick.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      glc.viewport(0, 0, canvas.width, canvas.height);
      glc.uniform2f(U.res, canvas.width, canvas.height);
      if (maskPainted) {
        window.clearTimeout(maskResizeTimer);
        maskResizeTimer = window.setTimeout(drawMask, 150);
      }
    };
    resize();
    // Only re-lay-out on WIDTH change or a large height change (mobile URL bar
    // jitter must not re-rasterise the letters mid-scroll).
    let lastW = window.innerWidth, lastH = window.innerHeight;
    const onResize = () => {
      const cw = window.innerWidth, ch = window.innerHeight;
      if (cw === lastW && Math.abs(ch - lastH) < ch * 0.25) return;
      lastW = cw; lastH = ch;
      resize();
    };
    window.addEventListener('resize', onResize);

    // ── pointer / wander ──
    const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55, energy: 0, amp: 0, seen: false };
    let prevX = 0.5, prevY = 0.55;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = 1 - e.clientY / window.innerHeight;
      const dx = nx - prevX, dy = ny - prevY;
      prevX = nx; prevY = ny;
      mouse.tx = nx; mouse.ty = ny; mouse.seen = true;
      mouse.energy = Math.min(1, mouse.energy + Math.hypot(dx, dy) * 14);
    };
    if (!isTouch && !reducedMotion) window.addEventListener('pointermove', onMove, { passive: true });

    // ── render loop (gated on visibility) ──
    let last = 0, elapsed = 0, frames = 0;
    const render = (now: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(render);
      if (!last) last = now;
      if (!reducedMotion) elapsed += Math.min(64, now - last);
      last = now;
      const tSec = elapsed * 0.001;

      let amp: number;
      if (isTouch || reducedMotion) {
        if (!reducedMotion) {
          mouse.tx = 0.5 + 0.32 * Math.sin(tSec * 0.21);
          mouse.ty = 0.55 + 0.22 * Math.cos(tSec * 0.17);
        }
        amp = reducedMotion ? 0 : 0.45;
      } else {
        mouse.energy *= 0.965;
        mouse.amp += (mouse.energy - mouse.amp) * 0.15;
        amp = mouse.seen ? 0.2 + 0.8 * mouse.amp : 0;
      }
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      glc.uniform1f(U.time, tSec);
      glc.uniform2f(U.mouse, mouse.x, mouse.y);
      glc.uniform1f(U.amp, amp);
      glc.uniform1f(U.reveal, state.reveal);
      glc.uniform1f(U.scroll, state.scroll);
      glc.drawArrays(glc.TRIANGLES, 0, 3);

      frames += 1;
      if (frames === 2) sendLogoReady();
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = 0;
      rafId = requestAnimationFrame(render);
    };

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) startLoop(); else stopLoop();
    }, { threshold: 0 });
    io.observe(stick);
    const onVis = () => { if (document.hidden) stopLoop(); else if (onScreen) startLoop(); };
    document.addEventListener('visibilitychange', onVis);
    startLoop();

    // belt-and-braces: never leave the root cover up because a frame never came
    const readyCap = window.setTimeout(sendLogoReady, 2500);

    return () => {
      disposed = true;
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(fontCap);
      window.clearTimeout(readyCap);
      window.clearTimeout(maskResizeTimer);
      hideCue();
      introTl.kill();
      scrollTl.scrollTrigger?.kill();
      scrollTl.kill();
      canvas.removeEventListener('webglcontextlost', onLost);
      glc.deleteTexture(tex);
      glc.deleteBuffer(buf);
      glc.deleteProgram(prog);
      glc.deleteShader(vs);
      glc.deleteShader(fs);
      // never loseContext(): it ticks Chrome's guilty counter (project memory)
    };
  }, []);

  return (
    <div ref={stickRef} className="co-scene__stick">
      <canvas ref={canvasRef} className="co-hero__canvas" aria-hidden />

      <div className="co-hero__fallback" data-active={fallback ? '' : undefined} aria-hidden>
        <div className="co-hero__fb-words" data-hero-ui>
          <span>GIFT</span>
          <span>INC.</span>
        </div>
      </div>

      <div ref={uiRef} className="co-hero__ui">
        <p className="co-hero__eyebrow co-mono" data-hero-ui>About us — 会社概要</p>
        <h1 className="co-hero__title" data-hero-ui>人生が変わるきっかけを、贈る。</h1>
        <p className="co-hero__sub" data-hero-ui>Gift an opportunity.</p>
        <p className="co-hero__meta co-mono" data-hero-ui>Est. 2018 — Sapporo, Japan</p>
        <div ref={cueRef} className="co-hero__cue" aria-hidden><span /></div>
      </div>
    </div>
  );
}
