import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import ScrollRevealSpread from '@/components/ui/ScrollRevealSpread';
import PhotoReveal from '@/components/ui/PhotoReveal';
import ElasticPulseInit from '@/components/ui/ElasticPulseInit';
import StepSlideshow from '@/components/ui/StepSlideshow';
import VideoCrossfade from '@/components/ui/VideoCrossfade';
import WhyGiftStackedCards from '@/components/ui/WhyGiftStackedCards';
import { getPublishedPositions } from '@/lib/notion';
import staticPositions from '@/data/positions.json';

export const metadata: Metadata = {
  title: '採用情報',
  description:
    '株式会社GIFTでは、コールセンタースタッフ、ITエンジニア、プロジェクトマネージャー、法人営業職を募集しています。あなたのキャリアを一緒に形にしませんか。',
  alternates: { canonical: '/recruit' },
};

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
      <main className="bg-white">
        {/* ── Hero ── dual-video crossfade, cinematic gradient, white text */}
        <VideoCrossfade
          src1="/video/call-center-vid-recruit.mp4"
          src2="/video/recruit-vid-2.mp4"
          className="flex min-h-[90vh] flex-col justify-center px-5 py-[120px] md:px-10"
        >
          <div className="hero-enter mx-auto w-full max-w-fit">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-white/60">
              RECRUIT
            </p>
            <h1
              className="font-nube-display text-white"
              style={{ fontSize: 'clamp(40px, 6vw, 60px)', lineHeight: '1.4' }}
            >
              募集しています。
            </h1>

            <div className="mt-10">
              <Link
                href="#positions"
                data-elastic-pulse-btn
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-nube-sans text-body-sm font-normal uppercase tracking-wider text-gift-ink transition-opacity duration-100 ease-out hover:opacity-90"
              >
                応募する
              </Link>
            </div>
          </div>
        </VideoCrossfade>

        {/* ── WHY GIFT — spread intro ── */}
        <ScrollRevealSpread className="bg-white" minHeight="130vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/60">
              WHY GIFT
            </p>
            <div
              className="font-nube-display text-gift-ink"
              style={{ fontSize: 'clamp(32px, 7vw, 96px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">GIFTで働く、</span>
              <span className="srs-w">4つの魅力</span>
            </div>
          </div>
        </ScrollRevealSpread>

        {/* WHY GIFT — stacked card carousel */}
        <WhyGiftStackedCards />

        {/* ── WHY GIFT — marquee band ── */}
        <section aria-hidden className="select-none overflow-hidden bg-gift-ink py-7">
          {/* Row 1 forward */}
          <div className="mb-3 flex w-max animate-marquee items-center gap-0 whitespace-nowrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={`r1-${i}`} className="flex items-center">
                {(
                  [
                    { text: 'JOIN US', jp: false, sep: 'dash' },
                    { text: '仲間になろう', jp: true, sep: 'dash' },
                    { text: 'GROW TOGETHER', jp: false, sep: 'dash' },
                    { text: '成長', jp: true, sep: 'dash' },
                    { text: 'CHALLENGE', jp: false, sep: 'dash' },
                    { text: '挑戦', jp: true, sep: 'dash' },
                    { text: 'MAKE AN IMPACT', jp: false, sep: 'logo' },
                    { text: '可能性', jp: true, sep: 'dash' },
                    { text: 'CAREER', jp: false, sep: 'dash' },
                    { text: 'キャリア', jp: true, sep: 'dash' },
                    { text: 'BE THE FUTURE', jp: false, sep: 'dash' },
                    { text: '未来', jp: true, sep: 'logo' },
                  ] as { text: string; jp: boolean; sep: 'dash' | 'logo' }[]
                ).map(({ text, jp, sep }) => (
                  <span key={text} className="flex items-center">
                    <span
                      className="font-nube-display font-extrabold tracking-tight"
                      style={{
                        fontSize: 'clamp(30px, 4.5vw, 64px)',
                        color: jp ? 'rgba(235,238,243,0.55)' : 'rgba(235,238,243,0.9)',
                      }}
                    >
                      {text}
                    </span>
                    {sep === 'logo' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 828 800"
                        className="mx-7 shrink-0"
                        style={{ height: 'clamp(24px, 3.2vw, 44px)', width: 'auto' }}
                      >
                        <path
                          fill="rgba(235,238,243,0.6)"
                          d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"
                        />
                        <path
                          fill="#111B21"
                          d="M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z"
                        />
                        <path
                          fill="#111B21"
                          d="M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z"
                        />
                      </svg>
                    ) : (
                      <span
                        className="mx-5"
                        style={{
                          fontSize: 'clamp(14px, 2vw, 28px)',
                          color: 'rgba(235,238,243,0.2)',
                        }}
                      >
                        ✦
                      </span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </div>

          {/* Row 2 reverse */}
          <div
            className="flex w-max items-center gap-0 whitespace-nowrap"
            style={{ animation: 'marquee 95s linear infinite reverse' }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={`r2-${i}`} className="flex items-center">
                {(
                  [
                    { text: '横断キャリア', jp: true, sep: 'dash' },
                    { text: 'CROSS-DOMAIN', jp: false, sep: 'dash' },
                    { text: '研修', jp: true, sep: 'dash' },
                    { text: 'LEARN', jp: false, sep: 'dash' },
                    { text: 'AI活用', jp: true, sep: 'dash' },
                    { text: 'INNOVATE', jp: false, sep: 'dash' },
                    { text: '共に', jp: true, sep: 'logo' },
                    { text: 'TOGETHER', jp: false, sep: 'dash' },
                    { text: '採用', jp: true, sep: 'dash' },
                    { text: 'KEEP GROWING', jp: false, sep: 'dash' },
                    { text: '挑戦し続ける', jp: true, sep: 'dash' },
                    { text: 'WELCOME TO GIFT', jp: false, sep: 'logo' },
                  ] as { text: string; jp: boolean; sep: 'dash' | 'logo' }[]
                ).map(({ text, jp, sep }) => (
                  <span key={text} className="flex items-center">
                    <span
                      className="font-nube-display font-bold tracking-tight"
                      style={{
                        fontSize: 'clamp(18px, 2.6vw, 38px)',
                        color: jp ? 'rgba(235,238,243,0.3)' : 'rgba(235,238,243,0.18)',
                      }}
                    >
                      {text}
                    </span>
                    {sep === 'logo' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 828 800"
                        className="mx-5 shrink-0"
                        style={{ height: 'clamp(14px, 2vw, 28px)', width: 'auto', opacity: 0.25 }}
                      >
                        <path
                          fill="rgba(235,238,243,0.9)"
                          d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"
                        />
                        <path
                          fill="#111B21"
                          d="M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z"
                        />
                        <path
                          fill="#111B21"
                          d="M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z"
                        />
                      </svg>
                    ) : (
                      <span
                        className="mx-4"
                        style={{
                          fontSize: 'clamp(10px, 1.4vw, 20px)',
                          color: 'rgba(235,238,243,0.15)',
                        }}
                      >
                        ◆
                      </span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </section>

        {/* ── CAREER PATH — spread intro ── */}
        <ScrollRevealSpread className="bg-[#F2F4F5]" minHeight="150vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/60">
              CAREER PATH
            </p>
            <div
              className="mb-8 font-nube-display text-gift-ink"
              style={{ fontSize: 'clamp(32px, 7vw, 96px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">事業を</span>
              <span className="srs-w">またぐキャリア</span>
            </div>
            <p className="mx-auto max-w-2xl text-center font-nube-sans text-body-lg text-gift-ink/55">
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
          bg="#F0F0F0"
        />

        {/* CAREER PATH — path grid */}
        <Reveal>
          <section className="bg-[#F2F4F5] pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {path.map((p) => (
                  <div key={p.title} className="border-t border-gift-ink/30 pt-6 text-center">
                    <p className="mb-2 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/50">
                      {p.label}
                    </p>
                    <h3
                      className="mb-2 font-nube-display text-gift-ink"
                      style={{ fontSize: 'clamp(18px, 1.8vw, 23px)', lineHeight: '1.4' }}
                    >
                      {p.title}
                    </h3>
                    <p className="font-nube-sans text-body-sm text-gift-ink/70">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── HOW TO APPLY — spread intro ── */}
        <ScrollRevealSpread className="bg-white" minHeight="160vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/60">
              HOW TO APPLY
            </p>
            <div
              className="mb-8 font-nube-display text-gift-ink"
              style={{ fontSize: 'clamp(32px, 7vw, 96px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">応募の</span>
              <span className="srs-w">流れ</span>
            </div>
            <p className="mx-auto max-w-2xl text-center font-nube-sans text-body-lg text-gift-ink/55">
              <span className="srs-w">ご応募は各募集ポジションから</span>
              <span className="srs-w">LINE求人アカウントへ</span>
              <span className="srs-w">直接お進みいただけます。</span>
              <span className="srs-w">以降のやり取りは</span>
              <span className="srs-w">LINEを中心に</span>
              <span className="srs-w">スムーズに進めます。</span>
            </p>
          </div>
        </ScrollRevealSpread>

        {/* HOW TO APPLY — step slideshow */}
        <StepSlideshow slides={flow} />

        {/* ── OPEN POSITIONS — spread intro ── */}
        <ScrollRevealSpread className="bg-[#F2F4F5]" minHeight="160vh">
          <div className="mx-auto w-full max-w-fit px-5 text-center md:px-10">
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/60">
              OPEN POSITIONS
            </p>
            <div
              className="mb-8 font-nube-display text-gift-ink"
              style={{ fontSize: 'clamp(32px, 7vw, 96px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">募集中の</span>
              <span className="srs-w">ポジション</span>
            </div>
            <p className="mx-auto max-w-2xl text-center font-nube-sans text-body-lg text-gift-ink/55">
              <span className="srs-w">雇用形態（中途／新卒）は固定せず、</span>
              <span className="srs-w">ポジション単位で募集しています。</span>
              <span className="srs-w">応募者の希望を伺いながら、</span>
              <span className="srs-w">働き方を個別に検討します。</span>
            </p>
          </div>
        </ScrollRevealSpread>

        {/* OPEN POSITIONS — position cards */}
        <Reveal>
          <section id="positions" className="bg-[#F2F4F5] pb-[80px] md:pb-[120px]">
            <div className="mx-auto max-w-fit px-5 md:px-10">
              <div className="grid grid-cols-1 gap-px bg-gift-ink/20 md:grid-cols-2">
                {positions.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 100}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-elastic-pulse-btn
                      className="group flex h-full flex-col bg-white p-8 transition-colors duration-500 hover:bg-gift-ink/[0.04] md:p-10"
                    >
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span className="border border-gift-ink/40 px-3 py-1 font-nube-sans text-body-xs font-normal uppercase tracking-[0.12em] text-gift-ink/70">
                          {p.department}
                        </span>
                        <span className="font-nube-sans text-body-xs text-gift-ink/50">
                          {p.type}
                        </span>
                      </div>

                      <h3
                        className="mb-4 font-nube-display text-gift-ink"
                        style={{ fontSize: 'clamp(20px, 2vw, 23px)', lineHeight: '1.4' }}
                      >
                        {p.title}
                      </h3>
                      <p className="mb-6 font-nube-sans text-body text-gift-ink/70">{p.summary}</p>

                      {p.details && p.details.length > 0 && (
                        <dl className="mb-6 grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 border-t border-gift-ink/10 pt-6">
                          {p.details.map((d) => (
                            <div key={d.label} className="contents">
                              <dt className="font-nube-sans text-body-sm font-semibold text-gift-ink">
                                {d.label}
                              </dt>
                              <dd className="font-nube-sans text-body-sm text-gift-ink/60">
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
                            className="border border-gift-ink/20 px-3 py-0.5 font-nube-sans text-body-xs text-gift-ink/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div
                        data-elastic-pulse-target
                        className="mt-auto flex items-center gap-2 self-start font-nube-sans text-body-sm font-semibold uppercase tracking-wider text-gift-ink"
                      >
                        <span>LINEから応募する</span>
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={2}
                        />
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
            <p className="mb-6 font-nube-sans text-body-xs font-normal uppercase tracking-[0.18em] text-gift-ink/60">
              JOIN US
            </p>
            <div
              className="mb-10 font-nube-display"
              style={{ fontSize: 'clamp(32px, 7vw, 96px)', lineHeight: '1.5' }}
            >
              <span className="srs-w">一緒に、</span>
              <span className="srs-w">新しい挑戦を。</span>
            </div>
            <Link
              href="/contact"
              data-elastic-pulse-btn
              className="inline-flex items-center justify-center rounded-full bg-gift-ink px-8 py-4 font-nube-sans text-body-sm font-normal uppercase tracking-wider text-white transition-opacity duration-100 ease-out hover:opacity-90"
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
