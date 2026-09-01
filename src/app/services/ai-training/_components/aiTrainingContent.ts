// Every string shown on /services/ai-training. Soft-launch draft — this page is
// not yet wired into Header/Footer nav or sitemap.ts (see Plans.md T-AT4).
//
// ⚠️ PLACEHOLDER FIGURES: every number and institution name below is a stand-in,
// marked with a `// 【要確認】` comment on the line it lives on. Each one has a
// matching row in docs/ai-training-facts-to-confirm.md — keep the two in sync if
// either changes. Do not treat any 万円 figure here as a real quote.

// NOTE: points[].body はヒーローでは未表示(title のみ使用)。
// 依頼者確定コピーの候補として保持している — 削除しないこと。
export const HERO = {
  nameEn: 'AI TRAINING',
  // 【要確認】正式なサービス名表記(リスキリング有無)は依頼者確認。
  // 配列の要素間でのみ改行を許可する(「研修」の途中で折れるのを防ぐ)。
  nameJaParts: ['生成AI', 'リスキリング研修'],
  headline: {
    line1: '「使ってみた」から',
    bracketed: '使いこなす',
    tail: 'へ。',
  },
  body: '生成AIを日々の業務に組み込み、成果につなげるための実践型研修です。ツールの使い方を教えるだけでなく、自社の業務で使い続けられる状態をつくることを目的にしています。',
  points: [
    {
      title: '現場の業務で実践',
      body: '抽象的な操作説明ではなく、参加者自身の業務資料やデータを使いながら進めます。',
    },
    {
      title: '未経験からでも安心',
      body: 'PCの基本操作ができれば十分です。用語の説明から丁寧に進めるので、初めての方でも置いていきません。',
    },
    {
      title: '助成金の活用を前提に設計',
      body: '研修費用は公的助成金の対象となる設計にしており、実質負担を抑えて導入いただけます。',
    },
  ],
  cta: {
    label: 'AI研修について相談する',
    href: '/contact',
  },
} as const;

export const PAINS = {
  eyebrow: 'PAINS',
  title: 'よくあるお悩み',
  items: [
    {
      title: '触ってはみたが、業務に活きていない',
      body: 'ChatGPTなどを個人的に試した社員はいても、部署として成果につながる使い方ができていない。',
    },
    {
      title: '教えられる人が社内にいない',
      body: '良し悪しの判断や、自社の業務に合わせた使い方を教えられる人材が社内に見当たらない。',
    },
    {
      title: '情報漏洩や誤情報のリスクが不安',
      body: '便利さは分かっていても、何をどこまで入力してよいか判断基準がなく、導入に踏み切れない。',
    },
  ],
  lead: 'こうした壁は、最初に正しい手順とルールを整えることでほとんど解消できます。',
} as const;

export const REASONS = {
  eyebrow: 'REASONS',
  title: '選ばれる理由',
  items: [
    {
      title: '業務データを使った実践型カリキュラム',
      body: '座学中心にせず、参加者自身の業務資料を使った演習に時間を割きます。',
    },
    {
      title: '少人数制で一人ひとりに伴走',
      // 【要確認】少人数制の定員は仮値。実際の上限人数・講師体制（人数・プロフィール要否）を確認。
      body: '1回の研修は最大6名までの少人数制。生成AI活用の実務経験がある講師が、理解度に差が出やすい内容を置き去りにしない体制で伴走します。',
    },
    {
      title: '導入後も伴走するアフターフォロー',
      // 【要確認】アフターフォロー期間（30日）は仮値。
      body: '研修終了後30日間は、実務で困った際にチャットで質問できる期間を設けています。',
    },
  ],
} as const;

export const STEPS = {
  eyebrow: 'FLOW',
  title: '導入までの流れ',
  items: [
    {
      title: '無料相談・診断',
      body: '現状の業務課題とAI活用の余地、助成金の対象可否を無料でヒアリング・診断します。',
    },
    {
      title: 'カリキュラム設計',
      body: '業務内容にあわせて、研修のテーマと演習に使う資料をカスタマイズします。',
    },
    {
      title: '研修実施（学習＋実践）',
      body: '基礎知識のインプットと、業務データを使った実践演習をあわせて実施します。',
    },
    {
      title: '定着支援',
      body: '研修後も一定期間、実務で出てきた疑問にオンラインで対応します。',
    },
  ],
} as const;

export const PRICING = {
  eyebrow: 'PRICING',
  title: '料金',
  lead: '通常価格と、助成金活用後の実質負担額を並べてご確認いただけます。',
  regular: {
    label: '通常価格',
    // 【要確認】価格体系（1社一括か人数課金か）・税別/税込・想定人数を確認のうえ確定。
    figure: '30',
    note: '1社あたり・全4回コースの目安',
  },
  subsidized: {
    label: '助成金活用後の実質負担',
    condition: '助成金の交付を受けた場合',
    // 【要確認】助成金名・助成率・上限額が未確定のため、実質負担額も仮値。
    figure: '10',
    aside: '実質3分の1程度',
    // 【要確認】活用を想定している助成金メニュー名（人材開発支援助成金を仮置き）。
    body: '人材開発支援助成金など、公的助成金の活用を前提に設計しています。',
  },
  diagnosisNote: '対象となるかどうかは、ご相談時に無料で診断いたします。',
  taxNote: '※表示価格はすべて税別です。',
} as const;

export const FAQ = {
  eyebrow: 'FAQ',
  title: 'よくあるご質問',
  items: [
    {
      question: '未経験でも受講できますか？',
      answer:
        'はい。PCの基本操作ができれば問題ありません。用語の説明から始めますので、生成AIを触ったことがない方でも安心してご参加いただけます。',
    },
    {
      question: '何名から申し込めますか？',
      // 【要確認】最少催行人数は仮値。
      answer: '目安として3名からお申し込みいただけます。1名からのご相談も承っておりますので、まずはご連絡ください。',
    },
    {
      question: '助成金は必ずもらえますか？',
      answer:
        '助成金の支給は国の審査によるため、必ず受給できるとお約束するものではありません。対象となる可能性が高いかどうかは、事前に無料で診断いたします。',
    },
    {
      question: '期間はどれくらいですか？',
      // 【要確認】標準の回数・期間は仮値。
      answer: '標準は全4回、1〜2ヶ月程度を想定しています。企業ごとのスケジュールにあわせて調整可能です。',
    },
    {
      question: 'オンラインでも受講できますか？',
      // 【要確認】オンライン/対面の対応範囲は仮値。
      answer: 'はい、オンライン・対面のどちらにも対応しています。詳しくはご相談時にご希望をお伺いします。',
    },
  ],
} as const;

export const CTA = {
  lead: '貴社の業務に合わせた研修内容は、ご相談の中で一緒に設計します。',
  label: 'AI研修について相談する',
  href: '/contact',
} as const;
