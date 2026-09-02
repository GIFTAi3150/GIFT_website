// Every string shown on /works. Soft-launch draft — this page is not yet wired
// into Header/Footer nav or sitemap.ts (see Plans.md T-WK4).
//
// ⚠️ PLACEHOLDER CONTENT: no real client has been confirmed for public listing
// yet. Every company name, logo, industry label, and case description below is
// a stand-in, marked with a `// 【要確認】` comment. Each placeholder set has a
// matching row in docs/works-facts-to-confirm.md — keep the two in sync if
// either changes. Do not treat any name or figure here as a confirmed fact.

export const HERO = {
  nameEn: 'WORKS',
  headline: '取引実績',
  body: '業種も規模も異なるお客様とともに、現場に根ざした改善を積み重ねてきました。',
} as const;

// A single logo-wall tile. `logoSrc` is left optional on purpose: once real
// logos are collected they land in public/img/works/ and get wired in here
// one row at a time — no component change needed, the tile falls back to the
// "LOGO" placeholder box whenever `logoSrc` is unset.
export type LogoTile = {
  companyName: string;
  logoSrc?: string;
};

// 【要確認】掲載企業リストは未確定。8社ぶんの仮社名のみ。実ロゴ・正式社名・
// 掲載順ルールは docs/works-facts-to-confirm.md を参照して確定させる。
export const LOGO_WALL: { note: string; tiles: LogoTile[] } = {
  note: '※ ロゴ・社名はすべて仮。掲載承諾済み企業の実ロゴに差し替え予定です（順不同・グリッドは追加可能）。',
  tiles: [
    { companyName: '株式会社サンプルA' },
    { companyName: '株式会社サンプルB' },
    { companyName: '株式会社サンプルC' },
    { companyName: '株式会社サンプルD' },
    { companyName: '株式会社サンプルE' },
    { companyName: '株式会社サンプルF' },
    { companyName: '株式会社サンプルG' },
    { companyName: '株式会社サンプルH' },
  ],
};

export type PickUpCase = {
  companyName: string;
  industry: string;
  body: string;
  logoSrc?: string;
};

// 【要確認】PickUp 2社は仮選定（サンプルA・B）。選定基準（規模・業種バランス・
// 掲載承諾の強さ等）と実際の取組内容は docs/works-facts-to-confirm.md で確定させる。
export const PICK_UP: { eyebrow: string; title: string; cases: PickUpCase[] } = {
  eyebrow: 'PICK UP',
  title: '代表的な取り組み',
  cases: [
    {
      companyName: '株式会社サンプルA ［仮社名］',
      industry: '通信 ［仮・業種］',
      body: 'コールセンター業務の立ち上げから運用設計までを一貫して支援。応対品質の標準化に取り組みました。［仮テキスト］',
    },
    {
      companyName: '株式会社サンプルB ［仮社名］',
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
