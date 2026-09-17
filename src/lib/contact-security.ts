import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { CONTACT_INQUIRY_LABELS, CONTACT_LIMITS } from './contact-fields';

export type ContactData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: keyof typeof CONTACT_INQUIRY_LABELS;
  message: string;
  privacy: true;
};

const MAX_BODY_BYTES = 32 * 1024;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;
const MESSAGE_CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;

class ContactRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function validateContactData(value: unknown): ContactData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const text = (key: keyof typeof CONTACT_LIMITS, required = false): string | null => {
    const raw = input[key];
    if (raw === undefined && !required) return '';
    if (typeof raw !== 'string') return null;
    const result = raw.trim();
    if ((required && !result) || result.length > CONTACT_LIMITS[key]) return null;
    if ((key === 'message' ? MESSAGE_CONTROLS : CONTROL_CHARACTERS).test(result)) return null;
    return result;
  };
  const name = text('name', true);
  const company = text('company');
  const email = text('email', true);
  const phone = text('phone');
  const message = text('message', true);
  if (name === null || company === null || email === null || phone === null || message === null) {
    return null;
  }
  if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/u.test(email) || input.privacy !== true) return null;
  if (
    typeof input.inquiryType !== 'string' ||
    !Object.prototype.hasOwnProperty.call(CONTACT_INQUIRY_LABELS, input.inquiryType)
  )
    return null;
  if (input.website !== undefined && typeof input.website !== 'string') return null;
  return {
    name,
    company,
    email,
    phone,
    message,
    privacy: true,
    inquiryType: input.inquiryType as ContactData['inquiryType'],
  };
}

type RateDecision = { allowed: boolean; retryAfter: number };

// Bounded, synchronous reservations prevent concurrent requests from bypassing
// the limit within a running server. State expires every ten minutes. Serverless
// instances do not share this map; deployment-wide limits belong at the edge.
export function createContactRateLimiter({
  now = Date.now,
  windowMs = 10 * 60 * 1000,
  perClient = 5,
  total = 50,
}: {
  now?: () => number;
  windowMs?: number;
  perClient?: number;
  total?: number;
} = {}) {
  const clients = new Map<string, number>();
  let resetAt = 0;
  let count = 0;
  return (key: string): RateDecision => {
    const time = now();
    if (time >= resetAt) {
      clients.clear();
      count = 0;
      resetAt = time + windowMs;
    }
    const retryAfter = Math.max(1, Math.ceil((resetAt - time) / 1000));
    const clientCount = clients.get(key) ?? 0;
    if (clientCount >= perClient || count >= total) return { allowed: false, retryAfter };
    clients.set(key, clientCount + 1);
    count += 1;
    return { allowed: true, retryAfter: 0 };
  };
}

export function contactClientKey(req: Request, trustProxyHeaders: boolean): string {
  // Only trust these headers on Vercel (which overwrites them), or when an
  // explicitly configured reverse proxy strips incoming forwarded headers.
  const forwarded = trustProxyHeaders ? req.headers.get('x-forwarded-for') : null;
  const candidate = forwarded?.split(',')[0]?.trim() ?? '';
  const version = candidate.includes('%') ? 0 : isIP(candidate);
  const address = version
    ? new URL(version === 6 ? 'http://[' + candidate + ']' : 'http://' + candidate).hostname
    : 'unknown';
  return createHash('sha256').update(address).digest('hex');
}

async function readJson(req: Request, timeoutMs: number): Promise<unknown> {
  const length = req.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    throw new ContactRequestError(413, '入力内容が長すぎます。');
  }
  if (!req.body) throw new ContactRequestError(400, '入力内容を確認してください。');
  const reader = req.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let json = '';
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => {});
  }, timeoutMs);
  try {
    while (true) {
      const chunk = await reader.read();
      if (timedOut) throw new ContactRequestError(408, '時間をおいて再度お試しください。');
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new ContactRequestError(413, '入力内容が長すぎます。');
      }
      json += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(json + decoder.decode());
  } catch (error) {
    if (error instanceof ContactRequestError) throw error;
    throw new ContactRequestError(400, '入力内容を確認してください。');
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

function response(body: { success: true } | { error: string }, status = 200, retryAfter?: number) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...(retryAfter ? { 'Retry-After': String(retryAfter) } : {}),
    },
  });
}

export function createContactHandler({
  send,
  limit = createContactRateLimiter(),
  trustProxyHeaders = false,
  bodyTimeoutMs = 5000,
  onDeliveryError = () => {},
}: {
  send: (data: ContactData) => Promise<void>;
  limit?: (key: string) => RateDecision;
  trustProxyHeaders?: boolean;
  bodyTimeoutMs?: number;
  onDeliveryError?: () => void | Promise<void>;
}) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);
    let sameOrigin = false;
    try {
      sameOrigin = new URL(req.headers.get('origin') ?? '').origin === new URL(req.url).origin;
    } catch {
      /* A missing or malformed origin is not a website form submission. */
    }
    if (!sameOrigin) return response({ error: '送信元を確認できません。' }, 403);
    if (
      req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
    ) {
      return response({ error: '入力形式を確認してください。' }, 415);
    }
    const decision = limit(contactClientKey(req, trustProxyHeaders));
    if (!decision.allowed) {
      return response(
        { error: '送信回数が多すぎます。しばらく待ってから再度お試しください。' },
        429,
        decision.retryAfter,
      );
    }
    let body: unknown;
    try {
      body = await readJson(req, bodyTimeoutMs);
    } catch (error) {
      if (error instanceof ContactRequestError)
        return response({ error: error.message }, error.status);
      return response({ error: '入力内容を確認してください。' }, 400);
    }
    // Bots filling the invisible website field get no signal and send no email.
    if (
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).website === 'string' &&
      ((body as Record<string, unknown>).website as string).trim()
    ) {
      return response({ success: true });
    }
    const data = validateContactData(body);
    if (!data) return response({ error: '入力内容を確認してください。' }, 400);
    try {
      await send(data);
    } catch {
      // Do not log submitted personal information or provider response bodies.
      try {
        await onDeliveryError();
      } catch {
        /* Reporting must not mask the response. */
      }
      return response({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }
    return response({ success: true });
  };
}
