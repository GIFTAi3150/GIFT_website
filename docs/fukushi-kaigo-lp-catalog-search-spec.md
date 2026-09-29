# /fukushi-kaigo-lp — catalogue search + 保育 (manager feedback 2026-09-29)

Files: `src/app/fukushi-kaigo-lp/index.html`, `src/app/fukushi-kaigo-lp/route.ts`,
`public/fukushi-kaigo-lp/assets/gift-lp.css`, `public/fukushi-kaigo-lp/assets/landing.js`.
Every visual change ships to BOTH the desktop (`@container gift-page (min-width:1100px)`) and the
mobile (`max-width:1099px`) blocks. Keep the accepted navy/white band palette and type.

## 1. LINE destination (route.ts) — ON HOLD (2026-09-29)

- The LINE official account hasn't been received yet. Do **not** add a fallback URL constant to
  `configuredLineUrl()` — it keeps returning `null` unless `FUKUSHI_KAIGO_LP_LINE_URL` is set (env
  still overrides, same validation). Keep the pending path exactly as it is: the
  `<button data-line-pending>` branch + `.gift-provisional` status text in `lineButton()`, the
  `.gift-qr-placeholder`「QRコード準備中」branch, the `[data-line-pending]` handler in landing.js,
  and their CSS all stay.
- Label only: `LINE登録して特典を受け取る` → `LINE登録してカタログを受け取る` (sticky stays
  `LINEで受け取る`).
- `続きはLINEで` (§3) still scrolls to `.gift-qr-space` when rendered, else `.gift-line-card` —
  unaffected by the hold, since both targets exist regardless of the pending state.

## 2. 対象事業: 9 → 12, order 介護 → 障がい福祉 → 保育

`.gift-sectors` order (label spans):
1. 訪問介護 2. デイサービス 3. 施設 4. ケアマネ 5. 訪問看護 (介護)
6. 就労支援 7. 放課後等デイ 8. 生活介護・GH 9. 相談支援 (障がい福祉)
10. 認可保育所 11. 認定こども園・幼稚園 12. 事業所内・企業主導型 (保育)

Move the existing `<li>`s (keep their icons); add three new `<li>`s in the same markup with lucide
icons `baby`, `school`, `building-2` (copy the icon nodes from
`node_modules/lucide-react/dist/esm/icons/*.js` into the same inline-SVG form the others use).
The scan-on-enter animation must still light all 12. Check the wrap still balances on both sizes.

## 3. Replace the CATALOG section (`section.gift-examples`) with catalogue search

Remove: the 5 example cards, `<dialog id="gift-example-dialog">`, the dialog JS in landing.js, the
`.gift-example*` / `.gift-dialog*` CSS (both blocks), the example entries in the reveal list, and the
10 files `public/fukushi-kaigo-lp/assets/example-*.webp`. The hero photo is now the only photo.

New section, same grid slot and white band, keeping the giant `CATALOG` kicker:

```html
<section class="gift-catalog" id="catalog" aria-labelledby="gift-catalog-title">
  <div class="gift-section-heading">
    <span class="gift-section-kicker" lang="en" aria-hidden="true">CATALOG</span>
    <p class="gift-catalog-edition">GIFT AIスキルカタログ 2026年9月版</p>
    <h2 id="gift-catalog-title"><span class="gift-catalog-thin">現場の仕事から書き出した</span>業種別 AIスキルカタログ</h2>
    <p class="gift-catalog-lead">介護・障がい福祉・保育の12事業。AIに任せられる作業を「作業名・AIがすること・こんな時に」の形で1本ずつ書き出しました。</p>
  </div>
  <div class="gift-catalog-stats">
    <p><span class="gift-count" data-count-to="851">851</span><small>本</small><span class="gift-stat-label">AIに任せられる作業</span></p>
    <p><span class="gift-count" data-count-to="12">12</span><small>事業</small><span class="gift-stat-label">介護・障がい福祉・保育</span></p>
  </div>
  <p class="gift-catalog-breakdown">介護 <span class="gift-count" data-count-to="368">368</span>本 ／ 障がい福祉 <span class="gift-count" data-count-to="311">311</span>本 ／ 保育 <span class="gift-count" data-count-to="172">172</span>本<small>（2026年9月29日時点）</small></p>
  <form class="gift-search" role="search">
    <label class="gift-sr-only" for="gift-q">作業名や困りごとの言葉で探す</label>
    <div class="gift-search-box">
      <!-- search icon svg (circle r=7 at 11,11 + path M20 20l-3.5-3.5), aria-hidden -->
      <input id="gift-q" type="search" placeholder="作業名や困りごとの言葉で探す" autocomplete="off" enterkeyhint="search" />
      <button type="submit">探す</button>
    </div>
    <p class="gift-search-hints">例：<button type="button" data-q="シフト">シフト</button><button type="button" data-q="送迎">送迎</button><button type="button" data-q="請求">請求</button><button type="button" data-q="保護者">保護者</button><button type="button" data-q="研修">研修</button><button type="button" data-q="欠席">欠席</button></p>
  </form>
  <div class="gift-search-results" hidden>
    <p class="gift-search-count" aria-live="polite"></p>
    <ol class="gift-search-list"></ol>
    <a class="gift-search-more" href="#line">続きはLINEで</a>
  </div>
</section>
```

(Use an existing visually-hidden class if the stylesheet already has one.)

### Styling
Editorial, matching this page — no rounded SaaS cards, no drop shadows, no badges. Big numerals in
the Poppins display face used elsewhere; stats read as a row of two figures with a hairline between.
Search box: one strong field (ink border, square-ish corners like the page's other controls), the
submit button in the page CTA blue #2563EB. Hints = small text buttons. Results = a ruled list:
`事業：{industry}` tag in the same style as the old `.gift-sector` tag, the task name large, then
`AIがすること：{does}` in muted text, clamped to 2 lines. `続きはLINEで` = a full CTA button in the
same style as `.gift-line-button`, centred under the list. Mobile: single column, 16px input font
(no iOS zoom), results full-width.

### Data
`public/fukushi-kaigo-lp/assets/skills-2026-09.json` — array of
`[group, industry, name, does, when]`, only groups 介護 / 障がい福祉 / 保育, ordered 介護 → 障がい福祉 →
保育 and catalogue order inside each. Built by `scripts/fukushi-kaigo-lp/build-skills.mjs <path to
search-data.js>` (the catalogue's `window.SKILLS=[…]` file; fields g=group, i=industry, n=name,
p=does, c=when). The script must assert 368 / 311 / 172 = 851 and 12 distinct industries, and must
NOT contain the catalogue's host URL (public repo).

### Behaviour (landing.js)
- Lazy-load the JSON once (cached promise) on first focus / input / hint click, and prefetch when the
  section comes within ~600px (IntersectionObserver rootMargin).
- Normalise query and haystack with NFKC + lowercase; split query on whitespace; a row matches when
  every token is in `name + does + when + industry + group`. Rank rows whose name matches all tokens
  first, keep catalogue order otherwise.
- Search on submit and on input (debounced ~200ms). Empty query → hide results.
- Show the first 3 matches. Count line: `「{q}」に合う作業 {N}本（うち3本を表示）`; if N ≤ 3 omit the
  parenthesis. Zero hits: `「{q}」に合う作業は見つかりませんでした。LINEでご相談ください。` and still
  show the button. Build result nodes with textContent (no innerHTML with data).
- Hint click fills the input and searches.
- `続きはLINEで`: preventDefault, smooth-scroll (instant under prefers-reduced-motion) so the QR is
  centred: target `.gift-qr-space` when rendered, else `.gift-line-card` (the QR is hidden ≤1099px).
- Count-up: each `.gift-count` animates 0 → `data-count-to` over ~1.4s easeOutCubic when
  `.gift-catalog-stats` enters (threshold ~0.4), once. Set to 0 at init only if the element starts
  below the viewport; under reduced motion or without IO leave the final numbers.
- Reveal list: replace the example entries with `.gift-catalog .gift-section-heading h2` (fade),
  `.gift-catalog-stats` (fade), `.gift-search` (fade), using the existing mechanism.

## 4. Page naming: 福祉・介護 → 介護・福祉・保育 (2026-09-29)

Add 保育 to the page naming, order 介護・福祉・保育, in index.html:
- `<title>`: 介護・福祉・保育 AI活用カタログ｜株式会社GIFT
- meta description: 「福祉・介護の現場」→「介護・福祉・保育の現場」
- h1 first span: 「介護・福祉・保育の現場の作業を、」
- header `<p>`: 介護・福祉・保育のためのAI活用
- `.gift-wordmark <small>`: 介護・福祉・保育のAI活用
- also found and updated: `.gift-receive-flow-card .gift-receive-flow::before` in gift-lp.css sets
  the chat-header `content: "GIFT　福祉・介護のAI活用"` — same replacement.

The h1 line is 3 chars longer (13 → 16 chars). Measured with Playwright across 320–2560px: the old
clamps overflowed the `.gift-layout` box by up to +30px on mobile and +25px on desktop at common
widths (375px, 1920px+). Reduced both clamps to remove the overflow with a safety margin:
- Desktop (`min-width:1100px`): `clamp(56px,min(5.7cqw,10.5vh),84px)` →
  `clamp(56px,min(5.5cqw,10.1vh),80px)`.
- Mobile (`max-width:1099px`): `min(7.1cqw,42px)` → `min(6.2cqw,38px)`.

Re-measured after the change: no overflow across 320–2560px (worst-case margin ~14px on mobile,
~25px on desktop).

## Spec changes vs the original brief
- 本数を出さない → 851本を表示 (count-up)
- 対象9事業 → 保育を足して12事業
- LINE account pending → §1 put on hold 2026-09-29, only the button label changed
