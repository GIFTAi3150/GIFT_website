# GIFT Website 仕様書

> Version 1.0 · 2026-04-30
> ブランチ: `research/quality-update`
> 用途: クオリティアップデート検討のためのベースライン把握ドキュメント
> 作成: リサーチ担当（ユーザー）／本ドキュメントは現状の事実確認用であり、変更提案は別ドキュメントに分離する

---

## 0. ドキュメントの位置付け

このドキュメントは、`GIFTAi3150/GIFT_website` リポジトリ（branch: `dev` 起点）の **現状（as-is）** を技術仕様としてまとめたもの。改善提案・リファクタ案・デザイン更新案などの **to-be** は本書に書かず、別途 `docs/research/` 配下に分けて起こす。

参考順序:

1. 本書（01）— 現状把握
2. 02 以降 — 観点別リサーチ（UI/コード/コンテンツ等を別建てで）

---

## 1. プロジェクト概要

| 項目 | 値 |
| --- | --- |
| サイト名 | 株式会社GIFT 公式サイト |
| 英名 | GIFT Inc. |
| タグライン | Gift an opportunity |
| 本番URL | `https://gift-inc.org` |
| 本社所在地 | 〒060-0061 北海道札幌市中央区南一条西7丁目21番地1 サントービル3階 |
| 設立 | 2018年8月 |
| 代表者 | 川瀬 正悟 |
| インボイス番号 | T2430001077083 |
| 問い合わせ送信先 | `it@gift-original.jp`（送信元: `noreply@gift-original.jp`） |
| 主要事業 | コールセンター事業 / DXコンサル事業 / 財務コンサル事業 |
| リポジトリ | `GIFTAi3150/GIFT_website` |
| デフォルトブランチ | `dev`（`main` も並行して存在） |

> 出典: `src/data/company.json`, `src/app/layout.tsx`, `src/app/api/contact/route.ts`

---

## 2. 技術スタック

### 2.1 ランタイム / フレームワーク

| 領域 | 採用 | バージョン | 備考 |
| --- | --- | --- | --- |
| フレームワーク | Next.js | `14.2.5` | App Router 構成 |
| 言語 | TypeScript | `5.5.3` | strict 構成（`tsconfig.json` で `strict: true`） |
| UI ライブラリ | React | `18.3.1` | React DOM `18.3.1` |
| スタイリング | Tailwind CSS | `3.4.6` | `prettier-plugin-tailwindcss` でクラス順整形 |
| アイコン | `lucide-react` | `^0.468.0` | |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | `0.183.x` / `8.18.0` / `9.122.0` | ヒーローのGIFTロゴ3D表示で使用 |
| メール送信 | Resend (`resend`) | `^6.12.0` | お問い合わせフォームの通知送信 |
| ヘッドレスCMS | Notion (`@notionhq/client`) | `^2.3.0` | News / Members / Positions の3DB |
| 画像最適化 | `sharp` | `^0.34.5` (devDep) | `scripts/compress-images.mjs` 用 |
| Lint / Format | `next lint` / `prettier` | — | `prettier-plugin-tailwindcss` 同梱 |

> 出典: `package.json`, `tsconfig.json`, `next.config.js`

### 2.2 環境変数

サーバーサイドで参照される環境変数（ビルド時にチェックされない＝Notion 由来は実行時に optional フォールバックあり）:

| Key | 用途 |
| --- | --- |
| `NOTION_API_KEY` | Notion API キー（共通） |
| `NOTION_DATABASE_ID` | News（記事）DB |
| `NOTION_MEMBERS_DB_ID` | メンバー DB |
| `NOTION_POSITIONS_DB_ID` | 募集ポジション DB |
| `RESEND_API_KEY` | お問い合わせメール送信（Resend） |

> 出典: `src/lib/notion.ts`, `src/app/api/contact/route.ts`, `scripts/*`

### 2.3 デプロイ / インフラ

- `next` ベースで `next dev / next build / next start` を `package.json` に定義。
- `.gitignore` に `.vercel` が含まれており Vercel デプロイ前提と推測（リポジトリ内に明示の Vercel 設定ファイルなし）。
- GitHub Actions: `.github/workflows/weekly-news.yml` が **毎週月曜 08:30 JST** に Notion 上の週次ニュース下書きを自動生成（`scripts/weekly-news.mjs`）。

---

## 3. ルーティング（App Router）

> ルートは `src/app/` 配下。すべて App Router。

### 3.1 ページルート

| パス | ファイル | 用途 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | トップページ（Hero + 各セクション統合） |
| `/company` | `src/app/company/` | 会社情報 |
| `/services/callcenter` | `src/app/services/callcenter/` | コールセンター事業 |
| `/services/dx-consulting` | `src/app/services/dx-consulting/` | DXコンサル事業 |
| `/services/finance-consulting` | `src/app/services/finance-consulting/` | 財務コンサル事業 |
| `/achievements` | `src/app/achievements/` | 実績 |
| `/recruit` | `src/app/recruit/` | 採用情報（Notion DB 連携） |
| `/member` | `src/app/member/` | メンバー一覧 |
| `/member/[id]` | `src/app/member/` 配下動的 | メンバー個別ページ |
| `/news` | `src/app/news/page.tsx` | ニュース一覧（Notion） |
| `/news/[slug]` | `src/app/news/[slug]/` | ニュース個別記事 |
| `/contact` | `src/app/contact/` | お問い合わせフォーム |
| `/privacy` | `src/app/privacy/` | プライバシーポリシー |
| `/style-preview` | `src/app/style-preview/` | デザイン確認用（公開可否は要確認） |

### 3.2 API ルート

| パス | ファイル | 用途 |
| --- | --- | --- |
| `POST /api/contact` | `src/app/api/contact/route.ts` | お問い合わせフォームを Resend で送信 |

### 3.3 リダイレクト（旧 WordPress URL → 新サイト）

`next.config.js` の `redirects()` で 301 リダイレクトを定義:

| From | To |
| --- | --- |
| `/about`, `/about/` | `/company` |
| `/lstep`, `/lstep/` | `/services/dx-consulting` |
| `/lsteprpa`, `/lsteprpa/` | `/services/dx-consulting` |
| `/privacypolicy`, `/privacypolicy/` | `/privacy` |

### 3.4 SEO / メタデータ

| 項目 | 実装 |
| --- | --- |
| `metadataBase` | `https://gift-inc.org` |
| デフォルトタイトル | `株式会社GIFT \| Gift an opportunity` |
| タイトルテンプレート | `%s \| 株式会社GIFT` |
| OGP | `type: website / locale: ja_JP` |
| Twitter Card | `summary_large_image` |
| `robots` | `index: true, follow: true` |
| `manifest.ts` | あり（`src/app/manifest.ts`） |
| `sitemap.ts` | あり（静的 11 ルート + Members + News 動的） |
| `robots.ts` | あり（`src/app/robots.ts`） |
| Google Search Console 検証 | `<meta name="google-site-verification">` を `layout.tsx` に直書き |

### 3.5 アナリティクス / トラッキング

`src/app/layout.tsx` の `<head>` 内に直接スクリプト埋め込み:

- Google Analytics 4: `G-RBBNELXPJ8`
- Microsoft Clarity: `wcy0ylgpif`

---

## 4. ディレクトリ構成

```
.
├─ .github/workflows/         GitHub Actions（weekly-news）
├─ public/                    画像・フォント・3D アセット
│  ├─ fonts/                  Cormorant-Italic, Poppins-Bold（self-hosted）
│  ├─ img/                    トップ用画像、サービス画像、ケース画像、プレースホルダ
│  ├─ recruit/                採用ページ用画像
│  ├─ services/               サービス別画像
│  ├─ textures/               3D 用テクスチャ
│  ├─ GIFT_logo.svg
│  └─ gift-logo.glb           Three.js で読み込まれる 3D ロゴ
├─ scripts/                   Node スクリプト群（mjs）
│  ├─ compress-images.mjs     sharp による画像圧縮
│  ├─ inspect-members-db.mjs  Notion メンバー DB 検査
│  ├─ seed-members.mjs        メンバー DB シード
│  ├─ seed-positions.mjs      ポジション DB シード
│  └─ weekly-news.mjs         週次ニュース下書き作成
├─ src/
│  ├─ app/                    App Router（ページ + API）
│  ├─ components/
│  │  ├─ layout/              Header / Footer
│  │  ├─ sections/            ページ内セクション群（Hero, WhoWeAre, CaseStudy 等）
│  │  └─ ui/                  汎用 UI / 演出系（Reveal, FadeUpText, ScatterText 等）
│  ├─ data/                   静的 JSON（フォールバック含む）
│  ├─ lib/
│  │  ├─ helpers.ts
│  │  └─ notion.ts            Notion 連携（記事/メンバー/ポジション）
│  ├─ styles/globals.css
│  └─ global.d.ts
├─ blender_gift_logo.py       Blender 用ロゴ生成スクリプト
├─ DESIGN.md                  デザイントークン定義書（Tailwind と整合）
├─ gift-style.md              旧サイト由来のスタイル参考メモ
├─ scratchpad/                作業メモ（草稿類）
├─ next.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ postcss.config.js
├─ package.json
├─ .prettierrc.json / .prettierignore
└─ .gitignore
```

> 注意: ルート直下の `CLAUDE.md` および `PLANNING.md` は現時点で空ファイル。

---

## 5. コンポーネント構成

### 5.1 レイアウト

| コンポーネント | 用途 |
| --- | --- |
| `layout/Header.tsx` | グローバルヘッダー（ナビ） |
| `layout/Footer.tsx` | グローバルフッター |
| `app/layout.tsx` | RootLayout。`<head>` 内に GA / Clarity / GSC 検証メタ。SSR で `#page-cover` を最初の HTML に埋め、3D ロゴ準備 (`gift:logo-ready` イベント) と `window.load` の両方が揃ったらフェードアウト。4秒の安全フォールバックあり |

### 5.2 セクション（トップページ構成順）

`src/app/page.tsx` の上から順に:

1. `Hero`
2. `WhoWeAre`（`Reveal` でラップ）
3. `PhotoCarousel`
4. `CaseStudy`
5. `ServicesCards`
6. `ProcessFlow`
7. `Clients`
8. `SocialLinks`
9. `Column`（articles を Notion から渡す。フェッチ失敗時は空状態）

その他のセクションコンポーネント（他ページで使用）:
- `CompanySnapshot`, `CtaBand`, `HistoryCarousel`, `ServicesGrid`

### 5.3 UI / 演出

| コンポーネント | 用途 |
| --- | --- |
| `Reveal` | スクロール連動の表示アニメーション |
| `FadeUpText`, `ScatterText`, `SliceText` | テキスト演出 |
| `CountUp` | 数値カウントアップ |
| `CaseCarousel` | ケーススタディカルーセル |
| `PageCover` | ページ初期カバー（`layout.tsx` 側でも SSR 直書きあり） |
| `HeroLogoDelayed`, `GiftLogo3D_PremiumBadge` | 3D ロゴ表示（Three.js / R3F） |
| `PixelRobot` | 装飾用ピクセルアート |
| `ServiceIcons` | サービスアイコン群 |

---

## 6. データ層

### 6.1 静的 JSON（`src/data/`）

| ファイル | 用途 |
| --- | --- |
| `company.json` | 会社情報（社名・代表・住所・電話・タグライン等） |
| `services.json` | 事業3種の説明・画像・リンク |
| `achievements.json` | 実績データ |
| `members.json` | メンバー（Notion 取得失敗時のフォールバック含む） |
| `positions.json` | 募集ポジション |
| `news.json` | ニュース（フォールバック用途） |

### 6.2 Notion 連携（`src/lib/notion.ts`）

| 関数 | DB | 用途 |
| --- | --- | --- |
| `getPublishedArticles()` | `NOTION_DATABASE_ID` | News 一覧（`Published: true`、`Date` 降順） |
| `getArticleBySlug(slug)` | 同上 | News 個別記事 |
| `getArticleSlugs()` | 同上 | sitemap 用 slug 一覧 |
| `getPublishedPositions()` | `NOTION_POSITIONS_DB_ID` | 採用ポジション一覧 |
| `getPublishedMembers()` | `NOTION_MEMBERS_DB_ID` | メンバー一覧（`Order` 昇順） |
| `getMemberById(id)` | 同上 | メンバー個別 |

備考:
- News の本文は Notion ブロックを Markdown 風に簡易変換（`paragraph`/`heading_1..3`/`bulleted_list_item`/`numbered_list_item` のみ対応）。
- メンバーの `id`（URL slug）は `NameEn` の最終語を lower-case 化。失敗時は Notion ページ ID をフォールバック。
- メンバー画像は Files & Media → URL → プレースホルダ（`/img/placeholder-gemini2.png`）の優先順。

### 6.3 トップページの Notion 取得方針

`src/app/page.tsx` は `export const dynamic = 'force-dynamic'` を指定し、毎リクエストで `getPublishedArticles()` を実行。失敗時は空配列で続行（無停止）。

---

## 7. デザインシステム

### 7.1 カラートークン（`tailwind.config.ts`）

WhatsApp 由来の green 2 色（`#25D366` / `#128C7E`）を中心とした緑＋モノクロ構成。

主要キー（抜粋）:

| 用途 | Tailwind key | Hex |
| --- | --- | --- |
| Primary CTA | `gift.green` / `line.green` | `#25D366` |
| Hover | `gift.green-mid` / `line.green-hover` | `#1EBE5B` |
| 深い Teal | `gift.green-teal` / `line.green-deep` | `#128C7E` |
| 最深 Teal（フッター等） | `gift.green-dark` / `line.green-deeper` | `#075E54` |
| Ink（本文・見出し） | `gift.ink` / `line.ink` | `#111B21` |
| 背景（薄） | `gift.bg`, `gift.bg-alt`, `line.bg-alt` | `#EBEEF3` / `#F7F9FC` / `#F0F4F9` |
| Border | `gift.border`, `line.grey-mute` | `#CDD0D5` |
| Accent | `gift.accent` | `#128C7E`（深 teal） |

> 注意: `DESIGN.md` の Version 1.0 は **Forest & Brass** パレット（`#357b49` + `#b08944`）を提示しているが、実装の `tailwind.config.ts` は **WhatsApp inspired greens** に切り替わっている。**ドキュメントとコードに乖離あり**。クオリティアップデート検討の論点になりうる。

### 7.2 タイポグラフィ

| 変数 | フォント | 役割 |
| --- | --- | --- |
| `--font-noto-jp` | Noto Sans JP（`src/app/fonts.ts` 経由と推定） | 本文 sans |
| `--font-poppins` | Poppins | display |
| `--font-mincho` | （未確認） | 明朝 |

`fontSize` トークン:

| key | size / line |
| --- | --- |
| `small` | 16px / 1.5 |
| `normal` | 18px / 1.75 |
| `medium` | 24px / 1.5 |
| `large` | 40px / 1.25 |
| `xlarge` | 46px / 1.15 |

> 注意: `DESIGN.md` は Zen Old Mincho + Zen Kaku Gothic New を推奨していたが、実装は Noto Sans JP + Poppins。**こちらもドキュメント-実装の乖離**。

### 7.3 その他トークン

- `borderRadius`: `pill: 9999px`, `cta: 8px`
- `boxShadow`: `natural`, `deep`, `sharp`, `outlined`, `crisp`, `accent-hover` の 6 種
- `spacing`: `s-20`〜`s-80` のセマンティックスケール
- `maxWidth.container`: `72rem`
- `keyframes/animation`: `marquee`（120s linear infinite）

---

## 8. 運用 / 自動化

### 8.1 GitHub Actions

- `.github/workflows/weekly-news.yml`
  - 毎週月曜 08:30 JST（cron `30 23 * * 0` UTC）
  - `workflow_dispatch` 手動実行も可
  - `scripts/weekly-news.mjs` を Node 20 で実行し、Notion News DB に下書きを生成

### 8.2 npm scripts

| script | コマンド |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |
| `news:draft` | `node scripts/weekly-news.mjs` |
| `seed:members` | `node scripts/seed-members.mjs` |
| `seed:positions` | `node scripts/seed-positions.mjs` |

---

## 9. アセット

### 9.1 画像

- `public/img/1.jpg`〜`8.jpg` — トップ用フォトカルーセル想定
- `public/img/dx-case-01..03.jpg` — DXケース
- `public/img/l-step.jpg`, `official-partner.jpg`, `whoUsedIt.jpg`
- `public/img/placeholder-gemini.png`, `placeholder-gemini2.png` — プレースホルダ
- `public/img/services/` — サービス別画像（`call-center.webp` 等を `services.json` から参照）
- `public/recruit/` — 採用ページ画像

### 9.2 フォント（self-hosted）

- `public/fonts/Cormorant-Italic.ttf`
- `public/fonts/Poppins-Bold.ttf`

> Google Fonts (`next/font/google`) と self-hosted フォントの両方が混在している可能性あり。`src/app/fonts.ts` の確認と整合性チェックが必要（要追加リサーチ）。

### 9.3 3D アセット

- `public/gift-logo.glb` — Three.js / `@react-three/drei` の GLTF として読み込み
- `public/textures/` — 3D テクスチャ
- `blender_gift_logo.py` — Blender でのロゴ生成スクリプト（リポジトリ内に同梱）

---

## 10. 既知の論点（事実ベース）

> ここでは「変更すべき」とは書かず、**乖離・空ファイル・要確認事項** のみを列挙する。改善案は別ドキュメントへ。

1. **`DESIGN.md` と `tailwind.config.ts` の乖離**
   - DESIGN.md は Forest & Brass（`#357b49` + `#b08944`）+ Zen 系明朝/ゴシック
   - 実装は WhatsApp green 2 色 + Noto Sans JP / Poppins
   - どちらが正なのか（公式 SSOT）が未定義
2. **空ファイル**
   - ルートの `CLAUDE.md` と `PLANNING.md` が 0 byte
3. **`/style-preview`**
   - 公開ルートとして残っているが、本番公開向けかデザイン確認用かが要確認
4. **アナリティクスの直書き**
   - `layout.tsx` 内に GA / Clarity / GSC 検証コードが直接埋め込まれている（環境別管理なし）
5. **News 本文の対応ブロックが限定的**
   - Notion の `image`, `quote`, `code`, `toggle`, `callout`, `divider`, `table` 等は無視される
6. **Members `Image` のフォールバック**
   - 全員 male プレースホルダ前提のコメント（`notion.ts` 内）。女性メンバー追加時の運用ルール未定義
7. **Notion 取得失敗時の挙動**
   - `page.tsx` は空状態で継続、`sitemap.ts` は `members.json` をフォールバック、News はフォールバックなしで空
8. **`scratchpad/` の扱い**
   - 設計の研究メモが残っており、リポジトリに含まれている（公開リポジトリの場合は要確認）

---

## 11. 参考ファイル一覧（本書作成にあたっての一次ソース）

- `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/sitemap.ts`, `src/app/api/contact/route.ts`
- `src/lib/notion.ts`
- `src/data/company.json`, `src/data/services.json`
- `.github/workflows/weekly-news.yml`
- `DESIGN.md`, `gift-style.md`
- `public/` ディレクトリ構造

---

## 12. 次のリサーチ候補

- `02_design_audit.md` — DESIGN.md と実装の乖離を整理し、SSOT 化の選択肢を比較
- `03_content_inventory.md` — ページ別コピー / 画像 / CTA の現状を一覧化
- `04_performance_baseline.md` — Lighthouse / WebVitals / 画像最適化（sharp 利用状況含む）
- `05_seo_baseline.md` — sitemap / robots / metadata / OGP / 構造化データの棚卸し
- `06_accessibility_baseline.md` — `aria-*` / フォーカス / ランドマーク / カラーコントラスト
- `07_notion_data_contract.md` — News / Members / Positions の DB スキーマ仕様

> 上記はあくまで候補。優先順位はユーザーと相談のうえ決定する。
