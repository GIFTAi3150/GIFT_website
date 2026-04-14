import Link from 'next/link';

export default function CtaBand() {
  return (
    <section className="w-full bg-gift-green py-s-80" aria-labelledby="cta-heading">
      <div className="mx-auto flex max-w-container flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2
            id="cta-heading"
            className="font-display font-bold text-white"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            まずはご相談ください
          </h2>
          <p className="font-sans text-normal text-white/70">
            お客様の課題に合わせて、最適なソリューションをご提案します。
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="inline-block whitespace-nowrap bg-white px-8 py-4 font-sans text-normal font-medium text-gift-green transition-colors duration-200 hover:bg-gift-green-pale-1"
          >
            お問い合わせ
          </Link>
          <Link
            href="/services/telemarketing"
            className="inline-block whitespace-nowrap border border-white/40 bg-transparent px-8 py-4 font-sans text-normal font-medium text-white transition-colors duration-200 hover:bg-white/10"
          >
            サービス一覧
          </Link>
        </div>
      </div>
    </section>
  );
}
