import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FinanceScripts from './_components/FinanceScripts';
import { bricolage, inter, jetbrains } from './fonts';
import './finance.css';

export const metadata: Metadata = {
  title: '財務コンサル事業',
  description:
    '財務パートナーズとの業務提携により、融資調達・資金繰り改善を支援。株式会社GIFTの財務コンサルティング事業についてご紹介します。',
  alternates: { canonical: '/services/finance-consulting' },
};

const kpis = [
  { num: '01', label: 'Portfolio', value: 30, suffix: '社+', sub: '支援企業' },
  { num: '02', label: 'Capital', value: 10, prefix: '¥', suffix: '億+', sub: '累計融資調達額' },
  { num: '03', label: 'Approval', value: 90, suffix: '%+', sub: '融資承認率' },
  { num: '04', label: 'Alliance', value: null, raw: '01', suffix: '社', sub: '財務パートナーズ' },
] as const;

const steps = [
  {
    n: '01',
    title: '月次の伴走',
    body: '毎月の数字を一緒に読み、次の打ち手を経営者と共に決めます。',
  },
  {
    n: '02',
    title: '計画 × 資金繰り',
    body: '事業計画と資金繰り表のギャップを毎月キャリブレーション。',
  },
  {
    n: '03',
    title: '金融機関リレーション',
    body: '銀行・公庫・信金との関係性を、長期で共に育てます。',
  },
  {
    n: '04',
    title: '専門家アライアンス',
    body: '税理士・会計士・士業との横断サポートで死角を埋めます。',
  },
];

const audience = [
  '融資の枠を、もう一段押し上げたい',
  '資金繰りを"勘"から外したい',
  '月次決算を経営判断に効かせたい',
  '事業計画書を、銀行に通る形に磨きたい',
  '攻めの財務相手が欲しい',
  'KPIを経営会議の言語にしたい',
];

export default function FinanceConsultingPage() {
  return (
    <>
      <Header />
      <main className={`finance-page ${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}>
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div>
                <div className="hero-eye">
                  <span>Service / 03 · Finance Consulting</span>
                  <span className="live">受付中</span>
                </div>

                <h1 className="h1">
                  <span className="reveal d1">
                    <span className="row">Data-Driven</span>
                  </span>
                  <span className="reveal d2">
                    <span className="row">
                      <span className="ch">Finance.</span>
                    </span>
                  </span>
                  <span className="reveal d3">
                    <span
                      className="row"
                      style={{
                        fontSize: '.45em',
                        color: 'var(--ink-soft)',
                        fontWeight: 400,
                        letterSpacing: '-.02em',
                        marginTop: '.3em',
                      }}
                    >
                      数字を、経営の武器に。
                    </span>
                  </span>
                </h1>

                <p className="dek">
                  融資調達から KPI 設計まで。<strong>「財務パートナーズ」</strong>と業務提携し、
                  <span className="hl">経営者に並走する</span>伴走型コンサルティング。
                </p>

                <div className="hero-actions">
                  <a href="/contact" className="btn btn-pri">
                    無料相談を予約 <span className="a">→</span>
                  </a>
                  <a href="#services" className="btn btn-ghost">
                    <u>提供内容を見る</u>
                  </a>
                </div>
              </div>

              {/* ROTATING CUBE */}
              <div className="cube-stage">
                <div className="cube">
                  {/* FRONT — yen */}
                  <div className="face f-front">
                    <div className="corner">
                      <span>01 · GIFT.FIN</span>
                      <span className="ch">●</span>
                    </div>
                    <div className="yen">¥</div>
                    <div className="yen-sub">FINANCE CONSULTING / 財務</div>
                  </div>

                  {/* RIGHT — approval rate */}
                  <div className="face f-right">
                    <div className="corner">
                      <span>02 · APPROVAL</span>
                      <span className="ch">▲</span>
                    </div>
                    <div className="big" data-cube-count="90">
                      90<sup>%+</sup>
                    </div>
                    <div className="lbl">融資承認率</div>
                  </div>

                  {/* BACK — capital with sparkline */}
                  <div className="face f-back">
                    <div className="corner">
                      <span>03 · CAPITAL</span>
                      <span className="ch">▲ +23.6%</span>
                    </div>
                    <div>
                      <div className="chart-val">¥10億+</div>
                      <div
                        className="lbl"
                        style={{ fontSize: 10, marginTop: 6, color: 'rgba(243,241,231,.4)' }}
                      >
                        累計融資調達額
                      </div>
                    </div>
                    <svg className="spark" viewBox="0 0 200 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="finance-cube-fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#e63946" stopOpacity=".5" />
                          <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,50 L20,46 L40,48 L60,40 L80,42 L100,32 L120,34 L140,22 L160,24 L180,12 L200,8 L200,60 L0,60 Z"
                        fill="url(#finance-cube-fill)"
                      />
                      <path
                        d="M0,50 L20,46 L40,48 L60,40 L80,42 L100,32 L120,34 L140,22 L160,24 L180,12 L200,8"
                        fill="none"
                        stroke="#e63946"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* LEFT — portfolio */}
                  <div className="face f-left">
                    <div className="corner">
                      <span>04 · PORTFOLIO</span>
                      <span className="ch">▲</span>
                    </div>
                    <div className="big">
                      30<sup>社+</sup>
                    </div>
                    <div className="lbl">支援企業 / portfolio</div>
                  </div>

                  {/* TOP — GIFT mark */}
                  <div className="face f-top">
                    <div className="corner">
                      <span>05 · BRAND</span>
                      <span className="ch">●</span>
                    </div>
                    <div className="mark">
                      GIFT<span className="dot"></span>
                    </div>
                    <div className="lbl" style={{ textAlign: 'center' }}>
                      株式会社 GIFT · est. 2018
                    </div>
                  </div>

                  {/* BOTTOM — pulse dots */}
                  <div className="face f-bottom">
                    <div className="corner">
                      <span>06 · LIVE</span>
                      <span className="ch">REAL-TIME</span>
                    </div>
                    <div className="pulse-dots">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} />
                      ))}
                    </div>
                    <div className="lbl" style={{ textAlign: 'right' }}>
                      FINANCE × DATA × HUMAN
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI strip */}
            <div className="kpi-strip">
              {kpis.map((k) => (
                <div className="kpi" key={k.num}>
                  <div className="k">
                    <span>
                      {k.num} · {k.label}
                    </span>
                    <span className="up">▲</span>
                  </div>
                  <div className="v">
                    {'prefix' in k && k.prefix ? k.prefix : null}
                    {k.value !== null ? (
                      <span data-count={k.value}>0</span>
                    ) : (
                      (k as { raw: string }).raw
                    )}
                    <sup>{k.suffix}</sup>
                  </div>
                  <div className="l">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THESIS */}
        <section className="pad">
          <div className="wrap">
            <div className="section-tag in-view">
              <span>
                <span className="num">01 /</span> Thesis
              </span>
              <span>株式会社 GIFT</span>
            </div>
            <h2 className="bighead in-view">
              <span className="light">財務は、</span>経営判断の
              <span className="ch">解像度</span>を上げる。
            </h2>

            <div className="thesis in-view">
              <div className="thesis-text">
                <p>
                  融資の枠を一段押し上げる。資金繰りを<em>&quot;勘&quot;</em>から外す。月次決算を、経営判断に効かせる。
                </p>
                <p>
                  <strong>GIFT × 財務パートナーズ</strong>は、単発のアドバイスではなく、月次で並走する伴走型のスタイル。事業計画と資金繰り表を共にキャリブレーションし、銀行に通る形に磨きます。
                </p>
              </div>
              <div className="thesis-side">
                <div className="row">
                  <div className="b">
                    30<sup>+</sup>
                  </div>
                  <div className="t">
                    支援企業の累計実績
                    <small>portfolio companies</small>
                  </div>
                </div>
                <div className="row">
                  <div className="b">
                    ¥10<sup>億+</sup>
                  </div>
                  <div className="t">
                    累計融資調達額
                    <small>capital raised</small>
                  </div>
                </div>
                <div className="row">
                  <div className="b">
                    90<sup>%+</sup>
                  </div>
                  <div className="t">
                    融資承認率
                    <small>approval rate</small>
                  </div>
                </div>
                <div className="row">
                  <div className="b">月次</div>
                  <div className="t">
                    伴走スタイル
                    <small>monthly cadence</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="pad" style={{ paddingTop: 0 }} id="services">
          <div className="wrap">
            <div className="section-tag in-view">
              <span>
                <span className="num">02 /</span> Services
              </span>
              <span>2 pillars</span>
            </div>
            <h2 className="bighead in-view">
              <span className="light">提供する、</span>2つの柱。
            </h2>

            <div className="svc-grid in-view">
              <a href="#" className="svc">
                <div className="top">
                  <div className="top-left">
                    <div className="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
                        <path d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-6h6v6" />
                      </svg>
                    </div>
                    <span>Pillar 01</span>
                    <span className="badge">融資・資金調達</span>
                  </div>
                  <span className="arr">↗</span>
                </div>
                <div className="body">
                  <h3>
                    融資支援・
                    <br />
                    <span className="ch">資金調達</span>。
                  </h3>
                  <p>
                    事業フェーズに応じた最適な資金調達プランをご提案。金融機関の選定から計画書のチューニングまで、承認に至るプロセスを伴走します。
                  </p>
                </div>
              </a>
              <a href="#" className="svc small">
                <div className="top">
                  <div className="top-left">
                    <div className="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={20} height={20}>
                        <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
                      </svg>
                    </div>
                    <span>Pillar 02</span>
                    <span className="badge">経営コンサル</span>
                  </div>
                  <span className="arr">↗</span>
                </div>
                <div className="body">
                  <h3>
                    経営戦略・
                    <br />
                    <span className="ch">KPI 設計</span>。
                  </h3>
                  <p>
                    財務戦略と KPI 設計で、経営判断に必要な数値基盤を経営者と共に整えます。
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className="pad approach">
          <div className="wrap">
            <div className="section-tag in-view">
              <span>
                <span className="num">03 /</span> Approach
              </span>
              <span>伴走型</span>
            </div>
            <h2 className="bighead in-view">
              <span className="light">単発じゃない。</span>
              <br />
              毎月、一緒に走る。
            </h2>

            <div className="approach-grid in-view">
              <div className="approach-sticky">
                数字を読み、
                <br />
                次の打ち手を
                <br />
                <strong>共に決める。</strong>
                <span className="meta">Monthly cadence · 月次伴走</span>
              </div>
              <div className="steps">
                {steps.map((s) => (
                  <div className="step" key={s.n}>
                    <span className="n">{s.n}</span>
                    <div>
                      <h4>{s.title}</h4>
                      <p>{s.body}</p>
                    </div>
                    <span className="step-arr">↗</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PARTNER */}
        <section className="pad">
          <div className="wrap">
            <div className="section-tag in-view">
              <span>ALLIANCE</span>
              <span>Strategic partner</span>
            </div>
            <h2 className="bighead in-view" style={{ marginBottom: 50 }}>
              <span className="light">業務提携、</span>財務<span className="ch">パートナーズ</span>。
            </h2>

            <div className="partner-card in-view">
              <div className="partner-mark">¥</div>
              <div className="partner-info">
                <h4>財務パートナーズ</h4>
                <div className="en">ZAIMU PARTNERS · K.K.</div>
                <p>
                  融資・資金調達のプロフェッショナル集団。業務提携により、GIFT
                  のお客様にも直接サービスを提供。経営戦略から数字の設計までを伴走します。
                </p>
              </div>
              <a href="#" className="partner-cta">
                詳細を見る <span>→</span>
              </a>
            </div>
          </div>
        </section>

        {/* WHO */}
        <section className="pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-tag in-view">
              <span>AUDIENCE</span>
              <span>こんな経営者へ</span>
            </div>

            <div className="who-grid in-view">
              <h2 className="who-h">
                <span className="light">成長期の、</span>
                <span className="ja">
                  <span className="ch">中小企業</span>へ。
                </span>
              </h2>
              <ul className="who-list">
                {audience.map((line, i) => (
                  <li key={line}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="t">{line}</span>
                    <span className="a">→</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pad cta" id="contact">
          <div className="wrap">
            <div className="section-tag in-view">
              <span>
                <span className="num">04 /</span> Contact
              </span>
              <span>Let&apos;s talk</span>
            </div>
            <h2 className="cta-h in-view">
              <span className="light">数字を、</span>
              <br />
              経営の<span className="ch">武器</span>に。
            </h2>
            <div className="cta-actions in-view">
              <a href="/contact" className="btn btn-pri">
                無料相談を予約 <span className="a">→</span>
              </a>
            </div>
            <div className="cta-meta in-view">
              <div>
                <b>株式会社 GIFT</b>Finance Consulting
              </div>
              <div>
                <b>info@gift-inc.org</b>Email
              </div>
              <div>
                <b>Tokyo · JP</b>Headquarters
              </div>
              <div>
                <b>FY 2026 / Q3</b>Fiscal period
              </div>
            </div>
          </div>
        </section>

        <FinanceScripts />
      </main>
      <Footer />
    </>
  );
}
