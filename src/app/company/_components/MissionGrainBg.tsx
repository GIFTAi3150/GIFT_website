'use client';

import { useEffect, useRef } from 'react';

/* Exact same shaders as HeroClipText — reveal uniforms frozen at final state
   so the field is always fully visible with no entrance wipe animation. */

const VERT = `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform float uTime;

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
  varying vec2  vUv;

  float hash (vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }

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

  vec3 spectrum(float x){
    x = fract(x);
    return clamp(vec3(1.7 - abs(4.0*x - 3.0),
                      1.7 - abs(4.0*x - 2.0),
                      1.7 - abs(4.0*x - 1.0)), 0.0, 1.0);
  }

  const float ANG = -0.62;

  float field(vec2 uv, float t){
    vec2 p = rot(uv, ANG);
    p.x *= 0.13;
    float f = snoise(vec3(p*2.6, t*0.07));
    f += 0.32*snoise(vec3(p*5.0 + 5.0, t*0.05));
    return f;
  }
  float caustic(vec2 uv, float t){
    return smoothstep(0.250, 0.330, field(uv, t));
  }

  void main(){
    vec2 uv = vUv;
    float t = uTime;

    float big = snoise(vec3(uv*1.3, t*0.05));
    vec3 paper = vec3(0.61, 0.795, 0.855) * (0.93 + 0.09*big);

    vec2 q = rot(uv, ANG + 0.03);
    float sA = (q.x + 0.06*snoise(vec3(uv*1.1, 0.0)))*1.7;
    float bandA = smoothstep(0.26, 0.5, abs(fract(sA)-0.5));
    float shade = (1.0-bandA) * (0.5 + 0.5*snoise(vec3(uv*0.8+10.0, t*0.05)));
    paper -= clamp(shade, 0.0, 1.0)*vec3(0.085, 0.072, 0.05);

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
    float aspect = uResolution.x / uResolution.y;
    float ulBlob = smoothstep(1.05, 0.0, length(vec2((uv.x-0.22)*aspect, uv.y-0.80)));
    float region = clamp(swath*0.9 + ulBlob*0.5, 0.0, 1.0);
    region *= 0.5 + 0.5*snoise(vec3(uv*1.5+30.0, t*0.06));
    region = clamp(region, 0.0, 1.0);
    float cmag = (chroma.r + chroma.g + chroma.b) * region;
    paper *= 1.0 - 0.62*cmag;
    paper += vec3(white) * region * 0.34;
    paper += chroma * region * 3.7;

    vec2 wp = rot(vec2((uv.x-0.98)*aspect, uv.y-0.90), -0.5);
    float blade = pow(smoothstep(0.72, 0.0, length(wp*vec2(0.42, 1.45))), 1.15);
    vec3 orange = mix(vec3(1.0,0.24,0.03), vec3(1.0,0.55,0.12), clamp(uv.y*1.05-0.05, 0.0, 1.0));
    paper = mix(paper, orange, clamp(blade*0.92, 0.0, 1.0));
    float glow = smoothstep(0.95, 0.0, length(vec2((uv.x-1.02)*aspect, uv.y-0.92)));
    paper += vec3(1.0, 0.42, 0.12) * glow * 0.30;
    float warm2 = smoothstep(0.30, 0.0, length(vec2((uv.x-0.66)*aspect, uv.y+0.0)));
    paper += vec3(1.0, 0.45, 0.16)*warm2*0.14;

    float gA = hash(gl_FragCoord.xy + floor(t*8.0)*13.0);
    paper += (gA-0.5)*0.10;
    float gB = hash(gl_FragCoord.xy*0.5 + 7.0);
    paper += (gB-0.5)*0.07;

    gl_FragColor = vec4(clamp(paper, 0.0, 1.0), 1.0);
  }
`;

export default function MissionGrainBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(rafRef.current); };
    canvas.addEventListener('webglcontextlost', onLost, true);

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[MissionGrain] shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[MissionGrain] link:', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    // Oversized quad matching HeroClipText's 1.06 approach
    const S = 1.06;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
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

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uRes  = gl.getUniformLocation(prog, 'uResolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      canvas.width  = Math.round(canvas.clientWidth  * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    let running = false;
    let last = 0;
    let elapsed = 0;
    const render = (now: number) => {
      if (!last) last = now;
      elapsed += now - last;
      last = now;
      gl.uniform1f(uTime, elapsed * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      last = 0;
      rafRef.current = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };

    let onScreen = false;
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

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost, true);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', display: 'block',
      }}
    />
  );
}
