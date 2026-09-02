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
