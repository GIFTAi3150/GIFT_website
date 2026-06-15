# Homepage & AIOps Page — Quality Changes, June 5 2026

---

## Homepage Hero

The homepage hero runs a **GPU fluid simulation** — a real-time Stam stable-fluids solver rendered entirely on the GPU via WebGL, wrapped in a React Three Fiber Canvas. The fluid warps an underlying image plane using FBO ping-pong: every frame the simulation writes velocity and dye fields into two alternating framebuffers, then reads from the previous one. The result is the living, swirling color wash you see behind the headline.

The color palette is deep navy (`#0C0E1A`) bleeding into electric blue (`#2563EB`) with violet and ink tones throughout. On hardware that can't handle WebGL — older phones, locked-down GPUs — it falls back silently to a static CSS gradient version of the same palette. No white screen, no error, just a beautiful still.

**The reveal animation** is a ball-expand: on first load the canvas is clipped to a small circle, then expands to fill the viewport. This is gated on the canvas signaling its first painted frame, so the expand never fires on a blank canvas — it waits for real color before opening.

The quality improvement here is about resilience and precision. A 4000ms hard timeout acts as a final safety net in case the canvas never signals, so the ball can never get stuck in its collapsed state. The fluid sim itself runs at adaptive DPR (`[1, 2]`) with `high-performance` power preference — it scales up on Retina and scales back on weak hardware automatically.

---

## Homepage Services Section

The services grid previously showed all three business lines side by side. It now shows only the AIOps card, centered on the page.

**Before:** three cards in a `sm:grid-cols-3` grid — Call Center, DX Consulting, Financial Consulting. The section header was left-aligned.

**After:** one card, `max-w-sm`, centered with `flex justify-center`. The section header is `items-center text-center` to match.

This is a clarity improvement. A visitor no longer has to decide which of three things to look at. The services section now points directly to what GIFT is actively selling and growing. The card itself has 3D tilt on both mouse and touch — previously touch devices saw a flat static card. Now dragging a finger across the card tilts it in perspective and springs back on lift, using a `cubic-bezier(0.23, 1, 0.32, 1)` easing for the return — the same elastic feel as desktop.

The glare overlay that tracked the mouse position was also removed. It made the text labels harder to read and added visual noise without adding to the premium feel that the tilt alone already delivers.

---

## AIOps Service Page — Hero

The AIOps page hero is built around a **3D atom icon rendered in React Three Fiber** (WebGL). The GLB model is loaded with Draco compression and placed in a Three.js scene with five orbiting spheres — blue, pink, two oranges, and an accent — each following its own parametric elliptical path at different speeds (`0.50`, `0.38`, `0.44` rad/s for the three rings). The spheres have a live collision system: when two spheres get close enough, a spring-damper displaces them off their orbital paths and pulls them back over time. It's not fake — it's physics computed every frame in JS.

The page color system is a deep blue-ink palette: near-black `#0b1340` for body, lavender-white `#f5f7ff` for surfaces, electric violet `#635bff` for accents, and deep purple `#7c3aed` for the italic hero type. The font stack is **General Sans** (geometric, chunky, loaded from Fontshare) for headlines, **Instrument Serif** in italic for the editorial second word, and **JetBrains Mono** for tech labels throughout the page.

**What changed today:** the hero headline previously read **DX** *Consulting.* — "DX" in General Sans 800-weight dark ink, "Consulting." in Instrument Serif italic purple. It now reads **AI***Ops.* using the exact same two-token split. The visual rhythm is identical — bold dark word, italic purple serif word — but the brand name is now correct. Every other label on the site that referenced DX Consulting was also updated: nav, footer, metadata, contact form, case study tags, achievements, and the recruit career path.

If WebGL fails or the GPU is unavailable, the atom viewer degrades to a flat SVG logo fallback via an error boundary — no JavaScript crash, no blank hero.
