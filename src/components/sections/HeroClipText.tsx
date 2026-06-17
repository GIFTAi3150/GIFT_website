'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'expo.out';

/* ── Vertex shader — biscom base warp + cursor-local ripple ────────────────── */
const VERT = `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;
  const float freq = 3.0;
  const float amp  = 0.05;
  void main() {
    vUv = uv;
    vec3 pos = vec3(position, 0.0);
    float time = uTime * 0.6;
    pos.y += sin((vUv.x * freq * 0.35) + time) * amp;
    pos.x += sin((vUv.y * freq * 0.30) + time) * amp;
    // cursor-local ripple: tighter frequency, fades with distance to pointer
    float mI = smoothstep(0.42, 0.0, distance(vUv, uMouse));
    pos.x += sin((vUv.y * 7.0) + time * 1.8) * 0.025 * mI;
    pos.y += sin((vUv.x * 7.0) + time * 1.8) * 0.025 * mI;
    gl_Position = vec4(pos, 1.0);
  }
`;

/* ── Fragment shader — biscom's "ev" shader, §1.3 ──────────────────────────── */
const FRAG = `
  precision highp float;
  uniform vec2      uResolution;
  uniform sampler2D uTexture;
  uniform float     uTime;
  uniform float     uProgress;
  uniform float     uLineLength;
  uniform float     uDuration;
  uniform float     uPremultiply;
  uniform float     uShowProgress;
  uniform vec2      uMouse;
  varying vec2      vUv;

  /* 3D simplex noise — biscom's snoiseColor, verbatim */
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

  float random(vec2 st){
    const vec2 k=vec2(12.9898,78.233);
    return fract(sin(dot(st,k))*43758.5453123);
  }
  float random_02(float x){ return fract(sin(x*12.9898)*43758.5453123); }

  vec3 drawNoise(vec2 uv){
    float level=.08;
    float x=uv.x*(10.5*level);
    float y=(uv.y*4.5+uTime)*level;
    float z=uTime*.25;
    return vec3(snoise(vec3(x,y,z)));
  }

  void main(){
    vec2 st=gl_FragCoord.xy/uResolution;

    vec4 tex=texture2D(uTexture,vUv);

    // load reveal: flat grey 0.73 -> image
    tex.rgb=mix(vec3(0.73),tex.rgb,uShowProgress);

    // fine grain — slow drift gives organic film-texture feel (biscom bakes this into their AVIFs)
    float rnd=random(st+(uTime*.0003));
    rnd=(smoothstep(0.,1.,rnd)-.5)*.5;
    vec3 noisy=vec3(rnd);

    // slow simplex brightness gradient — raised floor to +.32 keeps the field light & airy
    vec3 gradient=drawNoise(st)*.32;
    gradient=smoothstep(-1.4,1.4,gradient)+.32;
    gradient-=noisy*.14;
    tex.rgb*=gradient;

    // soft light that trails the cursor (aspect-corrected; dies as the wipe runs)
    float aspect=uResolution.x/uResolution.y;
    float mDist=distance(vec2(st.x*aspect,st.y),vec2(uMouse.x*aspect,uMouse.y));
    tex.rgb+=smoothstep(0.5,0.0,mDist)*.05*(1.0-uProgress);

    // scroll-out column wipe: uLineLength columns, random per-column delay, bottom-up
    float colIndex=floor(st.x*uLineLength);
    float r       =random_02(colIndex);
    float delay   =r*(1.-uDuration);
    float maskHeight=clamp((uProgress-delay)/uDuration,0.,1.)*2.;
    float edgeWidth =0.38;
    float mask =smoothstep(maskHeight-edgeWidth,maskHeight,st.y);
    float alpha=mask;

    // brighten as it wipes out
    tex.rgb+=uProgress*.8;

    // Safari premultiply toggle
    vec3 outRgb=mix(tex.rgb,tex.rgb*alpha,clamp(uPremultiply,0.0,1.0));
    gl_FragColor=vec4(outRgb,alpha);
  }
`;

/* ── Phase E: letterVideoSrc prop (wiring only — dark-multiply stays default) ─ */
interface HeroClipTextProps {
  letterVideoSrc?: string;
}

export default function HeroClipText({ letterVideoSrc: _letterVideoSrc }: HeroClipTextProps) {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const giftRef      = useRef<SVGTextElement>(null);
  const incRef       = useRef<SVGTextElement>(null);
  const clipGiftRef  = useRef<SVGTextElement>(null);
  const clipIncRef   = useRef<SVGTextElement>(null);
  const lettersRef   = useRef<HTMLDivElement>(null);
  const descRef      = useRef<HTMLDivElement>(null);
  const leakRef      = useRef<HTMLImageElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const metaRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
      antialias: false, alpha: true, premultipliedAlpha: false,
    });
    if (!gl) { window.dispatchEvent(new Event('gift:logo-ready')); return; }

    /* ── context-loss guard (project pattern — must not be removed) ──── */
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(rafRef.current); };
    canvas.addEventListener('webglcontextlost', onLost, true);

    /* ── compile + LINK_STATUS check ────────────────────────────────── */
    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[Hero] shader compile:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[Hero] program link:', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.clearColor(0, 0, 0, 1);

    /* ── 20×40-segment indexed grid spanning −1..1 ───────────────────── */
    const COLS = 20, ROWS = 40;
    const vCount = (COLS + 1) * (ROWS + 1);
    const verts = new Float32Array(vCount * 4); // x, y, u, v
    let vi = 0;
    for (let row = 0; row <= ROWS; row++) {
      for (let col = 0; col <= COLS; col++) {
        const u = col / COLS;
        const v = row / ROWS;
        verts[vi++] = u * 2.0 - 1.0; // x: −1..1
        verts[vi++] = v * 2.0 - 1.0; // y: −1..1
        verts[vi++] = u;
        verts[vi++] = v;
      }
    }
    const idxCount = COLS * ROWS * 6;
    const indices = new Uint16Array(idxCount);
    let ii = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tl = row * (COLS + 1) + col;
        const tr = tl + 1;
        const bl = tl + (COLS + 1);
        const br = bl + 1;
        indices[ii++] = tl; indices[ii++] = bl; indices[ii++] = tr;
        indices[ii++] = tr; indices[ii++] = bl; indices[ii++] = br;
      }
    }
    const posBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const idxBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'position');
    const aUv  = gl.getAttribLocation(prog, 'uv');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    /* ── texture ─────────────────────────────────────────────────────── */
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 1×1 grey placeholder until hero-field.webp loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE,
      new Uint8Array([186, 186, 186]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(prog, 'uTexture'), 0);

    const img = new Image();
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.src = '/company/hero-field.webp';

    /* ── uniforms ────────────────────────────────────────────────────── */
    const uTime    = gl.getUniformLocation(prog, 'uTime');
    const uRes     = gl.getUniformLocation(prog, 'uResolution');
    const uProg    = gl.getUniformLocation(prog, 'uProgress');
    const uLineLen = gl.getUniformLocation(prog, 'uLineLength');
    const uDur     = gl.getUniformLocation(prog, 'uDuration');
    const uPremul  = gl.getUniformLocation(prog, 'uPremultiply');
    const uShow    = gl.getUniformLocation(prog, 'uShowProgress');
    const uMouse   = gl.getUniformLocation(prog, 'uMouse');

    gl.uniform1f(uLineLen, isMobile ? 6.0 : 8.0);
    gl.uniform1f(uDur,     isMobile ? 0.85 : 0.72);
    gl.uniform1f(uPremul,  isSafari ? 1.0 : 0.0);
    gl.uniform1f(uShow,    0.0);
    gl.uniform1f(uProg,    0.0);
    gl.uniform2f(uMouse,   0.5, 0.55);

    /* ── mutable render state (GSAP writes, render loop reads) ──────── */
    const state = { progress: 0, showProgress: 0 };

    /* ── pointer → lerped uMouse (uv space, v up) ─────────────────────── */
    const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55 };
    const onPointerMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    if (!isMobile && !reducedMotion)
      window.addEventListener('pointermove', onPointerMove, { passive: true });

    /* ── sizing ──────────────────────────────────────────────────────── */
    let w = 0, h = 0;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      canvas.width  = Math.round(w * 1.1 * dpr);
      canvas.height = Math.round(h * 1.1 * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      layout();
    };

    /* ── letterform layout (measured from live SVG text metrics) ──────── */
    const layout = () => {
      const svg = svgRef.current, g = giftRef.current, ic = incRef.current;
      if (!svg || !g || !ic || !w) return;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      g.setAttribute('font-size', '100');
      const giftAt100 = g.getComputedTextLength() || 240;
      const byWidth   = 100 * ((w * 0.78) / giftAt100);
      const byHeight  = (h * 0.64) / 2.25;
      const fsGift    = Math.min(byWidth, byHeight);

      ic.setAttribute('font-size', '100');
      const incAt100  = ic.getComputedTextLength() || giftAt100;
      const fsInc     = fsGift * (giftAt100 / incAt100);

      const x      = w * 0.5;
      const lineH  = fsGift * 1.04;
      const totalH = lineH + fsInc * 1.02;
      const yGift  = (h - totalH) * 0.28 + fsGift;
      const yInc   = yGift + lineH;

      g.setAttribute('x',  `${x}`); g.setAttribute('y',  `${yGift}`);
      g.setAttribute('font-size', `${fsGift}`);
      ic.setAttribute('x', `${x}`); ic.setAttribute('y', `${yInc}`);
      ic.setAttribute('font-size', `${fsInc}`);

      // Mirror positions to the clip-path text elements
      if (clipGiftRef.current) {
        clipGiftRef.current.setAttribute('x', `${x}`);
        clipGiftRef.current.setAttribute('y', `${yGift}`);
        clipGiftRef.current.setAttribute('font-size', `${fsGift}`);
      }
      if (clipIncRef.current) {
        clipIncRef.current.setAttribute('x', `${x}`);
        clipIncRef.current.setAttribute('y', `${yInc}`);
        clipIncRef.current.setAttribute('font-size', `${fsInc}`);
      }

      if (descRef.current) {
        const gap = Math.max(h * 0.04, 24);
        descRef.current.style.top    = `${Math.round(yInc + gap)}px`;
        descRef.current.style.bottom = 'auto';
      }
    };

    /* ── render loop — rAF-gated on visibility + intersection ─────────── */
    let running = false;
    let last = 0, elapsed = 0;
    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!last) last = now;
      // Freeze shader time for prefers-reduced-motion
      if (!reducedMotion) elapsed += now - last;
      last = now;
      const t = Math.floor(elapsed * 0.001 * 100) / 100; // quantize to 0.01 s (biscom)
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uProg, state.progress);
      gl.uniform1f(uShow, state.showProgress);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idxCount, gl.UNSIGNED_SHORT, 0);
    };
    const startLoop = () => {
      if (running) return;
      running = true; last = 0;
      rafRef.current = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    /* ── IntersectionObserver + visibilitychange gating (keep) ─────────── */
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !document.hidden) startLoop(); else stopLoop();
    }, { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (onScreen) startLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* ── boot ────────────────────────────────────────────────────────── */
    resize();
    startLoop();
    document.fonts.ready.then(layout).catch(() => {});

    /* ── Phase C — load sequence ──────────────────────────────────────── */
    const loadTl = gsap.timeline({ delay: 0.05 });

    if (reducedMotion) {
      // Skip intro; set end states immediately, keep field static
      state.showProgress = 1;
      if (overlayRef.current)  gsap.set(overlayRef.current,  { autoAlpha: 0 });
      if (lettersRef.current)  gsap.set(lettersRef.current,  { clipPath: 'inset(0 0% 0 0)' });
      if (descRef.current)     gsap.set(descRef.current,     { autoAlpha: 1, y: 0 });
      if (scrollRef.current)   gsap.set(scrollRef.current,   { autoAlpha: 1 });
      if (leakRef.current)     gsap.set(leakRef.current,     { autoAlpha: 1, x: 0, y: 0, rotate: 0 });
      if (metaRef.current)     gsap.set(metaRef.current,     { autoAlpha: 1 });
    } else {
      // 1. Grey overlay fade out + uShowProgress grey→texture in parallel
      if (overlayRef.current)
        loadTl.to(overlayRef.current, { autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, 0.2);
      loadTl.to(state, { showProgress: 1, duration: 0.8, ease: 'power1.in' }, 0.2);

      // 2. Letters left→right clip-path wipe + tracking settles wide→tight
      if (lettersRef.current) {
        gsap.set(lettersRef.current, { clipPath: 'inset(0 100% 0 0)' });
        loadTl.to(lettersRef.current, {
          clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: EASE,
        }, 0.45);
      }
      if (giftRef.current && incRef.current) {
        loadTl.fromTo([giftRef.current, incRef.current],
          { letterSpacing: '0.12em' },
          { letterSpacing: '0em', duration: 1.7, ease: EASE }, 0.45);
      }

      // 3. Description rise (y 25→0, 1.2s, quart.out — biscom §1.4 step 4)
      if (descRef.current) {
        gsap.set(descRef.current, { y: 25, autoAlpha: 0 });
        loadTl.to(descRef.current, { y: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }, 1.0);
      }

      // 4. Orange leak fly-in from upper-right (biscom §1.4 step 6)
      if (leakRef.current) {
        gsap.set(leakRef.current, { x: '15vw', y: '30vh', rotate: 18, autoAlpha: 0 });
        loadTl.to(leakRef.current, {
          x: 0, y: 0, rotate: 0, autoAlpha: 1, duration: 1.6, ease: 'power1.out',
        }, 1.0);
      }

      // 5. Scroll cue
      if (scrollRef.current) {
        gsap.set(scrollRef.current, { autoAlpha: 0 });
        loadTl.to(scrollRef.current, { autoAlpha: 1, duration: 0.2 }, 1.5);
      }

      // 6. Editorial frame + corner meta — staggered fade after letters land
      if (metaRef.current) {
        const items = Array.from(metaRef.current.children);
        gsap.set(items, { autoAlpha: 0 });
        loadTl.to(items, {
          autoAlpha: 1, duration: 1.1, ease: 'power2.out', stagger: 0.14,
        }, 1.2);
      }
    }

    window.dispatchEvent(new Event('gift:logo-ready'));
    window.addEventListener('resize', resize);

    /* ── Phase D — scroll-out over 130svh sticky range (30svh wipe range) ── */
    let scrollTl: gsap.core.Timeline | null = null;
    const wrapperEl = wrapperRef.current;
    if (wrapperEl) {
      scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onLeave: () => stopLoop(),
          onEnterBack: () => startLoop(),
        },
      });

      // uProgress 0→1 (drives column wipe in fragment shader)
      scrollTl.to(state, { progress: 1, ease: 'none', duration: 1 }, 0);

      // Logo parallax + fade-out at ~33% scroll
      if (lettersRef.current) {
        scrollTl.fromTo(lettersRef.current, { y: 0 },
          { y: '-85svh', ease: 'none', duration: 1 }, 0);
        scrollTl.to(lettersRef.current, { autoAlpha: 0, ease: 'none', duration: 0.05 }, 0.33);
      }
      if (descRef.current) {
        scrollTl.fromTo(descRef.current, { y: 0 },
          { y: '-80svh', ease: 'none', duration: 1 }, 0);
        scrollTl.to(descRef.current, { autoAlpha: 0, ease: 'none', duration: 0.05 }, 0.33);
      }

      // Orange leak flies away
      if (leakRef.current) {
        scrollTl.to(leakRef.current, {
          y: -600, x: -450, rotate: -20, autoAlpha: 0, ease: 'none', duration: 0.7,
        }, 0.1);
      }

      // Scroll cue fades out the instant scrolling begins — otherwise the line
      // stays at full opacity and floats over the CEO message the column-wipe
      // reveals behind the (transparent, pointer-events-none) hero.
      if (scrollRef.current) {
        scrollTl.to(scrollRef.current, { autoAlpha: 0, ease: 'none', duration: 0.06 }, 0);
      }

      // Frame + corner meta fade out with the cue — same reason: the hero layer
      // is a transparent overlay during the wipe, these must not float over the
      // revealed content.
      if (metaRef.current) {
        scrollTl.to(metaRef.current, { autoAlpha: 0, ease: 'none', duration: 0.06 }, 0);
      }
    }

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onLost, true);
      loadTl.kill();
      if (scrollTl) { scrollTl.scrollTrigger?.kill(); scrollTl.kill(); }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        height: '170svh',        // sole "wipe length" knob (wipe runs over height − 100svh). tunable.
        position: 'relative',
        zIndex: 10,              // hero sits ABOVE the following content so the wipe reveals it
        pointerEvents: 'none',   // hero is purely visual — never block clicks on the revealed content behind
      }}
    >
      <section
        aria-label="Hero"
        style={{
          position: 'sticky', top: 0,
          width: '100%',
          height: '100dvh',       // full DYNAMIC viewport: 100svh under-fills once the mobile URL bar collapses, exposing the pulled-up section behind
          background: 'transparent',
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {/* Layer 0 — WebGL field: oversized 110% so base warp + cursor ripple never expose edges */}
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: 'absolute',
            top: '-5dvh', left: '-5vw',
            width: '110vw', height: '110dvh',   // tracks the dvh section so the field still over-covers (5dvh bleed) at every URL-bar state
            zIndex: 0, pointerEvents: 'none',
          }}
        />

        {/* Grey load-cover (autoAlpha 0 after Phase C overlay fade) */}
        <div
          ref={overlayRef}
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: '#bbbbbb',
            zIndex: 10, pointerEvents: 'none',
          }}
        />

        {/* SVG clip-path definition — zero-size, never painted, referenced by video below */}
        <svg
          aria-hidden
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
          <defs>
            <clipPath id="gift-text-clip" clipPathUnits="userSpaceOnUse">
              <text
                ref={clipGiftRef}
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 } as React.CSSProperties}
              >GIFT</text>
              <text
                ref={clipIncRef}
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 } as React.CSSProperties}
              >INC.</text>
            </clipPath>
          </defs>
        </svg>

        {/* Layer 1 — GIFT / INC. letterforms: iridescent video through SVG clip-path */}
        <div
          ref={lettersRef}
          aria-hidden
          style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        >
          {/* Iridescent texture video clipped to the letter shapes */}
          <video
            autoPlay loop muted playsInline
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              clipPath: 'url(#gift-text-clip)',
              pointerEvents: 'none',
            }}
          >
            <source src="/company/hero-iridescent-loop.webm" type="video/webm" />
            <source src="/company/hero-iridescent-loop.mp4"  type="video/mp4" />
          </video>

          {/* Invisible SVG — font-metric measurement only (getComputedTextLength + GSAP letter-spacing) */}
          <svg
            ref={svgRef}
            width="100%" height="100%"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 0, pointerEvents: 'none' }}
          >
            <text
              ref={giftRef}
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 } as React.CSSProperties}
            >GIFT</text>
            <text
              ref={incRef}
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 } as React.CSSProperties}
            >INC.</text>
          </svg>
        </div>

        {/* Layer 2 — JP description */}
        <div
          ref={descRef}
          style={{
            position: 'absolute', left: 0, right: 0, top: '74svh',
            zIndex: 2, textAlign: 'center', padding: '0 6vw',
          }}
        >
          <p style={{
            margin: 0,
            color: '#1d1d1d',
            fontFamily: 'var(--font-shippori), var(--font-noto-jp), serif',
            fontSize: 'clamp(13px, 1.15vw, 19px)',
            lineHeight: 2.1,
            letterSpacing: '0.02em',
          }}>
            AIと人が共に創る、ビジネスの新時代。<br />
            GIFTは、その出会いを贈り続けます。
          </p>
        </div>

        {/* Layer 3 — orange light-leak blade (hard-light, upper-right, DOM img) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={leakRef}
          src="/company/hero-leak.webp"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: '-5vw', top: '-5svh',
            width: '68vw',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            zIndex: 4,
            opacity: 0,
          }}
        />

        {/* Layer 5 — editorial hairline frame + corner meta (each child staggers in) */}
        <div
          ref={metaRef}
          aria-hidden
          style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
        >
          {/* hairline frame */}
          <div
            style={{
              position: 'absolute',
              inset: 'clamp(16px, 2.2vw, 30px)',
              border: '1px solid rgba(29,29,29,0.13)',
            }}
          />
          {/* vertical JP mission — left edge */}
          <p
            className="hidden md:block"
            style={{
              position: 'absolute',
              left: 'clamp(34px, 4vw, 56px)',
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0,
              writingMode: 'vertical-rl',
              fontFamily: 'var(--font-shippori), var(--font-noto-jp), serif',
              fontSize: 12,
              letterSpacing: '0.42em',
              color: 'rgba(29,29,29,0.55)',
            }}
          >
            人生が変わるきっかけを、贈る。
          </p>
          {/* bottom-left caption */}
          <p
            style={{
              position: 'absolute',
              left: 'clamp(34px, 4vw, 56px)',
              bottom: 'clamp(30px, 4svh, 48px)',
              margin: 0,
              fontFamily: 'var(--font-forum), serif',
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(29,29,29,0.5)',
            }}
          >
            Est. 2018 — Sapporo, Japan
          </p>
        </div>

        {/* Scroll cue */}
        <div
          ref={scrollRef}
          style={{
            position: 'absolute', bottom: 'clamp(24px, 5vh, 44px)', left: '50%',
            transform: 'translateX(-50%)', zIndex: 3,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}
        >
          <div style={{
            width: 1, height: 'min(120px, 11svh)', overflow: 'hidden', position: 'relative',
          }}>
            <span style={{
              position: 'absolute', inset: 0, background: '#1d1d1d',
              animation: 'heroLineLoop 3s cubic-bezier(.65,0,.35,1) infinite',
            }} />
          </div>
        </div>

        <style>{`
          @keyframes heroLineLoop {
            0%   { transform: translateY(-100%); }
            50%  { transform: translateY(0%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </section>
    </div>
  );
}
