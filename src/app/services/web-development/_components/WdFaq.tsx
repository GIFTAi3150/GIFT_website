'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { FAQ } from './wdContent';
import WdHead from './WdHead';

/** Native details keep keyboard and no-JS behaviour; WAAPI interpolates the real height. */
function FaqItem({ q, a }: { q: string; a: string }) {
  const root = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const expanding = useRef(false);

  useEffect(() => () => animation.current?.cancel(), []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const element = root.current;
    const summary = element?.querySelector('summary');
    const answer = element?.querySelector<HTMLElement>('.wd-faq__answer');
    if (
      !element ||
      !summary ||
      !answer ||
      typeof element.animate !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    event.preventDefault();
    const startHeight = element.getBoundingClientRect().height;
    const opening = animation.current ? !expanding.current : !element.open;
    expanding.current = opening;
    animation.current?.cancel();
    element.open = true;
    const endHeight =
      summary.getBoundingClientRect().height +
      (opening ? answer.getBoundingClientRect().height : 0);
    const current = element.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      {
        duration: 440,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
      },
    );
    animation.current = current;
    current.onfinish = () => {
      element.open = opening;
      animation.current = null;
      window.dispatchEvent(new Event('gift:layout'));
    };
  };

  return (
    <details
      ref={root}
      className="wd-faq__item"
      onToggle={() => {
        if (!animation.current) window.dispatchEvent(new Event('gift:layout'));
      }}
    >
      <summary onClick={toggle}>
        <h3>{q}</h3>
        <span className="wd-faq__toggle" aria-hidden />
      </summary>
      <div className="wd-faq__answer">
        <p>{a}</p>
      </div>
    </details>
  );
}

/** FAQ — the accordion. Quiet by design; the shared head is the only motion. */
export default function WdFaq() {
  return (
    <section id="faq" className="wd-sec wd-sec--paper wd-faq" aria-labelledby="wd-faq-title">
      <div className="wd-container wd-faq__inner">
        <div className="wd-faq__side">
          <WdHead label={FAQ.eyebrow} title={FAQ.title} lead={FAQ.lead} />
        </div>
        <div className="wd-faq__list">
          {FAQ.items.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
