import type { CSSProperties } from 'react';
import { STEPS } from './aiTrainingContent';
import AtHead from './AtHead';

/**
 * Flow — the deck. Four sheets, each sticky a little lower than the one before,
 * so scrolling lays them over each other; the covered sheet recedes (AtScroll).
 * The last sheet is navy and hands the page to Courses.
 */
export default function AtFlow() {
  return (
    <section id="flow" className="at-flow at-section--navy">
      <div className="at-container">
        <AtHead label={STEPS.eyebrow} title={STEPS.title} />
      </div>
      <ol className="at-flow__deck">
        {STEPS.items.map((step, i) => (
          <li
            key={step.title}
            className="at-sheet"
            data-sheet
            style={{ '--i': i } as CSSProperties}
          >
            <div className="at-container at-sheet__inner">
              <p className="at-sheet__step at-mono">STEP {i + 1}</p>
              <h3 className="at-sheet__title">{step.title}</h3>
              <p className="at-sheet__body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
