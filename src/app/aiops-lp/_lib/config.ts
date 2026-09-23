import type { CampaignId, Placement } from './content';

const LINE_HOSTS = new Set(['lin.ee', 'line.me', 'liff.line.me']);

export function verifiedLineUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== 'https:' ||
      !LINE_HOSTS.has(url.hostname) ||
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

export function lineUrl(id: CampaignId): string | null {
  // Keep each campaign distinct; no silent fallback to another campaign's URL.
  return verifiedLineUrl(process.env['AIOPS_LP_LINE_' + id.toUpperCase() + '_URL']);
}

export function handoffPath(id: CampaignId, placement: Placement): string {
  return '/aiops-lp/line?' + new URLSearchParams({ p: id, placement }).toString();
}

export function publicOrigin(requestUrl: string): string {
  const configured = process.env.AIOPS_LP_ORIGIN;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' && !url.username && !url.password) return url.origin;
    } catch {
      // An invalid setting must not generate an unsafe QR code.
    }
  }
  return new URL(requestUrl).origin;
}

export function analyticsConfig() {
  const pixel = process.env.AIOPS_LP_META_PIXEL_ID || '';
  const ga = process.env.AIOPS_LP_GA_ID || '';
  return {
    metaPixelId: /^\d{5,20}$/.test(pixel) ? pixel : '',
    gaId: /^G-[A-Z0-9]+$/.test(ga) ? ga : '',
  };
}
