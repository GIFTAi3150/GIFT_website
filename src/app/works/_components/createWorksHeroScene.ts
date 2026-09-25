/*!
 * Grainient shader adapted from React Bits by David Haz (c) 2026.
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/Grainient/Grainient.tsx
 * MIT + Commons Clause. Full notice: /licenses/react-bits.txt
 * Adaptation: GIFT palette, UV-based sampling, fixed parameters baked into
 * the shader, and a raw WebGL1 lifecycle for the Works page background.
 */

export type WorksHeroScene = {
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
};

// Raw WebGL on purpose: this canvas only paints a full-screen gradient, and the
// Three.js version had to download ~600KB of library before its first frame,
// which is why the background used to arrive late.

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Parameters of the previous uniforms are baked in (timeSpeed 0.25, zoom 0.9,
// noiseScale 2, rotation 500, warp freq 5 / speed 2 / amplitude 50, blend
// softness 0.05, grain 0.065 × scale 2; contrast/gamma/saturation were identity).
// Colours are the sRGB values of #cbd4ff, #91baff, #edf7ff; a raw canvas outputs
// sRGB directly, so no linear conversion is needed.
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 iResolution;
uniform float iTime;
varying vec2 vUv;
const vec3 COLOR_1 = vec3(0.7961, 0.8314, 1.0);
const vec3 COLOR_2 = vec3(0.5686, 0.7294, 1.0);
const vec3 COLOR_3 = vec3(0.9294, 0.9686, 1.0);
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void main() {
  float t = iTime * 0.25;
  vec2 uv = vUv;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = (uv - 0.5) / 0.9;

  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * 2.0);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians((degree - 0.5) * 500.0 + 180.0));
  tuv.y *= ratio;

  float warpTime = t * 2.0;
  tuv.x += sin(tuv.y * 5.0 + warpTime) / 50.0;
  tuv.y += sin(tuv.x * 7.5 + warpTime) / 25.0;

  float blend = smoothstep(-0.35, 0.25, tuv.x);
  vec3 layer1 = mix(COLOR_3, COLOR_2, blend);
  vec3 layer2 = mix(COLOR_2, COLOR_1, blend);
  vec3 col = mix(layer1, layer2, 1.0 - smoothstep(-0.35, 0.55, tuv.y));

  float grain = fract(sin(dot(uv * 2.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.065;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('works background: createShader failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('works background: shader compile failed: ' + log);
  }
  return shader;
}

export function createWorksHeroScene(
  canvas: HTMLCanvasElement,
  initialReducedMotion: boolean,
  onFailure: () => void,
): WorksHeroScene {
  let disposed = false;
  let failed = false;
  let active = true;
  let reduced = initialReducedMotion;
  let frame = 0;
  let elapsed = 0;
  let previousTime = 0;
  let observer: ResizeObserver | undefined;

  const fail = () => {
    if (failed || disposed) return;
    failed = true;
    cancelAnimationFrame(frame);
    canvas.dataset.motion = 'unavailable';
    onFailure();
  };

  // Registered BEFORE getContext and never preventDefault()ed: no restoration
  // attempt, so a lost context can't tick Chrome's "guilty page" counter.
  const onContextLost = (event: Event) => {
    event.stopImmediatePropagation();
    fail();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) {
    canvas.removeEventListener('webglcontextlost', onContextLost);
    throw new Error('works background: WebGL unavailable');
  }

  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  const shaders: WebGLShader[] = [];

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    if (!gl.isContextLost()) {
      if (program) gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
      if (buffer) gl.deleteBuffer(buffer);
    }
    // Free the context only once the canvas has left the page (route change).
    // Strict Mode / HMR remount the same canvas; losing its context there
    // would hand the next mount a dead context and a blank background.
    setTimeout(() => {
      if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.removeEventListener('webglcontextlost', onContextLost);
    }, 0);
  };

  try {
    shaders.push(compile(gl, gl.VERTEX_SHADER, VERTEX), compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    program = gl.createProgram();
    if (!program) throw new Error('works background: createProgram failed');
    shaders.forEach((shader) => gl.attachShader(program!, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      throw new Error('works background: link failed: ' + gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // One oversized triangle covers the whole viewport.
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const timeLocation = gl.getUniformLocation(program, 'iTime');

    const paint = () => {
      if (disposed || failed || gl.isContextLost()) return;
      gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      if (disposed || failed) return;
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, width, height);
      paint();
    };

    const tick = (now: number) => {
      if (disposed || failed || !active || reduced) return;
      frame = requestAnimationFrame(tick);
      // This decorative effect does not need to render at a display's 120/144Hz.
      if (previousTime && now - previousTime < 1000 / 30) return;
      const frameDelta = previousTime ? (now - previousTime) / 1000 : 0;
      previousTime = now;
      elapsed += Math.min(frameDelta, 0.1);
      paint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      canvas.dataset.motion = reduced ? 'still' : active ? 'running' : 'paused';
      if (disposed || failed) return;
      if (active) paint();
      if (active && !reduced) frame = requestAnimationFrame(tick);
    };

    resize();
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.dataset.background = 'grainient';
    sync();

    return {
      setActive(next) {
        active = next;
        sync();
      },
      setReducedMotion(next) {
        reduced = next;
        sync();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
