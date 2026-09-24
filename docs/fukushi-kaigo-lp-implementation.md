# Fukushi / Kaigo catalogue landing

- Route: /fukushi-kaigo-lp
- Design source: GIFT-lp-implementation.zip, supplied 2026-09-24.
- Original export and desktop/mobile reference: \_design-assets/fukushi-kaigo/gift-lp-implementation/ (local, ignored by Git).
- HTML: src/app/fukushi-kaigo-lp/index.html.
- Local hero image, subset fonts, styles, icons and their licenses: public/fukushi-kaigo-lp/.

The route serves the exported document directly, following the existing standalone LP pattern. It does not inherit the corporate header, global CSS, page cover, or React/WebGL runtime. The approved headline, nine sectors and five examples are preserved. Desktop and mobile share one design, described below.

The footer uses the existing company data and the business description from the company page. Pending-link notices use visitor-facing Japanese. Typography now matches the homepage: Noto Sans JP (500/800) for Japanese text, with medium-weight body copy for readability and Poppins (700) for the GIFT wordmark. As on the other standalone LPs, Noto Sans JP loads through Google Fonts and Poppins reuses /fonts/Poppins-Bold.ttf. The original export font assets remain unused.

## LINE configuration

Set FUKUSHI_KAIGO_LP_LINE_URL to the approved HTTPS GIFT catalogue LINE link, then rebuild (or restart the development server). Accepted hosts: line.me, lin.ee, liff.line.me.

All three CTA links and the desktop QR are generated from that one URL. Missing or invalid values leave all three buttons in preparation mode and show a preparation message on activation. No other campaign's account is used as a fallback.

Successful CTA/QR activations enqueue fukushi_lp_line_click in window.dataLayer, with placement (hero, footer, sticky, qr) and the incoming utm_content. This is a local event hook; a reporting integration still needs configuring. No Meta pixel is activated by this change.

## Before campaign launch

Confirm the CTA wording, GIFT LINE URL, LINE form/catalogue delivery/follow-up, public domain, ad A/B attribution and analytics integration. The shared URL alone does not attribute completed LINE registrations to A/B ads.

The prototype's noindex, nofollow remains in the document and response header. Remove both only if indexing is wanted after launch readiness is confirmed.

## Verification

Production build, TypeScript, focused ESLint and UTF-8 checks pass. The production build reports two existing warnings in the shared layout and ScrollRevealText; neither belongs to this landing.

Browser checks cover 320, 375, 390, 430, 768, 1024, 1100, 1240 and 1440 px, compare the approved text with the original export, check asset/font loading and horizontal overflow, and exercise pending buttons with mouse/keyboard plus configured links, QR and event placement. Screenshots and the verification script are local under .inspect/fukushi-kaigo-lp/.

On short phones (viewport height up to 640 px and content width below 600 px), the photo uses a 180 px frame to keep the first CTA visible without reducing text sizes.

## Homepage colors and hero image

The landing uses the homepage's AI palette from tailwind.config.ts: #F0F7FF page background, #FFFFFF cards, #EFF6FF example highlights, #BFDBFE borders, #0C0E1A text, #5B6B8A secondary text, #2563EB accents, with #0B1020 for the wordmark and QR. LINE CTAs, including the sticky pill button, use #2563EB with white text and #1D4ED8 hover, with centered labels and no arrows. Desktop hero and closing CTAs use #2563EB with white labels and #60A5FA focus rings to stand out against the dark section backgrounds.

The supplied care-facility photo (2026-09-24) replaces the original illustration and is served as a local 1536 x 1024 WebP. Its 3:2 frame preserves the full scene on desktop and mobile, with a centered cover crop on short phones. The image fills the frame edge to edge, with Japanese alt text and high fetch priority. Mobile keeps the GIFT wordmark in a small white badge over the photo. Desktop starts directly with the hero, without a header strip or photo badge.

## Persistent LINE action

A compact pill floats at the bottom center throughout scrolling, on desktop and mobile. It shows LINE公式アカウント and a LINE CTA, sized to its contents rather than spanning the viewport. It uses the same configured account as the existing CTAs, with placement sticky in analytics.

The bar is outside the container-query wrapper so it stays attached to the viewport. A safe-area bottom offset and a ResizeObserver reserve only the pill height and offset at the end of the page, keeping the footer reachable. The pending button reveals an accessible preparation message above the bar.

## Photo catalogue previews

The five approved examples appear as photo cards under a display-size CATALOG heading: two columns on mobile, and two large cards then three on desktop. Each card shows its ink sector tag and task. An outlined navy chevron button beside the task text, below the photo, opens a native modal dialog containing the original situation and AI explanation. Photos stay static and are not interactive; the dialog includes the selected photo above the original explanation, showing its full composition. The grid stays fixed while the dialog opens. Escape, the close button and a backdrop click dismiss it; focus and page position return to the selected tile. The chevron turns downward on activation and returns on close. A 360 ms eased slide and fade opens the panel, and a 220 ms fade closes it before releasing the focus and scroll lock. The photo is never scaled during the transition. Reduced-motion preferences disable the movement. The approved copy and ordering are preserved. Typography remains Noto Sans JP 500/800.

The five candid activity images were generated with the built-in image_gen tool, then optimized as local 960 x 640 WebP files. The revised set uses bakery work, floor play, an outdoor walk, grocery help in a home kitchen, and standing schedule coordination, with varied camera angles and settings. They are illustrative scenes, not named customer facilities or testimonials. Source prompts and final asset paths are recorded in fukushi-kaigo-lp-image-prompts.json. Thumbnails load lazily with explicit dimensions.

## Desktop section design

At a page-container width of 1100 px and above, full-width section bands use the homepage's navy family: a #0B1020 to #1A2440 navy hero with a soft #2563EB glow, a white catalogue with #111B21 ink case tags as on the homepage Case cards, #F0F7FF instructions, white receiving steps, a matching navy closing section, and a #1A2440 footer. The hero and closing CTAs are #2563EB with white labels. Content is centered within 1120 px, and the header strip is hidden.

The desktop hero sits on a clean navy gradient (#0B1020 to #0E1629) with no top bar. The headline runs full width at up to 84 px (last line #60A5FA). On load, its three lines rise into place out of a soft blur, 140 ms apart. The photo opens with a horizontal wipe in a 16:9 frame on the right. Directly under the CTA (40 px gap; the grid gives the photo's extra height to a 1fr row below the card), a white index card with a 作業名で引く tab flips through the five approved examples (sector tag + task name) every 2.5 s. The index card is an extra desktop-only element in the HTML (aria-hidden, hidden below 1100 px). Reduced-motion preferences show everything static. The nine sectors close the hero as an editorial index: the blue 対象事業 tab and カタログの対象事業 label on the left, and the nine names on the right in a compact 18 px line with their icons and thin slashes, balanced over two lines. When the index scrolls into view, landing.js adds is-in and the names light up one after another (90 ms apart) from a dim slate. Hover turns a name light blue. Without IntersectionObserver or with reduced motion, the names render lit. The catalogue uses a six-column grid: the first two examples span three columns and the last three span two. The three 使い方 steps are white cards in a row, 受け取り方 is a horizontal three-step flow, and the closing band pairs the consultation line and CTA with the QR.

The palette variables are declared on .gift-layout and .gift-footer, not on #gift-landing, because a container query cannot style the container's ancestors. ## Mobile section design

Below 1100 px the page uses the same design in one column: navy hero with the header strip and photo badge hidden, the headline at up to 42 px (7.1cqw) with the same blur-rise, the photo wipe, the CTA, the index card, and the compact sector index (tab and label on one line, names at up to 17 px, balanced). The catalogue sits on white with ink case tags in the two-column card grid. 使い方 steps are stacked white cards on #F0F7FF, 受け取り方 is a three-box row on white, and the LINE close and footer are navy. The consultation line is split into two inline-block phrases so it can only break after 「あれば、」. theme-color is #0B1020 to match the navy top.

Palette variables, index-card internals, the sector scan and the entrance motion are shared rules outside the container queries. Layout lives in the desktop (min-width:1100px) and mobile (max-width:1099px) container blocks.

## 使い方 step path

The three steps sit on a vertical rail on both sizes. On desktop, the tab and a 56 px カタログの使い方 heading stay sticky in the left five columns while the steps scroll on the right. Each step shows its icon as the marker (52 px desktop, 36 px mobile; no numbering) and the step text at 32 px desktop or up to 22 px mobile. landing.js sets `--p` on the list from scroll position; the blue rail fill follows it, and each step gets `.is-active` once it passes 62% of the viewport height. Until then its dot is hollow, its icon is pale blue and its text is grey. Without the script, or with reduced motion, every step shows lit.

## 受け取り方 chat

The receiving steps are shown as a LINE-style chat, deliberately unlike the 使い方 rail. The tab and heading are centered (48 px desktop, up to 40 px mobile) above a 520 px chat panel. Its header reuses the existing GIFT 福祉・介護のAI活用 wording (CSS content, decorative). 「LINE登録」 is the visitor's own blue bubble on the right, 「受け取り手続き（1問）」 is a white reply, and 「カタログが届く」 is a reply card topped with the hero photo. The arrow items are hidden.

When the section is half in view, landing.js adds `.is-in` once. Each reply first shows three typing dots in its own final position, then fills in (0.6 s / 1.7 s, then 2.2 s / 3.3 s), so the panel never changes height. Without the script, or with reduced motion, the finished chat shows immediately.

## Scroll-in entrances

Below the hero, landing.js tags elements with `data-reveal` and adds `.is-shown` once each scrolls into view (10% above the viewport bottom). The kind of motion varies by element. The giant CATALOG heading and the two consultation phrases rise out of a mask (`mask`). Catalogue photos wipe open from the bottom while settling from a 1.08 zoom (`wipe`), and their titles follow 180 ms later (`fade`); cards stagger 110 ms within a row. The 使い方 and 受け取り方 headings sweep in left to right (`sweep`). The chat panel, LINE button and QR pop in (`pop`), and tabs and footer lines fade up. A clip-path-hidden element has an empty intersection rectangle, so the observer watches each element's parent. Without the script, or with reduced motion, nothing is hidden.

## LINE close

The closing section is a centered finale on navy. The LINE tab sits between two rules, and the consultation line is split into 「気になる作業があれば、」 (white) and 「無料の個別相談も」 (#60A5FA) at up to 72 px desktop or 34 px mobile. Below it are the CTA (440 × 72 px on desktop, full width on mobile) and the pending notice. On desktop, the QR sits in a row under a thin rule with 「スマートフォンで受け取る」. With a mouse, landing.js moves a 640 px blue spotlight in the background to the cursor (`--mx`/`--my`). The CTA also leans toward the cursor within 240 px, using the CSS `translate` property so it doesn't fight the reveal's `transform`. Touch devices and reduced motion get a fixed glow and a still button.
