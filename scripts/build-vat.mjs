// VAT compressor — Phase 2b of the DX hero bake pipeline (Plans.md T-010).
//
// Reads the raw per-shape position dumps captured by /dev/capture-dx-vat from
// vat-bake/ and writes compact, shippable VAT assets into public/vat/.
//
// Compression model (per shape):
//   - base pose: the MEAN position of each particle across all frames, stored
//     as float16 RGB. Centering deltas on the mean (not frame 0) makes the
//     per-frame deltas symmetric around zero, so 8-bit quantization spends its
//     range efficiently.
//   - per-axis scale: max |delta| over all frames/particles for X, Y, Z. Lets
//     a flat shape (logo: tiny Z) keep full Z precision instead of wasting it.
//   - deltas: (pos - base) / scale * 127 → int8, per particle per frame.
//
// Playback (P3) reconstructs: pos = base + (delta / 127) * scale, and loops
// ping-pong (0→N-1→0) so the stochastic shimmer never shows a seam.
//
// Output binary (little-endian):
//   magic   uint32  0x31544156  ('VAT1')
//   texW    uint16
//   texH    uint16
//   frames  uint16
//   flags   uint16  (0)
//   scale   float32 × 3   (sx, sy, sz)
//   base    float16 × (N*3)              N = texW*texH, RGB mean pose
//   deltas  int8    × (frames*N*3)       frame-major, RGB
//
// Run: node scripts/build-vat.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IN_DIR = join(ROOT, 'vat-bake');
const OUT_DIR = join(ROOT, 'public', 'vat');
const SHAPES = ['head', 'logo', 'pet'];
const MAGIC = 0x31544156;

// float32 → float16 (IEEE half) bit encoding. Standard round-to-nearest-ish
// implementation; precision is plenty for normalized particle positions.
function toHalf(val) {
  const f = new Float32Array(1);
  const i = new Int32Array(f.buffer);
  f[0] = val;
  const x = i[0];
  const sign = (x >> 16) & 0x8000;
  let exp = ((x >> 23) & 0xff) - 127 + 15;
  let mant = x & 0x7fffff;
  if (exp <= 0) {
    // subnormal / underflow → flush to signed zero (positions never this small)
    return sign;
  }
  if (exp >= 0x1f) {
    // overflow → max half
    return sign | 0x7bff;
  }
  // round mantissa to 10 bits
  mant = mant + 0x1000;
  if (mant & 0x800000) {
    mant = 0;
    exp += 1;
    if (exp >= 0x1f) return sign | 0x7bff;
  }
  return sign | (exp << 10) | (mant >> 13);
}

function buildShape(slug) {
  const inPath = join(IN_DIR, `dx-hero-vat-${slug}.bin`);
  if (!existsSync(inPath)) {
    console.warn(`! skip ${slug}: ${inPath} not found`);
    return null;
  }
  const raw = readFileSync(inPath);
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const texW = dv.getInt32(0, true);
  const texH = dv.getInt32(4, true);
  const frames = dv.getInt32(8, true);
  const N = texW * texH;
  const frameLen = N * 4; // raw is RGBA
  const src = new Float32Array(raw.buffer, raw.byteOffset + 12, frames * frameLen);

  // 1) mean pose per particle (base)
  const base = new Float32Array(N * 3);
  for (let f = 0; f < frames; f++) {
    const fb = f * frameLen;
    for (let i = 0; i < N; i++) {
      base[i * 3] += src[fb + i * 4];
      base[i * 3 + 1] += src[fb + i * 4 + 1];
      base[i * 3 + 2] += src[fb + i * 4 + 2];
    }
  }
  for (let k = 0; k < N * 3; k++) base[k] /= frames;

  // 2) per-axis max |delta|
  let sx = 1e-6, sy = 1e-6, sz = 1e-6;
  for (let f = 0; f < frames; f++) {
    const fb = f * frameLen;
    for (let i = 0; i < N; i++) {
      sx = Math.max(sx, Math.abs(src[fb + i * 4] - base[i * 3]));
      sy = Math.max(sy, Math.abs(src[fb + i * 4 + 1] - base[i * 3 + 1]));
      sz = Math.max(sz, Math.abs(src[fb + i * 4 + 2] - base[i * 3 + 2]));
    }
  }

  // 3) quantize deltas to int8
  const deltas = new Int8Array(frames * N * 3);
  const clamp = (v) => Math.max(-127, Math.min(127, Math.round(v)));
  for (let f = 0; f < frames; f++) {
    const fb = f * frameLen;
    const db = f * N * 3;
    for (let i = 0; i < N; i++) {
      deltas[db + i * 3] = clamp(((src[fb + i * 4] - base[i * 3]) / sx) * 127);
      deltas[db + i * 3 + 1] = clamp(((src[fb + i * 4 + 1] - base[i * 3 + 1]) / sy) * 127);
      deltas[db + i * 3 + 2] = clamp(((src[fb + i * 4 + 2] - base[i * 3 + 2]) / sz) * 127);
    }
  }

  // 4) serialize
  const headerBytes = 4 + 2 + 2 + 2 + 2 + 12; // magic + texW + texH + frames + flags + 3×f32
  const baseBytes = N * 3 * 2; // float16
  const out = new ArrayBuffer(headerBytes + baseBytes + deltas.length);
  const odv = new DataView(out);
  let p = 0;
  odv.setUint32(p, MAGIC, true); p += 4;
  odv.setUint16(p, texW, true); p += 2;
  odv.setUint16(p, texH, true); p += 2;
  odv.setUint16(p, frames, true); p += 2;
  odv.setUint16(p, 0, true); p += 2;
  odv.setFloat32(p, sx, true); p += 4;
  odv.setFloat32(p, sy, true); p += 4;
  odv.setFloat32(p, sz, true); p += 4;
  for (let k = 0; k < N * 3; k++) { odv.setUint16(p, toHalf(base[k]), true); p += 2; }
  new Int8Array(out, p).set(deltas);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `dx-hero-${slug}.vat.bin`);
  writeFileSync(outPath, Buffer.from(out));

  return {
    slug, texW, texH, frames, N,
    scale: [sx.toFixed(3), sy.toFixed(3), sz.toFixed(3)],
    rawMB: (raw.byteLength / 1048576).toFixed(1),
    outMB: (out.byteLength / 1048576).toFixed(2),
  };
}

console.log('VAT compressor → public/vat/');
for (const slug of SHAPES) {
  const r = buildShape(slug);
  if (r) {
    console.log(
      `  ${r.slug.padEnd(5)} ${r.texW}x${r.texH} ${r.frames}f · scale[${r.scale.join(', ')}] · ${r.rawMB}MB → ${r.outMB}MB`,
    );
  }
}
