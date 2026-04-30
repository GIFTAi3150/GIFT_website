# 開発担当への引き渡しメモ — リサーチ完了サマリ

> Version 0.1 · 2026-04-30
> リサーチ担当（コード変更なし）→ 開発担当への引き渡し用
> 関連: `docs/Plans.md`, `docs/research/01〜08_*.md`

---

## 0. このメモの目的

リサーチフェーズ（Phase A〜D）が完了し、構造・様式・KPI・素材発注リストが揃った状態で、**実装担当者がリサーチ全体を最短で把握** できるサマリ。

---

## 1. リサーチ全体の構造

```
Phase A — 参考サイト深掘り        → docs/research/04_reference_deep_dive.md
Phase B — マルチブランド構造     → docs/research/05_multibrand_structure.md
Phase C — 顔出しなし表現様式     → docs/research/06_faceless_styles.md
Phase D-1 — KPI 再定義           → docs/research/07_kpi_redefinition.md
Phase D-2 — 素材発注書           → docs/research/08_asset_brief.md
```

加えて:

```
docs/research/01_website_specification.md  — 既存サイトの現状仕様書
docs/research/02_reference_sites.md        — 参考サイトリスト（軽量版）
docs/research/03_strategic_brief.md        — 上司打ち合わせの戦略翻訳
docs/research/request260430.md             — 上司打ち合わせの一次議事
docs/Plans.md                              — リサーチ計画書（フェーズ管理）
```

---

## 2. 重要な確定事項（実装に直接影響）

### 2.1 構造: 中庸型マルチブランド（案 B）

> 詳細: `05_multibrand_structure.md`

- **メタ層（共通）**: グローバルナビ / フッター / タイポ階層 / グリッド / 「対比の1行」コピールール
- **事業層（可変）**: メインカラー / 写真トーン / モーション / 顔出しなし様式
- **NG な実装**: 事業ページごとに完全に別レイアウト（案 C）にする

### 2.2 顔出しなし方針: 主軸 3 様式

> 詳細: `06_faceless_styles.md`

- **線画イラスト**: メンバー紹介
- **環境ショット**: コールセンター / 採用 / 財務
- **データインフォグラフィック**: AI OPS / トップ数値タイポ
- **NG な実装**: 顔写真をどこかに残す / 様式 5 つ以上を混在させる

### 2.3 ストーリーテラー演出: トップ 9 セクション

> 詳細: `05_multibrand_structure.md` Section 4.4

```
1. Hero（対比の1行 + 装飾動画）
2. 数値で語る GIFT
3. 章 1: コールセンター（HISTORY/SOLUTION/CASE）
4. 視覚呼吸
5. 章 2: AI OPS（HISTORY/SOLUTION/CASE）
6. 視覚呼吸
7. 章 3: 財務（HISTORY/SOLUTION/CASE）
8. 多声性（取引先・社員・応募者の声）
9. クロージング + Contact CTA
```

### 2.4 事業ページのトーン仮置き

> 詳細: `05_multibrand_structure.md` Section 4.3

| 事業 | メインカラー | 写真トーン | モーション |
| --- | --- | --- | --- |
| トップ | 既存緑 + ダークグレー | 環境・抽象 + 数値 | 中（ストーリー演出） |
| コールセンター | 暖色（要決定） | 現場・オフィス | 控えめ |
| AI OPS | テック青（指示通り） + ブラック | データ可視化 / 抽象 | 高（テック感） |
| 財務 | ダークグリーン or チャコール | 静謐・編集的 | 控えめ |
| メンバー | 既存緑 | 線画イラスト | 中 |

---

## 3. 既存実装に対する影響（コード変更しない宣言を踏まえて）

> リサーチ担当はコードを一切変更していない。以下は **実装担当が着手する際の参考メモ**。

### 3.1 既存資産で活かせるもの

| 既存ファイル | 活用方針 |
| --- | --- |
| `tailwind.config.ts` | メタ層トークンとして再活用、事業層トークンを追加で定義 |
| `src/components/sections/` | 章立てコンポーネント（`Hero`, `WhoWeAre`, `CaseStudy` 等）の構造は再利用可 |
| `src/components/ui/Reveal.tsx` | スクロール演出として活用可 |
| `src/components/ui/FadeUpText.tsx` / `ScatterText.tsx` / `SliceText.tsx` | テキスト演出として活用可 |
| `src/components/ui/CountUp.tsx` | 数値タイポ表現に活用 |
| `src/components/ui/GiftLogo3D_PremiumBadge.tsx` | 3D ロゴはトップ Hero でも活用可 |
| `src/lib/notion.ts` | News / Members / Positions の Notion 連携は維持 |
| `next.config.js` の旧 URL リダイレクト | SEO 維持のため絶対に削除しない |
| `src/app/sitemap.ts` / `robots.ts` | SEO 維持のため再利用 |
| `src/app/manifest.ts` | PWA 対応（要更新） |

### 3.2 既存実装で見直したいもの

| 既存ファイル | 見直しポイント |
| --- | --- |
| `tailwind.config.ts` の `gift.*` カラー | WhatsApp 由来の green 単一系から、事業層トークン体系へ移行 |
| `DESIGN.md` | 古いパレット定義（Forest & Brass）が残っている。本リサーチ結果で上書き |
| `src/components/sections/ServicesCards.tsx` | 案 B の章立て構造に合わせて再設計が必要 |
| `src/app/services/[業種]/` 配下 | 各事業ページで事業層スタイルが当たるよう設計 |
| `src/app/layout.tsx` | アナリティクス直書きを環境別に切り替え可能な構造へ |
| `CLAUDE.md` / `PLANNING.md`（空ファイル） | 必要に応じて削除 or 内容追加 |

### 3.3 新規追加が必要なもの

| 内容 | 配置案 |
| --- | --- |
| 事業層スタイルトークン | `tailwind.config.ts` に `callcenter`, `aiops`, `finance` 拡張 |
| 章立て共通コンポーネント | `src/components/sections/Chapter.tsx`（HISTORY/SOLUTION/CASE 構造） |
| 多声性セクション | `src/components/sections/Voices.tsx` |
| 数値タイポセクション | `src/components/sections/NumbersSpeak.tsx` |
| Hero 動画コンポーネント | `src/components/ui/HeroVideo.tsx`（autoplay/loop/muted） |
| メンバー線画イラスト用テンプレ | `src/components/ui/MemberPortrait.tsx` |
| AI OPS 用 Lottie インフォグラフィック | `src/components/sections/InfographicLottie.tsx` |
| デザイントークン SSOT | `docs/design-system/01_meta_layer.md` 等 |

---

## 4. 計測実装（KPI ダッシュボード）

> 詳細: `07_kpi_redefinition.md` Section 4

### 4.1 GA4 カスタムイベント追加

実装担当が GA4 に以下のイベントを追加:

| イベント名 | 発火タイミング |
| --- | --- |
| `hero_video_play` | Hero 動画再生開始 |
| `hero_video_complete` | Hero 動画完了 |
| `chapter_scroll_75` | 各章の 75% スクロール |
| `business_page_view` | 事業ページ表示 |
| `member_to_business_click` | メンバー→事業ページ遷移 |
| `cta_click_inquiry` | 問合せ CTA |
| `cta_click_recruit` | 採用 CTA |

### 4.2 ベースライン測定（実装着手前）

実装着手 **前** に以下を測定 → どこかに記録:

- 過去 3 ヶ月の問合せ件数
- 過去 3 ヶ月の採用エントリー数
- 流入元別の比率（Direct / Organic / Social / Referral）
- ページ別の滞在時間
- 直帰率

---

## 5. 素材発注の状況

> 詳細: `08_asset_brief.md`

### 5.1 発注予定リスト

| カテゴリ | 件数 | 想定予算 | 状態 |
| --- | --- | --- | --- |
| A. 写真撮影 | 30〜50 カット | 45〜75 万円 | 未発注 |
| B. 動画制作 | Hero + 採用後ろ姿 + AI OPS | 130〜250 万円 | 未発注 |
| C. イラスト | メンバー 13 点 + 装飾 5〜10 点 | 35〜65 万円 | 未発注 |
| D. データ可視化 | AI OPS infographic + 数値タイポ | 33〜57 万円 | 未発注 |
| E. コピーライティング | タグライン + 本文 | 60〜110 万円 | 未発注 |
| 合計 | — | **303〜557 万円** | — |

### 5.2 素材納品後の配置（案）

```
public/
├─ assets/
│  ├─ photo/
│  │  ├─ callcenter/
│  │  ├─ aiops/
│  │  ├─ finance/
│  │  └─ corporate/
│  ├─ video/
│  │  ├─ hero/
│  │  ├─ recruit-callcenter/
│  │  └─ aiops-data/
│  ├─ illustration/
│  │  ├─ members/
│  │  └─ decorative/
│  └─ data-viz/
│     ├─ aiops-infographic.json   (Lottie)
│     └─ numbers-typo/
```

---

## 6. 実装着手順序（推奨）

### 6.1 ベースライン整備フェーズ（リサーチ完了後の最初）

1. デザイントークン SSOT 整備（`docs/design-system/`）
2. `tailwind.config.ts` のメタ層 / 事業層分離リファクタ
3. 章立て共通コンポーネント（`Chapter.tsx`）の実装
4. ベースライン KPI 測定

### 6.2 素材発注フェーズ（並行）

1. 発注先候補リサーチ
2. 見積もり取得 → 発注
3. 納品（10 週間程度）

### 6.3 実装フェーズ（素材納品後）

1. トップページ刷新（9 セクション構造）
2. 各事業ページ実装（コールセンター → AI OPS → 財務）
3. メンバーページ刷新（線画イラスト適用）
4. 採用ページ刷新（コールセンター採用に動画 + 音声）

### 6.4 リリースフェーズ

1. ステージング環境で全 KPI イベント動作確認
2. PageSpeed Insights / Lighthouse / WebVitals 検証
3. 役員レビュー
4. 本番リリース
5. 月次 KPI レビュー開始

---

## 7. 役員レビュー履歴（この時点での合意事項）

リサーチ完了時点で **役員に合意取得が必要な論点リスト**:

| # | 論点 | 状態 | 関連ドキュメント |
| --- | --- | --- | --- |
| 1 | マルチブランド構造の案 B 採用 | 未取得 | `05_multibrand_structure.md` |
| 2 | 顔出しなし基本方針の採用 | 未取得 | `06_faceless_styles.md` |
| 3 | コールセンター採用ページの例外設計（選択肢 C 推奨） | 未取得 | `06_faceless_styles.md` Section 5 |
| 4 | 各事業のトーン（特にコールセンター暖色化） | 未取得 | `05_multibrand_structure.md` Section 4.3 |
| 5 | KPI 5 軸の採用（既存 KPI が一時的に下がることの許容） | 未取得 | `07_kpi_redefinition.md` |
| 6 | 素材発注予算（300〜600 万円） | 未取得 | `08_asset_brief.md` |
| 7 | リブランド実装の発注方法（社内開発 / 外注） | 未確認 | — |

---

## 8. 注意事項（実装担当へ）

### 8.1 守ってほしいこと

1. **メタ層 / 事業層の分離原則** を壊さない
2. **顔写真を残さない**（旧サイトからのコピペで顔写真が残らないよう注意）
3. **3 様式以外の表現を勝手に追加しない**（線画 / 環境 / データ）
4. **301 リダイレクト**（`next.config.js`）を必ず維持
5. **アクセシビリティ**: 動画には `prefers-reduced-motion` 対応必須
6. **パフォーマンス**: LCP 2.5 秒以内 / CLS 0.1 以下を目標

### 8.2 判断に迷ったら

- リサーチドキュメント（特に `05_multibrand_structure.md` / `06_faceless_styles.md`）を確認
- それでも迷ったらリサーチ担当（このメモの作成者）に確認
- 既存ブランドルールと矛盾するように見えたら、本リサーチが上書き済みなので **本リサーチに従う**

---

## 9. 次のアクション

### 9.1 リサーチ担当
- 役員レビュー手配
- 役員からのフィードバックを各リサーチドキュメントに反映
- 素材発注先候補リサーチ（必要なら `10_vendor_candidates.md` 作成）

### 9.2 実装担当
- 本ドキュメント + 各リサーチドキュメントを通読
- 実装スケジュール案作成
- 素材納品時期と実装スケジュールを擦り合わせ

### 9.3 役員
- 7 つの論点（Section 7）にコメント
- 予算合意

---

## 10. リサーチ完了

Phase A〜D の全成果物が揃いました。実装着手の準備が整っています。

```
✓ docs/research/01_website_specification.md
✓ docs/research/02_reference_sites.md
✓ docs/research/03_strategic_brief.md
✓ docs/research/04_reference_deep_dive.md
✓ docs/research/05_multibrand_structure.md
✓ docs/research/06_faceless_styles.md
✓ docs/research/07_kpi_redefinition.md
✓ docs/research/08_asset_brief.md
✓ docs/research/09_handoff_to_dev.md
✓ docs/Plans.md
```

実装担当のキックオフを待ちます。
