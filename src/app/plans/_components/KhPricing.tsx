import { PRICING } from './khContent';
import KhHead from './KhHead';

/** Figure + 万円. Poppins for the digits, the JP unit sized in em so it rides
 *  whatever figure size the caller sets. */
function Yen({ figure, className }: { figure: string; className?: string }) {
  return (
    <span className={`kh-yen${className ? ` ${className}` : ''}`}>
      <span className="kh-num">{figure}</span>
      <span className="kh-unit">万円</span>
    </span>
  );
}

/**
 * Pricing — 折半, the fold. The one paper section. The ledger (216 + 38 + 27 + 18
 * = 299) is typeset plainly; then the 299万円 sheet folds in half on a hinge
 * as you scroll (KhScroll drives `--fold`), and the back of the flap carries
 * 149.5万円・実質半額 with its condition. Half the sheet, half the price.
 *
 * No strikethrough anywhere: a struck price reads as a sale, and this is a
 * public grant that may or may not be awarded. The condition
 * 「補助金の交付を受けた場合」 sits on the same face as the figure it qualifies —
 * never separated, never demoted to a footnote (khContent rule).
 */
export default function KhPricing() {
  const { subsidy } = PRICING;
  return (
    <section id="pricing" className="kh-price kh-section--paper">
      <div className="kh-container">
        <KhHead label={PRICING.eyebrow} title={PRICING.title} lead={PRICING.lead} />

        <div className="kh-price__card">
          <p className="kh-price__card-label kh-mono">{PRICING.basicEyebrow}</p>
          <h3 className="kh-price__card-title">{PRICING.basicTitle}</h3>
          <div className="kh-price__monthly">
            <div className="kh-price__monthly-item">
              <span className="kh-price__monthly-label">{PRICING.monthlyLabel}</span>
              <Yen figure={PRICING.monthlyFigure} className="kh-price__monthly-fig" />
              <span className="kh-price__term">{PRICING.termNote}</span>
            </div>
            <div className="kh-price__monthly-item">
              <span className="kh-price__monthly-label">{PRICING.setupLabel}</span>
              <Yen figure={PRICING.setupFigure} className="kh-price__monthly-fig" />
              <span className="kh-price__term">{PRICING.setupNote}</span>
            </div>
          </div>
        </div>

        <div className="kh-price__subsidy">
          <div className="kh-price__subsidy-head">
            <p className="kh-price__subsidy-label kh-mono">{PRICING.subsidyEyebrow}</p>
            <h3 className="kh-price__subsidy-title">{PRICING.subsidyTitle}</h3>
            <p className="kh-price__subsidy-lead">{PRICING.subsidyLead}</p>
          </div>
          <dl className="kh-ledger">
            <div className="kh-ledger__head">
              <dt>{PRICING.columnLabels.item}</dt>
              <dd>{PRICING.columnLabels.price}</dd>
            </div>
            {PRICING.rows.map((row) => (
              <div key={row.item} className="kh-ledger__row">
                <dt>
                  <span className="kh-ledger__item">{row.item}</span>
                  {row.detail ? <span className="kh-ledger__detail">{row.detail}</span> : null}
                </dt>
                <dd>
                  <Yen figure={row.amount} />
                </dd>
              </div>
            ))}
            <div className="kh-ledger__row kh-ledger__row--total">
              <dt>
                <span className="kh-ledger__item">{PRICING.totalLabel}</span>
              </dt>
              <dd>
                <Yen figure={PRICING.totalAmount} />
              </dd>
            </div>
          </dl>
        </div>

        {/* the fold: sticky sheet, spacer = its travel */}
        <div className="kh-fold-wrap" data-fold-wrap>
          <div className="kh-fold-stick" data-fold-stick>
            <div className="kh-fold" data-fold>
              <div className="kh-fold__top">
                <p className="kh-fold__label">{PRICING.totalLabel}</p>
                <p className="kh-fold__num" aria-hidden>
                  <Yen figure={PRICING.totalAmount} />
                </p>
                <span className="kh-fold__shade kh-fold__shade--top" aria-hidden />
              </div>

              <div className="kh-fold__flap">
                <div className="kh-fold__face kh-fold__face--front" aria-hidden>
                  <p className="kh-fold__num kh-fold__num--lower">
                    <Yen figure={PRICING.totalAmount} />
                  </p>
                  <span className="kh-fold__shade kh-fold__shade--front" />
                </div>

                <div className="kh-fold__face kh-fold__face--back">
                  <p className="kh-fold__cond kh-mono">{subsidy.condition}</p>
                  <p className="kh-fold__sub-label">{subsidy.label}</p>
                  <p className="kh-fold__sub-fig">
                    <Yen figure={subsidy.figure} />
                    <span className="kh-fold__aside">{subsidy.aside}</span>
                  </p>
                  <p className="kh-fold__sub-body">{subsidy.body}</p>
                  <span className="kh-fold__shade kh-fold__shade--back" aria-hidden />
                </div>
              </div>
            </div>
          </div>
          <div className="kh-fold-spacer" data-fold-spacer aria-hidden />
        </div>

        <p className="kh-price__tax">{PRICING.taxNote}</p>
      </div>
    </section>
  );
}
