import { LP_CTA } from '@/data/lp-variants';

// Identical on both A and B, so it's hardcoded against LP_CTA rather than
// threaded through per-variant data (see docs/aiops-lp-plan.md §3).
export default function LpCta() {
  return (
    <section className="lp-cta" aria-label="公式LINEでの面談予約">
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
        <a className="lp-button" href={LP_CTA.href}>
          {LP_CTA.button}
        </a>
      </div>
    </section>
  );
}
