// VAT loader — Phase 3 of the DX hero bake pipeline (Plans.md T-010).
//
// Fetches a compressed .vat.bin (produced by scripts/build-vat.mjs) and turns
// it into GPU-ready data for VatParticles:
//   - aBase   : per-particle mean position (vertex attribute, vec3)
//   - aTexel  : per-particle texel center in the per-frame 96×96 block
//   - deltaTex: all frames' int8 deltas, packed into one tiled UNSIGNED_BYTE
//               texture (frames laid out in a grid so the texture stays well
//               under the 4096 mobile limit). Decoded in the vertex shader as
//               ((rgb*255 - 128)/127) * scale.
//
// No GPGPU, no solver — just texture sampling at playback, so this runs on
// every device including phones.

import * as THREE from 'three';

export interface VatData {
  texW: number;
  texH: number;
  frames: number;
  scale: [number, number, number];
  gridCols: number;
  gridRows: number;
  /** Per-particle mean position — vertex attribute, length N*3. */
  aBase: Float32Array;
  /** Per-particle texel center (px+0.5, py+0.5) — vertex attribute, length N*2. */
  aTexel: Float32Array;
  /** Tiled per-frame deltas, ready to upload. */
  deltaTex: THREE.DataTexture;
}

const MAGIC = 0x31544156; // 'VAT1'

// IEEE half (uint16) → float32.
function fromHalf(h: number): number {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const m = h & 0x3ff;
  if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (m / 1024);
  if (e === 0x1f) return m ? NaN : (s ? -Infinity : Infinity);
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + m / 1024);
}

export async function loadVat(url: string): Promise<VatData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`VAT fetch failed: ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  const dv = new DataView(buf);

  let p = 0;
  const magic = dv.getUint32(p, true); p += 4;
  if (magic !== MAGIC) throw new Error(`VAT bad magic in ${url}`);
  const texW = dv.getUint16(p, true); p += 2;
  const texH = dv.getUint16(p, true); p += 2;
  const frames = dv.getUint16(p, true); p += 2;
  p += 2; // flags
  const scale: [number, number, number] = [
    dv.getFloat32(p, true),
    dv.getFloat32(p + 4, true),
    dv.getFloat32(p + 8, true),
  ];
  p += 12;

  const N = texW * texH;

  // base pose (float16 RGB) → aBase attribute, and build aTexel alongside.
  const aBase = new Float32Array(N * 3);
  for (let k = 0; k < N * 3; k++) {
    aBase[k] = fromHalf(dv.getUint16(p, true));
    p += 2;
  }
  const aTexel = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    aTexel[i * 2] = (i % texW) + 0.5;
    aTexel[i * 2 + 1] = Math.floor(i / texW) + 0.5;
  }

  // deltas (int8 RGB, frame-major) → tiled UNSIGNED_BYTE RGBA texture.
  const deltas = new Int8Array(buf, p, frames * N * 3);
  const gridCols = Math.ceil(Math.sqrt(frames));
  const gridRows = Math.ceil(frames / gridCols);
  const width = gridCols * texW;
  const height = gridRows * texH;
  const data = new Uint8Array(width * height * 4); // zero-filled = unused tiles
  for (let f = 0; f < frames; f++) {
    const tileX = (f % gridCols) * texW;
    const tileY = Math.floor(f / gridCols) * texH;
    const db = f * N * 3;
    for (let i = 0; i < N; i++) {
      const px = i % texW;
      const py = Math.floor(i / texW);
      const dst = ((tileY + py) * width + (tileX + px)) * 4;
      // int8 [-127,127] → unsigned [1,255] via +128 bias.
      data[dst] = deltas[db + i * 3] + 128;
      data[dst + 1] = deltas[db + i * 3 + 1] + 128;
      data[dst + 2] = deltas[db + i * 3 + 2] + 128;
      data[dst + 3] = 255;
    }
  }

  const deltaTex = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  deltaTex.magFilter = THREE.NearestFilter;
  deltaTex.minFilter = THREE.NearestFilter;
  deltaTex.wrapS = THREE.ClampToEdgeWrapping;
  deltaTex.wrapT = THREE.ClampToEdgeWrapping;
  deltaTex.needsUpdate = true;

  return { texW, texH, frames, scale, gridCols, gridRows, aBase, aTexel, deltaTex };
}
