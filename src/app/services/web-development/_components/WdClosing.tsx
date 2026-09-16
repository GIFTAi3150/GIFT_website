import Link from 'next/link';
import Image from 'next/image';
import { CLOSING, CONTACT } from './wdContent';

/** The modern website from the hero returns as the closing bookend. */
export default function WdClosing() {
  return (
    <section
      id="contact"
      className="wd-sec wd-sec--navy wd-closing"
      aria-labelledby="wd-closing-title"
    >
      <div className="wd-closing__disc" data-disc aria-hidden />
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
      <div className="wd-closing__preview" data-close-preview aria-hidden="true">
        <Image
          src="/media/web-development/modern-website-preview.webp?v=safari-light"
          alt=""
          width={1800}
          height={1241}
          sizes="(max-width: 899px) 90vw, 44vw"
          className="wd-closing__website"
        />
      </div>
    </section>
  );
}
