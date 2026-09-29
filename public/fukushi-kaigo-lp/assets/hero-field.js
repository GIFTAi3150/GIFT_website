// Hero background: 「書き出しの壁」. The catalogue's real task names, written out in
// rows across the whole hero at three depths (far: small and soft, mid: sharp,
// near: huge and blurred). Each row is written in by a glowing pen line on load,
// the rows drift sideways, and a soft reading light wanders over the wall,
// lighting up the names under it. The mouse only nudges the light; nothing
// needs hovering. Reduced motion renders one still frame; without WebGL the
// navy CSS band stays as it is.

const bg = document.querySelector('.gift-hero-bg');
const canvas = bg?.querySelector('.gift-wall-canvas');
// The wall is the hero background on every screen size.
if (bg && canvas) start();

function start() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return;

  const BANDS = 16;
  // Glyph height as a share of the row height, and each layer's look.
  const LAYERS = [
    { rowH: 30, speed: 12, base: 0.2, boost: 0.62, bias: 0.7, depth: 0.25 }, // far
    { rowH: 62, speed: 24, base: 0.085, boost: 0.72, bias: 0.0, depth: 0.55 }, // mid
    { rowH: 210, speed: 44, base: 0.04, boost: 0.1, bias: 2.6, depth: 1.0 }, // near (bokeh)
  ];

  const view = { w: 1, h: 1, dpr: 1 };
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false, pull: 0 };
  let program = null;
  let buffer = null;
  let vertexCount = 0;
  let texture = null;
  let bandAspect = 32;
  let names = null;
  let readyAt = -1;
  let raf = 0;
  let visible = true;
  let last = performance.now();
  const t0 = performance.now();

  // --- Shaders -------------------------------------------------------------------
  const vs = `
    precision highp float;
    attribute vec2 a_corner;   // 0..1 within the row quad
    attribute vec4 a_row;      // top (css px), row height, layer, band
    attribute vec3 a_motion;   // speed * direction, write-in delay, row seed
    uniform vec2 u_res;
    uniform vec2 u_parallax;
    uniform vec3 u_depth;      // parallax depth per layer
    varying vec2 v_px;
    varying float v_rowV;
    varying float v_layer;
    varying float v_band;
    varying float v_rowH;
    varying vec3 v_motion;
    void main() {
      float depth = a_row.z < 0.5 ? u_depth.x : (a_row.z < 1.5 ? u_depth.y : u_depth.z);
      vec2 px = vec2(a_corner.x * (u_res.x + 80.0) - 40.0, a_row.x + a_corner.y * a_row.y);
      px += u_parallax * depth;
      v_px = px;
      v_rowV = a_corner.y;
      v_layer = a_row.z;
      v_band = a_row.w;
      v_rowH = a_row.y;
      v_motion = a_motion;
      gl_Position = vec4(px.x / u_res.x * 2.0 - 1.0, 1.0 - px.y / u_res.y * 2.0, 0.0, 1.0);
    }`;
  const fs = `
    precision highp float;
    uniform sampler2D u_atlas;
    uniform float u_time;
    uniform float u_fade;
    uniform float u_bandAspect;
    uniform vec2 u_res;
    uniform vec2 u_light;
    uniform vec2 u_lightR;
    uniform vec3 u_base;
    uniform vec3 u_boost;
    uniform vec3 u_bias;
    varying vec2 v_px;
    varying float v_rowV;
    varying float v_layer;
    varying float v_band;
    varying float v_rowH;
    varying vec3 v_motion;
    void main() {
      float near = step(1.5, v_layer);
      float mid = step(0.5, v_layer) - near;
      float far = 1.0 - near - mid;
      float base = dot(vec3(far, mid, near), u_base);
      float boost = dot(vec3(far, mid, near), u_boost);
      float bias = dot(vec3(far, mid, near), u_bias);

      float u = (v_px.x + u_time * v_motion.x + v_motion.z * 997.0) / (v_rowH * u_bandAspect);
      float v = (v_band + v_rowV) / ${BANDS.toFixed(1)};
      float glyph = texture2D(u_atlas, vec2(u, v), bias).a;

      // Reading light: a soft tilted ellipse.
      vec2 d = v_px - u_light;
      float c = cos(-0.32), s = sin(-0.32);
      d = vec2(c * d.x - s * d.y, s * d.x + c * d.y) / u_lightR;
      float light = exp(-dot(d, d) * 1.7);

      // Write-in: a pen line sweeps each row left to right.
      float front = (u_time - v_motion.y) * 1500.0 - 60.0;
      float written = 1.0 - smoothstep(front - 140.0, front, v_px.x);
      float pen = exp(-abs(v_px.x - front) / 34.0) * step(0.0, front) * step(front, u_res.x + 200.0) * (1.0 - near);

      float alpha = glyph * ((base + boost * light) * written + pen * 0.85) * u_fade;
      vec3 ink = mix(vec3(0.27, 0.42, 0.78), vec3(0.83, 0.9, 1.0), clamp(light * 0.95 + pen, 0.0, 1.0));
      if (alpha < 0.002) discard;
      gl_FragColor = vec4(ink * alpha, alpha);
    }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  }

  function buildProgram() {
    const v = compile(gl.VERTEX_SHADER, vs);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return false;
    program = gl.createProgram();
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    return true;
  }

  // --- Rows ----------------------------------------------------------------------
  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function buildRows() {
    const data = [];
    const corners = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
    LAYERS.forEach((layer, li) => {
      const count = Math.ceil((view.h + 160) / layer.rowH) + 1;
      const offset = -80 - hash(li + 3) * layer.rowH;
      for (let r = 0; r < count; r++) {
        const top = offset + r * layer.rowH;
        const seed = li * 101 + r;
        const band = Math.floor(hash(seed) * BANDS);
        const dir = (r + li) % 2 === 0 ? 1 : -1;
        const speed = layer.speed * (0.8 + hash(seed + 7) * 0.45) * dir;
        // Rows are written top to bottom; the near layer arrives last and softly.
        const delay = 0.15 + (top / Math.max(1, view.h)) * 0.9 + li * 0.18 + hash(seed + 13) * 0.12;
        for (let k = 0; k < 6; k++) {
          data.push(corners[k * 2], corners[k * 2 + 1], top, layer.rowH, li, band, speed, delay, hash(seed + 29));
        }
      }
    });
    const array = new Float32Array(data);
    vertexCount = array.length / 9;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    const stride = 9 * 4;
    const bind = (name, size, offset) => {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset * 4);
    };
    bind('a_corner', 2, 0);
    bind('a_row', 4, 2);
    bind('a_motion', 3, 6);
  }

  // --- Atlas: 16 bands of task names, each band tiling seamlessly -----------------
  function buildAtlas(list) {
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const W = max >= 4096 ? 4096 : 2048;
    const H = W / 2;
    const bandH = H / BANDS;
    bandAspect = W / bandH;
    const atlas = document.createElement('canvas');
    atlas.width = W;
    atlas.height = H;
    const ctx = atlas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(bandH * 0.44)}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif`;
    const gap = bandH * 0.9;
    const sep = '／';
    const sepW = ctx.measureText(sep).width;
    let n = 0;
    for (let b = 0; b < BANDS; b++) {
      const y = b * bandH + bandH / 2;
      let x = 0;
      while (x < W) {
        const name = list[n++ % list.length];
        const w = ctx.measureText(name).width;
        const draw = (text, px) => {
          ctx.fillText(text, px, y);
          if (px + ctx.measureText(text).width > W) ctx.fillText(text, px - W, y);
        };
        draw(name, x);
        ctx.globalAlpha = 0.45;
        draw(sep, x + w + gap / 2 - sepW / 2);
        ctx.globalAlpha = 1;
        x += w + gap;
      }
    }
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, atlas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  // --- Frame ---------------------------------------------------------------------
  const uniform = (name) => gl.getUniformLocation(program, name);
  function draw(now) {
    raf = 0;
    if (!texture) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = reduce ? 30 : (now - readyAt) / 1000;
    const k = 1 - Math.exp(-dt * 1.8);
    pointer.x += (pointer.tx - pointer.x) * (reduce ? 1 : k);
    pointer.y += (pointer.ty - pointer.y) * (reduce ? 1 : k);

    // The light wanders on its own; a mouse pulls it about a third of the way.
    const tt = (now - t0) / 1000;
    let lx = view.w * (0.62 + 0.26 * Math.sin(tt * 0.071));
    let ly = view.h * (0.32 + 0.16 * Math.sin(tt * 0.053 + 1.3));
    if (reduce) {
      lx = view.w * 0.68;
      ly = view.h * 0.34;
    }
    // The mouse's pull on the light fades in and out, so leaving the hero never snaps it.
    pointer.pull += ((pointer.active ? 0.35 : 0) - pointer.pull) * (reduce ? 1 : k);
    lx += (pointer.x * view.w - lx) * pointer.pull;
    ly += (pointer.y * view.h - ly) * pointer.pull;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(uniform('u_atlas'), 0);
    gl.uniform1f(uniform('u_time'), t);
    gl.uniform1f(uniform('u_fade'), reduce ? 1 : Math.min(1, t / 0.6));
    gl.uniform1f(uniform('u_bandAspect'), bandAspect);
    gl.uniform2f(uniform('u_res'), view.w, view.h);
    gl.uniform2f(uniform('u_parallax'), (pointer.x - 0.5) * -24, (pointer.y - 0.5) * -16);
    gl.uniform3f(uniform('u_depth'), LAYERS[0].depth, LAYERS[1].depth, LAYERS[2].depth);
    gl.uniform2f(uniform('u_light'), lx, ly);
    gl.uniform2f(uniform('u_lightR'), Math.max(260, view.w * 0.3), Math.max(150, view.h * 0.2));
    gl.uniform3f(uniform('u_base'), LAYERS[0].base, LAYERS[1].base, LAYERS[2].base);
    gl.uniform3f(uniform('u_boost'), LAYERS[0].boost, LAYERS[1].boost, LAYERS[2].boost);
    gl.uniform3f(uniform('u_bias'), LAYERS[0].bias, LAYERS[1].bias, LAYERS[2].bias);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(draw);
  }
  function requestDraw() {
    if (!raf && texture) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  }

  function layout() {
    const rect = bg.getBoundingClientRect();
    view.w = Math.max(1, rect.width);
    view.h = Math.max(1, rect.height);
    view.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(view.w * view.dpr);
    canvas.height = Math.round(view.h * view.dpr);
    if (program) buildRows();
  }

  function init() {
    if (!buildProgram()) return false;
    layout();
    if (names) {
      buildAtlas(names);
      bg.classList.add('is-live');
    }
    return true;
  }

  // --- Boot ------------------------------------------------------------------------
  if (!init()) return;

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    texture = null;
    program = null;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    if (init()) requestDraw();
  });

  new ResizeObserver(() => {
    const before = view.h;
    layout();
    if (Math.abs(before - view.h) > 1 || reduce) requestDraw();
  }).observe(bg);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw();
  }).observe(bg);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestDraw();
  });
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = bg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / view.w;
      const y = (event.clientY - rect.top) / view.h;
      pointer.active = y >= 0 && y <= 1;
      // Outside the hero the light and parallax drift back to centre instead of chasing
      // a cursor that is somewhere else on the page.
      pointer.tx = pointer.active ? x : 0.5;
      pointer.ty = pointer.active ? y : 0.5;
      if (reduce) requestDraw();
    },
    { passive: true },
  );

  // Real task names, shuffled so neighbouring rows mix 介護・障がい福祉・保育.
  fetch('/fukushi-kaigo-lp/assets/skills-2026-09.json')
    .then((response) => response.json())
    .then(async (rows) => {
      const list = rows.map((row) => row[2]);
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(hash(i + 0.5) * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      names = list;
      try {
        await document.fonts.load('800 32px "Noto Sans JP"', list.slice(0, 200).join(''));
      } catch {}
      if (!program) return;
      buildAtlas(names);
      bg.classList.add('is-live');
      readyAt = performance.now();
      requestDraw();
    })
    .catch(() => {});
}
