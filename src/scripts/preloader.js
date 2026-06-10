import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(DrawSVGPlugin);

// ── Preloader: la P de carga.svg se construye trazándose con DrawSVG ─────────
// El overlay viene renderizado desde el servidor (index.astro) para que cubra
// la pantalla desde el primer paint. El trazo avanza con la carga real y, al
// completar, el relleno con el degradado aparece y la P hace zoom de salida.

function dispatchDone() {
  document.documentElement.style.overflow = '';
  // Flag para listeners que se registran tarde (p. ej. tras un await)
  window.__loadingDone = true;
  window.dispatchEvent(new CustomEvent('loading-done'));
}

function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) { dispatchDone(); return; }

  const svg     = pre.querySelector('.pl-svg');
  const draw    = pre.querySelector('.pl-draw');
  const fill    = pre.querySelector('.pl-fill');
  const outline = pre.querySelector('.pl-outline');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = 'hidden';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set(fill, { opacity: 1 });
    gsap.set(draw, { drawSVG: '100%', visibility: 'visible' });
    dispatchDone();
    gsap.to(pre, { autoAlpha: 0, duration: 0.4, delay: 0.3, onComplete: () => pre.remove() });
    return;
  }

  gsap.set(draw, { drawSVG: '0%', visibility: 'visible' });
  gsap.set(fill, { opacity: 0 });

  const state = { p: 0 };
  const render = () => {
    gsap.set(draw, { drawSVG: `0% ${state.p}%` });
  };

  // El trazo avanza hasta 90 mientras carga de verdad; el 100 llega con el load real
  const crawl = gsap.to(state, { p: 90, duration: 2.6, ease: 'power1.inOut', onUpdate: render });

  const ready = Promise.all([
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(r => window.addEventListener('load', r, { once: true })),
    document.fonts?.ready ?? Promise.resolve(),
    new Promise(r => setTimeout(r, 1700)), // duración mínima para que la intro respire
  ]);

  ready.then(() => {
    crawl.kill();
    gsap.timeline()
      // El trazo se cierra del todo…
      .to(state, { p: 100, duration: 0.5, ease: 'power2.out', onUpdate: render })
      // …y la P se rellena con el degradado mientras los trazos se apagan
      .to(fill, { opacity: 1, duration: 0.45, ease: 'power2.inOut' }, '-=0.1')
      .to([draw, outline], { opacity: 0, duration: 0.35, ease: 'power1.out' }, '<0.15')
      // El hero arranca su entrada debajo mientras la P hace zoom
      .add(dispatchDone, '+=0.1')
      // Zoom a través de la P: transform compositado sobre el propio <svg>
      .to(svg, { scale: 30, duration: 1.1, ease: 'power3.in' })
      .to(pre, { autoAlpha: 0, duration: 0.4, ease: 'power1.out' }, '-=0.4')
      .call(() => pre.remove());
  });
}

// Bfcache: si el navegador restaura la página, el preloader ya no pinta nada
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.getElementById('preloader')?.remove();
  document.documentElement.style.overflow = '';
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader);
} else {
  initPreloader();
}
