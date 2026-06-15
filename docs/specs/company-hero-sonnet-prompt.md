# Prompt for Sonnet — /company hero faithful port

Copy-paste everything below the line into a fresh Sonnet session in this repo.

---

Implement the /company page hero rework specified in
`docs/specs/company-hero-biscom-faithful-port.md`. That spec is the single source of
truth — it contains source-verified shaders, constants, timeline values, and scroll
behavior reverse-engineered from biscom.jp/10th. Do not re-investigate the reference
site, do not re-derive or "improve" any constant, and do not substitute your own design
ideas; if something in the spec seems wrong or impossible, stop and ask instead of
improvising.

Order of work:

1. Read `CLAUDE.md`, then the FULL spec, then read these files before touching anything:
   `src/components/sections/HeroClipText.tsx`, `src/app/company/page.tsx`,
   `src/app/company/_components/CompanyAnimations.tsx`, and
   `src/app/company/loading.tsx` if it exists.
2. Execute spec Phases A → B → C → D in order. Phase E (letterform video) is
   asset-gated: implement ONLY the `letterVideoSrc?: string` prop and fallback wiring —
   do not source or download a video yourself; the dark-multiply text fallback stays
   the default.
3. Finish with Phase F (QA gate) exactly as written: `npm run build` + `npm run start`,
   probe `http://127.0.0.1:3000/company` (not localhost), verify the visual checklist,
   then report results honestly — including anything that failed.

Hard rules (non-negotiable):

- NEVER run `git commit`, `git push`, `git add`, or any git write command. The user
  commits. Leave changes in the working tree.
- This machine is PowerShell + Windows Node on `C:\`. Do not use WSL.
- **Download hygiene:** if you download ANYTHING during this task — reference pages,
  JS bundles, images, fonts, stock files, test artifacts — you must delete it before
  ending your turn, and verify the deletion (list the location and show it's gone).
  This includes temp directories (`/tmp`, `%TEMP%`) and anywhere inside the repo.
  Never save any biscom.jp file into the repo, even temporarily — their assets are
  copyrighted. The ONLY new binary files allowed in the repo are the GIFT-generated
  `public/company/hero-field.webp` and `public/company/hero-leak.webp` produced by
  your own `scripts/gen-hero-field.mjs`, plus that script itself.
- Kill any dev/production server you started and confirm port 3000 is free before
  finishing.
- Keep the existing safety code listed in spec §3 Phase B step 6 and §4 (context-loss
  guard, link-status checks, rAF gating, `gift:logo-ready` event). Removing any of it
  is a regression.
- Screenshot/visual verification must use native-resolution captures — grain disappears
  in downscaled thumbnails (spec §4.4).

When done, summarize: what changed per phase, QA results (build output, console state,
visual checklist pass/fail), the cleanup verification (what was downloaded and proof it
was deleted), and anything deferred (e.g., Phase E waiting on the video asset).
