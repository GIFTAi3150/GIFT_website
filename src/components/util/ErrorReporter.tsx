'use client';

import { useEffect } from 'react';

/**
 * Global client-side error catcher. Mounted once in the root layout, it listens
 * for uncaught errors and unhandled promise rejections and forwards them to
 * /api/report-error, which relays to Slack. Renders nothing.
 *
 * Fire-and-forget and self-throttled so a render loop can't spam the channel.
 */
function report(payload: Record<string, unknown>): void {
  try {
    fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // still delivers if the page is unloading
    }).catch(() => {});
  } catch {
    /* never let error reporting throw */
  }
}

export default function ErrorReporter(): null {
  useEffect(() => {
    // Throttle identical messages to at most once per minute.
    const seen = new Map<string, number>();
    const WINDOW = 60_000;
    const allow = (key: string): boolean => {
      const now = Date.now();
      const last = seen.get(key);
      if (last && now - last < WINDOW) return false;
      seen.set(key, now);
      return true;
    };

    const onError = (event: ErrorEvent): void => {
      // Resource load failures (img/script) surface here with no message/error —
      // skip them, they're not app crashes.
      if (!event.message && !event.error) return;
      const msg = event.message || 'Unknown error';
      if (!allow(msg)) return;
      report({
        kind: 'window.onerror',
        message: msg,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
        url: window.location.href,
      });
    };

    const onRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason;
      const msg =
        reason instanceof Error ? reason.message : String(reason ?? 'Unhandled rejection');
      if (!allow(msg)) return;
      report({
        kind: 'unhandledrejection',
        message: msg,
        stack: reason instanceof Error ? reason.stack : undefined,
        url: window.location.href,
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
