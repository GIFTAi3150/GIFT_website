'use client';

import { useEffect } from 'react';

/**
 * Root error boundary. Catches render errors that bubble past every nested
 * boundary (including the root layout), reports them to Slack via
 * /api/report-error, and shows a calm fallback instead of a blank page.
 *
 * Note: in production, errors thrown in Server Components are redacted by Next
 * — we receive only a generic message + `digest`. The full detail is in the
 * Vercel logs, searchable by that digest (which we forward to Slack).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'global-error',
          message: error.message || 'Unknown render error',
          stack: error.stack,
          digest: error.digest,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* noop */
    }
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F0F7FF',
          color: '#111B21',
          fontFamily:
            "'Noto Sans JP', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p style={{ fontSize: 14, letterSpacing: '0.08em', opacity: 0.6, margin: '0 0 12px' }}>
            ERROR
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
            問題が発生しました
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, margin: '0 0 24px' }}>
            ページの読み込み中にエラーが発生しました。お手数ですが、再読み込みをお試しください。
          </p>
          <button
            onClick={() => reset()}
            style={{
              appearance: 'none',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#111B21',
              color: '#F0F7FF',
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
