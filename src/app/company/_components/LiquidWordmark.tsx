'use client';

import { useEffect, useRef } from 'react';

/**
 * GIFT INC. seen through water.
 *
 * The wordmark is a static texture. What moves is a Navier–Stokes velocity
 * field — Stam's "stable fluids" scheme (semi-Lagrangian advection, vorticity
 * confinement, Jacobi pressure projection) — living in small half-float render
 * targets. The display pass refracts the letters through that field: each
 * pixel looks up the local velocity and samples the wordmark from where the
 * water would have carried it. Nothing but velocity is simulated, so when the
 * pointer leaves and the field dissipates the offsets return to zero and the
 * letterforms reassemble exactly where they started.
 *
 * Deliberately monochrome: no dye, no colour split. White type, the page's
 * blue where the surface tilts away from the light. This is a refraction
 * effect on a title, not the homepage fluid.
 *
 * Fallbacks: no WebGL2, no renderable half-float, a shader/link error or a
 * context loss all leave the DOM text in place (data-liquid-active is never
 * set / is removed). Touch-only and reduced-motion users never start the GL.
 */

const SIM_WIDTH = 256; // sim texels across the canvas; height follows the aspect
const SIM_MIN_HEIGHT = 32;
const PRESSURE_ITERATIONS = 24;
const CURL = 8; // vorticity confinement — a little swirl, not texel-scale noise
const VISCOSITY = 0.22; // explicit diffusion per frame (≤ 0.25 is stable); this is what makes it water, not shredded paper
const SPLAT_FORCE = 3000; // pointer UV delta per 60 fps frame → texels / second
const SPLAT_RADIUS = 0.018; // gaussian sigma² in aspect-corrected UV (canvas height = 1)
const ENTRY_RADIUS = 0.035;
const ENTRY_PUSH = 40; // radial texels / second when the pointer first lands
const MAX_FORCE = 180;
const DISSIPATION_ACTIVE = 0.9; // k in v /= 1 + k·dt, pointer over the type
const DISSIPATION_SETTLE = 2.2; // pointer gone — comes to rest over ~1 s, not a snap
const DISPLACE = 0.12; // seconds of travel the refraction shows
const MAX_DISPLACE = 0.06; // UV; keeps displaced type inside the canvas pad
const HIGHLIGHT = 0.04;
const SETTLE_MS = 3200; // stop ticking this long after the pointer left
const MAX_DPR = 2;
const CANVAS_PAD = 8;
const TEXT_FILL = 'rgba(255, 255, 255, 0.94)';

const VERT = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// Samplers default to lowp in ESSL 3.00 fragment shaders; a lowp sampler
// returns a lowp value and the velocity field silently clamps to ±2.
const FRAG_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_texel;
`;

const FRAG_SPLAT = `${FRAG_HEAD}
uniform sampler2D u_target;
uniform float u_aspect;
uniform vec2 u_point;
uniform vec2 u_force;
uniform float u_radius;
uniform float u_radial;
void main() {
  vec2 p = v_uv - u_point;
  p.x *= u_aspect;
  float g = exp(-dot(p, p) / u_radius);
  vec2 dir = p / (length(p) + 1e-4);
  vec2 base = texture(u_target, v_uv).xy;
  outColor = vec4(base + (u_force + dir * u_radial) * g, 0.0, 1.0);
}`;

const FRAG_CURL = `${FRAG_HEAD}
uniform sampler2D u_velocity;
void main() {
  float L = texture(u_velocity, v_uv - vec2(u_texel.x, 0.0)).y;
  float R = texture(u_velocity, v_uv + vec2(u_texel.x, 0.0)).y;
  float B = texture(u_velocity, v_uv - vec2(0.0, u_texel.y)).x;
  float T = texture(u_velocity, v_uv + vec2(0.0, u_texel.y)).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const FRAG_VORTICITY = `${FRAG_HEAD}
uniform sampler2D u_velocity;
uniform sampler2D u_curl;
uniform float u_curlStrength;
uniform float u_dt;
void main() {
  float L = texture(u_curl, v_uv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_curl, v_uv + vec2(u_texel.x, 0.0)).x;
  float B = texture(u_curl, v_uv - vec2(0.0, u_texel.y)).x;
  float T = texture(u_curl, v_uv + vec2(0.0, u_texel.y)).x;
  float C = texture(u_curl, v_uv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 1e-4;
  force *= u_curlStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture(u_velocity, v_uv).xy + force * u_dt;
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`;

const FRAG_DIVERGENCE = `${FRAG_HEAD}
uniform sampler2D u_velocity;
void main() {
  vec2 vL = v_uv - vec2(u_texel.x, 0.0);
  vec2 vR = v_uv + vec2(u_texel.x, 0.0);
  vec2 vB = v_uv - vec2(0.0, u_texel.y);
  vec2 vT = v_uv + vec2(0.0, u_texel.y);
  float L = texture(u_velocity, vL).x;
  float R = texture(u_velocity, vR).x;
  float B = texture(u_velocity, vB).y;
  float T = texture(u_velocity, vT).y;
  vec2 C = texture(u_velocity, v_uv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vB.y < 0.0) B = -C.y;
  if (vT.y > 1.0) T = -C.y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const FRAG_CLEAR = `${FRAG_HEAD}
uniform sampler2D u_target;
uniform float u_value;
void main() {
  outColor = u_value * texture(u_target, v_uv);
}`;

const FRAG_PRESSURE = `${FRAG_HEAD}
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
void main() {
  float L = texture(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x;
  float B = texture(u_pressure, v_uv - vec2(0.0, u_texel.y)).x;
  float T = texture(u_pressure, v_uv + vec2(0.0, u_texel.y)).x;
  float divergence = texture(u_divergence, v_uv).x;
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const FRAG_GRADIENT = `${FRAG_HEAD}
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
void main() {
  float L = texture(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x;
  float R = texture(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x;
  float B = texture(u_pressure, v_uv - vec2(0.0, u_texel.y)).x;
  float T = texture(u_pressure, v_uv + vec2(0.0, u_texel.y)).x;
  vec2 velocity = texture(u_velocity, v_uv).xy - vec2(R - L, T - B);
  outColor = vec4(velocity, 0.0, 1.0);
}`;

const FRAG_ADVECT = `${FRAG_HEAD}
uniform sampler2D u_velocity;
uniform float u_dt;
uniform float u_dissipation;
void main() {
  vec2 coord = v_uv - u_dt * texture(u_velocity, v_uv).xy * u_texel;
  vec2 result = texture(u_velocity, coord).xy;
  outColor = vec4(result / (1.0 + u_dissipation * u_dt), 0.0, 1.0);
}`;

const FRAG_VISCOSITY = `${FRAG_HEAD}
uniform sampler2D u_velocity;
uniform float u_viscosity;
void main() {
  vec2 C = texture(u_velocity, v_uv).xy;
  vec2 L = texture(u_velocity, v_uv - vec2(u_texel.x, 0.0)).xy;
  vec2 R = texture(u_velocity, v_uv + vec2(u_texel.x, 0.0)).xy;
  vec2 B = texture(u_velocity, v_uv - vec2(0.0, u_texel.y)).xy;
  vec2 T = texture(u_velocity, v_uv + vec2(0.0, u_texel.y)).xy;
  outColor = vec4(mix(C, (L + R + B + T) * 0.25, u_viscosity), 0.0, 1.0);
}`;

const FRAG_DISPLAY = `${FRAG_HEAD}
uniform sampler2D u_wordmark;
uniform sampler2D u_velocity;
uniform float u_displace;
uniform float u_maxDisplace;
uniform float u_highlight;
const vec3 WATER_TINT = vec3(0.376, 0.647, 0.980); // #60a5fa
void main() {
  vec2 vC = texture(u_velocity, v_uv).xy;
  vec2 vL = texture(u_velocity, v_uv - vec2(u_texel.x, 0.0)).xy;
  vec2 vR = texture(u_velocity, v_uv + vec2(u_texel.x, 0.0)).xy;
  vec2 vB = texture(u_velocity, v_uv - vec2(0.0, u_texel.y)).xy;
  vec2 vT = texture(u_velocity, v_uv + vec2(0.0, u_texel.y)).xy;
  // One more tap of smoothing at display time keeps the refraction silky
  // even on the frame right after a fast splat.
  vec2 vel = vC * 0.4 + (vL + vR + vB + vT) * 0.15;
  vec2 disp = vel * u_texel * u_displace;
  float mag = length(disp);
  if (mag > u_maxDisplace) disp *= u_maxDisplace / mag;
  vec4 word = texture(u_wordmark, v_uv - disp);

  // The gradient of flow speed is the slope of the water surface. Lit from the
  // top-right: the near side of a ripple whitens, the far side sinks toward
  // the page blue. Premultiplied throughout, so rgb never exceeds alpha.
  float lit = ((length(vR) - length(vL)) * 0.6 + (length(vT) - length(vB)) * 0.8) * u_highlight;
  float shade = clamp(-lit, 0.0, 0.55);
  float gloss = clamp(lit, 0.0, 1.0);
  vec3 rgb = mix(word.rgb, WATER_TINT * word.a, shade);
  rgb = mix(rgb, vec3(word.a), gloss);
  outColor = vec4(rgb, word.a);
}`;

type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };
type Swap = { read: Target; write: Target };
type Program = { handle: WebGLProgram; uniform: (name: string) => WebGLUniformLocation | null };
type Format = { internal: number; format: number };

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create wordmark shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown wordmark shader error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertex: WebGLShader, fragmentSource: string): Program {
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const handle = gl.createProgram();
  if (!handle) {
    gl.deleteShader(fragment);
    throw new Error('Unable to create wordmark program.');
  }
  gl.attachShader(handle, vertex);
  gl.attachShader(handle, fragment);
  gl.linkProgram(handle);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(handle) || 'Unknown wordmark link error.';
    gl.deleteProgram(handle);
    throw new Error(message);
  }
  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    handle,
    uniform: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(handle, name));
      return cache.get(name) ?? null;
    },
  };
}

function createTarget(gl: WebGL2RenderingContext, width: number, height: number, fmt: Format): Target | null {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) {
    if (texture) gl.deleteTexture(texture);
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, width, height, 0, fmt.format, gl.HALF_FLOAT, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!complete) {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    return null;
  }
  return { texture, framebuffer };
}

function deleteTarget(gl: WebGL2RenderingContext, target: Target | null) {
  if (!target) return;
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.framebuffer);
}

// Drivers disagree on which half-float layouts are colour-renderable; probe
// with a real framebuffer rather than trusting the extension name.
function pickFormat(gl: WebGL2RenderingContext, candidates: Format[]): Format | null {
  for (const candidate of candidates) {
    const probe = createTarget(gl, 4, 4, candidate);
    if (probe) {
      deleteTarget(gl, probe);
      return candidate;
    }
  }
  return null;
}

export default function LiquidWordmark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
    if (reducedMotion || !hasFinePointer) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;

    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) {
      console.warn('[LiquidWordmark] DOM fallback: half-float render targets unavailable.');
      return;
    }

    let destroyed = false;
    let lost = false;
    let running = false;
    let frameId = 0;
    let previousFrame = 0;
    let onScreen = true;
    let pageVisible = document.visibilityState !== 'hidden';
    let canvasPad = CANVAS_PAD;
    let simWidth = 0;
    let simHeight = 0;
    let aspect = 1;
    let dissipation = DISSIPATION_SETTLE;
    let dissipationTarget = DISSIPATION_SETTLE;
    let leftAt = 0;
    const pointer = { inside: false, x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, moved: false, entry: false };

    let vertexShader: WebGLShader | null = null;
    let vertexBuffer: WebGLBuffer | null = null;
    let vertexArray: WebGLVertexArrayObject | null = null;
    let wordmarkTexture: WebGLTexture | null = null;
    const programs: Program[] = [];
    let velocity: Swap | null = null;
    let pressure: Swap | null = null;
    let divergence: Target | null = null;
    let curl: Target | null = null;

    let splatProgram: Program;
    let curlProgram: Program;
    let vorticityProgram: Program;
    let divergenceProgram: Program;
    let clearProgram: Program;
    let pressureProgram: Program;
    let gradientProgram: Program;
    let advectProgram: Program;
    let viscosityProgram: Program;
    let displayProgram: Program;
    let vectorFormat: Format;
    let scalarFormat: Format;

    const deactivate = () => root.removeAttribute('data-liquid-active');
    const stop = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    try {
      vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERT);
      const make = (source: string) => {
        const program = createProgram(gl, vertexShader as WebGLShader, source);
        programs.push(program);
        return program;
      };
      splatProgram = make(FRAG_SPLAT);
      curlProgram = make(FRAG_CURL);
      vorticityProgram = make(FRAG_VORTICITY);
      divergenceProgram = make(FRAG_DIVERGENCE);
      clearProgram = make(FRAG_CLEAR);
      pressureProgram = make(FRAG_PRESSURE);
      gradientProgram = make(FRAG_GRADIENT);
      advectProgram = make(FRAG_ADVECT);
      viscosityProgram = make(FRAG_VISCOSITY);
      displayProgram = make(FRAG_DISPLAY);

      vertexBuffer = gl.createBuffer();
      vertexArray = gl.createVertexArray();
      if (!vertexBuffer || !vertexArray) throw new Error('Unable to create wordmark geometry.');
      gl.bindVertexArray(vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const positionLocation = gl.getAttribLocation(splatProgram.handle, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const vector = pickFormat(gl, [
        { internal: gl.RG16F, format: gl.RG },
        { internal: gl.RGBA16F, format: gl.RGBA },
      ]);
      const scalar = pickFormat(gl, [
        { internal: gl.R16F, format: gl.RED },
        { internal: gl.RG16F, format: gl.RG },
        { internal: gl.RGBA16F, format: gl.RGBA },
      ]);
      if (!vector || !scalar) throw new Error('No renderable half-float format.');
      vectorFormat = vector;
      scalarFormat = scalar;

      wordmarkTexture = gl.createTexture();
      if (!wordmarkTexture) throw new Error('Unable to create wordmark texture.');
      gl.bindTexture(gl.TEXTURE_2D, wordmarkTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.disable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
    } catch (error) {
      console.warn('[LiquidWordmark] DOM fallback:', error);
      for (const program of programs) gl.deleteProgram(program.handle);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      if (vertexArray) gl.deleteVertexArray(vertexArray);
      if (wordmarkTexture) gl.deleteTexture(wordmarkTexture);
      return;
    }

    const bindTexture = (unit: number, texture: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    };

    const blit = (target: Target | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const swap = (pair: Swap) => {
      const read = pair.read;
      pair.read = pair.write;
      pair.write = read;
    };

    const releaseSim = () => {
      if (velocity) {
        deleteTarget(gl, velocity.read);
        deleteTarget(gl, velocity.write);
      }
      if (pressure) {
        deleteTarget(gl, pressure.read);
        deleteTarget(gl, pressure.write);
      }
      deleteTarget(gl, divergence);
      deleteTarget(gl, curl);
      velocity = null;
      pressure = null;
      divergence = null;
      curl = null;
    };

    const allocateSim = (width: number, height: number) => {
      releaseSim();
      const v0 = createTarget(gl, width, height, vectorFormat);
      const v1 = createTarget(gl, width, height, vectorFormat);
      const p0 = createTarget(gl, width, height, scalarFormat);
      const p1 = createTarget(gl, width, height, scalarFormat);
      const d = createTarget(gl, width, height, scalarFormat);
      const c = createTarget(gl, width, height, scalarFormat);
      if (!v0 || !v1 || !p0 || !p1 || !d || !c) {
        for (const target of [v0, v1, p0, p1, d, c]) deleteTarget(gl, target);
        throw new Error('Unable to allocate the fluid targets.');
      }
      velocity = { read: v0, write: v1 };
      pressure = { read: p0, write: p1 };
      divergence = d;
      curl = c;
      simWidth = width;
      simHeight = height;
      aspect = width / height;
      for (const program of programs) {
        gl.useProgram(program.handle);
        gl.uniform2f(program.uniform('u_texel'), 1 / width, 1 / height);
      }
    };

    const clearField = () => {
      if (!velocity || !pressure || !divergence || !curl) return;
      for (const target of [velocity.read, velocity.write, pressure.read, pressure.write, divergence, curl]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const splat = (x: number, y: number, fx: number, fy: number, radius: number, radial: number) => {
      if (!velocity) return;
      gl.useProgram(splatProgram.handle);
      bindTexture(0, velocity.read.texture);
      gl.uniform1i(splatProgram.uniform('u_target'), 0);
      gl.uniform1f(splatProgram.uniform('u_aspect'), aspect);
      gl.uniform2f(splatProgram.uniform('u_point'), x, y);
      gl.uniform2f(splatProgram.uniform('u_force'), fx, fy);
      gl.uniform1f(splatProgram.uniform('u_radius'), radius);
      gl.uniform1f(splatProgram.uniform('u_radial'), radial);
      blit(velocity.write);
      swap(velocity);
    };

    const step = (dt: number) => {
      if (!velocity || !pressure || !divergence || !curl) return;
      gl.bindVertexArray(vertexArray);
      gl.viewport(0, 0, simWidth, simHeight);

      if (pointer.entry) {
        pointer.entry = false;
        splat(pointer.x, pointer.y, 0, 0, ENTRY_RADIUS, ENTRY_PUSH);
      }
      if (pointer.moved) {
        pointer.moved = false;
        const dx = pointer.x - pointer.prevX;
        const dy = pointer.y - pointer.prevY;
        // Velocity is texels/second and the sim grid keeps the canvas aspect,
        // so an isotropic screen push needs the y force scaled by 1/aspect.
        // The delta is per frame; normalise to 60 fps so a slow frame (or a
        // 120 Hz display) injects the same velocity for the same hand speed.
        const frameScale = Math.min(2, Math.max(0.25, 1 / 60 / dt));
        let fx = dx * SPLAT_FORCE * frameScale;
        let fy = (dy * SPLAT_FORCE * frameScale) / aspect;
        const magnitude = Math.hypot(fx, fy);
        if (magnitude > MAX_FORCE) {
          fx *= MAX_FORCE / magnitude;
          fy *= MAX_FORCE / magnitude;
        }
        // A fast stroke crosses several sigmas between frames; lay the
        // footprint down along the segment so it reads as one stroke.
        const travel = Math.hypot(dx * aspect, dy);
        const spacing = Math.sqrt(SPLAT_RADIUS) * 1.5;
        const steps = Math.min(5, Math.max(1, Math.ceil(travel / spacing)));
        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps;
          splat(pointer.prevX + dx * t, pointer.prevY + dy * t, fx, fy, SPLAT_RADIUS, 0);
        }
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
      }

      gl.useProgram(curlProgram.handle);
      bindTexture(0, velocity.read.texture);
      gl.uniform1i(curlProgram.uniform('u_velocity'), 0);
      blit(curl);

      gl.useProgram(vorticityProgram.handle);
      bindTexture(0, velocity.read.texture);
      bindTexture(1, curl.texture);
      gl.uniform1i(vorticityProgram.uniform('u_velocity'), 0);
      gl.uniform1i(vorticityProgram.uniform('u_curl'), 1);
      gl.uniform1f(vorticityProgram.uniform('u_curlStrength'), CURL);
      gl.uniform1f(vorticityProgram.uniform('u_dt'), dt);
      blit(velocity.write);
      swap(velocity);

      gl.useProgram(divergenceProgram.handle);
      bindTexture(0, velocity.read.texture);
      gl.uniform1i(divergenceProgram.uniform('u_velocity'), 0);
      blit(divergence);

      gl.useProgram(clearProgram.handle);
      bindTexture(0, pressure.read.texture);
      gl.uniform1i(clearProgram.uniform('u_target'), 0);
      gl.uniform1f(clearProgram.uniform('u_value'), 0.8);
      blit(pressure.write);
      swap(pressure);

      gl.useProgram(pressureProgram.handle);
      bindTexture(1, divergence.texture);
      gl.uniform1i(pressureProgram.uniform('u_pressure'), 0);
      gl.uniform1i(pressureProgram.uniform('u_divergence'), 1);
      for (let i = 0; i < PRESSURE_ITERATIONS; i += 1) {
        bindTexture(0, pressure.read.texture);
        blit(pressure.write);
        swap(pressure);
      }

      gl.useProgram(gradientProgram.handle);
      bindTexture(0, pressure.read.texture);
      bindTexture(1, velocity.read.texture);
      gl.uniform1i(gradientProgram.uniform('u_pressure'), 0);
      gl.uniform1i(gradientProgram.uniform('u_velocity'), 1);
      blit(velocity.write);
      swap(velocity);

      gl.useProgram(advectProgram.handle);
      bindTexture(0, velocity.read.texture);
      gl.uniform1i(advectProgram.uniform('u_velocity'), 0);
      gl.uniform1f(advectProgram.uniform('u_dt'), dt);
      gl.uniform1f(advectProgram.uniform('u_dissipation'), dissipation);
      blit(velocity.write);
      swap(velocity);

      gl.useProgram(viscosityProgram.handle);
      bindTexture(0, velocity.read.texture);
      gl.uniform1i(viscosityProgram.uniform('u_velocity'), 0);
      gl.uniform1f(viscosityProgram.uniform('u_viscosity'), VISCOSITY);
      blit(velocity.write);
      swap(velocity);
    };

    const draw = () => {
      if (!velocity || !wordmarkTexture) return;
      gl.bindVertexArray(vertexArray);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(displayProgram.handle);
      bindTexture(0, wordmarkTexture);
      bindTexture(1, velocity.read.texture);
      gl.uniform1i(displayProgram.uniform('u_wordmark'), 0);
      gl.uniform1i(displayProgram.uniform('u_velocity'), 1);
      gl.uniform1f(displayProgram.uniform('u_displace'), DISPLACE);
      gl.uniform1f(displayProgram.uniform('u_maxDisplace'), MAX_DISPLACE);
      gl.uniform1f(displayProgram.uniform('u_highlight'), HIGHLIGHT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const tick = (now: number) => {
      if (!running || lost) return;
      frameId = requestAnimationFrame(tick);
      const dt = previousFrame ? Math.min(1 / 30, (now - previousFrame) / 1000) : 1 / 60;
      previousFrame = now;

      dissipation += (dissipationTarget - dissipation) * (1 - Math.exp(-dt * 5));
      step(dt);
      draw();

      if (!pointer.inside && now - leftAt > SETTLE_MS) {
        stop();
        clearField();
        draw();
      }
    };

    const start = () => {
      if (running || lost || !onScreen || !pageVisible || !velocity) return;
      running = true;
      previousFrame = 0;
      frameId = requestAnimationFrame(tick);
    };

    const rasterWordmark = (stacked: boolean, rect: DOMRect, style: CSSStyleDeclaration, dpr: number) => {
      const raster = document.createElement('canvas');
      raster.width = canvas.width;
      raster.height = canvas.height;
      const context = raster.getContext('2d');
      if (!context) return false;

      const fontSize = Number.parseFloat(style.fontSize);
      context.scale(dpr, dpr);
      context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      context.fillStyle = TEXT_FILL;
      context.textBaseline = 'alphabetic';
      const spaced = context as CanvasRenderingContext2D & { letterSpacing?: string };
      spaced.letterSpacing = style.letterSpacing;
      // Same shadow as .co-hero__wordmark; blur/offset ignore the CTM.
      context.shadowColor = 'rgba(5, 12, 26, 0.22)';
      context.shadowBlur = 32 * dpr;
      context.shadowOffsetY = 2 * dpr;

      // CSS centres the font's content area (ascent + descent) inside the line
      // box, so the baseline sits at half-leading + ascent from the line top.
      const lines = stacked ? ['GIFT', 'INC.'] : ['GIFT INC.'];
      const lineHeight = rect.height / lines.length;
      const metrics = context.measureText(lines[0]);
      const ascent = metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent || fontSize * 0.8;
      const descent = metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent || fontSize * 0.2;
      const baseline = canvasPad + (lineHeight - (ascent + descent)) / 2 + ascent;
      lines.forEach((line, index) => {
        context.fillText(line, canvasPad, baseline + index * lineHeight);
      });

      bindTexture(0, wordmarkTexture as WebGLTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      return true;
    };

    const resize = () => {
      if (destroyed || lost) return false;
      const rect = root.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;

      const style = getComputedStyle(root);
      const fontSize = Number.parseFloat(style.fontSize);
      const stacked = window.matchMedia('(max-width: 767px)').matches;
      canvasPad = stacked ? CANVAS_PAD : Math.ceil(fontSize * 0.65);
      root.style.setProperty('--wordmark-canvas-pad', `${canvasPad}px`);

      const cssWidth = Math.ceil(rect.width + canvasPad * 2);
      const cssHeight = Math.ceil(rect.height + canvasPad * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);

      const nextSimHeight = Math.max(
        SIM_MIN_HEIGHT,
        Math.min(SIM_WIDTH, Math.round((SIM_WIDTH * cssHeight) / cssWidth)),
      );
      try {
        if (!velocity || nextSimHeight !== simHeight) allocateSim(SIM_WIDTH, nextSimHeight);
      } catch (error) {
        console.warn('[LiquidWordmark] DOM fallback:', error);
        stop();
        deactivate();
        lost = true;
        return false;
      }

      if (!rasterWordmark(stacked, rect, style, dpr)) return false;
      draw();
      return true;
    };

    const updatePointer = (event: PointerEvent, entry: boolean) => {
      const rect = root.getBoundingClientRect();
      const width = rect.width + canvasPad * 2;
      const height = rect.height + canvasPad * 2;
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left + canvasPad) / width));
      const y = 1 - Math.max(0, Math.min(1, (event.clientY - rect.top + canvasPad) / height));
      pointer.x = x;
      pointer.y = y;
      if (entry) {
        pointer.prevX = x;
        pointer.prevY = y;
        pointer.entry = true;
      } else {
        pointer.moved = true;
      }
      start();
    };

    const onPointerEnter = (event: PointerEvent) => {
      pointer.inside = true;
      dissipationTarget = DISSIPATION_ACTIVE;
      updatePointer(event, true);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.inside) {
        onPointerEnter(event);
        return;
      }
      updatePointer(event, false);
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.moved = false;
      leftAt = performance.now();
      dissipationTarget = DISSIPATION_SETTLE;
      start();
    };
    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden';
      if (!pageVisible) stop();
      else if (pointer.inside || (velocity && performance.now() - leftAt < SETTLE_MS)) start();
    };
    const onContextLost = () => {
      lost = true;
      stop();
      deactivate();
    };

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(root);
    const intersectionObserver = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (!onScreen) {
        pointer.inside = false;
        stop();
        if (!lost) {
          clearField();
          draw();
        }
      }
    });
    intersectionObserver.observe(root);

    root.addEventListener('pointerenter', onPointerEnter);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);

    // Only swap the DOM text for the canvas once the real face has rendered
    // into the texture; before that the canvas would show the fallback font.
    void document.fonts.ready.then(() => {
      if (destroyed || lost) return;
      if (resize()) root.setAttribute('data-liquid-active', '');
    });

    return () => {
      destroyed = true;
      stop();
      observer.disconnect();
      intersectionObserver.disconnect();
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      deactivate();
      root.style.removeProperty('--wordmark-canvas-pad');
      if (!gl.isContextLost()) {
        releaseSim();
        for (const program of programs) gl.deleteProgram(program.handle);
        if (vertexShader) gl.deleteShader(vertexShader);
        if (wordmarkTexture) gl.deleteTexture(wordmarkTexture);
        if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
        if (vertexArray) gl.deleteVertexArray(vertexArray);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="co-hero__wordmark" data-hero-ui aria-label="GIFT INC.">
      <span className="co-hero__wordmark-text" aria-hidden>
        <span>GIFT</span>{' '}
        <span>INC.</span>
      </span>
      <canvas ref={canvasRef} className="co-hero__wordmark-liquid" aria-hidden tabIndex={-1} />
    </div>
  );
}
