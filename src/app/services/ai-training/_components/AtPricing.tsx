import { PRICING } from './aiTrainingContent';
import AtHead from './AtHead';

/**
 * Pricing — the transfer. Two figures share the row; as the row crosses the
 * viewport the regular price recedes and the subsidised burden comes forward
 * (scale + colour, scrubbed by AtScroll). Notes are typeset verbatim.
 */
export default function AtPricing() {
  const { banner, regular, subsidized } = PRICING;
  return (
    <section id="pricing" className="at-price at-section--paper">
      <div className="at-container">
        <AtHead label={PRICING.eyebrow} title={PRICING.title} />

        <p className="at-price__banner">
          <span className="at-price__banner-eyebrow at-mono">{banner.eyebrow}</span>
          <strong className="at-price__banner-title">{banner.title}</strong>
          <span className="at-price__banner-sub">{banner.sub}</span>
        </p>

        <div className="at-price__row" data-price-row>
          <div className="at-price__block at-price__block--regular" data-price-a>
            <p className="at-price__cond at-mono">{regular.condition}</p>
            <p className="at-price__label">{regular.label}</p>
            <p className="at-price__figure" data-price-fig-a>
              <span className="at-price__num">{regular.figure}</span>
              <span className="at-price__unit">万円</span>
            </p>
            <p className="at-price__note">{regular.note}</p>
          </div>

          <div className="at-price__block at-price__block--sub" data-price-b>
            <p className="at-price__cond at-mono">{subsidized.condition}</p>
            <p className="at-price__label">{subsidized.label}</p>
            <p className="at-price__figure" data-price-fig-b>
              <span className="at-price__num">{subsidized.figure}</span>
              <span className="at-price__unit">万円</span>
              <span className="at-price__aside">{subsidized.aside}</span>
            </p>
            <p className="at-price__body">{subsidized.body}</p>
          </div>
        </div>

        <ul className="at-price__notes">
          <li>{PRICING.diagnosisNote}</li>
          <li>{PRICING.reviewNote}</li>
          <li>{PRICING.taxNote}</li>
        </ul>
      </div>
    </section>
  );
}
