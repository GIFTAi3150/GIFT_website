import { COMPARE } from './wdContent';
import WdHead from './WdHead';

/**
 * Compare — the column. A quiet ledger; the GIFT column drops into place as the
 * table enters (WdScroll writes `--drop` on [data-compare]).
 */
export default function WdCompare() {
  return (
    <section
      id="compare"
      className="wd-sec wd-sec--paper wd-compare"
      aria-labelledby="wd-compare-title"
    >
      <div className="wd-container">
        <div className="wd-compare__head">
          <WdHead label={COMPARE.eyebrow} title={COMPARE.title} />
          <p className="wd-compare__lead">
            {COMPARE.lead[0]}
            <br />
            {COMPARE.lead[1]}
          </p>
        </div>
        <div
          className="wd-compare__scroll"
          role="region"
          aria-label="ホームページ制作プランの比較表。小さい画面では横にスクロールできます"
          tabIndex={0}
        >
          <table className="wd-ledger" data-compare>
            <caption className="sr-only">一般的な制作プランとGIFT通常コースの比較</caption>
            <thead>
              <tr>
                {COMPARE.columns.map((column, i) => (
                  <th scope="col" key={column} className={i === 3 ? 'is-gift' : undefined}>
                    {i === 3 ? (
                      <>
                        <span className="wd-ledger__brand">GIFT</span> 通常コース
                      </>
                    ) : (
                      column
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(([label, ...cells]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {cells.map((cell, i) => (
                    <td key={cell} className={i === 2 ? 'is-gift' : undefined}>
                      {cell}
                      {i === 2 && label === COMPARE.giftNote.row ? (
                        <small>{COMPARE.giftNote.text}</small>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wd-compare__foot">
          <p>{COMPARE.footnote}</p>
          <span className="wd-mono wd-compare__swipe">{COMPARE.swipe}</span>
        </div>
      </div>
    </section>
  );
}
