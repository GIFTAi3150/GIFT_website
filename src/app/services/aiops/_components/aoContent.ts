// /services/aiops — every string on the page. Copy is the approved text from
// the previous build (DxV3Page constants), unchanged; only the decorative
// numbering and mono meta blocks were dropped with the redesign.

export const HERO = {
  kicker: 'AIOps事業',
  titleLines: ['AI', 'Ops.'],
  jp: '研修だけでも、実装だけでも、AIは会社に根づかない。',
  cta: { label: '個別AI活用診断を相談する。', href: '/contact' },
  cue: 'Scroll',
} as const;

/** The statement — four stanzas, authored line breaks kept. */
export const STATEMENT: ReadonlyArray<{
  lines: ReadonlyArray<{ text: string; accent?: string }>;
}> = [
  { lines: [{ text: 'なぜ、AIは優秀なのに' }, { text: '仕事は変わらないのか。' }] },
  {
    lines: [
      { text: 'AIがどれだけ優秀でも、' },
      { text: 'あなたの会社のことを知らなければ、' },
      { text: '入社初日の新人と同じです。' },
    ],
  },
  {
    lines: [
      { text: '商品やサービスのこと。' },
      { text: 'お客様とのやり取り。' },
      { text: '社長や担当者の判断基準。' },
      { text: '社内のルールや、仕事の進め方。' },
    ],
  },
  {
    lines: [
      { text: 'それらをAIが使える形に整えて', accent: 'はじめて、' },
      { text: 'AIは会社の中で', accent: '動き始めます。' },
    ],
  },
];

export const CAPS = {
  label: 'What we do',
  title: '私たちがやること。',
  lead: 'AIを会社に根づかせるために。学習・実装・定着まで、6つの視点で伴走します。',
  items: [
    {
      id: 'inventory',
      title: '業務の棚卸し',
      body: 'どの業務にAIを使うべきか、会社の仕事を一緒に整理する。何から変えるか、最初の優先順位を明確にします。',
      tags: ['業務整理', '優先度設計', '現状把握'],
      lottie: '/lottie/robot-animation.json',
    },
    {
      id: 'training',
      title: 'AI研修',
      body: '経営者と現場が、AIで何ができるのかを同じ目線で理解する。知識の温度差をなくし、推進の土台をつくります。',
      tags: ['学習', '経営×現場', 'AI理解'],
      lottie: '/lottie/datab-animation.json',
    },
    {
      id: 'first-win',
      title: '最初の成果づくり',
      body: 'まずひとつ、現場が「使える」と感じる業務をAIで変える。小さな成功体験が、社内のAI活用を加速させます。',
      tags: ['最初の一歩', '業務改善', '成果実感'],
      lottie: '/lottie/animation.json',
    },
    {
      id: 'structure',
      title: '会社の情報整理',
      body: '商品、顧客、判断基準、ルール、仕事の流れをAIが使える形に整える。会社の知識をAIが活かせる状態にします。',
      tags: ['構造化', 'ナレッジ整備', 'RAG基盤'],
      lottie: '/lottie/saas-animation.json',
    },
    {
      id: 'agents',
      title: 'AIエージェント構築',
      body: '会社の仕事に合わせて、業務を支えるAIエージェントをつくる。汎用AIではなく、自社専用の働き手を実装します。',
      tags: ['エージェント', 'LLM', 'カスタム実装'],
      lottie: '/lottie/agent-build-animation.json',
    },
    {
      id: 'rooting',
      title: '運用・定着支援',
      body: '使って終わりではなく、自社で育てられる状態まで伴走する。納品後も改善を続け、AIが会社に根づく環境をつくります。',
      tags: ['定着', '伴走支援', '継続改善'],
      lottie: '/lottie/support-grow-animation.json',
    },
  ],
} as const;

export const PAINS = {
  label: 'Signs',
  titleEn: 'Signs AI hasn’t rooted.',
  titleJa: 'こんな状況、ありませんか？',
  items: [
    'AIを入れたのに、会社の仕事は変わっていない。',
    'AIを使っている人と、使っていない人に差がある。',
    '必要な情報が、人やフォルダに散らばっている。',
    '判断が、社長や一部の担当者に集まっている。',
  ],
  answerEn: 'All resolved by GIFT.',
  answerJa: 'その課題に、GIFTが向き合います。',
} as const;

export const STEPS = {
  label: 'How we work',
  titleJa: 'AIを会社に根づかせる、6つのステップ。',
  items: [
    { n: '01', title: '学習', body: 'AIで何ができるのかを、経営者と現場が同じ目線で理解する。' },
    { n: '02', title: '業務整理', body: 'AIを活かせる業務と、最初に変える業務を見つける。' },
    { n: '03', title: '最初の成果', body: 'まずひとつ、現場が「使える」と感じる業務をAIで変える。' },
    { n: '04', title: '構造化', body: '商品、顧客、判断基準、ルール、仕事の流れを、AIが使える形に整える。' },
    { n: '05', title: '実装', body: '会社の仕事に合わせて、AIエージェントを構築する。' },
    { n: '06', title: '定着', body: '納品して終わりではなく、自社で育てられる状態へ進める。' },
  ],
} as const;

export const AGENTS = {
  label: 'Agents in action',
  titleJa: '会社の文脈があるから、AIエージェントの役割はここまで広がる。',
  items: [
    { word: '建設', industry: '建設・工事業', title: '現場エージェント', role: '現場写真や作業報告から、日報・報告書・共有事項をまとめる。' },
    { word: '士業', industry: '士業・コンサル業', title: '提案エージェント', role: '相談内容や過去提案から、論点整理・提案骨子・次回打ち合わせ準備を進める。' },
    { word: '小売', industry: '小売・EC', title: '問い合わせエージェント', role: '商品情報や対応履歴から、回答案・FAQ・販促文をつくる。' },
    { word: '製造', industry: '製造業', title: 'トラブル対応エージェント', role: '不具合履歴や作業手順から、原因候補・確認手順・対応記録を整理する。' },
    { word: '不動産', industry: '不動産業', title: '物件提案エージェント', role: '顧客希望や物件情報から、候補物件・提案文・確認事項をまとめる。' },
  ],
  conditionsHead: 'GIFTが考える、AIが根づく3つの条件',
  conditions: [
    {
      title: ['会社の情報が整うほど、', 'AIは深く機能する。'],
      body: '商品・顧客・判断基準をAIが使える形に整えることで、汎用AIが自社専用の知識を持った存在に変わります。',
    },
    {
      title: ['現場の言葉で動く、', '自社専用のAI。'],
      body: '業種・業務フローに合わせて設計するから、エージェントは現場で実際に役立ちます。汎用ツールでは届かない精度。',
    },
    {
      title: ['使いながら育てる、', '伴走型の実装。'],
      body: '納品して終わりではなく、自社チームが自律的にAIを更新・改善できる状態まで伴走します。',
    },
  ],
} as const;

export const THINKING = {
  headline: ['AIを動かすのは、', '会社の中身。'],
  labelJa: 'GIFTの考え方',
  labelEn: 'Our Thinking',
  p1: {
    lead: '商品、顧客、判断基準、ルール、仕事の流れ。',
    strong: 'それらが整ってはじめて、AIはただのチャットではなく、現場で成果を出す存在になります。',
  },
  p2: { lead: 'GIFTは、AIが働くための', strong: '会社の土台を整えます', tail: '。' },
} as const;

export const CTA = {
  label: 'Get In Touch',
  labelJa: 'AI活用診断',
  titleEn: ['Let’s', 'root it.'],
  ja: 'AIを会社に根づかせる、最初の一歩を一緒に踏み出しましょう。',
  button: { label: '個別AI活用診断を相談する。', href: '/contact' },
} as const;
