# GIFT コーポレートサイト — 引き継ぎメモ（公開版）

最終更新: 2026-09-03

このサイトを触る人が**先に知っておくべきこと**をまとめたメモです。
サーバー構成・DNS 設定値・過去の障害の詳細などの内部情報は、このリポジトリには
置かず**非公開の社内資料**で管理しています（担当者に確認してください）。

---

## 1. 基本情報

| 項目 | 内容 |
|---|---|
| 本番 URL | **https://www.gift-inc.org** |
| リポジトリ | `https://github.com/GIFTAi3150/GIFT_website` |
| ホスティング | Vercel（プロジェクト名 `gift-website`） |
| 技術 | Next.js 14 (App Router) / TypeScript / Tailwind / GSAP / three.js |

---

## 2. ⚠️ これだけは守ってください

### ① 本番ブランチは `main` です

Vercel の Production Branch は `main` に設定されています。
**`main` にマージした瞬間に www.gift-inc.org が更新されます。**

開発の流れ:

1. `dev` からブランチを切って、PR で `dev` に戻す（日々の開発。dev はプレビューデプロイ）
2. 本番リリース時に `dev` → `main` の PR を作ってマージする

### ② ドメイン・DNS・旧サーバーのリダイレクトに安易に触らない

- `www` は Vercel、元ドメイン（apex）の DNS は旧ホスティング側の管理のまま。
  **これは意図的な構成です。**
- 旧ホスティング環境には**本サイト以外の稼働中システムが複数同居**しており、
  過去に DNS 変更が原因でそれらが停止する障害が実際に発生しています。
- したがって:
  - **ネームサーバーの移管は禁止**（会社メールも巻き込んで停止します）
  - apex の DNS レコード変更・旧サーバー側のリダイレクト設定変更は、
    必ず社内資料を確認し、担当者と合意のうえで行う
  - リダイレクトを書く場合は**完全一致のみ**（前方一致・ワイルドカード禁止）。
    **302 で動作確認してから 301 に昇格**する（301 はブラウザに永久キャッシュされます）

### ③ `npm run build` と `npm run dev` を同時に実行しない

`.next` のチャンクが壊れて開発サーバーが死にます。型チェックだけなら
`npx tsc --noEmit` を使う。壊れたら `.next` フォルダを削除すれば直ります。

### ④ 全画面の塗りに素の `vh` を使わない

アプリ内ブラウザ（Instagram 等）は WebView を物理リサイズするため `vh` が
再解決されて画面が跳ねます。全画面の塗りは `dvh` または `--vh-frozen`（px 固定）を使う。

---

## 3. 開発の始め方

Windows + PowerShell + Windows 版 Node で動かしてください（WSL は極端に遅い）。

```powershell
npm install
# .env.local を配置（Git には入っていません。変数名は下記）
npm run dev        # http://localhost:3000
```

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run start` | 本番ビルドをローカル起動。チラつき・スクロール系のバグはこれでないと再現しません |
| `npx tsc --noEmit` | 型チェックのみ |
| `npm run check:encoding` | 日本語の文字化け検出（`fix:encoding` で修復） |

環境変数（`.env.local`）: `RESEND_API_KEY` / `NOTION_API_KEY` / `NOTION_DATABASE_ID` /
`NOTION_POSITIONS_DB_ID` / `NOTION_MEMBERS_DB_ID`。値は Vercel の環境変数設定を参照。

> `RESEND_API_KEY` が欠けると、画面上はエラーを出さずに**問い合わせフォームだけが壊れます**。

---

## 4. ページ構成と SEO の決まりごと

**公開中:** `/` `/company` `/services/aiops` `/services/ai-training` `/plans` `/contact` `/privacy`

**非公開（ファイルは残っているが 301 で到達不能、または nav 未掲載）:**
`/works`（ソフトローンチ中） `/member` `/recruit` `/achievements` ほか
（リダイレクト定義は `next.config.js` の `redirects()`）

- **正規ホストは `https://www.gift-inc.org`（www 付き）。** 絶対 URL を出すもの
  （`sitemap.ts` / `robots.ts` / `layout.tsx` の `metadataBase` 等）は全部 www で統一
- `sitemap.ts` には **nav から到達可能なページのみ**登録する（コメント参照）
- 非公開化したページを `robots.txt` で Disallow しないこと（クロールが止まると
  リダイレクトが認識されず、古い URL がインデックスに残り続けます）
- `layout.tsx` が `title.template = '%s | 株式会社GIFT'` を設定済み。
  **子ページのタイトルに「| 株式会社GIFT」を書き足さないこと**（二重になります）

---

## 5. 既知の地雷（実際に起きたもの）

| 症状 | 原因と対策 |
|---|---|
| GSAP が突然クラッシュする | `scrollTrigger: { once: true }` は refresh 中に自壊。`toggleActions` を使う |
| GSAP の後に React のスタイルが消える | `clearProps: 'all'` は禁止。プロパティ名を明示する |
| ページ遷移直後だけスクロールアニメが動かない | `window 'load'` は App Router のクライアント遷移では発火しない。`document.fonts.ready` + 保険の `setTimeout` で `ScrollTrigger.refresh()` |
| iOS で真っ白なセクション / React #418・#423 | ブラウザ自動翻訳が DOM を書き換えるのが原因。サイト全体で自動翻訳を無効化済み。英語版が必要になったらサーバーサイド i18n で作る |
| 画面が暗いまま / 白いカバーが残る | 素の `<a>` で内部リンクを書くとフルリロードされる。**必ず `next/link`** |
| 3D が真っ黒 / タブごと GPU が落ちる | R3F の Canvas には必ずキャプチャフェーズの `webglcontextlost` ハンドラを付ける |
| Reveal 要素の hover が効かない | Reveal は自要素に inline style を書くため、hover/transition クラスは**内側のラッパー要素**に置く |
| `gift-near-black` は暗い色ではない | `#EBEEF3`（ほぼ白）。暗い背景には `gift-ink`（`#111B21`）を使う |

日本語見出しは `line-height` 1.25 以上、字間は `-0.01em` より詰めない。

---

## 6. 外部サービス

| サービス | 用途 | 実装 |
|---|---|---|
| Resend | 問い合わせメール送信 | `src/app/api/contact/route.ts` |
| Notion | トップのニュース・メンバー情報 | `src/lib/notion.ts` |
| Slack | エラー通知 | `src/lib/notify-slack.ts` |

---

*デプロイ構成やドメイン運用を変更したら、このファイルと社内資料の両方を更新してください。*
