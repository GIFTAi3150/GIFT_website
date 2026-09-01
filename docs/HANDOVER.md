# GIFT コーポレートサイト — 引き継ぎメモ

最終更新: 2026-09-01

このサイトを触る人が**先に知っておくべきこと**をまとめたメモです。
細かい設計の経緯は `docs/` 配下の個別ドキュメントに残してあります。

---

## 1. 基本情報

| 項目 | 内容 |
|---|---|
| 本番 URL | **https://www.gift-inc.org**（`gift-inc.org` は 301 でここへ転送） |
| プレビュー | `https://gift-website-git-dev-itgiftai-4573s-projects.vercel.app/` |
| リポジトリ | `https://github.com/GIFTAi3150/GIFT_website` |
| ホスティング | Vercel（プロジェクト名 `gift-website`） |
| 技術 | Next.js 14 (App Router) / TypeScript / Tailwind / GSAP / three.js |

旧 WordPress サイトは**まださくらインターネット上で生きています**。
トップと旧 4 ページだけを `.htaccess` の 301 で新サイトへ逃がしている状態です。

---

## 2. ⚠️ これだけは守ってください

### ① 本番ブランチは `main` です（2026-09-01 に変更）

Vercel の Production Branch は `main` に設定されています。
**`main` にマージした瞬間に www.gift-inc.org が更新されます。**

開発の流れ:

1. `dev` からブランチを切って、PR で `dev` に戻す（日々の開発）
2. 本番リリース時に `dev` → `main` の PR を作ってマージする

`dev` へのプッシュ・マージは**プレビューデプロイ**になり、本番には出ません。

> 2026-08 までは「`dev` が本番」という変則運用でした。古いドキュメントや
> コメントにその記述が残っていたら、この節を正としてください。

### ② さくらの `.htaccess` にワイルドカードを書かない

同じ公開ディレクトリに、サイトと**無関係な稼働中アプリが約 13 個**同居しています
（`DashBoard/`、`support997/`、`saleshub/`、`QRClockIn/`、`knowledge/` など）。

前方一致や `.*` のリダイレクトを 1 行書くと、**それが全部道連れで落ちます。**
必ず `^about/?$` のように `$` で終わる**完全一致**にしてください。

- 設置場所: `/home/gift-original/www/gift-inc/.htaccess`
- 変更前バックアップ: `docs/htaccess-backup-2026-07-13.md`
- 現行版（貼り付け用）: `docs/htaccess-NEW-copy-this.md`

### ③ ネームサーバーを Vercel に移さない

DNS はさくら（`ns1/ns2.dns.ne.jp`）で管理しています。
ネームサーバーごと Vercel に移すと **MX レコードが失われ、会社メールが全停止します。**

### ④ `npm run build` と `npm run dev` を同時に実行しない

`.next` のチャンクが壊れて開発サーバーが死にます
（`Cannot read properties of undefined (reading 'call')`）。
型チェックだけしたいときは `npx tsc --noEmit` を使ってください。
壊れたら `.next` フォルダを削除すれば直ります。

### ⑤ リダイレクトは 302 で出してから 301 に上げる

301 はブラウザに永久キャッシュされるため、間違えると取り消せません。
動作確認してから昇格させてください。

---

## 3. 開発の始め方

Windows + PowerShell + Windows 版 Node で動かしてください（WSL は極端に遅くなります）。

```powershell
npm install
# .env.local を配置（Git には入っていません）
npm run dev        # http://localhost:3000
```

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run start` | 本番ビルドをローカル起動。**チラつき・スクロール系のバグはこれでないと再現しません** |
| `npx tsc --noEmit` | 型チェックのみ（開発サーバーを止めずに実行可） |
| `npm run check:encoding` | 日本語の文字化け検出（`fix:encoding` で修復） |

### 環境変数

`.env.local`（ローカル用）:
`RESEND_API_KEY` / `NOTION_API_KEY` / `NOTION_DATABASE_ID` / `NOTION_POSITIONS_DB_ID` / `NOTION_MEMBERS_DB_ID`

Vercel 側にのみ存在:
`SLACK_BOT_TOKEN` / `SLACK_ERROR_CHANNEL` / `CLIENT_ERROR_SLACK` / `VERCEL_WEBHOOK_SECRET`

> `RESEND_API_KEY` が欠けると、画面上はエラーを出さずに**問い合わせフォームだけが壊れます**。

---

## 4. ページ構成

**公開中:** `/` `/company` `/services/aiops` `/plans` `/contact` `/privacy`

**非公開（ファイルは残っているが 301 で到達不能）:**
`/member` `/recruit` `/achievements` `/services/callcenter` `/services/finance-consulting` `/news` `/style-preview` `/dev/*`

- リダイレクト定義は `next.config.js` の `redirects()`
- 2026-08-26 に非公開化。`sitemap.ts` がこれらを Google に登録してしまい、検索から実際の訪問者が `/member/kyo` に着地したため
- **これらを `robots.txt` で Disallow しないこと。** クロールを止めるとリダイレクトが認識されず、古い URL がインデックスに残り続けます

### SEO の決まりごと

- **正規ホストは `https://www.gift-inc.org`（www 付き）。** 絶対 URL を出すもの（`sitemap.ts` / `robots.ts` / `layout.tsx` の `metadataBase`・`openGraph.url`）は全部 www で統一
- `layout.tsx` が `title.template = '%s | 株式会社GIFT'` を設定済み。**子ページのタイトルに「| 株式会社GIFT」を書き足さないこと**（二重になります）

---

## 5. 既知の地雷

過去に実際に起きて、原因究明に時間がかかったものです。

### スクロール・アニメーション

| 症状 | 原因と対策 |
|---|---|
| Instagram アプリ内ブラウザで画面が上下に跳ね続ける | アプリ内ブラウザは WebView を物理リサイズするため `vh` が再解決される。トップは `--vh-frozen`（px 固定）で修正済み。**`svh` に替えても直りません** |
| 全画面ヒーローの下に隙間ができる | 全画面の塗りは `dvh` を使う（`svh` はモバイルのブラウザ UI が畳まれると足りない） |
| GSAP が突然クラッシュする | `timeline({ scrollTrigger: { once: true } })` は refresh 中に自壊します。`toggleActions` を使う |
| GSAP の後に React のスタイルが消える | `clearProps: 'all'` は `style.cssText = ""` と同義。**プロパティ名を明示すること** |
| ページ遷移直後だけスクロールアニメが動かない | `window 'load'` は App Router のクライアント遷移では発火しない。`document.fonts.ready` ＋保険の `setTimeout` で `ScrollTrigger.refresh()` を追加する |
| 横スクロールのカードが暴れる | `scroll-snap-stop: always` を付ける。指が触れている間は `scrollLeft` を書き換えない |

### 表示・レンダリング

| 症状 | 原因と対策 |
|---|---|
| iOS で真っ白なセクションが出る / React #418・#423 | **ブラウザの自動翻訳**が DOM を書き換え、GSAP が幽霊要素を動かしていたのが原因。現在サイト全体で自動翻訳を無効化して解決済み。**英語版が必要になったらサーバーサイド i18n で作ること** |
| 画面が暗いまま / 白いカバーが残る | 素の `<a>` で内部リンクを書くとフルリロードになり、ローディングカバーが再表示されます。**必ず `next/link` を使う** |
| 3D が真っ黒 / タブごと GPU が落ちる | R3F の Canvas には必ずキャプチャフェーズの `webglcontextlost` ハンドラを付ける。シェーダーは精度（precision）の不一致でリンクに失敗することがある |
| ページ再設計後にローディング表示だけ古い | `loading.tsx` の更新忘れ |

### その他

- **`gift-near-black` は暗い色ではありません**（`#EBEEF3` ＝ ほぼ白）。暗い背景には **`gift-ink`（`#111B21`）** を使ってください。命名が紛らわしいので注意
- 日本語見出しは `line-height` 1.25 以上、字間は `-0.01em` より詰めない（欧文用の設定をそのまま使うと文字が衝突します）
- 行末に 1 文字だけ落ちるのを嫌う方針。短い日本語行には `text-wrap: balance` を当てています

---

## 6. 未完了の作業

### AIOps ランディングページ（`features/aiops-lp` ブランチ・未マージ）

実装はほぼ完了していますが、以下が揃わないと公開できません。

1. **公式 LINE の URL**（コード上は `'#'` のまま。CTA が機能しない）
2. コンセプト A 用の**本番動画**（現在は仮）
3. 「無料で AI エージェントプレゼント」という**訴求内容の承認**

プレビュー: `https://gift-website-git-features-aiops-lp-itgiftai-4573s-projects.vercel.app/lp`
仕様: `docs/aiops-lp-plan.md`

### Instagram `vh` 問題 — 残り 2 ページ

トップは修正済みですが、**公開中の `/services/aiops` と `/company` が未対応**です。
（`docs/hp-webview-vh-freeze-spec.md` には「6 ページ未対応」とありますが、
そのうち 4 ページは 2026-08-26 に非公開化されたので対応不要になりました。）

`--vh-frozen` は `layout.tsx` から全ページに配られているので、宣言を置き換えるだけです。

- `/company` → `src/app/company/_components/StoryTimeline.tsx:83`（1 行）
  `` height: `${n * 100}vh` `` → `` height: `calc(var(--vh-frozen) * ${n})` ``
- `/services/aiops` → `src/app/services/aiops/dx-v3.css` の `280vh`(L1234) / `160vh`(L1600) / `360vh`(L2262) / `230vh`(L2726)、
  メディアクエリ内の `240vh`(L1526) / `300vh`(L2774)

> ⚠️ 各宣言の**直後にある `height: 100vh` は sticky パネル本体なので触らないこと**（仕様書 §5）。

### `/company` のコンテンツ

具体的な人数・数字などは**役員確認待ちのため、意図的に抽象表現に留めてあります。**
承認なしに具体化しないでください。

### メンバー写真

Notion のメンバー DB は配線済みで、列を埋めれば自動反映されます。現在はプレースホルダー画像。
ただし `/member` ページ自体は現在非公開（301）です。

### `main` ブランチ（2026-09-01 解消済み）

「`dev` が本番」という変則運用は解消しました。現在は `main` が本番、
`dev` が開発統合ブランチです（§2-① 参照）。

---

## 7. 外部サービス

| サービス | 用途 | 実装 |
|---|---|---|
| Resend | 問い合わせメール送信 → **`it@gift-original.jp`** 宛 | `src/app/api/contact/route.ts` |
| Notion | トップのニュース・メンバー情報 | `src/lib/notion.ts` |
| Slack | エラー通知 | `src/lib/notify-slack.ts` |

> 過去に「問い合わせフォームでエラーが出る」という報告がありましたが、
> 原因は Resend ではなく**ブラウザ自動翻訳による DOM クラッシュ**でした（修正済み）。
> 同様の報告が来たら、まずメールが実際に届いているか確認してください。

---

## 8. 参考ドキュメント

| ファイル | 内容 |
|---|---|
| `docs/htaccess-backup-2026-07-13.md` | さくら `.htaccess` の変更前バックアップ（ロールバック用） |
| `docs/htaccess-NEW-copy-this.md` | 現行 `.htaccess`（貼り付け用） |
| `docs/hp-webview-vh-freeze-spec.md` | Instagram `vh` 問題の詳細と検証方法 |
| `docs/aiops-lp-plan.md` | LP の仕様（作業再開時の起点） |
| `docs/domain-switch-final-plan.ja.md` | ドメイン切り替えの経緯 |
| `docs/specs/webgl-lifecycle-spec.md` | WebGL のライフサイクル規約 |
| `CLAUDE.md` | このリポジトリでの作業ルール |

---

*ドメインやデプロイ構成を変更したら、このファイルも更新してください。*
