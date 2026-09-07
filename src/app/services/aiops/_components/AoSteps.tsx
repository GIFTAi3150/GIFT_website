import AoHead from './AoHead';
import { STEPS } from './aoContent';

/**
 * How we work — "the flip board". A split-flap: the board shows one step,
 * split across a hairline at mid-height; the scroll hinges the top leaf down
 * (rotateX 0 → −180°) to reveal the next step, six times over. Every slot
 * holds all six faces; AoScroll shows the right one per slot for the current
 * index k:
 *   top   (static, behind the leaf)   face k+1, upper half
 *   bottom (static)                   face k,   lower half
 *   leaf front                        face k,   upper half
 *   leaf back (pre-rotated 180°)      face k+1, lower half
 * The hinge is the section's one mechanism (STEPS_VH budget).
 */
function Face({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="ao-face">
      <p className="ao-face__n">
        <span className="ao-mono">Step</span> {n}
      </p>
      <p className="ao-face__title">{title}</p>
      <p className="ao-face__body">{body}</p>
    </div>
  );
}

export default function AoSteps() {
  const faces = STEPS.items;
  const slot = (name: string, half: 'upper' | 'lower') => (
    <div className={`ao-flap__slot ao-flap__slot--${half}`} data-flap-slot={name}>
      {faces.map((f, i) => (
        <div key={f.n} className="ao-flap__face" data-face={i}>
          <Face n={f.n} title={f.title} body={f.body} />
        </div>
      ))}
    </div>
  );

  return (
    <section className="ao-steps" id="process">
      <div className="ao-container">
        <AoHead label={STEPS.label} titleEn="How we work." title={STEPS.titleJa} />
      </div>

      <div className="ao-steps__stage" data-steps-stage>
        <div className="ao-steps__frame">
          <div className="ao-container">
            <div className="ao-flap" data-flap style={{ '--n': faces.length } as React.CSSProperties}>
              <div className="ao-flap__half ao-flap__half--top">{slot('top', 'upper')}</div>
              <div className="ao-flap__half ao-flap__half--bottom">{slot('bottom', 'lower')}</div>
              <div className="ao-flap__leaf" data-flap-leaf>
                <div className="ao-flap__leaf-face ao-flap__leaf-face--front">{slot('front', 'upper')}</div>
                <div className="ao-flap__leaf-face ao-flap__leaf-face--back">{slot('back', 'lower')}</div>
              </div>
              <span className="ao-flap__split" aria-hidden />
              <div className="ao-flap__index" aria-hidden>
                {faces.map((f, i) => (
                  <span key={f.n} data-flap-dot={i} />
                ))}
              </div>
            </div>
            {/* prefers-reduced-motion: the six steps as a plain list (aiops.css) */}
            <ol className="ao-steps__list">
              {faces.map((f) => (
                <li key={f.n} className="ao-condition">
                  <h4 className="ao-condition__title">
                    <span className="ao-mono" style={{ marginRight: 10 }}>
                      Step {f.n}
                    </span>
                    {f.title}
                  </h4>
                  <p className="ao-condition__body">{f.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
