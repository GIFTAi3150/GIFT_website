# Claude Code hooks — v2: run log + ESLint

Extends the shipped v1 hooks (see `docs/claude-code-hooks.md`, which stays valid
for the contract, payload fields and settings block). Two additions:

1. **`.claude/state/hooks.log`** — an append-only receipt so the hooks can be
   confirmed alive without waiting for a failure.
2. **ESLint** in the Stop hook, alongside `tsc`.

The v1 exit-code contract is unchanged: `0` pass, `2` block (stderr returns to
Claude), anything else non-blocking error.

---

## Design calls (do not change these without asking)

**ESLint lints only files changed in the working tree, never the whole repo.**
This codebase has no lint history, so a full-tree run would surface hundreds of
pre-existing violations and block every single turn — the guard would be turned
off within a day. Scoping to `git status --porcelain` output means new code is
held to the standard while old code is not a wall. No baseline file needed.

**Lint errors block; lint warnings only go to the log.** `react-hooks/exhaustive-deps`
is the highest-value rule here, but it false-positives on GSAP/ref-heavy effects,
and its suggested fix (adding the dep) can *introduce* bugs by re-running an
animation. Forcing it to blocking-error would push wrong fixes. It warns.

**ESLint runs only when `tsc` passed.** Type errors cascade into meaningless lint
noise; there is no value in reporting both at once.

**`@next/next/no-html-link-for-pages` is set to `off`.** The rule resolves routes
by scanning a `pages/` directory, which this App Router project does not have, so
it either no-ops or emits a config warning. The `bare-anchor` regex in
`guard-edit.mjs` remains the primary defence for that bug — do not remove it.

**Logging is best-effort and must never affect a hook's verdict.** Every log call
is wrapped so a full disk or a locked file cannot change pass/fail.

---

## 1. `scripts/hooks/_log.mjs` — NEW

```js
#!/usr/bin/env node
// Shared append-only logger for the hook scripts.
// Best-effort by contract: this must never throw and never influence whether a
// hook passes or fails. Rotates by keeping the tail once the file gets large.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 512 * 1024;
const KEEP_LINES = 1000;

export function hookLog(hook, message) {
  try {
    const dir = join(process.cwd(), '.claude', 'state');
    const file = join(dir, 'hooks.log');
    mkdirSync(dir, { recursive: true });
    try {
      if (statSync(file).size > MAX_BYTES) {
        const kept = readFileSync(file, 'utf8').split('\n').slice(-KEEP_LINES);
        writeFileSync(file, `${kept.join('\n')}\n`);
      }
    } catch {
      // absent or unreadable — appendFileSync will create it
    }
    appendFileSync(file, `${new Date().toISOString()}  ${String(hook).padEnd(6)}  ${message}\n`);
  } catch {
    // logging is never a reason to fail
  }
}
```

Log volume policy, chosen so the file stays readable:

| hook | logs |
| ---- | ---- |
| `guard-bash` | **blocks only** — every `git status` would otherwise flood it |
| `guard-edit` | **every run**, pass or fail — this is the "did it quietly check 40 files" receipt |
| `stop` | **every run**, including skips — the proof-of-life heartbeat |

---

## 2. `.eslintrc.json` — NEW (repo root)

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off"
  },
  "ignorePatterns": [
    ".next/",
    "node_modules/",
    "public/",
    "out/",
    "scripts/",
    "*.config.js",
    "*.config.mjs"
  ]
}
```

`next/core-web-vitals` already sets `react-hooks/rules-of-hooks` to error (a
conditional hook is a guaranteed runtime crash) — that is the main thing being
bought here, plus `no-sync-scripts` and the a11y set.

Rules explicitly disabled and why:
- `react/no-unescaped-entities` — fires constantly on Japanese copy containing
  quotes and apostrophes. Pure noise here.
- `@next/next/no-img-element` — plain `<img>` is used deliberately in places for
  load-order control; this rule would fight that.

### Dependencies

```
npm install -D eslint@^8.57.1 eslint-config-next@14.2.35
```

ESLint 8 (not 9) and `eslint-config-next` pinned to the installed Next version
(`next` is `^14.2.35`). Next 14's config targets the `.eslintrc` format; ESLint 9
flat config is not reliably supported by it.

---

## 3. `scripts/hooks/stop-typecheck.mjs` — FULL REPLACEMENT

Replace the entire existing file with this. The fingerprint gate, the
`stop_hook_active` re-entry guard and the shell-free binary invocation are all
carried over from v1 unchanged.

```js
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
```

---

## 4. `scripts/hooks/guard-bash.mjs` — TWO SMALL EDITS

**(a)** After the existing `import { readFileSync } from 'node:fs';` line, add:

```js
import { hookLog } from './_log.mjs';
```

**(b)** Add a log call immediately before each of the two `process.exit(2);`
statements (blocks only — passes are not logged, or every `git status` would
flood the file). Truncate the command so one long call cannot bloat a line.

Before the HARD_BLOCK exit:
```js
  hookLog('bash', `BLOCK dev-server: ${raw.slice(0, 120)}`);
```

Before the TOKEN_GATED exit:
```js
  hookLog('bash', `BLOCK build: ${raw.slice(0, 120)}`);
```

Do not change anything else in this file.

---

## 5. `scripts/hooks/guard-edit.mjs` — TWO SMALL EDITS

**(a)** After the existing `import { extname, relative } from 'node:path';` line, add:

```js
import { hookLog } from './_log.mjs';
```

**(b)** Restrict the pattern rules to code files. Prose that *describes* a
landmine currently trips it — writing this spec fired the `clearprops-all` rule
on a line that was only quoting the rule. The encoding check must still run on
`.md` and `.json` (mojibake in Japanese docs is exactly what it is for), so the
gate goes around the RULES loop only, not the whole script.

Immediately after the existing line:
```js
const isTsx = extname(file) === '.tsx';
```
insert:
```js
// Pattern rules apply to code only. Docs and JSON legitimately quote these
// strings (this spec did), and a doc cannot contain a runtime GSAP bug.
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']);
const scanPatterns = CODE_EXTS.has(extname(file));
```
then change the scan loop's opening line from:
```js
lines.forEach((line, i) => {
```
to:
```js
lines.forEach((line, i) => {
  if (!scanPatterns) return;
```

**(c)** This file logs **every** run — that is the receipt the user asked for.

Replace the existing clean-exit line:
```js
if (!findings.length) process.exit(0);
```
with:
```js
if (!findings.length) {
  hookLog('edit', `pass  ${relative(ROOT, file)}`);
  process.exit(0);
}
hookLog('edit', `FAIL  ${relative(ROOT, file)}  (${findings.length} finding(s))`);
```

Do not change anything else in this file.

---

## 6. `.gitignore` — ONE EDIT

Line 48 is currently a bare `.claude`, which ignores the whole directory, so
`.claude/settings.json` (the hook registration) is untracked and would be lost on
a re-clone. Replace that single line with:

```
.claude/*
!.claude/settings.json
!.claude/agents/
.claude/state/
```

This keeps the hook config and the agent definitions version-controlled while
continuing to ignore session state, logs and `settings.local.json`. Note
`.claude/settings.local.json` and `.claude/agents/*.md` are already **tracked**
(they predate the ignore rule) — this change must not untrack them. Verify with
`git status` afterwards that no previously-tracked file appears as deleted.

---

## Verification

Report the verbatim output of each.

1. `node --check` on all four scripts in `scripts/hooks/`.
2. `node node_modules/eslint/bin/eslint.js --version` → confirms install.
3. **Whole-tree lint census, for information only — do not fix anything it finds:**
   `node node_modules/eslint/bin/eslint.js --max-warnings=-1 --format unix src`
   Report the total error count and the total warning count, and the top rule ids
   by frequency. This tells us whether the "changed files only" scoping is doing
   real work.
4. `node node_modules/typescript/bin/tsc --noEmit` → must still exit 0.
5. Stop hook, three runs in order:
   - `{"stop_hook_active":true}` → exit 0 immediately.
   - `{}` → real run. Report exit code and elapsed time.
   - `{}` again → must exit 0 near-instantly (fingerprint cache hit).
6. `guard-bash.mjs` regression — payloads unchanged from v1, must behave identically:
   `npm run dev` → 2, `npm run build` → 2, `npm run build  #ALLOW_BUILD` → 0,
   `git status` → 0, `{}` → 0.
   NOTE: piping these payloads on a Bash command line trips the live hook, because
   the guard substring-matches the outer command text too. Write each payload to a
   file with the Write tool and pipe with `< file`.
7. `guard-edit.mjs` — one clean file → exit 0, and a scratchpad `probe.tsx`
   containing `clearProps: 'all'` → exit 2. Delete the probe afterwards.
8. Print the resulting `.claude/state/hooks.log` in full. It must contain `stop`
   lines, `edit` lines, and `bash BLOCK` lines.
9. `node scripts/check-encoding.mjs --check` on every new/modified file.
10. `git status` — confirm nothing previously tracked shows as deleted.

**Never run `npm run build`, `next build`, `npm run dev`, or start any server.**
`npm install -D` is permitted and required; note in the report if it rewrites
`package-lock.json`.
