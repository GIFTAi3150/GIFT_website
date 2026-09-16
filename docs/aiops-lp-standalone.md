# Standalone AIOps landing page

- Branch: `features/aiops-lp-standalone`
- Route: `/aiops-lp`
- Source: `gift-ai-landing-page.zip`, supplied September 16, 2026.
- Local preview: `npm run dev -- --hostname 127.0.0.1 --port 3002`,
  then open `http://127.0.0.1:3002/aiops-lp`.

## Integration

The route serves the supplied HTML as its own document. This preserves the
design's shaders and page-level CSS without
loading the corporate site's React layout, global styles, or animations.
The LP has no navbar or footer; it begins with the hero and ends with the contact section.

Edit markup in `src/app/aiops-lp/index.html`. Assets live in
`public/aiops-lp/`; the HTML uses absolute asset URLs so the page works at
`/aiops-lp` without a trailing slash. The section backgrounds, cards, and accents
use the main site's navy and slate-blue palette. The large green LINE button is
the only CTA. The page has no other links or section-jump buttons, directional
arrows, or section/card/menu index numbers. Typography matches
the main site: Noto Sans JP
at weights 300/500/800 for body and Japanese text, and Poppins 700 for English
display text. Poppins reuses the existing /fonts/Poppins-Bold.ttf asset. The
animated GIFT cutout uses the same display font. There is no floating play/pause
button. The background follows reduced-motion preferences and suspends rendering
when the browser tab is hidden. Ripple/tap instructions in both languages and
the scroll prompt/mouse icon are omitted; the background still responds to touch
and pointer input. The hero has a navy fade behind the left-side copy that clears toward the right.
On mobile, the fade shades the full-width text and opens toward the bottom.
Text shadows provide additional contrast; the animation still covers the full hero.
Keep the included attribution and
`THIRD-PARTY-NOTICES.txt` with them.

The route is statically rendered at build time. Both the HTML robots meta tag
and the response's X-Robots-Tag specify noindex, nofollow. Do not add this page
to the navbar, footer, sitemap, or any other site links. It remains accessible
to anyone with the direct URL.

## LINE contact

The final section has one short heading and a prominent green pill-shaped LINE button:
up to 800px wide and 120px high on desktop, full-width and at least 96px high
on mobile. The button is the only green accent, with dark text for contrast.
Rounded ends and a soft glow give the button a softer silhouette.
Hover and keyboard focus add a gentle lift, a single shine sweep, and a brief
icon bounce on pointer devices. Reduced-motion preferences disable those effects.

The supplied `public/aiops-lp/site-config.js` leaves LINE_URL empty.
Until a verified LINE URL is supplied, the button opens an availability dialog
with no links to other pages. Only a configured LINE URL can redirect visitors.
No form submission or analytics is added.

## Existing video LP

The separate `features/aiops-lp` branch serves the video concepts at `/lp`.
This page owns only `/aiops-lp` and its assets; it does not modify the video LP.
