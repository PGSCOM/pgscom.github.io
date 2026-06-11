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

  // Animaciones siempre activas: ignoramos deliberadamente prefers-reduced-motion
  const reduced = false;
  const NS = 'http://www.w3.org/2000/svg';
  const glow = document.createElementNS(NS, 'path');
  const trazo = document.createElementNS(NS, 'path');
  glow.setAttribute('class', 'ruta-linea-glow');
  trazo.setAttribute('class', 'ruta-linea-trazo');

  // ── Máscara: la línea se oculta al pasar por detrás de cada tarjeta ──
  // Siempre activa (con o sin filtro): la línea parece "colarse" entre las
  // tarjetas. Los bordes se difuminan para que el corte sea suave. El
  // desenfoque se aplica una sola vez a todo el grupo de recortes (más barato
  // en móvil) y la máscara solo se recalcula cuando cambia el layout.
  const defs = document.createElementNS(NS, 'defs');
  const blur = document.createElementNS(NS, 'filter');
  blur.setAttribute('id', 'ruta-mascara-blur');
  blur.setAttribute('x', '-20%');
  blur.setAttribute('y', '-20%');
  blur.setAttribute('width', '140%');
  blur.setAttribute('height', '140%');
  const feBlur = document.createElementNS(NS, 'feGaussianBlur');
  feBlur.setAttribute('stdDeviation', '16');
  blur.append(feBlur);
  const mask = document.createElementNS(NS, 'mask');
  mask.setAttribute('id', 'ruta-mascara');
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  const maskBg = document.createElementNS(NS, 'rect'); // blanco = visible
  maskBg.setAttribute('x', '0');
  maskBg.setAttribute('y', '0');
  maskBg.setAttribute('fill', '#fff');
  const recortes = document.createElementNS(NS, 'g'); // negro = oculto
  recortes.setAttribute('filter', 'url(#ruta-mascara-blur)');
  mask.append(maskBg, recortes);
  defs.append(blur, mask);
  svg.append(defs, glow, trazo);
  glow.setAttribute('mask', 'url(#ruta-mascara)');
  trazo.setAttribute('mask', 'url(#ruta-mascara)');

  function construirMascara() {
    recortes.replaceChildren();
    const base = cuerpo.getBoundingClientRect();
    cuerpo.querySelectorAll('.ruta-item').forEach((el) => {
      const b = el.getBoundingClientRect();
      const pad = 22;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', (b.left - base.left - pad).toFixed(1));
      r.setAttribute('y', (b.top - base.top - pad).toFixed(1));
      r.setAttribute('width', (b.width + pad * 2).toFixed(1));
      r.setAttribute('height', (b.height + pad * 2).toFixed(1));
      r.setAttribute('rx', '36');
      r.setAttribute('fill', '#000');
      recortes.append(r);
    });
  }

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

    mask.setAttribute('x', '0');
    mask.setAttribute('y', '0');
    mask.setAttribute('width', w);
    mask.setAttribute('height', h);
    maskBg.setAttribute('width', w);
    maskBg.setAttribute('height', h);
    construirMascara();

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

  cuerpo.querySelectorAll('.ruta-sub-img').forEach((img) => {
    const fallar = () => img.closest('.ruta-sub')?.classList.add('sin-imagen');
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
