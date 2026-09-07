// Shared section head — the ONLY motion vocabulary repeated across sections
// (rule grows + label slides; h2 line rises out of its mask). Everything else
// on the page is one mechanism per section (AtScroll).
export default function AtHead({
  label,
  title,
  lead,
  className,
}: {
  label: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={`at-head${className ? ` ${className}` : ''}`}>
      <p className="at-label" data-at-label>
        <span className="at-label__rule" aria-hidden />
        <span className="at-label__text">{label}</span>
      </p>
      <h2 className="at-h2" data-at-h2>
        <span className="at-h2__mask">
          <span className="at-h2__line">{title}</span>
        </span>
      </h2>
      {lead ? <p className="at-head__lead">{lead}</p> : null}
    </div>
  );
}
