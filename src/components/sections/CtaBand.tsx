import Link from 'next/link';

export default function CtaBand() {
  return (
    <section className="w-full bg-gift-green py-s-80" aria-labelledby="cta-heading">
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
            className="inline-block bg-white text-gift-green font-sans font-medium text-normal px-8 py-4 transition-colors duration-200 hover:bg-gift-green-pale-1 whitespace-nowrap"
          >
            お問い合わせ
          </Link>
          <Link
            href="/services/telemarketing"
            className="inline-block bg-transparent text-white font-sans font-medium text-normal px-8 py-4 border border-white/40 transition-colors duration-200 hover:bg-white/10 whitespace-nowrap"
          >
            サービス一覧
          </Link>
        </div>
      </div>
    </section>
  );
}
