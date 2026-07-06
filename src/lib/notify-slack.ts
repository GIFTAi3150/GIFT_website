/**
 * Minimal Slack notifier used for error/ops alerts.
 *
 * Posts to a channel via chat.postMessage using a bot token. The token lives
 * in the SLACK_BOT_TOKEN env var (set in Vercel → Environment Variables) and is
 * NEVER shipped to the client — this module is only imported from server code
 * (route handlers), and non-NEXT_PUBLIC env vars are undefined in the browser.
 *
 * Best-effort by design: it never throws, and it self-throttles so a render
 * loop or a burst of identical errors can't flood the channel. Throttle state
 * is in-memory, so it's per warm serverless instance (imperfect, but enough to
 * tame bursts).
 */

const SLACK_API = 'https://slack.com/api/chat.postMessage';

// Not a secret — a channel id. Overridable via env if the target ever changes.
const DEFAULT_CHANNEL = 'C0BD89NKJ6R';

// --- de-dup: suppress the same message within a rolling window -------------
const recent = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;

function passesDedup(key: string): boolean {
  const now = Date.now();
  if (recent.size > 200) {
    for (const [k, t] of recent) if (now - t > DEDUP_WINDOW_MS) recent.delete(k);
  }
  const last = recent.get(key);
  if (last && now - last < DEDUP_WINDOW_MS) return false;
  recent.set(key, now);
  return true;
}

// --- global cap: never send more than N messages per minute ----------------
let windowStart = 0;
let countInWindow = 0;
const GLOBAL_MAX = 20;
const GLOBAL_WINDOW_MS = 60_000;

function underGlobalLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > GLOBAL_WINDOW_MS) {
    windowStart = now;
    countInWindow = 0;
  }
  if (countInWindow >= GLOBAL_MAX) return false;
  countInWindow += 1;
  return true;
}

export type SlackNotice = {
  /** Short headline, shown in bold. */
  title: string;
  /** Optional longer detail (e.g. a stack trace) — rendered in a code block. */
  message?: string;
  /** Optional key/value lines (undefined values are skipped). */
  fields?: Record<string, string | undefined>;
  /** Overrides the de-dup key; defaults to title+message. */
  dedupKey?: string;
};

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}\n…(truncated)` : s;
}

export async function notifySlack(notice: SlackNotice): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_ERROR_CHANNEL || DEFAULT_CHANNEL;

  if (!token) {
    // No token configured — stay silent (local dev / preview without the env var).
    console.warn('[notify-slack] SLACK_BOT_TOKEN not set — skipping notification');
    return;
  }

  const key = notice.dedupKey ?? `${notice.title}|${notice.message ?? ''}`;
  if (!passesDedup(key) || !underGlobalLimit()) return;

  const fieldLines = Object.entries(notice.fields ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `*${k}:* ${v}`);

  const text = [
    `:rotating_light: *${notice.title}*`,
    ...(notice.message ? ['```' + truncate(notice.message, 2500) + '```'] : []),
    ...fieldLines,
  ].join('\n');

  try {
    const res = await fetch(SLACK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel,
        text,
        unfurl_links: false,
        unfurl_media: false,
      }),
      cache: 'no-store',
    });
    const data: unknown = await res.json().catch(() => null);
    const ok = typeof data === 'object' && data !== null && (data as { ok?: boolean }).ok;
    if (!ok) {
      const err = (data as { error?: string } | null)?.error ?? res.statusText;
      console.error('[notify-slack] Slack API rejected the message:', err);
    }
  } catch (err) {
    console.error('[notify-slack] failed to reach Slack:', err);
  }
}

/** Normalise an unknown thrown value into { message, stack }. */
export function describeError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack };
  if (typeof err === 'string') return { message: err };
  try {
    return { message: JSON.stringify(err) };
  } catch {
    return { message: String(err) };
  }
}
