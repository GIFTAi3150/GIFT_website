'use client';

import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

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
const CAPABILITIES = [
  {
    id: 'CAP_001',
    num: '01',
    color: 'color-paper',
    title: 'LINE公式・\nLステップ構築',
    body: 'Lステップ公式認定パートナーとして、アカウント設計から配信運用、自動化フロー構築まで一貫してサポート。',
    tags: ['L-Step', 'Official LINE', 'Scenario'],
  },
  {
    id: 'CAP_002',
    num: '02',
    color: 'color-blue',
    title: 'RPA・\n業務自動化',
    body: 'ハイブリッド構成（カスタム開発＋市販ツール）で、業務の反復作業を徹底的に自動化。CRMとLステップの自動連携など、運用フローまで設計します。',
    tags: ['RPA', 'Automation', 'Workflow'],
  },
  {
    id: 'CAP_003',
    num: '03',
    color: 'color-sky',
    title: 'AI導入・\n生成AI活用',
    body: '最新のAIツールを業務に深く組み込み、生産性を最大化。社内で日常的に活用しているからこそ、AI前提での業務プロセス再設計を提案します。',
    tags: ['Generative AI', 'LLM', 'Agents'],
  },
  {
    id: 'CAP_004',
    num: '04',
    color: 'color-deep',
    title: 'SaaS導入・\nCRM構築',
    body: '課題に合ったSaaSの選定・導入から、CRM設計まで。事業成長に直結する基盤づくりを、現場目線で支援します。',
    tags: ['SaaS', 'CRM', 'Integration'],
  },
];

const PAINS = [
  { n: 'Q.01', q: 'LINEを活用して集客・売上を上げたい' },
  { n: 'Q.02', q: 'メルマガやDMの効果が下がってきている' },
  { n: 'Q.03', q: 'LINEをビジネスで活用したいが構築の仕方がわからない' },
  { n: 'Q.04', q: '自分の業種でもLINEを活用できるのか知りたい' },
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
export default function DxV3Page() {
  const heroRef = useRef<HTMLElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);

  // ----- All scroll-driven animations (single useEffect to share state) -----
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];

    // ---- Lenis smooth scroll (page-scoped: destroyed on unmount) ----
    // Lenis runs the actual page scroll through requestAnimationFrame, so the
    // motion is buttered. We hook ScrollTrigger.update into Lenis's scroll
    // event so all the GSAP triggers stay in sync.
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
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

    // ---- Manifesto scene: only the 2D accents drift on scroll ----
    // PNG parallax was removed — the offset-then-land motion meant
    // the cluster only "looked right" when the section sat at the
    // viewport center, and felt like the PNGs appeared late. Now
    // the PNGs sit at their CSS positions, fully formed from the
    // moment the section enters view. Accents still drift for life.
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

    // (capabilities is now a vertical stack — no pinned scroll needed)


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
            duration: 0.8,
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
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.025,
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
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.18,
          scrollTrigger: {
            trigger: '.dx-v3 .caps-intro',
            start: 'top 75%',
            once: true,
          },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    }

    // ---- Capabilities: horizontal pinned scroll ----
    // .caps-stack pins to the top of the viewport while .caps-track
    // (a wide flex row of the four cap-cards) gets translated left
    // by the same distance as its overflow. So vertical scroll input
    // becomes left-to-right card travel. Each card's content cascade
    // is then driven via `containerAnimation`, which re-scopes the
    // ScrollTrigger to fire based on the card's horizontal position
    // inside the pinned viewport (not its document position).
    const capsStack = document.querySelector<HTMLElement>('.dx-v3 .caps-stack');
    const capsTrack = document.querySelector<HTMLElement>('.dx-v3 .caps-track');
    const capRows = gsap.utils.toArray<HTMLElement>('.dx-v3 .cap-row');
    if (capsStack && capsTrack && capRows.length) {
      const getDistance = () =>
        Math.max(0, capsTrack.scrollWidth - window.innerWidth);

      const horizTween = gsap.to(capsTrack, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: capsStack,
          pin: true,
          scrub: 0.5,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      if (horizTween.scrollTrigger) triggers.push(horizTween.scrollTrigger);

      capRows.forEach((row) => {
        const card = row.querySelector<HTMLElement>('.cap-card');
        const rule = row.querySelector<HTMLElement>('.rule');
        const num = row.querySelector<HTMLElement>('.num');
        const label = row.querySelector<HTMLElement>('.label');
        const h3 = row.querySelector<HTMLElement>('h3');
        const body = row.querySelector<HTMLElement>('.body');
        const tags = row.querySelectorAll<HTMLElement>('.tag');

        gsap.set(card, { scale: 0.9, opacity: 0.5 });
        gsap.set(rule, { scaleX: 0 });
        gsap.set(num, { x: -60, y: 24, opacity: 0, rotate: -6, scale: 0.85 });
        gsap.set(label, { y: 18, opacity: 0 });
        gsap.set(h3, { y: 30, opacity: 0 });
        gsap.set(body, { y: 24, opacity: 0 });
        gsap.set(tags, { y: 12, opacity: 0, scale: 0.9 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            containerAnimation: horizTween,
            start: 'left 85%',
            end: 'left 30%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.to(card, { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0)
          .to(rule, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0)
          .to(
            num,
            { x: 0, y: 0, opacity: 1, rotate: 0, scale: 1, duration: 0.85, ease: 'expo.out' },
            0.1
          )
          .to(label, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
          .to(h3, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.35)
          .to(body, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.5)
          .to(
            tags,
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.06 },
            0.65
          );

        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });
    }

    // ---- Bento cells: scale-in stagger from the center outward ----
    // Cells expand as if popping out of a single point. Uses back.out
    // for an overshoot, which feels distinct from the linear fades.
    const bentoCells = gsap.utils.toArray<HTMLElement>('.dx-v3 .bento .cell');
    if (bentoCells.length) {
      const t = gsap.fromTo(
        bentoCells,
        { scale: 0.7, opacity: 0, y: 30 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'back.out(1.5)',
          stagger: { each: 0.07, from: 'center' },
          scrollTrigger: {
            trigger: '.dx-v3 .bento',
            start: 'top 78%',
            once: true,
          },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    }

    // ---- Pain rows: typewriter clip reveal ----
    // Each question wipes in left-to-right (clip-path inset) — looks like
    // it's being typed/printed onto the page, not just sliding.
    gsap.utils.toArray<HTMLElement>('.dx-v3 .pain').forEach((el, i) => {
      const t = gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.85,
          ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    });

    gsap.utils.toArray<HTMLElement>('.dx-v3 .case-block').forEach((b) => {
      const left = b.querySelector('.left');
      const right = b.querySelector('.right .case-vis');
      if (left) {
        const t = gsap.fromTo(
          left,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: b, start: 'top 80%', end: 'top 40%', scrub: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      }
      if (right) {
        const t = gsap.fromTo(
          right,
          { yPercent: 15, opacity: 0.4 },
          {
            yPercent: -10,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      }
      const bigNum = b.querySelector('.left .num');
      if (bigNum) {
        const t = gsap.fromTo(
          bigNum,
          { y: 80 },
          {
            y: -40,
            ease: 'none',
            scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      }
    });

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
    const scrambleGlyphs =
      '!<>-_\\/[]{}=+*^?#█▓░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const scrambleSpans = (
      charSpans: HTMLElement[],
      opts: { startDelay?: number; charDuration?: number; stagger?: number } = {}
    ) => {
      const startDelay = opts.startDelay ?? 0;
      const charDuration = opts.charDuration ?? 2.0;
      const stagger = opts.stagger ?? 0.09;
      const tickInterval = 0.09;

      charSpans.forEach((span, i) => {
        const finalChar = span.textContent ?? '';
        // Skip whitespace — let those settle silently
        if (!finalChar || /\s/.test(finalChar)) return;

        const startTime = startDelay + i * stagger;
        const ticks = Math.max(2, Math.floor(charDuration / tickInterval));

        for (let t = 0; t < ticks; t++) {
          gsap.delayedCall(startTime + t * tickInterval, () => {
            span.textContent =
              scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)];
          });
        }
        gsap.delayedCall(startTime + charDuration, () => {
          span.textContent = finalChar;
        });
      });
    };

    // Hero masthead rows — split immediately, but defer the scramble
    // animation until the user begins scrolling (fires once hero top
    // crosses 10px above viewport top = first ~10px of scroll).
    const heroRows = Array.from(
      document.querySelectorAll<HTMLElement>('.dx-v3 .masthead .row')
    );
    heroRows.forEach((row) => {
      if (!row.querySelector('.ch')) splitInto(row, '');
    });
    if (heroRows.length) {
      const heroT = ScrollTrigger.create({
        trigger: '.dx-v3 .hero',
        start: 'top top-=10',
        once: true,
        onEnter: () => {
          heroRows.forEach((row, i) => {
            const chars = Array.from(
              row.querySelectorAll<HTMLElement>('.ch')
            );
            if (!chars.length) return;
            scrambleSpans(chars, {
              startDelay: i * 0.7,
              stagger: 0.09,
              charDuration: 2.2,
            });
          });
        },
      });
      triggers.push(heroT);
    }

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
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.022,
            // Kick off the scramble at the same moment the fade-in
            // starts, so the chars decode while they rise into place.
            onStart: () =>
              scrambleSpans(charsArr, {
                stagger: 0.08,
                charDuration: 1.8,
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
        if (dot && ridePath) {
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

    return () => {
      pixelatedMM.revert();
      triggers.forEach((t) => t.kill());
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="dx-v3">
      <div className="progress" aria-hidden>
        <div className="bar" ref={progRef} />
      </div>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-stage">
          <div className="hero-stage-inner">
            <div className="masthead">
              <div className="row r1">業務を、変えずに</div>
              <div className="row r2">
                <em>事業を、変える。</em>
              </div>
              <div className="ja">
                <span className="rule" aria-hidden />
                <span className="ja-inner">Don&rsquo;t change operations. Change the business.</span>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="v">50<i>+</i></span>
              <span className="k">DX Supported</span>
            </div>
            <span className="hero-stat-sep" aria-hidden />
            <div className="hero-stat">
              <span className="v">1,000h<i>+</i></span>
              <span className="k">Hours Saved</span>
            </div>
            <span className="hero-stat-sep" aria-hidden />
            <div className="hero-stat">
              <span className="v">04</span>
              <span className="k">Capabilities</span>
            </div>
          </div>

          <div className="hero-foot">
            <div className="scroll-cue">Scroll · Index 01</div>
            <div className="partner">
              <span className="l">L</span>
              <span>L-Step Certified Partner</span>
            </div>
          </div>

        </div>
      </section>

      {/* INTRO */}
      <section className="intro">
        <div className="wrap">
          <div className="text" id="introText">
            <span className="word">Whatever</span> <span className="word">you</span>{' '}
            <span className="word accent">imagine,</span>{' '}
            <span className="word">we&rsquo;ll</span>{' '}
            <span className="word">make</span> <span className="word">it</span>{' '}
            <span className="word accent">run itself.</span>
          </div>
          <div className="intro-ja">
            あなたが描くビジネスを、自走するシステムへ。
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
          <img className="m-obj m-obj-2" src="/spline/car.png" alt="" />
          <img className="m-obj m-obj-3" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-4" src="/spline/pill.png" alt="" />
          <img className="m-obj m-obj-5" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-6" src="/spline/sphere.png" alt="" />
          <img className="m-obj m-obj-7" src="/spline/sphere.png" alt="" />

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
            <div className="num">01 — Capabilities</div>
            <h2>
              <Fragment>{splitChars('Four lanes. ')}</Fragment>
              <em>{splitChars('One team.')}</em>
            </h2>
            <p className="lead">
              LINE公式・Lステップ、RPA・業務自動化、AI活用、SaaS導入。
              4つの領域を、ひとつのチームでワンストップ。
            </p>
          </div>

          <div className="caps-stack">
            <div className="caps-track">
              {CAPABILITIES.map((c) => (
                <article key={c.id} className={`cap-row ${c.color}`}>
                  <div className="cap-card">
                    <span className="rule" aria-hidden />
                    <div className="num">{c.num}</div>
                    <div className="head">
                      <div className="label">{c.id}</div>
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
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAINS */}
      <section className="sec tinted">
        <div className="wrap">
          <div className="sec-head">
            <div className="num">02 — Challenges</div>
            <h2>
              The questions <em>you ask</em>
              <span className="ja">こんなお悩み、ありませんか？</span>
            </h2>
            <div className="meta">
              04 / Open
              <br />
              Resolved by L-Step
            </div>
          </div>

          <div className="pains-list">
            {PAINS.map((p) => (
              <div key={p.n} className="pain">
                <span className="n">{p.n}</span>
                <span className="q">{p.q}</span>
                <svg
                  className="arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M7 17L17 7M9 7h8v8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>

          <div className="pain-end">
            <div className="arrow-down" />
            <div className="ans">
              All resolved by <em>L-Step.</em>
            </div>
            <div className="ja">その課題、Lステップが解決します。</div>
          </div>
        </div>
      </section>

      {/* FEATURES — bento */}
      <section className="sec" id="features">
        <div className="wrap">
          <div className="sec-head">
            <div className="num">03 — Features</div>
            <h2>
              Six tools, <em>one platform.</em>
              <span className="ja">Lステップの機能</span>
            </h2>
            <div className="meta">
              06 modules
              <br />
              Built-in
            </div>
          </div>

          <div className="bento">
            {FEATURES.map((f) => (
              <div key={f.id} className="cell">
                <div className="id">{f.id}</div>
                <div className="ic">
                  <svg
                    width="22"
                    height="22"
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
            ))}
          </div>
        </div>
      </section>

      {/* CASES */}
      <section className="cases-wrap" id="cases">
        <div className="sec" style={{ paddingBottom: 0, background: 'var(--paper)' }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="num">04 — Case Studies</div>
              <h2>
                Real outcomes,
                <br />
                <em>real businesses.</em>
                <span className="ja">活用事例</span>
              </h2>
              <div className="meta">
                03 cases
                <br />
                Selected
              </div>
            </div>
          </div>
        </div>

        {/* Case 01 */}
        <div className="case-block">
          <div className="left">
            <div className="num">01</div>
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
              <div className="case-poster">
                <div className="big-num">01</div>
                <div className="theme">
                  <span className="en">TELECOM</span>
                  <span className="ja">通信</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case 02 */}
        <div className="case-block">
          <div className="left">
            <div className="num">02</div>
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
              <div className="case-poster">
                <div className="big-num">02</div>
                <div className="theme">
                  <span className="en">BEAUTY</span>
                  <span className="ja">美容</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case 03 */}
        <div className="case-block">
          <div className="left">
            <div className="num">03</div>
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
              <div className="case-poster">
                <div className="big-num">03</div>
                <div className="theme">
                  <span className="en">LOCAL</span>
                  <span className="ja">地域</span>
                </div>
              </div>
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
            <a href="/contact" className="btn ghost">
              <span>資料をダウンロード</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
