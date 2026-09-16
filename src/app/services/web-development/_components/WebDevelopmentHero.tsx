'use client';

import Link from 'next/link';
import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import styles from './WebDevelopmentHero.module.css';
import ModernEarth from './ModernEarth';
import ModernStars from './ModernStars';

function RetroPromos() {
  return (
    <div className={styles.retroAds} aria-hidden="true">
      <div className={styles.retroPoster}>
        <span className={styles.posterRibbon}>ALL IN ONE!</span>
        <span className={styles.posterTop}>GIFT WEB CREATION</span>
        <strong>
          Small business.
          <br />
          <em>Big presence.</em>
        </strong>
        <span className={styles.posterSpark} aria-hidden="true">
          ✦
        </span>
        <span className={styles.posterBottom}>
          YOUR OWN WEBSITE.
          <b>月額3万円</b>
          <small>サーバー・更新込み / 税抜</small>
        </span>
      </div>
      <div className={styles.retroBurst}>
        <span className={styles.burstInner}>
          <small>
            THE GIFT
            <br />
            WEB PACKAGE
          </small>
          <strong>
            初期費用
            <b>
              0<em>円</em>
            </b>
          </strong>
          <span>LET'S GO ONLINE!</span>
        </span>
      </div>
      <div className={styles.retroBadges} aria-hidden="true">
        <span>
          100%<b>CUSTOM DESIGN</b>
        </span>
        <span>
          WWW.<b>READY FOR THE WEB</b>
        </span>
      </div>
    </div>
  );
}

function BrowserWindow({ era }: { era: 'retro' | 'modern' }) {
  return (
    <div className={styles.browser} data-browser-era={era}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.windowControls}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.windowTitle}>GIFT — Your next chapter</span>
      </div>

      <div className={styles.menu} aria-hidden="true">
        <span>
          <u>F</u>ile
        </span>
        <span>
          <u>E</u>dit
        </span>
        <span>
          <u>V</u>iew
        </span>
        <span>
          <u>G</u>o
        </span>
        <span>
          <u>B</u>ookmarks
        </span>
        <span>
          <u>H</u>elp
        </span>
      </div>

      <div className={styles.toolbar} aria-hidden="true">
        <span className={styles.arrows}>
          ← <span>→</span>
        </span>
        <span className={styles.address}>
          <span className={styles.retroAddress}>Location: http://www.gift.home/index.html</span>
          <span className={styles.modernAddress}>⌁ &nbsp; gift-inc.co.jp / your-next-chapter</span>
        </span>
        <span className={styles.reload}>↻</span>
      </div>

      <div
        className={styles.page}
        data-wd-browser-page
        tabIndex={0}
        role="region"
        aria-label="ホームページ制作サービスのプレビュー"
      >
        {era === 'modern' && <ModernStars />}
        <div className={styles.welcome} aria-hidden="true">
          <span>★</span> Welcome to the GIFT Home Page! <span>★</span>
          <span className={styles.welcomeExtra}>Your dream website starts here.</span>
        </div>

        <div className={styles.content}>
          <div className={styles.copy}>
            <h2 className={styles.title}>
              <span>
                <span className={styles.titleKeyword}>ホームページ</span>の制作も、
              </span>
              <span>サーバーも、更新も。</span>
              <span className={styles.titleLast}>
                <em>
                  <span>ぜんぶ込みで、</span>
                  <span>月額3万円。</span>
                </em>
              </span>
            </h2>
            <p className={styles.lead}>
              初期費用は0円。テンプレートではない、御社専用デザインのホームページを最大10ページ。
              <br />
              公開したあとの管理と更新まで、まとめてお任せいただけます。
            </p>

            <div className={styles.offer}>
              <div className={styles.offerTop}>
                <span>サーバー・更新対応 込み</span>
                <span className={styles.initialFee}>
                  初期費用 <b>0</b> 円
                </span>
              </div>
              <p className={styles.price}>
                <strong>月額3万円</strong>
                <span>／月（税抜）</span>
              </p>
            </div>

            <ul className={styles.services} aria-label="月額料金に含まれる内容">
              <li>
                <span aria-hidden="true">✓</span>
                <div className={styles.serviceText}>
                  御社専用デザイン（テンプレ不使用）で<span>最大10ページ</span>
                </div>
              </li>
              <li>
                <span aria-hidden="true">✓</span>
                <div className={styles.serviceText}>
                  サーバー・ドメイン・SSLの<span>管理費込み</span>
                </div>
              </li>
              <li>
                <span aria-hidden="true">✓</span>
                公開後の軽微な更新対応も込み
              </li>
            </ul>

            <div className={styles.actions}>
              {era === 'modern' ? (
                <Link href="/contact" className="cta-btn cta-btn--wd-white">
                  <span>お問い合わせ・ご相談はこちら</span>
                </Link>
              ) : (
                <Link href="/contact" className={styles.contact}>
                  お問い合わせ・ご相談はこちら
                </Link>
              )}
            </div>
          </div>

          <div className={styles.visual}>
            {era === 'modern' ? (
              <ModernEarth />
            ) : (
              <>
                <RetroPromos />
                <div className={styles.art} aria-hidden="true">
                  <span className={styles.artLabel}>A WORLD OF POSSIBILITIES</span>
                  <span className={styles.starOne}>✦</span>
                  <span className={styles.starTwo}>✦</span>
                  <div className={styles.globe}>
                    <svg viewBox="0 0 240 240" fill="none">
                      <circle cx="120" cy="120" r="113" />
                      <ellipse cx="120" cy="120" rx="74" ry="113" />
                      <ellipse cx="120" cy="120" rx="29" ry="113" />
                      <ellipse cx="120" cy="120" rx="113" ry="42" />
                      <path d="M20 68Q120 105 220 68M20 172Q120 135 220 172M7 120H233M120 7V233" />
                    </svg>
                    <span className={styles.globeShine} />
                  </div>
                  <span className={styles.orbit} />
                  <span className={styles.artCaption}>
                    You dream it.
                    <br />
                    <em>We build it.</em>
                  </span>
                  <span className={styles.pixelCursor}>
                    <svg viewBox="0 0 28 34">
                      <path d="M2 2v26l7-7 6 11 5-3-6-10h10Z" />
                    </svg>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statusbar} aria-hidden="true">
        <span className={styles.retroStatus}>Document: Done</span>
        <span className={styles.modernStatus}>Made for you. Built for what’s next.</span>
      </div>
    </div>
  );
}

export default function WebDevelopmentHero() {
  const rootRef = useRef<HTMLElement>(null);
  const pixelId = useId().replace(/:/g, '');
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scrollers = Array.from(
      root?.querySelectorAll<HTMLElement>('[data-wd-browser-page]') ?? [],
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initialEra = reduced ? 'modern' : 'retro';
    if (root) root.dataset.era = initialEra;
    root?.querySelectorAll<HTMLElement>('[data-browser-era]').forEach((browser) => {
      const active = browser.dataset.browserEra === initialEra;
      browser.inert = !active;
      browser.setAttribute('aria-hidden', String(!active));
    });
    const syncScroll = (event: Event) => {
      const source = event.currentTarget as HTMLElement;
      if (source.closest<HTMLElement>('[data-browser-era]')?.inert) return;
      const ratio = source.scrollTop / Math.max(1, source.scrollHeight - source.clientHeight);
      scrollers.forEach((target) => {
        if (target !== source)
          target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
      });
    };
    scrollers.forEach((element) =>
      element.addEventListener('scroll', syncScroll, { passive: true }),
    );
    window.dispatchEvent(new Event('gift:logo-ready'));
    return () => scrollers.forEach((element) => element.removeEventListener('scroll', syncScroll));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => root.setAttribute('data-hero-entered', '');
    const onScroll = () => {
      if (window.scrollY > 4) finish();
    };
    const onEnd = (event: AnimationEvent) => {
      if ((event.target as HTMLElement).hasAttribute('data-hero-entrance-timeline')) finish();
    };

    // Entrance transforms never change the frozen geometry or scroll progress.
    // Hand control back immediately when the visitor starts interacting.
    if (motion.matches || window.scrollY > 4) finish();
    root.addEventListener('animationend', onEnd);
    root.addEventListener('pointerdown', finish, { passive: true });
    root.addEventListener('wheel', finish, { passive: true });
    root.addEventListener('focusin', finish);
    window.addEventListener('scroll', onScroll, { passive: true });
    motion.addEventListener('change', finish);
    const fallback = window.setTimeout(finish, 1900);
    return () => {
      window.clearTimeout(fallback);
      root.removeEventListener('animationend', onEnd);
      root.removeEventListener('pointerdown', finish);
      root.removeEventListener('wheel', finish);
      root.removeEventListener('focusin', finish);
      window.removeEventListener('scroll', onScroll);
      motion.removeEventListener('change', finish);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="web-development-hero"
      className={styles.hero}
      data-time-travel
      data-pixel-clip-id={pixelId}
      data-era="retro"
      aria-labelledby="wd-title"
    >
      <h1 id="wd-title" className={styles.srOnly}>
        ホームページの制作も、サーバーも、更新も。ぜんぶ込みで、月額3万円。
      </h1>
      <div className={styles.stage}>
        <div className={styles.browserViewport} data-pixel-viewport>
          <BrowserWindow era="retro" />
          <BrowserWindow era="modern" />
          <svg
            className={styles.pixelOverlay}
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <clipPath id={pixelId} clipPathUnits="objectBoundingBox" data-pixel-mask />
            </defs>
            <g data-pixel-tiles />
          </svg>
        </div>

        <div className={styles.timeline} data-hero-entrance-timeline>
          <div className={styles.eraTrack} aria-hidden="true">
            <span>1994</span>
            <span className={styles.track}>
              <i />
            </span>
            <span>TODAY</span>
          </div>
          <p className={styles.timelineNote}>時代が変わる。Webも、変わる。</p>
          <p className={styles.scrollCue} data-hero-scroll-cue>
            <span className={styles.scrollCueText} data-hero-cue-text data-cue-era="retro">
              <strong>下にスクロール</strong>
              <small>スクロールで新しいサイトへ</small>
            </span>
            <span className={styles.scrollArrow} aria-hidden="true">
              ↓
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
