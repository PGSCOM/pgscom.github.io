import gsap from 'gsap';

// ── Preloader: la P de carga.svg como máscara con collage de proyectos ────────
// El overlay viene renderizado desde el servidor (index.astro) para que cubra
// la pantalla desde el primer paint. Este script solo lo anima y lo retira.

const TRACK_STEP = 364; // alto de cada imagen dentro del clip (unidades del viewBox)

function dispatchDone() {
  document.documentElement.style.overflow = '';
  window.dispatchEvent(new CustomEvent('loading-done'));
}

function initPreloader() {
  const pre   = document.getElementById('preloader');
  if (!pre) { dispatchDone(); return; }

  const svg   = pre.querySelector('.pl-svg');
  const track = pre.querySelector('.pl-track');
  const count = pre.querySelector('.pl-count');
  const meta  = pre.querySelector('.pl-meta');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = 'hidden';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    count.textContent = '100';
    dispatchDone();
    gsap.to(pre, { autoAlpha: 0, duration: 0.4, delay: 0.3, onComplete: () => pre.remove() });
    return;
  }

  const images   = track.querySelectorAll('image');
  const distance = TRACK_STEP * (images.length - 1);
  const state    = { p: 0 };

  const render = () => {
    count.textContent = String(Math.round(state.p));
    gsap.set(track, { y: -(state.p / 100) * distance });
  };

  // Avanza hasta 90 mientras carga de verdad; el 100 llega con el load real
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
      .to(state, { p: 100, duration: 0.5, ease: 'power2.out', onUpdate: render })
      .to(meta,  { autoAlpha: 0, y: -24, duration: 0.4, ease: 'power2.in' }, '<')
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
