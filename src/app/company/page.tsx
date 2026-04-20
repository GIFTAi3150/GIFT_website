import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import company from '@/data/company.json';
import PhotoCarousel from '@/components/sections/PhotoCarousel';

const infoRows = [
  { label: '会社名', value: `${company.name} / ${company.nameEn}` },
  { label: '設立', value: company.founded },
  { label: '代表取締役', value: company.ceo },
  { label: '所在地', value: company.address },
  { label: 'TEL', value: company.phone },
  { label: '事業内容', value: 'コールセンター事業 / DXコンサル事業 / 財務コンサル事業' },
  { label: 'インボイス番号', value: company.invoiceNumber },
];

const history = [
  { year: '2018', event: '株式会社GIFTを北海道札幌市にて設立。コールセンター事業を開始。' },
  { year: '2020', event: 'DXコンサル事業を開始（LINE公式・Lステップ構築/運用など）。' },
  { year: '2024', event: '財務コンサル事業を開始（予定・確認中）。' },
  { year: '2026', event: '新コーポレートサイトをローンチ。' },
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

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Top of lobes — two small bumps */}
      <rect x="6" y="6" width="4" height="1" />
      <rect x="14" y="6" width="4" height="1" />
      {/* Lobes expanding */}
      <rect x="5" y="7" width="6" height="2" />
      <rect x="13" y="7" width="6" height="2" />
      {/* Lobes merging — widest part */}
      <rect x="4" y="9" width="16" height="2" />
      {/* Tapering toward point */}
      <rect x="5" y="11" width="14" height="1" />
      <rect x="6" y="12" width="12" height="1" />
      <rect x="7" y="13" width="10" height="1" />
      <rect x="8" y="14" width="8" height="1" />
      <rect x="9" y="15" width="6" height="1" />
      <rect x="10" y="16" width="4" height="1" />
      <rect x="11" y="17" width="2" height="1" />
    </svg>
  );
}

function ArrowForwardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" shapeRendering="crispEdges" className={className} aria-hidden>
      {/* Horizontal shaft */}
      <rect x="3" y="10" width="14" height="4" />
      {/* Arrowhead pixel steps */}
      <rect x="15" y="8" width="2" height="8" />
      <rect x="17" y="6" width="2" height="12" />
      <rect x="19" y="9" width="2" height="6" />
      <rect x="17" y="9" width="4" height="6" />
    </svg>
  );
}

const valueCards = [
  { title: '挑戦を、支え合う。', body: 'チームで挑む姿勢を大切に。困ったときはお互いに手を差し伸べます。', Icon: SupportIcon },
  { title: '一人ひとりを、尊重する。', body: '背景や役割に関係なく、それぞれの価値観を受け止めます。', Icon: HeartIcon },
  { title: '誠実に、前に進み続ける。', body: 'ごまかさず、言い訳せず。一歩ずつ、着実に成長していきます。', Icon: ArrowForwardIcon },
];

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Page header — with drifting blobs for atmosphere */}
        <section className="relative overflow-hidden border-b border-gift-border py-s-80">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />
          </div>
          <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              COMPANY
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              会社概要
            </h1>
            <p className="mt-4 font-sans text-normal font-light text-gift-silver">
              {company.subheadline}
            </p>
          </div>
        </section>

        {/* CEO Message */}
        <Reveal>
          <section className="relative overflow-hidden py-s-80">
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
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                MISSION
              </p>
              <p
                className="mb-10 font-display font-bold text-gift-ink"
                style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: '1.05' }}
              >
                Gift an
                <br />
                <span className="text-gift-green">opportunity.</span>
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
          <section className="border-t border-gift-border py-s-80">
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
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
                  >
                    全ての人と社会へ夢やキッカケを与えられる企業として、
                    地域から世界へ、新しい出会いと挑戦の機会を広げていく。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Values */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
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
                          className="group flex flex-col gap-4 rounded-2xl border border-gift-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gift-green/40 hover:shadow-[0_10px_30px_rgba(37,211,102,0.08)]"
                        >
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gift-green/10 text-gift-green transition-colors duration-300 group-hover:bg-gift-green group-hover:text-white">
                            <Icon className="h-7 w-7" />
                          </span>
                          <h3 className="font-sans text-medium font-bold text-gift-ink">
                            {v.title}
                          </h3>
                          <p className="font-sans text-small font-light leading-relaxed text-gift-silver">
                            {v.body}
                          </p>
                        </div>
                      );
                    })}
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
          <section className="border-t border-gift-border py-s-80">
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
          <section className="border-t border-gift-border py-s-80">
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

              <ol className="relative mx-auto max-w-3xl border-l-2 border-gift-green/30 pl-8 sm:pl-12">
                {history.map((item, i) => (
                  <li key={i} className="relative mb-10 last:mb-0">
                    {/* Dot on the timeline */}
                    <span
                      aria-hidden
                      className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gift-green shadow-[0_0_0_4px_rgba(37,211,102,0.15)] sm:-left-[57px]"
                    >
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                    {/* Year + event card */}
                    <div className="rounded-xl border border-gift-border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-green/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                      <p className="mb-2 font-display text-[22px] font-extrabold leading-none text-gift-green">
                        {item.year}
                      </p>
                      <p className="font-sans font-light leading-relaxed text-gift-silver">
                        {item.event}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        {/* Access */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
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
          <section className="border-t border-gift-border py-s-80">
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
