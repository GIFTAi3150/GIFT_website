'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './WdWebsitePreview.module.css';

export default function WdWebsitePreview() {
  const [modern, setModern] = useState(false);

  return (
    <figure
      className={styles.preview}
      data-era={modern ? 'modern' : 'retro'}
      data-wd-preview
      data-wd-enter
      lang="en"
    >
      <figcaption className={styles.caption}>
        <span>A LITTLE TIME TRAVEL</span>
        <span className={styles.eras} aria-hidden="true">
          <span className={!modern ? styles.activeEra : undefined}>1990s</span>
          <span className={styles.eraLine} />
          <span className={modern ? styles.activeEra : undefined}>Today</span>
        </span>
      </figcaption>

      <div className={styles.browser} id="wd-website-demo">
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.windowControls}>
            <i />
            <i />
            <i />
          </span>
          <span>{modern ? 'GIFT — A new beginning' : 'GIFT Home Page'}</span>
          <span className={styles.windowMark}>{modern ? '+' : '▣'}</span>
        </div>
        {!modern && (
          <div className={styles.menu} aria-hidden="true">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Go</span>
            <span>Help</span>
          </div>
        )}
        <div className={styles.address} aria-hidden="true">
          <span className={styles.arrows}>← &nbsp; →</span>
          <span className={styles.url}>
            <span>{modern ? '⌁' : 'Location:'}</span>
            {modern ? 'your-next-chapter.gift' : 'http://www.gift.home/index.html'}
          </span>
          <span>↻</span>
        </div>

        {modern ? (
          <div className={styles.modernPage} key="modern">
            <div className={styles.modernNav}>
              <span className={styles.wordmark}>
                GIFT<span>®</span>
              </span>
              <span>IDEAS INTO REALITY</span>
              <span aria-hidden="true">☰</span>
            </div>
            <div className={styles.modernContent}>
              <p className={styles.modernEyebrow}>YOUR VISION. OUR CRAFT.</p>
              <h2>
                Let’s build
                <br />
                the future.
                <br />
                <em>Together.</em>
              </h2>
              <p className={styles.modernLead}>
                A website as ambitious as you are.
                <br />
                Designed to make your next chapter happen.
              </p>
              <Link className={styles.modernContact} href="/contact">
                Let’s talk <span aria-hidden="true">↗</span>
              </Link>
              <div className={styles.flower} aria-hidden="true">
                <svg viewBox="0 0 160 160" fill="currentColor">
                  <path d="M66 0h28v46l32-32 20 20-32 32h46v28h-46l32 32-20 20-32-32v46H66v-46l-32 32-20-20 32-32H0V66h46L14 34l20-20 32 32Z" />
                </svg>
                <span>
                  GOOD THINGS
                  <br />
                  START HERE.
                </span>
              </div>
            </div>
            <div className={styles.modernFooter}>
              <span>Made for you. Built for what’s next.</span>
              <span aria-hidden="true">✳</span>
            </div>
          </div>
        ) : (
          <div className={styles.retroPage} key="retro">
            <div className={styles.retroMasthead}>
              <span className={styles.retroLogo} aria-hidden="true">
                G
              </span>
              <span>Welcome to the GIFT Home Page</span>
            </div>
            <div className={styles.retroLayout}>
              <div className={styles.retroSidebar} aria-hidden="true">
                <span>About GIFT</span>
                <span>Our Services</span>
                <span>Dreams &amp; Ideas</span>
                <span>What’s New?</span>
                <span>Guestbook</span>
                <strong>
                  WWW
                  <br />
                  <small>since the 90s</small>
                </strong>
              </div>
              <div className={styles.retroContent}>
                <p className={styles.retroWelcome}>
                  <b>NEW!</b> You dream it. We build it.
                </p>
                <h2>
                  Your dream
                  <br />
                  website
                  <br />
                  starts here.
                </h2>
                <hr />
                <p>
                  Big ideas deserve a home on the web.
                  <br />
                  Let GIFT bring yours to life.
                </p>
                <Link href="/contact">[ Let’s make it happen! ]</Link>
                <span className={styles.retroConstruction}>✦ This is where it all begins. ✦</span>
              </div>
            </div>
            <div className={styles.retroFooter}>
              <span>
                You are visitor <b>0 0 0 1 9 9 4</b>
              </span>
              <span>Best viewed with imagination.</span>
            </div>
          </div>
        )}

        {!modern && (
          <div className={styles.statusbar} aria-hidden="true">
            <span>Document: Done</span>
            <span>●</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.upgrade}
          onClick={() => setModern((current) => !current)}
          aria-controls="wd-website-demo"
          aria-pressed={modern}
        >
          <span>{modern ? '↶' : '↗'}</span>
          {modern ? 'Back to the 90s' : 'Upgrade this website'}
        </button>
        <p>
          {modern ? 'Same dream. A whole new possibility.' : 'Same dream. Ready for a new era?'}
        </p>
      </div>
      <span className={styles.srOnly} role="status">
        {modern
          ? 'Modern website preview. Let’s build the future. Together.'
          : '1990s website preview. Your dream website starts here.'}
      </span>
    </figure>
  );
}
