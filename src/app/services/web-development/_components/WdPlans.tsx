import Link from 'next/link';
import { CONTACT, PLANS } from './wdContent';
import WdHead from './WdHead';

/**
 * Plans — both offers stay in their own layout positions and settle gently
 * as they enter view (WdScroll), keeping the full comparison readable.
 */
export default function WdPlans() {
  return (
    <section id="plans" className="wd-sec wd-sec--navy wd-plans" aria-labelledby="wd-plans-title">
      <div className="wd-container">
        <div className="wd-plans__head">
          <WdHead label={PLANS.eyebrow} title={PLANS.title} />
          <p className="wd-plans__lead">
            {PLANS.lead.map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        </div>
        <div className="wd-plans__grid" data-plans>
          {PLANS.items.map((plan, i) => (
            <article className={`wd-plan wd-plan--${plan.key}`} data-plan={i} key={plan.key}>
              <div className="wd-plan__top wd-mono">
                <span>{plan.kicker}</span>
                <span>{plan.flag}</span>
              </div>
              <h3 className="wd-plan__name">{plan.name}</h3>
              <p className="wd-plan__desc">
                {plan.desc[0]}
                <br />
                {plan.desc[1]}
              </p>
              <p className="wd-plan__price">
                <span>{PLANS.priceLabel.pre}</span>
                <strong>{plan.price}</strong>
                <span>
                  {PLANS.priceLabel.unit}
                  <small>{PLANS.priceLabel.tax}</small>
                </span>
              </p>
              <p className="wd-plan__duration wd-mono">{plan.duration}</p>
              <ul className="wd-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                className={`cta-btn ${plan.key === 'ai' ? 'cta-btn--wd' : 'cta-btn--wd-paper'} wd-plan__cta`}
                href={CONTACT}
              >
                <span>{plan.cta}</span>
              </Link>
            </article>
          ))}
        </div>
        <p className="wd-plans__disclaimer">{PLANS.disclaimer}</p>
      </div>
    </section>
  );
}
