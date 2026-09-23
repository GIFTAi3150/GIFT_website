import QRCode from 'qrcode';
import { campaignId } from './_lib/content';
import { handoffPath, lineUrl, publicOrigin } from './_lib/config';
import { renderLandingPage } from './_lib/render';

// Keep the existing standalone route, separate from the main site's layout.
// Server rendering avoids a generic-headline flash and works without JavaScript.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const id = campaignId(new URL(request.url).searchParams.get('p'));
  const ready = lineUrl(id) !== null;
  const qr = ready
    ? await QRCode.toString(new URL(handoffPath(id, 'qr'), publicOrigin(request.url)).href, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 4,
        color: { dark: '#102a52', light: '#ffffff' },
      })
    : '';
  return new Response(await renderLandingPage(id, ready, qr), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'private, no-store',
    },
  });
}
