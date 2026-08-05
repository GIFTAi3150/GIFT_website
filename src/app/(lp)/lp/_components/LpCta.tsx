import { LP_CTA } from '@/data/lp-variants';

// Identical on both A and B, so it's hardcoded against LP_CTA rather than
// threaded through per-variant data (see docs/aiops-lp-plan.md §3).
//
// Was a full-bleed #06C755 field until 2026-08-05. It was replaced because
// white-on-LINE-green is 2.23:1 — the h2 and the only CTA on the page were
// both under AA — and because the section asked for a LINE add without
// showing what arrives after the tap. Rationale + the settled decisions
// (button outside the phone, wordmark deleted, dark-mode chat) are in
// docs/aiops-lp-cta-line-phone.md. Read it before changing the colour field.
export default function LpCta() {
  return (
    <section className="lp-cta" aria-label="公式LINEでの面談予約">
      <div className="lp-cta-grid">
        <div className="lp-cta-inner">
          <p className="lp-eyebrow">{LP_CTA.eyebrow}</p>
          <h2>
            {LP_CTA.heading.map((line, i) => (
              <span className="lp-line" key={i}>
                {line}
              </span>
            ))}
          </h2>
          <p>{LP_CTA.body}</p>
          {/*
            ⚠️ HARD LAUNCH BLOCKER — LP_CTA.href is still '#' (see the comment
            on it in src/data/lp-variants.ts). This is the ONLY conversion
            point on either page: swap in the real 公式LINE URL, and fire the
            ad-platform conversion event here before navigating, once the ad
            platform is known (docs/aiops-lp-plan.md §4.4 / §4.5).
            Plain <a>, not next/link — this is meant to become an external
            LINE URL, not an internal route.
          */}
          <a className="lp-button lp-cta-btn" href={LP_CTA.href}>
            {/* Generic speech bubble, deliberately NOT the LINE mark — the
                official logotype has usage terms we have not cleared. */}
            <svg className="lp-cta-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3C6.9 3 2.8 6.4 2.8 10.6c0 2.4 1.4 4.6 3.6 6 .2.1.3.4.2.6l-.5 1.9c-.1.3.2.6.5.4l2.4-1.3c.2-.1.4-.1.6-.1.8.2 1.6.3 2.4.3 5.1 0 9.2-3.4 9.2-7.7S17.1 3 12 3Z"
              />
            </svg>
            <span>{LP_CTA.button}</span>
          </a>
        </div>

        {/* Decorative: a preview of the talk the visitor is about to open.
            aria-hidden because it restates the copy column in picture form —
            a screen reader should not read the mock conversation as content. */}
        <div className="lp-cta-phone" aria-hidden="true">
          <div className="lp-phone-frame">
            <span className="lp-phone-speaker" />
            <div className="lp-phone-screen">
              <div className="lp-chat-bar">
                <span className="lp-chat-back" />
                <span className="lp-chat-name">株式会社GIFT</span>
                <span className="lp-chat-menu" />
              </div>
              <div className="lp-chat-body">
                <div className="lp-chat-row is-in">
                  {/* Absolutely positioned inside the row, so it costs no
                      layout — the row already reserves its bubble's height and
                      the dots appear exactly where the message will land. */}
                  <span className="lp-chat-typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <p className="lp-bubble">
                    ご登録ありがとうございます。御社で「AIに任せられる業務」を一緒に洗い出します。
                  </p>
                </div>
                <div className="lp-chat-row is-in">
                  <span className="lp-chat-typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <p className="lp-bubble">ご希望の日時をお選びください。</p>
                </div>
                <div className="lp-chat-row is-out">
                  <p className="lp-bubble">来週の火曜 14:00 で</p>
                  <span className="lp-chat-meta">既読</span>
                </div>
                <div className="lp-chat-row is-in">
                  <span className="lp-chat-typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <p className="lp-bubble">承知しました。当日はこのトークからご案内します。</p>
                </div>
              </div>
              <div className="lp-chat-input">
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
