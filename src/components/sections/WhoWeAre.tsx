import ScrollRevealText from '@/components/ui/ScrollRevealText';
import GiftIncEcho from '@/components/ui/GiftIncEcho';

// Japanese has no spaces, so the browser may break a line between any two
// characters (splitting words like 実装). We join natural phrase units with a
// zero-width space (U+200B) so line breaks only ever fall on phrase
// boundaries — both for static render (word-break: keep-all below) and for the
// SplitText reveal (which splits "words" on this same delimiter).
const ZWSP = String.fromCharCode(0x200b); // U+200B zero-width space

const PARA_1 = [
  'AIを使えば、',
  'もっと',
  'うまくいく——',
  'そう',
  '気づいたとき、',
  'GIFTがいます。',
  '業務の',
  '自動化から',
  'AIエージェントの',
  '構築まで、',
  'あなたの',
  'ビジネスに',
  '合った',
  '形で',
  'AIを',
  '実装します。',
].join(ZWSP);

const PARA_2 = [
  'ツールを',
  '入れて',
  '終わり、',
  'ではありません。',
  '導入から',
  '運用まで',
  '一貫して',
  '伴走し、',
  'AIが',
  '本当に',
  '「使える状態」に',
  'なるまで',
  '一緒に',
  '動きます。',
].join(ZWSP);

const PARA_STYLE: React.CSSProperties = {
  fontSize: 'clamp(18px, 2vw, 22px)',
  lineHeight: '2',
  wordBreak: 'keep-all',
  overflowWrap: 'anywhere',
  textWrap: 'pretty',
} as React.CSSProperties;

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
            className="mb-6 w-full font-sans font-light text-white"
            style={PARA_STYLE}
          >
            {PARA_1}
          </p>

          <p
            data-highlight-text
            className="mb-10 w-full font-sans font-light text-white"
            style={PARA_STYLE}
          >
            {PARA_2}
          </p>

          <GiftIncEcho />
        </div>
      </div>
      <ScrollRevealText sectionId="who-we-are" />
    </section>
  );
}
