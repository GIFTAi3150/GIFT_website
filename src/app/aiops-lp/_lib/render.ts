import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  campaigns,
  BENEFITS_INTRO,
  COMMON_PROMISE,
  CTA_LABEL,
  type CampaignId,
  type Placement,
} from './content';
import { analyticsConfig, handoffPath } from './config';

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

function renderBenefitOffer(offer: string, highlight: string): string {
  const index = offer.indexOf(highlight);
  if (index < 0) return escapeHtml(offer);
  const before = offer.slice(0, index);
  const after = offer.slice(index + highlight.length);
  return (
    (before ? '<span class="offer-context">' + escapeHtml(before) + '</span>' : '') +
    '<strong class="offer-highlight">' +
    escapeHtml(highlight) +
    '</strong>' +
    (after ? '<span class="offer-condition">' + escapeHtml(after) + '</span>' : '')
  );
}

export async function renderLandingPage(
  id: CampaignId,
  ready: boolean,
  qr: string,
): Promise<string> {
  const campaign = campaigns[id];
  const e = escapeHtml;
  const lineIcon =
    '<svg class="line-bubble" viewBox="0 0 44 40" aria-hidden="true"><path d="M41 17.3C41 8.8 32.4 2 22 2S3 8.8 3 17.3c0 7.6 6.8 13.9 16 15.1l-.5 4.7c-.1.7.5 1.1 1.1.8C23.5 35.6 41 26.4 41 17.3Z" fill="currentColor"/><text x="9.4" y="21" font-size="11" font-weight="700" fill="#2563eb" font-family="Poppins,sans-serif">LINE</text></svg>';
  const overviewIcons = {
    time: '<circle cx="24" cy="24" r="14" fill="currentColor" fill-opacity=".08"/><path d="M37.5 20A14 14 0 1 1 28 10.5M24 16v9l6 3"/><path class="overview-icon-accent" d="m35 6 1.8 5.2L42 13l-5.2 1.8L35 20l-1.8-5.2L28 13l5.2-1.8Z"/>',
    team: '<path d="M9 36v-3a8 8 0 0 1 16 0v3M29 26a7 7 0 0 1 10 6v4"/><circle cx="17" cy="17" r="5" fill="currentColor" fill-opacity=".08"/><path d="M29 13a5 5 0 0 1 0 10"/><path class="overview-icon-accent" d="m35 5 1.3 3.7L40 10l-3.7 1.3L35 15l-1.3-3.7L30 10l3.7-1.3Z"/>',
    web: '<rect x="7" y="10" width="34" height="28" rx="4" fill="currentColor" fill-opacity=".08"/><path d="M7 18h34M13 14h.1M18 14h.1"/><path class="overview-icon-accent" d="m15 31 7-7 5 4 7-7m-6 0h6v6"/>',
  };
  function cta(placement: Placement) {
    const actionStart = CTA_LABEL.indexOf('特典');
    const label =
      placement === 'footer' && actionStart > 0
        ? '<span class="cta-label"><span class="cta-caption">' +
          e(CTA_LABEL.slice(0, actionStart)) +
          '</span><span class="cta-action">' +
          e(CTA_LABEL.slice(actionStart)) +
          '</span></span>'
        : '<span>' + e(CTA_LABEL) + '</span>';
    const content = lineIcon + label;
    return ready
      ? '<a class="line-cta line-button lp-cta lp-cta--line" data-placement="' +
          placement +
          '" href="' +
          e(handoffPath(id, placement)) +
          '">' +
          content +
          '</a>'
      : '<button class="line-cta line-button lp-cta lp-cta--line" type="button" disabled>' +
          content +
          '</button>';
  }
  const values: Record<string, string> = {
    TITLE: e(campaign.headline.join('') + ' | 株式会社GIFT'),
    DESCRIPTION: e(COMMON_PROMISE + ' LINE登録で' + campaign.guide + 'をお届けします。'),
    CAMPAIGN: id,
    LABEL: e(campaign.label),
    HEADLINE: campaign.headline.map((part) => '<span>' + e(part) + '</span>').join(''),
    // The common headline already is the shared sentence; do not repeat it below.
    PROMISE: id === 'common' ? '' : '<p class="hero-description">' + e(COMMON_PROMISE) + '</p>',
    GUIDE: e(campaign.guide),
    INTRO_EYEBROW: e(BENEFITS_INTRO.eyebrow),
    INTRO_HEADING: BENEFITS_INTRO.headline.map((part) => '<span>' + e(part) + '</span>').join(''),
    INTRO_COPY: e(BENEFITS_INTRO.description),
    INTRO_BENEFITS_HEADING: e(BENEFITS_INTRO.benefitsHeading),
    INTRO_BENEFITS: BENEFITS_INTRO.benefits
      .map(
        (benefit) => `<li class="overview-benefit">
          <span class="overview-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${overviewIcons[benefit.icon]}</svg></span>
          <h3>${e(benefit.title)}</h3>
          <p>${e(benefit.detail)}</p>
        </li>`,
      )
      .join(''),
    INTRO_INVITATION_TITLE: e(BENEFITS_INTRO.invitationTitle),
    INTRO_INVITATION: e(BENEFITS_INTRO.invitation),
    DELIVERY_HEADING: campaign.offer
      ? '<span class="flow-heading-lead">資料と特典を、</span><span class="flow-heading-main"><span class="flow-heading-line">あなたの</span><span class="flow-heading-line"><span class="flow-line-word">LINE</span>へ。</span></span>'
      : '<span class="flow-heading-lead">資料を、</span><span class="flow-heading-main"><span class="flow-heading-line">あなたの</span><span class="flow-heading-line"><span class="flow-line-word">LINE</span>へ。</span></span>',
    FLOW_RECEIVE: campaign.offer ? '資料・特典を' : '資料を',
    FLOW_REWARD:
      'offerHighlight' in campaign
        ? renderBenefitOffer(campaign.offer, campaign.offerHighlight)
        : '<span class="offer-context">はじめの一歩に</span><strong class="offer-highlight">無料個別相談</strong>',
    HERO_OFFER: campaign.offer
      ? '<p class="hero-offer"><strong>' + e(campaign.offer) + '</strong></p>'
      : '',
    HERO_CTA: cta('hero'),
    FOOTER_CTA: cta('footer'),
    BENEFIT_CARDS: Object.entries(campaigns)
      .filter(
        (
          entry,
        ): entry is [
          Exclude<CampaignId, 'common'>,
          (typeof campaigns)[Exclude<CampaignId, 'common'>],
        ] => entry[0] !== 'common',
      )
      .sort(
        ([left], [right]) =>
          Number(right === 'hp') - Number(left === 'hp') ||
          Number(right === id) - Number(left === id),
      )
      .map(
        ([key, item]) => `
        <li class="line-benefit-card" data-service="${key}"${key === id ? ' data-featured' : ''} data-enter aria-labelledby="service-${key}">
          <div class="line-benefit-heading">
              <span class="line-benefit-art" data-service-art="${key}" aria-hidden="true"><img class="benefit-art-poster" src="/aiops-lp/illustrations/sculpted/${key}.webp" width="384" height="384" alt="" loading="lazy" decoding="async" /></span>
              <h3 id="service-${key}">${e(item.label)}</h3>
          </div>
          <dl class="line-benefit-details">
            <div class="line-benefit-offer"><dt>特典</dt><dd>${renderBenefitOffer(item.offer, item.offerHighlight)}</dd></div>
          </dl>
        </li>`,
      )
      .join(''),
    QR: ready
      ? '<figure class="qr"><div role="img" aria-label="LINE登録用QRコード">' +
        qr +
        '</div><figcaption>スマートフォンで<br>読み取って登録</figcaption></figure>'
      : '',
    ANALYTICS: JSON.stringify({ campaign: id, ...analyticsConfig() }).replace(/</g, '\\u003c'),
  };
  const template = await readFile(path.join(process.cwd(), 'src/app/aiops-lp/index.html'), 'utf8');
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error('Unknown LP template field: ' + key);
    return values[key];
  });
}
