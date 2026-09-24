import { readFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
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

function configuredLineUrl(): string | null {
  const value = process.env.FUKUSHI_KAIGO_LP_LINE_URL;
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      !['line.me', 'lin.ee', 'liff.line.me'].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname === '/'
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

function lineButton(url: string | null, placement: 'hero' | 'footer' | 'sticky') {
  const label = placement === 'sticky' ? 'LINEで受け取る' : 'LINE登録して特典を受け取る';
  const content = '<span>' + label + '</span>';
  if (url) {
    return (
      '<a class="gift-line-button" href="' +
      escapeHtml(url) +
      '" data-line-placement="' +
      placement +
      '">' +
      content +
      '</a>'
    );
  }
  const statusId = 'gift-line-status-' + placement;
  return (
    '<button class="gift-line-button" type="button" data-line-pending ' +
    'aria-describedby="' +
    statusId +
    '" aria-controls="' +
    statusId +
    '">' +
    content +
    '</button><p class="gift-provisional" id="' +
    statusId +
    '" role="status" aria-live="polite"' +
    (placement === 'sticky' ? ' hidden' : '') +
    '>LINEでのカタログ配布は準備中です。</p>'
  );
}

export async function GET() {
  const template = await readFile(
    path.join(process.cwd(), 'src/app/fukushi-kaigo-lp/index.html'),
    'utf8',
  );
  const lineUrl = configuredLineUrl();
  const qr = lineUrl
    ? '<a class="gift-qr-code" href="' +
      escapeHtml(lineUrl) +
      '" data-line-placement="qr" aria-label="LINEでカタログを受け取る">' +
      (await QRCode.toString(lineUrl, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 4,
        color: { dark: '#0b1020', light: '#ffffff' },
      })) +
      '</a>'
    : '<div class="gift-qr-placeholder" role="img" aria-label="QRコードは準備中です。">' +
      '<span>QRコード<br>準備中</span></div>';

  const html = template
    .replace('{{LINE_BUTTON_HERO}}', lineButton(lineUrl, 'hero'))
    .replace('{{LINE_BUTTON_FOOTER}}', lineButton(lineUrl, 'footer'))
    .replace('{{LINE_BUTTON_STICKY}}', lineButton(lineUrl, 'sticky'))
    .replace('{{LINE_QR}}', qr)
    .replaceAll('{{COMPANY_NAME}}', escapeHtml(company.name))
    .replaceAll('{{COMPANY_ADDRESS}}', escapeHtml(company.address));

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Keep the campaign out of search until its LINE delivery is approved.
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
