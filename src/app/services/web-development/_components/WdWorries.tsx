import type { CSSProperties } from 'react';
import { WORRIES } from './wdContent';
import WdHead from './WdHead';

/**
 * Worries — the strike. Four worries written large; a blue stroke crosses each
 * one out in turn as the reader scrolls (per line, via box-decoration-break),
 * then the answer rises out of its mask (WdScroll).
 */
export default function WdWorries() {
  return (
    <section
      id="problem"
      className="wd-sec wd-sec--navy wd-worries"
      data-stage
      style={{ '--budget': 4.4 } as CSSProperties}
    >
      <div className="wd-frame">
        <div className="wd-container wd-worries__inner">
          <WdHead label={WORRIES.eyebrow} title={WORRIES.title} className="wd-worries__head" />
          <ul className="wd-worries__list">
            {WORRIES.items.map((text) => (
              <li className="wd-worry" data-worry key={text}>
                <span className="wd-worry__text">{text}</span>
              </li>
            ))}
          </ul>
          <p className="wd-worries__answer">
            <span className="wd-h2__mask">
              <span className="wd-h2__line" data-worry-answer>
                {WORRIES.answer.pre}
                <strong>{WORRIES.answer.em}</strong>
              </span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
