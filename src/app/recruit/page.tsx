import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Shuffle, Sparkles, GraduationCap, ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { getPublishedPositions } from '@/lib/notion';
import staticPositions from '@/data/positions.json';

export const metadata: Metadata = {
  title: '採用情報',
  description:
    '株式会社GIFTでは、コールセンタースタッフ、ITエンジニア、プロジェクトマネージャー、法人営業職を募集しています。あなたのキャリアを一緒に形にしませんか。',
  alternates: { canonical: '/recruit' },
};

const values = [
  {
    title: '成長機会',
    body: '年齢や経歴を問わず、意欲のある人には早くから裁量と役割をお任せします。立ち止まらず挑戦し続けられる環境です。',
    Icon: TrendingUp,
  },
  {
    title: '横断キャリア',
    body: 'コール → SV → DX → 財務 と、事業領域を越えて経験を積める数少ない会社です。キャリアの可能性が広がります。',
    Icon: Shuffle,
  },
  {
    title: 'AI・最新ツールを使い倒す',
    body: '生成AIをはじめとした最新ツールを日常業務にフル活用。時代に取り残されない働き方ができます。',
    Icon: Sparkles,
  },
  {
    title: '研修と評価制度',
    body: 'コールセンター約300名を支える教育制度が礎。個々の挑戦を後押しする運営が全社に行き渡っています。',
    Icon: GraduationCap,
  },
];

const path = [
  { label: 'PATH 1', title: 'コールオペ', body: '現場で顧客接点の基礎を学ぶ。' },
  { label: 'PATH 2', title: 'SV / リーダー', body: 'チーム運営と教育に踏み込む。' },
  { label: 'PATH 3', title: 'DXコンサル', body: '事業の仕組みを設計する側へ。' },
  { label: 'PATH 4', title: '財務コンサル', body: '経営と財務の視座を獲得する。' },
];

const flow: { step: string; title: string; body: string; img?: string }[] = [
  {
    step: '01',
    title: '募集ポジションをタップ',
    body: '本ページの募集ポジションカードから、希望する職種をタップしてください。',
    img: '/recruit/step1.jpg',
  },
  {
    step: '02',
    title: 'QRコードを読み取る',
    body: '表示されるQRコードをスマートフォンで読み取り、GIFT求人LINEアカウントへ友だち追加します。',
    img: '/recruit/step2.jpg',
  },
  {
    step: '03',
    title: '面談予約へ進む',
    body: 'LINE内の案内ボタンをタップすると、面談予約用のQRコードが表示されます。読み取って次へ進んでください。',
    img: '/recruit/step3.jpg',
  },
  {
    step: '04',
    title: '日時を選んで予約完了',
    body: 'ご都合の良い面談日時をお選びいただき、予約完了。当日お会いできるのを楽しみにしています。',
    img: '/recruit/step4.jpg',
  },
];

export const dynamic = 'force-dynamic';

type PositionDetail = { label: string; value: string };
type Position = {
  id: string;
  title: string;
  type: string;
  department: string;
  summary: string;
  tags: string[];
  url: string;
  details?: PositionDetail[];
};

export default async function RecruitPage() {
  let positions: Position[] = [];

  try {
    const notionPositions = await getPublishedPositions();
    positions = notionPositions.length > 0 ? notionPositions : staticPositions;
  } catch {
    positions = staticPositions;
  }

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              RECRUIT
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.05' }}
            >
              仲間を、
              <br />
              募集しています。
            </h1>
            <p
              className="mt-8 max-w-2xl font-sans text-normal font-light text-gift-silver"
              style={{ lineHeight: '2' }}
            >
              GIFTでは、コールセンター・DXコンサル・財務コンサルの三つの事業領域で、共に成長する仲間を募集しています。新卒・中途・アルバイト/パート、すべての働き方を歓迎します。
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#positions" className="cta-btn">
                <span>募集ポジションを見る</span>
              </Link>
              <Link href="#positions" className="cta-btn cta-btn--deep">
                <span>応募する</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why GIFT — values with glyph icons */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                WHY GIFT
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                GIFTで働く、4つの魅力
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {values.map((v, i) => {
                  const Icon = v.Icon;
                  return (
                    <Reveal key={v.title} delay={(i % 2) * 120}>
                      <div className="gift-card !p-8">
                        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gift-green text-white">
                          <Icon className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                          {v.title}
                        </h3>
                        <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                          {v.body}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Career path visual */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                CAREER PATH
              </p>
              <h2
                className="mb-4 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                事業をまたぐキャリア
              </h2>
              <p
                className="mb-10 max-w-2xl font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                GIFTの特徴は、コール → SV → DX → 財務 と事業を越えて成長できること。一つの現場で終わらないキャリアを歩めます。
              </p>

              {/* Career path hero image */}
              <div className="mb-14 overflow-hidden rounded-2xl border border-gift-border bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/recruit/career-path.jpg"
                  alt="GIFTのキャリアパス"
                  className="block h-auto w-full object-cover"
                />
              </div>

              <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
                {path.map((p, i) => (
                  <div key={p.title} className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gift-green bg-white font-display text-small font-bold text-gift-green">
                        {i + 1}
                      </div>
                      <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        {p.label}
                      </p>
                    </div>
                    <h3 className="mb-2 font-sans text-medium font-bold text-gift-ink">
                      {p.title}
                    </h3>
                    <p className="font-sans text-small font-light text-gift-silver">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Application flow */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                HOW TO APPLY
              </p>
              <h2
                className="mb-4 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                応募の流れ
              </h2>
              <p
                className="mb-14 max-w-2xl font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                ご応募は各募集ポジションからLINE求人アカウントへ直接お進みいただけます。以降のやり取りはLINEを中心にスムーズに進めます。
              </p>

              {/* Slide hint — mobile only */}
              <p className="mb-6 flex items-center justify-center gap-2 font-sans text-small italic text-gift-silver lg:hidden">
                <span aria-hidden>←</span>
                スライドして手順をご確認ください
                <span aria-hidden>→</span>
              </p>

              {/* Steps: horizontal swipeable carousel on mobile, 4-col grid on desktop.
                  -mx-4/px-4 gives full-bleed scroll so cards start from edge, partial next card peeks in. */}
              <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
                {flow.map((f) => (
                  <div
                    key={f.step}
                    className="relative flex w-[85%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-gift-border bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:w-[60%] md:w-[48%] lg:w-auto"
                  >
                    {/* Big decorative step number in top corner */}
                    <div className="pointer-events-none absolute right-4 top-4 z-10 select-none font-display text-[64px] font-extrabold leading-none text-gift-green/10">
                      {f.step}
                    </div>

                    {/* Image frame — uniform 4:5 aspect across all cards, image contained on soft bg */}
                    {f.img && (
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-gift-bg-alt to-gift-near-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.img}
                          alt={f.title}
                          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        STEP {f.step}
                      </p>
                      <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                        {f.title}
                      </h3>
                      <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                        {f.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Positions */}
        <Reveal>
          <section id="positions" className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                OPEN POSITIONS
              </p>
              <h2
                className="mb-4 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                募集中のポジション
              </h2>
              <p
                className="mb-12 max-w-2xl font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                雇用形態（中途／新卒）は固定せず、ポジション単位で募集しています。応募者の希望を伺いながら、働き方を個別に検討します。
              </p>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {positions.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 100}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gift-card group relative flex h-full flex-col !p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-gift-green px-3 py-1 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                          {p.department}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 font-sans text-small font-medium text-gift-silver">
                          {p.type}
                        </span>
                      </div>
                      <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                        {p.title}
                      </h3>
                      <p className="mb-5 font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                        {p.summary}
                      </p>

                      {p.details && p.details.length > 0 && (
                        <dl className="mb-5 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-gift-border bg-gift-bg-alt/50 p-5 sm:grid-cols-[auto,1fr]">
                          {p.details.map((d) => (
                            <div key={d.label} className="contents">
                              <dt className="font-sans text-small font-bold text-gift-ink">
                                {d.label}
                              </dt>
                              <dd className="font-sans text-small font-light text-gift-silver">
                                {d.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      <div className="mb-6 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-gift-silver/30 px-3 py-0.5 font-sans text-small text-gift-silver"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center gap-2 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        <span>LINEから応募する</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Final CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                JOIN US
              </p>
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: '1.25' }}
              >
                一緒に、新しい挑戦を。
              </h2>
              <Link href="/contact" className="cta-btn">
                <span>応募・お問い合わせ</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
