/**
 * Generates the /company orbit-background Lottie variants.
 *
 * Source (`scripts/company-orbit.source.json`) is the REAL alpha.plaid.co.jp
 * hero animation — their After Effects → Bodymovin Lottie, pulled from
 * lottie.host (9e69d6a3-…/4r4Hj0KJ7A.lottie, 1440×810, 14s loop), unzipped from
 * its dotLottie container. The reference plays this same vocabulary across its
 * hero + Strength sections (verified: thin orbital arcs + drifting dots; the
 * hero additionally had a KARTE-brand blue/red gradient blob).
 *
 * This build step, for each section variant:
 *   1. strips the pale-cyan solid bg layer  → animation composites transparently
 *   2. hides `comp_1` (the KARTE gradient blob — off-brand + unreadable behind
 *      our text-heavy Mission), leaving the orbital arcs + dots
 *   3. recolors the arc strokes (#9f9f9f/#303030/#d0d0d0) and dots (#005aff)
 *      to our /company palette, per section background.
 *
 * Outputs → public/lottie/company-orbit-{hero,strength,values}.json
 * Re-run after a palette change:  node scripts/generate-company-orbit.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = JSON.parse(readFileSync(join(root, 'scripts/company-orbit.source.json'), 'utf8'));

const toRGB = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
const eqHex = (k, hex) => {
  const r = toRGB(hex);
  return Math.abs(k[0] - r[0]) < 0.02 && Math.abs(k[1] - r[1]) < 0.02 && Math.abs(k[2] - r[2]) < 0.02;
};

function build(map) {
  const j = JSON.parse(JSON.stringify(SRC));
  j.layers = j.layers.filter((L) => L.ty !== 1); // strip pale-cyan solid → transparent
  for (const a of j.assets || []) {
    if (a.id === 'comp_1') for (const L of a.layers) L.ks.o = { a: 0, k: 0 }; // hide KARTE blob
  }
  const walk = (items) => {
    for (const it of items || []) {
      if (it.ty === 'gr') walk(it.it);
      else if (it.ty === 'fl' || it.ty === 'st') {
        // drop the faint grey backing rect (#d0d0d0) → arcs float fully transparent,
        // so per-section rotate/scale never reveals a tilted grey panel
        if (eqHex(it.c.k, '#d0d0d0')) { it.o = { a: 0, k: 0 }; continue; }
        for (const [oldHex, newHex] of Object.entries(map)) {
          if (eqHex(it.c.k, oldHex)) { it.c.k = toRGB(newHex); break; }
        }
      }
    }
  };
  for (const a of j.assets || []) for (const L of a.layers || []) walk(L.shapes);
  for (const L of j.layers) walk(L.shapes);
  return j;
}

// arc strokes: #9f9f9f (thin) / #303030 (dark) ; dots: #005aff ; (#d0d0d0 backing rect is dropped)
const VARIANTS = {
  // Mission (cyan bg rgb(156,203,218)): warm-slate arcs + brand-orange dots
  'company-orbit-hero':     { '#9f9f9f': '#5E7077', '#303030': '#33474E', '#005aff': '#C2440E' },
  // Vision (white bg): faint slate arcs + brand-orange dots
  'company-orbit-strength': { '#9f9f9f': '#9AA6AD', '#303030': '#64757D', '#005aff': '#D95208' },
  // Values (dark card): gold arcs + gold dots
  'company-orbit-values':   { '#9f9f9f': '#B79A52', '#303030': '#7C6730', '#005aff': '#F0D372' },
};

mkdirSync(join(root, 'public/lottie'), { recursive: true });
for (const [name, map] of Object.entries(VARIANTS)) {
  const out = build(map);
  writeFileSync(join(root, `public/lottie/${name}.json`), JSON.stringify(out));
  console.log(`wrote public/lottie/${name}.json (${JSON.stringify(out).length} chars)`);
}
