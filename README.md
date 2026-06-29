# 株式会社GIFT コーポレートサイト

**株式会社GIFT** の公式コーポレートサイトです。WordPressから最新のNext.jsスタックへ刷新し、Vercelにてデプロイしています。

本サイトでは、GIFTのコア事業である **AIOps**（中小企業へのAI活用支援：学習・実装・定着）を中心に情報を発信しています。

---

## ページ構成

| ルート | 内容 |
|---|---|
| `/` | ホーム — ヒーロー、フィロソフィーホイール、会社概要、AIOps紹介、実績 |
| `/services/aiops` | AIOpsサービス詳細 — 3ステップロードマップ（学習 → 実装 → 定着） |
| `/company` | 会社情報 — ミッション／ビジョン／バリュー、代表メッセージ、沿革、アクセス |
| `/news` | ニュース・コラム記事（Notionバックエンド、ISR） |
| `/news/[slug]` | 個別記事ページ |
| `/member` | メンバー一覧 |
| `/member/[id]` | メンバー個別プロフィール |
| `/recruit` | 採用情報 |
| `/achievements` | 実績・事例紹介 |
| `/contact` | お問い合わせフォーム |
| `/privacy` | プライバシーポリシー |

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | [Next.js 14](https://nextjs.org/)（App Router） |
| 言語 | TypeScript 5.5 |
| スタイリング | Tailwind CSS 3.4 |
| 3D / WebGL | Three.js + React Three Fiber（`@react-three/fiber`、`@react-three/drei`） |
| アニメーション | GSAP 3、Lenis（スムーズスクロール）、Lottie（`lottie-react`） |
| CMS | Notion API（`@notionhq/client`）— 記事・メンバー情報 |
| メール送信 | Resend — お問い合わせフォーム |
| デプロイ | Vercel |
| テスト | Playwright |
| フォーマット | Prettier + `prettier-plugin-tailwindcss` |

---

## ローカル開発

### 前提条件

- Node.js 20以上
- npm

### セットアップ

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数ファイルのコピーと設定
cp .env.example .env.local
```

必要な環境変数：

```
NOTION_API_KEY=        # Notionインテグレーショントークン
NOTION_ARTICLES_DB=    # ニュース記事用NotionデータベースID
NOTION_MEMBERS_DB=     # メンバー情報用NotionデータベースID
RESEND_API_KEY=        # お問い合わせフォーム用Resend APIキー
```

### 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000
```

### 本番ビルド（ビジュアルQA推奨）

```bash
npm run build && npm run start
```

フラッシュ・チラつき等のSSR関連バグはdev環境では再現しない場合があります。本番ビルドで確認してください。

---

## 主要コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | ローカル開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番ビルドをローカルで起動 |
| `npm run lint` | ESLintチェック |
| `npm run format` | Prettierで全ファイルフォーマット |
| `npm run format:check` | Prettierチェック（CI用） |
| `npm run check:encoding` | ソースファイルの文字化けチェック |
| `npm run fix:encoding` | 文字化けの自動修正 |

---

## ブランチ戦略

```
main           ← 本番（Vercelへ自動デプロイ）
dev            ← 統合ブランチ
features/devN  ← 機能開発ブランチ
```

プルリクエストは `dev` へマージし、リリース時に `dev` → `main` へマージします。

---

## プロジェクト構成

```
src/
├── app/                  # Next.js App Router — ルートごとにフォルダ分割
│   ├── page.tsx          # ホームページ
│   ├── company/          # /company
│   ├── services/aiops/   # /services/aiops
│   ├── news/             # /news + /news/[slug]
│   ├── member/           # /member + /member/[id]
│   ├── contact/          # /contact
│   └── ...
├── components/
│   ├── layout/           # ナビバー、フッター
│   ├── sections/         # ページレベルのセクションコンポーネント
│   └── ui/               # 汎用UIコンポーネント
├── data/                 # 静的JSON（会社情報、メンバーデータ等）
├── lib/                  # Notionクライアント、ユーティリティ
└── styles/               # グローバルCSS

public/
├── images/
├── lottie/               # LottieアニメーションJSONファイル
└── ...
```

---

## コンテンツ管理

記事・メンバー情報は **Notion** で管理し、ISR（インクリメンタル静的再生成、60秒の再検証ウィンドウ）によりビルド時に取得します。サイト閲覧にCMSへのログインは不要で、Notionを更新してから最大1分以内に再デプロイなしで本番サイトへ反映されます。

---

## ライセンス

プライベートリポジトリ — 著作権は株式会社GIFTに帰属します。
