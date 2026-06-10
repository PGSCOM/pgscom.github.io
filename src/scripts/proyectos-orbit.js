import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Órbita de categorías alrededor del logo en la sección de proyectos ───────
// Usa las .proyecto-card reales (enlaces a cada bloque), sin clones.
// El tween solo corre mientras la sección está en viewport.

function initOrbit() {
  const ring = document.querySelector('.proyectos-grid');
  if (!ring) return;
  const cards = gsap.utils.toArray('.proyecto-card', ring);
  if (!cards.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const proxy   = { a: 0 };
  let radius    = 0;

  const measure = () => {
    const rect = ring.getBoundingClientRect();
    const card = cards[0].getBoundingClientRect();
    radius = Math.min(rect.width, rect.height) / 2 - card.width / 2 - 8;
  };

  const place = () => {
    cards.forEach((card, i) => {
      const ang = -Math.PI / 2 + (i / cards.length) * Math.PI * 2 + proxy.a;
      gsap.set(card, { x: Math.cos(ang) * radius, y: Math.sin(ang) * radius });
    });
  };

  gsap.set(cards, { xPercent: -50, yPercent: -50 });
  measure();
  place();

  gsap.from(cards, {
    scale: 0, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)',
    stagger: 0.06,
    scrollTrigger: { trigger: '.proyectos-hero', start: 'top 75%' },
  });

  if (!reduced) {
    const spin = gsap.to(proxy, {
      a: Math.PI * 2, duration: 48, repeat: -1, ease: 'none',
      onUpdate: place, paused: true,
    });
    ScrollTrigger.create({
      trigger: '.proyectos-hero',
      start: 'top bottom', end: 'bottom top',
      onToggle: self => (self.isActive ? spin.play() : spin.pause()),
    });
  }

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; measure(); place(); });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOrbit);
} else {
  initOrbit();
}
