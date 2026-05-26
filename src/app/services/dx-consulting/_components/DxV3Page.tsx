'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, Component, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

// Catches WebGL context-creation failures so a crashed 3D scene degrades
// to nothing rather than breaking the whole page.
class WebGLBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* suppress console noise */ }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}

// Hero3D mounts WebGL via React Three Fiber. R3F + Next.js App Router
// hits a Suspense hydration crash when rendered server-side, so import
// it dynamically with SSR disabled — the component only ever appears
// after client hydration.
const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });
// Particle-cloud version of the GIFT brand mark. Lives in the hero as a
// decorative background layer, with the masthead text floating above.
// GiftLogoFluid is the GPU-compute version (curl-noise advection on the
// GPU, ~16k particles in float textures). GiftLogoParticles is the older
// CPU spring-mass version, kept around as a fallback if the GPU sim
// misbehaves on a given device.
const GiftLogoFluid = dynamic(() => import('./GiftLogoFluid'), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GiftLogoParticles = dynamic(() => import('./GiftLogoParticles'), { ssr: false });
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
    title: 'LINE公式・\nLステップ構築',
    body: 'Lステップ公式認定パートナーとして、アカウント設計から配信運用、自動化フロー構築まで一貫してサポート。',
    tags: ['L-Step', 'Official LINE', 'Scenario'],
    lottie: '/lottie/animation.json',
  },
  {
    id: 'CAP_002',
    num: '02',
    color: 'color-blue',
    title: 'RPA・\n業務自動化',
    body: 'ハイブリッド構成（カスタム開発＋市販ツール）で、業務の反復作業を徹底的に自動化。CRMとLステップの自動連携など、運用フローまで設計します。',
    tags: ['RPA', 'Automation', 'Workflow'],
    lottie: '/lottie/datab-animation.json',
  },
  {
    id: 'CAP_003',
    num: '03',
    color: 'color-sky',
    title: 'AI導入・\n生成AI活用',
    body: '最新のAIツールを業務に深く組み込み、生産性を最大化。社内で日常的に活用しているからこそ、AI前提での業務プロセス再設計を提案します。',
    tags: ['Generative AI', 'LLM', 'Agents'],
    lottie: '/lottie/robot-animation.json',
  },
  {
    id: 'CAP_004',
    num: '04',
    color: 'color-deep',
    title: 'SaaS導入・\nCRM構築',
    body: '課題に合ったSaaSの選定・導入から、CRM設計まで。事業成長に直結する基盤づくりを、現場目線で支援します。',
    tags: ['SaaS', 'CRM', 'Integration'],
    lottie: '/lottie/saas-animation.json',
  },
];

const PAINS = [
  { n: 'Q.01', q: 'LINEで集客・売上を伸ばしたい' },
  { n: 'Q.02', q: 'メルマガ・DMの効果が落ちてきた' },
  { n: 'Q.03', q: 'LINEを活用したいが、構築方法がわからない' },
  { n: 'Q.04', q: '自分の業種にLINEは活かせるのか' },
];

const FEATURES = [
  {
    id: 'F.01',
    title: 'シナリオ配信',
    body: '事前に設定したタイミングと順序で一連のメッセージを自動配信。シナリオの分岐や時刻を細かく指定できます。',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    id: 'F.02',
    title: 'セグメント配信',
    body: '友だちのアンケート回答やリンククリックなどに応じて属性を設定。属性を絞って配信できます。',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'F.03',
    title: 'リマインド配信',
    body: '任意の日時から逆算してリマインダーを配信。お客様の予約忘れや直前のキャンセル防止に役立ちます。',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
  {
    id: 'F.04',
    title: '回答フォーム',
    body: 'アンケートや説明会のお申込みに利用可能。回答内容は友だちと紐づけて一覧で管理できます。',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'F.05',
    title: 'タグ管理',
    body: '性別・年代・興味から自由にタグを作成。友だちをグループ分けして、対象を絞って配信できます。',
    icon: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  },
  {
    id: 'F.06',
    title: '流入経路分析',
    body: '友だち追加用URL（QRコード）を複数発行し、流入数を分析。流入元を特定できます。',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

const RPA_TRIO = [
  {
    title: 'データ入力自動化',
    body: '手動でのデータ入力作業を排除。RPAが自動でCRMとLステップ間のデータを同期。',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    title: 'CRMデータの活用',
    body: 'CRMに蓄積された顧客データを配信施策にフル活用。セグメント精度が飛躍的に向上。',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  },
  {
    title: '情報同期管理',
    body: '複数システムの情報を統一管理。データの不整合や二重入力の問題を解消。',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
];

const RPA_CARDS = [
  {
    title: '歯科クリニック',
    tools: 'セールスフォース × Lステップ',
    result: '10分おきに自動で予約情報を確認しCRMに入力。手動作業の工数を大幅に削減。',
  },
  {
    title: '光回線コールセンター',
    tools: 'キントーン × Lステップ',
    result: 'CRM内の顧客情報をLステップへインポートする作業を自動化。オペレーターの負担を軽減。',
  },
];

// ============================================================
// Emoji rain pulled from RecruitCta — same Osmo Supply pattern.
// Fires when the user clicks the "imagine" pill in the intro line.
const IMAGINE_EMOJIS = ['✨', '💡', '🚀'];

export default function DxV3Page() {
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
  // The [data-flash-guard] attribute (paired with a visibility:hidden rule in
  // dx-v3.css) keeps the whole .dx-v3 surface invisible during this window so
  // that even if React/Next's commit→paint timing slips and the page paints
  // once before useLayoutEffect runs (concurrent rendering quirk), the user
  // never sees the manifesto-scene PNGs at the previous page's scroll Y.
  // Removing the attribute here un-hides the page in the same synchronous
  // pre-paint pass, so there's no perceptible delay before the hero appears.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document
      .querySelectorAll<HTMLElement>('.dx-v3 .m-obj')
      .forEach((el) => el.style.setProperty('opacity', '0', 'important'));
    document.querySelector('.dx-v3')?.removeAttribute('data-flash-guard');
  }, []);

  // ----- All scroll-driven animations (single useEffect to share state) -----
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];

    // Belt-and-suspenders scroll reset in case Next.js scroll restoration fires
    // between useLayoutEffect and useEffect (e.g., history.back() path).
    window.scrollTo(0, 0);

    // Reveal manifesto PNG objects now that GSAP is in control of their
    // transform. The useLayoutEffect above set opacity:0!important to prevent
    // the flash-on-navigation; removing it here lets CSS opacity values apply.
    document
      .querySelectorAll<HTMLElement>('.dx-v3 .m-obj')
      .forEach((el) => el.style.removeProperty('opacity'));
    const isMobile = window.matchMedia('(max-width: 899px)').matches;

    // ---- Lenis smooth scroll (page-scoped: destroyed on unmount) ----
    // Lenis runs the actual page scroll through requestAnimationFrame, so the
    // motion is buttered. We hook ScrollTrigger.update into Lenis's scroll
    // event so all the GSAP triggers stay in sync.
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', () => ScrollTrigger.update());
    const lenisRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
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

    // ---- Features: scroll-scrubbed cascading slider ----
    // .cascade-pin-stack is a tall scroll runway (~60vh per slide); the
    // inner .cascade-pin-frame is position:sticky so the slider stays
    // pinned on-screen while the user scrolls through the runway. A
    // fractional "cursor" walks from 0 → (count-1) tied to scroll
    // progress, and each slide's x / --clip-l / --clip-r / z-index is
    // continuously interpolated based on its distance from the cursor.
    // The result: scroll = cards advance one by one through the cascade.
    const cascadePinStack = document.querySelector<HTMLElement>(
      '.dx-v3 .cascade-pin-stack'
    );
    const slideCleanups: Array<() => void> = [];
    if (cascadePinStack) {
      const slides = Array.from(
        cascadePinStack.querySelectorAll<HTMLElement>('[data-cascading-slide]')
      );
      const currentLabel = cascadePinStack.querySelector<HTMLElement>('.cascade-current');
      const totalLabel = cascadePinStack.querySelector<HTMLElement>('.cascade-total');
      if (totalLabel) totalLabel.textContent = String(slides.length).padStart(2, '0');

      let slideW = slides[0].offsetWidth || 400;
      const layoutCascade = (cursor: number) => {
        if (!slides.length) return;
        const peek = Math.min(70, Math.max(36, slideW * 0.13));
        const gap = 12;
        const innerStep = peek + 6;

        slides.forEach((slide, i) => {
          // distance can be fractional — that's what gives the smooth
          // mid-transition cascade as the cursor moves between slides.
          const distance = i - cursor;
          const absDist = Math.abs(distance);
          // t = 0..1 weight for "still acting like the active slide vs
          // becoming a sibling". Beyond 1 the slide is in pure-sibling
          // territory and just shifts by innerStep per additional unit.
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

      // Initial render so slides aren't piled at 0,0 before the first
      // scroll event fires.
      layoutCascade(0);

      const cascadeTrigger = ScrollTrigger.create({
        trigger: cascadePinStack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onRefresh: () => {
          slideW = slides[0].offsetWidth || 400;
        },
        onUpdate: (self) => {
          const cursor = self.progress * (slides.length - 1);
          layoutCascade(cursor);
        },
      });
      triggers.push(cascadeTrigger);
    }

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

    // ---- Final CTA ----
    [
      gsap.fromTo(
        '.dx-v3 .final h2',
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.dx-v3 .final', start: 'top 80%', end: 'top 30%', scrub: true },
        }
      ),
      gsap.fromTo(
        '.dx-v3 .final .ja',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.dx-v3 .final', start: 'top 60%', end: 'top 20%', scrub: true },
        }
      ),
      gsap.fromTo(
        '.dx-v3 .final .row',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.dx-v3 .final', start: 'top 50%', end: 'top 15%', scrub: true },
        }
      ),
      gsap.fromTo(
        '.dx-v3 #finalGlow',
        { scale: 0.6, opacity: 0.3 },
        {
          scale: 1.4,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.dx-v3 .final', start: 'top bottom', end: 'bottom bottom', scrub: true },
        }
      ),
    ].forEach((t) => {
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

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

    // Fonts (General Sans + JetBrains Mono) are loaded from external CDN
    // with display:swap. On Vercel production the swap happens AFTER GSAP
    // has already measured all trigger positions, shifting content down and
    // leaving ScrollTrigger with stale offsets. Refresh once fonts settle
    // so every trigger recalculates against the final laid-out positions.
    let fontsAlive = true;
    document.fonts.ready.then(() => {
      if (fontsAlive) ScrollTrigger.refresh();
    });

    return () => {
      fontsAlive = false;
      pixelatedMM.revert();
      triggers.forEach((t) => t.kill());
      slideCleanups.forEach((fn) => fn());
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="dx-v3" data-flash-guard="">
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
          {/* GIFT particle logo fills the hero. Igloo is hidden for now
              (kept in the imports/component tree so it's easy to re-introduce
              later when we find another home for it). */}
          <div className="absolute inset-0 z-0">
            <WebGLBoundary>
              <GiftLogoFluid />
            </WebGLBoundary>
          </div>
          <div className="hero-stage-inner">
            <div className="masthead">
              <div className="row r1">
                <span className="dx">DX</span>{' '}
                <em className="consulting">Consulting.</em>
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
              <div className="lab">DX Support</div>
              <div className="ja">DX支援企業数</div>
            </div>
            <div className="stat">
              <div className="num" data-count="1000">
                <span className="value">0</span>
                <small>時間+</small>
              </div>
              <div className="lab">Hours Saved</div>
              <div className="ja">RPAによる業務削減</div>
            </div>
            <div className="stat partner-stat">
              <div className="num">
                <em>Lstep</em>Certified
              </div>
              <div className="lab">Official Partner</div>
              <div className="ja">公式認定パートナー</div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES — vertical stack */}
      <section className="caps-section" id="capabilities">
        <div className="wrap">
          <div className="caps-intro">
            <h2>
              <Fragment>{splitChars('Four lanes. ')}</Fragment>
              <em>{splitChars('One team.')}</em>
            </h2>
            <p className="lead">
              LINE公式・Lステップ、RPA・業務自動化、AI活用、SaaS導入。
              4つの領域を、ひとつのチームでワンストップ。
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

      {/* MODELS SHOWCASE — the existing 3D scene (desk + monitor + GIFT
          logo on the screen), relocated from the hero to a dedicated
          section between capabilities and pains. */}
      <section className="models-showcase" id="models-showcase">
        <WebGLBoundary>
          <Hero3D />
        </WebGLBoundary>
      </section>

      {/* PAINS — scroll-scrubbed spotlight. Heading + questions both
          live INSIDE the pin frame so they stay locked together as a
          single composition; the "focus" cursor walks down the
          questions as the user scrolls. */}
      <section className="sec tinted pains-section">
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
              All resolved by <em>L-Step.</em>
            </div>
            <div className="ja">その課題、Lステップが解決します。</div>
          </div>
        </div>
      </section>

      {/* FEATURES — cascading slider (click prev/next or use arrow keys) */}
      <section className="sec" id="features">
        <div className="wrap">
          <div className="sec-head">
            <h2>
              Six tools, <em className="whitespace-nowrap">one platform.</em>
              <span className="ja">Lステップの機能</span>
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
            <div className="label">Case 01 / Telecom</div>
            <h3>
              光回線の開通手続きの
              <br />
              自動案内
            </h3>
            <p className="desc">
              開通までの手続きの流れをLステップのシナリオ機能でステップ配信。従来よりも問い合わせ対応の工数を大幅に削減。
            </p>
            <div className="points">
              <div className="pt">
                <h4>シナリオ配信を活用</h4>
                <p>進捗状況に合わせ、必要な手続きをステップごとに配信。</p>
              </div>
              <div className="pt">
                <h4>問い合わせ対応工数を削減</h4>
                <p>よくある質問をフォーム化。電話の問い合わせ数を削減。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 01 / TELECOM</div>
              <img
                className="case-image"
                src="/img/cases/wifi_2_50.png"
                alt="光回線の開通手続きの自動案内"
                loading="lazy"
              />
            </div>
          </div>
        </div></div>

        {/* Case 02 */}
        <div className="case-card" data-case-card><div className="case-block">
          <div className="left">
            <div className="label">Case 02 / Beauty</div>
            <h3>
              エステサロンの予約管理を
              <br />
              Lステップで一元化
            </h3>
            <p className="desc">
              LINEだけで簡単予約、前日リマインドで予約率の増加とキャンセル率の低下を実現。
            </p>
            <div className="points">
              <div className="pt">
                <h4>LINEから簡単予約</h4>
                <p>カレンダー予約機能で予約ページを作成。</p>
              </div>
              <div className="pt">
                <h4>リマインド配信でドタキャン防止</h4>
                <p>予約日時が近づくと自動で確認メッセージを配信。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 02 / BEAUTY</div>
              <img
                className="case-image"
                src="/img/cases/remainder_2_50.png"
                alt="エステサロンの予約管理をLステップで一元化"
                loading="lazy"
              />
            </div>
          </div>
        </div></div>

        {/* Case 03 */}
        <div className="case-card" data-case-card><div className="case-block">
          <div className="left">
            <div className="label">Case 03 / Local</div>
            <h3>
              地域限定のクーポン・
              <br />
              お得情報の配信
            </h3>
            <p className="desc">
              セグメント配信機能を活用し、地域限定のクーポンやお得情報を発信。
            </p>
            <div className="points">
              <div className="pt">
                <h4>属性ごとに分けて配信</h4>
                <p>友だちの属性に応じて配信内容を分岐。</p>
              </div>
              <div className="pt">
                <h4>配信コストの削減</h4>
                <p>絞り込み配信で無駄な配信を削減。ブロック率の低下にも貢献。</p>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="case-vis">
              <div className="badge">CASE 03 / LOCAL</div>
              <img
                className="case-image"
                src="/img/cases/coupon_2_50.png"
                alt="地域限定のクーポン・お得情報の配信"
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
            <div className="num">05 — RPA × L-Step</div>
            <h2>
              Connect <em>everything.</em>
              <span className="ja">Lステップを、さらに便利に</span>
            </h2>
            <div className="meta">
              02 case
              <br />
              RPA Live
            </div>
          </div>

          <div className="rpa-cards">
            {RPA_CARDS.map((c, i) => (
              <article key={c.title} className="rpa-card">
                <div className="rpa-card-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="top">
                  <span className="pill">RPA</span>
                  <h4>{c.title}</h4>
                </div>
                <div className="lab">— 使用ツール</div>
                <div className="val">{c.tools}</div>
                <div className="lab">— 成果</div>
                <p className="res">{c.result}</p>
              </article>
            ))}
          </div>

          <div className="rpa-cap-head">
            <span className="rule" aria-hidden />
            <span>RPAで実現できること</span>
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
                GIFTの独自色は、<strong>AIを業務に深く組み込んでいる</strong>ことです。
                最新のAIツールを社内で日常的に活用し、クライアントの業務にも同じ水準のAI活用を実装します。
              </p>
              <p>
                単なるツール導入ではなく、<strong>AI前提での業務プロセス再設計</strong>
                を提案します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final" id="contact">
        <div className="glow" id="finalGlow" />
        <div className="wrap">
          <div className="label">Get In Touch &nbsp;/&nbsp; お問い合わせ</div>
          <h2>
            Let&rsquo;s <em>build.</em>
          </h2>
          <p className="ja">最初の一歩は、30分の無料相談から。</p>
          <div className="row">
            <a href="/contact" className="btn primary">
              <span>無料相談を予約</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
