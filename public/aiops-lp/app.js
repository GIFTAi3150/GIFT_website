import { createFlow } from './webgl.js';
import { LINE_URL } from './site-config.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('.hero');
const waveSurface = document.querySelector('.site-art');
let scrollQueued = false;
let lastWaveOpacity = '';
function syncScroll() {
  // Keep the hero vivid, then let the copy take over as the next section enters.
  const viewportHeight = Math.max(1, window.innerHeight);
  const progress = Math.max(0, Math.min(1, (viewportHeight - hero.getBoundingClientRect().bottom) / (viewportHeight * 0.7)));
  const eased = progress * progress * (3 - 2 * progress);
  const opacity = (1 - eased * 0.55).toFixed(3);
  if (opacity !== lastWaveOpacity) {
    waveSurface.style.setProperty('--waves-opacity', opacity);
    lastWaveOpacity = opacity;
  }
  scrollQueued = false;
}
function queueScroll() {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(syncScroll); }
}
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
syncScroll();

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

const lineButton = document.querySelector('#line-cta');
const lineDialog = document.querySelector('#line-dialog');
function validLineUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && ['lin.ee', 'line.me'].includes(url.hostname); }
  catch { return false; }
}
lineButton.addEventListener('click', () => {
  if (validLineUrl(LINE_URL)) { window.location.assign(LINE_URL); return; }
  lineDialog.showModal();
});
lineDialog.querySelector('.dialog-close').addEventListener('click', () => lineDialog.close());
lineDialog.addEventListener('click', event => {
  const rect = lineDialog.getBoundingClientRect();
  if (event.target === lineDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lineDialog.close();
});
lineDialog.addEventListener('close', () => lineButton.focus());

// Follow the visitor's motion preference without a floating playback control.
let flow;
try {
  flow = createFlow(document.querySelector('#flow-canvas'), { paused: reduceMotion.matches });
} catch {
  // The CSS background stays visible if WebGL cannot initialize.
}
reduceMotion.addEventListener('change', event => {
  if (event.matches) document.body.classList.remove('motion-ready');
  flow?.setPaused(event.matches);
});
