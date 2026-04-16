import Link from 'next/link';

export default function CtaBand() {
  return (
    <section className="w-full bg-gift-green py-s-80" aria-labelledby="cta-heading">
      <div className="mx-auto flex max-w-container flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2
            id="cta-heading"
            className="font-display font-bold text-gift-ink"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            まずはご相談ください
          </h2>
          <p className="font-sans text-normal text-gift-ink/70">
            お客様の課題に合わせて、最適なソリューションをご提案します。
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="cta-btn cta-btn--on-green">
            <span>お問い合わせ</span>
          </Link>
          <Link href="/services/callcenter" className="cta-btn cta-btn--on-green">
            <span>事業紹介</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
