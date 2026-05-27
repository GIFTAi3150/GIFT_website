// Factory that returns an R3F `gl` prop callback constructing a Three.js
// WebGLRenderer with our `webglcontextlost` listener attached BEFORE
// Three.js's own constructor-time listener.
//
// Why this exists:
//
// Three.js's WebGLRenderer constructor adds a bubble-phase listener that
// calls `event.preventDefault()` on context loss. preventDefault is the
// signal to Chrome to attempt context RESTORATION. After ~3 failed
// restorations Chrome considers the page "guilty" and shows
// "Web page caused context loss and was blocked" — blocking all WebGL
// in the tab.
//
// I previously tried adding a capture-phase listener inside `onCreated`,
// expecting it to fire before Three.js's bubble-phase listener and
// `stopImmediatePropagation` to suppress it. That assumption is WRONG
// when the event fires AT the canvas (the target). Per WHATWG DOM, at
// the target element, listeners run in registration order regardless of
// the capture flag — and Three.js attaches first (inside the constructor)
// because `onCreated` runs only after the constructor returns. So
// Three.js's preventDefault ALWAYS ran before our blocker.
//
// The fix is to register OUR listener BEFORE constructing the renderer.
// R3F's `gl` prop accepts a `(canvas) => Renderer` factory, which gives
// us a hook to addEventListener on the canvas before `new WebGLRenderer`
// runs. Now WE are first in registration order, our
// stopImmediatePropagation actually blocks Three.js's listener, no
// preventDefault is called, no restoration loop, no guilty tick.

import * as THREE from 'three';

export type SafeRendererOptions = THREE.WebGLRendererParameters & {
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
};

export function makeSafeRenderer(
  options: SafeRendererOptions,
  onContextLost: () => void,
): (canvas: HTMLCanvasElement | OffscreenCanvas) => THREE.WebGLRenderer {
  return (canvas) => {
    // `disposing` is flipped true by the wrapped dispose() below. When the
    // R3F Canvas unmounts (route change, Strict Mode double-invoke, HMR),
    // Three.js calls renderer.dispose() → forceContextLoss() → the browser
    // fires `webglcontextlost`. That event is SYNTHETIC teardown noise, not
    // a real driver loss, but our listener can't tell the difference
    // without this flag. Without filtering, Strict Mode's mount→unmount→
    // mount cycle in Next.js dev trips onContextLost on the first render
    // and shared-canvas consumers see "all 3D gone" on a clean page load.
    let disposing = false;

    // Attach OUR listener BEFORE constructing the renderer so we win
    // registration order at the target. stopImmediatePropagation blocks
    // Three.js's bubble-phase listener (which calls preventDefault) from
    // running — no restoration attempt, no guilty counter tick.
    // Only HTMLCanvasElement supports DOM events; OffscreenCanvas does not
    // (its context loss surfaces differently) so we skip the listener for it.
    if (canvas instanceof HTMLCanvasElement) {
      canvas.addEventListener('webglcontextlost', (e) => {
        e.stopImmediatePropagation();
        if (disposing) return;
        onContextLost();
      });
    }

    const { toneMapping, toneMappingExposure, ...rendererParams } = options;
    const renderer = new THREE.WebGLRenderer({ canvas, ...rendererParams });

    // Wrap dispose so we know when teardown is in progress. The order is:
    // someone calls renderer.dispose() → our wrapper flips `disposing` →
    // delegate to the original dispose() → THREE.forceContextLoss() fires
    // webglcontextlost → our listener short-circuits because disposing=true.
    const origDispose = renderer.dispose.bind(renderer);
    renderer.dispose = function () {
      disposing = true;
      origDispose();
    };

    // R3F applies these defaults after constructing the renderer in its
    // internal createRendererInstance path. Custom `gl` factories bypass
    // that, so we mirror the defaults here.
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (toneMapping !== undefined) renderer.toneMapping = toneMapping;
    if (toneMappingExposure !== undefined) renderer.toneMappingExposure = toneMappingExposure;

    return renderer;
  };
}
