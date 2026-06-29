import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import company from '@/data/company.json';
import StoryTimeline from './_components/StoryTimeline';
import CeoMessageReveal from './_components/CeoMessageReveal';
import CompanyAnimations from './_components/CompanyAnimations';
import HeroClipText from '@/components/sections/HeroClipText';
import dynamic from 'next/dynamic';

const AccessGlobe = dynamic(() => import('./_components/AccessGlobe'), { ssr: false });
const CompanySphereBg = dynamic(() => import('./_components/CompanySphereBg'), { ssr: false });
const StrengthDots = dynamic(() => import('./_components/StrengthDots'), { ssr: false });

export const metadata: Metadata = {
  title: '会社概要',
  description:
    'GIFTがAIOpsに取り組む理由、その背景と思想。会社情報・ミッション・ビジョン・バリューをご紹介します。',
  alternates: { canonical: '/company' },
};

const infoRows = [
  { label: '会社名', value: `${company.name} / ${company.nameEn}` },
  { label: '設立', value: company.founded },
  { label: '代表取締役', value: company.ceo },
  { label: '所在地', value: company.address },
  { label: 'TEL', value: company.phone },
  { label: '事業内容', value: 'AIOps事業' },
  { label: 'インボイス番号', value: company.invoiceNumber },
];

type HistoryItem = { year: string; month?: string; isPresent?: boolean; event: string };

const history: HistoryItem[] = [
  { year: '2018', month: '8月', event: '株式会社GIFTを北海道札幌市にて設立。コールセンター事業を開始。' },
  { year: '2022', event: 'Lステップ代理店事業を開始。' },
  { year: '2024', event: 'Lステップ代理店の認定を取得。' },
  { year: '2025', event: 'コールセンター従業員が100名を突破。' },
  { year: '2026', event: 'コールセンター従業員が300名を突破。' },
  { year: '2026', isPresent: true, event: '財務パートナーズと業務提携を開始。法人向け商材を立ち上げつつ、次なる事業展開としてAI領域の準備を進行中。' },
];


function NoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      <rect x="4" y="4" width="2" height="2" /><rect x="6" y="6" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" /><rect x="10" y="10" width="4" height="4" />
      <rect x="14" y="14" width="2" height="2" /><rect x="16" y="16" width="2" height="2" />
      <rect x="18" y="18" width="2" height="2" /><rect x="18" y="4" width="2" height="2" />
      <rect x="16" y="6" width="2" height="2" /><rect x="14" y="8" width="2" height="2" />
      <rect x="8" y="14" width="2" height="2" /><rect x="6" y="16" width="2" height="2" />
      <rect x="4" y="18" width="2" height="2" />
    </svg>
  );
}

const valueCards = [
  { num: '01', title: '素直に吸収する。', label: '学び', body: '新しいツールも、他者の意見も、まずは受け止める。学び続ける姿勢が、私たちの成長を加速させます。' },
  { num: '02', title: '寄り添って動かす。', label: '共感', body: 'お客様の隣に立ち、課題を共に背負う。理解した上で、本当に意味のある一歩を一緒に進めます。' },
  { num: '03', title: '熱を伝染させる。', label: '情熱', body: '一人の本気が、チームを、お客様を、社会を動かす。私たちは熱量で、人と未来を巻き込みます。' },
];

const antiValues = ['古いやり方にしがみつく', '受け身で、変化を恐れる'];

/* ── Section label with decorative animated line ────────────────────────── */
function SectionLabel({ text, color = '#2563EB' }: { text: string; color?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        data-deco-line
        className="inline-block h-px w-8 origin-left"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <p
        data-gsap="label"
        className="font-forum text-small font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {text}
      </p>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <>
      {/* GSAP + Lenis orchestrator — client-only, renders null */}
      <CompanyAnimations />

      <main className="company-palette bg-[#F0F7FF]">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <HeroClipText />

        {/* Pulled up one viewport so the hero's column-wipe uncovers this content
            from behind; zIndex:0 keeps it UNDER the zIndex:10 hero. The -100svh is
            always one viewport (independent of the hero wrapper's wipe-length height). */}
        <div style={{ marginTop: '-100svh', position: 'relative', zIndex: 0 }}>

        {/* ── CEO Message / Mission ────────────────────────────────────── */}
        <section id="ceo-message" className="relative overflow-hidden border-t border-gift-border py-s-80" style={{ background: '#F0F7FF' }}>
          <CompanySphereBg variant="hero" opacity={0.5} colorCycle />

          <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
            <SectionLabel text="MISSION" />

            <h2
              data-gsap="heading"
              className="mb-5 font-shippori text-gift-ink"
              style={{ fontSize: 'clamp(28px, 4.4vw, 48px)', lineHeight: '1.5' }}
            >
              関わるすべての人に、
              <br className="hidden sm:inline" />
              人生が変わる<span className="text-[#2563EB]">きっかけ</span>を贈る。
            </h2>

            <p
              data-gsap="fade"
              className="mb-12 font-forum text-gift-silver"
              style={{ fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: '1.2', letterSpacing: '0.02em' }}
            >
              Gift an{' '}
              <span className="font-medium text-[#60a5fa]">opportunity.</span>
            </p>

            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              GIFTは、現場から生まれた会社です。人と組織が毎日向き合い、成果を積み上げる——そんな現場を、私たちは長年にわたって動かしてきました。
            </p>
            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              その経験の中で、私たちは気づきました。どれだけ優れたツールがあっても、使いこなせる人と、使い続けられる仕組みがなければ、何も変わらない。現場こそが、変化の起点だということを。
            </p>
            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              AIが急速に普及するいま、この問いはさらに切実になっています。多くの企業でAIが「導入されたまま止まっている」現実があります。技術の問題ではありません。現場の仕事に溶け込んでいないから、人が使わないのです。
            </p>
            <p data-highlight-text className="font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              GIFTがAIOpsに取り組むのは、この課題を、私たち自身の現場経験から解けると確信しているからです。人とAIが、毎日の業務の中で一緒に動く——その状態をつくることが、私たちの使命です。
            </p>

            <CeoMessageReveal />

            <p data-gsap="fade" className="mt-8 font-shippori text-normal text-gift-ink">
              株式会社GIFT 代表取締役
              <br />
              <span className="font-semibold">{company.ceo}</span>
            </p>
          </div>
        </section>

        {/* ── Vision ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t border-gift-border bg-white py-s-80">
          {/* The REAL plaid Strength animation: drifting solid dots + hollow
              rings that pop in/out (lottie.host 51f95e13 + 381382b9), recolored. */}
          <StrengthDots opacity={0.92} />

          {/* Oversized watermark — sits behind content, bottom-right anchor */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 right-0 select-none font-display font-black uppercase leading-none text-black/[0.038]"
            style={{ fontSize: 'clamp(110px, 20vw, 260px)', letterSpacing: '-0.05em' }}
          >
            VISION
          </span>

          <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">

            <SectionLabel text="VISION" color="#6366F1" />

            {/* Big editorial statement — the visual centrepiece */}
            <h2
              data-gsap="heading"
              className="mt-10 font-shippori text-gift-ink [line-break:strict]"
              style={{ fontSize: 'clamp(26px, 4.6vw, 58px)', lineHeight: '1.4' }}
            >
              AIが当たり前の<br className="sm:hidden" />時代にこそ、<br />
              <span className="text-[#6366F1]">人の心を動かす</span><br className="sm:hidden" />
              会社であり続ける。
            </h2>

            <div className="mt-10 h-px w-16 bg-[#6366F1]" aria-hidden />

            {/* EN subtitle */}
            <p
              data-gsap="fade"
              className="mt-6 font-forum uppercase tracking-[0.22em] text-gift-silver"
              style={{ fontSize: 'clamp(12px, 1.0vw, 13px)' }}
            >
              Move hearts, even in the age of AI.
            </p>

          </div>
        </section>

        {/* ── Why AIOps（GIFTがAIOpsに取り組む理由） ───────────────────── */}
        <section id="why-aiops" className="relative overflow-hidden border-t border-gift-border py-s-80" style={{ background: '#F0F7FF' }}>
          <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
            <SectionLabel text="WHY AIOPS" />

            <h2
              data-gsap="heading"
              className="mb-10 font-shippori text-gift-ink"
              style={{ fontSize: 'clamp(28px, 4.4vw, 48px)', lineHeight: '1.5' }}
            >
              なぜ、GIFTは
              <br className="hidden sm:inline" />
              AIOpsなのか。
            </h2>

            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              GIFTはもともと、大規模な現場組織を運営してきた会社です。エンジニアではない多くのスタッフが、毎日の業務の中で成果を出す——そんな環境を長年にわたって動かしてきました。
            </p>
            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              その経験から、私たちは確信しています。AIが本当に力を発揮するのは、ツールを導入したときではなく、現場の一人ひとりが日常的に使いこなせるようになったときだということを。
            </p>
            <p data-highlight-text className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              AIを動かすのは、会社の中身です。業務の流れ、判断基準の言語化、顧客との対話ルール——それらが整ってはじめて、AIは現場で成果を出す存在になります。私たちはその「中身」をつくることを、現場で学んできました。
            </p>
            <p data-highlight-text className="font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
              専門知識がなくても、AIを使いこなせる組織をつくる。GIFTがAIOpsに取り組む理由は、ここにあります。
            </p>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────────── */}
        {/* blc-round outer: transparent clipper — overflow:hidden on this, not the card */}
        <div id="js-values-blc" className="mx-4 overflow-clip md:mx-6">
          {/* blc-round-bg: the ENTIRE card (bg color + content). GSAP animates this as one unit. */}
          <div
            id="js-values-blc-bg"
            className="relative overflow-clip rounded-2xl backdrop-blur-sm"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 5% 95%, rgba(99,102,241,0.22) 0%, transparent 55%), rgba(10,14,26,0.85)',
            }}
          >
          {/* Same plaid Strength dots motion as Vision, gold-recolored for the
              dark card + mirrored layout so it reads distinct from Vision. */}
          <StrengthDots variant="values" opacity={0.85} />
          <section id="js-values-section" className="relative z-10 py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">

            {/* Section header — full width, label left / descriptor right */}
            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel text="VALUES" color="#6366F1" />
                <h2
                  data-gsap="heading"
                  className="font-shippori text-white"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  価値観
                </h2>
              </div>
              <p className="font-shippori text-[13px] leading-relaxed text-white/30 sm:text-right">
                GIFTが大切にしている<br className="hidden sm:inline" />3つの行動指針
              </p>
            </div>

            {/* Card grid — 3 col (biscom style) */}
            <div className="b-values-grid mt-8 grid grid-cols-1 gap-x-16 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
              {valueCards.map((v) => (
                <div key={v.title} className="relative pt-8">
                  {/* Biscom oval number badge — absolutely positioned outside card top-left */}
                  <div
                    data-gsap="b-index"
                    className="absolute left-2 -top-6 grid h-10 w-[65px] place-items-center sm:-left-2 md:-left-4 lg:-left-6 lg:h-11 lg:w-[85px]"
                  >
                    <div className="absolute inset-0 -rotate-[30deg] rounded-full bg-black/20" />
                    <span className="relative z-10 font-mono text-[11px] tracking-[0.3em] text-[#f0d372]">
                      {v.num}
                    </span>
                  </div>
                  {/* Title + orange pill */}
                  <div data-gsap="card-title" className="mb-5 flex flex-wrap items-center gap-3">
                    <h3
                      className="font-shippori text-white [line-break:strict]"
                      style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', lineHeight: '1.4' }}
                    >
                      {v.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[#6366F1] px-4 py-[5px] font-forum text-[12px] font-semibold text-white">
                      {v.label}
                    </span>
                  </div>
                  {/* Body */}
                  <p data-gsap="card-text" className="font-shippori text-[15px] leading-[2.1] text-white/50 [line-break:strict]">
                    {v.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Anti-values */}
            <div className="relative mt-20 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 md:p-10">
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <span aria-hidden className="h-[2px] w-10 rounded-full bg-[#4F46E5]" />
                  <p className="font-forum text-small font-bold uppercase tracking-widest text-[#4F46E5]">
                    We&apos;ll Never
                  </p>
                </div>
                <h3
                  data-gsap="fade"
                  className="mb-7 font-shippori text-white"
                  style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: '1.4' }}
                >
                  私たちが、選ばない姿勢。
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {antiValues.map((item) => (
                    <div
                      key={item}
                      data-gsap="anti-card"
                      className="group flex cursor-pointer items-start gap-4 rounded-xl border border-white/15 bg-white/[0.07] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#4F46E5]/50 hover:bg-white/[0.1] hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.4),0_0_30px_-5px_rgba(99,102,241,0.25)] active:scale-[0.99]"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4F46E5] text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)] transition-transform duration-300 group-hover:scale-110">
                        <NoIcon className="h-6 w-6" />
                      </span>
                      <p className="pt-1 font-shippori text-[15px] leading-relaxed text-white/90">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          </section>
          </div>{/* end #js-values-blc-bg */}
        </div>{/* end #js-values-blc */}

        {/* ── Company Info ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t border-gift-border bg-white py-s-80">
          {/* Faint background strings — decorative only */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 select-none font-display font-black uppercase leading-none text-black/[0.035] md:-bottom-6"
            style={{ fontSize: 'clamp(50px, 18vw, 240px)', letterSpacing: '-0.05em' }}
          >
            COMPANY
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-8 select-none font-forum uppercase tracking-[0.4em] text-black/[0.05]"
            style={{ fontSize: 'clamp(11px, 1.3vw, 14px)' }}
          >
            Est. 2018 — Sapporo, Japan
          </span>

          <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="mb-12">
              <SectionLabel text="COMPANY INFORMATION" />
              <h2
                data-gsap="heading"
                className="font-shippori text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                会社概要
              </h2>
            </div>

            <dl className="border-t border-gift-border">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  data-gsap="row"
                  className="grid grid-cols-1 border-b border-gift-border py-5 sm:grid-cols-4 sm:gap-6"
                >
                  <dt className="mb-1 font-forum text-small uppercase tracking-widest text-[#2563EB] sm:mb-0 sm:col-span-1">
                    {row.label}
                  </dt>
                  <dd className="font-shippori text-normal text-gift-ink sm:col-span-3">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── History — temporarily hidden (一旦非表示) ───────────────── */}
        {false && (
        <section className="border-t border-gift-border bg-[#F0F7FF] pb-0 pt-s-80">
          <div className="mx-auto max-w-container px-4 pb-10 md:px-6 lg:px-8">
            <SectionLabel text="HISTORY" />
            <h2
              data-gsap="heading"
              className="font-shippori text-gift-ink"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
            >
              沿革
            </h2>
          </div>
          <StoryTimeline items={history} />
        </section>
        )}

        {/* ── Access ───────────────────────────────────────────────────── */}
        <section className="border-t border-gift-border bg-white py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <div className="mb-10">
              <SectionLabel text="ACCESS" />
              <h2
                data-gsap="heading"
                className="font-shippori text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                アクセス
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2" data-gsap="fade">
                <p className="mb-2 font-shippori text-normal text-gift-ink">{company.name}</p>
                <p className="mb-6 font-shippori text-gift-silver" style={{ lineHeight: '2' }}>
                  {company.address}
                </p>
                <p className="font-shippori text-small text-gift-silver">TEL: {company.phone}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="animated-button animated-button--company mt-6"
                >
                  <span className="text">Google Mapsで開く</span>
                  <span className="circle" />
                  <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                </a>
              </div>
              <div className="lg:col-span-3" data-gsap="fade">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gift-border bg-[#04101c] sm:aspect-[16/10]">
                  <AccessGlobe />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-t border-gift-border bg-[#F0F7FF] py-s-80">
          <CompanySphereBg variant="blob" opacity={0.5} colorCycle />
          <div className="relative z-10 mx-auto max-w-container px-4 text-center md:px-6 lg:px-8" data-gsap="fade">
            <Link href="/contact" className="cta-btn cta-btn--company">
              <span>お問い合わせ</span>
            </Link>
          </div>
        </section>

        </div>{/* end pull-up wrapper (reveal-behind hero) */}

      </main>
      <Footer />
    </>
  );
}
