import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Ruta cronológica de proyectos ─────────────────────────────────────────────
// Una línea luminosa baja por la cronología (lo más reciente arriba) pasando
// por cada marcador de año y cada tarjeta, y se traza con el scroll. Las
// subtarjetas aparecen "conectándose" a su tarjeta principal. Los filtros por
// disciplina atenúan y desaturan lo que no encaja, sin ocultarlo.

function initRuta() {
  const mapa = document.getElementById('proyectos-mapa');
  const cuerpo = mapa?.querySelector('.ruta-cuerpo');
  const svg = mapa?.querySelector('.ruta-linea');
  if (!mapa || !cuerpo || !svg) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const glow = document.createElementNS(NS, 'path');
  const trazo = document.createElementNS(NS, 'path');
  glow.setAttribute('class', 'ruta-linea-glow');
  trazo.setAttribute('class', 'ruta-linea-trazo');
  svg.append(glow, trazo);

  let drawTween = null;

  // Puntos de paso: el punto de cada año y el centro de cada tarjeta principal.
  // En pantallas estrechas la línea baja recta por el margen izquierdo.
  function puntos() {
    const base = cuerpo.getBoundingClientRect();
    const narrow = base.width < 760;
    const els = cuerpo.querySelectorAll('.ruta-año-dot, .ruta-item');
    return [...els].map((el) => {
      const b = el.getBoundingClientRect();
      return {
        x: narrow ? 16 : b.left - base.left + b.width / 2,
        y: b.top - base.top + b.height / 2,
      };
    });
  }

  function build() {
    const w = cuerpo.clientWidth;
    const h = cuerpo.scrollHeight;
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
        trigger: cuerpo,
        start: 'top 65%',
        end: 'bottom 85%',
        scrub: 0.5,
      },
    });
  }

  // ── Entradas al hacer scroll ──
  if (!reduced) {
    gsap.utils.toArray('.ruta-año', cuerpo).forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0,
        scale: 0.7,
        duration: 0.6,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    gsap.utils.toArray('.ruta-entry', cuerpo).forEach((entry) => {
      const der = entry.classList.contains('ruta-entry--der');
      const item = entry.querySelector('.ruta-item');
      const subs = entry.querySelectorAll('.ruta-sub');

      gsap.from(item, {
        autoAlpha: 0,
        y: 56,
        rotation: der ? 1.4 : -1.4,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: entry, start: 'top 86%' },
      });

      // Las subtarjetas brotan desde la tarjeta principal, en cascada
      if (subs.length) {
        gsap.from(subs, {
          autoAlpha: 0,
          x: der ? 36 : -36,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.16,
          scrollTrigger: { trigger: entry, start: 'top 70%' },
        });
      }
    });
  }

  // El marcador de año se "enciende" cuando la ruta pasa por él
  gsap.utils.toArray('.ruta-año', cuerpo).forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      onEnter: () => el.classList.add('on'),
      onLeaveBack: () => el.classList.remove('on'),
    });
  });

  // ── Imágenes que no existen: fondo tintado + icono de la categoría ──
  cuerpo.querySelectorAll('.ruta-img').forEach((img) => {
    const fallar = () => img.closest('.ruta-item')?.classList.add('sin-imagen');
    if (img.complete && img.naturalWidth === 0) fallar();
    else img.addEventListener('error', fallar, { once: true });
  });

  // ── Filtro por disciplina: atenúa y desatura, no oculta ──
  const filtros = mapa.querySelectorAll('.ruta-filtro');
  const entries = cuerpo.querySelectorAll('.ruta-entry');
  let filtroActual = 'all';

  function setFiltro(cat) {
    filtroActual = cat;
    entries.forEach((entry) => {
      const cats = (entry.dataset.cats || '').split(',');
      entry.classList.toggle('fuera', cat !== 'all' && !cats.includes(cat));
    });
    filtros.forEach((f) => {
      const act = f.dataset.cat === cat;
      f.classList.toggle('act', act);
      f.setAttribute('aria-pressed', act ? 'true' : 'false');
    });
    document.querySelectorAll('.proyecto-card').forEach((card) => {
      card.classList.toggle('is-active', card.dataset.aptitudId === cat);
    });
  }

  filtros.forEach((f) => {
    f.addEventListener('click', () => {
      const cat = f.dataset.cat;
      setFiltro(cat !== 'all' && filtroActual === cat ? 'all' : cat);
    });
  });

  // La órbita de categorías también filtra y baja hasta la cronología
  document.querySelectorAll('.proyecto-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const id = card.dataset.aptitudId;
      if (!id) return;
      e.preventDefault();
      setFiltro(filtroActual === id ? 'all' : id);
      mapa.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
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
  let lastW = cuerpo.clientWidth;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      if (cuerpo.clientWidth !== lastW) {
        lastW = cuerpo.clientWidth;
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
