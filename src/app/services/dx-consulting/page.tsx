import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import CaseCarousel from '@/components/ui/CaseCarousel';
import FadeUpText from '@/components/ui/FadeUpText';

export const metadata: Metadata = {
  title: 'DXコンサル事業',
  description:
    'Lステップ運用、RPA導入、AI活用による業務自動化。中小企業のデジタル変革を支援する株式会社GIFTのDXコンサルティング事業。',
  alternates: { canonical: '/services/dx-consulting' },
};

const painPoints = [
  'LINEを活用して集客・売上を上げたい',
  'メルマガやDMの効果が下がってきている',
  'LINEをビジネスで活用したいが構築の仕方がわからない',
  '自分の業種でもLINEを活用できるのか知りたい',
];

const features = [
  {
    title: 'シナリオ配信',
    body: '事前に設定したタイミングと順序で一連のメッセージなどを自動配信できる機能です。シナリオの分岐や時刻を細かく指定した配信ができます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'セグメント配信',
    body: '友だちのアンケート回答結果やリンククリックなどのアクションに応じて属性を設定し、属性を絞って配信することができます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'リマインド配信',
    body: '任意の日時を設定し、そこから逆算してリマインダーメッセージを配信できます。お客様の予約忘れや直前のキャンセル防止に役立ちます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '回答フォーム',
    body: '友だちへのアンケートや説明会のお申込みなどにも利用可能な回答フォームを作成できます。回答内容は友だちと紐づけて一覧で管理できます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'タグ管理',
    body: '性別、年代、興味などから自由に「タグ」を作成して、友だちをグループ分けできます。タグを使って対象となる友だちを絞ってメッセージを配信できます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '流入経路分析',
    body: '友だち追加用のURL（QRコード）を複数発行し、それぞれの流入数を分析できる機能です。どこからの流入が多いかなどを調べることができます。',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const caseStudies = [
  {
    num: '01',
    title: '光回線の開通手続きの案内',
    image: '/img/dx-case-01.jpg',
    description: '開通までの手続きの流れをLステップのシナリオ機能を使ってステップ配信。従来よりも問い合わせ対応の工数削減を実現。',
    points: [
      {
        heading: 'シナリオ配信を活用',
        body: 'お客様の進捗状況に合わせ、必要な手続きの内容をステップごとに配信。その都度必要な情報を配信することで開通までよりスムーズに。',
      },
      {
        heading: '問い合わせの対応工数を削減',
        body: '電話での問い合わせが多い質問をフォーム作成機能を使って一問一答形式で掲載。わからないことはLINEからすぐに確認できるようになったため、電話での問い合わせ対応数を削減。',
      },
    ],
  },
  {
    num: '02',
    title: 'エステサロンの予約管理をLステップで一元化',
    image: '/img/dx-case-02.jpg',
    description: 'LINEだけで簡単予約、予約日前日にリマインド配信を行うことで予約率の増加とキャンセル率の低下を実現。予約状況もLステップで一元管理できるため、予約表への転記等も不要になった。',
    points: [
      {
        heading: 'LINEから簡単予約',
        body: 'カレンダー予約機能を使って予約ページを作成。予約状況の確認・管理もLステップ上で行えるので、予約管理の工数削減に繋がった。',
      },
      {
        heading: 'リマインド配信でドタキャン防止',
        body: '予約日時が近づくと、自動で確認メッセージを配信させることが可能。リマインド配信を行うことで、従来よりも予約忘れ・ドタキャンが減少した。',
      },
    ],
  },
  {
    num: '03',
    title: '地域限定のクーポンやお得情報の配信',
    image: '/img/dx-case-03.jpg',
    description: 'セグメント配信機能を活用し、地域限定のクーポンやお得情報などを発信。必要な人にのみ絞って配信できるため、無駄な配信数の削減とブロック率の低下に繋がった。',
    points: [
      {
        heading: '属性ごとに分けて配信',
        body: '友だちの属性に応じて配信内容を分けることが可能。細かな条件設定が可能なので、配信先に合わせて効果的なメッセージ配信が可能。',
      },
      {
        heading: '配信コストの削減',
        body: '配信先を絞り込むことで、全員に一斉配信するよりも配信数の削減が可能。不要なメッセージが送られることもなくなるので、ブロック率の低下にも貢献。',
      },
    ],
  },
];

export default function DxConsultingPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero — "Command Center" dark mode: distinct from the rest of the site to give this page its own identity */}
        <section className="relative overflow-hidden bg-gift-ink">
          {/* Background layers: subtle grid + soft green glows in corners + pulsing node dots */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="dx-hero-grid absolute inset-0" />
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gift-green/15 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gift-green-teal/10 blur-[120px]" />
            <span className="dx-node" style={{ top: '20%', left: '12%' }} />
            <span className="dx-node" style={{ top: '68%', left: '82%', animationDelay: '1.1s' }} />
            <span className="dx-node" style={{ top: '38%', left: '88%', animationDelay: '2.0s' }} />
            <span className="dx-node" style={{ top: '78%', left: '22%', animationDelay: '0.6s' }} />
            <span className="dx-node" style={{ top: '15%', left: '62%', animationDelay: '1.7s' }} />
            <span className="dx-node" style={{ top: '52%', left: '46%', animationDelay: '2.6s' }} />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-container flex-col justify-center px-4 py-s-80 md:px-6 lg:px-8">
            <p
              className="nav-reveal mb-5 font-display text-small font-bold uppercase tracking-widest text-gift-green"
              style={{ ['--reveal-delay' as string]: '100ms' } as React.CSSProperties}
            >
              DX CONSULTING
            </p>

            <h1
              className="font-sans font-extrabold leading-none text-white"
              style={{ fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: '1.05' }}
            >
              <FadeUpText text="DXコンサル" delayMs={250} />
              <span className="text-gift-green">
                <FadeUpText text="事業" delayMs={520} />
              </span>
            </h1>

            <p
              className="nav-reveal mt-8 max-w-2xl font-mincho font-light text-white/75"
              style={
                {
                  fontSize: 'clamp(16px, 1.7vw, 19px)',
                  lineHeight: '2',
                  ['--reveal-delay' as string]: '900ms',
                } as React.CSSProperties
              }
            >
              既存の環境を変えずに — LINE・Lステップ・RPA・AIで事業を自動化する、ワンストップDXパートナー。
            </p>

            <div
              className="nav-reveal mt-10 max-w-xl border-l-2 border-gift-green pl-5"
              style={{ ['--reveal-delay' as string]: '1200ms' } as React.CSSProperties}
            >
              <p
                className="font-sans font-extrabold italic text-white"
                style={{ fontSize: 'clamp(17px, 1.9vw, 22px)', lineHeight: '1.45' }}
              >
                今の環境を変えずに、Lステップでより高みへ。
              </p>
            </div>

            <div
              className="nav-reveal mt-10"
              style={{ ['--reveal-delay' as string]: '1500ms' } as React.CSSProperties}
            >
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>

            {/* Partner badge — glassmorphism variant of the original 青山 card, compressed */}
            <div
              className="nav-reveal mt-12 flex max-w-md items-center gap-4 self-start rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md"
              style={{ ['--reveal-delay' as string]: '1800ms' } as React.CSSProperties}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={1.4} className="h-6 w-6">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-sans text-[15px] font-bold text-white">青山 雄基</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#06C755]/20 px-2.5 py-0.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-[#06C755] font-display text-[9px] font-extrabold text-white">
                      L
                    </span>
                    <span className="font-display text-[10px] font-bold text-[#06C755]">公式認定パートナー</span>
                  </span>
                </div>
                <p className="mt-1 font-sans text-[12px] leading-relaxed text-white/60">
                  Lステップ構築代行 / RPA活用DX推進
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats — DX track record (placeholders, swap with real numbers when shared) */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-70">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
                <div className="text-center">
                  {/* TODO: replace with real number when shared */}
                  <div className="font-display text-[64px] font-extrabold leading-none text-gift-green">
                    50<span className="text-[32px]">社+</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">DX支援企業数</p>
                </div>
                <div className="text-center">
                  {/* TODO: replace with real number when shared */}
                  <div className="font-display text-[64px] font-extrabold leading-none text-gift-green">
                    1,000<span className="text-[32px]">時間+</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">RPAによる業務削減</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#06C755]/10 px-4 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-[#06C755] font-display text-sm font-bold text-white">L</span>
                    <span className="font-sans text-[14px] font-bold text-[#06C755]">公式認定パートナー</span>
                  </div>
                  <p className="mt-4 font-sans text-small font-light text-gift-silver">Lステップ</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Service areas */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                SERVICE AREAS
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                提供領域
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    title: 'LINE公式・Lステップ',
                    body: 'Lステップ公式認定パートナーとして、アカウント設計から配信運用・自動化フロー構築まで一貫してサポート。',
                  },
                  {
                    title: 'RPA・業務自動化',
                    body: 'ハイブリッド構成（カスタム開発＋市販ツール）で、業務の反復作業を自動化します。',
                  },
                  {
                    title: 'AI導入・生成AI活用',
                    body: '最新のAIツールを業務に深く組み込み、生産性を最大化。導入から運用まで一貫して支援します。',
                  },
                  {
                    title: 'SaaS導入・CRM構築',
                    body: '課題に合ったSaaSの選定・導入・CRM設計まで、事業成長に直結する基盤づくりを支援します。',
                  },
                ].map((s) => (
                  <div key={s.title} className="gift-card !p-8">
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">{s.title}</h3>
                    <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Pain points */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  CHALLENGES
                </p>
                <h2
                  className="mb-12 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  こんなお悩みありませんか？
                </h2>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 text-left sm:grid-cols-2">
                  {painPoints.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gift-green/10" aria-hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={2} className="h-3.5 w-3.5">
                          <path d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <p className="font-sans text-[15px] leading-relaxed text-gift-ink">{p}</p>
                    </li>
                  ))}
                </ul>

                <div className="mx-auto mt-12 flex flex-col items-center">
                  <div className="mb-2 h-8 w-px bg-gift-green/40" />
                  <p
                    className="font-sans font-extrabold text-gift-green"
                    style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}
                  >
                    その課題、Lステップが解決します！
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Live L-step — editorial spread proving GIFT's standing as a Lステップ certified partner.
            Three alternating rows (認定 / 担当 / 業種) → single CTA → 🔒 trust line. */}
        <Reveal>
          <section className="border-t border-gift-border bg-gradient-to-b from-white via-[#F0FAF4] to-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  SEE L-STEP LIVE
                </p>
                <h2
                  className="mb-4 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  実際のLステップを、ご体験ください
                </h2>
                <p className="font-sans text-normal font-light text-gift-silver">
                  GIFT自身が運用する公式Lステップを、そのまま実例としてご覧いただけます。
                </p>
              </div>

              {/* Editorial spread — 3 alternating image+text rows prove GIFT's standing as a
                  certified Lステップ partner. Each row enters from the side its image sits on, so
                  the spread feels paginated as the user scrolls. Single CTA at the bottom. */}
              <div className="mx-auto mt-16 max-w-5xl space-y-16 md:mt-20 md:space-y-24">
                {/* Row 1 — image left, text right */}
                <Reveal from="left">
                  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                    <div className="overflow-hidden rounded-2xl border border-gift-border bg-white shadow-[0_20px_50px_-25px_rgba(6,199,85,0.25)]">
                      <div className="relative aspect-[16/10]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/l-step.jpg"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        Certified Partner
                      </p>
                      <h3
                        className="mb-4 font-sans font-extrabold text-gift-ink"
                        style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', lineHeight: '1.3' }}
                      >
                        Lステップ正規代理店として認定
                      </h3>
                      <p className="font-sans text-[16px] leading-loose text-gift-silver">
                        公式から認定された設計・運用パートナーとして、4年連続No.1の実績を持つLステップを正規にご提供します。
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Row 2 — text left, image right (alternating direction) */}
                <Reveal from="right">
                  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                    <div className="md:order-2 overflow-hidden rounded-2xl border border-gift-border bg-white shadow-[0_20px_50px_-25px_rgba(6,199,85,0.25)]">
                      <div className="relative aspect-[16/10]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/official-partner.jpg"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="md:order-1">
                      <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        Dedicated Support
                      </p>
                      <h3
                        className="mb-4 font-sans font-extrabold text-gift-ink"
                        style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', lineHeight: '1.3' }}
                      >
                        専属の担当が、設計から運用まで伴走
                      </h3>
                      <p className="font-sans text-[16px] leading-loose text-gift-silver">
                        業界を熟知した担当者が、設計・配信シナリオ・改善までを一貫してサポート。一社一社の状況に合わせて、顔の見える距離感で並走します。
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Row 3 — image left, text right */}
                <Reveal from="left">
                  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                    <div className="overflow-hidden rounded-2xl border border-gift-border bg-white shadow-[0_20px_50px_-25px_rgba(6,199,85,0.25)]">
                      <div className="relative aspect-[16/10]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/img/whoUsedIt.jpg"
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        Proven Across Industries
                      </p>
                      <h3
                        className="mb-4 font-sans font-extrabold text-gift-ink"
                        style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', lineHeight: '1.3' }}
                      >
                        業種を問わず、活用が広がっています
                      </h3>
                      <p className="font-sans text-[16px] leading-loose text-gift-silver">
                        美容・コーチング・不動産・整体・パーソナルトレーニングなど、業種を問わず実績を蓄積。事業特性に合わせた運用設計をご提案します。
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Single CTA + trust line — anchors the spread with one clear action */}
                <Reveal>
                  <div className="text-center">
                    <a
                      href="https://xn--l-qfu4al0g.com/gift_lstep/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GIFT公式Lステップを見る（新しいタブで開きます）"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-9 py-4 font-sans text-[16px] font-bold text-white shadow-[0_14px_32px_-10px_rgba(6,199,85,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#05a948] hover:shadow-[0_18px_40px_-8px_rgba(6,199,85,0.75)]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white font-display text-[11px] font-extrabold text-[#06C755]">
                        L
                      </span>
                      実際のLステップを見る
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586L11.293 5.707a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-[12px] text-gift-silver">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      安全なリンク
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        </Reveal>

        {/* What is Lstep */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  ABOUT L-STEP
                </p>
                <h2
                  className="mb-8 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  Lステップとは？
                </h2>
                <p className="font-sans text-[16px] leading-loose text-gift-silver">
                  Lステップとは、LINE公式アカウントの機能を拡張した<strong className="text-gift-ink">MA（マーケティングオートメーション）ツール</strong>です。
                  マーケティングオートメーションとは、顧客の教育（ナーチャリング）や顧客管理を自動化し、それを一元化できるツールを指します。
                </p>
                <p className="mt-4 font-sans text-[16px] leading-loose text-gift-silver">
                  Lステップを導入することで、LINEを活用して<strong className="text-gift-ink">集客から顧客管理をワンストップで自動化</strong>できます。
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Lstep features */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  FEATURES
                </p>
                <h2
                  className="mb-3 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  Lステップの機能
                </h2>
                <p className="font-sans text-normal font-light text-gift-silver">
                  売上UPに効果的な様々な機能を揃えています。
                </p>
              </div>

              {/* Slide hint — mobile only, signals horizontal swipe */}
              <p className="mb-4 flex items-center justify-center gap-2 font-sans text-small italic text-gift-silver lg:hidden">
                <span aria-hidden>←</span>
                スライドして機能をご確認ください
                <span aria-hidden>→</span>
              </p>

              {/* Mobile = horizontal scroll-snap, lg = 3-col grid */}
              <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="group w-[80%] shrink-0 snap-center rounded-2xl border border-gift-border bg-white p-7 sm:w-[55%] md:w-[42%] lg:w-auto"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gift-bg text-gift-green-teal transition-colors duration-300 group-hover:bg-gift-green/20">
                      {f.icon}
                    </div>
                    <h3 className="mb-3 font-sans text-[17px] font-bold text-gift-ink">{f.title}</h3>
                    <p className="font-sans text-[15px] leading-relaxed text-gift-silver">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Case studies */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  CASE STUDIES
                </p>
                <h2
                  className="mb-3 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  活用事例
                </h2>
                <p className="font-sans text-normal font-light text-gift-silver">
                  Lステップの活用方法をご紹介
                </p>
              </div>

              <CaseCarousel cases={caseStudies} />
            </div>
          </section>
        </Reveal>

        {/* RPA × Lステップ */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  RPA × L-STEP
                </p>
                <h2
                  className="mb-4 font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  Lステップをさらに便利に
                </h2>
                <p className="font-sans text-normal font-light text-gift-silver">
                  お使いのCRMとLステップをRPAで自動連携。より効率的な運用を実現します。
                </p>
              </div>

              {/* Pain points */}
              <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-5 text-left sm:grid-cols-3">
                {[
                  'CRMとの連携ができないので更新作業が手間',
                  'CRMに溜まった顧客情報をLステップで有効活用したい',
                  'LステップとCRMを同時に管理したい',
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gift-green/10" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={2} className="h-3.5 w-3.5">
                        <path d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <p className="font-sans text-[15px] leading-relaxed text-gift-ink">{p}</p>
                  </li>
                ))}
              </ul>

              {/* 3 capabilities */}
              <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                  {
                    title: 'データ入力自動化',
                    body: '手動でのデータ入力作業を排除。RPAが自動でCRMとLステップ間のデータを同期します。',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    title: 'CRMデータの活用',
                    body: 'CRMに蓄積された顧客データを配信施策にフル活用。セグメント精度が飛躍的に向上します。',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
                        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    title: '情報同期管理',
                    body: '複数システムの情報を統一管理。データの不整合や二重入力の問題を解消します。',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
                        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="group rounded-2xl border border-gift-border bg-white p-7 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gift-bg text-gift-green-teal transition-colors duration-300 group-hover:bg-gift-green/20">
                      {c.icon}
                    </div>
                    <h3 className="mb-2 font-sans text-[16px] font-bold text-gift-ink">{c.title}</h3>
                    <p className="font-sans text-[15px] leading-relaxed text-gift-silver">{c.body}</p>
                  </div>
                ))}
              </div>

              {/* RPA case studies */}
              <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    title: '歯科クリニック',
                    tools: 'セールスフォース × Lステップ',
                    result: '10分おきに自動で予約情報を確認し、CRMに入力。手動作業の工数を大幅に削減。',
                  },
                  {
                    title: '光回線コールセンター',
                    tools: 'キントーン × Lステップ',
                    result: 'CRM内の顧客情報をLステップへインポートする作業を自動化。オペレーターの負担を軽減。',
                  },
                ].map((cs) => (
                  <div key={cs.title} className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-gift-border bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-gift-green/50 hover:shadow-[0_20px_40px_-12px_rgba(37,211,102,0.3),0_0_30px_-5px_rgba(37,211,102,0.2)] active:scale-[0.99]">
                    <div className="flex items-center gap-3 border-b border-gift-border bg-gift-bg px-6 py-4 transition-colors duration-300 group-hover:bg-gift-green/10">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gift-green font-display text-[12px] font-bold text-white transition-transform duration-300 group-hover:scale-110">
                        RPA
                      </span>
                      <h4 className="font-sans text-[16px] font-bold text-gift-ink">{cs.title}</h4>
                    </div>
                    <div className="px-6 py-5">
                      <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                        使用ツール
                      </p>
                      <p className="mb-4 font-sans text-[14px] font-medium text-gift-ink">{cs.tools}</p>
                      <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                        成果
                      </p>
                      <p className="font-sans text-[15px] leading-relaxed text-gift-silver">{cs.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* AI-first strength */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    OUR EDGE
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    AIをフル活用
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <p
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
                  >
                    GIFTの独自色は、AIを業務に深く組み込んでいることです。最新のAIツールを社内で日常的に活用し、クライアントの業務にも同じ水準のAI活用を実装します。単なるツール導入ではなく、AI前提での業務プロセス再設計をご提案します。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                DXコンサルのご相談はこちらから
              </h2>
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
