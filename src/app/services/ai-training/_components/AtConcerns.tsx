import { PAINS } from './aiTrainingContent';
import AtHead from './AtHead';

// Every character is a span so AtScroll can type the section by scroll
// position. Title parts are nowrap inline-blocks: a break can only fall
// between parts (the copy's own orphan rule).
function chars(text: string) {
  return Array.from(text).map((ch, i) => (
    <span key={i} className="at-type__c">
      {ch}
    </span>
  ));
}

/**
 * Concerns — the typewriter. A pinned stage where the three concerns are typed
 * out by scrolling (a caret follows), the way people first met these tools:
 * by typing. The answer at the end is typed in blue.
 */
export default function AtConcerns() {
  return (
    <section id="concerns" className="at-type at-section--navy">
      <div className="at-type__stick">
        <div className="at-container at-type__inner">
          <AtHead label={PAINS.eyebrow} title={PAINS.title} />
          <ol className="at-type__list">
            {PAINS.items.map((item) => (
              <li key={item.titleParts.join('')} className="at-type__item">
                <h3 className="at-type__title">
                  {item.titleParts.map((part) => (
                    <span key={part} className="at-type__part">
                      {chars(part)}
                    </span>
                  ))}
                </h3>
                <p className="at-type__body">{chars(item.body)}</p>
              </li>
            ))}
          </ol>
          <p className="at-type__lead">{chars(PAINS.lead)}</p>
        </div>
      </div>
      <div className="at-type__spacer" aria-hidden />
    </section>
  );
}
