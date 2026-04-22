#!/usr/bin/env node
/**
 * Compresses + resizes images for the web. Outputs WebP files to public/img/services/.
 *
 * Usage:
 *   node scripts/compress-images.mjs <file1> [file2] [file3] ...
 *
 * Examples:
 *   node scripts/compress-images.mjs "C:/Users/owner/Desktop/dx.png" "C:/Users/owner/Desktop/finance.png"
 *
 * Defaults: max width 1600px, WebP quality 80. Edit MAX_WIDTH / QUALITY below to tune.
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_WIDTH = 1600;
const QUALITY = 80;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'img', 'services');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/compress-images.mjs <file1> [file2] ...');
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Created ${OUTPUT_DIR}`);
}

const fmt = (bytes) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

async function processOne(input) {
  if (!fs.existsSync(input)) {
    console.error(`  ✗ ${input} — file not found`);
    return;
  }

  const stat = fs.statSync(input);
  const baseName = path.parse(input).name.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const outPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

  await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const newStat = fs.statSync(outPath);
  const reduction = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);
  console.log(
    `  ✓ ${path.basename(input)} → ${path.relative(path.resolve(__dirname, '..'), outPath)}\n` +
      `      ${fmt(stat.size)} → ${fmt(newStat.size)}  (-${reduction}%)`,
  );
}

console.log(
  `Compressing ${args.length} image(s) → public/img/services/ (max ${MAX_WIDTH}px wide, WebP q${QUALITY})\n`,
);

for (const arg of args) {
  try {
    await processOne(arg);
  } catch (err) {
    console.error(`  ✗ ${arg} — ${err.message}`);
  }
}

console.log('\nDone.');
