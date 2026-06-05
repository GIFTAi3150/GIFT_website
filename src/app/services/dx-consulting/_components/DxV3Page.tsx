'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState, Component, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

class WebGLBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* suppress console noise */ }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}

const AtomViewer  = dynamic(() => import('./AtomViewer'),  { ssr: false });
const SvgLogoHero = dynamic(() => import('./SvgLogoHero'), { ssr: false });
// Lottie touches the DOM; load client-only to avoid SSR mismatch.
const CapLottie = dynamic(() => import('./CapLottie'), { ssr: false });

// Split a string into per-character spans so GSAP can stagger them.
// Spaces become non-breaking unicode spaces wrapped in a non-`.ch` span
// so they're skipped by the cascade tween (whitespace doesn't animate).
const splitChars = (text: string) =>
  text.split('').map((c, i) => (
    <span key={i} className={c === ' ' ? 'sp' : 'ch'}>
      {c === ' ' ? ' ' : c}
    </span>
  ));

// ============================================================
//  Static content — pulled from page-v3.html design
// ============================================================
const CAPABILITIES: ReadonlyArray<{
  id: string;
  num: string;
  color: string;
  title: string;
  body: string;
  tags: readonly string[];
  video?: string;
  /** Path to a Bodymovin/Lottie JSON in /public — when present, the
      tile renders that animation in place of any video. */
  lottie?: string;
}> = [
  {
    id: 'CAP_001',
    num: '01',
    color: 'color-paper',
    title: 'AIエージェント\n設計・構築',
    body: '計画・推論・実行を自律的にこなすAIエージェントを設計・構築。複数ステップにわたる業務を人の介入なしにこなします。',
    tags: ['AI Agents', 'LLM', 'Autonomous'],
    lottie: '/lottie/robot-animation.json',
  },
  {
    id: 'CAP_002',
    num: '02',
    color: 'color-blue',
    title: 'インテリジェント\n自動化',
    body: 'ルールベースの脆い自動化をAIパイプラインに置き換え。条件が変わっても自己修復し、人が再設定する必要はありません。',
    tags: ['Pipelines', 'Automation', 'Self-healing'],
    lottie: '/lottie/datab-animation.json',
  },
  {
    id: 'CAP_003',
    num: '03',
    color: 'color-sky',
    title: 'LLM\nインテグレーション',
    body: 'プロダクト・バックオフィス・顧客接点に言語モデルを直接組み込み。RAG・ファインチューニング・ツール呼び出しまで一貫して対応。',
    tags: ['LLM', 'RAG', 'Fine-tuning'],
    lottie: '/lottie/animation.json',
  },
  {
    id: 'CAP_004',
    num: '04',
    color: 'color-deep',
    title: 'AIOps\n監視・運用',
    body: '全モデル・エージェントをリアルタイムで監視。異常検知からコスト管理まで、AIが何をしているか常に把握できる基盤を提供。',
    tags: ['Monitoring', 'Observability', 'Governance'],
    lottie: '/lottie/saas-animation.json',
  },
];

const PAINS = [
  { n: 'Q.01', q: '手作業が毎日繰り返される' },
  { n: 'Q.02', q: 'データがバラバラで使えない' },
  { n: 'Q.03', q: '顧客対応が遅すぎる' },
  { n: 'Q.04', q: '人件費が売上を圧迫している' },
];

const FEATURES = [
  {
    id: 'F.01',
    title: 'エージェント\nオーケストレーション',
    body: '複数のAIエージェントをタスク依存関係・リトライロジック・フォールバックで制御。どのステップも無音で失敗しない設計。',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    id: 'F.02',
    title: 'RAGパイプライン',
    body: 'モデルの回答を自社ナレッジベースに紐づけ。ハルシネーションのない、根拠のある回答を一貫して生成。',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'F.03',
    title: 'ツール・API連携',
    body: 'CRM・ERP・データベース・Webhookなど、あらゆる社内外システムをエージェントが直接読み書き・トリガー。',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    id: 'F.04',
    title: 'メモリ管理',
    body: 'セッションをまたいで文脈を保持。過去の判断・ユーザー設定・会話履歴をエージェントが自動で記憶・活用。',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  },
  {
    id: 'F.05',
    title: '人間参加型フロー',
    body: '信頼スコアが閾値を下回ると、重要アクションの実行前に人間へエスカレーション。設計段階から安全な自律性を確保。',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'F.06',
    title: 'コスト・監査ログ',
    body: 'リクエスト単位のトークン集計・判断トレース・コンプライアンスエクスポートを完備。全AIアクションを完全に追跡。',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

const RPA_TRIO = [
  {
    title: '自律的なタスク実行',
    body: 'エージェントが多段階の業務を計画・実行・自己修正。定型業務に人の監視は不要。',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    title: 'システム横断\nインテリジェンス',
    body: '単一のオーケストレーションレイヤーで全ソフトウェアをAIが横断。データサイロを根本から解消。',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  },
  {
    title: '継続的な改善',
    body: '完了したタスクがエージェントにフィードバック。精度・速度・コスト効率が自動で向上し続ける。',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
];

const RPA_CARDS = [
  {
    title: 'SaaSスタートアップ',
    tools: 'GPT-4o × 社内API',
    result: 'オンボーディング・利用アラート・更新促進をAIエージェントが自律実行。サポートチケット数60%削減。',
  },
  {
    title: '医療機関',
    tools: 'Claude 3.5 × 電子カルテ',
    result: '診療記録をAIが要約・構造化し、医師レビュー前に完成。記録作業が患者あたり40分→5分に短縮。',
  },
];

// ============================================================
// Emoji rain pulled from RecruitCta — same Osmo Supply pattern.
// Fires when the user clicks the "imagine" pill in the intro line.
const IMAGINE_EMOJIS = ['✨', '💡', '🚀'];

// Hero background scrolling word lanes.
// Each entry is doubled in JSX for the seamless -50% loop.
// Large bold horizontal scrolling text behind the hero.
// Straight rows — no rotation. Big font, solid brand blue.
const HERO_BG_LANES = [
  { words: ['AIが動かす。', '自律運用。', '業務を変える。', 'Build to Win.', 'AI最前線。', '最適化する。', 'AI駆動。'],              dur: 30, rtl: false, fs: 56, delay: 0.4 },
  { words: ['自動化する。', 'デジタルDX。', 'Run Forever.', '変革する。', '次世代AI。', 'スマートOps。', 'AIと共に。'],             dur: 38, rtl: true,  fs: 40, delay: 0.6 },
  { words: ['革新する。', 'LLM連携。', 'Autonomous.', '自律判断。', '業務効率化。', 'AIエージェント。'],                            dur: 34, rtl: false, fs: 52, delay: 0.8 },
  { words: ['超自動化。', 'Build Once.', 'AI意思決定。', 'クラウドAI。', '継続改善。', 'RAGシステム。'],                            dur: 42, rtl: true,  fs: 38, delay: 1.0 },
  { words: ['自律AI。', 'Intelligent Ops.', 'エンタープライズAI。', '24時間稼働。', 'AIオーケストレーション。'],                   dur: 28, rtl: false, fs: 48, delay: 1.2 },
  { words: ['AIと共に進化する。', 'Build it once. Run forever.', 'AIが、未来を動かす。', '人が考え、AIが動かす。'],                 dur: 48, rtl: true,  fs: 36, delay: 1.4 },
];

export default function DxV3Page() {
  // Inline flash guard — CSS-independent cover that stays up until GSAP
  // has committed all initial states. The CSS data-flash-guard mechanism
  // can arrive too late when the dx-v3.css chunk loads after React renders
  // on client-side navigation (code-split CSS race). This div uses inline
  // styles so it works even if the stylesheet hasn't applied yet.
  const [inlineCoverActive, setInlineCoverActive] = useState(true);

  const heroRef = useRef<HTMLElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);
  const rainContainerRef = useRef<HTMLDivElement | null>(null);
  const rainRunningRef = useRef(false);

  const fireImagineRain = () => {
    const container = rainContainerRef.current;
    if (!container || rainRunningRef.current) return;
    rainRunningRef.current = true;

    const containerHeight = container.offsetHeight;
    const quantity = 60;
    const randInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < quantity; i++) {
      const scale = Math.random() * 0.6 + 0.4;
      const rotate = randInt(1, 5);
      const delay = 0.001 * randInt(0, 1250);
      const speed = randInt(500, 1500) * 0.001;
      const left = `${randInt(0, 10)}0%`;
      const emoji = IMAGINE_EMOJIS[Math.floor(Math.random() * IMAGINE_EMOJIS.length)];

      const single = document.createElement('div');
      single.className = 'single-rain-emoji append';
      single.style.left = left;
      const child = document.createElement('div');
      child.className = 'single-rain-emoji-text';
      child.textContent = emoji;
      single.appendChild(child);

      gsap.fromTo(
        single,
        { y: containerHeight, xPercent: -50, rotate: 0.001, scale },
        {
          y: '-100%',
          xPercent: -50,
          rotate: 0.001,
          delay,
          ease: 'Power1.easeIn',
          duration: speed,
        }
      );
      gsap.fromTo(
        child,
        { xPercent: -25, rotate },
        {
          xPercent: 25,
          rotate: -rotate,
          ease: 'Power1.easeInOut',
          delay,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
        }
      );

      container.appendChild(single);
    }

    window.setTimeout(() => {
      container.querySelectorAll('.single-rain-emoji.append').forEach((el) => el.remove());
      rainRunningRef.current = false;
    }, 2750);
  };

  // ----- Reset scroll and hide manifesto PNGs before first paint -----
  // useLayoutEffect fires synchronously after DOM commit but BEFORE the browser
  // paints. On client-side navigation the old page's scroll position is still
  // live at this point — resetting here means the first paint of the DX page
  // is always at scroll=0, so GSAP scrubbed triggers never evaluate at a
  // non-zero progress on mount. The .m-obj images are also hidden here so
  // they don't flash at their CSS-positioned location before GSAP sets their
  // transforms in the useEffect below.
  //
  // We do NOT remove [data-flash-guard] here. The whole purpose of the guard
  // is to keep the page invisible until the useEffect below has applied every
  // gsap.fromTo initial state. If we released the guard at this stage the
  // browser would paint one frame of every animated section in its final
  // (post-animation) layout — that's the "all animations look already done"
  // bug. The guard is released at the END of useEffect, inside a rAF, after
  // GSAP has committed every starting state and ScrollTrigger has refreshed.
  // History scrollRestoration is also forced to 'manual' so the browser does
  // not race us and snap the page back to a non-zero Y after our scrollTo.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document
      .querySelectorAll<HTMLElement>('.dx-v3 .m-obj')
      .forEach((el) => el.style.setProperty('opacity', '0', 'important'));
  }, []);

  // ----- All scroll-driven animations (single useEffect to share state) -----
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];

    // Belt-and-suspenders scroll reset in case Next.js scroll restoration fires
    // between useLayoutEffect and useEffect (e.g., history.back() path).
    window.scrollTo(0, 0);

    // NOTE: .m-obj opacity is restored in revealAndRefresh (rAF below), not
    // here. Moving the restore point ensures GSAP can apply autoAlpha:0
    // before the browser paints the guard-released state, giving a smooth
    // fade-in instead of a hard snap when images aren't cached on first visit.
    const isMobile = window.matchMedia('(max-width: 899px)').matches;

    // ---- Lenis smooth scroll (desktop only) ----
    // Lenis runs the actual page scroll through requestAnimationFrame, so the
    // motion is buttered on desktop wheel-based scrolling. We hook
    // ScrollTrigger.update into Lenis's scroll event so all the GSAP triggers
    // stay in sync.
    //
    // On touch devices we deliberately SKIP Lenis. Touch scroll on iOS Safari
    // does not deliver continuous scroll events the way wheel does — events
    // fire at the start and end of a gesture plus through momentum. Lenis's
    // 'scroll' callback (which we use to drive ScrollTrigger.update) ends up
    // firing inconsistently in that window, which is why every scroll-triggered
    // animation below the hero appeared dead on mobile. Native scroll +
    // ScrollTrigger's built-in window-scroll listener (which uses its own rAF
    // poll) updates reliably on touch. The cost is no smooth-scroll easing on
    // phones, which is the right trade for animations that actually run.
    let lenis: Lenis | null = null;
    let lenisRaf: ((time: number) => void) | null = null;
    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', () => ScrollTrigger.update());
      lenisRaf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }
    // ---- Progress bar ----
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (progRef.current) progRef.current.style.transform = `scaleX(${self.progress})`;
        },
      })
    );

    // (Hero canvas removed — pure typographic hero now.)

    // AI ticker
    const aiStrip = document.querySelector('.dx-v3 .ai-ticker .strip');
    if (aiStrip) {
      const tween = gsap.fromTo(
        aiStrip,
        { xPercent: 0 },
        {
          xPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dx-v3 .ai',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    // ---- Intro: words light up sequentially ----
    const introWords = [...document.querySelectorAll<HTMLElement>('.dx-v3 #introText .word')];
    introWords.forEach((w) => {
      w.style.color = 'rgba(11,19,64,0.18)';
    });
    triggers.push(
      ScrollTrigger.create({
        trigger: '.dx-v3 #introText',
        start: 'top 75%',
        end: 'bottom 50%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const total = introWords.length;
          const lit = Math.floor(p * (total + 0.5));
          introWords.forEach((w, i) => {
            if (i < lit) {
              w.style.color = w.classList.contains('accent') ? 'var(--blue)' : 'var(--ink)';
            } else {
              w.style.color = 'rgba(11,19,64,0.18)';
            }
          });
        },
      })
    );

    // ---- Manifesto scene: 2D accents AND PNG shapes drift on scroll ----
    // Each shape has its own drift amount and direction so the cluster
    // breathes as the user scrolls — no two PNGs move in lockstep. The
    // drift range is intentionally small (±25-40px) so shapes never
    // feel "offscreen-low" or "offscreen-high" at the scroll extremes.
    const manifestoScene = document.querySelector<HTMLElement>('.dx-v3 .manifesto-scene');
    if (manifestoScene) {
      const accents = Array.from(
        manifestoScene.querySelectorAll<HTMLElement>('.acc')
      );
      const accRotations = [0, -18, 0, 22, 0, -12];
      const accDrifts = [80, -110, 90, -120, 100, -85];
      accents.forEach((acc, i) => {
        gsap.set(acc, { rotate: accRotations[i % accRotations.length] });
        const y = accDrifts[i % accDrifts.length];
        const t = gsap.fromTo(
          acc,
          { y: -y * 0.4 },
          {
            y: y * 0.6,
            ease: 'none',
            scrollTrigger: {
              trigger: manifestoScene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });

      // Spheres drift vertically — the classic up/down bob that makes
      // the round shapes feel weightless.
      const spheres = Array.from(
        manifestoScene.querySelectorAll<HTMLElement>(
          '.m-obj-3, .m-obj-5, .m-obj-6, .m-obj-7'
        )
      );
      const sphereDrifts = [60, -80, 70, -65];
      spheres.forEach((sphere, i) => {
        const drift = sphereDrifts[i % sphereDrifts.length];
        const t = gsap.fromTo(
          sphere,
          { y: -drift / 2 },
          {
            y: drift / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: manifestoScene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });

      // Geometric shapes (cylinder, pill, cube) rotate in place as the
      // user scrolls — no translation, just spin around their own
      // center. Each shape rotates a different amount in a different
      // direction so the three pieces feel independent, not synced.
      const rotShapes: Array<{ sel: string; deg: number }> = [
        { sel: '.m-obj-1', deg: 50 },  // cylinder — clockwise
        { sel: '.m-obj-4', deg: -70 }, // pill — counter-clockwise, wider arc
        { sel: '.m-obj-8', deg: 60 },  // cube — clockwise
      ];
      rotShapes.forEach(({ sel, deg }) => {
        const el = manifestoScene.querySelector<HTMLElement>(sel);
        if (!el) return;
        const t = gsap.fromTo(
          el,
          { rotate: -deg / 2 },
          {
            rotate: deg / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: manifestoScene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });
    }

    // ---- Stats count-up ----
    document.querySelectorAll<HTMLElement>('.dx-v3 .stat .num[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count ?? '0', 10);
      const valEl = el.querySelector<HTMLElement>('.value');
      if (!valEl) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          end: 'top 40%',
          scrub: true,
          onUpdate: (self) => {
            valEl.textContent = Math.floor(self.progress * target).toLocaleString();
          },
        })
      );
    });


    // ---- Section meta (.num + .meta) — quiet fade for the labels above
    // and beside each section headline. The h2 itself gets the char
    // cascade (see "Per-character split" block below), so we don't
    // animate the parent .sec-head — that would hide the split chars.
    gsap.utils
      .toArray<HTMLElement>('.dx-v3 .sec-head .num, .dx-v3 .sec-head .meta')
      .forEach((el) => {
        const t = gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });

    // ---- Capabilities intro: signature character cascade ----
    // The headline letters drop into place one-by-one with a slight rotate.
    // This is the loudest reveal on the page — meant to anchor the section.
    const capsHeadChars = document.querySelectorAll<HTMLElement>(
      '.dx-v3 .caps-intro h2 .ch'
    );
    if (capsHeadChars.length) {
      const t = gsap.fromTo(
        capsHeadChars,
        { yPercent: 130, opacity: 0, rotate: 8 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.016,
          scrollTrigger: {
            trigger: '.dx-v3 .caps-intro h2',
            start: 'top 82%',
            once: true,
          },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    }
    // Caps meta (label + lead) fade up under the headline as a quieter beat.
    const capsMeta = document.querySelectorAll<HTMLElement>(
      '.dx-v3 .caps-intro .num, .dx-v3 .caps-intro .lead'
    );
    if (capsMeta.length) {
      const t = gsap.fromTo(
        capsMeta,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.dx-v3 .caps-intro',
            start: 'top 75%',
            once: true,
          },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    }

    // ---- Capabilities: orbit-tiles infinite-loop, scroll-scrubbed ----
    // All tiles share grid-area 1/1 and orbit around the frame's center.
    // .caps-orbit-frame is position:sticky so it stays put while the tall
    // .caps-orbit-stack scrolls past. Scroll progress drives a global
    // angle; each tile's position on the ring is baseAngle - globalAngle.
    // Cos of that angle = "frontness" (1 = focused / front, -1 = back),
    // which we map to scale, opacity, blur, and z-index for the depth.
    const orbitStack = document.querySelector<HTMLElement>('.dx-v3 .caps-orbit-stack');
    const orbitFrame = document.querySelector<HTMLElement>('.dx-v3 .caps-orbit-frame');
    const orbitTiles = gsap.utils.toArray<HTMLElement>('.dx-v3 [data-orbit-tile]');
    if (orbitStack && orbitFrame && orbitTiles.length) {
      const count = orbitTiles.length;
      const step = (Math.PI * 2) / count;

      // Read the orbit ellipse dimensions from CSS custom properties so
      // designers can tune the path without touching JS. Defaults give a
      // wide-and-shallow ellipse — tiles drift horizontally with a
      // gentle vertical arc, which reads more like a carousel-with-depth
      // than a perfect circle.
      const readRadii = () => {
        const style = getComputedStyle(orbitFrame);
        const rx = parseFloat(style.getPropertyValue('--orbit-rx')) || window.innerWidth * 0.28;
        const ry = parseFloat(style.getPropertyValue('--orbit-ry')) || 90;
        return { rx, ry };
      };
      let { rx, ry } = readRadii();

      const applyTransforms = (progress: number) => {
        const globalAngle = progress * Math.PI * 2;
        orbitTiles.forEach((tile, i) => {
          // Subtract globalAngle so tiles flow in the natural scroll
          // direction (scroll down → tile cycles to the front).
          const angle = i * step - globalAngle;
          const x = Math.sin(angle) * rx;
          const y = Math.cos(angle) * ry;
          const front = (Math.cos(angle) + 1) / 2; // 0..1
          const scale = 0.55 + 0.45 * front;
          const opacity = 0.25 + 0.75 * front;
          gsap.set(tile, {
            x,
            y,
            scale,
            opacity,
            ...(isMobile ? {} : { filter: `blur(${(10 * (1 - front)).toFixed(2)}px)` }),
            zIndex: Math.round(front * 100),
          });
        });
      };

      // Initial layout so tiles aren't piled at 0,0 before first scroll.
      applyTransforms(0);

      const orbitTrigger = ScrollTrigger.create({
        trigger: orbitStack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onRefresh: () => {
          ({ rx, ry } = readRadii());
        },
        onUpdate: (self) => applyTransforms(self.progress),
      });
      triggers.push(orbitTrigger);
    }

    // ---- Decorative rects: strong parallax ----
    // Each rect uses its section as the scrub window so the full section
    // scroll drives the movement. Large y values (-180 to -380) make the
    // depth layers clearly visible. Odd-indexed rects move slower, even
    // move faster — this gives the staggered "floating layers" look.
    //
    // Final-section rects get a dedicated trigger on the surrounding .dx-v3
    // wrapper (the full page scroll range) rather than the sticky .final
    // section itself. A sticky element's document top/bottom barely moves so
    // the section-scoped trigger scrubs almost nothing; the wrapper trigger
    // gives the full scroll timeline depth.
    const finalSectionEl = document.querySelector<HTMLElement>('.dx-v3 .final');
    gsap.utils.toArray<HTMLElement>('.dx-v3 .deco-rect').forEach((rect, i) => {
      const speeds = [560, 320, 480, 260, 420, 360, 540, 300, 450, 380];
      const yMove = -(speeds[i % speeds.length]);
      const isFinal = finalSectionEl?.contains(rect);
      const trigger = isFinal
        ? (document.querySelector('.dx-v3') as Element)
        : (rect.closest('section') ?? rect.parentElement) as Element;
      const start = isFinal ? 'bottom bottom' : 'top bottom';
      const end   = isFinal ? 'bottom top'    : 'bottom top';
      const t = gsap.to(rect, {
        y: yMove,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: 0.5,
        },
      });
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

    // ---- Features: scroll-scrubbed cascading slider ----
    const cascadePinStack = document.querySelector<HTMLElement>(
      '.dx-v3 .cascade-pin-stack'
    );
    if (cascadePinStack) {
      const slides = Array.from(
        cascadePinStack.querySelectorAll<HTMLElement>('[data-cascading-slide]')
      );
      const currentLabel = cascadePinStack.querySelector<HTMLElement>('.cascade-current');
      const totalLabel = cascadePinStack.querySelector<HTMLElement>('.cascade-total');
      if (totalLabel) totalLabel.textContent = String(slides.length).padStart(2, '0');

      let slideW = slides[0]?.offsetWidth || 400;
      const layoutCascade = (cursor: number) => {
        if (!slides.length) return;
        const peek = Math.min(70, Math.max(36, slideW * 0.13));
        const gap = 12;
        const innerStep = peek + 6;

        slides.forEach((slide, i) => {
          const distance = i - cursor;
          const absDist = Math.abs(distance);
          const t = Math.min(1, absDist);
          const beyond = absDist - t;

          let x: number;
          let clipL: number;
          let clipR: number;
          if (distance >= 0) {
            x = (slideW + gap) * t + beyond * innerStep;
            clipL = 0;
            clipR = (slideW - peek) * t;
          } else {
            x = -((slideW + gap) * t + beyond * innerStep);
            clipL = (slideW - peek) * t;
            clipR = 0;
          }
          const zIndex = 50 - Math.floor(absDist);

          gsap.set(slide, {
            x,
            '--clip-l': clipL,
            '--clip-r': clipR,
            zIndex,
          } as gsap.TweenVars);

          const isActive = absDist < 0.5;
          slide.classList.toggle('is-active', isActive);
          slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        if (currentLabel) {
          const rounded = Math.min(slides.length, Math.round(cursor) + 1);
          currentLabel.textContent = String(rounded).padStart(2, '0');
        }
      };

      layoutCascade(0);

      const cascadeTrigger = ScrollTrigger.create({
        trigger: cascadePinStack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onRefresh: () => {
          slideW = slides[0]?.offsetWidth || 400;
        },
        onUpdate: (self) => {
          const cursor = self.progress * (slides.length - 1);
          layoutCascade(cursor);
        },
      });
      triggers.push(cascadeTrigger);
    }

    // ---- Pains: rectangle entrance (neu-ad.jp style) ----
    // Each question rises from y:60 staggered as the section scrolls up.
    // Only y is animated here; the spotlight below controls opacity/scale.
    gsap.utils.toArray<HTMLElement>('.dx-v3 .pains-section .pain').forEach((el, i) => {
      const t = gsap.fromTo(
        el,
        { y: 60 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.dx-v3 .pains-pin-stack',
            start: `top ${88 - i * 7}%`,
            end: `top ${62 - i * 7}%`,
            scrub: 0.7,
          },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

    // ---- Pains: scroll-scrubbed spotlight ----
    // .pains-pin-stack is a tall scroll runway; .pains-pin-frame is
    // position:sticky inside it so the questions stay on-screen while
    // scrolling. A "focus cursor" walks from 0 → (count-1) as scroll
    // progresses. Each question's opacity/scale/blur is driven by how
    // close the cursor is to it — the focused question is sharp and
    // bright, neighbours dim and blur out.
    const pinStack = document.querySelector<HTMLElement>('.dx-v3 .pains-pin-stack');
    const pains = gsap.utils.toArray<HTMLElement>('.dx-v3 .pains-pin-frame .pain');
    const painSelector = document.querySelector<HTMLElement>(
      '.dx-v3 .pains-pin-frame .pain-selector'
    );
    if (pinStack && pains.length) {
      const count = pains.length;
      const clamp = (v: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      // Selector padding around each .q box.
      const SEL_PAD_X = 16;
      const SEL_PAD_Y = 10;

      // Compute a .q element's untransformed position relative to its
      // .pains-list parent. Walks the offsetParent chain so it survives
      // any GSAP scale transforms applied to the parent .pain.
      const measureQ = (q: HTMLElement) => {
        let top = 0;
        let left = 0;
        let el: HTMLElement | null = q;
        while (el && !el.classList.contains('pains-list')) {
          top += el.offsetTop;
          left += el.offsetLeft;
          el = el.offsetParent as HTMLElement | null;
        }
        return {
          top,
          left,
          width: q.offsetWidth,
          height: q.offsetHeight,
        };
      };

      // Pre-cache .q element references and computed positions so applyFocus
      // doesn't query the DOM or traverse offsetParent on every scroll frame.
      const painQEls = pains.map((p) => p.querySelector<HTMLElement>('.q'));
      const qRects: { top: number; left: number; width: number; height: number }[] = painQEls.map(
        (q) => (q ? measureQ(q) : { top: 0, left: 0, width: 0, height: 0 })
      );

      const applyFocus = (progress: number) => {
        // Spread the focus cursor from 0 to count-1 across the pin.
        const cursor = progress * (count - 1);
        pains.forEach((el, i) => {
          const distance = Math.abs(cursor - i);
          // Focus weight: 1 at the cursor, 0 once a full slot away.
          const focus = clamp(1 - distance, 0, 1);
          // Reveal: 1 once the cursor has reached (or nearly reached)
          // this item; 0 before it enters. Items below the cursor fade
          // back in slightly, never fully disappearing once revealed.
          const reveal = clamp(cursor - i + 1, 0, 1);
          const opacity = reveal * (0.22 + focus * 0.78);
          const scale = 0.94 + focus * 0.08;
          if (isMobile) {
            gsap.set(el, { opacity, scale });
          } else {
            const blur = (1 - focus) * 2.2;
            gsap.set(el, { opacity, scale, filter: `blur(${blur.toFixed(2)}px)` });
          }
        });

        // Corner-bracket selector — lerp between the cursor's two
        // bracketing questions so the box smoothly slides AND resizes
        // as the cursor walks down the list. Opacity is tied directly
        // to scroll progress (fades in over the first 5% of the pin)
        // so the brackets are guaranteed invisible at progress=0,
        // regardless of whether ScrollTrigger fires onUpdate at the
        // pre-pin state. Earlier we tried gating with a revealSelector
        // flag, but ScrollTrigger fires its initial onUpdate with
        // progress=0 on create/refresh and that re-set opacity to 1
        // before the user had scrolled in.
        if (painSelector) {
          const idxA = clamp(Math.floor(cursor), 0, count - 1);
          const idxB = clamp(idxA + 1, 0, count - 1);
          const t = cursor - idxA;
          if (painQEls[idxA] && painQEls[idxB]) {
            const a = qRects[idxA];
            const b = qRects[idxB];
            const top = lerp(a.top, b.top, t);
            const left = lerp(a.left, b.left, t);
            const width = lerp(a.width, b.width, t);
            const height = lerp(a.height, b.height, t);
            gsap.set(painSelector, {
              top: top - SEL_PAD_Y,
              left: left - SEL_PAD_X,
              width: width + SEL_PAD_X * 2,
              height: height + SEL_PAD_Y * 2,
              opacity: clamp(progress * 20, 0, 1),
            });
          }
        }
      };

      // Seed initial layout so items aren't all full-opacity before
      // the first scroll event fires. progress=0 → opacity=0 so the
      // corner-bracket selector stays hidden until the user actually
      // scrolls into the pains section.
      applyFocus(0);

      const pinTrigger = ScrollTrigger.create({
        trigger: pinStack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: () => {
          painQEls.forEach((q, i) => {
            qRects[i] = q ? measureQ(q) : { top: 0, left: 0, width: 0, height: 0 };
          });
        },
        onUpdate: (self) => applyFocus(self.progress),
      });
      triggers.push(pinTrigger);
    }

    // ---- Cases: overlapping scroll-scrubbed slider ----
    // All cards stack at the same position. Scroll progress drives a
    // continuous "active index" — at progress 0 card 0 is front, at
    // progress 1 the last card is front. Past cards slide out to the
    // left with fade+shrink; upcoming cards peek behind the active
    // one to the right with reduced scale and opacity.
    const casesStack = document.querySelector<HTMLElement>('.dx-v3 .cases-slider-stack');
    const caseCards = gsap.utils.toArray<HTMLElement>('.dx-v3 [data-case-card]');
    if (casesStack && caseCards.length) {
      const N = caseCards.length;

      const applyCases = (progress: number) => {
        const active = progress * (N - 1);
        caseCards.forEach((card, i) => {
          const rel = i - active;
          let xPercent: number, scale: number, opacity: number, zIndex: number;
          if (rel <= 0) {
            // current or past — slides off to the left as it ages out.
            xPercent = rel * 70;
            scale = 1 + rel * 0.1;
            opacity = Math.max(0, 1 + rel * 1.2);
            zIndex = 20 + Math.round(rel * 4);
          } else {
            // upcoming — peeks behind active to the right.
            xPercent = 6 + rel * 5;
            scale = Math.max(0.7, 1 - rel * 0.08);
            opacity = Math.max(0, 0.7 - rel * 0.22);
            zIndex = 20 - Math.round(rel * 4);
          }
          gsap.set(card, { xPercent, scale, opacity, zIndex });
        });
      };

      applyCases(0);
      const casesTrigger = ScrollTrigger.create({
        trigger: casesStack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyCases(self.progress),
      });
      triggers.push(casesTrigger);
    }

    gsap.utils
      .toArray<HTMLElement>('.dx-v3 .rpa-trio .item, .dx-v3 .rpa-card')
      .forEach((el) => {
        const t = gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 60%', scrub: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });

    // ---- AI section ----
    const aiHeadTween = gsap.fromTo(
      '.dx-v3 .ai-headline',
      { scale: 0.85, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.dx-v3 .ai', start: 'top 80%', end: 'top 30%', scrub: true },
      }
    );
    if (aiHeadTween.scrollTrigger) triggers.push(aiHeadTween.scrollTrigger);
    const aiBodyTween = gsap.fromTo(
      '.dx-v3 .ai .body',
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.dx-v3 .ai', start: 'top 60%', end: 'top 20%', scrub: true },
      }
    );
    if (aiBodyTween.scrollTrigger) triggers.push(aiBodyTween.scrollTrigger);

    // ---- Final CTA — rectangle reveal (neu-ad.jp style) ----
    // Each content block rises from y:80 in sequence, scrubbed to scroll.
    [
      { sel: '.dx-v3 .final .label', start: 'top 88%', end: 'top 62%' },
      { sel: '.dx-v3 .final h2',     start: 'top 82%', end: 'top 52%' },
      { sel: '.dx-v3 .final .ja',    start: 'top 76%', end: 'top 46%' },
      { sel: '.dx-v3 .final .row',   start: 'top 70%', end: 'top 40%' },
    ].forEach(({ sel, start, end }) => {
      const t = gsap.fromTo(
        sel,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.dx-v3 .final', start, end, scrub: 0.8 } }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });
    const glowT = gsap.fromTo(
      '.dx-v3 #finalGlow',
      { scale: 0.6, opacity: 0.3 },
      { scale: 1.4, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '.dx-v3 .final', start: 'top bottom', end: 'bottom bottom', scrub: true } }
    );
    if (glowT.scrollTrigger) triggers.push(glowT.scrollTrigger);

    // ---- Per-character split on every section heading ----
    // juanmora.co uses GSAP SplitText (a paid plugin) to break headings
    // into character spans then cascade them. We do the same trick by
    // walking text nodes inside each h2 / .ai-headline / .final h2 and
    // wrapping each character in <span class="ch">. .ja and .meta
    // subtitles are skipped so the small Japanese subtext stays intact.
    const splitInto = (root: HTMLElement, skipSelector: string) => {
      const skipSet = new Set<Element>();
      if (skipSelector) {
        root.querySelectorAll(skipSelector).forEach((s) => skipSet.add(s));
      }
      // Already-split headings (caps-intro h2) carry .ch children — skip.
      if (root.querySelector('.ch')) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const tns: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) tns.push(n as Text);
      tns.forEach((tn) => {
        if (!tn.nodeValue || !tn.nodeValue.trim()) return;
        let p = tn.parentElement;
        let inSkip = false;
        while (p && p !== root) {
          if (skipSet.has(p)) {
            inSkip = true;
            break;
          }
          p = p.parentElement;
        }
        if (inSkip) return;
        const frag = document.createDocumentFragment();
        for (const c of tn.nodeValue) {
          const sp = document.createElement('span');
          if (/\s/.test(c)) {
            sp.className = 'sp';
            sp.textContent = ' ';
          } else {
            sp.className = 'ch';
            sp.textContent = c;
          }
          frag.appendChild(sp);
        }
        tn.parentNode?.replaceChild(frag, tn);
      });
    };

    // ---- Text scramble / decode effect (Osmo Supply pattern) ----
    // Each .ch span cycles through random glyphs at a fast tick rate,
    // then locks to its final letter after a short duration. Stagger
    // per char gives the "matrix decoding" cascade. Works on any
    // group of pre-split character spans.
    //
    // Per-script pools: each character only decodes through glyphs
    // that match its own script, so English chars only pass through
    // Latin letters (uppercase/lowercase preserved) and Japanese chars
    // only pass through hiragana/katakana. Without this the scramble
    // would mix box-drawing chars, katakana, and digits into every
    // word, which looked incoherent next to the clean editorial type.
    const SCRAMBLE_LATIN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const SCRAMBLE_LATIN_LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const SCRAMBLE_DIGIT = '0123456789';
    const SCRAMBLE_HIRA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    const SCRAMBLE_KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const pickGlyph = (finalChar: string): string => {
      const code = finalChar.charCodeAt(0);
      // Hiragana U+3040-309F
      if (code >= 0x3040 && code <= 0x309f) {
        return SCRAMBLE_HIRA[Math.floor(Math.random() * SCRAMBLE_HIRA.length)];
      }
      // Katakana U+30A0-30FF
      if (code >= 0x30a0 && code <= 0x30ff) {
        return SCRAMBLE_KATA[Math.floor(Math.random() * SCRAMBLE_KATA.length)];
      }
      // CJK kanji U+3400-9FFF — pool from kana (random kanji would be
      // a huge set and would change the apparent reading too wildly).
      if (code >= 0x3400 && code <= 0x9fff) {
        const pool = SCRAMBLE_HIRA + SCRAMBLE_KATA;
        return pool[Math.floor(Math.random() * pool.length)];
      }
      if (code >= 0x30 && code <= 0x39) {
        return SCRAMBLE_DIGIT[Math.floor(Math.random() * SCRAMBLE_DIGIT.length)];
      }
      if (code >= 0x41 && code <= 0x5a) {
        return SCRAMBLE_LATIN_UPPER[Math.floor(Math.random() * SCRAMBLE_LATIN_UPPER.length)];
      }
      if (code >= 0x61 && code <= 0x7a) {
        return SCRAMBLE_LATIN_LOWER[Math.floor(Math.random() * SCRAMBLE_LATIN_LOWER.length)];
      }
      // Punctuation, symbols, anything else — leave untouched.
      return finalChar;
    };
    const scrambleSpans = (
      charSpans: HTMLElement[],
      opts: { startDelay?: number; charDuration?: number; stagger?: number } = {}
    ) => {
      const startDelay = opts.startDelay ?? 0;
      const charDuration = opts.charDuration ?? 1.0;
      const stagger = opts.stagger ?? 0.05;
      const tickInterval = 0.055;

      charSpans.forEach((span, i) => {
        const finalChar = span.textContent ?? '';
        // Skip whitespace — let those settle silently
        if (!finalChar || /\s/.test(finalChar)) return;

        const startTime = startDelay + i * stagger;
        const ticks = Math.max(2, Math.floor(charDuration / tickInterval));

        for (let t = 0; t < ticks; t++) {
          gsap.delayedCall(startTime + t * tickInterval, () => {
            span.textContent = pickGlyph(finalChar);
          });
        }
        gsap.delayedCall(startTime + charDuration, () => {
          span.textContent = finalChar;
        });
      });
    };

    // Hero masthead rows — split into chars, then fire the scramble
    // immediately on page load. Previously this fired on first scroll,
    // but first-scroll is now the warp interstitial's trigger, so the
    // two would race. Firing on mount = visitor sees the decode on
    // landing, then scrolls to enter the warp.
    const heroRows = Array.from(
      document.querySelectorAll<HTMLElement>('.dx-v3 .masthead .row')
    );
    heroRows.forEach((row) => {
      if (!row.querySelector('.ch')) splitInto(row, '');
    });
    heroRows.forEach((row, i) => {
      const chars = Array.from(row.querySelectorAll<HTMLElement>('.ch'));
      if (!chars.length) return;
      scrambleSpans(chars, {
        startDelay: i * 0.18,
        stagger: 0.03,
        charDuration: 0.5,
      });
    });

    document
      .querySelectorAll<HTMLElement>('.dx-v3 .sec-head h2')
      .forEach((h) => {
        splitInto(h, '.ja, .meta');
        const charsArr = Array.from(h.querySelectorAll<HTMLElement>('.ch'));
        if (!charsArr.length) return;
        const t = gsap.fromTo(
          charsArr,
          { yPercent: 110, opacity: 0, rotate: 6 },
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.014,
            // Kick off the scramble at the same moment the fade-in
            // starts, so the chars decode while they rise into place.
            onStart: () =>
              scrambleSpans(charsArr, {
                stagger: 0.025,
                charDuration: 0.45,
              }),
            scrollTrigger: { trigger: h, start: 'top 82%', once: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });

    // ---- Draw-path-on-scroll (Osmo Supply pattern, free reimpl) ----
    // GSAP's DrawSVGPlugin is a paid Club plugin; the same effect is
    // achievable by setting the path's stroke-dasharray to its length,
    // its dashoffset to the same length (path invisible), then tweening
    // offset to 0 so the dash slides into view drawing the line.
    document
      .querySelectorAll<HTMLElement>('.dx-v3 [data-draw-scroll-wrap]')
      .forEach((wrap) => {
        const svg = wrap.querySelector<SVGSVGElement>('[data-draw-scroll-desktop]');
        if (!svg) return;
        // Multiple strands per wrapper are supported — each draws in
        // unison with the others as the user scrolls through the section.
        const paths = svg.querySelectorAll<SVGPathElement>('[data-draw-scroll-path]');
        if (!paths.length) return;
        // Trigger off the wrapper's sticky parent section, not the
        // wrapper itself. With sticky-stacked panels, the wrapper's
        // natural document position is above the user's view long
        // before the section is "visible", so we time the draw to the
        // section becoming fully covering ('top top') and finishing as
        // it begins to scroll out ('bottom top').
        const drawSection = wrap.closest('section') as HTMLElement | null;
        const drawTrigger = drawSection ?? wrap;

        paths.forEach((path) => {
          const len = path.getTotalLength();
          if (!len || !Number.isFinite(len)) return;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          const t = gsap.to(path, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: drawTrigger,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          if (t.scrollTrigger) triggers.push(t.scrollTrigger);
        });

        // Optional dot rides the FIRST strand as it draws (lead path).
        const dot = svg.querySelector<SVGCircleElement>('[data-draw-scroll-dot]');
        const ridePath = paths[0];
        if (dot && ridePath && !isMobile) {
          const rideLen = ridePath.getTotalLength();
          const dotTrigger = ScrollTrigger.create({
            trigger: drawTrigger,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
              const pt = ridePath.getPointAtLength(rideLen * self.progress);
              dot.setAttribute('cx', String(pt.x));
              dot.setAttribute('cy', String(pt.y));
            },
          });
          triggers.push(dotTrigger);
        }
      });

    // ---- Pixelated scroll-out transition (Osmo Supply pattern) ----
    // Builds a grid of pixel divs inside the [data-pixelated-scroll-...]
    // wrapper, then animates them in/out via a ScrollTrigger pinned to
    // the wrapper's <section>. Wrapped in gsap.matchMedia so the grid
    // rebuilds on viewport breakpoint changes (different col counts on
    // tablet/mobile) and is destroyed for users with reduced-motion.
    const pixelatedMM = gsap.matchMedia();
    pixelatedMM.add(
      {
        isDesktop: '(min-width: 992px)',
        isTablet: '(min-width: 768px) and (max-width: 991px)',
        isLandscape: '(min-width: 479px) and (max-width: 767px)',
        isMobile: '(max-width: 478px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        if (context.conditions?.reduceMotion) return;

        type PixInst = { wrapper: HTMLElement; tl: gsap.core.Timeline };
        const pixInstances: PixInst[] = [];

        const PANEL_CLASS = 'pixelated-scroll-transition__panel';
        const COLUMN_CLASS = 'pixelated-scroll-transition__col';
        const PIXEL_CLASS = 'pixelated-scroll-transition__pixel';

        const intOr = (raw: string | undefined, fallback: number) => {
          const n = parseInt(raw ?? '', 10);
          return Number.isFinite(n) ? n : fallback;
        };

        const getColumns = (w: HTMLElement) => {
          const base = intOr(w.dataset.columns, 12);
          if (window.matchMedia('(max-width: 478px)').matches)
            return intOr(w.dataset.columnsMobile, Math.max(4, Math.round(base * 0.4)));
          if (window.matchMedia('(max-width: 767px)').matches)
            return intOr(
              w.dataset.columnsLandscape,
              Math.max(6, Math.round(base * 0.6))
            );
          if (window.matchMedia('(max-width: 991px)').matches)
            return intOr(
              w.dataset.columnsTablet,
              Math.max(8, Math.round(base * 0.75))
            );
          return base;
        };
        const getRows = (w: HTMLElement) => intOr(w.dataset.rows, 6);
        const getMode = (w: HTMLElement) =>
          w.dataset.mode === 'reveal' ? 'reveal' : 'cover';

        const wrappers = document.querySelectorAll<HTMLElement>(
          '.dx-v3 [data-pixelated-scroll-transition]'
        );
        if (!wrappers.length) return;

        wrappers.forEach((wrapper) => {
          // Allow an explicit data-trigger selector (used by the fixed
          // overlay variant which lives at root, not inside the section
          // it's tied to). Fall back to closest <section> for inline
          // wrappers.
          const triggerSel = wrapper.dataset.trigger;
          const section = triggerSel
            ? document.querySelector<HTMLElement>(triggerSel)
            : (wrapper.closest('section') as HTMLElement | null);
          if (!section) return;
          const cols = getColumns(wrapper);
          const rows = getRows(wrapper);
          const mode = getMode(wrapper);

          // Build grid
          const panel = document.createElement('div');
          panel.classList.add(PANEL_CLASS);
          panel.setAttribute('data-pixelated-scroll-panel', '');
          const fragment = document.createDocumentFragment();
          for (let c = 0; c < cols; c++) {
            const col = document.createElement('div');
            col.classList.add(COLUMN_CLASS);
            col.setAttribute('data-pixelated-scroll-column', '');
            for (let r = 0; r < rows; r++) {
              const px = document.createElement('div');
              px.classList.add(PIXEL_CLASS);
              px.setAttribute('data-pixelated-scroll-pixel', '');
              col.appendChild(px);
            }
            fragment.appendChild(col);
          }
          panel.appendChild(fragment);
          wrapper.appendChild(panel);

          // Sort pixels by a noisy bottom-up priority for the stagger.
          // Cells lower in the grid fire first; small randomness +
          // a sin(c) wave gives the column-by-column digital ripple.
          const cellData: { element: HTMLElement; priority: number }[] = [];
          const columns = panel.querySelectorAll<HTMLElement>(
            '[data-pixelated-scroll-column]'
          );
          for (let r = 0; r < rows; r++) {
            columns.forEach((col, c) => {
              const px = col.children[r] as HTMLElement | undefined;
              if (!px) return;
              const dist = rows - 1 - r;
              const priority = dist * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30;
              cellData.push({ element: px, priority });
            });
          }
          cellData.sort((a, b) => a.priority - b.priority);
          const cells = cellData.map((d) => d.element);

          const fromAlpha = mode === 'cover' ? 0 : 1;
          const toAlpha = mode === 'cover' ? 1 : 0;
          const start =
            wrapper.dataset.scrollStart ??
            (mode === 'cover' ? 'bottom bottom' : 'top bottom');
          const end =
            wrapper.dataset.scrollEnd ??
            (mode === 'cover' ? 'bottom top' : 'top center');

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start,
              end,
              scrub: 0.3,
              invalidateOnRefresh: true,
            },
          });
          gsap.set(cells, { autoAlpha: fromAlpha });
          tl.to(cells, {
            autoAlpha: toAlpha,
            duration: 0.1,
            stagger: { amount: 1.5, from: 'start' },
            ease: 'none',
          });

          // Fade-out: only AFTER the cover phase has fully built up.
          // We trigger off the out-section's `top top` (when its top
          // pins to the viewport top — i.e., the hero has fully scrolled
          // out and the cover is at autoAlpha=1) and complete the fade
          // over the next 20vh of scroll. This keeps the hero entirely
          // covered by pixels at the moment it disappears, then quickly
          // dissolves them as the next panel takes over.
          const outSel = wrapper.dataset.outTrigger;
          if (outSel && mode === 'cover') {
            const outSection = document.querySelector<HTMLElement>(outSel);
            if (outSection) {
              const outTween = gsap.to(wrapper, {
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: outSection,
                  start: 'top top',
                  end: 'top -20%',
                  scrub: 0.3,
                  invalidateOnRefresh: true,
                },
              });
              if (outTween.scrollTrigger) {
                pixInstances.push({
                  wrapper,
                  tl: gsap.timeline().add(outTween),
                });
              }
            }
          }

          pixInstances.push({ wrapper, tl });
        });

        ScrollTrigger.refresh();

        return () => {
          pixInstances.forEach((inst) => {
            inst.tl.scrollTrigger?.kill();
            inst.tl.kill();
            inst.wrapper.querySelector('[data-pixelated-scroll-panel]')?.remove();
          });
        };
      }
    );

    // ---- Reveal + refresh sequence ----
    // Three deterministic moments to refresh ScrollTrigger and release the
    // flash guard. Each one handles a different class of "the page's true
    // height settled later than expected" hazard:
    //
    //   1. rAF after gsap.fromTo + ScrollTrigger.create:
    //      All initial states are now applied (gsap.fromTo immediately renders
    //      the from-vars). One animation frame gives the browser time to lay
    //      out with those transforms, then we refresh and release the guard.
    //      This is the moment the user finally sees the page — every animated
    //      element is in its starting state, never the final state.
    //
    //   2. document.fonts.ready:
    //      Fontshare/Google Fonts swap can land after step 1, reflowing every
    //      heading and shifting trigger positions down. Refresh recalculates
    //      against the swapped metrics.
    //
    //   3. window.load:
    //      Images (cases, manifesto PNGs) and Lottie JSON resolve after fonts.
    //      Their final intrinsic heights can shift the page another few
    //      hundred px. A final refresh here is the belt around the suspenders.
    let alive = true;
    let rafId = 0;
    const revealAndRefresh = () => {
      if (!alive) return;
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      // Remove the useLayoutEffect's opacity:0!important so GSAP can take
      // control of opacity on these elements.
      document
        .querySelectorAll<HTMLElement>('.dx-v3 .m-obj')
        .forEach((el) => el.style.removeProperty('opacity'));
      // Release the guard — all guard-hidden content becomes visible.
      // The CSS rule .dx-v3:not([data-flash-guard]) .atom-viewer picks up
      // immediately and fades the atom canvas in via keyframes.
      document.querySelector('.dx-v3')?.removeAttribute('data-flash-guard');
      // Signal the root #page-cover to fade out (it waits for this event).
      window.dispatchEvent(new Event('gift:logo-ready'));
      // GSAP applies autoAlpha:0 synchronously (before the browser can paint
      // the just-revealed guard state), then animates to 1. This means images
      // that haven't cached yet won't hard-snap; they fade in gracefully.
      gsap.fromTo(
        '.dx-v3 .m-obj',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }
      );
      // Drop the inline cover after all GSAP initial states are set.
      // React will process this update on its next render cycle — that extra
      // frame keeps the cover up while the browser transitions from the
      // CSS guard to the live page, eliminating any visible gap.
      setInlineCoverActive(false);
    };
    rafId = requestAnimationFrame(revealAndRefresh);

    document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });

    const onWindowLoad = () => {
      if (alive) ScrollTrigger.refresh();
    };
    if (document.readyState === 'complete') {
      // Already loaded — schedule via a short timeout so it lands after the
      // initial rAF reveal above, otherwise we'd refresh twice in the same
      // tick and waste the second call.
      window.setTimeout(onWindowLoad, 50);
    } else {
      window.addEventListener('load', onWindowLoad, { once: true });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('load', onWindowLoad);
      pixelatedMM.revert();
      triggers.forEach((t) => t.kill());
      if (lenisRaf) gsap.ticker.remove(lenisRaf);
      lenis?.destroy();
      // Re-arm the guard for the next mount of this route. Without this, a
      // back-then-forward navigation would mount with the attribute already
      // removed, defeating the guard on the second visit.
      document.querySelector('.dx-v3')?.setAttribute('data-flash-guard', '');
    };
  }, []);

  return (
    <div className="dx-v3" data-flash-guard="">
      {/* Inline flash guard — CSS-independent cover that blocks the first
          paint until revealAndRefresh has committed all GSAP initial states.
          Inline styles mean it works even when dx-v3.css hasn't applied yet
          (code-split CSS race on client-side navigation). setInlineCoverActive(false)
          is called at the end of revealAndRefresh; React removes this div on
          its next render cycle. On every remount useState(true) re-arms it. */}
      {inlineCoverActive && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#f5f7ff',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Emoji rain stage — fixed-position canvas the .imagine-cta pill
          spawns emoji into when clicked. Uses the same DOM class names
          as RecruitCta so the existing globals.css styles apply. */}
      <div
        ref={rainContainerRef}
        className="emoji-rain-container"
        aria-hidden="true"
      />

      <div className="progress" aria-hidden>
        <div className="bar" ref={progRef} />
      </div>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-stage">

          {/* BG scrolling Japanese words — z-index 0, behind canvas (z-index 1).
              Canvas is alpha:true so text shows through transparent areas. */}
          <div className="hero-bg" aria-hidden>
            {HERO_BG_LANES.map((lane, i) => {
              const doubled = [...lane.words, ...lane.words];
              return (
                <div
                  key={i}
                  className="hero-bg-lane"
                  style={{ animationDelay: `${lane.delay}s` }}
                >
                  <div
                    className={`hero-bg-track hero-bg-track--${lane.rtl ? 'rtl' : 'ltr'}`}
                    style={{ '--dur': `${lane.dur}s` } as React.CSSProperties}
                  >
                    {doubled.map((w, j) => (
                      <span
                        key={j}
                        className="hero-bg-word"
                        style={{ fontSize: lane.fs, color: 'rgba(11,19,64,0.18)' }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <WebGLBoundary fallback={<SvgLogoHero />}>
            <AtomViewer />
          </WebGLBoundary>

          <div className="hero-stage-inner">
            <div className="masthead">
              <div className="row r1">
                <span className="dx">AI</span>
                <em className="consulting">Ops.</em>
              </div>
              <div className="ja">
                <span className="rule" aria-hidden />
                <span className="ja-inner">Build it once. Run forever.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* INTRO */}
      <section className="intro">
        <div className="wrap">
          <div className="text" id="introText">
            <span className="word">Whatever</span> <span className="word">you</span>{' '}
            <button
              type="button"
              className="word accent imagine-cta"
              onClick={fireImagineRain}
            >
              imagine
            </button>
            ,{' '}
            <span className="word">we&rsquo;ll</span>{' '}
            <span className="word">make</span> <span className="word">it</span>{' '}
            <span className="word accent">run itself.</span>
          </div>
        </div>

        {/* Spline objects scene — sits BELOW the manifesto copy. */}
        <div className="manifesto-scene" aria-hidden="true">
          <span className="glow glow-1" />
          <span className="glow glow-2" />
          <span className="glow glow-3" />

          {/* 2D accent shapes — small blue dots / pills scattered
              through the scene. Drift up/down on scroll at different
              speeds to give the composition life. */}
          <span className="acc acc-dot acc-1" />
          <span className="acc acc-pill acc-2" />
          <span className="acc acc-dot acc-3" />
          <span className="acc acc-pill acc-4" />
          <span className="acc acc-dot acc-5" />
          <span className="acc acc-pill acc-6" />

          <img className="m-obj m-obj-1" src="/spline/cylinder.png" alt="" />
          <img className="m-obj m-obj-3" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-4" src="/spline/pill.png" alt="" />
          <img className="m-obj m-obj-5" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-6" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-7" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-8" src="/spline/cube2.png" alt="" />

          {/* Drawn-on-scroll wavy lines — weave through the cluster.
              Each path animates in via the existing draw-scroll JS
              (queries [data-draw-scroll-wrap]). preserveAspectRatio
              "none" lets the curves stretch with the scene size. */}
          <div className="m-flow" data-draw-scroll-wrap>
            <svg
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              data-draw-scroll-desktop
            >
              <path
                d="M 940 30 C 820 90, 880 220, 720 260 C 560 300, 600 420, 460 450 C 320 480, 340 560, 180 580"
                data-draw-scroll-path
              />
              <path
                d="M 60 540 C 200 460, 180 360, 320 320 C 460 280, 420 200, 540 140 C 660 80, 720 60, 820 40"
                data-draw-scroll-path
              />
              <path
                d="M 500 200 C 560 220, 600 280, 540 340 C 480 400, 540 460, 620 440"
                data-draw-scroll-path
              />
            </svg>
          </div>
        </div>

      </section>

      {/* STATS */}
      <section className="stats">
        <div className="wrap">
          <div className="row">
            <div className="stat">
              <div className="num" data-count="50">
                <span className="value">0</span>
                <small>社+</small>
              </div>
              <div className="lab">AIOps Support</div>
              <div className="ja">AI支援企業数</div>
            </div>
            <div className="stat">
              <div className="num" data-count="1000">
                <span className="value">0</span>
                <small>時間+</small>
              </div>
              <div className="lab">Hours Automated</div>
              <div className="ja">AIによる業務削減</div>
            </div>
            <div className="stat partner-stat">
              <div className="num">
                <em>Agent</em>Native
              </div>
              <div className="lab">AI-First Team</div>
              <div className="ja">AIネイティブチーム</div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES — vertical stack */}
      <section className="caps-section" id="capabilities">
        <div className="wrap">
          <div className="caps-intro">
            <h2>
              <Fragment>{splitChars('Four pillars. ')}</Fragment>
              <em>{splitChars('One platform.')}</em>
            </h2>
            <p className="lead">
              AIエージェント、インテリジェント自動化、LLMインテグレーション、リアルタイム監視。
              4つのAIOpsピラーを、ひとつのチームでワンストップ。
            </p>
          </div>

          {/* Orbit: tiles share grid-area 1/1 and orbit around a central
              point. GSAP scrubs the rotation against scroll. */}
          <div className="caps-orbit-stack">
            <div className="caps-orbit-frame">
              <div className="caps-orbit">
                {CAPABILITIES.map((c) => (
                  <article
                    key={c.id}
                    className={`orbit-tile ${c.color}${(c.video || c.lottie) ? ' has-video' : ''}`}
                    data-orbit-tile
                  >
                    <div className="cap-card">
                      <span className="rule" aria-hidden />
                      <div className="head">
                        <h3>
                          {c.title.split('\n').map((line, i, arr) => (
                            <span key={i}>
                              {line}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                        </h3>
                      </div>
                      <div className="body-wrap">
                        <p className="body">{c.body}</p>
                        <div className="tags">
                          {c.tags.map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {c.lottie ? (
                        <div className="cap-video">
                          <CapLottie src={c.lottie} />
                        </div>
                      ) : c.video ? (
                        <div className="cap-video">
                          <video
                            src={c.video}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-hidden
                          />
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAINS — scroll-scrubbed spotlight. Heading + questions both
          live INSIDE the pin frame so they stay locked together as a
          single composition; the "focus" cursor walks down the
          questions as the user scrolls. */}
      <section className="sec tinted pains-section">
        <div className="deco-rects" aria-hidden>
          <span className="deco-rect dr-p1" />
          <span className="deco-rect dr-p2" />
          <span className="deco-rect dr-p3" />
          <span className="deco-rect dr-p4" />
          <span className="deco-rect dr-p5" />
          <span className="deco-rect dr-p6" />
          <span className="deco-rect dr-p7" />
          <span className="deco-rect dr-p8" />
          <span className="deco-rect dr-p9" />
          <span className="deco-rect dr-p10" />
        </div>
        <div className="pains-pin-stack">
          <div className="pains-pin-frame">
            <div className="pains-pin-content">
              <div className="sec-head">
                <h2>
                  The questions <em>you ask</em>
                  <span className="ja">こんなお悩み、ありませんか？</span>
                </h2>
              </div>
              <div className="pains-list">
                {/* Corner-bracket selector that follows the scroll-cursor.
                    JS computes its position by lerping between adjacent
                    questions' .q bounding boxes. */}
                <div className="pain-selector" aria-hidden>
                  <span className="pain-br pain-br-tl" />
                  <span className="pain-br pain-br-tr" />
                  <span className="pain-br pain-br-bl" />
                  <span className="pain-br pain-br-br" />
                </div>
                {PAINS.map((p, i) => (
                  <div
                    key={p.n}
                    className="pain"
                    data-pain-idx={i}
                  >
                    <span className="n">{p.n}</span>
                    <span className="q">{p.q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="pain-end">
            <div className="arrow-down" />
            <div className="ans">
              All resolved by <em>AIOps.</em>
            </div>
            <div className="ja">その課題、AIOpsが解決します。</div>
          </div>
        </div>
      </section>

      {/* FEATURES — scroll-scrubbed cascading slider */}
      <section className="sec" id="features">
        <div className="wrap">
          <div className="sec-head">
            <h2>
              Six tools, <em className="whitespace-nowrap">one platform.</em>
              <span className="ja">AIOpsの機能</span>
            </h2>
          </div>
        </div>

        <div className="cascade-pin-stack">
          <div className="cascade-pin-frame">
            <div className="cascade-slider" data-cascading-slider-wrap>
              <div className="cascade-viewport" data-cascading-viewport>
                {FEATURES.map((f, i) => (
                  <article
                    key={f.id}
                    className="cascade-slide"
                    data-cascading-slide
                    data-slide-index={i}
                  >
                    <div className="cascade-card">
                      <div className="cascade-id">{f.id}</div>
                      <div className="cascade-ic">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3>{f.title}</h3>
                      <p>{f.body}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cascade-counter">
                <span className="cascade-current">01</span>
                <span className="cascade-sep">/</span>
                <span className="cascade-total">06</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section className="cases-wrap" id="cases">
        <div className="sec" style={{ paddingBottom: 0, background: 'var(--paper)' }}>
          <div className="wrap">
            <div className="sec-head">
              <h2>
                Real outcomes,
                <br />
                <em>real businesses.</em>
                <span className="ja">活用事例</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Overlapping scroll-scrubbed slider. Cards stack at the same
            position; scrolling advances which one is "front" while the
            neighbors peek behind with reduced scale + opacity. */}
        <div className="cases-slider-stack">
          <div className="cases-slider-pin">
            <div className="cases-slider-track">

        {/* Case 01 */}
        <div className="case-card" data-case-card><div className="case-block">
          <div className="left">
            <div className="label">Case 01 / Enterprise</div>
            <h3>
              AIエージェントが
              <br />
              サポートコストを70%削減
            </h3>
            <p className="desc">
              注文状況・返品・FAQ対応をこなすマルチエージェントシステムを構築。一次サポートは人手ゼロで完結し、対応品質も向上。
            </p>
            <div className="points">
              <div className="pt">
                <h4>800種類以上の問い合わせに対応</h4>
                <p>自然言語で適切なサブエージェントへルーティング。キーワードマッチング不要。</p>
              </div>
              <div className="pt">
                <h4>3秒以内にエスカレーション</h4>
                <p>信頼スコアが低下した時点で、シームレスに人間へ引き継ぎ。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 01 / ENTERPRISE</div>
              <img
                className="case-image"
                src="/img/cases/case1_50.png"
                alt="AIエージェントがサポートコストを70%削減"
                loading="lazy"
              />
            </div>
          </div>
        </div></div>

        {/* Case 02 */}
        <div className="case-card" data-case-card><div className="case-block">
          <div className="left">
            <div className="label">Case 02 / Finance</div>
            <h3>
              金融機関がAIで
              <br />
              法令遵守レポートを自動化
            </h3>
            <p className="desc">
              AIエージェントがトランザクションログを読み込み、異常を検出し、規制レポートを作成して朝の承認レビューに備える。
            </p>
            <div className="points">
              <div className="pt">
                <h4>リアルタイムの異常検知</h4>
                <p>LLMが毎時5万件以上のトランザクションをスキャンし、フラグを自動付与。</p>
              </div>
              <div className="pt">
                <h4>レポート作成を8時間→12分に短縮</h4>
                <p>エージェントが完全なコンプライアンスパックを起案・整形・ルーティング。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 02 / FINANCE</div>
              <img
                className="case-image"
                src="/img/cases/case_2_50.png"
                alt="金融機関がAIで法令遵守レポートを自動化"
                loading="lazy"
              />
            </div>
          </div>
        </div></div>

        {/* Case 03 */}
        <div className="case-card" data-case-card><div className="case-block">
          <div className="left">
            <div className="label">Case 03 / Operations</div>
            <h3>
              物流企業がゼロ増員で
              <br />
              AIファースト運営を実現
            </h3>
            <p className="desc">
              AIエージェントがスケジュール管理・サプライヤー連絡・例外処理を担当。運用チームは戦略業務に専念できる環境を構築。
            </p>
            <div className="points">
              <div className="pt">
                <h4>クロスシステムのデータ連携を自動化</h4>
                <p>ERP・CRM・サプライヤーポータルをひとつのプロンプトで統合。</p>
              </div>
              <div className="pt">
                <h4>例外対応時間を85%削減</h4>
                <p>AIトリアージが数秒でエッジケースを適切な担当者に振り分け。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 03 / OPERATIONS</div>
              <img
                className="case-image"
                src="/img/cases/case3_50.png"
                alt="物流企業がゼロ増員でAIファースト運営を実現"
                loading="lazy"
              />
            </div>
          </div>
        </div></div>

            </div>
          </div>
        </div>
      </section>

      {/* RPA */}
      <section className="rpa">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 64 }}>
            <div className="num">05 — AIOps × Agents</div>
            <h2>
              Agents in <em>action.</em>
              <span className="ja">AIが動かす業務基盤</span>
            </h2>
            <div className="meta">
              02 case
              <br />
              Agent Live
            </div>
          </div>

          <div className="rpa-cards">
            {RPA_CARDS.map((c, i) => (
              <article key={c.title} className="rpa-card">
                <div className="rpa-card-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="top">
                  <span className="pill">Agent</span>
                  <h4>{c.title}</h4>
                </div>
                <div className="lab">— 使用モデル・ツール</div>
                <div className="val">{c.tools}</div>
                <div className="lab">— 成果</div>
                <p className="res">{c.result}</p>
              </article>
            ))}
          </div>

          <div className="rpa-cap-head">
            <span className="rule" aria-hidden />
            <span>AIOpsで実現できること</span>
            <span className="rule" aria-hidden />
          </div>
          <div className="rpa-trio">
            {RPA_TRIO.map((t) => (
              <div key={t.title} className="item">
                <div className="ic">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d={t.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI EDGE */}
      <section className="ai">
        <div className="ai-ticker">
          <div className="strip">
            <span>AI&nbsp;FIRST</span>
            <span className="star">✦</span>
            <span>BUSINESS</span>
            <span className="star">✦</span>
            <span>RE-DESIGN</span>
            <span className="star">✦</span>
            <span>AI&nbsp;FIRST</span>
            <span className="star">✦</span>
            <span>BUSINESS</span>
            <span className="star">✦</span>
            <span>RE-DESIGN</span>
            <span className="star">✦</span>
          </div>
        </div>
        <div className="wrap">
          <div
            className="num"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.25em',
              color: '#fff',
              textTransform: 'uppercase',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ width: 32, height: 1, background: '#fff' }} />
            06 — Our Edge
          </div>
          <div className="ai-headline">
            AI&nbsp;<em>fully</em>
            <br />
            integrated.
          </div>
          <div className="ai-grid">
            <div className="ja-block">
              OUR EDGE
              <br />
              <span style={{ opacity: 0.7 }}>AIをフル活用</span>
              <br />
              <br />
              <span style={{ opacity: 0.55 }}>
                — 003 / Edge
                <br />
                — Process Re-design
                <br />— Day-to-day AI
              </span>
            </div>
            <div className="body">
              <p>
                GIFTの独自色は、<strong>AIエージェントを実業務に深く組み込んでいる</strong>ことです。
                自社でAIOpsを日常的に運用しているからこそ、クライアントの現場にも同じ水準の自律化を実装できます。
              </p>
              <p>
                ツールを並べるだけでは終わりません。<strong>エージェントが主役の業務プロセス再設計</strong>
                から一緒に取り組みます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final" id="contact">
        <div className="deco-rects" aria-hidden>
          <span className="deco-rect dr-c1" />
          <span className="deco-rect dr-c2" />
          <span className="deco-rect dr-c3" />
          <span className="deco-rect dr-c4" />
          <span className="deco-rect dr-c5" />
          <span className="deco-rect dr-c6" />
          <span className="deco-rect dr-c7" />
          <span className="deco-rect dr-c8" />
          <span className="deco-rect dr-c9" />
          <span className="deco-rect dr-c10" />
          <span className="deco-rect dr-c11" />
          <span className="deco-rect dr-c12" />
          <span className="deco-rect dr-c13" />
          <span className="deco-rect dr-c14" />
          <span className="deco-rect dr-c15" />
          <span className="deco-rect dr-c16" />
        </div>
        <div className="glow" id="finalGlow" />
        <div className="wrap">
          <div className="label">Get In Touch &nbsp;/&nbsp; お問い合わせ</div>
          <h2>
            Let&rsquo;s <em>build.</em>
          </h2>
          <p className="ja">一緒に、未来を構築しましょう。</p>
          <div className="row">
            <a href="/contact" className="btn primary">
              お問い合わせ
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
