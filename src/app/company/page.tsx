import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Footer from '@/components/layout/Footer';
import company from '@/data/company.json';
import TerrainHero from './_components/TerrainHero';
import CompanyScroll from './_components/CompanyScroll';
import './company.css';

const AccessGlobe = dynamic(() => import('./_components/AccessGlobe'), { ssr: false });
const WhyLiquidBg = dynamic(() => import('./_components/WhyLiquidBg'), { ssr: false });

export const metadata: Metadata = {
  title: '会社概要',
  description:
    'GIFTがAIOpsに取り組む理由、その背景と思想。会社情報・ミッション・ビジョン・バリューをご紹介します。',
  alternates: { canonical: '/company' },
};

// Phrase boundaries for the Mission scrub: each unit becomes one unbreakable
// inline-block, so lines only ever break between phrases (same device as WhoWeAre).
const ZWSP = String.fromCharCode(0x200b);
const ph = (parts: string[]) => parts.join(ZWSP);

const MISSION = [
  ph(['GIFTは、', '現場から', '生まれた', '会社です。', '人と組織が', '毎日向き合い、', '成果を', '積み上げる——', 'そんな現場を、', '私たちは', '長年にわたって', '動かしてきました。']),
  ph(['その経験の中で、', '私たちは', '気づきました。', 'どれだけ', '優れた', 'ツールが', 'あっても、', '使いこなせる', '人と、', '使い続けられる', '仕組みが', 'なければ、', '何も', '変わらない。', '現場こそが、', '変化の', '起点だと', 'いうことを。']),
  ph(['AIが', '急速に', '普及するいま、', 'この問いは', 'さらに', '切実に', 'なっています。', '多くの企業で', 'AIが', '「導入されたまま', '止まっている」', '現実が', 'あります。', '技術の', '問題では', 'ありません。', '現場の仕事に', '溶け込んで', 'いないから、', '人が', '使わないのです。']),
  ph(['GIFTが', 'AIOpsに', '取り組むのは、', 'この課題を、', '私たち自身の', '現場経験から', '解けると', '確信している', 'からです。', '人とAIが、', '毎日の', '業務の中で', '一緒に動く——', 'その状態を', 'つくることが、', '私たちの', '使命です。']),
];

// Same approved sentences; each paragraph's opening sentence is set as the
// bold lead and the remainder as the light continuation (typography, not copy).
const WHY = [
  {
    lead: 'GIFTはもともと、大規模な現場組織を運営してきた会社です。',
    rest: 'エンジニアではない多くのスタッフが、毎日の業務の中で成果を出す——そんな環境を長年にわたって動かしてきました。',
  },
  {
    lead: 'その経験から、私たちは確信しています。',
    rest: 'AIが本当に力を発揮するのは、ツールを導入したときではなく、現場の一人ひとりが日常的に使いこなせるようになったときだということを。',
  },
  {
    lead: 'AIを動かすのは、会社の中身です。',
    rest: '業務の流れ、判断基準の言語化、顧客との対話ルール——それらが整ってはじめて、AIは現場で成果を出す存在になります。私たちはその「中身」をつくることを、現場で学んできました。',
  },
  {
    lead: '専門知識がなくても、AIを使いこなせる組織をつくる。',
    rest: 'GIFTがAIOpsに取り組む理由は、ここにあります。',
  },
];

const infoRows = [
  { label: '会社名', value: `${company.name} / ${company.nameEn}` },
  { label: '設立', value: company.founded },
  { label: '代表取締役', value: company.ceo },
  { label: '所在地', value: company.address },
  { label: 'TEL', value: company.phone },
  { label: '事業内容', value: 'AIOps事業' },
  { label: 'インボイス番号', value: company.invoiceNumber },
];

const values = [
  { kanji: '学', title: '素直に吸収する。', label: '学び', body: '新しいツールも、他者の意見も、まずは受け止める。学び続ける姿勢が、私たちの成長を加速させます。' },
  { kanji: '共', title: '寄り添って動かす。', label: '共感', body: 'お客様の隣に立ち、課題を共に背負う。理解した上で、本当に意味のある一歩を一緒に進めます。' },
  { kanji: '熱', title: '熱を伝染させる。', label: '情熱', body: '一人の本気が、チームを、お客様を、社会を動かす。私たちは熱量で、人と未来を巻き込みます。' },
];

const antiValues = ['古いやり方にしがみつく', '受け身で、変化を恐れる'];

const GMAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

function Label({ text, tone }: { text: string; tone: 'dark' | 'light' }) {
  return (
    <div className={`co-label co-label--${tone}`}>
      <span className="co-label__rule" aria-hidden />
      <span className="co-label__text">{text}</span>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <>
      <main className="company-page" data-flash-guard="">

        {/* ── 1. Scene: hero + mission over one sticky WebGL terrain ─────── */}
        <div className="co-scene">
          <TerrainHero />
          <div className="co-scene__spacer" aria-hidden />

          <section id="mission" className="co-mission co-body-dark">
            <div className="co-container co-mission__grid">
              <div className="co-mission__head">
                <Label text="Mission" tone="dark" />
                <h2 className="co-h2 text-white" data-co-heading>
                  <span className="block">{ph(['関わる', 'すべての', '人に、'])}</span>
                  <span className="block">{ph(['人生が', '変わる'])}</span>
                  <span className="block">
                    <span className="text-[#60a5fa]">きっかけ</span>を贈る。
                  </span>
                </h2>
                <p className="co-mission__en">
                  Gift an <em>opportunity.</em>
                </p>
              </div>

              <div className="co-mission__body">
                <div className="co-rail" aria-hidden>
                  <span className="co-rail__fill" />
                </div>
                {MISSION.map((text, i) => (
                  <p key={i} data-co-phrases>{text}</p>
                ))}
                <div className="co-mission__sign" data-co-fade>
                  株式会社GIFT 代表取締役
                  <strong>{company.ceo}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── 2. Vision — sticky statement on paper ──────────────────────── */}
        <section id="vision" className="co-vision">
          <div className="co-vision__spacer">
            <div className="co-vision__stick">
              <div className="co-vision__grain" aria-hidden />
              <div className="co-vision__marquee" aria-hidden>
                Vision — Vision — Vision — Vision — Vision — Vision —
              </div>
              <div className="co-container co-vision__inner">
                <Label text="Vision" tone="light" />
                <h2 className="m-0">
                  <span className="co-vision__line">AIが当たり前の時代にこそ、</span>
                  <span className="co-vision__line co-vision__line--accent">人の心を動かす</span>
                  <span className="co-vision__line">会社であり続ける。</span>
                </h2>
                <div className="co-vision__rule" aria-hidden />
                <p className="co-vision__en">Move hearts, even in the age of AI.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Why AIOps — the thesis builds itself on a sticky stage, over liquid spheres (OGL) ── */}
        <section id="why" className="co-why co-body-dark">
          <WhyLiquidBg />
          <div className="co-container co-why__grid relative z-10">
            {/* Stage first in DOM so it can stick at the top on phones. Decorative:
                the three foundations are quoted from paragraph 3 of the copy. */}
            <div className="co-why__stage" aria-hidden>
              <div className="co-why__stack" data-co-stack>
                <div className="co-why__block co-why__block--ai" data-co-block="ai">AI</div>
                <div className="co-why__block" data-co-block="3">顧客との対話ルール</div>
                <div className="co-why__block" data-co-block="2">判断基準の言語化</div>
                <div className="co-why__block" data-co-block="1">業務の流れ</div>
              </div>
              <div className="co-why__ground">
                <span className="co-mono">現場</span>
              </div>
            </div>

            <div className="co-why__argument">
              <div className="co-why__head">
                <Label text="Why AIOps" tone="dark" />
                <h2 className="co-h2 text-white" data-co-heading>
                  <span className="block">{ph(['なぜ、', 'GIFTは'])}</span>
                  <span className="block">AIOpsなのか。</span>
                </h2>
              </div>
              {WHY.map((para, i) => {
                const final = i === WHY.length - 1;
                return (
                  <div key={i}>
                    <p className={`co-why__st co-why__lead${final ? ' co-why__lead--final' : ''}`}>
                      {para.lead}
                    </p>
                    <p className="co-why__st co-why__rest">{para.rest}</p>
                  </div>
                );
              })}
              <div className="co-why__link">
                <Link href="/services/aiops" className="cta-btn cta-btn--on-navy">
                  <span>AIOps事業を見る</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Values — the kinetic push machine (pinned) ─────────────── */}
        <section id="values" className="co-values co-body-light">
          <div className="co-values__spacer">
            <div className="co-values__stick">
              <div className="co-container co-values__inner">
                <div className="co-values__head">
                  <Label text="Values" tone="light" />
                  <h2 className="co-h2" data-co-heading>価値観</h2>
                  <p className="co-values__lead">GIFTが大切にしている3つの行動指針</p>
                </div>

                {/* giant outlined kanji of the active value, slides sideways in counter-motion */}
                <div className="co-values__kanji" aria-hidden>
                  {values.map((v, i) => (
                    <span key={v.kanji} style={{ ['--i' as string]: i } as React.CSSProperties}>
                      {v.kanji}
                    </span>
                  ))}
                </div>

                <div className="co-values__machine">
                  <div className="co-values__mask">
                    <ul className="co-values__stack">
                      {values.map((v, i) => (
                        <li key={v.title} className="co-values__item" style={{ ['--i' as string]: i } as React.CSSProperties}>
                          <span className="co-values__tag co-mono">{v.label}</span>
                          <h3 className="co-values__title">{v.title}</h3>
                          <p className="co-values__body">{v.body}</p>
                        </li>
                      ))}
                      <li className="co-values__item" style={{ ['--i' as string]: values.length } as React.CSSProperties}>
                        <span className="co-values__tag co-mono">We&apos;ll never</span>
                        <h3 className="co-values__title">私たちが、選ばない姿勢。</h3>
                        <p className="co-values__body">
                          {antiValues.map((item) => (
                            <span key={item} className="co-values__hollow">{item}</span>
                          ))}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Information — 会社概要 + Access ─────────────────────────── */}
        <section id="information" className="co-info co-body-dark">
          <div className="co-container co-info__grid">
            <div>
              <Label text="Company information" tone="dark" />
              <h2 className="co-h2 text-white" data-co-heading>会社概要</h2>
              <dl className="co-info__rows">
                {infoRows.map((row) => (
                  <div key={row.label} className="co-info__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="co-info__access">
              <Label text="Access" tone="dark" />
              <div className="co-globe">
                <AccessGlobe />
              </div>
              <p className="co-info__addr" data-co-fade>
                <strong>{company.name}</strong>
                {company.address}
                <br />
                TEL: {company.phone}
              </p>
              <a
                href={GMAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="animated-button animated-button--company mt-6"
                data-co-fade
              >
                <span className="text">Google Mapsで開く</span>
                <span className="circle" />
                <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── 6. CTA — the page's one giant word ─────────────────────────── */}
        <section id="contact-cta" className="co-cta">
          <p className="co-cta__meta co-mono">Sapporo, Japan — Est. 2018</p>
          <div className="co-container">
            <Link href="/contact" className="co-cta__word" aria-label="お問い合わせ">
              CONTACT
            </Link>
            <p className="co-cta__lead">お気軽にお問い合わせください</p>
            <div className="co-cta__btn" data-co-fade>
              <Link href="/contact" className="cta-btn cta-btn--on-navy">
                <span>お問い合わせ</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <CompanyScroll />
      </main>
      <Footer />
    </>
  );
}
