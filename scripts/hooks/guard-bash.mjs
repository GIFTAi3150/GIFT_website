#!/usr/bin/env node
// PreToolUse guard for Bash / PowerShell.
// Blocks commands that would kill the user's dev server or seize port 3000.
// Payload arrives as JSON on stdin; exit 2 blocks the call and returns stderr
// to Claude. Any parsing problem exits 0 — a broken guard must never wedge the
// session.
import { readFileSync } from 'node:fs';
import { hookLog } from './_log.mjs';

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const raw = String(payload?.tool_input?.command ?? '');
if (!raw.trim()) process.exit(0);

const cmd = raw.toLowerCase().replace(/\s+/g, ' ');

// Never legitimate: the user owns the dev server on port 3000.
const HARD_BLOCK = [
  /\bnpm\s+run\s+dev\b/,
  /\byarn\s+dev\b/,
  /\bpnpm\s+(?:run\s+)?dev\b/,
  /\bnext\s+dev\b/,
  /\bvite\b(?!\.config)/,
];

// Legitimate sometimes, destructive while `next dev` is running.
const TOKEN_GATED = [
  /\bnpm\s+run\s+build\b/,
  /\byarn\s+build\b/,
  /\bpnpm\s+(?:run\s+)?build\b/,
  /\bnext\s+build\b/,
  /\bnpm\s+run\s+start\b/,
  /\bnext\s+start\b/,
];

if (HARD_BLOCK.some((re) => re.test(cmd))) {
  console.error(
    [
      'BLOCKED: this command starts a dev server.',
      '',
      'The user owns port 3000 and runs their own `next dev`. Starting another',
      'one seizes the port or leaves a zombie that 404s _next chunks, which',
      'looks exactly like "the feature was deleted".',
      '',
      'To check whether the server is up, probe it instead:',
      '  curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/',
      '(use 127.0.0.1, not localhost — a stale wslrelay owns ::1:3000)',
      '',
      'If the server needs restarting, ask the user to do it.',
    ].join('\n'),
  );
  hookLog('bash', `BLOCK dev-server: ${raw.slice(0, 120)}`);
  process.exit(2);
}

if (TOKEN_GATED.some((re) => re.test(cmd)) && !raw.includes('#ALLOW_BUILD')) {
  console.error(
    [
      'BLOCKED: production build/start while a dev server may be running.',
      '',
      'Running `next build` against a live `next dev` corrupts the shared .next',
      'directory and kills the user\'s server with:',
      '  "Cannot read properties of undefined (reading \'call\')"',
      'Recovery costs a .next delete and a restart.',
      '',
      'To verify code correctness, use the read-only typecheck instead:',
      '  node node_modules/typescript/bin/tsc --noEmit',
      '',
      'Only if the USER explicitly asked for a production build in this session,',
      'append the token to the command:',
      '  npm run build  #ALLOW_BUILD',
      'Do not add the token on your own initiative.',
    ].join('\n'),
  );
  hookLog('bash', `BLOCK build: ${raw.slice(0, 120)}`);
  process.exit(2);
}

process.exit(0);
