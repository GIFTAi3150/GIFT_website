'use client';

interface SliceTextProps {
  text: string;
  /** per-word stagger in ms */
  staggerMs?: number;
  /** base delay before the first word animates */
  delayMs?: number;
  /** animation duration in ms */
  durationMs?: number;
  className?: string;
}

/** Slice reveal — top and bottom halves of each word slide in from outside to meet in the middle. */
export default function SliceText({
  text,
  staggerMs = 90,
  delayMs = 120,
  durationMs = 900,
  className,
}: SliceTextProps) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, wi) => {
        const delay = delayMs + wi * staggerMs;
        return (
          <span key={wi} className="slice-word" style={{ animationDelay: `${delay}ms` } as React.CSSProperties}>
            <span className="slice-half slice-top" style={{ animationDelay: `${delay}ms` }}>
              {word}
            </span>
            <span className="slice-half slice-bottom" aria-hidden style={{ animationDelay: `${delay}ms` }}>
              {word}
            </span>
            {wi < words.length - 1 && ' '}
          </span>
        );
      })}
    </span>
  );
}
