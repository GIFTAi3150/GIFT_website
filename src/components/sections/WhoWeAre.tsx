import Link from 'next/link';
import ScrollRevealText from '@/components/ui/ScrollRevealText';

export default function WhoWeAre() {
  return (
    <section id="who-we-are" className="relative w-full border-t border-[#BFDBFE] bg-[#EFF6FF] py-s-80">
      <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
            WHO WE ARE
          </p>

          <h2
            className="mb-8 font-sans font-extrabold leading-tight text-[#0C0E1A]"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            キッカケで、世界が変わる。
          </h2>

          <div className="mb-8 h-0.5 w-12 bg-[#2563EB]" />

          <p
            data-highlight-text
            className="mb-6 font-sans font-light text-[#475569]"
            style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', lineHeight: '2' }}
          >
            AIを使えば、もっとうまくいく——そう気づいたとき、GIFTがいます。
            業務の自動化からAIエージェントの構築まで、あなたのビジネスに合った形でAIを実装します。
          </p>

          <p
            data-highlight-text
            className="mb-10 font-sans font-light text-[#475569]"
            style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', lineHeight: '2' }}
          >
            ツールを入れて終わり、ではありません。
            導入から運用まで一貫して伴走し、AIが本当に「使える状態」になるまで一緒に動きます。
          </p>

          <Link href="/company" className="cta-btn cta-btn--ai">
            <span>GIFTについて</span>
          </Link>
        </div>
      </div>
      <ScrollRevealText sectionId="who-we-are" />
    </section>
  );
}
