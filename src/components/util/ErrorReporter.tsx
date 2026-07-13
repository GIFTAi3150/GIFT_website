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

    // Third-party scripts (analytics tags, ad pixels, browser extensions) throw
    // their own errors we can neither fix nor act on — e.g. Microsoft Clarity's
    // "Cannot read properties of null (reading 'sequence')". Drop anything whose
    // source URL / stack points at a known third party so the Slack channel stays
    // signal-only. Matched as substrings against the filename and the stack.
    const NOISE_SOURCES = [
      'clarity.ms',
      'googletagmanager.com',
      'google-analytics.com',
      'doubleclick',
      'facebook.net',
      'connect.facebook',
      'chrome-extension://',
      'moz-extension://',
      'safari-web-extension://',
    ];
    const isNoise = (text: string | null | undefined): boolean =>
      !!text && NOISE_SOURCES.some((s) => text.includes(s));

    const onError = (event: ErrorEvent): void => {
      // Dead old URLs (/DashBoard, /support997/*) get crawled after the domain
      // cutover and render the 404 page, where a few bot/legacy browsers throw a
      // non-reproducible React error. Those pages don't exist and there's
      // nothing to fix — skip them so the Slack channel stays signal-only.
      if (window.__giftNotFound) return;
      // Resource load failures (img/script) surface here with no message/error —
      // skip them, they're not app crashes.
      if (!event.message && !event.error) return;
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      // Opaque cross-origin errors arrive as "Script error." with no detail and
      // are almost always third-party — skip those plus any known-noise source.
      if (event.message === 'Script error.' || isNoise(event.filename) || isNoise(stack)) return;
      // Safari fires some errors (notably stack overflows raised inside a
      // library's rAF callback) with an empty event.message, so the alert
      // arrives as a bare stack with nothing naming it. Fall back to the
      // Error's own name/message, and send the UA — "which browser" is the
      // first question every one of these raises.
      const err = event.error instanceof Error ? event.error : undefined;
      const msg = event.message || (err && (err.message || err.name)) || 'Unknown error';
      if (!allow(msg)) return;
      report({
        kind: 'window.onerror',
        message: msg,
        name: err?.name,
        stack,
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    };

    const onRejection = (event: PromiseRejectionEvent): void => {
      const reason = event.reason;
      const stack = reason instanceof Error ? reason.stack : undefined;
      const msg =
        reason instanceof Error ? reason.message : String(reason ?? 'Unhandled rejection');
      // Third-party rejections (e.g. Clarity) carry their own bundle URL in the
      // stack — drop them the same way as onError.
      if (isNoise(stack) || isNoise(msg)) return;
      if (!allow(msg)) return;
      report({
        kind: 'unhandledrejection',
        message: msg,
        stack,
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
