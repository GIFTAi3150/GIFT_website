// AIOps landing-page variants.
//
// Two LPs — A「人材系訴求」and B「社長待ち訴求」— selected by the manager on
// 2026-07-31 from a four-concept mock (C「AI先送り」and D「無料AI社員」were
// dropped). Full build plan: docs/aiops-lp-plan.md
//
// A and B are STRUCTURALLY IDENTICAL. Every difference between the two pages
// lives in this file: only the copy and the hero video change. The components
// under src/app/(lp)/lp/_components render whatever they are handed, so adding
// a third variant later is an entry here plus a slug — not a new page.
//
// ⚠️ ALL JAPANESE COPY IS THE MANAGER'S, TRANSCRIBED VERBATIM from his mock
// (11_aiops_lp_mock_variants.html). Do not "improve" the wording. In
// particular variant B calls the visiting president the blocker — he flagged
// that himself as 「やや強い言葉」 and chose it deliberately.
//
// ⚠️ The videos referenced below are PLACEHOLDERS pulled from the existing
// site; the mock labels them 「動画はサンプルです」. The manager's real CM
// videos replace them before launch. See docs/aiops-lp-plan.md §4.3 for the
// encode spec they have to meet.

export type LpStep = {
  title: string;
  /**
   * Authored line breaks for the card's display title. OPTIONAL — omit it and
   * the title wraps on its own.
   *
   * The card title is set at 30px, where the browser's own Japanese line
   * breaking will happily split 「エージェント」 mid-word. These arrays are the
   * manager's copy, unchanged, with the break points chosen by hand. The
   * concatenation MUST equal `title` exactly: `title` is what a screen reader
   * would otherwise get, and it is also the React key.
   */
  titleLines?: readonly string[];
  body: string;
};

export type LpLane = {
  /** Small uppercase marker above the lane name — 'now' / 'with gift'. */
  eyebrow: string;
  /** The lane's name, set large beside the nodes. */
  label: string;
  /**
   * The four stages, left to right. THE LAST ONE IS THE TERMINAL STATE and is
   * coloured differently by the component — red on the `bad` lane, LINE green
   * on the `good` lane. Keep it to exactly 4: the track is a 4-column grid
   * that folds to 2 then 1, and a 5th would break every breakpoint.
   */
  nodes: string[];
};

export type LpVariant = {
  slug: string;
  /** Internal name, for the review deck and for telling leads apart. */
  conceptName: string;
  /** <title>. These pages are noindex, so this is for the tab and for OG. */
  title: string;
  description: string;

  hero: {
    /** One line. Short and blunt — it has to land in 3 seconds. */
    h1: string;
    sub: string;
    /** In /public. Muted autoplay loop. */
    video: string;
    /** In /public. Rendered as the LCP image under the video. */
    poster: string;
  };

  flow: {
    /** One string per rendered line — the component does not auto-wrap these. */
    heading: string[];
    bad: LpLane;
    good: LpLane;
    /** The single large line under both lanes. */
    punch: string;
  };

  what: {
    heading: string[];
    lead: string;
    /** KEEP TO 3. The section is a ruled list sized for three rows. */
    steps: LpStep[];
  };
};

// The closing CTA is identical on both pages, so it lives in the component
// rather than being duplicated per variant. Kept here as the single place the
// offer copy is written down, since it is a real commercial commitment.
//
// ⚠️ 「無料でAIエージェントプレゼント！」 IS AN ACTUAL OFFER, not a slogan.
// Confirm it is approved before either page goes live.
export const LP_CTA = {
  eyebrow: 'free ai agent',
  heading: ['無料でAIエージェント', 'プレゼント！'],
  body: '御社で任せられる業務があるか、公式LINEから面談で確認します。',
  button: '公式LINEで面談する',
  /**
   * ⚠️ HARD BLOCKER FOR LAUNCH. This is the only conversion point on either
   * page. The mock left it as '#'. Replace with the real 公式LINE URL, and
   * fire the ad-platform conversion event before navigating.
   */
  href: '#',
} as const;

export const LP_VARIANTS: Record<string, LpVariant> = {
  'ai-staff': {
    slug: 'ai-staff',
    conceptName: 'A案 人材系訴求',
    title: 'また、辞めましたか。｜無料AIエージェント',
    description:
      '採用して、教えて、辞められる。その繰り返しを止めるために、繰り返しの業務をAIに残しませんか。公式LINEから無料で面談できます。',
    hero: {
      h1: 'また、辞めましたか。',
      sub: '採用して、教えて、辞められる。その繰り返し、いつまで続けますか。',
      // The finished "video2" cut for this concept, completed 2026-08-03.
      // The earlier 30s version was problem-only and ended on the smashed
      // monitor; this one adds the resolution — a colleague sets down a laptop,
      // the report completes itself, the paper mountain is gone — plus the
      // burned-in vertical JP telop. 43.4s.
      //
      // Re-encoded for the web the same way as B: 64.7MB → 3.6MB, 1280×722
      // H.264 CRF 28, AAC 96k (audio KEPT — the hero's sound toggle needs a
      // track to unmute), +faststart.
      //   master export:    C:\Users\owner\Desktop\video img\video2\video2-v2.mp4
      //   premiere project: C:\Users\owner\Desktop\video img\video1\video2.prproj
      //                     (yes, video1 — the project file lives in the wrong folder)
      //
      // ⚠️ Audio pass still outstanding: each source clip carries its own
      // AI-generated room tone, so the background shifts at every cut, and there
      // is no music bed. Inaudible on arrival since the hero autoplays muted,
      // but audible to anyone who uses the sound toggle.
      video: '/video/lp-video2.mp4',
      poster: '/img/lp-video2-poster.jpg',
    },
    flow: {
      heading: ['採用しても、また止まる。', 'AIなら、仕事が会社に残る。'],
      bad: {
        eyebrow: 'now',
        label: 'また繰り返す',
        nodes: ['求人を出す', '面接する', '教える', '辞める'],
      },
      good: {
        eyebrow: 'with gift',
        label: '会社に残る',
        nodes: ['業務を決める', 'AIが覚える', '同じ品質で返す', '辞めない'],
      },
      punch: '人を増やす前に、繰り返しの仕事をAIに残す。',
    },
    what: {
      heading: ['私たちは、AIを', '御社の社員にします。'],
      lead: 'AIツールを渡すだけでは働きません。会社の資料、過去対応、商品、判断基準を整理して、AIが使える状態にします。',
      steps: [
        {
          title: '任せる業務を1つ決める',
          titleLines: ['任せる業務を', '1つ決める'],
          body: '問い合わせ、見積、議事録、資料探しなど、面談で候補を絞ります。',
        },
        {
          title: '会社の文脈をAIに教える',
          titleLines: ['会社の文脈を', 'AIに教える'],
          body: '過去資料、対応履歴、社長の判断基準をAIが使える形にします。',
        },
        {
          title: '無料AIエージェントとして試す',
          titleLines: ['無料AIエージェント', 'として試す'],
          body: 'まず1業務で動かし、御社で使えるかを確認します。',
        },
      ],
    },
  },

  president: {
    slug: 'president',
    conceptName: 'B案 社長待ち訴求',
    title: 'ブロッカーですよね、あなた。｜無料AIエージェント',
    description:
      '社員の手が止まるたびに、社長の名前が出る。社長の判断基準をAIに渡して、確認待ちを減らしませんか。公式LINEから無料で面談できます。',
    hero: {
      h1: 'ブロッカーですよね、あなた。',
      sub: '社員の手が止まるたびに、社長の名前が出る。それ、会社の知識が社長に集まりすぎています。',
      // The manager's real CM (video1), re-encoded for the web 2026-07-31:
      // 65MB → 4.2MB. The source was 1916×1080 @ 15Mbps with an AAC track —
      // fine for Premiere, unusable as a muted autoplay hero, since a phone on
      // 4G would never reach the first frame. Now 1280×722 H.264 CRF 28, audio
      // stream REMOVED (the element is permanently muted), +faststart so
      // playback can begin before the file finishes downloading.
      // Original untouched at C:\Users\owner\Desktop\video img\video1\video1.mp4
      //
      // ⚠️ THIS FILM HAS BURNED-IN JAPANESE TEXT DOWN ITS RIGHT EDGE —
      // 「やっぱり、俺がいないと回らないな。」 — and that line IS the punchline.
      // It is why the hero shows the whole frame instead of cropping to fill
      // the viewport (see .lp-hero-media in lp.css). Any future change back to
      // `object-fit: cover` silently cuts the payoff off the right side, and
      // removes it entirely on a phone.
      //
      // It sits on B rather than A because that punchline — "things don't run
      // without me" — is the 社長待ち argument, not the hiring-loop one.
      video: '/video/lp-video1.mp4',
      poster: '/img/lp-video1-poster.jpg',
    },
    flow: {
      heading: ['社長で止まる仕事を、', 'AIで流れる仕事に変える。'],
      bad: {
        eyebrow: 'now',
        label: '止まる',
        nodes: ['問い合わせ', '社員が確認', '社長が外出中', '返信が止まる'],
      },
      good: {
        eyebrow: 'with gift',
        label: '流れる',
        nodes: ['問い合わせ', 'AIが過去対応を見る', '回答案を出す', '社員が返す'],
      },
      punch: 'AIに必要なのは、御社の文脈です。',
    },
    what: {
      heading: ['社長の頭の中を、', 'AIが使える知識にします。'],
      lead: '過去の見積、問い合わせ、資料、判断基準を整理して、AIが社長の代わりに一次回答できる状態を作ります。',
      steps: [
        {
          title: '社長待ちの業務を特定する',
          titleLines: ['社長待ちの業務を', '特定する'],
          body: 'どこで仕事が止まっているかを面談で洗い出します。',
        },
        {
          title: '判断基準をAIに渡す',
          titleLines: ['判断基準を', 'AIに渡す'],
          body: '過去対応や社内ルールを、AIが参照できる形にします。',
        },
        {
          title: '確認待ちを減らす',
          titleLines: ['確認待ちを', '減らす'],
          body: '見積、問い合わせ、資料探しなどから無料で試します。',
        },
      ],
    },
  },
};

/** Drives generateStaticParams — both LPs stay statically prerendered. */
export const LP_SLUGS = Object.keys(LP_VARIANTS);
