import type { CSSProperties } from 'react';
import { MANIFESTO } from './wdContent';

/**
 * Manifesto — the lock. The two halves of the statement travel in from opposite
 * edges of the screen and lock into a line; 先 fills blue at the click, the rule
 * snaps under it and the lead rises. The giant asterisk turns like a gear with
 * the scroll (WdScroll).
 */
export default function WdManifesto() {
  return (
    <section
      id="manifesto"
      className="wd-sec wd-sec--navy wd-manifesto"
      data-stage
      style={{ '--budget': 1.5 } as CSSProperties}
      aria-labelledby="wd-manifesto-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-manifesto__inner">
          <p className="wd-mono wd-manifesto__eyebrow">{MANIFESTO.eyebrow}</p>
          <h2 id="wd-manifesto-title" className="wd-manifesto__title" data-lock-title>
            <span className="wd-manifesto__row">
              <span className="wd-lock" data-lock="-1">
                {MANIFESTO.wordL}
              </span>
            </span>
            <span className="wd-manifesto__row wd-manifesto__row--r">
              <span className="wd-lock" data-lock="1">
                {MANIFESTO.wordR.pre}
                <em>{MANIFESTO.wordR.em}</em>
                {MANIFESTO.wordR.post}
              </span>
            </span>
          </h2>
          <div className="wd-manifesto__foot">
            <i className="wd-manifesto__rule" data-lock-rule aria-hidden />
            <p className="wd-manifesto__lead">
              {MANIFESTO.lead.map((line) => (
                <span className="wd-h2__mask" key={line}>
                  <span className="wd-h2__line" data-lock-lead>
                    {line}
                  </span>
                </span>
              ))}
            </p>
            <p className="wd-mono wd-manifesto__tag" aria-hidden>
              <span>{MANIFESTO.foot.l}</span>
              <span>{MANIFESTO.foot.r}</span>
            </p>
          </div>
        </div>
        <span className="wd-manifesto__gear" data-gear aria-hidden>
          ✳
        </span>
      </div>
    </section>
  );
}
