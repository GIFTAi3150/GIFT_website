import type { LpVariant } from '@/data/lp-variants';

type LpStepsProps = {
  what: LpVariant['what'];
};

export default function LpSteps({ what }: LpStepsProps) {
  return (
    <section className="lp-section lp-dark" aria-label="サービス内容">
      {/* Heading runs full width and the steps sit UNDER it, rather than the
          mock's two-column split. The split squeezed all three steps into the
          right ~60% of the page, which is what made them read as an afterthought
          — the section is the "can you actually do this" proof, so it needs the
          whole measure. */}
      <div className="lp-inner lp-what">
        <div className="lp-what-head">
          <p className="lp-eyebrow">what we do</p>
          <h2>
            {what.heading.map((line, i) => (
              <span className="lp-line" key={i}>
                {line}
              </span>
            ))}
          </h2>
          <p className="lp-lead">{what.lead}</p>
        </div>
        <ol className="lp-steps">
          {what.steps.map((step, i) => (
            // <ol>, not a stack of divs: these are three ordered stages of one
            // engagement, and the order is the meaning. The visible numbers are
            // decorative duplicates of the list semantics, so they are hidden
            // from screen readers rather than read out twice.
            <li className="lp-step" key={step.title}>
              <span className="lp-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="lp-step-body">
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
