import { campaignId, placementId } from '../_lib/content';
import { lineUrl } from '../_lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = campaignId(url.searchParams.get('p'));
  const placement = placementId(url.searchParams.get('placement'));
  const target = lineUrl(id);
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!placement || !target) {
    return new Response(
      '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LINE登録について | GIFT</title><body style="font-family:sans-serif;padding:48px;line-height:1.8"><h1>LINE登録の受付準備中です。</h1><p>しばらくお待ちください。</p><a href="/aiops-lp?p=' +
        id +
        '">ページへ戻る</a></body></html>',
      {
        status: 503,
        headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' },
      },
    );
  }
  // A handoff request is not a confirmed friend addition. In particular, QR
  // requests can include scanners/bots. LINE attribution is configured separately.
  console.info(
    JSON.stringify({
      event: 'aiops_lp_line_handoff',
      campaign: id,
      placement,
      timestamp: new Date().toISOString(),
    }),
  );
  return new Response(null, { status: 302, headers: { ...headers, Location: target } });
}
