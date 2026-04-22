import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';

export default function CallCenterPage() {
  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              CALL CENTER
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              コールセンター事業
            </h1>
            <p className="mt-6 max-w-3xl font-sans text-normal font-light text-gift-silver" style={{ lineHeight: '2' }}>
              アウトバウンド特化のコールセンターを自社運営。光回線（通信キャリア2次代理店から受注）と法人営業（SaaS会社1次代理店から受注）を扱い、通信分野だけで総従業員約300名。組織運営を中枢に据えた教育制度で、品質と拡大を両立させています。
            </p>
          </div>
        </section>

        {/* Highlights */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                HIGHLIGHTS
              </p>
              <h2
                className="mb-12 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
              >
                GIFTのコールセンターが選ばれる理由
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    title: '自社運営',
                    body: '外注なし。全スタッフを自社で採用・教育し、品質の一貫性を担保しています。',
                  },
                  {
                    title: 'アウトバウンド特化',
                    body: 'クラウドPBX + CRMの基盤で、成果を追求したアウトバウンド運営に集中しています。',
                  },
                  {
                    title: '教育制度が強み',
                    body: '組織運営を中枢に据えた教育制度で、採用後の成長と定着率を高めています。',
                  },
                ].map((h) => (
                  <div key={h.title} className="gift-card !p-8">
                    <h3 className="mb-3 font-sans text-medium font-bold text-gift-ink">{h.title}</h3>
                    <p className="font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                      {h.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Scale */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    300<span className="text-[40px]">名</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    通信分野だけで総従業員約300名
                  </p>
                </div>
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    2018<span className="text-[40px]">〜</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    運営開始年。長年積み上げた実績
                  </p>
                </div>
                <div>
                  <div className="font-display text-[72px] font-extrabold leading-none text-gift-green">
                    2<span className="text-[40px]">分野</span>
                  </div>
                  <p className="mt-3 font-sans text-small font-light text-gift-silver">
                    光回線 / 法人営業SaaSの2領域で展開
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                コールセンター事業のご相談はこちらから
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
