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
