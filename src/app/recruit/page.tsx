import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Shuffle, Sparkles, GraduationCap, ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import ScrollRevealSpread from '@/components/ui/ScrollRevealSpread';
import PhotoReveal from '@/components/ui/PhotoReveal';
import ElasticPulseInit from '@/components/ui/ElasticPulseInit';
import StepCardScrubReveal from '@/components/ui/StepCardScrubReveal';
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
      <ElasticPulseInit />
      <StepCardScrubReveal />
      <main className="bg-white">

        {/* ── Hero ── full-bleed video, dark overlay, white text */}
        <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden px-5 py-[120px] md:px-10">
          {/* video layer */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            src="/video/recruitment-hero-video.mp4"
          />
          {/* dark scrim */}
          <div className="absolute inset-0 bg-black/50" />

          {/* content */}
          <div className="hero-enter relative z-10 mx-auto w-full max-w-fit">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-white/60">
              RECRUIT
            </p>
            <h1
              className="font-nube-display text-white"
              style={{ fontSize: 'clamp(40px, 6vw, 60px)', lineHeight: '1.4' }}
            >
              仲間を、
              <br />
              募集しています。
            </h1>
            <p className="mt-8 max-w-2xl font-nube-sans text-body-lg text-white/80">
              GIFTでは、コールセンター・DXコンサル・財務コンサルの三つの事業領域で、共に成長する仲間を募集しています。新卒・中途・アルバイト/パート、すべての働き方を歓迎します。
            </p>
            <div className="mt-10">
              <Link
                href="#positions"
                data-elastic-pulse-btn
                className="inline-flex items-center justify-center bg-white px-8 py-4 font-nube-sans text-body-sm font-normal uppercase tracking-wider text-nube-ink transition-opacity duration-100 ease-out hover:opacity-90"
              >
                応募する
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHY GIFT — spread intro ── */}
        <ScrollRevealSpread className="bg-white" minHeight="130vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/60">
              WHY GIFT
            </p>
            <div
              className="font-nube-display"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">GIFTで働く、</span>
              <span className="srs-w">4つの魅力</span>
            </div>
          </div>
        </ScrollRevealSpread>

        {/* WHY GIFT — value cards */}
        <Reveal>
          <section className="bg-white pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {values.map((v, i) => {
                  const Icon = v.Icon;
                  return (
                    <Reveal key={v.title} delay={(i % 2) * 120}>
                      <div className="border-t border-nube-ink/20 pt-8 text-center">
                        <div className="mb-5 flex justify-center text-nube-ink">
                          <Icon className="h-7 w-7" strokeWidth={1.5} />
                        </div>
                        <h3
                          className="mb-4 font-nube-display text-nube-ink"
                          style={{ fontSize: 'clamp(20px, 2vw, 23px)', lineHeight: '1.4' }}
                        >
                          {v.title}
                        </h3>
                        <p className="font-nube-sans text-body text-nube-ink/70">{v.body}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── CAREER PATH — spread intro ── */}
        <ScrollRevealSpread className="bg-nube-cloud" minHeight="150vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/60">
              CAREER PATH
            </p>
            <div
              className="mb-8 font-nube-display"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">事業を</span>
              <span className="srs-w">またぐキャリア</span>
            </div>
            <p className="mx-auto max-w-2xl font-nube-sans text-body text-left">
              <span className="srs-w">GIFTの特徴は、</span>
              <span className="srs-w">コール → SV → DX → 財務 と</span>
              <span className="srs-w">事業を越えて成長できること。</span>
              <span className="srs-w">一つの現場で終わらない</span>
              <span className="srs-w">キャリアを歩めます。</span>
            </p>
          </div>
        </ScrollRevealSpread>

        {/* CAREER PATH — cinematic photo reveal */}
        <PhotoReveal
          src="/recruit/career-path.png"
          alt="GIFTのキャリアパス"
          caption="GIFTで、キャリアを描く。"
          bg="#B0E0E9"
        />

        {/* CAREER PATH — path grid */}
        <Reveal>
          <section className="bg-nube-cloud pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {path.map((p) => (
                  <div key={p.title} className="border-t border-nube-ink/30 pt-6 text-center">
                    <p className="mb-2 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/50">
                      {p.label}
                    </p>
                    <h3
                      className="mb-2 font-nube-display text-nube-ink"
                      style={{ fontSize: 'clamp(18px, 1.8vw, 23px)', lineHeight: '1.4' }}
                    >
                      {p.title}
                    </h3>
                    <p className="font-nube-sans text-body-sm text-nube-ink/70">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── HOW TO APPLY — spread intro ── */}
        <ScrollRevealSpread className="bg-white" minHeight="160vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/60">
              HOW TO APPLY
            </p>
            <div
              className="mb-8 font-nube-display"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">応募の</span>
              <span className="srs-w">流れ</span>
            </div>
            <p className="mx-auto max-w-2xl font-nube-sans text-body text-left">
              <span className="srs-w">ご応募は各募集ポジションから</span>
              <span className="srs-w">LINE求人アカウントへ</span>
              <span className="srs-w">直接お進みいただけます。</span>
              <span className="srs-w">以降のやり取りは</span>
              <span className="srs-w">LINEを中心に</span>
              <span className="srs-w">スムーズに進めます。</span>
            </p>
          </div>
        </ScrollRevealSpread>

        {/* HOW TO APPLY — step cards */}
        <section data-step-section className="bg-white pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div
                data-step-card-container
                className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {flow.map((f) => (
                  <div
                    key={f.step}
                    data-step-card
                    className="relative flex w-[85%] shrink-0 snap-center flex-col overflow-hidden border border-nube-ink/15 bg-white sm:w-[60%] md:w-[48%] lg:w-auto"
                  >
                    <div className="pointer-events-none absolute right-4 top-4 z-10 select-none font-nube-display text-[64px] leading-none text-nube-ink/[0.06]">
                      {f.step}
                    </div>

                    {f.img && (
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-nube-cloud/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.img}
                          alt={f.title}
                          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 hover:scale-[1.03]"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6 text-center">
                      <p className="mb-3 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/50">
                        STEP {f.step}
                      </p>
                      <h3
                        className="mb-3 font-nube-display text-nube-ink"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', lineHeight: '1.4' }}
                      >
                        {f.title}
                      </h3>
                      <p className="font-nube-sans text-body-sm text-nube-ink/70">{f.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </section>

        {/* ── OPEN POSITIONS — spread intro ── */}
        <ScrollRevealSpread className="bg-nube-cloud" minHeight="160vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/60">
              OPEN POSITIONS
            </p>
            <div
              className="mb-8 font-nube-display"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">募集中の</span>
              <span className="srs-w">ポジション</span>
            </div>
            <p className="mx-auto max-w-2xl font-nube-sans text-body text-left">
              <span className="srs-w">雇用形態（中途／新卒）は固定せず、</span>
              <span className="srs-w">ポジション単位で募集しています。</span>
              <span className="srs-w">応募者の希望を伺いながら、</span>
              <span className="srs-w">働き方を個別に検討します。</span>
            </p>
          </div>
        </ScrollRevealSpread>

        {/* OPEN POSITIONS — position cards */}
        <Reveal>
          <section id="positions" className="bg-nube-cloud pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div className="grid grid-cols-1 gap-px bg-nube-ink/20 md:grid-cols-2">
                {positions.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 100}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-elastic-pulse-btn
                      className="group flex h-full flex-col bg-white p-8 transition-colors duration-500 hover:bg-nube-ink/[0.04] md:p-10"
                    >
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span className="border border-nube-ink/40 px-3 py-1 font-nube-sans text-body-xs font-normal uppercase tracking-[0.12em] text-nube-ink/70">
                          {p.department}
                        </span>
                        <span className="font-nube-sans text-body-xs text-nube-ink/50">
                          {p.type}
                        </span>
                      </div>

                      <h3
                        className="mb-4 font-nube-display text-nube-ink"
                        style={{ fontSize: 'clamp(20px, 2vw, 23px)', lineHeight: '1.4' }}
                      >
                        {p.title}
                      </h3>
                      <p className="mb-6 font-nube-sans text-body text-nube-ink/70">
                        {p.summary}
                      </p>

                      {p.details && p.details.length > 0 && (
                        <dl className="mb-6 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 border-t border-nube-ink/10 pt-6">
                          {p.details.map((d) => (
                            <div key={d.label} className="contents">
                              <dt className="font-nube-sans text-body-sm font-semibold text-nube-ink">
                                {d.label}
                              </dt>
                              <dd className="font-nube-sans text-body-sm text-nube-ink/60">
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
                            className="border border-nube-ink/20 px-3 py-0.5 font-nube-sans text-body-xs text-nube-ink/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div
                        data-elastic-pulse-target
                        className="mt-auto flex items-center gap-2 self-start font-nube-sans text-body-sm font-semibold uppercase tracking-wider text-nube-ink"
                      >
                        <span>LINEから応募する</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── JOIN US — spread CTA ── */}
        <ScrollRevealSpread className="bg-white" minHeight="120vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-nube-ink/60">
              JOIN US
            </p>
            <div
              className="mb-10 font-nube-display"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">一緒に、</span>
              <span className="srs-w">新しい挑戦を。</span>
            </div>
            <Link
              href="/contact"
              data-elastic-pulse-btn
              className="inline-flex items-center justify-center bg-nube-ink px-8 py-4 font-nube-sans text-body-sm font-normal uppercase tracking-wider text-white transition-opacity duration-100 ease-out hover:opacity-90"
            >
              応募・お問い合わせ
            </Link>
          </div>
        </ScrollRevealSpread>

      </main>
      <Footer />
    </>
  );
}
