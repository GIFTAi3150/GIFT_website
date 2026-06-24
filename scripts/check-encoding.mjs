#!/usr/bin/env node
// Encoding guard: detects (and optionally repairs) double-encoded UTF-8 "mojibake" —
// Japanese text that was decoded as Windows-1252 and re-saved as UTF-8, so a heading
// such as 活用事例 ("case studies") renders on disk as garbled Latin-1 glyphs.
// Also flags a leading UTF-8 BOM (the fingerprint of the bad save).
//
// Modes:
//   node scripts/check-encoding.mjs                 report the whole repo (exit 1 if any found)
//   node scripts/check-encoding.mjs --write          repair the whole repo in place
//   node scripts/check-encoding.mjs --staged         check only git-staged blobs (pre-commit hook)
//   node scripts/check-encoding.mjs --check a.ts b…  check the listed files (exit 1 if any found)
//   add --write to --check to repair the listed files
//
// The reversal is validated per run (must round-trip, compress, and contain no U+FFFD),
// so it can never corrupt already-correct text.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'out', 'scratchpad']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mjs', '.css', '.html', '.txt']);

// cp1252-specific codepoints (>0xFF) -> their single byte
const CP1252 = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};
// The 5 undefined cp1252 positions survive a lenient decode as identity C1 controls.
const CP1252_UNDEFINED = new Set([0x81, 0x8d, 0x8f, 0x90, 0x9d]);

function toByte(ch) {
  const cp = ch.codePointAt(0);
  if (cp in CP1252) return CP1252[cp];
  if (CP1252_UNDEFINED.has(cp)) return cp;
  if (cp >= 0x80 && cp <= 0x9f) return null; // other genuine C1 controls
  if (cp <= 0xff) return cp;
  return null; // CJK / BOM / other -> ends the run
}

function reverseRun(run) {
  const bytes = [];
  for (const ch of run) {
    const b = toByte(ch);
    if (b === null) return null;
    bytes.push(b);
  }
  const buf = Buffer.from(bytes);
  const out = buf.toString('utf8');
  if (out.includes('�')) return null;
  if (!Buffer.from(out, 'utf8').equals(buf)) return null;
  if (out.length >= run.length) return null;
  if (![...out].some((c) => c.codePointAt(0) >= 0x80)) return null;
  return out;
}

const HIGH = /[-ÿ–—‘’‚“”„†‡•…‰‹›€™ŒœŠšŸŽžƒˆ˜]+/g;

// Returns { count, samples:[[before,after]], fixed } for a BOM-stripped string.
function analyze(s) {
  let count = 0;
  const samples = [];
  const fixed = s.replace(HIGH, (run) => {
    const rev = reverseRun(run);
    if (rev === null) return run;
    count++;
    if (samples.length < 3) samples.push([run, rev]);
    return rev;
  });
  return { count, samples, fixed };
}

function hasBOM(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function inspectBuffer(buf) {
  const bom = hasBOM(buf);
  let s = buf.toString('utf8');
  if (bom) s = s.replace(/^﻿/, '');
  const { count, samples, fixed } = analyze(s);
  return { bom, count, samples, fixed, clean: count === 0 && !bom };
}

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (EXTS.has(extname(name))) acc.push(p);
  }
  return acc;
}

function rel(p) {
  return p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p;
}

function reportFile(label, info) {
  const tags = [];
  if (info.count) tags.push(`${info.count} mojibake run${info.count > 1 ? 's' : ''}`);
  if (info.bom) tags.push('BOM');
  console.log(`  ✗ ${label}  (${tags.join(', ')})`);
  for (const [a, b] of info.samples) console.log(`      "${a}"  ->  "${b}"`);
}

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const STAGED = argv.includes('--staged');
const CHECK = argv.includes('--check');
const fileArgs = argv.filter((a) => !a.startsWith('--'));

function gitStagedFiles() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z'], {
    encoding: 'utf8',
  });
  return out.split('\0').filter((f) => f && EXTS.has(extname(f)));
}

function readStagedBlob(path) {
  return execFileSync('git', ['show', `:${path}`], { maxBuffer: 64 * 1024 * 1024 });
}

let bad = [];

if (STAGED) {
  let files;
  try {
    files = gitStagedFiles();
  } catch (e) {
    console.error('encoding guard: not a git repo or git unavailable — skipping.');
    process.exit(0);
  }
  for (const f of files) {
    let buf;
    try {
      buf = readStagedBlob(f);
    } catch {
      continue;
    }
    const info = inspectBuffer(buf);
    if (!info.clean) bad.push([f, info]);
  }
  if (bad.length) {
    console.error('\n✗ commit blocked — double-encoded UTF-8 (mojibake) or BOM in staged files:\n');
    for (const [f, info] of bad) reportFile(f, info);
    console.error('\nFix all tracked files with:  node scripts/check-encoding.mjs --write');
    console.error('then re-stage and commit.\n');
    process.exit(1);
  }
  process.exit(0);
}

// --check <files> | --write <files> | --write (whole repo) | report (whole repo)
const targets = fileArgs.length
  ? fileArgs.map((f) => (f.startsWith(ROOT) ? f : join(ROOT, f))).filter(existsSync)
  : walk(ROOT, []);

let fixedCount = 0;
for (const f of targets) {
  let buf;
  try {
    buf = readFileSync(f);
  } catch {
    continue;
  }
  const info = inspectBuffer(buf);
  if (info.clean) continue;
  if (WRITE) {
    writeFileSync(f, Buffer.from(info.fixed, 'utf8'));
    fixedCount++;
    console.log(`  ✓ fixed ${rel(f)}`);
  } else {
    bad.push([rel(f), info]);
  }
}

if (WRITE) {
  console.log(`\nrepaired ${fixedCount} file${fixedCount === 1 ? '' : 's'}.`);
  process.exit(0);
}

if (bad.length) {
  console.error(`✗ encoding issues in ${bad.length} file${bad.length === 1 ? '' : 's'}:\n`);
  for (const [f, info] of bad) reportFile(f, info);
  console.error('\nRepair with:  node scripts/check-encoding.mjs --write');
  process.exit(1);
}
console.log('✓ no mojibake or BOM found.');
process.exit(0);
