#!/usr/bin/env node
// PostToolUse guard for Edit / Write / MultiEdit.
// Re-checks the written file for mojibake and for the repo's known regressions.
// Exit 2 returns the findings to Claude in the same turn.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, relative } from 'node:path';
import { hookLog } from './_log.mjs';

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const file = String(payload?.tool_input?.file_path ?? '');
if (!file || !existsSync(file)) process.exit(0);

const CHECKED = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.md', '.json']);
if (!CHECKED.has(extname(file))) process.exit(0);

const ROOT = process.cwd();
const findings = [];

// --- 1. encoding ------------------------------------------------------------
const enc = spawnSync(process.execPath, ['scripts/check-encoding.mjs', '--check', file], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (enc.status === 1) {
  findings.push(
    'ENCODING: double-encoded UTF-8 (mojibake) or a BOM was just written.\n' +
      (enc.stderr || enc.stdout || '').trim() +
      '\n  Repair with: node scripts/check-encoding.mjs --write ' +
      relative(ROOT, file),
  );
}

// --- 2. known regressions ---------------------------------------------------
let src = '';
try {
  src = readFileSync(file, 'utf8');
} catch {
  process.exit(0);
}
const lines = src.split(/\r?\n/);
const isTsx = extname(file) === '.tsx';
// Pattern rules apply to code only. Docs and JSON legitimately quote these
// strings (this spec did), and a doc cannot contain a runtime GSAP bug. The
// guard scripts themselves also quote these patterns literally, so exclude
// scripts/hooks/ or editing the guards would make them block themselves.
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']);
const scanPatterns = CODE_EXTS.has(extname(file)) && !file.replace(/\\/g, '/').includes('/scripts/hooks/');

const RULES = [
  {
    id: 'clearprops-all',
    test: (l) => /clearProps\s*:\s*['"`]all['"`]/.test(l),
    msg:
      "GSAP clearProps:'all' is `style.cssText = \"\"` — it wipes React-owned inline styles too " +
      '(this erased the /plans card grey on mobile). Name the individual props instead.',
  },
  {
    id: 'bare-anchor',
    test: (l) => isTsx && /<a\s[^>]*href=["']\/(?!\/)/.test(l),
    msg:
      'Bare internal <a href="/…"> forces a full page reload, which re-raises the light SSR ' +
      '#page-cover over the destination (~5.9s throttled) and makes dark pages look blank. ' +
      'Use next/link.',
  },
  {
    id: 'svh-fill',
    test: (l) => /\b100svh\b/.test(l),
    msg:
      '100svh under-fills when mobile browser chrome collapses. Viewport-FILL covers and heroes ' +
      'use 100dvh. (Scroll budgets may legitimately stay svh — ignore this line if so.)',
  },
  {
    id: 'timeline-once',
    test: (l) => /once\s*:\s*true/.test(l) && /gsap\.timeline\s*\(/.test(src),
    msg:
      'gsap.timeline({ scrollTrigger: { once: true } }) self-kills mid-refresh and crashes. ' +
      'Use toggleActions instead. (Safe on plain tweens / ScrollTrigger.create / .batch — ' +
      'ignore if this once:true is not on a timeline.)',
  },
];

lines.forEach((line, i) => {
  if (!scanPatterns) return;
  if (/hook-ignore/.test(line)) return;
  for (const rule of RULES) {
    if (rule.test(line)) findings.push(`${relative(ROOT, file)}:${i + 1}  [${rule.id}]  ${rule.msg}`);
  }
});

if (!findings.length) {
  hookLog('edit', `pass  ${relative(ROOT, file)}`);
  process.exit(0);
}
hookLog('edit', `FAIL  ${relative(ROOT, file)}  (${findings.length} finding(s))`);

console.error(
  [
    `Post-edit guard flagged ${findings.length} item(s) in ${relative(ROOT, file)}:`,
    '',
    ...findings.slice(0, 6).map((f) => `• ${f}`),
    findings.length > 6 ? `…and ${findings.length - 6} more.` : '',
    '',
    'Some findings may be PRE-EXISTING code you did not touch. Fix what you just',
    'introduced; leave the rest alone unless the user asked for a cleanup.',
  ]
    .filter(Boolean)
    .join('\n'),
);
process.exit(2);
