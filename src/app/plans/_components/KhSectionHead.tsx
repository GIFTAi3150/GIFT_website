// The homepage's section heading, matching src/components/sections/WhoWeAre.tsx:
// a small blue uppercase Latin kicker, an extrabold Japanese headline, a short blue
// rule, then optional light body copy. Centred.
//
// `tone` picks the palette for the band this heading sits on. The kicker blue is
// deliberately different per tone — #60a5fa is unreadable on white and #2563EB is
// unreadable on #0b1020 — so do not "unify" them.
//
// Prop names are historical: `word` is the Latin kicker and `chip` is the Japanese
// headline. They were a Forum display word and a dark chip in an earlier pass; the
// names were kept so call sites did not churn.

const TONES = {
  dark: {
    kicker: 'text-[#60a5fa]',
    title: 'text-white',
    rule: 'bg-[#3b82f6]',
    lead: 'text-white/80',
  },
  light: {
    kicker: 'text-[#2563EB]',
    title: 'text-[#0C0E1A]',
    rule: 'bg-[#2563EB]',
    lead: 'text-[#5B6B8A]',
  },
} as const;

export default function KhSectionHead({
  word,
  chip,
  lead,
  tone = 'dark',
}: {
  word: string;
  chip: string;
  lead?: string;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];

  return (
    <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <p className={`mb-4 font-display text-small font-bold uppercase tracking-widest ${t.kicker}`}>
        {word}
      </p>

      <h2
        className={`font-sans font-extrabold leading-tight ${t.title}`}
        style={{ fontSize: 'clamp(28px, 4vw, 42px)', textWrap: 'balance' }}
      >
        {chip}
      </h2>

      <div className={`mt-8 h-0.5 w-12 ${t.rule}`} />

      {lead ? (
        <p
          className={`mt-8 w-full font-sans font-light ${t.lead}`}
          style={{ fontSize: 'clamp(17px, 1.9vw, 21px)', lineHeight: 2, textWrap: 'pretty' }}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
