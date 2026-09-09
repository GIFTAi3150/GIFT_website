import Link from 'next/link';
import { CLOSING, CONTACT } from './wdContent';

/**
 * Closing — the aperture. A blue disc opens from the mascot's corner over the
 * navy section as it enters; the three lines rise out of their masks and the
 * poster from the hero returns as the bookend (WdScroll).
 */
export default function WdClosing() {
  return (
    <section
      id="contact"
      className="wd-sec wd-sec--navy wd-closing"
      aria-labelledby="wd-closing-title"
    >
      <div className="wd-closing__disc" data-disc aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element -- same file the hero already loaded; keep the cache hit */}
      <img
        className="wd-closing__aria"
        data-aria
        src="/media/web-development/aria-poster.png"
        alt=""
        width="848"
        height="738"
        loading="lazy"
        decoding="async"
        aria-hidden
      />
      <div className="wd-container wd-closing__inner">
        <p className="wd-mono wd-closing__top" data-close-top>
          <span>{CLOSING.kicker}</span>
          <span>{CLOSING.company}</span>
        </p>
        <h2 id="wd-closing-title" className="wd-closing__title">
          {CLOSING.lines.map((line) => (
            <span className="wd-h2__mask" key={line}>
              <span className="wd-h2__line" data-close-line>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <div className="wd-closing__bottom" data-close-bottom>
          <p>
            {CLOSING.body.map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
          <Link className="cta-btn cta-btn--wd-white" href={CONTACT}>
            <span>{CLOSING.cta}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
