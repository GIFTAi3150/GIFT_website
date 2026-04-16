import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';

export default function FinanceConsultingPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              FINANCIAL CONSULTING
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              財務コンサル事業
            </h1>
            <p className="mt-6 max-w-3xl font-sans text-normal font-light text-gift-silver" style={{ lineHeight: '2' }}>
              融資支援・資金調達サポートから、財務戦略・KPI設計まで、経営者に寄り添う伴走型の財務コンサルティングをご提供します。外部専門家とのアライアンス体制で、成長期の中小企業を資金面から支えます。
            </p>
          </div>
        </section>

        {/* What we offer */}
        <Reveal>
          <section className="py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                WHAT WE OFFER
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                提供内容
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    title: '融資支援・資金調達',
                    body: '融資実行実績の豊富さを背景に、事業フェーズに応じた最適な資金調達プランをご提案します。',
                  },
                  {
                    title: '経営コンサル',
                    body: '財務戦略・KPI設計を軸に、経営判断に必要な数値と視点を経営者と共に整えます。',
                  },
                ].map((s) => (
                  <div key={s.title} className="gift-card !p-8">
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">{s.title}</h3>
                    <p className="font-sans text-small font-light leading-relaxed text-gift-silver">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Approach */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    APPROACH
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    伴走型スタイル
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <p
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
                  >
                    単発のアドバイスではなく、経営者と並走しながら数字と戦略を共に描く伴走型スタイルが私たちの特長です。外部の税理士・会計士・金融機関との連携によるアライアンス体制で、広く深いサポートを実現します。
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Target */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                WHO IT'S FOR
              </p>
              <h2
                className="mb-6 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.2' }}
              >
                成長期の中小企業経営者の方へ
              </h2>
              <p className="mx-auto max-w-2xl font-sans font-light text-gift-silver" style={{ lineHeight: '2' }}>
                融資ニーズがある、財務戦略を整えたい、経営判断の数値基盤を固めたい——そうした成長期の経営者の方と共に走ります。
              </p>
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
                財務コンサルのご相談はこちらから
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
