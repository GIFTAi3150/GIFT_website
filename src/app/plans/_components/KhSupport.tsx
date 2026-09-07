import { SUPPORT } from './khContent';
import KhHead from './KhHead';

/**
 * Support — the companion (伴走). The head stays on the left; between it and
 * the list runs a rail with a mark that keeps level with the reader
 * (position: sticky at 50%) while the five items scroll past. KhScroll lights
 * the item beside the mark. Running alongside, literally.
 */
export default function KhSupport() {
  return (
    <section id="support" className="kh-support kh-section--navy">
      <div className="kh-container kh-support__grid">
        <div className="kh-support__side">
          <KhHead label={SUPPORT.eyebrow} title={SUPPORT.title} lead={SUPPORT.lead} />
        </div>

        <div className="kh-support__rail" aria-hidden>
          <span className="kh-support__mark" />
        </div>

        <ol className="kh-support__list" data-support-list>
          {SUPPORT.items.map((item) => (
            <li key={item.title} className="kh-support__item" data-support-item>
              <h3 className="kh-support__title">{item.title}</h3>
              <p className="kh-support__detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
