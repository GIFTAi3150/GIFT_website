import { REASONS } from './aiTrainingContent';
import AtHead from './AtHead';

function List() {
  return (
    <ol className="at-focus__list">
      {REASONS.items.map((item) => (
        <li key={item.title} className="at-focus__item">
          <h3 className="at-focus__title">{item.title}</h3>
          <p className="at-focus__body">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Reasons — the focus band. Two identical layers: a defocused ghost in flow
 * and a crisp copy clipped to a viewport-fixed reading band (AtScroll moves
 * the clip every frame). Scrolling pulls each reason into focus.
 */
export default function AtReasons() {
  return (
    <section id="reasons" className="at-focus at-section--navy">
      <div className="at-container at-focus__grid">
        <div className="at-focus__side">
          <AtHead label={REASONS.eyebrow} title={REASONS.title} />
        </div>
        <div className="at-focus__stage">
          <div className="at-focus__layer at-focus__layer--ghost" aria-hidden>
            <List />
          </div>
          <div className="at-focus__layer at-focus__layer--crisp" data-focus-crisp>
            <List />
          </div>
        </div>
      </div>
    </section>
  );
}
