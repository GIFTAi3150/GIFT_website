#!/usr/bin/env node
// Stop hook: typecheck, then lint changed files, when TypeScript actually changed.
// Exit 2 hands the errors back to Claude and prevents the turn from ending.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { hookLog } from './_log.mjs';

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

// Already re-entered once — never block twice in a row.
if (payload?.stop_hook_active === true) {
  hookLog('stop', 'skip (re-entry guard)');
  process.exit(0);
}

const ROOT = process.cwd();
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const ESLINT = join(ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(TSC)) {
  hookLog('stop', 'skip (typescript not installed)');
  process.exit(0);
}

const STATE_DIR = join(ROOT, '.claude', 'state');
const STATE_FILE = join(STATE_DIR, 'tsc-last.json');
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'out']);

function fingerprint() {
  const h = createHash('sha1');
  const walk = (dir) => {
    let names;
    try {
      names = readdirSync(dir).sort();
    } catch {
      return;
    }
    for (const name of names) {
      if (SKIP_DIRS.has(name)) continue;
      const p = join(dir, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else if (extname(name) === '.ts' || extname(name) === '.tsx') h.update(`${p}:${st.mtimeMs};`);
    }
  };
  walk(join(ROOT, 'src'));
  for (const f of ['tsconfig.json', 'next-env.d.ts', '.eslintrc.json']) {
    const p = join(ROOT, f);
    try {
      h.update(`${p}:${statSync(p).mtimeMs};`);
    } catch {
      /* absent */
    }
  }
  return h.digest('hex');
}

// Files dirty in the working tree (modified, added, untracked) under src/.
// Tolerant by design: `-z` emits a second record for the old path of a rename,
// which will not survive the existsSync filter — worst case one file is skipped.
function changedTsFiles() {
  try {
    const out = execFileSync('git', ['status', '--porcelain', '-z', '--', 'src'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const files = [];
    for (const entry of out.split('\0')) {
      if (!entry) continue;
      const p = entry.slice(3);
      if (!p) continue;
      const ext = extname(p);
      if (ext !== '.ts' && ext !== '.tsx') continue;
      const abs = join(ROOT, p);
      if (existsSync(abs)) files.push(abs);
    }
    return files;
  } catch {
    return [];
  }
}

const fp = fingerprint();

let prev = null;
try {
  prev = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
} catch {
  /* first run */
}

// Nothing changed since the last check — skip. Keeps conversational turns free.
if (prev && prev.fingerprint === fp) {
  hookLog('stop', `skip (no TS change${prev.ok === false ? ', last run FAILED' : ''})`);
  process.exit(0);
}

const t0 = Date.now();

// --- typecheck --------------------------------------------------------------
const tsc = spawnSync(process.execPath, [TSC, '--noEmit'], { cwd: ROOT, encoding: 'utf8' });
const tscOk = tsc.status === 0;

// --- lint (changed files only, and only once types are sound) ---------------
let lintOk = true;
let lintOut = '';
let lintNote = 'skipped';
let lintCount = 0;

if (tscOk && existsSync(ESLINT)) {
  const files = changedTsFiles();
  lintCount = files.length;
  if (!files.length) {
    lintNote = 'no changed files';
  } else {
    // --max-warnings=-1 => unlimited warnings, so the exit code reflects ERRORS only.
    const res = spawnSync(
      process.execPath,
      [ESLINT, '--max-warnings=-1', '--format', 'unix', ...files],
      { cwd: ROOT, encoding: 'utf8' },
    );
    lintOut = `${res.stdout || ''}${res.stderr || ''}`.trim();
    lintOk = res.status === 0;
    const warnings = (lintOut.match(/\bwarning\b/g) || []).length;
    lintNote = lintOk ? (warnings ? `pass (${warnings} warning(s))` : 'pass') : 'FAIL';
    if (lintOk && warnings && lintOut) {
      for (const line of lintOut.split('\n').slice(0, 20)) hookLog('stop', `  warn ${line}`);
    }
  }
}

const ok = tscOk && lintOk;

try {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ fingerprint: fp, ok }, null, 2));
} catch {
  /* state is an optimisation, not a requirement */
}

hookLog(
  'stop',
  `tsc=${tscOk ? 'pass' : 'FAIL'} eslint=${lintNote} lintFiles=${lintCount} ${Date.now() - t0}ms`,
);

if (ok) process.exit(0);

const report = [];
if (!tscOk) {
  const out = `${tsc.stdout || ''}${tsc.stderr || ''}`.trim().split(/\r?\n/);
  report.push(`Typecheck failed — ${out.length} line(s), first 30 shown:`, '', ...out.slice(0, 30));
}
if (!lintOk) {
  const out = lintOut.split(/\r?\n/).filter(Boolean);
  if (report.length) report.push('');
  report.push(`ESLint errors in changed files — ${out.length} line(s), first 30 shown:`, '', ...out.slice(0, 30));
}
report.push(
  '',
  'Fix these before finishing. If a failure is pre-existing and unrelated to this',
  "turn's work, say so explicitly to the user rather than silently leaving it — do",
  'not "fix" unrelated files without being asked.',
  'Warnings (not shown here) never block; they are recorded in .claude/state/hooks.log.',
);
console.error(report.join('\n'));
process.exit(2);
