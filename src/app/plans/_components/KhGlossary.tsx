import { GLOSSARY } from './khContent';

// Every character is a span so KhScroll can run the marker through the
// definition by scroll position. Inline (not inline-block): this is body
// text and must wrap like body text.
function chars(text: string) {
  return Array.from(text).map((ch, i) => (
    <span key={i} className="kh-mark__c">
      {ch}
    </span>
  ));
}

/**
 * Glossary — the marker. The definition of Claude Team Standard is fully
 * visible from the start; a highlighter sweeps through it, character by
 * character, with the scroll — the reader's pen, not a reveal.
 */
export default function KhGlossary() {
  // 「Claude Team Standard とは」— the Latin term gets the display face, とは
  // stays Japanese. Split on the last space so the source string is intact.
  const cut = GLOSSARY.title.lastIndexOf(' ');
  const termEn = cut === -1 ? GLOSSARY.title : GLOSSARY.title.slice(0, cut);
  const termJa = cut === -1 ? '' : GLOSSARY.title.slice(cut + 1);

  return (
    <section id="glossary" className="kh-gloss kh-section--navy">
      <div className="kh-container kh-gloss__grid">
        <div className="kh-gloss__side">
          <p className="kh-label" data-kh-label>
            <span className="kh-label__rule" aria-hidden />
            <span className="kh-label__text">{GLOSSARY.eyebrow}</span>
          </p>
          <h2 className="kh-gloss__term">
            <span className="kh-gloss__term-en">{termEn}</span>
            {termJa ? <span className="kh-gloss__term-ja">{termJa}</span> : null}
          </h2>
        </div>
        <p className="kh-gloss__body" data-marker>
          {chars(GLOSSARY.body)}
        </p>
      </div>
    </section>
  );
}
