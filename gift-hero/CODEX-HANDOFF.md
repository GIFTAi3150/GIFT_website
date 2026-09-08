# GIFT hero — Codex handoff

Snapshot: 8 September 2026. Source commit: `5792b1658e0c1d986f2ac8398977bd7376dd3ca3`.

## Start here

This ZIP contains the current working hero, its assets, the original Kling video, and media conversion scripts. Extract it and use the contents of `gift-hero/` as your repository root. The original Git history, installed dependencies, and build output are excluded.

Use Node.js 24, then run:

```sh
npm ci
npm run dev
```

For a production build, run `npm run build`; the output is `dist/`. To preview that build locally, run `npm run preview`. No environment variables are required.

The stack is React, TypeScript, Vite, Tailwind CSS, GSAP, and Lenis. See `README.md` for the implementation details.

## Current status and next session

Only the hero is implemented. The design is a work in progress, not a final approved design. The user's latest feedback is that the writing and typography need substantial improvement, the background feels too plain, and the character animation is acceptable. Design work is paused for now.

Next, improve the Japanese copy presentation, hierarchy, spacing, and background treatment. Follow the actual GIFT brand reference at https://www.gift-inc.org/company. The earlier saturated royal-blue direction was rejected. The current palette uses midnight navy `#0b1020`, a pale-blue header `#f0f7ff`, white text, and restrained blue accents `#2563eb` / `#60a5fa`.

Keep the original retro computer-head character. Preserve the supplied business terms: no initial fee; ¥30,000 per month before tax; a custom design without templates, up to 10 pages; server, domain, and SSL management; and minor updates after launch. All inquiries go to https://www.gift-inc.org/contact.

## Preserve the performance fix

The initial video-based implementation made the user's entire PC sluggish. The current implementation starts with a transparent still image on every page load. Animation loads only when the visitor enables it. After this change, the user confirmed that the page was smooth and no longer crashed their PC.

Motion uses 96 transparent WebP poses in a roughly 2.3 MB bundle, drawn on a 2D canvas. It keeps at most 12 decoded poses, with at most two decodes in progress. It releases evicted images and stops work when idle, hidden, offscreen, or disabled. Pointer angle selects a prerecorded head pose; this is not a live 3D model. Keep these limits and the opt-in behavior when improving the visuals.

The drawing cap is 24 updates per second on desktop and 18 on touch devices, with slower or static fallbacks. These are limits, not measured frame-rate guarantees. The production build and motion-cache checks passed in the existing work; browser FPS on the user's PC was not independently measured.

## Files to edit

- `src/App.tsx`: Japanese content, navigation, offer, and entrance animations.
- `src/index.css`: palette, typography, background, layout, and responsive styles.
- `src/Character.tsx`: character interaction and pose selection.
- `src/motion-cache.ts`: bounded image decoding and cleanup.
- `src/useTypewriter.ts`: text reveal behavior.
- `public/media/`: ready-to-use transparent poster and motion assets.
- `assets/source/`: packed matte video and the original green-screen Kling upload.
- `scripts/`: media conversion and motion-cache verification.

The ready-to-use assets are included, so normal development does not require Python or FFmpeg. To regenerate the media, follow the README and use `assets/source/kling_20260908_VIDEO_Preserve_t_3672_0.mp4` as the original input. Changing the video requires recalibrating the pose timings.

Useful verification after relevant code changes:

```sh
npm run build
node scripts/verify-motion-cache.ts
```

## Hosting

The existing private preview is https://mainframe-aria-hero.gift-sora2.chatgpt.site. Access has not been opened to the manager or made public. The `.openai/hosting.json` file identifies that existing Site; it is included unchanged and is not required to run this project locally or host `dist/` elsewhere.

This export makes no changes to the live site and does not push to GitHub.
