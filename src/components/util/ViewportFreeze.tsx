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
