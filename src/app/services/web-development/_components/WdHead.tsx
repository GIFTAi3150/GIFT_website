import { Fragment } from 'react';

// Shared section head — the ONLY motion vocabulary repeated across sections
// (rule grows + label slides; each h2 line rises out of its mask). Everything
// else on the page is one mechanism per section (WdScroll).
export default function WdHead({
  label,
  title,
  lead,
  className,
}: {
  label: string;
  title: string[];
  lead?: string[];
  className?: string;
}) {
  return (
    <div className={`wd-head${className ? ` ${className}` : ''}`}>
      <p className="wd-label" data-wd-label>
        <span className="wd-label__rule" aria-hidden />
        <span className="wd-label__text">{label}</span>
      </p>
      <h2 className="wd-h2" data-wd-h2>
        {title.map((line) => (
          <span className="wd-h2__mask" key={line}>
            <span className="wd-h2__line">{line}</span>
          </span>
        ))}
      </h2>
      {lead ? (
        <p className="wd-head__lead">
          {lead.map((line, i) => (
            <Fragment key={line}>
              {i > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </p>
      ) : null}
    </div>
  );
}
