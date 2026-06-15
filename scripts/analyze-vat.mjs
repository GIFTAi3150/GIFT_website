// One-off diagnostic: parse the RAW logo capture and report per-frame cloud
// geometry so we can SEE what the playback animation actually does, instead of
// guessing. Prints centroid, RMS radius (spread), bbox, and frame-to-frame
// motion — plus the seam jump (last frame -> first frame).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'vat-bake', 'dx-hero-vat-logo.bin');
const raw = readFileSync(path);
const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
const texW = dv.getInt32(0, true);
const texH = dv.getInt32(4, true);
const frames = dv.getInt32(8, true);
const N = texW * texH;
const frameLen = N * 4;
const src = new Float32Array(raw.buffer, raw.byteOffset + 12, frames * frameLen);

console.log(`logo: ${texW}x${texH} N=${N} frames=${frames}`);

// Per-frame stats
const stats = [];
for (let f = 0; f < frames; f++) {
  const fb = f * frameLen;
  let cx = 0, cy = 0, cz = 0;
  let live = 0; // particles with non-zero position (detect collapsed frames)
  let minx = 1e9, miny = 1e9, minz = 1e9, maxx = -1e9, maxy = -1e9, maxz = -1e9;
  for (let i = 0; i < N; i++) {
    const x = src[fb + i * 4], y = src[fb + i * 4 + 1], z = src[fb + i * 4 + 2];
    cx += x; cy += y; cz += z;
    if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 1e-5) live++;
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    if (z < minz) minz = z; if (z > maxz) maxz = z;
  }
  cx /= N; cy /= N; cz /= N;
  let rms = 0;
  for (let i = 0; i < N; i++) {
    const dx = src[fb + i * 4] - cx, dy = src[fb + i * 4 + 1] - cy, dz = src[fb + i * 4 + 2] - cz;
    rms += dx * dx + dy * dy + dz * dz;
  }
  rms = Math.sqrt(rms / N);
  stats.push({ f, cx, cy, cz, rms, live, bbox: [maxx - minx, maxy - miny, maxz - minz] });
}

// Frame-to-frame mean motion (how far each particle moves between frames)
function meanMotion(fA, fB) {
  const a = fA * frameLen, b = fB * frameLen;
  let s = 0;
  for (let i = 0; i < N; i++) {
    const dx = src[b + i * 4] - src[a + i * 4];
    const dy = src[b + i * 4 + 1] - src[a + i * 4 + 1];
    const dz = src[b + i * 4 + 2] - src[a + i * 4 + 2];
    s += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  return s / N;
}

const radii = stats.map((s) => s.rms);
const lives = stats.map((s) => s.live);
console.log(`RMS radius: min=${Math.min(...radii).toFixed(4)} max=${Math.max(...radii).toFixed(4)} (ratio ${(Math.max(...radii)/Math.min(...radii)).toFixed(2)}x)`);
console.log(`live particles: min=${Math.min(...lives)} max=${Math.max(...lives)} of ${N}`);

// motion per consecutive frame + the seam
const motions = [];
for (let f = 1; f < frames; f++) motions.push(meanMotion(f - 1, f));
const seam = meanMotion(frames - 1, 0);
const avgMotion = motions.reduce((a, b) => a + b, 0) / motions.length;
console.log(`consecutive-frame motion: avg=${avgMotion.toFixed(4)} max=${Math.max(...motions).toFixed(4)}`);
console.log(`SEAM motion (f${frames - 1} -> f0): ${seam.toFixed(4)}  (${(seam / avgMotion).toFixed(1)}x the avg step)`);

// Print a compact per-frame table every 10 frames
console.log('\nframe | radius | live | centroid(x,y,z) | bbox(x,y,z)');
for (let f = 0; f < frames; f += 10) {
  const s = stats[f];
  console.log(
    `${String(f).padStart(3)} | ${s.rms.toFixed(3)} | ${String(s.live).padStart(4)} | ` +
    `${s.cx.toFixed(2)},${s.cy.toFixed(2)},${s.cz.toFixed(2)} | ` +
    `${s.bbox.map((v) => v.toFixed(2)).join(',')}`,
  );
}

// Detect a global pulse: correlation of radius with a low-frequency cycle.
const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
const swing = (Math.max(...radii) - Math.min(...radii)) / meanR;
console.log(`\nradius swing about mean: ${(swing * 100).toFixed(1)}%  -> ${swing > 0.15 ? 'LARGE (cloud visibly breathes/pulses)' : 'small'}`);
