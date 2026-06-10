'use client';

/**
 * HeroClipText — faithful port of the biscom.jp/10th hero ("top-visual").
 *
 * Reference anatomy (reverse-engineered from their OGL + GSAP source):
 *  - A full-screen, softly-warping, grainy near-white WebGL field. One plane,
 *    sine-wave vertex warp + animated 3D simplex-noise gradient + value-noise
 *    grain, revealed on load via a 10-column wipe (each column random-delayed).
 *  - The headline letterforms are filled with that same field (Biscom pipes a
 *    video through an SVG clip-path; we pipe the live field through the letters
 *    via an SVG text-mask + multiply blend so the letters read as dark, moving
 *    glass against the pale field).
 *  - Centered JP description set in their mincho stack (Shippori Antique B1).
 *
 * Their exact GLSL helpers (snoiseColor / random / drawNoise) and constants
 * (freq 3, amp .05, time*.6, grey 0.73 base, 10-column wipe, easeOutQuint) are
 * reproduced verbatim below.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* Biscom's signature easing: cubic-bezier(.25,1,.5,1) === GSAP expo.out-ish */
const EASE = 'expo.out';

const VERT = `
  precision highp float; // must match the fragment shader so shared uniforms (uTime) link
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform float uTime;

  // Gentle 2-axis sine warp — the field "breathes" (Biscom: freq 3, amp .05).
  const float freq = 3.0;
  const float amp  = 0.05;

  void main() {
    vUv = uv;
    vec3 pos = vec3(position, 0.0);
    float time = uTime * 0.6;
    pos.y += sin((vUv.x * freq * 0.35) + time) * amp;
    pos.x += sin((vUv.y * freq * 0.30) + time) * amp;
    gl_Position = vec4(pos, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uProgress;     // 0..1 column-wipe reveal
  uniform float uLineLength;   // column count (10)
  uniform float uDuration;     // per-column fade window (0.6)
  uniform float uShowProgress; // neutral -> field fade (load)
  varying vec2  vUv;

  /* ── value noise ─────────────────────────────────────────────────── */
  float hash (vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float random_02 (float x){ return fract(sin(x*12.9898)*43758.5453123); }

  /* ── 3D simplex noise (Biscom's snoiseColor, verbatim) ───────────── */
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
              i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
              i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  vec2 rot(vec2 p, float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c)*p; }

  // vivid spectral ramp, x:0..1 -> red..yellow..green..cyan..blue..violet
  vec3 spectrum(float x){
    x = fract(x);
    return clamp(vec3(1.7 - abs(4.0*x - 3.0),
                      1.7 - abs(4.0*x - 2.0),
                      1.7 - abs(4.0*x - 1.0)), 0.0, 1.0);
  }

  const float ANG = -0.62;  // streak direction (~ -35deg)

  // smooth, long, mostly-straight caustic field (stretched -> long streaks)
  float field(vec2 uv, float t){
    vec2 p = rot(uv, ANG);
    p.x *= 0.13;
    float f = snoise(vec3(p*2.6, t*0.07));
    f += 0.32*snoise(vec3(p*5.0 + 5.0, t*0.05));
    return f;
  }
  // caustic bands with a thin edge so a small dispersion offset spans it
  float caustic(vec2 uv, float t){
    return smoothstep(0.250, 0.330, field(uv, t));
  }

  void main(){
    vec2 st = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = vUv;
    float t = uTime;

    // ── paper base: saturated pale cyan-teal ─────────────────────────────
    float big = snoise(vec3(uv*1.3, t*0.05));
    vec3 paper = vec3(0.61, 0.795, 0.855) * (0.93 + 0.09*big);

    // ── soft, broad diagonal shadow band (teal, like window light) ───────
    vec2 q = rot(uv, ANG + 0.03);
    float sA = (q.x + 0.06*snoise(vec3(uv*1.1, 0.0)))*1.7;
    float bandA = smoothstep(0.26, 0.5, abs(fract(sA)-0.5));
    float shade = (1.0-bandA) * (0.5 + 0.5*snoise(vec3(uv*0.8+10.0, t*0.05)));
    paper -= clamp(shade, 0.0, 1.0)*vec3(0.085, 0.072, 0.05);

    // ── prismatic dispersion: multi-tap spectral chromatic aberration ────
    // sample the caustic band at offsets across it, each weighted by a
    // spectral colour -> white cores, thin smooth rainbow piping at edges.
    vec3 disp = vec3(0.0);
    vec3 wsum = vec3(0.0);
    for (int i = 0; i < 7; i++) {
      float fi = float(i) / 6.0;
      vec3  sc = spectrum(fi);
      vec2  off = rot(vec2(0.0, (fi - 0.5) * 0.026), ANG);
      float s  = caustic(uv + off, t);
      disp += s * sc;
      wsum += sc;
    }
    disp /= wsum;
    float white  = min(min(disp.r, disp.g), disp.b);
    vec3  chroma = disp - white;
    float swath  = smoothstep(0.60, 0.0, abs(q.x - 0.26));
    float ulBlob = smoothstep(1.05, 0.0, length(vec2((uv.x-0.22)*aspect, uv.y-0.80)));
    float region = clamp(swath*0.9 + ulBlob*0.5, 0.0, 1.0);
    region *= 0.5 + 0.5*snoise(vec3(uv*1.5+30.0, t*0.06));
    region = clamp(region, 0.0, 1.0);
    float cmag = (chroma.r + chroma.g + chroma.b) * region;
    paper *= 1.0 - 0.62*cmag;
    paper += vec3(white) * region * 0.34;
    paper += chroma * region * 3.7;

    // ── warm orange light-leak, upper-right (biscom's blur-effect blade) ──
    // a bold diagonal blade spilling from the top-right corner + broad glow
    vec2 wp = rot(vec2((uv.x-0.98)*aspect, uv.y-0.90), -0.5);
    float blade = pow(smoothstep(0.72, 0.0, length(wp*vec2(0.42, 1.45))), 1.15);
    vec3 orange = mix(vec3(1.0,0.24,0.03), vec3(1.0,0.55,0.12), clamp(uv.y*1.05-0.05, 0.0, 1.0));
    paper = mix(paper, orange, clamp(blade*0.92, 0.0, 1.0));      // leak dominates where strong
    float glow = smoothstep(0.95, 0.0, length(vec2((uv.x-1.02)*aspect, uv.y-0.92)));
    paper += vec3(1.0, 0.42, 0.12) * glow * 0.30;                  // broad warm corner glow
    float warm2 = smoothstep(0.30, 0.0, length(vec2((uv.x-0.66)*aspect, uv.y+0.0)));
    paper += vec3(1.0, 0.45, 0.16)*warm2*0.14;

    // ── fine paper grain (reads at native res) ───────────────────────────
    float gA = hash(gl_FragCoord.xy + floor(t*8.0)*13.0);
    paper += (gA-0.5)*0.10;
    float gB = hash(gl_FragCoord.xy*0.5 + 7.0);
    paper += (gB-0.5)*0.07;

    // ── load reveal: neutral -> field, then 10-column wipe ───────────────
    vec3 loadCol = vec3(0.74, 0.80, 0.83);
    paper = mix(loadCol, paper, uShowProgress);
    float colIndex = floor(st.x * uLineLength);
    float rr       = random_02(colIndex);
    float a        = clamp((uProgress - rr * (1.0 - uDuration)) / uDuration, 0.0, 1.0);
    paper = mix(loadCol, paper, a);

    gl_FragColor = vec4(clamp(paper, 0.0, 1.0), 1.0);
  }
`;

export default function HeroClipText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const giftRef   = useRef<SVGTextElement>(null);
  const incRef    = useRef<SVGTextElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const descRef   = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: true, alpha: false, premultipliedAlpha: false,
    });
    if (!gl) { window.dispatchEvent(new Event('gift:logo-ready')); return; }

    /* ── context-loss guard (project pattern) ─────────────────────────── */
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(rafRef.current); };
    canvas.addEventListener('webglcontextlost', onLost, true);

    /* ── compile ──────────────────────────────────────────────────────── */
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[Hero] shader compile error:', gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[Hero] program link error:', gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);
    // Light clear so the canvas can never present as opaque black if a draw
    // is skipped for any reason.
    gl.clearColor(0.96, 0.96, 0.96, 1);

    // Full-screen quad, oversized to 1.06 so the warp never exposes an edge.
    const S = 1.06;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // position(x,y)   uv(x,y)
      -S, -S, 0, 0,
       S, -S, 1, 0,
      -S,  S, 0, 1,
       S,  S, 1, 1,
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'position');
    const aUv  = gl.getAttribLocation(prog, 'uv');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    const uTime    = gl.getUniformLocation(prog, 'uTime');
    const uRes     = gl.getUniformLocation(prog, 'uResolution');
    const uProg    = gl.getUniformLocation(prog, 'uProgress');
    const uLineLen = gl.getUniformLocation(prog, 'uLineLength');
    const uDur     = gl.getUniformLocation(prog, 'uDuration');
    const uShow    = gl.getUniformLocation(prog, 'uShowProgress');
    gl.uniform1f(uLineLen, 10.0);
    gl.uniform1f(uDur, 0.6);
    gl.uniform1f(uShow, 1.0);

    /* ── GSAP-driven reveal state ─────────────────────────────────────── */
    const state = { progress: 0 };

    /* ── sizing: canvas buffer ────────────────────────────────────────── */
    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      // Cap at 1.0 — the dispersion shader is fill-rate heavy and the grain
      // field reads identically at 1× vs 1.35× on Retina.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      // canvas is CSS-oversized 106%; match its buffer
      canvas.width  = Math.round(w * 1.06 * dpr);
      canvas.height = Math.round(h * 1.06 * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      layout();
    };

    /* ── letterform layout (measured from the REAL rendered SVG text, so
       it works with next/font's hashed family name behind --font-forum) ── */
    const layout = () => {
      const svg = svgRef.current, g = giftRef.current, ic = incRef.current;
      if (!svg || !g || !ic || !w) return;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      // "GIFT" spans ~72% of width, capped so two lines fit in ~70% height.
      g.setAttribute('font-size', '100');
      const giftAt100 = g.getComputedTextLength() || 240;
      const byWidth  = 100 * ((w * 0.72) / giftAt100);
      const byHeight = (h * 0.60) / 2.25;
      const fsGift   = Math.min(byWidth, byHeight);

      ic.setAttribute('font-size', '100');
      const incAt100 = ic.getComputedTextLength() || giftAt100;
      // scale INC. so its width matches GIFT's width at fsGift
      const fsInc = fsGift * (giftAt100 / incAt100);

      const x      = w * 0.5;            // centered
      const lineH  = fsGift * 1.04;
      const totalH = lineH + fsInc * 1.02;
      const yGift  = (h - totalH) * 0.28 + fsGift;
      const yInc   = yGift + lineH;

      g.setAttribute('x', `${x}`);  g.setAttribute('y', `${yGift}`);
      g.setAttribute('font-size', `${fsGift}`);
      ic.setAttribute('x', `${x}`); ic.setAttribute('y', `${yInc}`);
      ic.setAttribute('font-size', `${fsInc}`);

      // Pin description below INC. baseline so it never overlaps the letterforms
      if (descRef.current) {
        const gap = Math.max(h * 0.04, 24);
        descRef.current.style.top = `${Math.round(yInc + gap)}px`;
        descRef.current.style.bottom = 'auto';
      }
    };

    /* ── render loop ──────────────────────────────────────────────────────
       The dispersion shader is expensive; running it while the hero is
       scrolled out of view (or the tab is hidden) steals frame budget from
       the rest of the page and makes scrolling feel clunky. We gate the loop
       on visibility and freeze shader-time while paused so resume is seamless
       (no visual pop). */
    let running = false;
    let last = 0;
    let elapsed = 0; // accumulated shader-time in ms (frozen while paused)
    let frameCount = 0;
    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      // Time always advances so there's no jump when throttle lifts
      if (!last) last = now;
      elapsed += now - last;
      last = now;
      // During the column-wipe reveal (~1.4s) render at 30fps — the wipe is
      // slow enough that every-other-frame is indistinguishable, and it cuts
      // GPU load in half at the moment the page is most resource-constrained.
      frameCount++;
      if (state.progress < 0.99 && frameCount % 2 !== 0) return;
      gl.uniform1f(uTime, elapsed * 0.001);
      gl.uniform1f(uProg, state.progress);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      last = 0; // reset delta baseline so paused time isn't counted
      rafRef.current = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    let onScreen = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !document.hidden) startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (onScreen) startLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* ── boot: render immediately; re-fit text once Forum loads ───────── */
    {
      resize();
      startLoop();
      // Forum metrics differ from the serif fallback — re-fit when it lands.
      document.fonts.ready.then(layout).catch(() => {});

      const tl = gsap.timeline({ delay: 0.05 });
      // 1) column wipe of the field
      tl.to(state, { progress: 1, duration: 1.4, ease: 'power2.inOut' }, 0);
      // 2) letters wipe in left->right, in sync with the field
      if (lettersRef.current) {
        gsap.set(lettersRef.current, { clipPath: 'inset(0 100% 0 0)' });
        tl.to(lettersRef.current, {
          clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: EASE,
        }, 0.45);
      }
      // 3) description + scroll cue
      if (descRef.current) {
        gsap.set(descRef.current, { y: 22, autoAlpha: 0 });
        tl.to(descRef.current, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, 1.0);
      }
      if (scrollRef.current) {
        gsap.set(scrollRef.current, { autoAlpha: 0 });
        tl.to(scrollRef.current, { autoAlpha: 1, duration: 0.7 }, 1.25);
      }

      window.dispatchEvent(new Event('gift:logo-ready'));
    }

    window.addEventListener('resize', resize);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onLost, true);
    };
  }, []);

  return (
    <section
      aria-label="Hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Layer 0 — warping, grainy near-white WebGL field (oversized 106%) */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'absolute',
          top: '-3svh', left: '-3vw',
          width: '106vw', height: '106svh',
          zIndex: 0, pointerEvents: 'none',
        }}
      />

      {/* Layer 1 — GIFT / INC. in Forum, the field shows through them.
          multiply blend => letters read as dark, breathing glass on the field. */}
      <div
        ref={lettersRef}
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          mixBlendMode: 'multiply', pointerEvents: 'none',
        }}
      >
        <svg
          ref={svgRef}
          width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0 }}
        >
          <text
            ref={giftRef}
            textAnchor="middle"
            fill="#3a3530"
            style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 }}
          >
            GIFT
          </text>
          <text
            ref={incRef}
            textAnchor="middle"
            fill="#3a3530"
            style={{ fontFamily: 'var(--font-forum), serif', fontWeight: 400 }}
          >
            INC.
          </text>
        </svg>
      </div>

      {/* Layer 2 — JP description in Shippori Antique B1 (their mincho) */}
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
  );
}
