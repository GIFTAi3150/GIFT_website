# Claude Code hooks — enforcement layer

Turns the rules in `CLAUDE.md` from prose (honour system, skipped under context
pressure) into scripts the harness runs whether or not the model remembers them.

Three hooks, three scripts, one settings block. All scripts are plain Node ESM,
no dependencies, no shell pipelines (Windows-safe).

## Contract used

Every script reads a JSON payload on **stdin** and signals via **exit code only**:

| exit | meaning |
| ---- | ------- |
| `0`  | pass — nothing shown |
| `2`  | block — `stderr` is fed back to Claude as a correction |
| other | non-blocking error — `stderr` shown to the user, work continues |

No JSON-on-stdout protocol is used; exit codes are the stable contract.

Payload fields consumed:
- `tool_input.command` — PreToolUse on Bash / PowerShell
- `tool_input.file_path` — PostToolUse on Edit / Write / MultiEdit
- `stop_hook_active` — Stop (guards against an infinite continue loop)

---

## 1. `scripts/hooks/guard-bash.mjs` — PreToolUse (Bash, PowerShell)

Two tiers, deliberately different:

- **Hard block (no escape):** dev-server starters. The user owns port 3000.
  There is no situation where an agent should start one.
- **Token gated:** production build / production server. These *are* legitimate
  (the "test in production locally" workflow for flash/flicker bugs) but they
  corrupt `.next` while the user's dev server is running, so they must be a
  conscious, user-requested decision — not a reflex. Adding `#ALLOW_BUILD` to
  the command unblocks it.

Probing the user's server (`curl 127.0.0.1:3000`) is **not** blocked — that is
the sanctioned way to check whether it is up.

```js
#!/usr/bin/env node
// PreToolUse guard for Bash / PowerShell.
// Blocks commands that would kill the user's dev server or seize port 3000.
// Payload arrives as JSON on stdin; exit 2 blocks the call and returns stderr
// to Claude. Any parsing problem exits 0 — a broken guard must never wedge the
// session.
import { readFileSync } from 'node:fs';

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
  process.exit(2);
}

process.exit(0);
```

---

## 2. `scripts/hooks/guard-edit.mjs` — PostToolUse (Edit, Write, MultiEdit)

Fires on the file that was just written. Two jobs:

1. **Encoding** — runs the existing `check-encoding.mjs --check <file>`. Today
   that only runs at commit time, which is too late; by then the mojibake has
   been in context for an hour and reads as correct.
2. **Landmine grep** — the bugs already paid for once, listed in the project
   memory. Warning-only via exit 2, so the correction lands in the same turn
   instead of in the browser.

Known false-positive risk: pre-existing findings in a file being edited for an
unrelated reason (there are ~9 bare internal anchors still in the tree). Handled
two ways — the message says so explicitly, and a line can opt out with a
trailing `// hook-ignore` comment.

```js
#!/usr/bin/env node
// PostToolUse guard for Edit / Write / MultiEdit.
// Re-checks the written file for mojibake and for the repo's known regressions.
// Exit 2 returns the findings to Claude in the same turn.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, relative } from 'node:path';

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
  if (/hook-ignore/.test(line)) return;
  for (const rule of RULES) {
    if (rule.test(line)) findings.push(`${relative(ROOT, file)}:${i + 1}  [${rule.id}]  ${rule.msg}`);
  }
});

if (!findings.length) process.exit(0);

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
```

---

## 3. `scripts/hooks/stop-typecheck.mjs` — Stop

The safety net that replaces the missing test suite: catches "changed a prop,
silently broke three callers" before the user reloads the page.

Design constraints:

- **Must not run on conversational turns.** It fingerprints every `.ts`/`.tsx`
  under `src/` plus `tsconfig.json` by path + mtime, and skips entirely when the
  fingerprint is unchanged since the last run. A turn that touched no TypeScript
  costs one directory walk (~milliseconds, no file reads).
- **Must not loop.** `stop_hook_active` short-circuits immediately — otherwise a
  persistent type error would block the turn from ever ending.
- **Must not use the shell.** Invokes the local `typescript` binary through
  `process.execPath` directly. No `npx`, no `.cmd` resolution, no quoting bugs.
- **Read-only.** `tsc --noEmit` writes nothing and is safe alongside a running
  dev server, unlike `next build`.

```js
#!/usr/bin/env node
// Stop hook: typecheck when TypeScript actually changed.
// Exit 2 hands the errors back to Claude and prevents the turn from ending.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

// Already re-entered once — never block twice in a row.
if (payload?.stop_hook_active === true) process.exit(0);

const ROOT = process.cwd();
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
if (!existsSync(TSC)) process.exit(0); // deps not installed — nothing to do

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
  for (const f of ['tsconfig.json', 'next-env.d.ts']) {
    const p = join(ROOT, f);
    try {
      h.update(`${p}:${statSync(p).mtimeMs};`);
    } catch {
      /* absent */
    }
  }
  return h.digest('hex');
}

const fp = fingerprint();

let prev = null;
try {
  prev = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
} catch {
  /* first run */
}

// Nothing changed since the last check — skip. Keeps conversational turns free.
if (prev && prev.fingerprint === fp) process.exit(0);

const res = spawnSync(process.execPath, [TSC, '--noEmit'], { cwd: ROOT, encoding: 'utf8' });
const ok = res.status === 0;

try {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ fingerprint: fp, ok }, null, 2));
} catch {
  /* state is an optimisation, not a requirement */
}

if (ok) process.exit(0);

const out = `${res.stdout || ''}${res.stderr || ''}`.trim().split(/\r?\n/);
console.error(
  [
    `Typecheck failed — ${out.length} line(s) of tsc output, first 30 shown:`,
    '',
    ...out.slice(0, 30),
    '',
    'Fix these before finishing. If a failure is pre-existing and unrelated to',
    'this turn\'s work, say so explicitly to the user rather than silently',
    'leaving it — do not "fix" unrelated files without being asked.',
  ].join('\n'),
);
process.exit(2);
```

---

## 4. `.claude/settings.json`

Merge the `hooks` block into the existing file, preserving `enabledPlugins`.

```json
{
  "enabledPlugins": {
    "claude-code-harness@claude-code-harness-marketplace": false
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          { "type": "command", "command": "node scripts/hooks/guard-bash.mjs", "timeout": 15 }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node scripts/hooks/guard-edit.mjs", "timeout": 30 }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "node scripts/hooks/stop-typecheck.mjs", "timeout": 180 }
        ]
      }
    ]
  }
}
```

Hooks are version-controlled in `settings.json` (shared), not `settings.local.json`.

---

## Verification

Each script is a pure stdin→exit-code filter, so it can be tested without the
harness by piping a payload in. On PowerShell, `'{"json"}' | node script.mjs`;
under the Bash tool, a heredoc. Expected results:

| input | script | expected exit |
| ----- | ------ | ------------- |
| `{"tool_input":{"command":"npm run dev"}}` | guard-bash | 2 |
| `{"tool_input":{"command":"npm run build"}}` | guard-bash | 2 |
| `{"tool_input":{"command":"npm run build  #ALLOW_BUILD"}}` | guard-bash | 0 |
| `{"tool_input":{"command":"curl -s 127.0.0.1:3000/"}}` | guard-bash | 0 |
| `{"tool_input":{"command":"git status"}}` | guard-bash | 0 |
| `{"tool_input":{"file_path":"<a clean .tsx>"}}` | guard-edit | 0 |
| `{"tool_input":{"file_path":"<tmp file with clearProps:'all'>"}}` | guard-edit | 2 |
| `{"stop_hook_active":true}` | stop-typecheck | 0 (immediate) |
| `{}` twice in a row | stop-typecheck | second run skips via fingerprint |

Also confirm `node node_modules/typescript/bin/tsc --noEmit` passes on the tree
as it stands, so the Stop hook does not fire on unrelated pre-existing errors.

**Do not run `npm run build` at any point while verifying.**

## Activation

Claude Code snapshots hooks at session start. After the files land, the session
must be restarted (or `/hooks` used to review and accept) before they take
effect.
