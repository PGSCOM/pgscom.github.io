import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Hero: cards de proyectos flotando alrededor del logo ─────────────────────
// Tres capas por card para que las animaciones no se pisen el transform:
//   .hero-card        → posición, entrada, parallax de ratón y scroll (GSAP)
//   .hero-card-tilt   → rotación base + flotación orgánica (GSAP)
//   .hero-card-media  → hover scale (CSS)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHero() {
  const cards     = gsap.utils.toArray('.hero-card');
  const pEl       = document.getElementById('letter-p');
  const gscomWrap = document.getElementById('letters-gscom-wrap');
  const gscomText = document.getElementById('letters-gscom');
  if (!pEl || !gscomWrap) return;

  const fadeEls = ['.hero-kicker', '.hero-sub', '.hero-actions', '.hero-scroll-hint']
    .map(s => document.querySelector(s))
    .filter(Boolean);

  // ── Estados iniciales (el preloader cubre la pantalla mientras tanto) ────
  gsap.set(cards, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.55 });
  cards.forEach(card => {
    const tilt = card.querySelector('.hero-card-tilt');
    gsap.set(tilt, { rotation: parseFloat(card.dataset.rot) || 0 });
  });
  gsap.set(gscomWrap, { width: 0, opacity: 0 });
  gsap.set(pEl, { scale: 0.4, autoAlpha: 0 });
  gsap.set(fadeEls, { autoAlpha: 0, y: 26 });

  let entered = false;

  function startIdleFloat() {
    if (reduced) return;
    cards.forEach(card => {
      const tilt = card.querySelector('.hero-card-tilt');
      const d    = parseFloat(card.dataset.depth) || 1;
      gsap.to(tilt, {
        y: gsap.utils.random(10, 20) * (Math.random() < 0.5 ? -1 : 1) * d,
        rotation: `+=${gsap.utils.random(-3, 3)}`,
        duration: gsap.utils.random(3, 5),
        yoyo: true, repeat: -1, ease: 'sine.inOut',
        delay: gsap.utils.random(0, 1.5),
      });
    });
  }

  function entrance() {
    if (entered) return;
    entered = true;

    // Medir GSCOM con la fuente ya cargada (el preloader espera fonts.ready)
    gsap.set(gscomWrap, { width: 'auto' });
    const gscomWidth = gscomWrap.offsetWidth + 2;
    gsap.set(gscomWrap, { width: 0 });

    if (reduced) {
      gsap.set([pEl, ...fadeEls], { autoAlpha: 1, scale: 1, y: 0, clearProps: 'transform' });
      gsap.set(gscomWrap, { width: 'auto', opacity: 1, overflow: 'visible' });
      gsap.set(cards, { autoAlpha: 1, scale: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(pEl, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.8)' })
      .to(gscomWrap, {
        width: gscomWidth, opacity: 1, duration: 0.9, ease: 'power3.inOut',
        onComplete() {
          gsap.set(gscomWrap, { width: 'auto', overflow: 'visible' });
          const grad = 'pgscom-intro-scroll 2s linear forwards, pgscom-loop-scroll 4s linear 2s infinite';
          pEl.style.animation = grad;
          if (gscomText) gscomText.style.animation = grad;
        },
      }, '-=0.35')
      .to(cards, {
        autoAlpha: 1, scale: 1, duration: 1,
        ease: 'back.out(1.4)',
        stagger: { each: 0.08, from: 'random' },
      }, 0.2);

    fadeEls.forEach((el, i) => {
      tl.to(el, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.55 + i * 0.12);
    });

    tl.call(startIdleFloat);
  }

  // ── Parallax de ratón (solo puntero fino, fuera del hero se pausa) ───────
  if (!reduced && window.matchMedia('(pointer: fine)').matches && cards.length) {
    let heroVisible = true;
    const setters = cards.map(card => ({
      x: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3' }),
      y: gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power3' }),
      d: parseFloat(card.dataset.depth) || 1,
    }));

    window.addEventListener('pointermove', (e) => {
      if (!heroVisible || !entered) return;
      const nx = e.clientX / window.innerWidth  - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      for (const s of setters) { s.x(nx * 46 * s.d); s.y(ny * 28 * s.d); }
    }, { passive: true });

    ScrollTrigger.create({
      trigger: '.main-container',
      start: 'top top', end: 'bottom top',
      onToggle: self => { heroVisible = self.isActive; },
    });
  }

  // ── Salida con scroll: cada profundidad sube a distinta velocidad ────────
  if (!reduced) {
    const exit = gsap.timeline({
      scrollTrigger: {
        trigger: '.main-container',
        start: 'top top', end: 'bottom top',
        scrub: 0.8,
      },
    });
    cards.forEach(card => {
      const d = parseFloat(card.dataset.depth) || 1;
      exit.to(card, { yPercent: -(50 + 55 * d), ease: 'none' }, 0);
    });
    exit.to('.content', { yPercent: -22, autoAlpha: 0.15, ease: 'none' }, 0);
    exit.to('.hero-scroll-hint', { autoAlpha: 0, ease: 'none', duration: 0.25 }, 0);
  }

  // El preloader dispara la entrada; fallback por si ya no existe
  if (!document.getElementById('preloader')) {
    entrance();
  } else {
    window.addEventListener('loading-done', entrance, { once: true });
    setTimeout(entrance, 9000); // red de seguridad si el preloader falla
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHero);
} else {
  initHero();
}
