/**
 * Generates two GIFT-owned textures for the /company hero (biscom port).
 *
 * Outputs:
 *   public/company/hero-field.webp  — 1600×900 grey-paper field with cyan/blue
 *                                     blob upper-left + baked grain
 *   public/company/hero-leak.webp   — 880×500 transparent orange blade
 *                                     (mix-blend-mode:hard-light in DOM)
 *
 * Run once: node scripts/gen-hero-field.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'company');
mkdirSync(OUT, { recursive: true });

// ── hero-field.webp ─────────────────────────────────────────────────────────
const W = 1920, H = 1080;

const blobCx  = Math.round(W * 0.20);
const blobCy  = Math.round(H * 0.24);
const blobR   = Math.round(W * 0.50);

const smudgeCx = Math.round(W * 0.02);
const smudgeCy = Math.round(H * 0.30);
const smudgeR  = Math.round(W * 0.18);

const liftCx = Math.round(W * 0.80);
const liftCy = Math.round(H * 0.46);
const liftR  = Math.round(W * 0.50);

const warmCx = Math.round(W * 0.78);
const warmCy = Math.round(H * 0.96);
const warmR  = Math.round(W * 0.42);

const fieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="blob" cx="${blobCx}" cy="${blobCy}" r="${blobR}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#86e8db"/>
      <stop offset="50%"  stop-color="#4663dc"/>
      <stop offset="100%" stop-color="#4663dc" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="smudge" cx="${smudgeCx}" cy="${smudgeCy}" r="${smudgeR}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#141c52" stop-opacity="0.52"/>
      <stop offset="100%" stop-color="#141c52" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lift" cx="${liftCx}" cy="${liftCy}" r="${liftR}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="${warmCx}" cy="${warmCy}" r="${warmR}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#e6bb83" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#e6bb83" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#e9e7e2"/>
  <rect width="${W}" height="${H}" fill="url(#blob)"/>
  <rect width="${W}" height="${H}" fill="url(#smudge)"/>
  <rect width="${W}" height="${H}" fill="url(#lift)"/>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
</svg>`;

const { data: raw, info } = await sharp(Buffer.from(fieldSvg))
  .raw()
  .toBuffer({ resolveWithObject: true });

// Baked grain: per-pixel ±7 RGB, deterministic LCG so the file is reproducible
const ch = info.channels; // 4 (RGBA) from SVG
const px = info.width, py = info.height;
for (let i = 0; i < px * py; i++) {
  const base = i * ch;
  const col  = i % px;
  const row  = Math.floor(i / px);
  // LCG hash
  let s = (Math.imul(col, 374761393) + Math.imul(row, 1234567891)) >>> 0;
  s = (s ^ (s >>> 13)) >>> 0;
  s = Math.imul(s, 1664525) >>> 0;
  const g = (s & 0xf) - 7; // -7..8 → ±7
  raw[base]     = Math.max(0, Math.min(255, raw[base]     + g));
  raw[base + 1] = Math.max(0, Math.min(255, raw[base + 1] + g));
  raw[base + 2] = Math.max(0, Math.min(255, raw[base + 2] + g));
  if (ch === 4) raw[base + 3] = 255; // fully opaque
}

await sharp(raw, { raw: { width: px, height: py, channels: ch } })
  .removeAlpha()
  .webp({ quality: 80 })
  .toFile(join(OUT, 'hero-field.webp'));

console.log('✓  hero-field.webp  (1920×1080)');

// ── hero-leak.webp ───────────────────────────────────────────────────────────
// Transparent orange→deep-red blade, heavy blur, composited hard-light in DOM.
const LW = 880, LH = 500;
const lcx = Math.round(LW * 0.60);
const lcy = Math.round(LH * 0.28);
const lrx = Math.round(LW * 0.52);
const lry = Math.round(LH * 0.42);

const leakSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LW}" height="${LH}">
  <defs>
    <radialGradient id="core" cx="${lcx}" cy="${lcy}" r="${lrx}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#ff6a1f" stop-opacity="1"/>
      <stop offset="40%"  stop-color="#c8380a" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#7d300b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="${lcx}" cy="${lcy}" rx="${lrx}" ry="${lry}"
    fill="url(#core)"
    transform="rotate(-18 ${lcx} ${lcy})"/>
</svg>`;

await sharp(Buffer.from(leakSvg))
  .ensureAlpha()
  .blur(18)
  .webp({ quality: 80 })
  .toFile(join(OUT, 'hero-leak.webp'));

console.log('✓  hero-leak.webp   (880×500, transparent)');
