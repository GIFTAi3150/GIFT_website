// The service cards shown in the /plans hero reel.
//
// ⚠️ EVERYTHING IN HERE IS PLACEHOLDER COPY (2026-07-31). The names, the prices
// and the spec rows are invented so the reel has something to show — none of it
// has been through 役員確認 (same standing constraint as the /company numbers,
// see project_content_reorientation_aiops). Replace the strings when real
// pricing lands; nothing about the layout depends on their values.
//
// THE CARD COUNT COMES FROM THIS ARRAY. Add or remove an entry and both the
// desktop reel and the mobile carousel follow — `REAL_CARD_COUNT` in
// PlanCardStack.tsx is just `PLANS.length`. Any number is safe, including 1;
// the reel repeats a short list to keep its endless loop (see
// docs/NOLLM-plans-page.md §4).

export type Plan = {
  /** Mono label across the top of the card — the card's actual title. */
  label: string;
  /**
   * Short Japanese service name.
   *
   * KEEP IT TO ~7 CHARACTERS. The reel card is only ~220px wide on desktop and
   * the text column is a little under half of that, so an 8th character wraps
   * to a second line. Two lines still fit, but the card reads tighter.
   */
  name: string;
  /** One line of body copy. Opened panel only, and desktop only — there is no
   *  room for it on a phone-sized panel. */
  summary: string;
  /** Price figure only: no ¥, no unit — the card draws those itself. */
  price: string;
  /** Small caption printed ABOVE the figure. */
  priceCaption: string;
  /** Spec rows in the opened panel. KEEP TO 3 — a 4th row overflows the
   *  mobile panel, which is only ~1.25× as tall as it is wide. */
  specs: { k: string; v: string }[];
  /** Lives in /public. Shown greyscale in the reel, full colour when opened. */
  image: string;
};

// All three are AIOps services (manager, 2026-07-31) — the site is reoriented
// on the AIOps 軸, so nothing here should read as a standalone call-centre or
// consulting offer. They are sequenced the way an engagement actually runs:
// diagnose → automate → measure.
export const PLANS: Plan[] = [
  {
    label: 'SERVICE A',
    name: 'AIOps 診断',
    summary: '業務を工程単位で棚卸しし、AI と自動化に置き換えられる範囲を洗い出します。',
    price: '380,000',
    priceCaption: '初回一括（税別）',
    specs: [
      { k: '期間', v: '4 週間' },
      { k: '対象業務', v: '5 業務まで' },
      { k: '成果物', v: '導入ロードマップ' },
    ],
    image: '/img/services/services-dx-photo.png',
  },
  {
    label: 'SERVICE B',
    name: '業務自動化',
    summary: '診断で描いたフローを実装し、AI エージェントの運用と改善までを引き受けます。',
    price: '248,000',
    priceCaption: '月額（税別）',
    specs: [
      { k: '稼働開始', v: '最短 2 週間' },
      { k: '自動化フロー', v: '10 本まで' },
      { k: '運用監視', v: '平日 9:00 – 18:00' },
    ],
    image: '/img/8.jpg',
  },
  {
    label: 'SERVICE C',
    name: 'データ活用',
    summary: '自動化の稼働ログと業績データを一枚のダッシュボードに束ね、月次で読み解きます。',
    price: '120,000',
    priceCaption: '月額（税別）',
    specs: [
      { k: 'レポート', v: '月次 + 随時' },
      { k: 'データ連携', v: '5 ソースまで' },
      { k: '初期費用', v: '¥0' },
    ],
    image: '/img/services/financial-cons_50.png',
  },
];
