const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  createContactHandler,
  createContactRateLimiter,
  contactClientKey,
  validateContactData,
} = require('../node_modules/.cache/contact-security-tests/contact-security.js');

const valid = {
  name: 'Example Person',
  company: 'Example',
  email: 'person@example.com',
  phone: '+81 90 0000 0000',
  inquiryType: 'plans',
  message: 'Please send details.\nThank you.',
  privacy: true,
  website: '',
};
function request(body = valid, headers = {}, options = {}) {
  return new Request('https://example.test/api/contact', {
    method: 'POST',
    headers: { origin: 'https://example.test', 'content-type': 'application/json', ...headers },
    body:
      typeof body === 'string' || body instanceof Uint8Array || body instanceof ReadableStream
        ? body
        : JSON.stringify(body),
    ...options,
  });
}
function fixture(options = {}) {
  const sent = [];
  let reports = 0;
  const handler = createContactHandler({
    send: async (data) => {
      sent.push(data);
    },
    onDeliveryError: () => {
      reports++;
    },
    ...options,
  });
  return { handler, sent, reports: () => reports };
}

test('valid requests deliver one normalized email, including plan inquiries', async () => {
  const f = fixture();
  const response = await f.handler(request({ ...valid, name: '  Example Person  ' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(f.sent.length, 1);
  assert.equal(f.sent[0].name, 'Example Person');
  assert.equal(f.sent[0].inquiryType, 'plans');
  assert.equal(f.sent[0].message, valid.message);
  assert.ok(!('website' in f.sent[0]));
});

test('invalid types, consent, addresses, categories, controls and lengths send no email', async () => {
  const cases = [
    null,
    [],
    'false',
    { ...valid, name: {} },
    { ...valid, name: '  ' },
    { ...valid, name: 'x'.repeat(101) },
    { ...valid, name: 'Person\r\nBcc: attacker@example.test' },
    { ...valid, company: 'x'.repeat(201) },
    { ...valid, company: 123 },
    { ...valid, email: 'bad-address' },
    { ...valid, email: 'a@@example.com' },
    { ...valid, email: 'a@b.com\r\nBcc: other@example.com' },
    { ...valid, email: 'a'.repeat(250) + '@example.com' },
    { ...valid, phone: '1'.repeat(41) },
    { ...valid, phone: {} },
    { ...valid, message: '' },
    { ...valid, message: 'x'.repeat(5001) },
    { ...valid, message: 'hello\u0000world' },
    { ...valid, privacy: false },
    { ...valid, privacy: 'true' },
    { ...valid, inquiryType: '__proto__' },
    { ...valid, inquiryType: 'unknown' },
    { ...valid, website: {} },
  ];
  for (const body of cases) {
    const f = fixture();
    assert.equal((await f.handler(request(body))).status, 400, JSON.stringify(body).slice(0, 100));
    assert.equal(f.sent.length, 0);
    assert.equal(f.reports(), 0);
  }
});

test('Japanese text and maximum-length legitimate messages remain supported', () => {
  assert.ok(
    validateContactData({
      ...valid,
      name: '\u5c71\u7530 \u592a\u90ce',
      message: '\u3042'.repeat(5000),
    }),
  );
});

test('cross-site requests and missing origins are refused', async () => {
  for (const origin of ['https://attacker.test', 'null', '', 'not a URL']) {
    const f = fixture();
    assert.equal((await f.handler(request(valid, { origin }))).status, 403);
    assert.equal(f.sent.length, 0);
  }
});

test('non-JSON and non-POST requests are refused', async () => {
  const f = fixture();
  assert.equal((await f.handler(request(valid, { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await f.handler(new Request('https://example.test/api/contact'))).status, 405);
  assert.equal(f.sent.length, 0);
});

test('malformed JSON, invalid UTF-8 and empty bodies fail without notifications', async () => {
  for (const body of ['{', '', new Uint8Array([0xff, 0xfe])]) {
    const f = fixture();
    assert.equal((await f.handler(request(body))).status, 400);
    assert.equal(f.sent.length, 0);
    assert.equal(f.reports(), 0);
  }
});

test('oversized declared and actual bodies are rejected regardless of length header', async () => {
  for (const headers of [{}, { 'content-length': '2' }, { 'content-length': '40000' }]) {
    const f = fixture();
    assert.equal((await f.handler(request('x'.repeat(32769), headers))).status, 413);
    assert.equal(f.sent.length, 0);
  }
});

test('size is checked across stream chunks and reading is cancelled on overflow', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(20000));
      controller.enqueue(new Uint8Array(20000));
    },
    cancel() {
      cancelled = true;
    },
  });
  const f = fixture();
  assert.equal((await f.handler(request(stream, {}, { duplex: 'half' }))).status, 413);
  assert.equal(cancelled, true);
  assert.equal(f.sent.length, 0);
});

test('stalled bodies are cancelled instead of holding the handler indefinitely', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const f = fixture({ bodyTimeoutMs: 10 });
  assert.equal((await f.handler(request(stream, {}, { duplex: 'half' }))).status, 408);
  assert.equal(cancelled, true);
  assert.equal(f.sent.length, 0);
});

test('honeypots look successful but send no email or notifications', async () => {
  const f = fixture();
  assert.equal((await f.handler(request({ ...valid, website: 'https://spam.test' }))).status, 200);
  assert.equal(f.sent.length, 0);
  assert.equal(f.reports(), 0);
});

test('concurrent requests cannot exceed the per-client quota', async () => {
  const f = fixture();
  const responses = await Promise.all(Array.from({ length: 12 }, () => f.handler(request())));
  assert.equal(responses.filter((r) => r.status === 200).length, 5);
  assert.equal(responses.filter((r) => r.status === 429).length, 7);
  assert.equal(f.sent.length, 5);
  assert.ok(Number(responses.find((r) => r.status === 429).headers.get('retry-after')) > 0);
});

test('client quotas and the server-wide quota reset only after the window', () => {
  let time = 1000;
  const limit = createContactRateLimiter({
    now: () => time,
    windowMs: 10000,
    perClient: 2,
    total: 3,
  });
  assert.equal(limit('a').allowed, true);
  assert.equal(limit('a').allowed, true);
  assert.equal(limit('a').allowed, false);
  assert.equal(limit('b').allowed, true);
  assert.equal(limit('c').allowed, false);
  time = 10999;
  assert.equal(limit('a').allowed, false);
  time = 11000;
  assert.equal(limit('a').allowed, true);
});

test('untrusted forwarded headers cannot create new client identities', () => {
  const first = request(valid, { 'x-forwarded-for': '192.0.2.1' });
  const second = request(valid, { 'x-forwarded-for': '192.0.2.2' });
  assert.equal(contactClientKey(first, false), contactClientKey(second, false));
  assert.notEqual(contactClientKey(first, true), contactClientKey(second, true));
  assert.equal(
    contactClientKey(request(valid, { 'x-forwarded-for': 'garbage' }), true),
    contactClientKey(request(valid), true),
  );
});

test('scoped IPv6 headers use the anonymous bucket without throwing', () => {
  assert.equal(
    contactClientKey(request(valid, { 'x-forwarded-for': 'fe80::1%eth0' }), true),
    contactClientKey(request(valid), true),
  );
});

test('equivalent IPv6 text forms share one quota', () => {
  assert.equal(
    contactClientKey(
      request(valid, { 'x-forwarded-for': '2001:0db8:0000:0000:0000:0000:0000:0001' }),
      true,
    ),
    contactClientKey(request(valid, { 'x-forwarded-for': '2001:db8::1' }), true),
  );
});

test('provider failure returns an error without leaking provider details', async () => {
  const f = fixture({
    send: async () => {
      throw new Error('private provider details');
    },
  });
  const response = await f.handler(request());
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes('private provider'));
  assert.equal(f.reports(), 1);
});

test('notification failure does not mask a delivery failure', async () => {
  const f = fixture({
    send: async () => {
      throw new Error('send failed');
    },
    onDeliveryError: async () => {
      throw new Error('report failed');
    },
  });
  assert.equal((await f.handler(request())).status, 502);
});

test('production headers block embedding, foreign forms, objects and general eval', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  delete require.cache[require.resolve('../next.config.js')];
  const config = require('../next.config.js');
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
  const routes = await config.headers();
  const headers = Object.fromEntries(
    routes.find((r) => r.source === '/:path*').headers.map((h) => [h.key, h.value]),
  );
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['Strict-Transport-Security'], 'max-age=31536000');
  const csp = headers['Content-Security-Policy'];
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ]) {
    assert.ok(csp.includes(directive));
  }
  assert.ok(!csp.includes("'unsafe-eval'"));
  assert.ok(csp.includes("'wasm-unsafe-eval'"));
});
