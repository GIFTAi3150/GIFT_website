// Every string shown on /plans. Supplied by the manager 2026-08-18; the product
// content is dated 2026年8月10日 and the page prints that date, so if this copy
// is ever revised the date in HERO.note must move with it.
//
// ⚠️ PRICES ARE REAL, unlike the placeholder figures this page used to carry.
// Treat edits here as a commercial change, not a copy tweak.
//
// ⚠️ 税別 assumption: the manager's source copy does not state a tax basis. The
// previous /plans build printed 税別, so the page continues to say 税別 (see
// PRICING.taxNote). Flagged to the user 2026-08-18 — if 税込 is correct, this
// is the single string to change.

export const HERO = {
  /** Product name, set in mono — this is the page's eyebrow. */
  nameEn: 'KNOWLEDGE HARNESS',
  nameJa: 'ナレッジハーネス',
  /** Headline, two lines. Line 2's brackets are drawn in the accent colour by
   *  PlansHero.tsx, so the bracket characters are kept OUT of `bracketed`. */
  headline: {
    line1: '社内の知識を',
    bracketed: '全社の記憶基盤',
    tail: 'に',
  },
  body: '社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。',
  note: '国の「デジタル化・AI導入補助金2026」の対象ツールとなることを前提に設計しています。（2026年8月10日時点の内容）',
} as const;

export const FEATURES = {
  eyebrow: 'FEATURES',
  title: 'できること',
  /** Split on the ：from the source line 「導入後の変化：AIが全社の記憶を持って動く。」
   *  so the label can sit small above the statement instead of running into it. */
  leadLabel: '導入後の変化',
  leadStatement: 'AIが全社の記憶を持って動く。',
  items: [
    {
      kicker: 'はじめやすい',
      title: 'オンボーディング機能',
      body: 'ツール内の案内に沿って初期設定が完了。管理者が従業員登録・組織図・社内規程を設定し、従業員が自分の業務情報を入力するだけで立ち上がります。',
    },
    {
      kicker: '貯まる',
      title: '自動で構造化・整理',
      body: '集めた情報を自動で整理し「全社の記憶基盤」として蓄積。社内の知識が人に依存せず会社に残ります。',
    },
    {
      kicker: '見つかる',
      title: '横断検索＋定型通知',
      body: '部署をまたいだ横断検索と、Chatwork・LINEへの定型通知で「探す時間・聞き回る時間」を削減します。',
    },
    {
      kicker: '標準セット',
      title: 'Claude Code 標準セット',
      body: 'Anthropic社のAI「Claude」（Claude Code含む・Team Standard 5名分）の24ヶ月分利用料をプランに含めて提供。導入した日からAIと社内知識を組み合わせて使えます。',
    },
    {
      kicker: '広がる',
      title: 'Claude Code連携（MCP対応・標準機能）',
      body: '標準セットのClaude Codeから社内の知識へ安全に接続。「聞けば答える」体験を実現し、お客様側で自由に活用・カスタマイズできます。',
    },
    {
      kicker: '守れる',
      title: '企業レベルのセキュリティ',
      body: '権限管理・監査ログ・暗号化（AES-256）・稼働率SLA99.5%。AI利用ガイドラインを権限設定と監査ログで技術的に守らせます。',
    },
  ],
} as const;

export const PRICING = {
  eyebrow: 'PRICING',
  title: '料金',
  lead: '単一プラン。2年間のフルセットが補助金の枠に収まる設計です。',

  monthlyLabel: '月額',
  /** Figure only — the component draws the 万円 unit itself. */
  monthlyFigure: '9',
  termNote: '契約は1年（以降自動更新）',

  /** Line items. `detail` is optional and prints under the item name. */
  rows: [
    { item: '月額利用料（24ヶ月分）', detail: null, amount: '216' },
    { item: '初期導入費', detail: '導入研修・オンボーディング初期設定込み', amount: '38' },
    {
      item: 'Claude Team Standard 5名分（24ヶ月分）',
      detail: 'Claude Code含む・標準セット',
      amount: '45',
    },
  ] as { item: string; detail: string | null; amount: string }[],

  totalLabel: '2年間フルセット合計',
  totalAmount: '299',

  /** The 補助金 panel. The conditional 「補助金の交付を受けた場合」 is printed as the
   *  panel's own label, directly above the figure — it must never be separated
   *  from the number it qualifies. */
  subsidy: {
    condition: '補助金の交付を受けた場合',
    label: 'お客様の実質負担',
    figure: '149.5',
    aside: '実質半額',
    body: 'Claudeの利用料も、クラウド利用料として最大2年分が補助対象にできます。',
  },

  taxNote: '※表示価格はすべて税別です。',
} as const;

export const GLOSSARY = {
  eyebrow: 'GLOSSARY',
  title: 'Claude Team Standard とは',
  body: 'AI開発企業Anthropic（アンソロピック）社の公式法人プランです。世界トップクラスの生成AI「Claude」との対話に加え、文書作成や業務の自動化までこなすAI作業ツール「Claude Code」が使えます。利用メンバーの管理機能などの法人向けセキュリティが付き、入力した内容がAIの学習に使われない設計です。1名につき1席で、本プランには5名分（24ヶ月）が含まれます。',
} as const;

export const SUPPORT = {
  eyebrow: 'SUPPORT',
  title: 'サポート・伴走',
  lead: '導入して終わりではなく、使われて成果が出るまで伴走します。',
  items: [
    { title: '専任担当がつきます', detail: '導入から定着・活用拡大まで同じ担当者が伴走' },
    { title: '有人チャットサポート 無制限', detail: '回数の制限なし。すべて有人対応' },
    { title: '電話サポート', detail: '平日営業時間内' },
    { title: '月次成果レポート', detail: '利用状況と成果を毎月ご報告' },
    {
      title: '補助金の申請〜導入後の効果報告まで支援',
      detail: '効果報告（年1回×3年）も専任担当がサポート',
    },
  ],
} as const;

export const CTA = {
  lead: '導入のご相談・お見積もりはこちらから。',
  label: 'ナレッジハーネスについて相談する',
  /**
   * `inquiry` must match a `value` in `inquiryTypes` (src/app/contact/page.tsx) and
   * `plan` must match the single entry's slug in src/data/plans.ts. /contact
   * validates both against its own local lists, so a stale value here fails soft —
   * the field is simply left blank for the visitor rather than erroring.
   *
   * Was `inquiry=dx` until 2026-08-18, when /contact gained a dedicated
   * ナレッジハーネス option and the enquiry stopped needing to be filed under AIOps.
   */
  href: '/contact?inquiry=plans&plan=knowledge-harness',
} as const;
