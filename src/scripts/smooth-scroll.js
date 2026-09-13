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
// Lenis recomienda lagSmoothing(0), pero desactivarlo del todo hace que un
// frame perdido se aplique íntegro y la animación salte: con un parón de
// 600 ms, la intro del preloader se saltaba de 1x a 4x sin verse. Estos son
// los valores por defecto de GSAP: solo recorta parones >500 ms, muy por
// encima de los 16-33 ms de un scroll normal, así que Lenis no se entera.
gsap.ticker.lagSmoothing(500, 33);

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
