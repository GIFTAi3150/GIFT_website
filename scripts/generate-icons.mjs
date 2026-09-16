// Raster icons share the centered SVG source. Run: npm run generate:icons
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const app = new URL('../src/app/', import.meta.url);
const source = await readFile(new URL('icon.svg', app));
const png = (size) => sharp(source, { density: 384 }).resize(size, size).png().toBuffer();

await writeFile(new URL('icon.png', app), await png(192));
await writeFile(
  new URL('apple-icon.png', app),
  await sharp(source, { density: 384 })
    .resize(180, 180)
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer(),
);

// A real ICO directory, with PNG-encoded images at each supported size.
// Put the largest image first so metadata readers advertise its full size.
const sizes = [256, 128, 64, 48, 32, 16];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header[entry] = size === 256 ? 0 : size;
  header[entry + 1] = size === 256 ? 0 : size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
});
await writeFile(new URL('favicon.ico', app), Buffer.concat([header, ...images]));
console.log('Generated centered PNG, Apple touch icon, and 16–256px ICO from icon.svg.');
