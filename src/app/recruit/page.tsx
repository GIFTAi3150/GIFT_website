import Link from 'next/link';
import { TrendingUp, Shuffle, Sparkles, GraduationCap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { getPublishedPositions } from '@/lib/notion';
import staticPositions from '@/data/positions.json';

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
  { label: 'STEP 1', title: 'コールオペ', body: '現場で顧客接点の基礎を学ぶ。' },
  { label: 'STEP 2', title: 'SV / リーダー', body: 'チーム運営と教育に踏み込む。' },
  { label: 'STEP 3', title: 'DXコンサル', body: '事業の仕組みを設計する側へ。' },
  { label: 'STEP 4', title: '財務コンサル', body: '経営と財務の視座を獲得する。' },
];

const flow = [
  { step: '01', title: 'サイトフォームから応募', body: '当サイトの応募フォームよりご連絡ください。Indeed等の外部プラットフォームからのご応募もこちらに統一しています。' },
  { step: '02', title: 'LINE求人アカウントへご案内', body: '初回連絡後、採用専用のLINE求人アカウントをお伝えします。以降のやり取りはLINE中心で進めます。' },
  { step: '03', title: '面談・選考', body: '部署ごとの採用フローに合わせて面談・選考を進めます。' },
  { step: '04', title: 'ご入社', body: '研修と伴走支援を経てスムーズに立ち上がっていただきます。' },
];

export const dynamic = 'force-dynamic';

export default async function RecruitPage() {
  let positions: { id: string; title: string; type: string; department: string; summary: string; tags: string[] }[] = [];

  try {
    const notionPositions = await getPublishedPositions();
    if (notionPositions.length > 0) {
      positions = notionPositions;
    } else {
      positions = staticPositions;
    }
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
              <Link href="/contact" className="cta-btn cta-btn--deep">
                <span>応募する</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why GIFT — values with glyph icons */}
        <Reveal>
          <section className="py-s-80">
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
                        <p className="font-sans text-small font-light leading-relaxed text-gift-silver">
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
                className="mb-14 max-w-2xl font-sans font-light text-gift-silver"
                style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
              >
                GIFTの特徴は、コール → SV → DX → 財務 と事業を越えて成長できること。一つの現場で終わらないキャリアを歩めます。
              </p>

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

        {/* Positions */}
        <Reveal>
          <section id="positions" className="py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                OPEN POSITIONS
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                募集中のポジション
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {positions.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 2) * 100}>
                    <div className="gift-card !p-7">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-gift-green px-3 py-1 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                          {p.department}
                        </span>
                        <span className="rounded-full bg-gift-bg-alt px-3 py-1 font-sans text-small font-medium text-gift-silver">
                          {p.type}
                        </span>
                      </div>
                      <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                        {p.title}
                      </h3>
                      <p className="mb-5 font-sans text-small font-light leading-relaxed text-gift-silver">
                        {p.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-gift-silver/30 px-3 py-0.5 font-sans text-small text-gift-silver"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Application flow */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
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
                ご応募は当サイトのフォームから統一窓口でお受けしています。その後、採用専用のLINEアカウントでスムーズにやり取りを進めます。
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {flow.map((f) => (
                  <div key={f.step} className="relative rounded-2xl bg-white p-6">
                    <p className="mb-3 font-display text-small font-bold text-gift-green">
                      STEP {f.step}
                    </p>
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">
                      {f.title}
                    </h3>
                    <p className="font-sans text-small font-light leading-relaxed text-gift-silver">
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Final CTA */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
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
