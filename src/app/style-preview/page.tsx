import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Preview — LINE approach — GIFT',
  robots: { index: false, follow: false },
};

// Exact tokens extracted from whatsapp.com production CSS (2026-04-16).
// Two greens — bright + deep teal. No third color.
const swatches = [
  { name: 'WA Bright Green', hex: '#25D366', role: 'Primary CTA, links, brand accent', cls: 'bg-line-green text-white' },
  { name: 'Green Hover', hex: '#1EBE5B', role: 'Hover / pressed on primary green', cls: 'bg-line-green-hover text-white' },
  { name: 'Deep Teal', hex: '#128C7E', role: 'Dark CTA panels, secondary surfaces', cls: 'bg-line-green-deep text-white' },
  { name: 'Deepest Teal', hex: '#075E54', role: 'Footer accent, deepest band', cls: 'bg-line-green-deeper text-white' },
  { name: 'Ink', hex: '#111B21', role: 'All headings + body text', cls: 'bg-line-ink text-white' },
  { name: 'Grey', hex: '#5E5E5E', role: 'Secondary text, meta, captions', cls: 'bg-line-grey text-white' },
  { name: 'Border', hex: '#CDD0D5', role: 'Hairlines, dividers, disabled', cls: 'bg-line-grey-mute text-line-ink' },
  { name: 'Band BG', hex: '#F0F4F9', role: 'Alternating section background', cls: 'bg-line-bg-alt text-line-ink border border-line-grey-mute/40' },
];

const services = [
  { eyebrow: 'TELEMARKETING', title: 'お客様との接点を、最適化する。', body: '一件一件の対話から、お客様の本当のニーズを引き出します。' },
  { eyebrow: 'LINE SOLUTIONS', title: 'LINEで、つながりを深く。', body: 'メッセージ配信から運用設計まで、一貫してサポートします。' },
  { eyebrow: 'RPA', title: '業務を、自動化する。', body: '反復作業を自動化し、人にしかできない仕事に時間を。' },
  { eyebrow: 'REAL ESTATE', title: '不動産を、価値に変える。', body: '地域に根ざした不動産事業で、新しい価値を生み出します。' },
];

export default function StylePreviewPage() {
  return (
    <main className="min-h-screen bg-line-paper font-sans text-line-ink antialiased">
      {/* Top bar — LINE-style minimal nav */}
      <header className="sticky top-0 z-20 border-b border-line-grey-mute/30 bg-line-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-line-green font-bold text-white">G</div>
            <span className="text-lg font-bold tracking-tight">GIFT</span>
          </div>
          <nav className="hidden gap-8 text-sm font-medium text-line-ink md:flex">
            <a className="hover:text-line-green">事業</a>
            <a className="hover:text-line-green">実績</a>
            <a className="hover:text-line-green">会社概要</a>
            <a className="hover:text-line-green">採用情報</a>
          </nav>
          <button className="rounded-full bg-line-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-line-green-hover">
            お問い合わせ
          </button>
        </div>
      </header>

      {/* HERO — LINE style: tons of whitespace, huge clean type, one green CTA */}
      <section className="px-6 py-24 md:py-36">
        <div className="mx-auto max-w-container">
          <p className="mb-6 text-sm font-semibold tracking-wide text-line-green">VALUE THROUGH DIALOGUE</p>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.15] tracking-tight md:text-7xl">
            お客様に価値を、<br />
            社員に<span className="text-line-green">誇り</span>を。
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-line-grey">
            GIFT は、テレマーケティング・LINE 運用・RPA・不動産の四事業を通じて、お客様の事業成長と社員の自己実現を両立させる会社です。
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <button className="cta-btn">事業を見る</button>
            <button className="cta-btn cta-btn--deep">会社概要</button>
            <button className="cta-btn cta-btn--filled">お問い合わせ</button>
          </div>
          <p className="mt-4 text-xs text-line-grey">
            3 variants: <code>.cta-btn</code> (outline wipe) · <code>.cta-btn--deep</code> (deep teal outline wipe) · <code>.cta-btn--filled</code> (solid with darker wipe)
          </p>
        </div>
      </section>

      {/* FEATURE STRIP — LINE uses alt bg bands with large cards */}
      <section className="bg-line-bg-alt px-6 py-24">
        <div className="mx-auto max-w-container">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm font-semibold text-line-green">SERVICES</p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              私たちの仕事
            </h2>
            <p className="mt-4 text-base leading-relaxed text-line-grey">
              四つの事業領域で、お客様のビジネスをサポートします。
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <article
                key={s.eyebrow}
                className="group rounded-3xl bg-line-paper p-10 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <p className="mb-4 text-xs font-bold tracking-wider text-line-green">{s.eyebrow}</p>
                <h3 className="mb-4 text-2xl font-bold leading-snug tracking-tight">{s.title}</h3>
                <p className="text-sm leading-relaxed text-line-grey">{s.body}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-line-green">
                  詳しく見る
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT SECTION — LINE-style big image left, copy right */}
      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-container items-center gap-16 md:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-line-green to-line-green-hover" />
          <div>
            <p className="mb-3 text-sm font-semibold text-line-green">ABOUT</p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              対話を、<br />すべての出発点に。
            </h2>
            <p className="mt-6 text-base leading-loose text-line-grey">
              私たちが提供するのは、単なるサービスではありません。お客様の声に耳を傾け、本質的な課題を一緒に見つけ出し、解決する。その積み重ねが、長く続く信頼関係を築きます。
            </p>
            <button className="mt-10 inline-flex items-center gap-2 text-base font-semibold text-line-green hover:text-line-green-hover">
              会社概要を見る →
            </button>
          </div>
        </div>
      </section>

      {/* STATS — minimal, monochrome with green numbers */}
      <section className="bg-line-bg-alt px-6 py-24">
        <div className="mx-auto max-w-container">
          <div className="mb-14">
            <p className="mb-3 text-sm font-semibold text-line-green">NUMBERS</p>
            <h2 className="text-4xl font-bold tracking-tight">数字で見る GIFT</h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { num: '15+', label: '年の実績' },
              { num: '120', label: '社員数' },
              { num: '4', label: '事業領域' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-7xl font-bold tracking-tight text-line-green">{s.num}</div>
                <div className="mt-3 text-sm font-medium text-line-grey">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-container rounded-3xl bg-line-green-deep px-12 py-20 text-center text-white">
          <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            一緒に、新しい価値を。
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70">
            ご相談・お問い合わせはお気軽にどうぞ。
          </p>
          <button className="mt-10 rounded-full bg-line-green px-10 py-4 text-base font-semibold text-white transition hover:bg-line-green-hover">
            お問い合わせ →
          </button>
        </div>
      </section>

      {/* FOOTER — monochrome, no green */}
      <footer className="border-t border-line-grey-mute/30 bg-line-paper px-6 py-16">
        <div className="mx-auto grid max-w-container gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-line-green font-bold text-white">G</div>
              <span className="text-lg font-bold">GIFT Inc.</span>
            </div>
            <p className="mt-4 text-sm text-line-grey">対話から、価値を。</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold tracking-wider text-line-ink">事業</p>
            <ul className="space-y-2 text-sm text-line-grey">
              <li>テレマーケティング</li>
              <li>LINE ソリューション</li>
              <li>RPA</li>
              <li>不動産</li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold tracking-wider text-line-ink">会社</p>
            <ul className="space-y-2 text-sm text-line-grey">
              <li>会社概要</li>
              <li>採用情報</li>
              <li>お問い合わせ</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-container border-t border-line-grey-mute/30 pt-6 text-xs text-line-grey-mute">
          © 2026 GIFT Inc.
        </div>
      </footer>

      {/* REFERENCE STRIP */}
      <section className="bg-line-bg-alt px-6 py-20">
        <div className="mx-auto max-w-container">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Palette & type reference</h2>
          <p className="mb-10 text-sm text-line-grey">
            Extracted from line.me production CSS. Font stack: LINE Seed → SFPro → Arial → Noto Sans JP → sans-serif.
            Preview uses <strong>Noto Sans JP</strong> (LINE's own fallback) — ~95% visual match to LINE Seed.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {swatches.map((s) => (
              <div key={s.hex} className={`flex items-center gap-4 rounded-2xl p-5 ${s.cls}`}>
                <div>
                  <div className="text-base font-bold">{s.name}</div>
                  <div className="font-mono text-xs opacity-80">{s.hex}</div>
                </div>
                <div className="ml-auto max-w-xs text-right text-xs leading-snug opacity-90">{s.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
