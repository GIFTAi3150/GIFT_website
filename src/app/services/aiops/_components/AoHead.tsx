// Shared section head — the ONLY motion vocabulary repeated across sections
// (rule grows + label slides; h2 line rises out of its mask). Everything else
// on the page is one mechanism per section (AoScroll).
export default function AoHead({
  label,
  title,
  titleEn,
  lead,
  className,
}: {
  label: string;
  /** JP title line (h2). */
  title: string;
  /** Optional EN line set above the JP title, in Poppins. */
  titleEn?: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={`ao-head${className ? ` ${className}` : ''}`}>
      <p className="ao-label" data-ao-label>
        <span className="ao-label__rule" aria-hidden />
        <span className="ao-label__text">{label}</span>
      </p>
      <h2 className="ao-h2" data-ao-h2>
        {titleEn ? (
          <span className="ao-h2__mask">
            <span className="ao-h2__line ao-h2__en">{titleEn}</span>
          </span>
        ) : null}
        <span className="ao-h2__mask">
          <span className="ao-h2__line">{title}</span>
        </span>
      </h2>
      {lead ? <p className="ao-head__lead">{lead}</p> : null}
    </div>
  );
}
