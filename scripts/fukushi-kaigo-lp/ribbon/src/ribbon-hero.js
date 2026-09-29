// Hero ribbon knot for /fukushi-kaigo-lp. Five flat, twisted ribbons looped into a
// knot; the front face is white with this page's own words printed on it, the back
// face is solid blue, and the text scrolls along each ribbon. Ambient only: the knot
// turns slowly, a mouse tilts it a little, scrolling turns it a little more.
// Plan: docs/fukushi-kaigo-lp-ribbon-hero-plan.md
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ClampToEdgeWrapping,
  DoubleSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';

const bg = document.querySelector('.gift-hero-bg');
const canvas = bg?.querySelector('.gift-ribbon-canvas');
const stage = document.querySelector('.gift-hero-stage');

const BACKS = [
  [0x25 / 255, 0x63 / 255, 0xeb / 255],
  [0x1d / 255, 0x4e / 255, 0xd8 / 255],
  [0x3b / 255, 0x82 / 255, 0xf6 / 255],
  [0x25 / 255, 0x63 / 255, 0xeb / 255],
  [0x1e / 255, 0x40 / 255, 0xaf / 255],
  [0x1d / 255, 0x4e / 255, 0xd8 / 255],
];
// Knot half-extents in world units (for fitting it to the stage).
const HALF_W = 3.3;
const HALF_H = 2.3;
const WIDTH = 0.92;
const SAMPLES = 640;

// Every word on the ribbons comes from this page.
const COPY = [
  ['介護・障がい福祉・保育', '現場の作業を、ぜんぶ書き出しました'],
  ['AI SKILL CATALOG', '851本', '12事業', '作業名で引ける'],
  ['送迎の遅れ一斉連絡', 'シフト表のたたき台', '連絡帳の下書き', '支援記録を話して下書き', '欠席連絡の電話受付'],
  ['訪問介護', 'デイサービス', '施設', 'ケアマネ', '訪問看護', '就労支援', '放課後等デイ', '生活介護・GH', '相談支援', '認可保育所', '認定こども園と幼稚園', '事業所内保育所と企業主導型'],
  ['LINEでカタログを受け取る', '無料の個別相談も', '引けるようにしました'],
];
// A ball wound with tape: every ribbon is a great circle of the same sphere, each at its
// own angle (tilt = rotation of the circle's plane). Radii step up a hair so crossings
// never z-fight. speed = text speed (world units / s).
const SPHERE_R = 2.2;
const RINGS = [
  // Mostly near-horizontal bands (their text reads upright), two steep ones for the ball shape.
  { tilt: [0.12, 0.0, 0.06] },
  { tilt: [0.0, 0.0, 0.34] },
  { tilt: [0.0, 0.0, -0.36] },
  { tilt: [0.62, 0.0, 0.12] },
  { tilt: [-0.55, 0.0, -0.1] },
  { tilt: [0.4, 1.57, 0.95] },
  { tilt: [1.35, 0.4, -0.25] },
].map((ring, i) => ({
  ...ring,
  y: 0,
  rx: SPHERE_R + i * 0.022,
  rz: SPHERE_R + i * 0.022,
  lean: 0,
  wobble: 0.22,
  phase: i * 1.37,
  speed: (i % 2 === 0 ? 1 : -1) * (0.18 + 0.03 * (i % 3)),
  seed: i + 1,
}));

if (bg && canvas && stage) start().catch((error) => {
  console.error("[ribbon-hero]", error);
  fallback();
});

function fallback() {
  bg?.classList.add('is-ribbon-off');
  stage?.classList.add('is-ribbon-off');
}

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rotate(v, [rx, ry, rz]) {
  let { x, y, z } = v;
  let c = Math.cos(rx);
  let s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry);
  s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz);
  s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  return new Vector3(x, y, z);
}

// A closed belt: an ellipse at height y that moves left→right across its front (z > 0),
// so the printed text reads forwards there.
function ringCurve(ring) {
  const points = [];
  const count = 16;
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2;
    // Uneven radius and an out-of-plane wave make each loop read as loose tape, not a hoop.
    const r = 1 + 0.1 * Math.sin(a * 3 + ring.seed) + 0.05 * Math.sin(a * 5 + ring.seed * 2.1);
    const lift = ring.rx * 0.14 * Math.sin(a * 2 + ring.seed * 1.7);
    points.push(rotate(new Vector3(Math.cos(a) * ring.rx * r, ring.y + lift, -Math.sin(a) * ring.rz * r), ring.tilt));
  }
  return new CatmullRomCurve3(points, true, 'centripetal');
}

function ribbonGeometry(curve, ring) {
  const frames = curve.computeFrenetFrames(SAMPLES, true);
  const points = curve.getSpacedPoints(SAMPLES);
  const position = new Float32Array((SAMPLES + 1) * 2 * 3);
  const normal = new Float32Array((SAMPLES + 1) * 2 * 3);
  const uv = new Float32Array((SAMPLES + 1) * 2 * 2);
  const across = new Vector3();
  const face = new Vector3();
  for (let i = 0; i <= SAMPLES; i++) {
    const s = i / SAMPLES;
    // Upright band leaned inward by its latitude, so it lies on the dome surface.
    const angle = Math.PI / 2 + ring.lean + ring.wobble * Math.sin(Math.PI * 4 * s + ring.phase);
    const n = frames.normals[i % SAMPLES];
    const b = frames.binormals[i % SAMPLES];
    const t = frames.tangents[i % SAMPLES];
    across.copy(n).multiplyScalar(Math.cos(angle)).addScaledVector(b, Math.sin(angle));
    face.crossVectors(t, across).normalize();
    const p = points[i];
    for (let side = 0; side < 2; side++) {
      const k = i * 2 + side;
      const offset = (side === 0 ? 0.5 : -0.5) * WIDTH;
      position[k * 3] = p.x + across.x * offset;
      position[k * 3 + 1] = p.y + across.y * offset;
      position[k * 3 + 2] = p.z + across.z * offset;
      normal[k * 3] = face.x;
      normal[k * 3 + 1] = face.y;
      normal[k * 3 + 2] = face.z;
      uv[k * 2] = s;
      uv[k * 2 + 1] = side === 0 ? 1 : 0;
    }
  }
  const index = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setAttribute('normal', new BufferAttribute(normal, 3));
  geometry.setAttribute('uv', new BufferAttribute(uv, 2));
  geometry.setIndex(index);
  geometry.computeBoundingBox();
  // Rest positions, for the spring physics.
  geometry.userData.rest = position.slice();
  return geometry;
}

// One seamless tile of phrases: white ground, blue text.
function textTexture(phrases, maxAnisotropy) {
  const height = 160;
  const font = `800 ${Math.round(height * 0.64)}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif`;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  const gap = height * 0.55;
  const sep = '／';
  const sepWidth = probe.measureText(sep).width;
  const widths = phrases.map((p) => probe.measureText(p).width);
  const width = Math.ceil(widths.reduce((sum, w) => sum + w + gap * 2 + sepWidth, 0));
  const tile = document.createElement('canvas');
  tile.width = width;
  tile.height = height;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.font = font;
  ctx.textBaseline = 'middle';
  // [phrase][gap][／][gap] per phrase; the tile starts half a gap in so the seam
  // between the last separator and the first phrase is exactly one gap.
  let x = gap / 2;
  phrases.forEach((phrase, i) => {
    ctx.fillStyle = '#2563eb';
    ctx.fillText(phrase, x, height * 0.53);
    x += widths[i] + gap;
    ctx.fillStyle = '#93b4f5';
    ctx.fillText(sep, x, height * 0.53);
    x += sepWidth + gap;
  });
  const texture = new CanvasTexture(tile);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = maxAnisotropy;
  texture.generateMipmaps = true;
  return { texture, aspect: width / height };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    // Slow ripple along the band, stronger toward its edges, like tape moving in air.
    float wave = sin(uv.x * 6.2831 * 3.0 + uTime * 0.7 + uPhase) * 0.05
               + sin(uv.x * 6.2831 * 5.0 - uTime * 0.5 + uPhase * 1.7) * 0.025;
    float edge = 0.6 + 0.4 * abs(uv.y * 2.0 - 1.0);
    vec3 displaced = position + normal * wave * edge;
    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
    vView = -mv.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mv;
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uRepeat;
  uniform float uOffset;
  uniform float uReveal;
  uniform vec3 uBack;
  uniform vec3 uHead;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    if (vUv.x > uReveal) discard;
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float shade = mix(0.86, 1.0, facing);
    vec3 color = gl_FrontFacing
      ? texture2D(uMap, vec2(vUv.x * uRepeat - uOffset, vUv.y)).rgb
      : uBack;
    // A bright leading edge while the ribbon draws itself in.
    float head = smoothstep(uReveal - 0.035, uReveal, vUv.x) * step(uReveal, 0.999);
    gl_FragColor = vec4(mix(color * shade, uHead, head * 0.85), 1.0);
  }
`;

async function start() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Repo rule: block three's preventDefault on context loss BEFORE the renderer exists,
  // so a lost context is never "restored" into a guilty tab.
  let lost = false;
  canvas.addEventListener('webglcontextlost', (event) => {
    event.stopImmediatePropagation();
    lost = true;
    fallback();
  });

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const knot = new Group();
  const spin = new Group();
  spin.scale.set(1.3, 0.84, 1.05);
  knot.add(spin);
  scene.add(knot);

  try {
    await document.fonts.load('800 40px "Noto Sans JP"', COPY.flat().join(''));
  } catch {}

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const ribbons = RINGS.map((ring, i) => {
    const curve = ringCurve(ring);
    const { texture, aspect } = textTexture(COPY[i % COPY.length], anisotropy);
    const tileLength = WIDTH * aspect;
    const repeat = Math.max(1, Math.round(curve.getLength() / tileLength));
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      uniforms: {
        uMap: { value: texture },
        uTime: { value: 0 },
        uPhase: { value: i * 1.9 },
        uRepeat: { value: repeat },
        uOffset: { value: hash(i + 9) },
        uReveal: { value: reduce ? 1.01 : 0 },
        uBack: { value: new Vector3(...BACKS[i % BACKS.length]) },
        uHead: { value: new Vector3(0.85, 0.92, 1.0) },
      },
    });
    const mesh = new Mesh(ribbonGeometry(curve, ring), material);
    spin.add(mesh);
    // Offset is in tiles, so world speed ÷ tile length = tiles per second.
    const count = SAMPLES + 1;
    return {
      mesh,
      material,
      speed: ring.speed / tileLength,
      delay: 0.25 + i * 0.16,
      // One mass per sample along the ribbon: displacement + velocity (local space).
      disp: new Float32Array(count * 3),
      vel: new Float32Array(count * 3),
      force: new Float32Array(count * 3),
      rest: mesh.geometry.userData.rest,
    };
  });

  const view = { w: 1, h: 1 };
  knot.rotation.set(0.2, -0.35, 0);

  function layout() {
    const rect = bg.getBoundingClientRect();
    view.w = Math.max(1, rect.width);
    view.h = Math.max(1, rect.height);
    const small = view.w < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setSize(view.w, view.h, false);
    camera.aspect = view.w / view.h;
    camera.updateProjectionMatrix();
    // Centre the knot on the stage and size it from the stage...
    const s = stage.getBoundingClientRect();
    const cx = s.left + s.width / 2 - rect.left;
    const cy = s.top + s.height / 2 - rect.top;
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;
    knot.position.set((cx / view.w) * 2 * halfW - halfW, halfH - (cy / view.h) * 2 * halfH, 0);
    const pxPerWorld = view.h / (2 * halfH);
    const scale = small
      ? (s.width * 1.45) / (2 * HALF_W)
      : Math.min((s.width * 1.2) / (2 * HALF_W), (s.height * 1.3) / (2 * HALF_H));
    knot.scale.setScalar(scale / pxPerWorld);
    // ...then measure its real on-screen bounds and shrink it until it clears the top of
    // the hero (and, on desktop, doesn't run far into the business list below the stage).
    // Keep it clear of the hero's top edge by moving it down, not by shrinking it.
    // On desktop it must also stay above the business list under the stage; shrink only
    // as much as that needs.
    const topLimit = small ? 12 : 28;
    const bottomLimit = small ? Infinity : s.bottom - rect.top + 8;
    const worldPerPx = (2 * halfH) / view.h;
    for (let pass = 0; pass < 3; pass++) {
      let [top, bottom] = screenBounds();
      if (bottom - top > bottomLimit - topLimit) {
        knot.scale.multiplyScalar(((bottomLimit - topLimit) / (bottom - top)) * 0.99);
        [top, bottom] = screenBounds();
      }
      if (top < topLimit) knot.position.y -= (topLimit - top) * worldPerPx;
      else if (bottom > bottomLimit) knot.position.y += (bottom - bottomLimit) * worldPerPx;
      else break;
    }
  }

  const corner = new Vector3();
  function screenBounds() {
    // The camera is not in the scene graph; its matrices only update on render.
    camera.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    let top = Infinity;
    let bottom = -Infinity;
    // Project the actual ribbon vertices (a box's corners overestimate a rotated ball).
    ribbons.forEach(({ mesh, rest }) => {
      // Every vertex: the two edges of a band alternate, so any stride would miss one edge.
      for (let v = 0; v < rest.length; v += 3) {
        corner.set(rest[v], rest[v + 1], rest[v + 2]).applyMatrix4(mesh.matrixWorld).project(camera);
        const y = (0.5 - corner.y * 0.5) * view.h;
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    });
    // Headroom for the live ripple and pokes.
    const pad = 0.1 * knot.scale.x * (view.h / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z));
    top -= pad;
    bottom += pad;
    return [top, bottom];
  }

  // --- Physics ------------------------------------------------------------------
  // Each ribbon is a closed chain of masses (one per sample) held by anchor springs and
  // coupled to its neighbours, so a push travels along the tape as a wave and damps out.
  // Hover presses a soft dent under the cursor; a click or tap gives a sharp poke.
  const ANCHOR = 22; // spring back to rest (1/s²)
  const COUPLING = 8.5; // neighbour coupling (1/s² per unit of discrete Laplacian)
  const DAMPING = 3.2; // velocity damping (1/s)
  const HOVER_FORCE = 6.5; // world units / s² at the cursor
  const POKE = 6.0; // world units / s of impulse at a click
  const pointer = { x: 0, y: 0, hover: false, poke: 0 };
  const sample = new Vector3();
  const local = new Vector3();
  const push = new Vector3();
  const into = new Vector3();
  let energy = 0;

  function stepPhysics(dt) {
    const radius = view.w < 700 ? 110 : 170;
    const acting = pointer.hover || pointer.poke > 0;
    if (!acting && energy < 1e-6) return;
    camera.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    energy = 0;
    const substeps = 3;
    const h = dt / substeps;
    ribbons.forEach((ribbon) => {
      const { mesh, disp, vel, force, rest } = ribbon;
      const count = disp.length / 3;
      force.fill(0);
      if (acting) {
        // "Into the screen", expressed in the ribbon's local space.
        const inverse = mesh.matrixWorld.clone().invert();
        into.set(0, 0, -1).transformDirection(inverse);
        for (let i = 0; i < count; i++) {
          const a = i * 6;
          local.set(
            (rest[a] + rest[a + 3]) / 2 + disp[i * 3],
            (rest[a + 1] + rest[a + 4]) / 2 + disp[i * 3 + 1],
            (rest[a + 2] + rest[a + 5]) / 2 + disp[i * 3 + 2],
          );
          sample.copy(local).applyMatrix4(mesh.matrixWorld).project(camera);
          if (sample.z > 1) continue;
          const sx = (sample.x * 0.5 + 0.5) * view.w;
          const sy = (0.5 - sample.y * 0.5) * view.h;
          const d2 = ((sx - pointer.x) ** 2 + (sy - pointer.y) ** 2) / (radius * radius);
          if (d2 > 4) continue;
          const w = Math.exp(-d2 * 1.6);
          // Pushed into the screen and a little outward from the ball's centre.
          push.copy(local).normalize().multiplyScalar(0.55).add(into).normalize();
          if (pointer.hover) {
            force[i * 3] += push.x * HOVER_FORCE * w;
            force[i * 3 + 1] += push.y * HOVER_FORCE * w;
            force[i * 3 + 2] += push.z * HOVER_FORCE * w;
          }
          if (pointer.poke > 0) {
            vel[i * 3] += push.x * POKE * w;
            vel[i * 3 + 1] += push.y * POKE * w;
            vel[i * 3 + 2] += push.z * POKE * w;
          }
        }
      }
      for (let step = 0; step < substeps; step++) {
        for (let i = 0; i < count; i++) {
          // Closed loop: the last sample duplicates the first.
          const prev = i === 0 ? count - 2 : i - 1;
          const next = i === count - 1 ? 1 : i + 1;
          for (let c = 0; c < 3; c++) {
            const k = i * 3 + c;
            const laplacian = disp[prev * 3 + c] + disp[next * 3 + c] - 2 * disp[k];
            const acc = -ANCHOR * disp[k] + COUPLING * laplacian * count - DAMPING * vel[k] + force[k];
            vel[k] += acc * h;
          }
        }
        for (let k = 0; k < disp.length; k++) disp[k] += vel[k] * h;
      }
      for (let c = 0; c < 3; c++) disp[(count - 1) * 3 + c] = disp[c];
      const array = mesh.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        for (let side = 0; side < 2; side++) {
          const v = (i * 2 + side) * 3;
          array[v] = rest[v] + disp[i * 3];
          array[v + 1] = rest[v + 1] + disp[i * 3 + 1];
          array[v + 2] = rest[v + 2] + disp[i * 3 + 2];
        }
        energy +=
          vel[i * 3] ** 2 + vel[i * 3 + 1] ** 2 + vel[i * 3 + 2] ** 2 +
          disp[i * 3] ** 2 + disp[i * 3 + 1] ** 2 + disp[i * 3 + 2] ** 2;
      }
      mesh.geometry.attributes.position.needsUpdate = true;
    });
    pointer.poke = 0;
  }

  const t0 = performance.now();
  let raf = 0;
  let visible = true;
  let last = t0;

  function frame(now) {
    raf = 0;
    if (lost) return;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    if (!reduce) {
      ribbons.forEach((ribbon) => {
        const p = Math.min(1, Math.max(0, (t - ribbon.delay) / 1.5));
        const eased = 1 - Math.pow(1 - p, 3);
        ribbon.material.uniforms.uReveal.value = p >= 1 ? 1.01 : eased;
        ribbon.material.uniforms.uOffset.value += ribbon.speed * dt;
        ribbon.material.uniforms.uTime.value = t;
      });
    }
    stepPhysics(dt);
    renderer.render(scene, camera);
    const settling = energy > 1e-6 || pointer.hover;
    if ((!reduce || settling) && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function request() {
    if (!raf && !lost) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  layout();
  bg.classList.add('is-ribbon-live');
  new ResizeObserver(() => {
    layout();
    request();
  }).observe(bg);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) request();
  }).observe(bg);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) request();
  });

  const locate = (event) => {
    const rect = bg.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    return pointer.y >= 0 && pointer.y <= rect.height;
  };
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer.hover = locate(event);
      if (pointer.hover) request();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.hover = false;
  });
  window.addEventListener(
    'pointerdown',
    (event) => {
      // Buttons and links keep their own job.
      if (event.target instanceof Element && event.target.closest('a, button, input')) return;
      if (!locate(event)) return;
      pointer.poke = 1;
      request();
    },
    { passive: true },
  );
  request();
}
