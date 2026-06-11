import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
gsap.registerPlugin(ScrollTrigger);

// ── Scroll suave con inercia (Lenis) ──────────────────────────────────────────
// Lenis intercepta el scroll nativo y persigue la posición objetivo con lerp,
// dando el efecto de "glide". Se sincroniza con el ticker de GSAP para que
// ScrollTrigger se actualice en cada frame.

const lenis = new Lenis({ autoRaf: false });

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Enlaces de ancla: scroll animado con la misma inercia.
// Si otro handler ya gestionó el click (CTA del hero, órbita), no se duplica.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented) return;
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  const dest = document.querySelector(a.getAttribute('href'));
  if (!dest) return;
  e.preventDefault();
  lenis.scrollTo(dest);
});

export default lenis;
