import { COMPARE } from './wdContent';
import WdHead from './WdHead';

const HEADINGS = [
  ['買い切り型', '制作会社'],
  ['月額型', '他社相場'],
  ['GIFT', '通常コース'],
];

/** One connected comparison: fixed headings and a scroll reading beat per row. */
export default function WdCompare() {
  return (
    <section
      id="compare"
      className="wd-sec wd-sec--paper wd-compare"
      aria-labelledby="wd-compare-title"
    >
      <div className="wd-container wd-compare__layout">
        <div className="wd-compare__head" id="wd-compare-title">
          <WdHead label={COMPARE.eyebrow} title={COMPARE.title} />
          <p className="wd-compare__lead">
            {COMPARE.lead[0]}
            <br />
            {COMPARE.lead[1]}
          </p>
        </div>
        <div className="wd-compare__journey" data-compare-journey>
          <div className="wd-compare__frame">
            <table className="wd-matrix" role="table">
              <caption className="sr-only">一般的な制作プランとGIFT通常コースの比較</caption>
              <thead role="rowgroup">
                <tr role="row">
                  <th scope="col" className="wd-matrix__corner" role="columnheader">
                    比較項目
                  </th>
                  {HEADINGS.map(([title, subtitle], index) => (
                    <th
                      scope="col"
                      role="columnheader"
                      id={`wd-compare-col-${index}`}
                      key={title}
                      aria-label={COMPARE.columns[index + 1]}
                      className={index === 2 ? 'is-gift' : undefined}
                    >
                      <strong>{title}</strong>
                      <small>{subtitle}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody role="rowgroup">
                {COMPARE.rows.map(([label, ...cells], index) => (
                  <tr key={label} role="row" data-compare-row>
                    <th scope="row" role="rowheader" id={`wd-compare-row-${index}`}>
                      <span className="wd-matrix__reveal">{label}</span>
                    </th>
                    {cells.map((cell, column) => (
                      <td
                        key={column}
                        role="cell"
                        headers={`wd-compare-row-${index} wd-compare-col-${column}`}
                        className={column === 2 ? 'is-gift' : undefined}
                      >
                        <span className="wd-matrix__reveal">
                          {cell.includes('（税抜）') ? (
                            <>
                              {cell.replace('（税抜）', '')}
                              <small>（税抜）</small>
                            </>
                          ) : (
                            cell
                          )}
                          {column === 2 && label === COMPARE.giftNote.row ? (
                            <small>{COMPARE.giftNote.text}</small>
                          ) : null}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="wd-compare__foot">{COMPARE.footnote}</p>
      </div>
    </section>
  );
}
