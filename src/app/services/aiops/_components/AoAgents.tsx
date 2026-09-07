import AoHead from './AoHead';
import { AGENTS } from './aoContent';

/**
 * Agents in action — "the fill". Five industry words stand hollow in a
 * column; the scroll fills each one bottom-to-top with the liquid's colour
 * (a clipped solid twin over the outline) and, as a word fills, its agent
 * dossier rises beside it. Typographic fill is the section's one mechanism
 * (AGENTS_VH budget). The three conditions follow in flow.
 */
export default function AoAgents() {
  return (
    <section className="ao-agents" id="agents">
      <div className="ao-container">
        <AoHead label={AGENTS.label} titleEn="Agents in action." title={AGENTS.titleJa} />
      </div>

      <div className="ao-agents__stage" data-agents-stage>
        <div className="ao-agents__frame">
          <div className="ao-container ao-agents__grid">
            <div className="ao-fill" data-fill>
              {AGENTS.items.map((a, i) => (
                <div key={a.word} className="ao-fill__word" data-fill-word={i}>
                  <span className="ao-fill__hollow">{a.word}</span>
                  <span className="ao-fill__solid" aria-hidden>
                    {a.word}
                  </span>
                </div>
              ))}
            </div>

            <div className="ao-dossiers">
              {AGENTS.items.map((a, i) => (
                <article key={a.title} className="ao-dossier" data-dossier={i}>
                  <p className="ao-dossier__industry">
                    <span className="ao-mono">Industry</span>
                    {a.industry}
                  </p>
                  <h3 className="ao-dossier__title">{a.title}</h3>
                  <p className="ao-dossier__role">
                    <span className="ao-mono">Role</span>
                    {a.role}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ao-container ao-conditions">
        <p className="ao-conditions__head">
          <span className="ao-conditions__rule" aria-hidden />
          <span>{AGENTS.conditionsHead}</span>
          <span className="ao-conditions__rule" aria-hidden />
        </p>
        <ul className="ao-conditions__list">
          {AGENTS.conditions.map((c) => (
            <li key={c.title[0]} className="ao-condition" data-condition>
              <h4 className="ao-condition__title">
                {c.title[0]}
                <br />
                {c.title[1]}
              </h4>
              <p className="ao-condition__body">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
