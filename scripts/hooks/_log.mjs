#!/usr/bin/env node
// Best-effort hook logging: all checks, rotation and appends use one open file.
import {
  closeSync,
  constants,
  fstatSync,
  ftruncateSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeSync,
} from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 512 * 1024;
const KEEP_LINES = 1000;

export function hookLog(hook, message) {
  let fd;
  try {
    const dir = join(process.cwd(), '.claude', 'state');
    const file = join(dir, 'hooks.log');
    mkdirSync(dir, { recursive: true });
    fd = openSync(
      file,
      constants.O_CREAT | constants.O_RDWR | (constants.O_NOFOLLOW ?? 0),
      0o600,
    );
    const info = fstatSync(fd);
    if (!info.isFile()) return;
    let writeAt = info.size;
    if (info.size > MAX_BYTES) {
      const kept = readFileSync(fd, 'utf8').split('\n').slice(-KEEP_LINES);
      const tail = kept.join('\n') + '\n';
      writeAt = Buffer.byteLength(tail);
      writeSync(fd, tail, 0, 'utf8');
      ftruncateSync(fd, writeAt);
    }
    writeSync(
      fd,
      new Date().toISOString() + '  ' + String(hook).padEnd(6) + '  ' + message + '\n',
      writeAt,
      'utf8',
    );
  } catch {
    // Logging is never a reason to fail a hook.
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        /* Keep the best-effort contract. */
      }
    }
  }
}
