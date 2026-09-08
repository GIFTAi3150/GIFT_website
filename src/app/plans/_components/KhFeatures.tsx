import type { CSSProperties } from 'react';
import { FEATURES } from './khContent';
import KhHead from './KhHead';

/**
 * Features — the index. A pinned cabinet of six drawers, one per feature.
 * Closed, the stack is a column of the six verbs (はじめやすい / 貯まる / 見つかる
 * / 標準セット / 広がる / 守れる) with the feature name at the right; scrolling
 * walks the open drawer down the stack — its height and the verb's size
 * interpolate with `--open` (KhScroll), the body slides up into the room it
 * makes. No cards, no grid: one filing cabinet.
 */
export default function KhFeatures() {
  return (
    <section id="features" className="kh-index kh-section--navy">
      <div className="kh-index__stick">
        <div className="kh-container kh-index__inner">
          <KhHead label={FEATURES.eyebrow} title={FEATURES.title} />

          <ol className="kh-cabinet">
            {FEATURES.items.map((item, i) => (
              <li
                key={item.title}
                className="kh-drawer"
                data-drawer
                data-open={i === 0 ? '' : undefined}
                style={{ '--open': i === 0 ? 1 : 0 } as CSSProperties}
              >
                <h3 className="kh-drawer__verb">{item.kicker}</h3>
                <p className="kh-drawer__title">{item.title}</p>
                <p className="kh-drawer__body">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="kh-index__spacer" aria-hidden />
    </section>
  );
}
