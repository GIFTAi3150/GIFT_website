// Approved draft copy: Advertising_Operations PR #16 (merged 2026-09-18).
// Campaign headlines and the full service-benefits overview share this source.
// Final headlines remain a campaign-owner task.
export const COMMON_PROMISE = 'AIを会社に入れるなら、まず無料の個別相談から。';
export const CTA_LABEL = 'LINE登録して特典を受け取る';

export const BENEFITS_INTRO = {
  eyebrow: 'WITH GIFT',
  headline: ['日々の手間を減らし、', '大切な仕事に、時間を。'],
  description:
    '資料づくりや日々の事務作業を、もっとスムーズに。GIFTは、AIの導入・研修やWebの活用を通じて、大切な仕事に集中できる環境づくりを支援します。',
  benefitsHeading: 'AIとWebで、できること。',
  benefits: [
    { icon: 'time', title: '時間をつくる', detail: '事務を効率化' },
    { icon: 'team', title: 'チームが育つ', detail: 'AIを使える力に' },
    { icon: 'web', title: 'Webを育てる', detail: '制作から運用まで' },
  ],
  invitationTitle: 'はじめの一歩は、LINEから。',
  invitation: 'サービス資料や登録者限定の特典を見ながら、御社に合う活用方法を探してみませんか。',
} as const;

export const campaigns = {
  common: {
    label: 'AI活用のご相談',
    headline: ['AIを会社に入れるなら、', 'まず無料の個別相談から。'],
    guide: '業種別AIスキルカタログ',
    offer: '',
    // The brief does not settle a universal discount. Do not invent one.
  },
  hp: {
    summary: 'ホームページをAIで管理。',
    offerHighlight: '初月無料',
    label: 'HPサブスク',
    headline: ['ホームページの制作も更新も、', 'AIで自社管理できる形に。'],
    guide: 'AIで自社管理できるホームページの仕組みと料金の目安',
    offer: 'AI内製化コースのみ初月無料（通常コースは対象外）',
  },
  kenshu: {
    summary: '社員のAI活用を支援。',
    offerHighlight: '無料でご提供',
    label: 'AI研修',
    headline: ['助成金を使って、', '社員のAI研修を。'],
    guide: '業種別AIスキルカタログ',
    offer: '研修後のフォローを無料でご提供',
  },
  jinzai: {
    summary: 'AI人材が日々の事務を支援。',
    offerHighlight: '初月無料',
    label: 'AI人材',
    headline: ['月10万円で、御社の事務を', 'AI人材に任せる。'],
    guide: '業種別AIスキルカタログ',
    offer: '初月無料',
  },
  ai: {
    summary: '社内情報に詳しい専用AI。',
    offerHighlight: '初期導入費無料',
    label: '自社専用AI',
    headline: ['自社の情報を全部知っているAIを、', '御社専用に。'],
    guide: '業種別AIスキルカタログ',
    offer: '初期導入費無料',
  },
  sf: {
    summary: 'Salesforceの構築とAI活用。',
    offerHighlight: '構築費無料',
    label: 'Salesforce構築代行',
    headline: ['Salesforceの構築を代行。', 'AIで使いこなすところまで。'],
    guide: 'SalesforceをAIで使いこなす',
    offer: '構築費無料',
  },
} as const;

export type CampaignId = keyof typeof campaigns;
export type Campaign = (typeof campaigns)[CampaignId];
export type Placement = 'hero' | 'footer' | 'qr';

export function campaignId(value: string | null): CampaignId {
  return value !== null && Object.hasOwn(campaigns, value) ? (value as CampaignId) : 'common';
}

export function placementId(value: string | null): Placement | null {
  return value === 'hero' || value === 'footer' || value === 'qr' ? value : null;
}
