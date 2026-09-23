import { createFlow } from './webgl.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const benefits = document.querySelector('#benefits');
const flows = [];
const surfaces = [
  { canvas: document.querySelector('#flow-canvas') },
  {
    canvas: document.querySelector('#benefits-flow-canvas'),
    theme: 'light',
    surface: benefits,
  },
];
for (const { canvas, ...options } of surfaces) {
  if (!canvas) continue;
  try {
    const flow = createFlow(canvas, { ...options, paused: reduceMotion.matches });
    if (flow) flows.push(flow);
  } catch {
    // Each section keeps its readable CSS background if WebGL is unavailable.
  }
}
reduceMotion.addEventListener('change', (event) => {
  flows.forEach((flow) => flow.setPaused(event.matches));
});
