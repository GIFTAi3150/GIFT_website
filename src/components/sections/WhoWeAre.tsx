import ScrollRevealText from '@/components/ui/ScrollRevealText';
import GiftIncEcho from '@/components/ui/GiftIncEcho';

export default function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className="relative w-full py-s-80"
      style={{ background: 'linear-gradient(180deg, #0b1020 0%, #111827 50%, #1a2440 100%)' }}
    >
      <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
            WHO WE ARE
          </p>

          <h2
            className="mb-8 font-sans font-extrabold leading-tight text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            キッカケで、世界が変わる。
          </h2>

          <div className="mb-8 h-0.5 w-12 bg-[#3b82f6]" />

          <p
            data-highlight-text
            className="mb-6 font-sans font-light text-white"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: '2', wordBreak: 'auto-phrase', textWrap: 'pretty' } as React.CSSProperties}
          >
            AIを使えば、もっとうまくいく——そう気づいたとき、GIFTがいます。業務の自動化からAIエージェントの構築まで、あなたのビジネスに合った形でAIを実装します。
          </p>

          <p
            data-highlight-text
            className="mb-10 font-sans font-light text-white"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: '2', wordBreak: 'auto-phrase', textWrap: 'pretty' } as React.CSSProperties}
          >
            ツールを入れて終わり、ではありません。導入から運用まで一貫して伴走し、AIが本当に「使える状態」になるまで一緒に動きます。
          </p>

          <GiftIncEcho />
        </div>
      </div>
      <ScrollRevealText sectionId="who-we-are" />
    </section>
  );
}
