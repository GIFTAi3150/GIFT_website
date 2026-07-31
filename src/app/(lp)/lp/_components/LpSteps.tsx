import type { LpVariant } from '@/data/lp-variants';

type LpStepsProps = {
  what: LpVariant['what'];
};

export default function LpSteps({ what }: LpStepsProps) {
  return (
    <section className="lp-section lp-dark" aria-label="サービス内容">
      <div className="lp-inner lp-what">
        <div>
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
        <div className="lp-steps">
          {what.steps.map((step, i) => (
            <div className="lp-step" key={step.title}>
              <span className="lp-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
