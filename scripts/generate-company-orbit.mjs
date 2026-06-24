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
 *   2. handles `comp_1` (the morphing blob = the reference's actual motion):
 *      Mission KEEPS it, recolored from KARTE red/blue to our warm oranges;
 *      Vision/Values hide it (arcs-only). Hiding it everywhere is what made the
 *      old Mission look static — that was the bug.
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

// Recolor one fill/stroke paint IN PLACE. Handles both static colors
// (c.k = [r,g,b,a]) and ANIMATED colors (c.k = [{t,s:[r,g,b,a]},…] — the blob's
// morphing fills). The old single-pass only touched static fills, so the blob's
// keyframed colors slipped through; mutating each keyframe's `s` also preserves
// the original alpha (index 3).
const recolor = (paint, map) => {
  const k = paint.c.k;
  const apply = (rgba) => {
    for (const [oldHex, newHex] of Object.entries(map)) {
      if (eqHex(rgba, oldHex)) { const [r, g, b] = toRGB(newHex); rgba[0] = r; rgba[1] = g; rgba[2] = b; return; }
    }
  };
  if (typeof k[0] === 'number') apply(k);          // static color
  else for (const kf of k) if (kf.s) apply(kf.s);  // animated color keyframes
};

const walk = (items, map) => {
  for (const it of items || []) {
    if (it.ty === 'gr') walk(it.it, map);
    else if (it.ty === 'fl' || it.ty === 'st') {
      // drop the faint grey backing rect (#d0d0d0) → arcs float fully transparent,
      // so per-section rotate/scale never reveals a tilted grey panel
      if (typeof it.c.k[0] === 'number' && eqHex(it.c.k, '#d0d0d0')) { it.o = { a: 0, k: 0 }; continue; }
      recolor(it, map);
    }
  }
};

// Shrink the blob WITHOUT touching the arcs/dots. comp_1 is instantiated by a
// "コンポ 1" precomp-ref layer inside comp_0/comp_2/comp_3, each scaling it
// around the comp centre [720,405] (anchor == position). Multiplying those
// layers' scale x/y shrinks only the blob, in place — baked in, so it applies
// on every viewport (desktop + mobile). z (index 2) is left alone (2D).
const scaleBlobRefs = (layers, factor) => {
  for (const L of layers || []) {
    if (L.refId !== 'comp_1' || !L.ks || !L.ks.s) continue;
    const s = L.ks.s;
    if (typeof s.k[0] === 'number') { s.k[0] *= factor; s.k[1] *= factor; }
    else for (const kf of s.k) if (kf.s) { kf.s[0] *= factor; kf.s[1] *= factor; }
  }
};

function build(cfg) {
  const j = JSON.parse(JSON.stringify(SRC));
  j.layers = j.layers.filter((L) => L.ty !== 1); // strip pale-cyan solid → transparent
  for (const a of j.assets || []) {
    if (a.id === 'comp_1') {
      // comp_1 = the morphing blob = the reference's ACTUAL motion. Mission keeps
      // it (recolored to our warm oranges); the other sections hide it (arcs-only,
      // unchanged behaviour). Hiding the blob is what made the old Mission read static.
      if (cfg.blob) for (const L of a.layers) walk(L.shapes, cfg.blob);
      else for (const L of a.layers) L.ks.o = { a: 0, k: 0 };
    } else if (cfg.arcsOff) {
      // blob-only variant (CTA): hide every arc/dot shape layer (ty:4) inside the
      // precomps, keep only the ty:0 "コンポ 1" ref so the morphing blob remains.
      // No parenting / track mattes on these layers, so opacity-0 is safe.
      for (const L of a.layers || []) if (L.ty === 4) L.ks.o = { a: 0, k: 0 };
    } else {
      for (const L of a.layers || []) walk(L.shapes, cfg.arc);
    }
    // shrink the blob in the sections that keep it (Mission)
    if (cfg.blob && cfg.blobScale) scaleBlobRefs(a.layers, cfg.blobScale);
  }
  for (const L of j.layers) walk(L.shapes, cfg.arc);
  return j;
}

// arcs: #9f9f9f (thin) / #303030 (dark); dots: #005aff; #d0d0d0 backing rect dropped.
// blob (comp_1): morphing #ff3c1e / #005aff / #ffffff shapes.
const VARIANTS = {
  // Mission (cyan bg rgb(156,203,218)): warm-slate arcs + brand-orange dots,
  // PLUS the morphing blob recolored to our orange light-leak — the real motion.
  'company-orbit-hero': {
    arc:  { '#9f9f9f': '#5E7077', '#303030': '#33474E', '#005aff': '#C2440E' },
    blob: { '#ff3c1e': '#D95208', '#005aff': '#F07A30' }, // #ffffff highlights kept as sheen
    blobScale: 0.6, // shrink the morphing blob to 60% (desktop + mobile)
  },
  // CTA (cyan/pale bg): ONLY the morphing orange blob — arcs + dots stripped.
  // Same blob colors/scale as Mission so it reads as the same element, minus the
  // orbital "strings/rings".
  'company-orbit-blob': {
    blob: { '#ff3c1e': '#D95208', '#005aff': '#F07A30' },
    blobScale: 0.6,
    arcsOff: true,
  },
  // Vision (white bg): faint slate arcs + brand-orange dots, blob hidden (arcs-only)
  'company-orbit-strength': {
    arc:  { '#9f9f9f': '#9AA6AD', '#303030': '#64757D', '#005aff': '#D95208' },
    blob: false,
  },
  // Values (dark card): gold arcs + gold dots, blob hidden
  'company-orbit-values': {
    arc:  { '#9f9f9f': '#B79A52', '#303030': '#7C6730', '#005aff': '#F0D372' },
    blob: false,
  },
};

mkdirSync(join(root, 'public/lottie'), { recursive: true });
for (const [name, cfg] of Object.entries(VARIANTS)) {
  const out = build(cfg);
  writeFileSync(join(root, `public/lottie/${name}.json`), JSON.stringify(out));
  console.log(`wrote public/lottie/${name}.json (${JSON.stringify(out).length} chars)`);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Strength-section DOTS — the REAL alpha.plaid.co.jp *Strength* animation.
 *
 * Plaid's Strength section is NOT the hero orbital-arc field (that was our old
 * wrong port). It's two small <dotlottie-player>s of drifting circles that pop
 * in/out and drift diagonally on a stagger — verified from the live DOM:
 *   accent (lottie.host 51f95e13…, 418×395, x962 y991) → 8 circles:
 *           solid #ff3c1e, blue #005aff dots, hollow #202020 rings
 *   tall   (lottie.host 381382b9…, 330×660, x22  y1509) → 4 circles:
 *           blue dots + dark rings + a dark dot
 * We keep the MOTION 1:1 (keyframes untouched) and only recolor per section.
 * Source JSONs (scripts/company-strength-dots{,-tall}.source.json) are the
 * unzipped dotLottie animation bodies. Two palettes:
 *   vision  (white bg) : #ff3c1e→#D95208 deep orange, #005aff→#F07A30 light
 *                        orange, #202020→#64757D slate hollow rings
 *   values  (dark card): #ff3c1e→#F0D372 bright gold, #005aff→#E8B24A amber,
 *                        #202020→#8A7A45 muted-gold rings (visible on dark)
 * Outputs → public/lottie/company-strength-dots[-values][-tall].json
 * ─────────────────────────────────────────────────────────────────────── */
const DOTS_SOURCES = {
  '':      'scripts/company-strength-dots.source.json',      // accent (418×395)
  '-tall': 'scripts/company-strength-dots-tall.source.json', // tall strip (330×660)
};
const DOTS_PALETTES = {
  '':        { '#ff3c1e': '#D95208', '#005aff': '#F07A30', '#202020': '#64757D' }, // vision
  '-values': { '#ff3c1e': '#F0D372', '#005aff': '#E8B24A', '#202020': '#8A7A45' }, // values
};
for (const [paletteKey, map] of Object.entries(DOTS_PALETTES)) {
  for (const [sizeKey, srcPath] of Object.entries(DOTS_SOURCES)) {
    const j = JSON.parse(readFileSync(join(root, srcPath), 'utf8'));
    for (const L of j.layers || []) walk(L.shapes, map);
    const name = `company-strength-dots${paletteKey}${sizeKey}`;
    writeFileSync(join(root, `public/lottie/${name}.json`), JSON.stringify(j));
    console.log(`wrote public/lottie/${name}.json (${JSON.stringify(j).length} chars)`);
  }
}
