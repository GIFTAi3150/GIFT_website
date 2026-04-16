'use client';

interface FadeUpTextProps {
  text: string;
  /** per-word stagger in ms */
  staggerMs?: number;
  /** base delay before the first word animates */
  delayMs?: number;
  /** animation duration in ms */
  durationMs?: number;
  className?: string;
}

/** Word-by-word fade-up reveal. Each word slides up from below with fade-in. */
export default function FadeUpText({
  text,
  staggerMs = 120,
  delayMs = 120,
  durationMs = 800,
  className,
}: FadeUpTextProps) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, wi) => {
        const delay = delayMs + wi * staggerMs;
        return (
          <span key={wi} className="fade-up-wrap">
            <span
              className="fade-up-word"
              style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${durationMs}ms`,
              }}
            >
              {word}
            </span>
            {wi < words.length - 1 && ' '}
          </span>
        );
      })}
    </span>
  );
}
