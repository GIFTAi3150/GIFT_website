// Section heading for /services/ai-training. Deliberately NOT imported from
// src/app/plans/_components/KhSectionHead.tsx — Plans.md forbids importing
// across page bundles, so this is a self-contained sibling with the same shape
// (Latin kicker + Japanese h2 + short rule + optional lead).
//
// `tone` picks the palette for the band this heading sits on, matching the
// `ai.*` tokens in tailwind.config.ts (ai-accent on light, a lighter blue on
// the dark hero band — #2563EB is too low-contrast on ai-ink).

const TONES = {
  dark: {
    kicker: 'text-[#60a5fa]',
    title: 'text-white',
    rule: 'bg-[#3b82f6]',
    lead: 'text-white/80',
  },
  light: {
    kicker: 'text-ai-accent',
    title: 'text-ai-ink',
    rule: 'bg-ai-accent',
    lead: 'text-ai-muted',
  },
} as const;

export default function AtSectionHead({
  word,
  chip,
  lead,
  tone = 'light',
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
        className={`font-sans font-extrabold ${t.title}`}
        style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.25, letterSpacing: '-0.005em', textWrap: 'balance' }}
      >
        {chip}
      </h2>

      <div className={`mt-8 h-0.5 w-12 ${t.rule}`} />

      {lead ? (
        <p
          className={`mt-8 w-full font-sans font-light ${t.lead}`}
          style={{ fontSize: 'clamp(17px, 1.9vw, 21px)', lineHeight: 1.9, textWrap: 'pretty' }}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
