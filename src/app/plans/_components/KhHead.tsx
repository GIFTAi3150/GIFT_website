// Shared section head — the ONLY motion vocabulary repeated across sections
// (rule grows + label slides; h2 line rises out of its mask). Everything else
// on the page is one mechanism per section (KhScroll).
export default function KhHead({
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
    <div className={`kh-head${className ? ` ${className}` : ''}`}>
      <p className="kh-label" data-kh-label>
        <span className="kh-label__rule" aria-hidden />
        <span className="kh-label__text">{label}</span>
      </p>
      <h2 className="kh-h2" data-kh-h2>
        <span className="kh-h2__mask">
          <span className="kh-h2__line">{title}</span>
        </span>
      </h2>
      {lead ? <p className="kh-head__lead">{lead}</p> : null}
    </div>
  );
}
