const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { syncBuiltinESMExports } = require('node:module');
const vm = require('node:vm');
const ts = require('typescript');

const feed = () => import('../scripts/lib/feed-text.mjs');
const logger = () => import('../scripts/hooks/_log.mjs');

test('RSS markup becomes readable plain text without repeated entity decoding', async () => {
  const { feedText } = await feed();
  assert.equal(
    feedText('<p>Hello <b>world</b> &amp; \u65e5\u672c\u8a9e</p>'),
    'Hello world & \u65e5\u672c\u8a9e',
  );
  assert.equal(feedText('&amp;lt;script&amp;gt;'), '&lt;script&gt;');
  assert.equal(feedText('https://example.test/?a=1&amp;b=2'), 'https://example.test/?a=1&b=2');
  assert.equal(feedText('<a href="https://example.test">Headline</a>'), 'Headline');
  assert.equal(feedText(''), '');
});

test('RSS scripts, styles and malformed nested tags cannot become active markup', async () => {
  const { feedText } = await feed();
  assert.equal(feedText('<script>alert(1)</script><style>p{color:red}</style><p>Safe</p>'), 'Safe');
  assert.doesNotMatch(feedText('<scr<script>ipt>text</scr<script>ipt>'), /<script/i);
});

function fixture(t) {
  const previous = process.cwd();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gift-hook-test-'));
  process.chdir(root);
  t.after(() => {
    process.chdir(previous);
    const realRoot = fs.realpathSync(root);
    const realParent = fs.realpathSync(os.tmpdir());
    assert.ok(realRoot.startsWith(realParent + path.sep));
    assert.ok(path.basename(realRoot).startsWith('gift-hook-test-'));
    fs.rmSync(realRoot, { recursive: true, force: true });
  });
  const directory = path.join(root, '.claude', 'state');
  return { root, directory, file: path.join(directory, 'hooks.log') };
}

test('hook logger creates and appends entries', async (t) => {
  const { hookLog } = await logger();
  const { file } = fixture(t);
  hookLog('guard', 'first');
  hookLog('guard', 'second');
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /guard\s+first$/);
  assert.match(lines[1], /guard\s+second$/);
});

test('hook logger rotates large files and keeps recent entries', async (t) => {
  const { hookLog } = await logger();
  const { directory, file } = fixture(t);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    file,
    Array.from({ length: 1200 }, (_, i) => 'entry-' + i + ' ' + 'x'.repeat(500)).join('\n'),
  );
  hookLog('guard', 'latest');
  const result = fs.readFileSync(file, 'utf8');
  assert.ok(result.length < 512 * 1024);
  assert.ok(!result.includes('entry-0 '));
  assert.ok(result.includes('entry-1199 '));
  assert.match(result, /latest\n$/);
});

test('replacing the path after opening cannot redirect rotation or appends', async (t) => {
  const { hookLog } = await logger();
  const { directory, file } = fixture(t);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(file, 'x'.repeat(530000) + '\nrecent\n');
  const original = fs.fstatSync;
  const moved = file + '.original';
  t.mock.method(fs, 'fstatSync', function (fd, ...args) {
    const info = original(fd, ...args);
    fs.renameSync(file, moved);
    fs.writeFileSync(file, 'replacement must stay untouched');
    return info;
  });
  syncBuiltinESMExports();
  try {
    hookLog('guard', 'safe append');
  } finally {
    t.mock.restoreAll();
    syncBuiltinESMExports();
  }
  assert.equal(fs.readFileSync(file, 'utf8'), 'replacement must stay untouched');
  assert.match(fs.readFileSync(moved, 'utf8'), /safe append\n$/);
});

test('hook logger keeps its best-effort contract on inaccessible paths', async (t) => {
  const { hookLog } = await logger();
  const { root } = fixture(t);
  fs.writeFileSync(path.join(root, '.claude'), 'not a directory');
  assert.doesNotThrow(() => hookLog('guard', 'ignored'));
});

function reportingRoute() {
  const logs = [];
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, '../src/app/api/report-error/route.ts'), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    URL,
    process: { env: { CLIENT_ERROR_SLACK: 'off', VERCEL_ENV: 'test' } },
    console: { error: (...args) => logs.push(args) },
    require(name) {
      if (name === 'next/server')
        return { NextResponse: { json: (data, options) => Response.json(data, options) } };
      if (name === '@/lib/notify-slack')
        return {
          notifySlack: () => {
            throw new Error('Slack must not be called');
          },
        };
      throw new Error('Unexpected import: ' + name);
    },
  });
  return { post: module.exports.POST, logs };
}

test('client error fields cannot forge lines or format placeholders in logs', async () => {
  const { post, logs } = reportingRoute();
  const body = {
    name: 'Error',
    message: 'first\r\nFAKE entry %s\u2028second',
    stack: 'stack\nforged\u2029entry',
    url: '/page\nfake',
    source: '%s',
  };
  const response = await post(
    new Request('https://example.test/api/report-error', {
      method: 'POST',
      headers: { origin: 'https://example.test', host: 'example.test' },
      body: JSON.stringify(body),
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(logs.length, 1);
  assert.equal(logs[0][0], '[client-error]');
  assert.equal(logs[0].length, 2);
  assert.doesNotMatch(logs[0][1], /[\r\n\u2028\u2029]/);
  const record = JSON.parse(logs[0][1]);
  assert.equal(record.message, 'Error: ' + body.message);
  assert.equal(record.stack, body.stack);
  assert.equal(record.page, body.url);
});

test('malformed error reports do not produce log entries', async () => {
  const { post, logs } = reportingRoute();
  await post(new Request('https://example.test/api/report-error', { method: 'POST', body: '{' }));
  assert.equal(logs.length, 0);
});
