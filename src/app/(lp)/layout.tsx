import type { Metadata } from 'next';
import './lp.css';

// These pages take paid/video-CM traffic, not search — noindex keeps them
// from competing with /services/aiops (and each other) for the same
// Japanese keywords. See docs/aiops-lp-plan.md §1.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Page-scoped fonts, loaded the same way /plans does it (PlansFontsLink in
// src/app/plans/page.tsx) — Inter + Noto Sans JP only, never the corporate
// Gen Interface JP. The LP is a deliberately different visual identity
// aimed at cold ad traffic. See docs/aiops-lp-plan.md §4.2.
function LpFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Noto+Sans+JP:wght@700;800;900&display=swap"
      />
    </>
  );
}

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LpFontsLink />
      {/*
        The white flash fix. src/app/layout.tsx renders #page-cover — a fixed
        #F0F7FF panel at z-index 9999 with an INLINE style attribute — and
        sets body to #F0F7FF, also inline. It only fades on window.load + 100ms
        (3s hard cap). Both LP heroes are #050505, so without this a visitor
        lands on a white sheet for up to three seconds.

        !important is required, not decorative: both targets carry inline
        `style` attributes, which only a rule with !important can beat.
        Because this <style> tag is rendered by a server component, it's in
        the first HTML byte, so it applies at first paint — before hydration,
        before the cover's own fade script even runs.

        DO NOT remove #page-cover from the DOM, and do not add JS that
        touches it here or anywhere else. It's a React-owned node rendered by
        the root layout; a previous attempt to .remove() it raced hydration
        and produced React #418/#423 in production (see project memory:
        "#page-cover: No Structural DOM"). Restyling it, as this <style> tag
        does, is safe. Deleting it is not.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `body{background-color:#050505 !important}#page-cover{background-color:#050505 !important}`,
        }}
      />
      {/*
        Analytics / conversion pixel insertion point. Ad traffic behind these
        pages implies tracking tags — this is the single documented place to
        add them (see docs/aiops-lp-plan.md §4.5) rather than scattering
        scripts across individual sections. Nothing is wired yet: the ad
        platform (Google / Meta / LINE) isn't decided, and the LINE CTA href
        itself is still '#' (see LP_CTA.href in src/data/lp-variants.ts).
      */}

      {/*
        .lp-page is the scoping root lp.css styles against (see the comment
        on `.lp-page` in lp.css) — it carries the LP's own font-family/color/
        line-height instead of relying on the shared <body>, which every
        other route on the site also depends on. Not nav, not chrome — a
        single structural wrapper the stylesheet needs to stay contained to
        the LP.
      */}
      <div className="lp-page">{children}</div>
    </>
  );
}
