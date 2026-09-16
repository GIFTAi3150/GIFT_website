import { TERMS } from './wdContent';
import WdHead from './WdHead';

/** Terms — a ledger whose rows and rules reveal as they enter the viewport. */
export default function WdTerms() {
  return (
    <section id="terms" className="wd-sec wd-sec--navy wd-terms" aria-labelledby="wd-terms-title">
      <div className="wd-container wd-terms__inner">
        <div className="wd-terms__head" id="wd-terms-title">
          <WdHead label={TERMS.eyebrow} title={TERMS.title} lead={TERMS.lead} />
          <div className="wd-terms__progress" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="wd-terms__window">
          <div className="wd-terms__grid">
            {[TERMS.included, TERMS.extra].map((group) => (
              <div className="wd-terms__list" key={group.title}>
                <h3>
                  <span className="wd-terms__mask">
                    <span className="wd-terms__entry">
                      <span aria-hidden>{group.mark}</span> {group.title}
                    </span>
                  </span>
                </h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <span className="wd-terms__mask">
                        <span className="wd-terms__entry">{item}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {group === TERMS.extra ? (
                  <div className="wd-terms__handover">
                    <div className="wd-terms__mask">
                      <div className="wd-terms__entry">
                        <strong>{TERMS.handover.title}</strong>
                        <p>{TERMS.handover.body}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
