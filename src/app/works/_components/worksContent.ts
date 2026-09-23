// Every string shown on /works. Soft-launch draft — this page is not yet wired
// into Header/Footer nav or sitemap.ts (see Plans.md T-WK4).
//
// Client logos supplied by the requester are listed first. Sample company
// names, industry labels, and case descriptions remain placeholder content.
// Do not treat those placeholders as confirmed facts.

export const HERO = {
  nameEn: 'WORKS',
  headline: '取引実績',
} as const;

export const INTRO = {
  eyebrow: 'OUR WORK',
  titleParts: ['企業ごとの課題に、', '必要な支援を。'],
  visualCaption: 'WORKING TOGETHER',
  areas: [
    {
      title: '業務の自動化',
      category: 'AUTOMATION',
      href: '/services/aiops',
    },
    {
      title: 'AIの導入・研修',
      category: 'AI',
      href: '/services/ai-training',
    },
    {
      title: 'Web制作・運用',
      category: 'WEB',
      href: '/services/web-development',
    },
  ],
} as const;

// A single logo-wall tile. `logoSrc` is left optional on purpose: once real
// logos are collected they land in public/img/works/ and get wired in here
// one row at a time. The carousel only displays entries with a supplied logo;
// sample names remain here until their artwork is supplied.
export type LogoTile = {
  companyName: string;
  logoSrc?: string;
};

// Supplied client logos precede the remaining sample company placeholders.
export const LOGO_WALL: {
  trust: { count: string; unit: string; lead: string; caption: string };
  note?: string;
  tiles: LogoTile[];
} = {
  trust: {
    count: '200',
    unit: '社以上',
    lead: 'の企業に',
    caption: '信頼されています',
  },
  // 掲載順ルール: 五十音順(読み仮名ベース)。実企業を先頭に、プレースホルダは末尾。
  tiles: [
    // Japanese reading order: Atorie, willB, Gran, Sales Index, MARKELINK, LIFE CREATE, RAYS.
    // New client names follow the wordmarks in the supplied artwork.
    { companyName: 'あとりえ', logoSrc: '/img/works/atorie.png' },
    { companyName: 'willB', logoSrc: '/img/works/willb.png' },
    {
      companyName: '株式会社グランコミュニケーションズ',
      logoSrc: '/img/works/gran-communications.png',
    },
    { companyName: '株式会社Sales Index', logoSrc: '/img/works/sales-index.png' },
    { companyName: 'MARKELINK', logoSrc: '/img/works/markelink.svg' },
    { companyName: 'LIFE CREATE', logoSrc: '/img/works/life-create.png' },
    { companyName: '株式会社RAYS', logoSrc: '/img/works/rays.png' },
    // 以下は仮(実ロゴ回収後に差し替え・五十音順に挿入)
    { companyName: '株式会社サンプルA' },
    { companyName: '株式会社サンプルB' },
    { companyName: '株式会社サンプルC' },
    { companyName: '株式会社サンプルD' },
    { companyName: '株式会社サンプルE' },
    { companyName: '株式会社サンプルF' },
  ],
};

export type PickUpCase = {
  imageSrc: string;
  icon: 'headphones' | 'store';
  industry: string;
  body: string;
};

// 導入事例は会社名を出さず「業種 + 内容」で紹介する方針(2026-09-02 依頼者決定)。
// 【要確認】事例の業種・内容は仮。実事例の文言は docs/works-facts-to-confirm.md で確定させる。
export const PICK_UP: { eyebrow: string; title: string; cases: PickUpCase[] } = {
  eyebrow: 'PICK UP',
  title: '導入事例',
  cases: [
    {
      imageSrc: '/img/services/cc-homep.jpg',
      icon: 'headphones',
      industry: '通信 ［仮・業種］',
      body: 'コールセンター業務の立ち上げから運用設計までを一貫して支援。応対品質の標準化に取り組みました。［仮テキスト］',
    },
    {
      imageSrc: '/img/services/services-dx-photo.png',
      icon: 'store',
      industry: '小売 ［仮・業種］',
      body: '店舗オペレーションのDX化を支援。日次報告をLINEベースのワークフローへ移行しました。［仮テキスト］',
    },
  ],
};

export const CTA = {
  headline: '私たちと一緒に、次の事例をつくりませんか',
  label: 'お問い合わせ',
  href: '/contact',
} as const;
