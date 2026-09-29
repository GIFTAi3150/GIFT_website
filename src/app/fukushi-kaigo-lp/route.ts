import { readFile } from 'node:fs/promises';
import path from 'node:path';
import company from '@/data/company.json';

// Serve the supplied document without the corporate site's layout or runtime.
export const dynamic = 'force-static';
export const runtime = 'nodejs';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// LINE official account「GIFT×AI」(@628hcnbt). The QR is LINE's own image for the same account.
const LINE_URL = 'https://lin.ee/zjPyc2D';
const LINE_QR_SRC = '/fukushi-kaigo-lp/assets/line-qr-gift-ai.png';

function lineButton(placement: 'hero' | 'footer' | 'sticky') {
  const label = placement === 'sticky' ? 'LINEで受け取る' : 'LINE登録してカタログを受け取る';
  return (
    '<a class="gift-line-button" href="' +
    LINE_URL +
    '" data-line-placement="' +
    placement +
    '"><span>' +
    label +
    '</span></a>'
  );
}

export async function GET() {
  const template = await readFile(
    path.join(process.cwd(), 'src/app/fukushi-kaigo-lp/index.html'),
    'utf8',
  );
  const qr =
    '<a class="gift-qr-code" href="' +
    LINE_URL +
    '" data-line-placement="qr" aria-label="LINEでカタログを受け取る">' +
    '<img src="' +
    LINE_QR_SRC +
    '" width="360" height="360" alt="LINE公式アカウント「GIFT×AI」の友だち追加QRコード" loading="lazy" decoding="async" /></a>';

  const html = template
    .replace('{{LINE_BUTTON_HERO}}', lineButton('hero'))
    .replace('{{LINE_BUTTON_FOOTER}}', lineButton('footer'))
    .replace('{{LINE_BUTTON_STICKY}}', lineButton('sticky'))
    .replace('{{LINE_QR}}', qr)
    .replaceAll('{{COMPANY_NAME}}', escapeHtml(company.name))
    .replaceAll('{{COMPANY_ADDRESS}}', escapeHtml(company.address));

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Ad landing page: keep it out of search.
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
