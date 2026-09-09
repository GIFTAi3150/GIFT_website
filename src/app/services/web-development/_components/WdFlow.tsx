import Link from 'next/link';
import { CONTACT, FLOW } from './wdContent';
import WdHead from './WdHead';

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 18 18 6M6 6h12v12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Flow — the route. A path is drawn through the four steps; a dot travels it
 * with the scroll and lights each step as it passes (WdScroll builds the path
 * from the nodes' measured positions, so it follows any layout).
 */
export default function WdFlow() {
  return (
    <section id="flow" className="wd-sec wd-sec--paper wd-flow" aria-labelledby="wd-flow-title">
      <div className="wd-container wd-flow__inner">
        <div className="wd-flow__side">
          <WdHead label={FLOW.eyebrow} title={FLOW.title} lead={FLOW.lead} />
          <Link className="wd-textlink" href={CONTACT}>
            {FLOW.link} <Arrow />
          </Link>
        </div>
        <div className="wd-route" data-route>
          <svg className="wd-route__svg" data-route-svg aria-hidden>
            <path className="wd-route__trail" data-route-trail d="" />
            <path className="wd-route__path" data-route-path d="" />
          </svg>
          <span className="wd-route__dot" data-route-dot aria-hidden />
          <ol className="wd-route__steps">
            {FLOW.steps.map((step, i) => (
              <li className="wd-step" data-step key={step.en}>
                <span className="wd-step__node" data-step-node aria-hidden />
                <div className="wd-step__body">
                  <span className="wd-mono wd-step__label">
                    STEP {i + 1} — {step.en}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
