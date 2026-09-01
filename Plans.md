# Plans

Source of truth for in-flight tasks. Statuses: `cc:TODO` / `cc:WIP` / `cc:完了`.

## Active

### T-010 DX hero VAT bake pipeline (particles on phones) — ABANDONED 2026-06-01
- status: cc:完了 (abandoned — superseded by T-011 Rive)
- abandoned because: flat bake (z≈0.3) pulsed/strobed on the turntable spin (edge-on collapse), and any WebGL hero risks the site-wide context-loss crash. Pipeline/scripts/assets kept for /dev/vat-preview reference only.
- (historical) status: cc:WIP
- owner: frontend / three
- goal: GiftLogoFluid particle face must run on EVERY device incl. phones. Live GPGPU solver can't (TDR-crashes mobile GPUs), so bake the motion once and play it back as a Vertex Animation Texture (VAT). Playback = cheap point draw reading baked positions; no per-frame solver. igloo.inc approach.
- decision (2026-05-29): user chose VAT over video — keeps 3D depth/camera + faked cursor/touch interaction. See memory project_giftlogofluid_crash.
- shape decision (CORRECTED 2026-06-01): hero is **GIFT LOGO ONLY**; the per-shape switching note below is SUPERSEDED — do NOT build a head/pet switcher; head/pet .vat.bin are kept only for /dev/vat-preview. ~~PER-SHAPE bakes with runtime switching (head/logo/pet) — 3 captures, runtime morph blending. Most interactive option.~~
- phases:
  - P1 cc:完了 — Recorder reads particle positions out of the live solver + downloads .bin. Proven.
  - P2 cc:完了 — (a) per-shape capture control (vatCapture.forcedForm pins a form + suspends auto-cycle; recorder Head/Logo/Pet selector → dx-hero-vat-{slug}.bin). (b) compressor scripts/build-vat.mjs: mean-pose base (float16) + per-axis-scaled int8 deltas → public/vat/dx-hero-{slug}.vat.bin, 4.0MB each. Round-trip verified max err 0.001u. Loop seam deferred to playback ping-pong.
  - P3 cc:完了 — loadVat.ts (parse .vat.bin → aBase attr + aTexel attr + tiled UNSIGNED_BYTE delta atlas), VatParticles.tsx (points; vertex shader pos = position(=base) + decoded delta*scale; ping-pong @30fps; renders <View> into shared RootCanvas; inner VatScene runs useFrame inside the portal), /dev/vat-preview route w/ shape selector. NO solver → phone-safe. TODO after user validates look: tune point size/color to match live, then runtime blend between the 3 shape VATs on switch. NOTE: playback is POINTS, not the live instanced-bead+lit material — shading is approximate (brand indigo). If exact bead look needed, port the instanced material to read base+delta (P3.5).
  - P4 cc:WIP — DONE (2026-06-01): wired VatParticles shape="logo" into DxV3Page for ALL devices; removed GiftLogoFluid + useGpuTier gate from the page (lib + /dev/capture-dx-vat untouched); HeroLogoSvg kept only as WebGLBoundary no-GL fallback. tsc clean, /services/dx-consulting compiles + 200s. REMAINING: ping-pong playback fix (2026-06-01 — VatParticles was forward-wrapping N-1→0 which popped the silhouette every ~5s; switched to triangle-wave ping-pong so spin looks natural) + optional cheap cursor/touch displacement for interactivity. Shape-switcher CUT (logo-only). NOT stripping [webgl-debug] RootCanvas warns (load-bearing real-failure diagnostics); [gpu-tier] warn now dead-code via orphaned useGpuTier.
- file format (public/vat/*.vat.bin, LE): magic u32 'VAT1'(0x31544156), texW u16, texH u16, frames u16, flags u16, scale f32×3 (sx,sy,sz), base float16×(N*3) mean-pose RGB, deltas int8×(frames*N*3) frame-major RGB. Reconstruct: pos = base + (delta/127)*scale. N=texW*texH.
- notes: tap point is GiftLogoFluid useFrame after `sim.gpu.compute()` — `sim.gpu.getCurrentRenderTarget(sim.posVar)` holds positions; read via `gl.readRenderTargetPixels`. RT may be Half/FloatType — match buffer.

### T-011 /plans page (AIOps plans & services, placeholder pricing)
- status: cc:WIP — hero + card reel built on `features/plans-page`; nothing below the hero yet
- owner: frontend / content
- goal: new `/plans` page for AIOps plans & services. Tiers/pricing not decided yet — placeholder content only. Reuse `/services/aiops` palette (`DX_CONSULTING_THEME`) + fonts (Gen Interface JP / Inter italic accents). Low animation budget — no WebGL/GSAP pinning.
- procedure: build on `features/plans-page` branch (off `dev`), local review, merge to `dev` only on explicit go-ahead — `dev` is now the live Vercel Production branch (`www.gift-inc.org`), so merging ships it.
- plan doc: `docs/plans-page-plan.md` (structure draft, open decisions, verification checklist)
- done so far: hero (split headline + draggable infinite card reel, desktop vertical / mobile horizontal, click-to-expand overlay, desktop auto-advance 1 card / 3s). Cards are still blank navy rectangles — no content in them.
- manual for editing it by hand: `docs/NOLLM-plans-page.md`
- next: resolve open decisions in the plan doc (tier mapping, add-on row y/n, nav entry), then draft placeholder copy before any code. `/plans` is NOT linked from the nav or sitemap — only reachable by typing the URL.

<!-- Add tasks here. Example:
### T-001 Hero variant exploration
- status: cc:TODO
- owner: design
- notes: try editorial-spread direction
-->

## Done

<!-- Completed tasks move here -->

## Archive

<!-- Older completed tasks can be split out to Plans.archive.md when this file grows -->

## Plan: AI研修サービスページ新規追加 (/services/ai-training)

ブランチ: `features/ai-training`(origin/dev 起点、worktree: `GIFT_website-ai-training`)
方針: `/plans` ページ規約を踏襲(サーバコンポーネント + `_components/` 分割 + コピーを
`aiTrainingContent.ts` に `as const` 集約 + Tailwind のみ、GSAP/WebGL 不使用)。
ソフトローンチ(ナビ・sitemap 配線は依頼者承認後の別 PR)。
価格・助成金等はプレースホルダ + 要確認ファクト一覧を添付。

### Tasks

- [x] **T-AT1**: ページ実装 <!-- cc:完了 -->
  - 対象: `src/app/services/ai-training/page.tsx`(metadata は /plans の OG 付きパターン、
    title は raw 文字列で layout の `%s | 株式会社GIFT` テンプレートに乗せる)、
    `_components/aiTrainingContent.ts`(全コピー集約)、
    `_components/` セクション 7 本: Hero(キャッチ+要点3+CTA1) / Pains(お悩み3+方向づけ1文) /
    Reasons(理由3、数字は文中に織り込む) / Steps(3-4) / Pricing(通常価格と助成金後実質負担を
    1 枚、「対象かは相談時に無料診断」1 行) / Faq(4-5 問、新規アコーディオン。既存に部品なし、
    `<details>` ベースで新造) / Cta(導線 /contact 1 本)
  - 依存: なし。KhSectionHead 相当は自前で持つ(plans/_components からの越境 import はしない)
  - DoD: `/services/ai-training` が dev サーバーで 200、全 7 セクション表示、CTA が /contact へ、
    Header/Footer/sitemap は**触らない**(ソフトローンチ)
  - テスト: `npx tsc --noEmit` clean、`npm run check:encoding` clean
  - 注意: 日本語見出し line-height≥1.25 / 全画面 vh 不使用(Instagram WebView 問題を持ち込まない)
- [x] **T-AT2**: 要確認ファクト一覧 <!-- cc:完了 -->
  - 対象: `docs/ai-training-facts-to-confirm.md`。プレースホルダにした事実(通常価格、助成金名と
    支給率、実質負担額、対象企業条件、最少催行人数、期間・回数、オンライン/対面)を
    依頼者がそのまま埋められる表形式で列挙。aiTrainingContent.ts の該当キーと対応付ける
  - DoD: プレースホルダ箇所とドキュメントの項目が 1:1 対応
- [ ] **T-AT3**: 独立レビュー + PR <!-- cc:TODO -->
  - 依存: T-AT1, T-AT2
  - DoD: harness-review(codex-closeout)で critical/major 0 → PR を dev へ。
    マージ後プレビュー URL を依頼者承認用に共有
- [ ] **T-AT4**: 本公開配線(承認後・別PR) <!-- cc:TODO -->
  - 対象: `Header.tsx` serviceItems / `Footer.tsx` footerServices / `sitemap.ts` STATIC_ROUTES
  - 依存: 依頼者のコンテンツ承認 + 確定ファクト反映
  - DoD: ナビから到達可能になった時点で sitemap 登録(sitemap 規約「nav 到達可能のみ」遵守)
