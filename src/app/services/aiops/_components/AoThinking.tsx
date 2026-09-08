import { THINKING } from './aoContent';

/**
 * Our thinking — "the drift". A flowing paper sheet, no pin. The thesis is set
 * as two giant lines; as the sheet passes through the viewport the first line
 * travels one way and the blue line the other, crossing into alignment at the
 * centre of the screen. Horizontal travel tied to the scroll is the section's
 * one mechanism; the label and the copy below are still.
 */
export default function AoThinking() {
  return (
    <section className="ao-thinking ao-sheet" id="thinking">
      <div className="ao-container">
        <h2 className="ao-thinking__h">
          <span className="ao-thinking__line" data-drift="1">
            {THINKING.headline[0]}
          </span>
          <span className="ao-thinking__line ao-thinking__line--em" data-drift="-1">
            {THINKING.headline[1]}
          </span>
        </h2>
      </div>

      <div className="ao-container ao-thinking__grid">
        <p className="ao-thinking__label">
          {THINKING.labelJa}
          <span>{THINKING.labelEn}</span>
        </p>
        <div className="ao-thinking__body">
          <p>
            {THINKING.p1.lead}
            <strong>{THINKING.p1.strong}</strong>
          </p>
          <p>
            {THINKING.p2.lead}
            <strong>{THINKING.p2.strong}</strong>
            {THINKING.p2.tail}
          </p>
        </div>
      </div>
    </section>
  );
}
