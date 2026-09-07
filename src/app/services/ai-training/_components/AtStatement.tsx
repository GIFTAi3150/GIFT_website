import { HERO } from './aiTrainingContent';

/** The hero's coda: what the programme is, on plain paper. No mechanism of its own. */
export default function AtStatement() {
  return (
    <section className="at-statement at-section--navy" aria-label="研修の概要">
      <div className="at-container at-statement__grid">
        <p className="at-statement__body">{HERO.body}</p>
        <ul className="at-statement__points">
          {HERO.points.map((point) => (
            <li key={point.title} className="at-statement__point">
              <h3 className="at-statement__pt">{point.title}</h3>
              <p className="at-statement__pb">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
