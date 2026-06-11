import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Ruta de proyectos ─────────────────────────────────────────────────────────
// Una línea luminosa serpentea por la sección pasando por cada estación de
// categoría y cada tarjeta de proyecto, y se va trazando a medida que se hace
// scroll. Las tarjetas (HTML estático) entran animadas al llegar a ellas.

function initRuta() {
  const cont = document.getElementById('proyectos-mapa');
  const svg = cont?.querySelector('.ruta-linea');
  if (!cont || !svg) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const glow = document.createElementNS(NS, 'path');
  const trazo = document.createElementNS(NS, 'path');
  glow.setAttribute('class', 'ruta-linea-glow');
  trazo.setAttribute('class', 'ruta-linea-trazo');
  svg.append(glow, trazo);

  let drawTween = null;

  // Puntos de paso: el dot de cada estación y el centro de cada tarjeta.
  // En pantallas estrechas la línea baja recta por el margen izquierdo.
  function puntos() {
    const base = cont.getBoundingClientRect();
    const narrow = base.width < 760;
    const els = cont.querySelectorAll('.ruta-estacion-dot, .ruta-item');
    return [...els].map((el) => {
      const b = el.getBoundingClientRect();
      return {
        x: narrow ? 18 : b.left - base.left + b.width / 2,
        y: b.top - base.top + b.height / 2,
      };
    });
  }

  function build() {
    const w = cont.clientWidth;
    const h = cont.scrollHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const ps = puntos();
    if (ps.length < 2) return;

    // Curvas con tangente vertical en cada punto → la línea "cae" en S
    let d = `M ${ps[0].x.toFixed(1)} ${ps[0].y.toFixed(1)}`;
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1];
      const b = ps[i];
      const k = (b.y - a.y) * 0.5;
      d += ` C ${a.x.toFixed(1)} ${(a.y + k).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - k).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    glow.setAttribute('d', d);
    trazo.setAttribute('d', d);

    const L = trazo.getTotalLength();
    drawTween?.scrollTrigger?.kill();
    drawTween?.kill();

    if (reduced) {
      gsap.set([glow, trazo], { strokeDasharray: 'none', strokeDashoffset: 0 });
      return;
    }
    gsap.set([glow, trazo], { strokeDasharray: L, strokeDashoffset: L });
    drawTween = gsap.to([glow, trazo], {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: cont,
        start: 'top 65%',
        end: 'bottom 85%',
        scrub: 0.5,
      },
    });
  }

  // ── Entradas al hacer scroll ──
  if (!reduced) {
    gsap.utils.toArray('.ruta-estacion', cont).forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 30,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    gsap.utils.toArray('.ruta-item', cont).forEach((el, i) => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 56,
        rotation: i % 2 === 0 ? -1.4 : 1.4,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
  }

  // La estación se "enciende" cuando la ruta pasa por ella
  gsap.utils.toArray('.ruta-estacion', cont).forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      onEnter: () => el.classList.add('on'),
      onLeaveBack: () => el.classList.remove('on'),
    });
  });

  // ── Imágenes que no existen: fondo tintado + icono de la categoría ──
  cont.querySelectorAll('.ruta-img').forEach((img) => {
    const fallar = () => img.closest('.ruta-item')?.classList.add('sin-imagen');
    if (img.complete && img.naturalWidth === 0) fallar();
    else img.addEventListener('error', fallar, { once: true });
  });

  // ── La órbita de categorías navega a su estación con scroll suave ──
  document.querySelectorAll('.proyecto-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const id = card.dataset.aptitudId;
      const target = id && document.getElementById(`ruta-${id}`);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  build();
  // Las imágenes tienen aspect-ratio fijo, pero las fuentes pueden mover el
  // layout: se recalcula la línea al cargar todo y al redimensionar.
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    build();
  });

  let resizeRaf = 0;
  let lastW = cont.clientWidth;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      if (cont.clientWidth !== lastW) {
        lastW = cont.clientWidth;
        build();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRuta);
} else {
  initRuta();
}
