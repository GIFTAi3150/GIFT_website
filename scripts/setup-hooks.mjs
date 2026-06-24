// Points git at the version-controlled .githooks directory. Runs automatically after
// `npm install` via the "prepare" script. Never fails the install (e.g. on Vercel /
// non-git checkouts) — errors are swallowed.
import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks']);
  console.log('git hooks activated (core.hooksPath = .githooks)');
} catch {
  // not a git repo, or git unavailable — nothing to do
}
