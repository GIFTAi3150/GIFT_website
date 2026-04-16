import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const svg = readFileSync('public/GIFT_logo.svg');

// 32x32 favicon PNG fallback
await sharp(svg)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('src/app/icon.png');

// 180x180 Apple touch icon
await sharp(svg)
  .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile('src/app/apple-icon.png');

console.log('Generated icon.png (32x32) and apple-icon.png (180x180)');
