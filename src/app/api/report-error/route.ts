import { NextResponse } from 'next/server';
import { notifySlack } from '@/lib/notify-slack';

export const dynamic = 'force-dynamic';

// Cap the accepted payload so a malformed/oversized POST can't tie us up.
const MAX_BODY_BYTES = 16_000;

/**
 * Relay for client-side errors: the browser can't hold the Slack bot token, so
 * ErrorReporter / global-error POST here and this server route forwards to Slack.
 *
 * Guarded (best-effort) against abuse: same-origin only + size cap. The notifier
 * itself de-dups and rate-limits, so even if a page loops, Slack won't flood.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Same-origin guard — browsers always send Origin on a cross-origin POST.
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && !originMatchesHost(origin, host)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const body = JSON.parse(raw || '{}') as {
      kind?: string;
      message?: string;
      name?: string;
      stack?: string;
      digest?: string;
      source?: string;
      url?: string;
      userAgent?: string;
      phase?: string;
    };

    if (!body.message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Lead with the message, then the stack. Previously this sent
    // `stack || message`, so any error carrying a stack arrived in Slack as a
    // bare stack with nothing naming it — unactionable.
    const headline = body.name ? `${body.name}: ${body.message}` : body.message;

    const detail = {
      page: body.url,
      source: body.source,
      digest: body.digest,
      browser: body.userAgent?.slice(0, 200),
      phase: body.phase,
      env: process.env.VERCEL_ENV || 'development',
    };

    // Always land in the Vercel server logs — that's a private surface, so it
    // costs nobody anything and keeps us from going blind.
    console.error('[client-error]', headline, JSON.stringify(detail), body.stack ?? '');

    // Slack relay is OPT-IN. The channel is shared with the whole team, and a
    // browser-side bug can fire on every page load for every visitor — during
    // the 2026-07-13 iOS hunt it buried the channel. Client errors are rarely
    // urgent enough to page a team in real time, so they stay in the logs unless
    // someone deliberately turns the firehose on.
    //
    // To re-enable: set CLIENT_ERROR_SLACK=on in the Vercel project env vars
    // (no redeploy needed beyond the next build). Turn it off again by removing
    // it. Server-side errors are unaffected — they still notify as before.
    if (process.env.CLIENT_ERROR_SLACK === 'on') {
      await notifySlack({
        title: `サイトエラー (${body.kind || 'client'})`,
        message: [headline, body.stack].filter(Boolean).join('\n\n').slice(0, 3000),
        fields: {
          Page: detail.page,
          Source: detail.source,
          Digest: detail.digest,
          Browser: detail.browser,
          Phase: detail.phase,
          Env: detail.env,
        },
        dedupKey: `client:${body.message.slice(0, 200)}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Error reporting must never itself become a loud error.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

function originMatchesHost(origin: string, host: string): boolean {
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
