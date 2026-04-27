import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import company from '@/data/company.json';
import PhotoCarousel from '@/components/sections/PhotoCarousel';
import HistoryCarousel from '@/components/sections/HistoryCarousel';
import FadeUpText from '@/components/ui/FadeUpText';

export const metadata: Metadata = {
  title: '会社概要',
  description:
    '株式会社GIFTの会社情報、ミッション・ビジョン・バリュー、沿革、代表メッセージをご紹介します。',
  alternates: { canonical: '/company' },
};

const infoRows = [
  { label: '会社名', value: `${company.name} / ${company.nameEn}` },
  { label: '設立', value: company.founded },
  { label: '代表取締役', value: company.ceo },
  { label: '所在地', value: company.address },
  { label: 'TEL', value: company.phone },
  { label: '事業内容', value: 'コールセンター事業 / DXコンサル事業 / 財務コンサル事業' },
  { label: 'インボイス番号', value: company.invoiceNumber },
];

type HistoryItem = {
  year: string;
  month?: string;
  isPresent?: boolean;
  event: string;
};

const history: HistoryItem[] = [
  { year: '2018', month: '8月', event: '株式会社GIFTを北海道札幌市にて設立。コールセンター事業を開始。' },
  { year: '2022', event: 'Lステップ代理店事業を開始。' },
  { year: '2024', event: 'Lステップ代理店の認定を取得。' },
  { year: '2025', event: 'コールセンター従業員が100名を突破。' },
  { year: '2026', event: 'コールセンター従業員が300名を突破。' },
  { year: '2026', isPresent: true, event: '財務パートナーズと業務提携を開始。法人向け商材を立ち上げつつ、次なる事業展開としてAI領域の準備を進行中。' },
];

// Pixel icons for the 3 VALUES cards
function SupportIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Left person */}
      <rect x="4" y="5" width="4" height="4" />
      <rect x="3" y="10" width="6" height="6" />
      <rect x="2" y="14" width="2" height="6" />
      <rect x="8" y="14" width="2" height="6" />
      {/* Right person */}
      <rect x="16" y="5" width="4" height="4" />
      <rect x="15" y="10" width="6" height="6" />
      <rect x="14" y="14" width="2" height="6" />
      <rect x="20" y="14" width="2" height="6" />
      {/* Connecting hands between them */}
      <rect x="10" y="12" width="4" height="2" />
    </svg>
  );
}

function SproutIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Left leaf */}
      <rect x="3" y="6" width="2" height="2" />
      <rect x="2" y="8" width="5" height="2" />
      <rect x="3" y="10" width="5" height="2" />
      <rect x="5" y="12" width="4" height="1" />
      {/* Right leaf */}
      <rect x="19" y="6" width="2" height="2" />
      <rect x="17" y="8" width="5" height="2" />
      <rect x="16" y="10" width="5" height="2" />
      <rect x="15" y="12" width="4" height="1" />
      {/* Stem */}
      <rect x="11" y="8" width="2" height="11" />
      {/* Soil base */}
      <rect x="5" y="19" width="14" height="1" />
      <rect x="6" y="20" width="12" height="2" />
    </svg>
  );
}

function NoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Top-left to bottom-right stroke */}
      <rect x="4" y="4" width="2" height="2" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="8" y="8" width="2" height="2" />
      <rect x="10" y="10" width="4" height="4" />
      <rect x="14" y="14" width="2" height="2" />
      <rect x="16" y="16" width="2" height="2" />
      <rect x="18" y="18" width="2" height="2" />
      {/* Top-right to bottom-left stroke */}
      <rect x="18" y="4" width="2" height="2" />
      <rect x="16" y="6" width="2" height="2" />
      <rect x="14" y="8" width="2" height="2" />
      <rect x="8" y="14" width="2" height="2" />
      <rect x="6" y="16" width="2" height="2" />
      <rect x="4" y="18" width="2" height="2" />
    </svg>
  );
}

function FlameIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Top tip */}
      <rect x="11" y="2" width="2" height="2" />
      {/* Tapering up */}
      <rect x="10" y="4" width="4" height="2" />
      <rect x="9" y="6" width="6" height="2" />
      {/* Body widest */}
      <rect x="7" y="8" width="10" height="2" />
      <rect x="6" y="10" width="12" height="2" />
      <rect x="5" y="12" width="14" height="2" />
      <rect x="5" y="14" width="14" height="2" />
      {/* Base curving in */}
      <rect x="6" y="16" width="12" height="2" />
      <rect x="7" y="18" width="10" height="2" />
      <rect x="9" y="20" width="6" height="1" />
    </svg>
  );
}

const valueCards = [
  {
    title: '素直に吸収する。',
    body: '新しいツールも、他者の意見も、まずは受け止める。学び続ける姿勢が、私たちの成長を加速させます。',
    Icon: SproutIcon,
  },
  {
    title: '寄り添って動かす。',
    body: 'お客様の隣に立ち、課題を共に背負う。理解した上で、本当に意味のある一歩を一緒に進めます。',
    Icon: SupportIcon,
  },
  {
    title: '熱を伝染させる。',
    body: '一人の本気が、チームを、お客様を、社会を動かす。私たちは熱量で、人と未来を巻き込みます。',
    Icon: FlameIcon,
  },
];

const antiValues = [
  '古いやり方にしがみつく',
  '受け身で、変化を恐れる',
];

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero — "Constellation of values": deep teal gradient (between green and blue), distinct from the
             three other gift-ink heroes. Green nodes + electric lines feel right against a teal ocean. */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0F3845] via-[#0C2D36] to-[#0A242D]">
          {/* Background layers */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Corner glows */}
            <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gift-green/15 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-gift-green-teal/20 blur-[120px]" />

            {/* Mobile-only constellation — covers the whole hero (no corner-tucked mini), uses the
                SAME single-traveling-pulse animation as desktop. viewBox is tightly framed around the
                constellation so it appears prominent and centered behind the hero text. */}
            <svg
              className="absolute inset-0 h-full w-full md:hidden"
              viewBox="73 0 90 90"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              {/* Dim base path — single Eulerian circuit covering all 7 original constellation edges:
                  機会→挑戦→成長→人→未来→信頼→成長→機会 */}
              <path
                d="M 112 16 L 144 10 L 128 46 L 90 80 L 118 80 L 146 72 L 128 46 L 112 16"
                stroke="rgba(37,211,102,0.25)"
                strokeWidth="0.45"
                fill="none"
              />
              {/* Bright traveling-pulse overlay — single dash that slides along the whole loop */}
              <path
                d="M 112 16 L 144 10 L 128 46 L 90 80 L 118 80 L 146 72 L 128 46 L 112 16"
                pathLength="100"
                stroke="#25D366"
                strokeWidth="0.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="constellation-trail"
              />

              {/* Glowing nodes — animation-delay timed to the % of path length where each one sits */}
              <circle cx="112" cy="16" className="constellation-glow-node" style={{ animationDelay: '0s' }} />
              <circle cx="144" cy="10" className="constellation-glow-node" style={{ animationDelay: '1.06s' }} />
              <circle cx="128" cy="46" className="constellation-glow-node" style={{ animationDelay: '2.34s' }} />
              <circle cx="128" cy="46" className="constellation-glow-node" style={{ animationDelay: '6.89s' }} />
              <circle cx="90" cy="80" className="constellation-glow-node" style={{ animationDelay: '4s' }} />
              <circle cx="118" cy="80" className="constellation-glow-node" style={{ animationDelay: '4.92s' }} />
              <circle cx="146" cy="72" className="constellation-glow-node" style={{ animationDelay: '5.86s' }} />
            </svg>

            {/* Desktop constellation — same single-traveling-pulse animation, but using the wider 160x90
                viewBox with the constellation anchored to the right (xMaxYMid slice) so it sits in the
                right half of the hero, with the kanji labels visible next to each node. */}
            <svg
              className="absolute inset-0 hidden h-full w-full md:block"
              viewBox="0 0 160 90"
              preserveAspectRatio="xMaxYMid slice"
              aria-hidden
            >
              {/* Dim base path — single Eulerian circuit covering all 7 original constellation edges */}
              <path
                d="M 112 16 L 144 10 L 128 46 L 90 80 L 118 80 L 146 72 L 128 46 L 112 16"
                stroke="rgba(37,211,102,0.25)"
                strokeWidth="0.18"
                fill="none"
              />
              {/* Bright traveling-pulse overlay */}
              <path
                d="M 112 16 L 144 10 L 128 46 L 90 80 L 118 80 L 146 72 L 128 46 L 112 16"
                pathLength="100"
                stroke="#25D366"
                strokeWidth="0.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="constellation-trail"
              />

              {/* Nodes with kanji labels — circles glow when the pulse passes; labels stay static.
                  The 成長 node has TWO circles because the Eulerian path visits it twice (once at 29.29%
                  through the loop = 2.34s, and again at 86.16% = 6.89s). */}
              <g>
                <circle cx="112" cy="16" className="constellation-glow-node" style={{ animationDelay: '0s' }} />
                <text x="114.5" y="17.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">機会</text>
              </g>
              <g>
                <circle cx="144" cy="10" className="constellation-glow-node" style={{ animationDelay: '1.06s' }} />
                <text x="146.5" y="11.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">挑戦</text>
              </g>
              <g>
                <circle cx="128" cy="46" className="constellation-glow-node" style={{ animationDelay: '2.34s' }} />
                <circle cx="128" cy="46" className="constellation-glow-node" style={{ animationDelay: '6.89s' }} />
                <text x="130.5" y="47.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">成長</text>
              </g>
              <g>
                <circle cx="146" cy="72" className="constellation-glow-node" style={{ animationDelay: '5.86s' }} />
                <text x="148.5" y="73.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">信頼</text>
              </g>
              <g>
                <circle cx="90" cy="80" className="constellation-glow-node" style={{ animationDelay: '4s' }} />
                <text x="85" y="83.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">人</text>
              </g>
              <g>
                <circle cx="118" cy="80" className="constellation-glow-node" style={{ animationDelay: '4.92s' }} />
                <text x="120.5" y="81.5" fill="rgba(255,255,255,0.6)" fontSize="3.2" fontWeight="500" fontFamily="var(--font-noto-jp), sans-serif">未来</text>
              </g>
            </svg>
          </div>

          <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-container flex-col justify-center px-4 py-s-80 md:px-6 lg:px-8">
            <p
              className="nav-reveal mb-5 font-display text-small font-bold uppercase tracking-widest text-gift-green"
              style={{ ['--reveal-delay' as string]: '100ms' } as React.CSSProperties}
            >
              COMPANY
            </p>

            <h1
              className="font-sans font-extrabold text-white"
              style={{ fontSize: 'clamp(44px, 7vw, 76px)', lineHeight: '1.05' }}
            >
              <FadeUpText text="会社" delayMs={250} />
              <span className="text-gift-green">
                <FadeUpText text="概要" delayMs={520} />
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
              {company.subheadline}
            </p>

            <div
              className="nav-reveal mt-10"
              style={{ ['--reveal-delay' as string]: '1300ms' } as React.CSSProperties}
            >
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </div>
        </section>

        {/* CEO Message */}
        <Reveal>
          <section className="relative overflow-hidden border-t border-gift-border bg-gift-bg-alt py-s-80">
            {/* Giant faded logo as background watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden"
            >
              <svg
                viewBox="0 0 828 800"
                preserveAspectRatio="xMidYMid meet"
                className="h-[70%] max-w-none translate-x-[20%] opacity-[0.15] sm:h-[80%] sm:translate-x-[15%] lg:h-[90%] lg:translate-x-[10%]"
                aria-hidden
              >
                {/* Shield outer */}
                <path
                  fill="#2d6b3f"
                  d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"
                />
                {/* G — main shape */}
                <path
                  fill="#eeebe3"
                  d="M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z"
                />
                {/* G — bar */}
                <path
                  fill="#eeebe3"
                  d="M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z"
                />
              </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
              <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                MISSION
              </p>

              {/* Japanese mission — primary headline */}
              <h2
                className="mb-5 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 4.4vw, 48px)', lineHeight: '1.5' }}
              >
                関わるすべての人に、
                <br className="hidden sm:inline" />
                人生が変わる<span className="text-gift-green">きっかけ</span>を贈る。
              </h2>

              {/* English brand line — subtitle, supporting */}
              <p
                className="mb-12 font-display font-light text-gift-silver"
                style={{ fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: '1.2', letterSpacing: '0.02em' }}
              >
                Gift an{' '}
                <span className="font-medium text-[#7EE0B5]">
                  opportunity.
                </span>
              </p>

              <p
                className="mb-6 font-sans font-light text-gift-silver"
                style={{ lineHeight: '2' }}
              >
                かつて、自分の人生について深く考えたのは、ある出来事がキッカケだった。
              </p>
              <p
                className="mb-6 font-sans font-light text-gift-silver"
                style={{ lineHeight: '2' }}
              >
                私の過去、現在、そして未来。
                自分自身がこれまでに数え切れないほどの出会い、挑戦、成功、失敗、そして挫折を経験し、
                それら全てが「キッカケ」という貴重なギフトだと気づいた。
              </p>
              <p
                className="mb-6 font-sans font-light text-gift-silver"
                style={{ lineHeight: '2' }}
              >
                それに気づいたときから、私たちの使命は、
                株式会社GIFTを設立し『人と企業の人生に寄り添いながら』事業を展開していくこと。
                そして、誰かの人生を変えるような「キッカケ」というギフトを与え続けること。
              </p>
              <p className="font-sans font-light text-gift-silver" style={{ lineHeight: '2' }}>
                そんな会社を目指し、今日も私たちは前進する。
              </p>
              <p className="mt-8 font-sans text-normal text-gift-ink">
                株式会社GIFT 代表取締役
                <br />
                <span className="font-semibold">{company.ceo}</span>
              </p>
            </div>
          </section>
        </Reveal>

        {/* Vision */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    VISION
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    展望
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <p
                    className="font-sans font-bold text-gift-ink"
                    style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', lineHeight: '1.6' }}
                  >
                    AIが当たり前の時代にこそ、
                    <br className="hidden sm:inline" />
                    <span className="text-[#7EE0B5]">人の心を動かす</span>会社であり続ける。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Values */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    VALUES
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    価値観
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {valueCards.map((v) => {
                      const Icon = v.Icon;
                      return (
                        <div
                          key={v.title}
                          className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-gift-border bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-gift-green/40 hover:shadow-[0_20px_40px_-12px_rgba(37,211,102,0.3),0_0_30px_-5px_rgba(37,211,102,0.2)] active:scale-[0.99]"
                        >
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gift-green/10 text-gift-green transition-all duration-300 group-hover:scale-110 group-hover:bg-gift-green/20">
                            <Icon className="h-7 w-7" />
                          </span>
                          <h3 className="font-sans text-medium font-bold text-gift-ink [line-break:strict]">
                            {v.title}
                          </h3>
                          <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver [line-break:strict]">
                            {v.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Anti-values — clean grey manifesto strip, intentional visual break */}
                  <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#6B6B6B] p-7 md:p-9">
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center gap-3">
                        <span aria-hidden className="h-[2px] w-10 rounded-full bg-[#FF4757]" />
                        <p className="font-display text-small font-bold uppercase tracking-widest text-[#FF4757]">
                          We&apos;ll Never
                        </p>
                      </div>
                      <h3
                        className="mb-7 font-sans font-extrabold text-white"
                        style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: '1.4' }}
                      >
                        私たちが、選ばない姿勢。
                      </h3>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {antiValues.map((item) => (
                          <div
                            key={item}
                            className="group flex cursor-pointer items-start gap-4 rounded-xl border border-white/15 bg-white/[0.07] p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#FF4757]/50 hover:bg-white/[0.1] hover:shadow-[0_20px_40px_-12px_rgba(255,71,87,0.4),0_0_30px_-5px_rgba(255,71,87,0.25)] active:scale-[0.99]"
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF4757] text-white shadow-[0_2px_8px_rgba(255,71,87,0.35)] transition-transform duration-300 group-hover:scale-110">
                              <NoIcon className="h-6 w-6" />
                            </span>
                            <p className="pt-1 font-sans text-[15px] font-light leading-relaxed text-white/90">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* TeamPhotoCarousel*/}
        <Reveal>
          <PhotoCarousel showCta />
        </Reveal>

        {/* Company Info Table */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mb-12">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  COMPANY INFORMATION
                </p>
                <h2
                  className="font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  会社概要
                </h2>
              </div>

              <dl className="border-t border-gift-border">
                {infoRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-1 border-b border-gift-border py-5 sm:grid-cols-4 sm:gap-6"
                  >
                    <dt className="mb-1 font-display text-small uppercase tracking-widest text-gift-green sm:mb-0 sm:col-span-1">
                      {row.label}
                    </dt>
                    <dd className="font-sans text-normal font-light text-gift-ink sm:col-span-3">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </Reveal>

        {/* History */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mb-12">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  HISTORY
                </p>
                <h2
                  className="font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  沿革
                </h2>
              </div>

              <HistoryCarousel items={history} />
            </div>
          </section>
        </Reveal>

        {/* Access */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="mb-10">
                <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  ACCESS
                </p>
                <h2
                  className="font-sans font-extrabold text-gift-ink"
                  style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                >
                  アクセス
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
                <div className="lg:col-span-2">
                  <p className="mb-2 font-sans text-normal text-gift-ink">{company.name}</p>
                  <p className="mb-6 font-sans font-light text-gift-silver" style={{ lineHeight: '2' }}>
                    {company.address}
                  </p>
                  <p className="font-sans text-small text-gift-silver">TEL: {company.phone}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="animated-button mt-6"
                  >
                    <span className="text">Google Mapsで開く</span>
                    <span className="circle" />
                    <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                    </svg>
                  </a>
                </div>
                <div className="lg:col-span-3">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-gift-border">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent('北海道札幌市中央区南一条西7丁目21番地1 サントービル')}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 h-full w-full"
                      style={{ border: 0 }}
                      title="GIFT office map"
                      allowFullScreen
                    />
                  </div>
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
                お気軽にお問い合わせください
              </h2>
              <Link href="/contact" className="cta-btn">
                <span>お問い合わせ →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
