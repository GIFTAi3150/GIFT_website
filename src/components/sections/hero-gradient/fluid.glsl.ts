// GPU stable-fluids shader set — a faithful port of the sales-dex.jp hero.
//
// The reference hero is NOT a procedural gradient and NOT a cursor-tracked
// light. It is a velocity-only GPU fluid simulation (Navier–Stokes, the
// classic Stam "stable fluids" scheme) whose velocity field is sampled by a
// final display pass to warp a flat image's UVs, plus a speed-scaled
// chromatic aberration. The cursor injects force "splats" into the velocity
// field; pressure projection keeps the flow incompressible.
//
// Every shader below was extracted verbatim from the live Framer bundle
// (framerusercontent.com/.../L7HPkGdSYbXq36U7mcbsyyldIweXb_*.mjs) and the
// template helpers (texelSize prelude, neighbour offsets, edge scale) were
// inlined. Do not "improve" these — they are the ground truth.

// --- vertex: fullscreen passes that need 4-neighbour taps (divergence,
//     pressure gradient-subtract). offset multiplier = 1 texel. ---
export const VERT_MAIN = /* glsl */ `
  uniform bool bounce;
  uniform vec2 texelSize;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 scale = bounce ? vec2(1.0, 1.0) : 1.0 - texelSize * 2.0;
    pos.xy = pos.xy * scale;
    vUv = vec2(0.5) + (pos.xy) * 0.5;
    vL = vUv - vec2(texelSize.x * 1.0, 0.0);
    vR = vUv + vec2(texelSize.x * 1.0, 0.0);
    vT = vUv + vec2(0.0, texelSize.y * 1.0);
    vB = vUv - vec2(0.0, texelSize.y * 1.0);
    gl_Position = vec4(pos, 1.0);
  }
`;

// --- vertex: jacobi pressure pass. identical to MAIN but neighbour offset = 2
//     texels (wider stencil for the poisson solve). ---
export const VERT_POISSON = /* glsl */ `
  uniform bool bounce;
  uniform vec2 texelSize;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 scale = bounce ? vec2(1.0, 1.0) : 1.0 - texelSize * 2.0;
    pos.xy = pos.xy * scale;
    vUv = vec2(0.5) + (pos.xy) * 0.5;
    vL = vUv - vec2(texelSize.x * 2.0, 0.0);
    vR = vUv + vec2(texelSize.x * 2.0, 0.0);
    vT = vUv + vec2(0.0, texelSize.y * 2.0);
    vB = vUv - vec2(0.0, texelSize.y * 2.0);
    gl_Position = vec4(pos, 1.0);
  }
`;

// --- vertex: advection. single centre tap, slight edge inset (no bounce). ---
export const VERT_ADVECTION = /* glsl */ `
  uniform vec2 texelSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 scale = 1.0 - texelSize * 2.0;
    pos.xy = pos.xy * scale;
    vUv = vec2(0.5) + (pos.xy) * 0.5;
    gl_Position = vec4(pos, 1.0);
  }
`;

// --- vertex: splat. draws a small quad (PlaneGeometry(1,1)) of size
//     radius*2*texel around `center` (clip space / NDC). ---
export const VERT_SPLAT = /* glsl */ `
  uniform vec2 center;
  uniform vec2 radius;
  uniform vec2 texelSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec2 pos = position.xy * radius * 2.0 * texelSize + center;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

// --- fragment: advect the velocity field by itself (semi-Lagrangian),
//     applying dissipation. maxAspect keeps motion isotropic in sim space. ---
export const FRAG_ADVECTION = /* glsl */ `
  precision highp float;
  uniform float deltaTime;
  uniform sampler2D velocity;
  uniform float dissipation;
  uniform vec2 maxAspect;
  varying vec2 vUv;
  void main() {
    vec2 vel = texture2D(velocity, vUv).xy;
    vec2 uv2 = vUv - vel * deltaTime * maxAspect;
    vec2 newVel = texture2D(velocity, uv2).xy;
    gl_FragColor = vec4(dissipation * newVel, 0.0, 0.0);
  }
`;

// --- fragment: divergence of the velocity field. ---
export const FRAG_DIVERGENCE = /* glsl */ `
  precision highp float;
  uniform float deltaTime;
  uniform sampler2D velocity;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    float L = texture2D(velocity, vL).r;
    float R = texture2D(velocity, vR).r;
    float B = texture2D(velocity, vB).g;
    float T = texture2D(velocity, vT).g;
    float divergence = (R - L + T - B) / 2.0;
    gl_FragColor = vec4(divergence / deltaTime);
  }
`;

// --- fragment: one jacobi iteration of the pressure poisson solve. ---
export const FRAG_POISSON = /* glsl */ `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    float L = texture2D(pressure, vL).r;
    float R = texture2D(pressure, vR).r;
    float B = texture2D(pressure, vB).r;
    float T = texture2D(pressure, vT).r;
    float div = texture2D(divergence, vUv).r;
    float newP = (L + R + B + T) / 4.0 - div;
    gl_FragColor = vec4(newP);
  }
`;

// --- fragment: subtract pressure gradient → divergence-free velocity. ---
export const FRAG_PRESSURE = /* glsl */ `
  precision highp float;
  uniform float deltaTime;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    float L = texture2D(pressure, vL).r;
    float R = texture2D(pressure, vR).r;
    float B = texture2D(pressure, vB).r;
    float T = texture2D(pressure, vT).r;
    vec2 v = texture2D(velocity, vUv).xy;
    vec2 gradP = vec2(R - L, T - B) * 0.5;
    v = v - gradP * deltaTime;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

// --- fragment: splat a soft circular force into the velocity field
//     (additive blending). vUv runs 0..1 across the small quad. ---
export const FRAG_SPLAT = /* glsl */ `
  precision highp float;
  uniform vec2 force;
  uniform float forceBias;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(
      force * forceBias * pow(1.0 - clamp(2.0 * distance(vUv, vec2(0.5)), 0.0, 1.0), 2.0),
      0.0,
      1.0
    );
  }
`;

// --- display: fullscreen pass. PlaneGeometry(2,2), position already in
//     clip space so the camera is irrelevant. ---
export const VERT_DISPLAY = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// --- display fragment: warp the source image's UVs by the local fluid
//     velocity, with a speed-scaled RGB split (chromatic aberration). ---
export const FRAG_DISPLAY = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D src;          // fluid velocity field (rg)
  uniform sampler2D mainTexture;  // the hero image being distorted
  uniform vec2 fitScale;          // object-fit: cover
  uniform float distortionStrength;
  uniform float chromaticStrength;
  void main() {
    vec2 scaledUV = vUv * fitScale + (1.0 - fitScale) * 0.5;
    vec2 vel = texture2D(src, vUv).rg;
    float len = length(vel);
    vec2 baseOffset = vel * distortionStrength * 0.1;
    vec2 dir = normalize(vel + vec2(1e-6));
    vec2 chromaticAmount = dir * chromaticStrength * 0.01 * len;
    vec4 cR = texture2D(mainTexture, scaledUV + baseOffset + chromaticAmount);
    vec4 cG = texture2D(mainTexture, scaledUV + baseOffset);
    vec4 cB = texture2D(mainTexture, scaledUV + baseOffset - chromaticAmount);
    gl_FragColor = vec4(cR.r, cG.g, cB.b, cG.a);
  }
`;
