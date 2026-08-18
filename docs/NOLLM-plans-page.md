# NOLLM — /plans page manual (edit it yourself, no AI needed)

This is a plain-Japanese manual for the **/plans page**, which is now a
**single-product page for ナレッジハーネス (Knowledge Harness)**. It is written
so you can change things by hand, without asking an AI.

**Everything below is a real value copied from the real code**, not an example.

> **2026-08-18: this page stopped being a 3-card service grid.** It used to
> show three invented placeholder services (AIOps診断／業務自動化／データ活用).
> The manager supplied the first real, priced product — ナレッジハーネス — and
> /plans now sells that one product on one plan. The old cards
> (`PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx`) are still on disk,
> untouched and unimported, in case a multi-card layout is ever wanted again —
> they represented a lot of work. This manual describes the new product page.
>
> **このページにアニメーションは一切ありません。** マネージャーの指示
> （2026-08-18）で「凝ったデザインやアニメーションは不要、シンプルなものが
> 良い」と決まったため、GSAP のスクロール演出やフェードインは全て削除されて
> います。動きを足したくなっても、まずこの指示を思い出してください。
>
> **2026-08-18（同日追記）: フォント・配色をサイト共通のもの（house style）に
> 統一しました。** ページ専用のフォント読み込み（CDN 経由の Gen Interface JP /
> JetBrains Mono）は削除済みで、`src/app/layout.tsx` がグローバルに読み込む
> Noto Sans JP・Forum・Poppins をそのまま使っています。

---

## 1. まず知っておくこと — 文章はすべて1つのファイルにある

このページに表示される**日本語・英語の文章は、すべて**
`src/app/plans/_components/khContent.ts` の中にあります。文章を直す時は
基本的にこのファイルだけを開けば足ります。

`khContent.ts` の中は、ページの区画ごとに分かれています。

| 定数名 | 何を表示しているか |
|---|---|
| `HERO` | 一番上のヒーロー部分。製品名（英語・日本語）、見出し2行、本文、補助金の注記 |
| `FEATURES` | 「できること」セクション。導入後の変化の一文＋6個の機能カード |
| `PRICING` | 「料金」セクション（ページで唯一の黒い箱）。月額、内訳3行、合計、補助金パネル、税別注記 |
| `GLOSSARY` | 「Claude Team Standard とは」の説明ボックス |
| `SUPPORT` | 「サポート・伴走」の5項目 |
| `CTA` | 一番下のピンクのボタンとそのリード文、リンク先 |

どの定数がページのどこに出るかは、`src/app/plans/_components/` の中の
同名のコンポーネント（`KhFeatures.tsx` が `FEATURES` を読む、など）を見れば
一対一で対応しています。

---

## 2. ファイルの一覧

| File | What it holds |
|---|---|
| `src/app/plans/page.tsx` | ページ全体の組み立て。メタデータ（タイトル・description）と、どのセクションを上から順に並べるか。フォントの読み込みはここでは行いません（サイト共通の設定を使います）。 |
| `src/app/plans/_components/khContent.ts` | **文章と数字はすべてここ。** 上の表を参照。 |
| `src/app/plans/_components/PlansHero.tsx` | 一番上のヒーロー。見た目のレイアウトのみ、文章は `HERO`（khContent.ts）から読む。アニメーションなし。 |
| `src/app/plans/_components/KhSectionHead.tsx` | 「Features」「Pricing」「Support」の見出し部分（横罫線＋大きな英語＋黒いチップの日本語ラベル）を共通化した部品。3つのセクションで使い回している。サイトのトップページと同じ見出しの形です。 |
| `src/app/plans/_components/KhFeatures.tsx` | 「できること」セクションのレイアウト。文章は `FEATURES`。 |
| `src/app/plans/_components/KhPricing.tsx` | 「料金」セクション（黒い箱）のレイアウト。文章・数字は `PRICING`。 |
| `src/app/plans/_components/KhGlossary.tsx` | 「Claude Team Standard とは」ボックスのレイアウト。文章は `GLOSSARY`。 |
| `src/app/plans/_components/KhSupport.tsx` | 「サポート・伴走」セクションのレイアウト。文章は `SUPPORT`。 |
| `src/app/plans/_components/KhCta.tsx` | 一番下のピンクのボタン。文章・リンク先は `CTA`。 |
| `src/data/plans.ts` | `/contact` ページの「お問い合わせ内容」欄を自動入力するための元データ。詳しくは4章。 |
| `src/app/plans/_components/PlanCard.tsx` | **退役済み。触らない。** 昔の3枚カードのうちの1枚のデザイン。ディスク上には残しているが、どこからも読み込まれていない。 |
| `src/app/plans/_components/PlanCardFace.tsx` | **退役済み。触らない。** さらに古いカルーセル版のカード面。 |
| `src/app/plans/_components/PlanCardStack.tsx` | **退役済み。触らない。** カルーセル本体（ドラッグ操作など）。 |

> ⚠️ `PlanCard.tsx` / `PlanCardFace.tsx` / `PlanCardStack.tsx` の3ファイルは
> **編集しないでください。** どこからも呼び出されておらず、このページの表示に
> 一切影響しません。将来また複数カードのレイアウトに戻す可能性があるので
> 削除せず残してあるだけです。

---

## 3. 料金の数字を直すとき — 一番注意すること

`khContent.ts` の `PRICING` の中の金額は、**すべて「万円」の生の数字**です
（`'216'` のように、単位もカンマも付けません）。単位の「万円」はコンポーネント
（`KhPricing.tsx` の `Yen` という部品）側で自動的に付け足しています。

```ts
export const PRICING = {
  monthlyFigure: '9',        // 月額9万円 の「9」
  rows: [
    { item: '月額利用料（24ヶ月分）', detail: null, amount: '216' },
    { item: '初期導入費', detail: '導入研修・オンボーディング初期設定込み', amount: '38' },
    { item: 'Claude Team Standard 5名分（24ヶ月分）', detail: 'Claude Code含む・標準セット', amount: '45' },
  ],
  totalAmount: '299',        // 216 + 38 + 45
  subsidy: {
    figure: '149.5',         // 299 ÷ 2
  },
};
```

### ⚠️ 計算チェックは自動化されていません

このページのどこにも「合計を自動計算する」仕組みはありません。3行の金額を
足したものを、あなたが手で `totalAmount` に書いています。同様に、
`subsidy.figure`（実質負担額）も `totalAmount` を2で割った値を、あなたが
手で書いています。

**内訳のどれか1つでも数字を変えたら、次の2つを必ず手で直してください：**

1. `totalAmount` = 3行の `amount` の合計
2. `subsidy.figure` = `totalAmount` ÷ 2

今の値で確認すると：`216 + 38 + 45 = 299`、`299 ÷ 2 = 149.5`。合っています。
ここがズレていても画面には何もエラーが出ません — 見積書の数字が単純に
間違って表示されるだけなので、金額を変えたら必ず自分で電卓を当ててください。

### 税別／税込みの注記

`PRICING.taxNote` に入っています（`※表示価格はすべて税別です。`）。もし
実際は税込みなら、この1行だけを書き換えればページ全体に反映されます。

---

## 4. `HERO.note` の日付

`khContent.ts` の `HERO.note` には「（2026年8月10日時点の内容）」という
日付が入っています。これは製品内容・料金の基準日です。**料金や機能の内容を
改訂したら、この日付も一緒に更新してください。** 日付だけ古いままだと、
いつの情報かわからなくなります。

```ts
export const HERO = {
  note: '国の「デジタル化・AI導入補助金2026」の対象ツールとなることを前提に設計しています。（2026年8月10日時点の内容）',
};
```

---

## 5. `src/data/plans.ts` — `/contact` の自動入力の元データ

`/plans` のページ本体の見た目はもう `src/data/plans.ts` を見ていません
（3章までの `khContent.ts` がすべてです）。ただし `src/data/plans.ts` の
`PLANS` という配列は、`/contact` ページが URL の `?plan=knowledge-harness`
を見て「お問い合わせ内容」欄を自動で書き込むために、今も使われています。

```ts
export const PLANS: Plan[] = [
  {
    slug: 'knowledge-harness',   // ⚠️ リンクのID。書き換えない
    label: 'KNOWLEDGE HARNESS',
    name: 'ナレッジハーネス',
    summary: '社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。',
    // ...
  },
];
```

`/plans` の一番下のボタン（`KhCta.tsx` の `CTA.href`）は
`/contact?inquiry=dx&plan=knowledge-harness` にリンクしています。ここの
`plan=knowledge-harness` と、`plans.ts` の `slug: 'knowledge-harness'` が
一致していないと、自動入力が働きません（`/contact` 側は一致しない場合、
メッセージ欄を空欄のまま何も表示しないだけで、エラーにはなりません）。

`/contact` に渡って自動で入るメッセージの中身：

```
「ナレッジハーネス」（KNOWLEDGE HARNESS）に興味があります。

■ サービス内容
社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。

詳細なご説明とお見積もりをお願いいたします。
```

`name` と `summary` を書き換えると、この自動入力メッセージも連動して変わり
ます。`slug` だけは書き換えないでください — 変えると、もし
`/contact?plan=knowledge-harness` というリンクが既にどこかで使われていた
場合、そのリンクが動かなくなります。

> ⚠️ `src/data/plans.ts` の中の `Plan` 型には、`price` や `specs` など、今の
> ページ本体では使っていないフィールドも残っています。これは退役済みの
> `PlanCard.tsx` などが今も同じ型を使っているためで、消さないでください。

---

## 6. `PlanCard.tsx` / `PlanCardFace.tsx` / `PlanCardStack.tsx` は編集しない

3章で触れた通り、この3ファイルは**現在のページのどこからも呼び出されて
いません。** 編集しても画面には何も反映されません。将来また複数カードの
見せ方に戻す可能性を考えて、あえて削除せず残してあります。

---

## 7. 見るときのやり方

Open PowerShell in `C:\Users\owner\Desktop\GIFT_website` and run:

```
npm run dev
```

Then open **http://127.0.0.1:3000/plans** in the browser.

> Use `127.0.0.1`, **not** `localhost`. On this machine `localhost` sometimes
> points at a dead process and shows a 404 for no reason.

**After you edit a file, always hard-reload the browser: `Ctrl + Shift + R`.**
A normal reload can keep the old JavaScript and make you think your change did
nothing.

このページには GSAP アニメーションが一切無いので、画面に反映されない時は
まず「保存し忘れ」か「ハードリロードし忘れ」を疑ってください（昔のヒーロー
演出のような、フォント読み込み待ちで起きる不具合はこのページでは起こり
ません — 演出そのものが存在しないためです）。

When you are finished, press `Ctrl + C` in that PowerShell window to stop the
server and free the port.

### Before you call a change "done"

```
npm run build
```

If that prints `✓ Compiled successfully`, you did not break the build. If it
prints red errors, read the file + line number it names and undo your last edit.

---

## 8. このページに絶対にやってはいけないこと

- **アニメーションを足さない。** GSAP のインポート、`useEffect`、
  `useRef`、`'use client'` はこのページのどのファイルにも存在しません
  （2026-08-18、マネージャーの明確な指示）。足すとページの設計方針そのもの
  を壊します。
- **`<a href="...">` を生で書かない。** 内部リンクは必ず `next/link` の
  `<Link>` を使ってください（`KhCta.tsx` を参照）。生の `<a>` はページ全体を
  再読み込みしてしまい、`layout.tsx` の白いカバーが `/contact`（濃い紺色の
  ページ）の上に一瞬かぶって「真っ白なページに見える」不具合の原因になり
  ます（このプロジェクトで何度も起きた既知の不具合）。
- **料金の合計・実質負担額を手計算せずに変更しない。** 3章参照。

---

## 9. Known limitations (not bugs — just not done)

- **補助金の対象になるかは未確定です。** `HERO.note` と `PRICING.subsidy`
  の文言はどちらも「対象ツールとなることを前提に設計」「補助金の交付を
  受けた場合」という条件付きです。確定した情報ではありません。
- **税別／税込みの基準が製品資料に明記されていません。** 現状は旧ページの
  慣習を引き継いで「税別」表示にしています（3章参照）。
- **契約は1年（自動更新）だが、金額は24ヶ月分で提示しています。** 12ヶ月で
  更新しない場合にどうなるかは、この資料には書かれていません。

---

## 10. Troubleshooting

| Symptom | Most likely cause |
|---|---|
| Change did nothing | You didn't hard-reload — `Ctrl + Shift + R` |
| Whole page blank and nothing in the code looks wrong | Zombie dev server. Close all PowerShell windows running `npm run dev`, reopen one, run it again. This is a known recurring problem on this machine. |
| 見出しの最後に1文字だけ浮いて見える | 短い日本語の見出しには `textWrap: 'balance'` が付いています。文章を書き換えたら、その見出しに `textWrap: 'balance'` が残っているか確認してください（複数行の本文には付けないのがルールです）。 |
| 料金の数字が合わない | 3章参照。`totalAmount` と `subsidy.figure` は手計算・手入力です。 |
| Japanese text shows as `æ´»ç"¨` garbage | File got saved in the wrong encoding. Run `node scripts/check-encoding.mjs`. |
| `/contact` の自動入力が効かない | `KhCta.tsx` の `CTA.href` の `plan=...` と、`src/data/plans.ts` の `slug` が一致しているか確認してください（5章）。 |

---

## 11. Git

This page lives on the branch **`features/plans-page`** and is **not merged
and not deployed**. Nobody outside can see it.

Useful commands:

```
git status                  # what you changed
git diff                    # the actual changes, line by line
git checkout -- <file>      # THROW AWAY your changes to one file
git stash                   # park all changes (get them back with: git stash pop)
```

If you break something badly and want to start over on one file, use
`git checkout -- <file>` — but be aware that only restores it back to the last
**commit**, and much of this page may still be uncommitted.

To see the live site branch instead, that is `dev`, which auto-deploys.

---

## 12. Related docs

- `docs/plans-knowledge-harness.md` — the full design spec for this rebuild
  (2026-08-18): every component's source code, the reasoning behind each
  decision, and the constraints an editor or AI must not violate.
- `docs/plans-page-hero-animation.md` — the old carousel reference site
  (madewithgsap.com) decoded. Only relevant if the retired
  `PlanCardStack.tsx` carousel is ever revived — has nothing to do with the
  current page.
- `docs/plans-page-plan.md` — earlier planning notes for the old 3-card grid.
  **Superseded**, kept for history only.
