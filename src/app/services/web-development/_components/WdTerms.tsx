import { TERMS } from './wdContent';
import WdHead from './WdHead';

/** Terms — a quiet ledger. Only the shared head moves; the fine print sits still. */
export default function WdTerms() {
  return (
    <section id="terms" className="wd-sec wd-sec--navy wd-terms" aria-labelledby="wd-terms-title">
      <div className="wd-container wd-terms__inner">
        <WdHead label={TERMS.eyebrow} title={TERMS.title} lead={TERMS.lead} />
        <div className="wd-terms__grid">
          {[TERMS.included, TERMS.extra].map((group) => (
            <div className="wd-terms__list" key={group.title}>
              <h3>
                <span aria-hidden>{group.mark}</span> {group.title}
              </h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {group === TERMS.extra ? (
                <div className="wd-terms__handover">
                  <strong>{TERMS.handover.title}</strong>
                  <p>{TERMS.handover.body}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
