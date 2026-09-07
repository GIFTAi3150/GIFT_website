'use client';

import { useState } from 'react';
import { FAQ } from './aiTrainingContent';
import AtHead from './AtHead';

/**
 * FAQ — the only section whose mechanism is the reader's hand, not the scroll:
 * rows unfold on tap (grid-rows transition, no measuring), one open at a time.
 */
export default function AtFaq() {
  const [open, setOpen] = useState<number>(-1);

  return (
    <section id="faq" className="at-faq at-section--navy">
      <div className="at-container at-faq__grid">
        <div className="at-faq__side">
          <AtHead label={FAQ.eyebrow} title={FAQ.title} />
        </div>
        <ul className="at-faq__list">
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            const id = `at-faq-${i}`;
            return (
              <li key={item.question} className="at-faq__item" data-open={isOpen ? '' : undefined}>
                <button
                  type="button"
                  className="at-faq__q"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="at-faq__qt">{item.question}</span>
                  <span className="at-faq__plus" aria-hidden />
                </button>
                <div id={id} className="at-faq__a" role="region" aria-hidden={!isOpen}>
                  <div className="at-faq__a-in">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
