'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import WdWebsitePreview from './WdWebsitePreview';

const PROMISE = 'ぜんぶ込みで、月額3万円。';

function useTypewriter(text: string) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text);
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = window.setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) clearInterval(interval);
      }, 60);
    }, 760);
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text]);

  return displayed;
}

export default function WebDevelopmentHero() {
  const rootRef = useRef<HTMLElement>(null);
  const displayed = useTypewriter(PROMISE);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-wd-enter]', { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        '[data-wd-enter]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out', delay: 0.4 },
      );
    }, rootRef);
    window.dispatchEvent(new Event('gift:logo-ready'));
    return () => context.revert();
  }, []);

  const typedPrefix = displayed.slice(0, 7);
  const typedPrice = displayed.slice(7);

  return (
    <section ref={rootRef} id="web-development-hero" className="wd-hero" aria-labelledby="wd-title">
      <div className="wd-hero__atmosphere" aria-hidden="true">
        <span className="wd-orbit wd-orbit--one" />
        <span className="wd-orbit wd-orbit--two" />
        <span className="wd-glow" />
      </div>

      <div className="wd-hero__inner wd-hero__inner--website">
        <div className="wd-copy">
          <p className="wd-eyebrow" data-wd-enter>
            <span>Website Design &amp; Care</span>
            <span className="wd-eyebrow__jp">ホームページ制作・保守</span>
          </p>

          <h1 id="wd-title" className="wd-title" data-wd-enter>
            <span className="wd-title__line">
              ホームページの<em>制作</em>も、
            </span>
            <span className="wd-title__line">
              サーバーも、<em>更新</em>も。
            </span>
            <span className="wd-promise" aria-label={PROMISE}>
              <span className="wd-promise__sizer" aria-hidden="true">
                ぜんぶ込みで、
                <em>
                  月額<span>3</span>万円。
                </em>
              </span>
              <span className="wd-promise__typed" aria-hidden="true">
                {typedPrefix}
                <em>
                  {typedPrice.slice(0, 2)}
                  <span>{typedPrice.slice(2, 3)}</span>
                  {typedPrice.slice(3)}
                </em>
                {displayed.length < PROMISE.length && <i className="wd-caret" />}
              </span>
            </span>
          </h1>

          <p className="wd-lead" data-wd-enter>
            <strong>初期費用は0円。</strong>
            テンプレートではない御社専用デザインを、最大10ページ。
            公開後の管理と更新まで、ひとつのチームにお任せいただけます。
          </p>

          <ul className="wd-benefits" data-wd-enter aria-label="月額料金に含まれる内容">
            <li>オリジナルデザイン</li>
            <li>サーバー・ドメイン・SSL</li>
            <li>公開後の軽微な更新</li>
          </ul>

          <div className="wd-actions" data-wd-enter>
            <Link className="cta-btn cta-btn--wd" href="/contact">
              <span>お問い合わせ・ご相談</span>
            </Link>
            <p className="wd-price-note">
              <strong>¥30,000</strong>
              <span>/ month · 税抜</span>
            </p>
          </div>
        </div>

        <WdWebsitePreview />
      </div>

      <p className="wd-scroll" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </p>
    </section>
  );
}
