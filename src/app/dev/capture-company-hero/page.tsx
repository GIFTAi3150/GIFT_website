'use client';

// DEV-ONLY — records the company hero gradient canvas to a WebM loop.
// 1. Visit /dev/capture-company-hero
// 2. Click "Record 10.5 s"
// 3. Download hero-gradient-loop.webm
// 4. Drop file in /public/company/
// The 10.5 s duration ≈ 1 full period of the sin-based vertex warp (2π / 0.6).
// Production builds show a stub — this route never ships.

import { useEffect, useRef, useState } from 'react';

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
  uniform vec2      uResolution;
  uniform sampler2D uTexture;
  uniform float     uTime;
  varying vec2      vUv;

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

  float random(vec2 st){ return fract(sin(dot(st,vec2(12.9898,78.233)))*43758.5453123); }

  void main(){
    vec2 st = gl_FragCoord.xy / uResolution;
    vec4 tex = texture2D(uTexture, vUv);

    float rnd = random(st + (uTime * 0.0003));
    rnd = (smoothstep(0.,1.,rnd) - 0.5) * 0.5;

    float level = 0.08;
    float x = st.x * (10.5 * level);
    float y = (st.y * 4.5 + uTime) * level;
    float z = uTime * 0.25;
    vec3 rawNoise = vec3(snoise(vec3(x, y, z)));

    vec3 gradient = rawNoise * 0.32;
    gradient = smoothstep(-1.4, 1.4, gradient) + 0.32;
    gradient -= vec3(rnd) * 0.14;
    tex.rgb *= gradient;

    gl_FragColor = vec4(tex.rgb, 1.0);
  }
`;

// Fixed capture resolution — independent of the browser window size.
const W = 1920;
const H = 1080;
// 10.5 s ≈ one full period of the sin-based vertex warp (2π / 0.6 ≈ 10.47 s)
const RECORD_SECONDS = 10.5;

type Status = 'idle' | 'settling' | 'recording' | 'done' | 'error';

export default function CaptureCompanyHeroPage() {
  const isProduction = process.env.NODE_ENV === 'production';

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [status,   setStatus]   = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [dlUrl,    setDlUrl]    = useState<string | null>(null);

  useEffect(() => {
    if (isProduction) return;
    window.dispatchEvent(new Event('gift:logo-ready'));

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = W;
    canvas.height = H;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('[capture] shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('[capture] link:', gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const COLS = 20, ROWS = 40;
    const verts = new Float32Array((COLS + 1) * (ROWS + 1) * 4);
    let vi = 0;
    for (let r = 0; r <= ROWS; r++) for (let c = 0; c <= COLS; c++) {
      const u = c / COLS, v = r / ROWS;
      verts[vi++] = u * 2 - 1; verts[vi++] = v * 2 - 1;
      verts[vi++] = u;         verts[vi++] = v;
    }
    const idxCount = COLS * ROWS * 6;
    const indices = new Uint16Array(idxCount);
    let ii = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const tl = r * (COLS + 1) + c, tr = tl + 1, bl = tl + (COLS + 1), br = bl + 1;
      indices[ii++] = tl; indices[ii++] = bl; indices[ii++] = tr;
      indices[ii++] = tr; indices[ii++] = bl; indices[ii++] = br;
    }
    const pb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, pb);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ib = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'position');
    const aUv  = gl.getAttribLocation(prog, 'uv');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);  gl.vertexAttribPointer(aUv,  2, gl.FLOAT, false, 16, 8);

    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([186,186,186]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const img = new Image();
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.src = '/company/hero-field.webp';

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uRes  = gl.getUniformLocation(prog, 'uResolution');
    gl.uniform1i(gl.getUniformLocation(prog, 'uTexture'), 0);
    gl.uniform2f(uRes, W, H);
    gl.viewport(0, 0, W, H);

    let start = 0;
    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!start) start = now;
      gl.uniform1f(uTime, (now - start) * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idxCount, gl.UNSIGNED_SHORT, 0);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isProduction]);

  const startRecord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDlUrl(null);
    setProgress(0);
    setStatus('settling');

    // 1.5 s settle so the texture loads and the first frame looks right
    setTimeout(() => {
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const chunks: BlobPart[] = [];
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
      recorderRef.current = rec;

      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setDlUrl(URL.createObjectURL(blob));
        setStatus('done');
        setProgress(100);
      };

      rec.start(200); // chunk every 200 ms
      setStatus('recording');
      const totalMs = RECORD_SECONDS * 1000;
      const tick = setInterval(() => {
        setProgress((p) => Math.min(p + 100 / (totalMs / 200), 99));
      }, 200);
      setTimeout(() => {
        clearInterval(tick);
        rec.stop();
      }, totalMs);
    }, 1500);
  };

  if (isProduction) {
    return (
      <main style={{ padding: 40, fontFamily: 'system-ui', color: '#111' }}>
        <h1>Gradient capture (dev only)</h1>
        <p>Run <code>npm run dev</code> and open this route locally.</p>
      </main>
    );
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: '#111' }}>
      {/* Live canvas preview — shrunk to fit viewport via CSS, recorded at 1920×1080 */}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
      />

      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(8,10,18,0.92)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12, padding: '20px 28px', color: '#e7ecff',
        fontFamily: 'system-ui, sans-serif', minWidth: 320, backdropFilter: 'blur(8px)',
      }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 16 }}>Gradient capture</h1>
        <p style={{ margin: '0 0 16px', fontSize: 12, opacity: 0.6 }}>
          Records {RECORD_SECONDS}s at 1920×1080 · download as <code>hero-gradient-loop.webm</code>
          <br />Drop the file into <code>/public/company/</code>
        </p>

        {status === 'idle' && (
          <button onClick={startRecord} style={btnStyle('#635bff')}>
            Record {RECORD_SECONDS} s
          </button>
        )}
        {status === 'settling' && (
          <button disabled style={btnStyle('#3a3f55')}>Settling texture…</button>
        )}
        {status === 'recording' && (
          <>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)', marginBottom: 10 }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 3, background: '#635bff', transition: 'width 0.2s' }} />
            </div>
            <button disabled style={btnStyle('#3a3f55')}>Recording… {Math.round(progress)}%</button>
          </>
        )}
        {status === 'done' && dlUrl && (
          <>
            <a href={dlUrl} download="hero-gradient-loop.webm" style={{ ...btnStyle('#22c55e'), display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              ↓ Download hero-gradient-loop.webm
            </a>
            <button onClick={startRecord} style={{ ...btnStyle('#444'), marginTop: 8, display: 'block', width: '100%' }}>
              Re-record
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
    background: bg, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  };
}
