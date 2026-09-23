import { readFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

// A complete document keeps the supplied design independent of the main site's
// navigation, global styles, page cover and React/WebGL lifecycle.
export const dynamic = 'force-static';
export const runtime = 'nodejs';

const lineUrl = 'https://line.me/R/ti/p/%40628hcnbt';

export async function GET() {
  const [template, qr] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/app/ai-catalog-lp/index.html'), 'utf8'),
    QRCode.toString(lineUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 4,
      color: { dark: '#0b1020', light: '#ffffff' },
    }),
  ]);

  const html = template.replaceAll('{{LINE_URL}}', lineUrl).replace('{{LINE_QR}}', qr);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
