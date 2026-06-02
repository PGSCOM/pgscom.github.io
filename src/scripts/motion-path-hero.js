import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

// ── Estado compartido entre fases de animación ────────────────────────────────
let scrollTl   = null;
let wrappers   = [];
let dots       = [];
let orbitTween = null;
let orbitState = { rot: 0 };
let rPx        = 0;
let count      = 0;

// ── Utilidades ────────────────────────────────────────────────────────────────

// Clona el ícono de una proyecto-card para usarlo dentro del orb
function cloneOrbIcon(card) {
  const inner = document.createElement('div');
  inner.className = 'proyecto-card-inner';
  const img = card.querySelector('.proyecto-icon img');
  if (img) {
    const wrap = document.createElement('div');
    wrap.className = 'proyecto-icon';
    const clone = img.cloneNode(true);
    clone.removeAttribute('srcset');
    wrap.appendChild(clone);
    inner.appendChild(wrap);
  }
  return inner;
}

// Posición de pantalla donde cada orb aterriza en la fase de navegación
function getCornerPos(i, W, H, isMobile) {
  const peaks = isMobile
    ? [{ x: 0.15, y: 0.15 }, { x: 0.85, y: 0.25 }, { x: 0.20, y: 0.45 },
       { x: 0.80, y: 0.55 }, { x: 0.25, y: 0.70 }, { x: 0.75, y: 0.85 }]
    : [{ x: 0.60, y: 0.20 }, { x: 0.85, y: 0.30 }, { x: 0.65, y: 0.45 },
       { x: 0.90, y: 0.55 }, { x: 0.55, y: 0.70 }, { x: 0.80, y: 0.80 }];
  const p = peaks[i] ?? { x: 0.5, y: 0.5 };
  return { x: p.x * W, y: p.y * H };
}

// Trayectoria cúbica en S para la re-entrada de los orbs al hacer scroll
function makeSwoopPath(W, destX, destY, i) {
  const sweep = i % 2 === 0 ? 1 : -1;
  const sx = W / 2 + sweep * (W * 0.4 + i * 30);
  const sy = -200 - i * 60;
  const dx = destX - sx;
  const dy = destY - sy;
  const c  = 0.6 * sweep;
  // Control points cruzados (perpendiculares al vector director) para la curva S
  const cp1x = sx + dx * 0.1 + dy * c,  cp1y = sy + dy * 0.1 - dx * c;
  const cp2x = sx + dx * 0.9 + dy * c,  cp2y = sy + dy * 0.9 - dx * c;
  return `M ${sx},${sy} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${destX},${destY}`;
}

// ── Construcción de la escena ─────────────────────────────────────────────────

function initHeroMotion() {
  const layer = document.querySelector('.hero-motion-layer');
  const svg   = document.querySelector('.motion-path-svg');
  if (!layer || !svg) return;

  const W        = document.documentElement.clientWidth;
  const H        = window.innerHeight;
  const isMobile = W < 768;
  const cx       = W / 2;
  const cy       = H / 2;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cards = [...document.querySelectorAll('.proyecto-card')];
  count = cards.length;
  if (!count) return;

  // Radio del anillo de carga y radio de la órbita en la sección de proyectos
  const loadingR = isMobile ? 80 : 140;
  rPx = Math.min(isMobile ? 130 : 220, W * (isMobile ? 0.35 : 0.22));

  // ── Logo: medir y centrar antes de la animación ───────────────────────────
  const pEl       = document.getElementById('letter-p');
  const gscomWrap = document.getElementById('letters-gscom-wrap');
  const gscomText = document.getElementById('letters-gscom');
  const logoWrap  = document.getElementById('logo-wrapper');

  // Medir el ancho natural de "GSCOM" antes de ocultarlo
  gsap.set(gscomWrap, { width: 'auto' });
  const gscomWidth = gscomWrap.offsetWidth + 2;
  gsap.set(gscomWrap, { width: 0, opacity: 0 });

  // Desplazar el logo-wrapper para que la "P" quede centrada en pantalla.
  // Los offsets ópticos compensan que el bounding-box del texto no coincide
  // exactamente con el centro visual del glifo (métricas del tipo).
  const OPTICAL_X =  0.14;   // ajuste horizontal por el kerning/espacio lateral
  const OPTICAL_Y = -0.12;   // la "P" visual está más arriba que el centro del bbox
  const pRect = pEl.getBoundingClientRect();
  const logoOffsetX = cx - (pRect.left + pRect.width  / 2) + pRect.width  * OPTICAL_X;
  const logoOffsetY = cy - (pRect.top  + pRect.height / 2) + pRect.height * OPTICAL_Y;

  gsap.set(logoWrap, { x: logoOffsetX, y: logoOffsetY });
  gsap.set(pEl, { scale: 0, opacity: 0 });

  // ── Crear los orbs (punto de carga gris + ícono real) ─────────────────────
  const grayDots   = [];
  const iconClones = [];
  const floatFns   = [];  // se ejecutan al terminar la intro, no antes

  cards.forEach((card, i) => {
    const ang  = -Math.PI / 2 + (i / count) * Math.PI * 2;
    const orbX = cx + Math.cos(ang) * rPx;   // posición destino en la órbita de proyectos
    const orbY = cy + Math.sin(ang) * rPx;

    // Capa de posicionamiento — la mueven los scroll timelines
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-dot-wrapper';
    Object.assign(wrapper.style, {
      position: 'absolute', width: '100px', height: '100px',
      left: '-50px', top: '-50px', zIndex: '4', pointerEvents: 'none',
    });

    // Capa de flotación orgánica — independiente del scroll
    const floatEl = document.createElement('div');
    floatEl.className = 'hero-float-wrapper';
    Object.assign(floatEl.style, { position: 'absolute', width: '100%', height: '100%' });

    const gray = document.createElement('div');
    gray.className = 'gray-loading-dot';

    const icon = cloneOrbIcon(card);
    icon.classList.add('orb-content-clone');

    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.appendChild(gray);
    dot.appendChild(icon);

    floatEl.appendChild(dot);
    wrapper.appendChild(floatEl);
    layer.appendChild(wrapper);

    wrappers.push(wrapper);
    dots.push(dot);
    grayDots.push(gray);
    iconClones.push(icon);

    gsap.set(wrapper, { x: cx, y: cy, scale: 0, opacity: 0 });

    // Trayectoria SVG para la re-entrada de los orbs al hacer scroll
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = `scroll-path-${i}`;
    path.setAttribute('d', makeSwoopPath(W, orbX, orbY, i));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'transparent');
    svg.appendChild(path);

    // Guardamos la función de flotación para dispararla al terminar la intro
    const dirY = Math.random() > 0.5 ? 18 : -18;
    const dirX = Math.random() > 0.5 ? 12 : -12;
    floatFns.push(() => gsap.to(floatEl, {
      y: `+=${dirY}`, x: `+=${dirX}`, rotation: Math.random() * 8 - 4,
      duration: 2.5 + Math.random() * 2,
      yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() * 2,
    }));
  });

  // ── TIMELINE MAESTRO ──────────────────────────────────────────────────────
  // Fase 1 — la "P" nace en el centro de la pantalla
  // Fase 2 — los puntos de carga aparecen en anillo y orbitan
  // Fase 3 — explosión: el logo ocupa su lugar, los orbs vuelan a esquinas

  const masterTl   = gsap.timeline();
  const orbitProxy = { angle: 0 };

  masterTl
    // La P aparece y se hincha
    .to(pEl, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' })
    .to(pEl, { scale: 1.4, duration: 0.6, ease: 'power2.inOut' }, '+=0.2')

    // Los puntos de carga aparecen en el anillo y dan media vuelta
    .to(wrappers, {
      scale: 1, opacity: 1, rotation: '+=180',
      duration: 0.4, stagger: 0.05, ease: 'back.out(2)',
      onStart() {
        wrappers.forEach((w, i) => {
          const a = -Math.PI / 2 + (i / count) * Math.PI * 2;
          gsap.set(w, { x: cx + Math.cos(a) * loadingR, y: cy + Math.sin(a) * loadingR });
        });
      },
    }, '<0.1')

    // El anillo orbita media vuelta para dar la sensación de carga
    .to(orbitProxy, {
      angle: Math.PI, duration: 1.2, ease: 'power1.inOut',
      onUpdate() {
        wrappers.forEach((w, i) => {
          const a = -Math.PI / 2 + (i / count) * Math.PI * 2 + orbitProxy.angle;
          gsap.set(w, { x: cx + Math.cos(a) * loadingR, y: cy + Math.sin(a) * loadingR });
        });
      },
    }, '<')

    // La P vuelve a su tamaño normal antes de la explosión
    .to(pEl, { scale: 1, duration: 0.6, ease: 'power2.inOut' }, '+=0.2')

    // ── EXPLOSIÓN — todo ocurre en paralelo desde aquí ──
    .add('explode')

    // El logo-wrapper retorna a su posición natural en el layout
    .to(logoWrap, {
      x: 0, y: 0, duration: 1.2, ease: 'power3.inOut',
      onComplete() {
        document.documentElement.style.overflow = '';
        gsap.set(logoWrap, { clearProps: 'all' });
        gsap.set(gscomWrap, { width: 'auto', overflow: 'visible' });

        const gradAnim = 'pgscom-intro-scroll 2s linear forwards, pgscom-loop-scroll 4s linear 2s infinite';
        pEl.style.animation       = gradAnim;
        gscomText.style.animation = gradAnim;

        // Solo ahora que los orbs están en esquinas arrancamos la flotación
        floatFns.forEach(fn => fn());

        window.dispatchEvent(new CustomEvent('loading-done'));
      },
    }, 'explode')

    // GSCOM se despliega horizontalmente
    .to(gscomWrap, { width: gscomWidth, opacity: 1, duration: 1.2, ease: 'power3.inOut' }, 'explode')

    // Los puntos grises mutan a iconos reales
    .to(grayDots,   { opacity: 0, scale: 0, duration: 0.4, ease: 'power2.in'     }, 'explode')
    .to(iconClones, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, 'explode+=0.2');

  // Los orbs vuelan en paralelo a sus posiciones de esquina
  wrappers.forEach((w, i) => {
    const { x, y } = getCornerPos(i, W, H, isMobile);
    masterTl.to(w, { x, y, duration: 1.2 + (i % 2) * 0.1, ease: 'power3.out' }, 'explode');
  });

  // ── SALIDA POR SCROLL (hero → proyectos) ─────────────────────────────────
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start: () => H * 0.45,
      end:   () => H * 0.85,
      scrub: 1,
    },
  });
  wrappers.forEach((w, i) => {
    exitTl.to(w, {
      y: `-=${H * 0.5}`,
      x: `+=${(i % 2 === 0 ? -1 : 1) * 200}`,
      opacity: 0, scale: 0.5,
      rotation: i % 2 === 0 ? -45 : 45,
      duration: 0.8, ease: 'power2.in',
    }, i * 0.05);
  });

  // ── RE-ENTRADA EN PROYECTOS (los orbs vuelven en curva al hacer scroll) ──
  scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger:    '.main-container',
      start:      () => 2 * H,
      endTrigger: '.proyectos-logo',
      end:        'center center',
      scrub: 1.5,
      onLeave:     startOrbit,
      onEnterBack: stopOrbit,
    },
  });
  wrappers.forEach((w, i) => {
    scrollTl.fromTo(w,
      { opacity: 0, scale: 0.2, rotation: -180 },
      {
        opacity: 1, scale: 1, rotation: 360,
        duration: 1.2, ease: 'power2.inOut',
        motionPath: { path: `#scroll-path-${i}`, align: `#scroll-path-${i}`, alignOrigin: [0.5, 0.5] },
      },
      i * 0.08,
    );
  });
}

// ── Órbita continua en la sección de proyectos ───────────────────────────────

function startOrbit() {
  const layer = document.querySelector('.hero-motion-layer');

  if (scrollTl?.scrollTrigger) {
    const { end } = scrollTl.scrollTrigger;
    if (layer) { layer.style.position = 'absolute'; layer.style.top = `${end}px`; }
    if (scrollTl.progress() < 1) scrollTl.progress(1);
  }

  orbitTween?.kill();
  orbitState.rot = 0;

  orbitTween = gsap.to(orbitState, {
    rot: Math.PI * 2,
    duration: 30, ease: 'none', repeat: -1,
    onUpdate() {
      dots.forEach((dot, i) => {
        const base = -Math.PI / 2 + (i / count) * Math.PI * 2;
        // Desplazamiento relativo al wrapper (que ya está en posición de órbita)
        gsap.set(dot, {
          x: (Math.cos(base + orbitState.rot) - Math.cos(base)) * rPx,
          y: (Math.sin(base + orbitState.rot) - Math.sin(base)) * rPx,
        });
      });
    },
  });
}

function stopOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
  if (layer) { layer.style.position = 'fixed'; layer.style.top = '0'; }

  orbitTween?.kill();
  orbitTween = null;

  dots.forEach(dot => gsap.to(dot, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }));
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function safeInit() {
  const logoWrap = document.getElementById('logo-wrapper');
  if (logoWrap) logoWrap.style.opacity = '0';

  // Forzar que PGSText esté descargada antes de medir el layout.
  // El timeout de 3s es el fallback por si el woff2 no responde.
  try {
    await Promise.race([
      document.fonts.load('400 5rem "PGSText"'),
      new Promise(r => setTimeout(r, 3000)),
    ]);
  } catch {}

  if (logoWrap) logoWrap.style.opacity = '';
  initHeroMotion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  safeInit();
}