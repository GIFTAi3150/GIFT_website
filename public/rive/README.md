# DX hero Rive asset — integration contract

Drop the branded hero animation here as **`dx-hero.riv`**. `RiveHero.tsx`
(`src/app/services/dx-consulting/_components/`) loads it on the DX consulting
hero. Until it exists, the hero shows the static-logo fallback.

## What the runtime expects
- **File name / path:** `public/rive/dx-hero.riv` → served at `/rive/dx-hero.riv`.
- **State machine:** the component plays a state machine named **`State Machine 1`**
  (Rive editor default). If you name it something else, just tell us and we
  update the `stateMachine` prop — or keep the default.
- **Interactivity:** authored INSIDE the .riv as **Listeners** (e.g. a Pointer
  Move listener driving a "look-at-cursor" target, or hover/press states). The
  React runtime attaches pointer handlers automatically — no extra code needed.
- **Layout:** rendered with `Fit: Contain`, `Alignment: Center`, so it scales
  to the hero at any size. Design the artboard with a **transparent background**.
- **Brand fit:** light hero background is `#f5f7ff`; brand indigo is `#635bff`.
  Make sure the art reads on a light bg (the old VAT hero failed because a light
  accent color blended into the background).

## Design notes
- Keep it light (vector + a few timelines). Target a small file (the public
  sample is ~59 KB).
- A continuous idle loop + a cursor-reactive layer reads as "alive" without
  needing a full spin (a flat mark spinning edge-on is what broke before).

When the file is in place, we delete the temporary `src` / `stateMachine` demo
props in `DxV3Page.tsx` and it goes live.
