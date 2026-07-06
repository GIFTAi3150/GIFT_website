import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { notifySlack } from '@/lib/notify-slack';

export const dynamic = 'force-dynamic';

/**
 * Receives Vercel deployment webhooks and pings Slack when a deploy FAILS.
 *
 * Setup (Vercel dashboard → Settings → Webhooks):
 *   - URL:    https://aiops.gift-inc.org/api/vercel-webhook
 *   - Events: Deployment Error (at minimum)
 *   - Copy the generated signing secret into the VERCEL_WEBHOOK_SECRET env var.
 *
 * Vercel signs each request with x-vercel-signature = HMAC-SHA1(rawBody, secret).
 * If the secret is set we verify it; unsigned/forged requests are rejected.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.text();

  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers.get('x-vercel-signature');
    const expected = crypto.createHmac('sha1', secret).update(raw).digest('hex');
    if (!signature || !timingSafeEqual(signature, expected)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let event: {
    type?: string;
    payload?: {
      name?: string;
      url?: string;
      deployment?: { name?: string; url?: string; meta?: Record<string, string> };
      project?: { name?: string };
      meta?: Record<string, string>;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = event.type;
  if (type === 'deployment.error' || type === 'deployment.canceled') {
    const p = event.payload ?? {};
    const meta = p.deployment?.meta ?? p.meta ?? {};
    const name = p.deployment?.name || p.name || p.project?.name || 'gift-website';
    const url = p.deployment?.url || p.url;
    const sha = meta.githubCommitSha;

    await notifySlack({
      title: type === 'deployment.error' ? 'デプロイ失敗 ❌' : 'デプロイ中止',
      fields: {
        Project: name,
        Branch: meta.githubCommitRef,
        Commit: sha ? sha.slice(0, 7) : undefined,
        Message: meta.githubCommitMessage,
        URL: url ? `https://${url}` : undefined,
      },
      dedupKey: `deploy:${type}:${url ?? name}`,
    });
  }

  // Always 200 so Vercel doesn't retry events we intentionally ignore.
  return NextResponse.json({ ok: true });
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
