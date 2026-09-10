import type { CSSProperties } from 'react';
import { MANIFESTO } from './wdContent';

/**
 * Manifesto — the lock. The two halves of the statement travel in from opposite
 * edges of the screen and lock into a line; 先 fills blue at the click, the rule
 * snaps under it and the lead rises. An outlined mechanical cog turns
 * gently with the scroll (WdScroll).
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
        <div className="wd-manifesto__gear" data-gear aria-hidden="true">
          <svg viewBox="0 0 520 520" fill="none" focusable="false">
            <path
              d="M441.59 211.34A188 188 0 0 1 445.69 230.59L482.77 236.59A224 224 0 0 1 482.77 283.41L445.69 289.41A188 188 0 0 1 441.59 308.66A188 188 0 0 1 435.51 327.37L464.63 351.11A224 224 0 0 1 441.22 391.66L406.10 378.31A188 188 0 0 1 392.94 392.94A188 188 0 0 1 378.31 406.10L391.66 441.22A224 224 0 0 1 351.11 464.63L327.37 435.51A188 188 0 0 1 308.66 441.59A188 188 0 0 1 289.41 445.69L283.41 482.77A224 224 0 0 1 236.59 482.77L230.59 445.69A188 188 0 0 1 211.34 441.59A188 188 0 0 1 192.63 435.51L168.89 464.63A224 224 0 0 1 128.34 441.22L141.69 406.10A188 188 0 0 1 127.06 392.94A188 188 0 0 1 113.90 378.31L78.78 391.66A224 224 0 0 1 55.37 351.11L84.49 327.37A188 188 0 0 1 78.41 308.66A188 188 0 0 1 74.31 289.41L37.23 283.41A224 224 0 0 1 37.23 236.59L74.31 230.59A188 188 0 0 1 78.41 211.34A188 188 0 0 1 84.49 192.63L55.37 168.89A224 224 0 0 1 78.78 128.34L113.90 141.69A188 188 0 0 1 127.06 127.06A188 188 0 0 1 141.69 113.90L128.34 78.78A224 224 0 0 1 168.89 55.37L192.63 84.49A188 188 0 0 1 211.34 78.41A188 188 0 0 1 230.59 74.31L236.59 37.23A224 224 0 0 1 283.41 37.23L289.41 74.31A188 188 0 0 1 308.66 78.41A188 188 0 0 1 327.37 84.49L351.11 55.37A224 224 0 0 1 391.66 78.78L378.31 113.90A188 188 0 0 1 392.94 127.06A188 188 0 0 1 406.10 141.69L441.22 128.34A224 224 0 0 1 464.63 168.89L435.51 192.63A188 188 0 0 1 441.59 211.34Z"
              fill="#142440"
              fillOpacity="0.24"
            />
            <g fill="var(--wd-navy)">
              <circle cx="260" cy="260" r="61" />
              <circle cx="365.66" cy="321.00" r="18" />
              <circle cx="260.00" cy="382.00" r="18" />
              <circle cx="154.34" cy="321.00" r="18" />
              <circle cx="154.34" cy="199.00" r="18" />
              <circle cx="260.00" cy="138.00" r="18" />
              <circle cx="365.66" cy="199.00" r="18" />
            </g>
            <circle cx="260" cy="260" r="44" opacity="0.45" />
          </svg>
        </div>
      </div>
    </section>
  );
}
