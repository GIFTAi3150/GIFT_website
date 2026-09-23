// Section backgrounds: a dot matrix of "skills" with data streams running
// along the rows into each section's focus element (data-focus) and slow rings
// gathering toward it. One raw WebGL1 fragment shader per .lp-field, no
// dependencies. Without WebGL the CSS dot pattern on .lp-field stays visible.

// Colours per data-theme: background, idle dot, active dot, stream head,
// glow colour, glow amount, dot opacity.
const THEMES = {
  dark: { bg: [0.043, 0.063, 0.125], base: [0.27, 0.33, 0.46], ice: [0.376, 0.647, 0.98], hot: [0.88, 0.94, 1], glow: [0.145, 0.388, 0.922], glowAmt: 0.24, amt: 1 },
};

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uFocus;
uniform float uFocusR;
uniform float uCell;
uniform float uDpr;
uniform vec3 uPointer;
uniform vec3 uBg;
uniform vec3 uBase;
uniform vec3 uIce;
uniform vec3 uHot;
uniform vec3 uGlowCol;
uniform float uGlowAmt;
uniform float uAmt;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float hash1(float n){ return fract(sin(n * 127.1) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 cell = floor(p / uCell);
  vec2 c = (cell + 0.5) * uCell;
  float d = length(p - c);
  vec2 tf = c - uFocus;
  float dist = length(tf);
  float diag = length(uRes);
  float t = uTime;

  // Slow activation noise across the matrix.
  float n = noise(cell * 0.11 + vec2(t * 0.05, -t * 0.035));
  n = smoothstep(0.42, 0.92, n);

  // Rings contracting into the catalog.
  float ring = 0.5 + 0.5 * sin(dist / uDpr * 0.045 + t * 1.3);
  ring = pow(ring, 5.0) * smoothstep(diag * 0.8, uFocusR * 0.9, dist);

  // Streams along some rows, travelling toward the catalog from both sides.
  float stream = 0.0;
  float headGlow = 0.0;
  float row = cell.y;
  float side = tf.x >= 0.0 ? 1.0 : -1.0;
  float h = hash1(row * 1.13 + side * 0.37 + 3.7);
  if (h > 0.45) {
    float span = side > 0.0 ? uRes.x - uFocus.x : uFocus.x;
    float u = abs(tf.x) / max(span, 1.0);
    float spd = 0.07 + 0.09 * hash1(row * 1.7 + side);
    float head = 1.15 - fract(t * spd + hash1(row * 3.1 + side * 5.0)) * 1.35;
    float behind = u - head;
    float trail = step(0.0, behind) * exp(-behind * 4.5);
    float rowFade = mix(0.45, 1.0, exp(-abs(tf.y) / (uFocusR * 1.8)));
    float arrive = smoothstep(uFocusR * 0.55, uFocusR * 1.05, dist);
    stream = trail * rowFade * arrive;
    headGlow = step(0.0, behind) * exp(-behind * 28.0) * rowFade * arrive;
  }

  // Pointer lights the dots under it.
  float pl = uPointer.z * exp(-length(c - uPointer.xy) / (130.0 * uDpr));

  float act = clamp(n * 0.55 + ring * 0.75 + stream * 1.2 + pl * 0.8, 0.0, 1.0);

  float fall = mix(0.5, 1.0, exp(-dist / (diag * 0.4)));
  float edge = min(56.0 * uDpr, uRes.y * 0.18);
  float vy = smoothstep(0.0, edge, p.y) * smoothstep(0.0, edge, uRes.y - p.y);

  float radius = (0.85 + 1.5 * act + headGlow * 0.9) * uDpr;
  float dotA = 1.0 - smoothstep(radius - 0.6 * uDpr, radius + 0.6 * uDpr, d);

  vec3 col = mix(uBase, uIce, act);
  col = mix(col, uHot, clamp(headGlow, 0.0, 1.0));
  float alpha = dotA * (0.42 + 0.58 * act) * fall * vy * uAmt;

  float glow = exp(-dist / (uFocusR * 1.3)) * uGlowAmt;
  vec3 outc = mix(uBg, uGlowCol, clamp(glow, 0.0, 1.0));
  outc = mix(outc, col, alpha);
  gl_FragColor = vec4(outc, 1.0);
}
`;

document.querySelectorAll('.lp-field').forEach((wrap) => {
  const section = wrap.parentElement;
  const canvas = wrap.querySelector('canvas');
  const focusEl = section.querySelector(wrap.dataset.focus || '.container');
  if (canvas && focusEl) start(section, wrap, canvas, focusEl, THEMES[wrap.dataset.theme] || THEMES.dark);
});

function start(section, wrap, canvas, stage, theme) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  let gl = null;
  let u = null;
  let raf = 0;
  let inView = true;
  let time = 7;
  let last = 0;
  let dpr = 1;
  let focus = [0, 0];
  let focusR = 200;
  const ptr = { x: 0, y: 0, target: 0, s: 0 };

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    gl = null;
    wrap.dataset.gl = 'lost';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    if (setup()) {
      measure();
      kick();
    }
  });

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function setup() {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) return false;
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return (gl = null), false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return (gl = null), false;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    u = {};
    for (const name of ['uRes', 'uTime', 'uFocus', 'uFocusR', 'uCell', 'uDpr', 'uPointer']) {
      u[name] = gl.getUniformLocation(prog, name);
    }
    gl.uniform3fv(gl.getUniformLocation(prog, 'uBg'), theme.bg);
    gl.uniform3fv(gl.getUniformLocation(prog, 'uBase'), theme.base);
    gl.uniform3fv(gl.getUniformLocation(prog, 'uIce'), theme.ice);
    gl.uniform3fv(gl.getUniformLocation(prog, 'uHot'), theme.hot);
    gl.uniform3fv(gl.getUniformLocation(prog, 'uGlowCol'), theme.glow);
    gl.uniform1f(gl.getUniformLocation(prog, 'uGlowAmt'), theme.glowAmt);
    gl.uniform1f(gl.getUniformLocation(prog, 'uAmt'), theme.amt);
    return true;
  }

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const r = canvas.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    focus = [(s.left + s.width / 2 - r.left) * dpr, (r.bottom - (s.top + s.height / 2)) * dpr];
    focusR = Math.max(60, Math.min(s.width, s.height) * 0.5) * dpr;
    if (!raf) draw();
  }

  function draw() {
    if (!gl) return;
    const small = canvas.clientWidth <= 760;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, time);
    gl.uniform2f(u.uFocus, focus[0], focus[1]);
    gl.uniform1f(u.uFocusR, focusR);
    gl.uniform1f(u.uCell, (small ? 20 : 24) * dpr);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform3f(u.uPointer, ptr.x, ptr.y, ptr.s);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (wrap.dataset.gl !== 'ready') wrap.dataset.gl = 'ready';
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    time += dt;
    ptr.s += (ptr.target - ptr.s) * Math.min(1, dt * 4);
    draw();
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  function kick() {
    stop();
    if (!gl) return;
    if (reduce.matches || !inView || document.hidden) draw();
    else raf = requestAnimationFrame(frame);
  }

  if (!setup()) return;

  new ResizeObserver(measure).observe(canvas);
  new ResizeObserver(measure).observe(stage);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    kick();
  }).observe(section);
  document.addEventListener('visibilitychange', kick);
  reduce.addEventListener('change', kick);

  section.addEventListener('pointermove', (e) => {
    if (!fine.matches) return;
    const r = canvas.getBoundingClientRect();
    ptr.x = (e.clientX - r.left) * dpr;
    ptr.y = (r.bottom - e.clientY) * dpr;
    ptr.target = 1;
  });
  section.addEventListener('pointerleave', () => {
    ptr.target = 0;
  });

  measure();
  kick();
}
