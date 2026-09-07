import AoHead from './AoHead';
import { PAINS } from './aoContent';

/**
 * Signs — "the pile". The four questions fall in from above one by one and
 * stack with weight (each landing presses the ones beneath); then the answer
 * lifts the whole pile away and 「その課題に、GIFTが向き合います。」 stands where
 * it was. Gravity is the section's one mechanism (AoScroll, PAINS_VH budget).
 */
export default function AoPains() {
  return (
    <section className="ao-pains" id="signs">
      <div className="ao-pains__stage" data-pains-stage>
        <div className="ao-pains__frame">
          <div className="ao-container ao-pains__inner">
            <AoHead label={PAINS.label} titleEn={PAINS.titleEn} title={PAINS.titleJa} />

            <div className="ao-pile" data-pile>
              {PAINS.items.map((q, i) => (
                <div key={q} className="ao-slab" data-slab={i}>
                  <span className="ao-slab__mark" aria-hidden>
                    Q
                  </span>
                  <p className="ao-slab__q">{q}</p>
                </div>
              ))}

              <div className="ao-pains__answer" data-pains-answer>
                <p className="ao-pains__en">
                  All resolved by <em>GIFT.</em>
                </p>
                <p className="ao-pains__ja">{PAINS.answerJa}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
