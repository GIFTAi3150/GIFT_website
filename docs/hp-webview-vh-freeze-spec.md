# HP — Instagram WebView 跳ね返りバグ修正 / viewport 高さの px フリーズ

**Branch:** `fix/hp-webview-vh-jump`（`dev` から分岐）
**対象:** トップページ `/` のみ
**Status:** 仕様確定 — executor 実装待ち
**日付:** 2026-08-07

> ⚠️ このブランチでは `/lp` と `/plans` には**一切触れないこと**。
> 変更してよいファイルは §4 のリストが全てです。

---

## 1. バグ

本番トップページを **Instagram のアプリ内ブラウザ**（iOS WKWebView）で開き、AIOps
セクションのスクラブを抜けて Case セクションに差し掛かると、ユーザーが何もして
いないのに AIOps パネルと Case の間で画面が上下に往復し続ける。

### 原因（計測で確定済み）

Instagram / Facebook のアプリ内ブラウザは Safari と違って**ツールバーをオーバーレイ
しない。WebView 自体を物理的にリサイズする**。したがってツールバーが出入りする
たびに、ページ内のあらゆる viewport 単位（`vh` / `dvh` / `svh` / `lvh` すべて）が
再解決される。

トップページは Case セクションより上に、viewport 単位で高さを持つブロックを
**10.8 個分**積み上げている:

| ブロック | 宣言 | 倍率 |
| --- | --- | --- |
| `Hero` `<section>` | `minHeight: '100vh'` | 1.0 |
| `WheelScroll` outer | `height: '400vh'` | 4.0 |
| `AIOps` outer | `height: '580vh'` | 5.8 |
| | **合計** | **10.8** |

ツールバーの 60px の開閉で、Case セクションの絶対位置が **60 × 10.8 = 648px**
動く。スクロール位置は動いていないのにコンテンツの方が瞬間移動するため、読者は
弾き飛ばされる。そしてその瞬間移動がまたツールバーの開閉を誘発し、振動が続く。
iOS WKWebView は scroll anchoring を実装していないので、何も補正してくれない。

### 実測ベースライン（`www.gift-inc.org`, Pixel 7 viewport, Case 手前で静止）

```
PHASE 1  viewport 固定・6秒静止
  scrollY 変動 : 0        docHeight 変動 : 0        caseTop 変動 : 0
PHASE 2  viewport 高さを ±60px でトグル
  vh=855  doc=11845  caseTop=10671  heroH=855
  vh=915  doc=12493  caseTop=11319  heroH=915
  --> docHeight 変動 : 648
  --> caseTop  変動 : 648    ← これが直す数字
  --> heroH    変動 : 60
  programmatic scroll writes: 0   ← JS は一切スクロールを書いていない
```

**純粋なレイアウトの瞬間移動**であることが確定している。GSAP / ScrollTrigger は
無罪（スクロール位置を書いた形跡ゼロ、しかも GSAP 3.15 は touch 端末では 25%
未満の高さ変化で refresh しない）。したがって修正は**レイアウトだけ**を触ればよい。

---

## 2. 修正方針

> **スクロール量の予算は、マウント時に測った px で固定する。
> viewport の「幅」が変わったときだけ測り直す。「高さだけ」の変化は無視する
> （＝それはブラウザのツールバーである）。**

`svh` に替えるのでは直らない。物理的にリサイズされる WebView では `svh` も
`lvh` も `dvh` も一緒に再解決されるため。**px 固定だけが安定する。**

### 実装形態 — CSS カスタムプロパティ 1 個

React の state ではなく `:root` の CSS 変数 `--vh-frozen` に px を書き込む。

```
:root { --vh-frozen: 100vh; }        /* CSS 側のフォールバック */
```

```
Hero        minHeight : var(--vh-frozen)
WheelScroll height    : calc(var(--vh-frozen) * 4)
AIOps       height    : calc(var(--vh-frozen) * 5.8)
```

マウント後、クライアント側で `--vh-frozen` を実測 px に差し替える。

**この形にする理由（hook / state 方式より優れている点）:**

1. **hydration 事故がゼロ。** インラインスタイルの文字列はサーバーでもクライアント
   でも完全に同一。state を持たないので初回描画の分岐も再レンダーも発生しない。
2. **JS が動かなくても今日と完全に同じ。** フォールバックが `100vh` なので
   `calc(100vh * 4)` = `400vh`。JS 無効・スクリプト失敗時も現状維持。
3. **マウント時点の値は現状とピクセル単位で一致する。** 後述の測定方法が
   「いま `100vh` が解決する値」そのものを測るため、`window.innerHeight` ではなく
   `100vh` の実測値を使う。iOS Safari では `100vh` = `lvh` ≠ `innerHeight` なので、
   ここを間違えると Safari でヒーローの高さが 60px 縮む。
4. リポジトリの既存方針（「GSAP に値を持たせず CSS 変数を食わせる」
   `project_aiops_cascade_misalign`）と一致する。

### 再測定のゲート — GSAP と同じ判定を使う

`ScrollTrigger.js:395-398` が touch 端末で refresh するかどうかの判定は

```js
!_ignoreMobileResize || _baseScreenWidth !== _win.innerWidth
  || Math.abs(_win.innerHeight - _baseScreenHeight) > _win.innerHeight * 0.25
```

**同じゲートを採用する** = 「幅が変わった」か「高さが 25% 超変わった」ときだけ
測り直す。理由:

- 25% は 915px の viewport で 229px。Instagram のツールバー（約 60〜120px）も
  iOS Safari のツールバー（約 110px）も確実に下回るので、チラつきは全部無視できる。
- デスクトップで人がウィンドウを大きく縮めた場合はちゃんと追従する。
- **GSAP が refresh する条件と完全に一致する**ため、「我々が測り直すとき GSAP も
  測り直す／我々が無視するとき GSAP も無視する」が保証され、両者がズレない。

---

## 3. 検討して**採用しなかった**もの（executor は実装しないこと）

| 案 | 却下理由 |
| --- | --- |
| `vh` → `svh` に置換 | 物理リサイズ WebView では `svh` も再解決する。無意味。 |
| Hero を `height` 固定にする | `minHeight` は `max(100vh, 中身)` の意味。横向き短い画面では中身（約 553px）が勝つ必要がある。`height` にするとヒーローが切れる。**必ず `minHeight` のまま。** |
| `--vh-fill`（伸びる専用の第 2 変数）を足して Hero だけ追従させる | 変数と分岐が増える割に、防げるのは「Instagram で scrollY≈0 かつツールバー格納中に WhoWeAre が 60px 覗く」だけ。しかも Instagram はスクロールアップでツールバーを戻すので、その状態にほぼ到達しない。§7 に後日対応として記載。 |
| `ScrollTrigger.config({ ignoreMobileResize: true })` | GSAP 3.15 は touch 端末で既定でこの挙動。追加不要。かつ全ページに影響する設定変更は今回のスコープ外。 |
| `html { overflow-x: hidden }` の除去 | 別エージェントが提案したが誤り。ルート要素の overflow は viewport に伝播するだけでスクロールボックスは移動しない。scroll anchoring が効かないのは WebKit が未実装だから。しかもこの 1 行が `WheelScroll` の `150vw` 円と `HPAbout` の `18vw` を横スクロールから守っている。**触るな。** |
| ピン内部の `top: 28vh` / `40vh` / `7vh` padding 等も px 化 | これらは sticky パネルの中に閉じており、ドキュメント高さに 1px も寄与しない（トグル 1 回あたり最大 24px の内部ズレ）。今回のバグの原因ではない。sticky パネル自身は viewport 追従のままなので、中身だけ固定するとかえって不整合になる。**今回は触らない。** |

---

## 4. 変更するファイル（この 6 つだけ）

### 4-1. 新規 `src/components/util/ViewportFreeze.tsx`

```tsx
'use client';

import { useEffect } from 'react';

/** `:root` に書き込む変数名。スクロール予算のみがこれを使う。 */
const VH_VAR = '--vh-frozen';

/** 再測定したことを購読者（ScrollTrigger を持つ節）に知らせるイベント。 */
export const VH_FROZEN_CHANGE = 'gift:vh-frozen-change';

/**
 * いま `100vh` が解決する値を px で測る。
 *
 * `window.innerHeight` ではない点が重要。iOS Safari では `100vh` は *large*
 * viewport（ツールバー格納時の高さ）に解決されるので `innerHeight` より大きい。
 * 置き換え対象は `vh` 宣言なので、`vh` そのものを測らないと Safari で
 * ヒーローが今日より縮む。
 *
 * プローブは `position: fixed` なのでドキュメント高さには一切影響しない。
 */
function measure100vh(): number {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100vh;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  // getBoundingClientRect は小数を保持する。offsetHeight だと丸められ、
  // ×5.8 したときに最大 3px ずれる。
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

/**
 * スクロール予算用の viewport 高さを px で固定する。
 *
 * なぜ必要か: Instagram / Facebook のアプリ内ブラウザは Safari のように
 * ツールバーをオーバーレイせず、WebView を物理的にリサイズする。そのため
 * ツールバーの開閉ごとに `vh`/`dvh`/`svh`/`lvh` が全て再解決される。トップ
 * ページは Case セクションより上に 10.8 viewport 分の高さを積んでいるので、
 * 60px のツールバー開閉がコンテンツを 648px 瞬間移動させ、読者を弾き飛ばす。
 * iOS WKWebView は scroll anchoring 未実装なので補正も入らない。
 *
 * 再測定の条件は GSAP ScrollTrigger 3.15 の refresh 判定と意図的に揃えてある
 * （幅が変わった／高さが 25% 超変わった）。こうしておくと「我々が測り直す
 * ときは ScrollTrigger も refresh する」が成立し、両者がズレない。
 *
 * 高さだけの小さな変化＝ブラウザのツールバー。これは無視する。それが修正の本体。
 *
 * 詳細: docs/hp-webview-vh-freeze-spec.md
 */
export default function ViewportFreeze() {
  useEffect(() => {
    const root = document.documentElement;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let settleTimer: number | undefined;

    const apply = (announce: boolean) => {
      const px = measure100vh();
      // 非表示タブ等で 0 が返ることがある。そのときは前の値を保持する。
      if (!px) return;
      root.style.setProperty(VH_VAR, `${px}px`);
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
      if (announce) window.dispatchEvent(new Event(VH_FROZEN_CHANGE));
    };

    // 初回。この時点の px は置き換える vh とピクセル単位で同値なので、
    // レイアウトは 1px も動かない（= ScrollTrigger の再計算も不要）。
    apply(false);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const widthChanged = w !== lastWidth;
      const heightChangedALot = Math.abs(h - lastHeight) > h * 0.25;
      // 幅そのまま & 高さの変化が小さい = ブラウザのツールバー。無視する。
      if (!widthChanged && !heightChangedALot) return;

      apply(true);

      // iOS は回転直後の resize で古い innerHeight を返すことがある。
      // 少し待ってもう一度測り直す。
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => apply(true), 350);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.clearTimeout(settleTimer);
      root.style.removeProperty(VH_VAR);
    };
  }, []);

  return null;
}
```

### 4-2. `src/styles/globals.css` — `:root` に 1 行追加

既存の `:root { ... }` ブロック（`--font-mincho` などがあるところ、1084 行付近）
の**末尾**に追加する。既存の行は消さないこと。

```css
:root {
  --font-mincho: '游明朝', 'Yu Mincho', 'Hiragino Mincho ProN W3', 'ヒラギノ明朝 ProN W3', serif;
  color-scheme: light;
  /* Espacio La Nube design tokens — cloud blue + deep teal */
  --nube-cloud: 176 224 233;
  --nube-ink:   34 109 122;
  --ease-out-soft: cubic-bezier(.22, 1, .36, 1);

  /* スクロール量の予算に使う viewport 高さ。ViewportFreeze がマウント時に
     実測 px へ差し替え、以後は viewport の「幅」が変わったときだけ測り直す。
     Instagram のアプリ内ブラウザは WebView を物理リサイズするため vh が
     ツールバー開閉のたびに再解決され、トップページでは Case セクションが
     648px 瞬間移動していた。ここが 100vh のままでも表示は今日と同一
     （JS 無効時のフォールバック）。詳細: docs/hp-webview-vh-freeze-spec.md */
  --vh-frozen: 100vh;
}
```

### 4-3. `src/app/layout.tsx` — `<ViewportFreeze />` をマウント

import を既存の util 群の並びに追加:

```tsx
import ViewportFreeze from '@/components/util/ViewportFreeze';
```

`<body>` 内、既存の util コンポーネントの並びに追加（`ErrorReporter` の直前）:

```tsx
        <CtaHoverHydrator />
        <ScrollToTopOnRouteChange />
        <RootCanvasMount />
        <ViewportFreeze />
        <ErrorReporter />
```

layout に置くのは、変数を 1 箇所だけで管理し、リスナーの二重登録を避けるため。
`--vh-frozen` を読むのは現状トップページの 3 箇所だけなので、他ページの表示は
一切変わらない。

### 4-4. `src/components/sections/Hero.tsx`

17 行目 `minHeight: '100vh',` を差し替える。**`minHeight` のままにすること**
（`height` にすると横向き短い画面で中身が切れる）。

```tsx
      style={{
        // viewport 単位ではなく ViewportFreeze が固定した px を使う。
        // Instagram のアプリ内ブラウザは WebView を物理リサイズするので、
        // vh のままだとツールバー開閉のたびにこの節が伸縮し、下の全セクションを
        // 押し下げ／引き上げてしまう。詳細: docs/hp-webview-vh-freeze-spec.md
        minHeight: 'var(--vh-frozen)',
        backgroundColor: '#0b1020',
        isolation: 'isolate',
      }}
```

### 4-5. `src/components/sections/WheelScroll.tsx`

**(a)** 169 行目の outer:

```tsx
      {/* Tall outer wrapper — always present so GSAP trigger fires on all viewports.
          高さは vh ではなく ViewportFreeze が固定した px（400vh 相当）。
          理由: docs/hp-webview-vh-freeze-spec.md */}
      <div ref={outerRef} style={{ height: 'calc(var(--vh-frozen) * 4)' }}>
```

**(b)** 既存の GSAP `useEffect`（130 行目から始まるもの）の `return` クリーンアップの
直前に、再測定イベントの購読を追加する。同じ effect 内に置くこと（`tl` と
ライフサイクルを合わせるため）:

```tsx
    // ViewportFreeze が測り直したら scrub 範囲を計算し直す。px の書き換えは
    // resize イベントを発火しないので、これが無いと回転後にトリガー位置が
    // 古いまま残る。
    const onFrozenChange = () => ScrollTrigger.refresh();
    window.addEventListener(VH_FROZEN_CHANGE, onFrozenChange);

    return () => {
      window.removeEventListener(VH_FROZEN_CHANGE, onFrozenChange);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
```

import を追加:

```tsx
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
```

### 4-6. `src/components/sections/AIOps.tsx`

**(a)** 112 行目の outer:

```tsx
      {/* Full scroll-height outer — GSAP scrubs across this.
          高さは vh ではなく ViewportFreeze が固定した px（580vh 相当）。
          理由: docs/hp-webview-vh-freeze-spec.md */}
      <div ref={outerRef} style={{ height: 'calc(var(--vh-frozen) * 5.8)' }}>
```

**(b)** 「Scroll-driven cascade」の `useEffect`（67 行目から）に、4-5(b) と同じ
リスナーを同じ形で追加する（`return` の直前に登録、クリーンアップで解除）。

import を追加:

```tsx
import { VH_FROZEN_CHANGE } from '@/components/util/ViewportFreeze';
```

---

## 5. 触ってはいけないもの

- `src/app/(lp)/**` — LP は本番未投入。**絶対に触らない。**
- `/plans` 関連ファイル。**絶対に触らない。**
- `src/styles/globals.css` の `html { overflow-x: hidden }`（1095 行）。
- `WheelScroll` / `AIOps` の sticky 子要素の `100vh` / `100dvh`、およびピン内部の
  `top: 28vh` / `40vh`、`clamp(..., 7vh, ...)` などの vh。**現状のまま。**
- 他ページ（`/services/callcenter`、`/services/aiops`、`/recruit`、`/company`、
  `/achievements`）。同じ構造の問題を抱えているが今回のスコープ外。
- `src/app/loading.tsx`。
- GSAP のバージョンや `ScrollTrigger.config`。

---

## 6. 検証

### 6-1. executor が行うこと

```
cd C:\Users\owner\Desktop\_gift_fix_hp_vh
npx tsc --noEmit
```

エラーゼロであること。

**`npm run build` / `npm run dev` は実行しない。ポートも開かない。**
（ユーザーが 3000 番でご自身の dev server を動かしている。本番ビルドの確認は
Vercel のプレビューで行う。）

作業ディレクトリは `C:\Users\owner\Desktop\_gift_fix_hp_vh` のみ。
`C:\Users\owner\Desktop\GIFT_website` には**読み書きとも一切触れないこと。**

### 6-2. 合格条件（Vercel プレビューに対して Playwright で計測）

Pixel 7 viewport で Case 手前に静止し、viewport 高さを ±60px でトグルする:

| 指標 | 修正前 | 合格ライン |
| --- | --- | --- |
| `caseTop` の変動 | **648px** | **0px** |
| `docHeight` の変動 | 648px | 0px |
| `scrollY` の変動 | 648px | 0px |
| `heroH` の変動 | 60px | 0px |
| 回転して戻したとき `caseTop` が初期値に復帰 | 0px | 0px（維持） |

### 6-3. 最終確認

ユーザーが実機の Instagram からプレビュー URL を開いて、AIOps → Case で跳ねない
ことを確認 → `dev` へマージ。

---

## 7. 既知の残留事項（今回は直さない）

1. **Instagram で `scrollY≈0` かつツールバー格納中のとき、ヒーロー下端に
   WhoWeAre が最大 60px 覗く可能性がある。** Instagram はスクロールアップで
   ツールバーを戻すため、この状態にはほぼ到達しない。もし実機で見えたら
   `minHeight: 'max(var(--vh-frozen), 100dvh)'` にすれば消えるが、その代わり
   ヒーローの高さが 1 viewport 分だけ再び追従する（振幅 648px → 60px）。
2. **ピン内部の最大 24px のズレ**（`WheelScroll` の `top: 28vh` / `40vh`）。
   ドキュメント高さには寄与しないので跳ねの原因ではない。
3. **デスクトップでウィンドウの高さだけを 25% 未満で変えても予算は再計算されない。**
   実害なし（スクロール予算が少し短いだけ）。
4. **他ページは未対応。** 積み上げ量は `/services/callcenter` 約 1470vh、
   `/lp` 約 1320svh、`/services/aiops` 約 1140vh、`/recruit` 約 1070vh、
   `/company` 約 670vh、`/achievements` 約 460vh。`/lp` は「予算は svh、
   塗りは dvh」という最も規律ある書き方をしているが、物理リサイズ WebView には
   それでも無力。`--vh-frozen` は layout で全ページに配られているので、
   将来は各ページの予算宣言を `calc(var(--vh-frozen) * N)` に置き換えるだけでよい。
