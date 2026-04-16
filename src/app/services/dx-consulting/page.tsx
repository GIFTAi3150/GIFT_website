import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';

export default function DxConsultingPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              DX CONSULTING
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              DXコンサル事業
            </h1>
            <p className="mt-6 max-w-3xl font-sans text-normal font-light text-gift-silver" style={{ lineHeight: '2' }}>
              LINE公式・Lステップ構築/運用、RPA・業務自動化、AI導入・生成AI活用支援、SaaS導入・CRM構築支援までをワンストップでご提供します。AIを業務に深く組み込み、フル活用している点が独自の強みです。
            </p>

            {/* Lstep badge placeholder */}
            <div className="mt-10 inline-flex items-center gap-4 rounded-xl border-2 border-gift-border bg-white px-6 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#06C755] font-display text-lg font-bold text-white">
                L
              </div>
              <div>
                <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
                  OFFICIAL PARTNER
                </p>
                <p className="font-sans text-normal font-semibold text-gift-ink">
                  Lステップ公式認定パートナー
                </p>
              </div>
            </div>
            {/* TODO: replace placeholder above with real Lstep partner badge when provided */}
          </div>
        </section>

        {/* Service areas */}
        <Reveal>
          <section className="py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                SERVICE AREAS
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                提供領域
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  {
                    title: 'LINE公式・Lステップ',
                    body: 'Lステップ公式認定パートナーとして、アカウント設計から配信運用・自動化フロー構築まで一貫してサポート。',
                  },
                  {
                    title: 'RPA・業務自動化',
                    body: 'ハイブリッド構成（カスタム開発＋市販ツール）で、業務の反復作業を自動化します。',
                  },
                  {
                    title: 'AI導入・生成AI活用',
                    body: 'Claude / Claude Code をはじめとした最新AIを業務に深く組み込み、生産性を最大化。',
                  },
                  {
                    title: 'SaaS導入・CRM構築',
                    body: '課題に合ったSaaSの選定・導入・CRM設計まで、事業成長に直結する基盤づくりを支援します。',
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

        {/* AI-first strength */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16">
                <div className="lg:col-span-1">
                  <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                    OUR EDGE
                  </p>
                  <h2
                    className="font-sans font-extrabold text-gift-ink"
                    style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
                  >
                    AIをフル活用
                  </h2>
                </div>
                <div className="lg:col-span-3">
                  <p
                    className="font-sans font-light text-gift-silver"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 18px)', lineHeight: '2' }}
                  >
                    GIFTの独自色は、AIを業務に深く組み込んでいることです。最新のAIツールを社内で日常的に活用し、クライアントの業務にも同じ水準のAI活用を実装します。単なるツール導入ではなく、AI前提での業務プロセス再設計をご提案します。
                  </p>
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
                DXコンサルのご相談はこちらから
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
