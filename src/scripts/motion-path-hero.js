import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

/* ── estado de módulo ── */
let orbitTicker = null;
let orbitEndPos = []; // {x,y} de cada dot al final del scroll-tl — guardado en startOrbit
let scrollTl    = null;

/* ────────────────────────────────────────────────────────── */
function cloneCardContent(card) {
  const inner = document.createElement('div');
  inner.className = 'proyecto-card-inner';
  const icon = document.createElement('div');
  icon.className = 'proyecto-icon';
  const img = card.querySelector('.proyecto-icon img');
  if (img) {
    const clone = img.cloneNode(true);
    clone.removeAttribute('srcset');
    icon.appendChild(clone);
  }
  inner.appendChild(icon);
  return inner;
}

/* ────────────────────────────────────────────────────────── */
function getPeakPos(i, isMobile) {
  const peaks = isMobile
    ? [[500,110],[650,155],[570,225],[700,280],[535,360],[660,415]]
    : [[750,130],[990,175],[860,255],[1070,310],[780,395],[960,455]];
  return i < peaks.length
    ? { x: peaks[i][0], y: peaks[i][1] }
    : { x: isMobile ? 570+(i%2)*120 : 860+(i%2)*180,
        y: isMobile ? 110+Math.floor(i/2)*90 : 130+Math.floor(i/2)*110 };
}

function buildIntroPath(i, count, isMobile, peak) {
  const t      = count > 1 ? i / (count - 1) : 0;
  const startX = isMobile ? 1000 : 1600;
  const startY = isMobile ? 90 + t * 230 : 90 + t * 370;

  const cpX = startX * 0.6 + peak.x * 0.4 + (isMobile ? 8 : 20);
  const cpY = (startY + peak.y) / 2 - (isMobile ? 18 : 40);

  return `M ${startX},${startY} Q ${cpX},${cpY} ${peak.x},${peak.y}`;
}

/* ────────────────────────────────────────────────────────── */
function initHeroMotion() {
  const layer = document.querySelector('.hero-motion-layer');
  if (!layer) return;
  const svg = document.querySelector('.motion-path-svg');
  if (!svg) return;
  svg.querySelector('#mi-path')?.remove();

  const cards = document.querySelectorAll('.proyecto-card');
  const count = cards.length;
  if (!count) return;

  const isMobile = window.innerWidth < 768;
  const rPx = Math.min(
    isMobile ? 120 : 220,
    window.innerWidth * (isMobile ? 0.22 : 0.18)
  );

  const dots = [];

  cards.forEach((card, i) => {
    /* ── elemento dot ── */
    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.dataset.index = i;
    dot.appendChild(cloneCardContent(card));
    layer.appendChild(dot);
    dots.push(dot);

    /* ── posición pico: origen compartido intro → scroll ── */
    const peak = getPeakPos(i, isMobile);

    /* ── path de SCROLL: pico → órbita (el scroll lo gestiona) ── */
    const ang  = (i / count) * Math.PI * 2 - Math.PI / 2;
    const endX = 600 + Math.cos(ang) * rPx * 1200 / window.innerWidth;
    const endY = 300 + Math.sin(ang) * rPx * 600  / window.innerHeight;
    const cpX  = (peak.x + endX) / 2;
    const cpY  = (peak.y + endY) / 2 - (isMobile ? 30 : 60);

    const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sp.setAttribute('d', `M ${peak.x},${peak.y} Q ${cpX},${cpY} ${endX},${endY}`);
    sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', 'transparent');
    sp.id = `mi-path-${i}`;
    svg.appendChild(sp);

    /* ── path de INTRO: derecha → pico ── */
    const ip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ip.setAttribute('d', buildIntroPath(i, count, isMobile, peak));
    ip.setAttribute('fill', 'none');
    ip.setAttribute('stroke', 'transparent');
    ip.id = `intro-path-${i}`;
    svg.appendChild(ip);
  });

  /* ── Todos los dots empiezan invisibles.
     Evita el flash en su posición CSS por defecto durante el stagger. ── */
  gsap.set(dots, { opacity: 0 });

  /* ── Timeline de SCROLL ── */
  scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger:    '.main-container',
      start:      () => 2 * window.innerHeight,
      endTrigger: '.proyectos-logo',
      end:        'center center',
      scrub:      1.5,
      onLeave:      startOrbit,
      onEnterBack:  stopOrbit,
    }
  });
  dots.forEach((dot, i) => {
    scrollTl.to(dot, {
      ease:    'power2.out',
      force3D: true,
      opacity: 1,
      motionPath: {
        path:        `#mi-path-${i}`,
        align:       `#mi-path-${i}`,
        alignOrigin: [0.5, 0.5],
      },
      duration: 0.7,
    }, i * 0.12);
  });

  /* ── Exit scroll: bolitas salen por la derecha ANTES de "parte2" ── */
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start:   () => window.innerHeight * 0.45,  // justo tras killIntro
      end:     () => window.innerHeight * 0.85,  // margen antes de parte2
      scrub:   1,
    },
  });
  dots.forEach((dot, i) => {
    exitTl.to(dot, {
      x:       `+=${isMobile ? 700 : 1000}`,
      opacity: 0,
      ease:    'power2.in',
      force3D: true,
      duration: 0.5,
    }, i * 0.07);
  });

  /* ── Timeline de INTRO ──
     Dots entran desde la derecha y SE QUEDAN en sus picos.
     La desaparición la gestiona el scrollTl (scroll-driven). */
  const introTl  = gsap.timeline();
  const introDur = isMobile ? 0.9 : 1.4;

  dots.forEach((dot, i) => {
    const t0 = 0.12 + i * 0.13;
    introTl.to(dot, {
      opacity: 1,
      motionPath: {
        path:        `#intro-path-${i}`,
        align:       `#intro-path-${i}`,
        alignOrigin: [0.5, 0.5],
      },
      ease:    'power2.out',
      force3D: true,
      duration: introDur,
    }, t0);
  });

  const KILL_Y = window.innerHeight * 0.4;
  window.addEventListener('scroll', function killIntro() {
    if (window.scrollY < KILL_Y) return;
    // Salta al final del intro (todos los dots al pico, opacity:1)
    // para que el scroll-tl arranque desde la posición correcta.
    introTl.progress(1).kill();
    window.removeEventListener('scroll', killIntro);
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────── */
function startOrbit() {
  if (orbitTicker) return;

  const layer = document.querySelector('.hero-motion-layer');
  if (layer) {
    layer.style.position = 'absolute';
    layer.style.top = window.scrollY + 'px';
  }

  const dots = Array.from(document.querySelectorAll('.proyecto-orb'));
  if (!dots.length) return;

  /* Calcular centroide a partir de las posiciones ACTUALES
     (= posición final del scroll-tl, progress=1) */
  let cx = 0, cy = 0;
  const pos = dots.map(dot => {
    const x = parseFloat(gsap.getProperty(dot, 'x')) || 0;
    const y = parseFloat(gsap.getProperty(dot, 'y')) || 0;
    cx += x; cy += y;
    return { x, y };
  });
  cx /= dots.length;
  cy /= dots.length;

  /* PUNTO CLAVE FIX #2:
     Guardamos las posiciones exactas del final del scroll-tl.
     stopOrbit las usará para re-situar los dots sin salto. */
  orbitEndPos = pos.map(p => ({ x: p.x, y: p.y }));

  /* FIX #2 — ángulo y radio POR DOT desde el centroide.
     Con rotOffset=0, cada dot arranca en EXACTAMENTE su posición actual
     → cero salto visual al iniciar la órbita. */
  const dotData = pos.map(p => ({
    r: Math.hypot(p.x - cx, p.y - cy),
    a: Math.atan2(p.y - cy, p.x - cx),
  }));

  /* FIX #4 — quickSetters: mucho más rápido que gsap.set para updates por frame */
  const xSet = dots.map(d => gsap.quickSetter(d, 'x', 'px'));
  const ySet = dots.map(d => gsap.quickSetter(d, 'y', 'px'));

  let rotOffset = 0;
  let prevTime  = performance.now();

  orbitTicker = () => {
    const now = performance.now();
    const dt  = Math.min((now - prevTime) / 1000, 0.05);
    prevTime  = now;
    rotOffset += dt * 0.45;
    dots.forEach((_, i) => {
      const { r, a } = dotData[i];
      xSet[i](cx + Math.cos(a + rotOffset) * r);
      ySet[i](cy + Math.sin(a + rotOffset) * r);
    });
  };
  gsap.ticker.add(orbitTicker);
}

/* ────────────────────────────────────────────────────────── */
function stopOrbit() {
  if (orbitTicker) {
    gsap.ticker.remove(orbitTicker);
    orbitTicker = null;
  }

  const layer = document.querySelector('.hero-motion-layer');
  if (layer) {
    layer.style.position = 'fixed';
    layer.style.top = '0';
  }

  const dots = Array.from(document.querySelectorAll('.proyecto-orb'));
  if (!dots.length || !orbitEndPos.length) return;

  /* FIX #2 + #3:
     Colocamos cada dot en su posición de fin de scroll-tl (orbitEndPos).
     - onEnterBack se dispara cuando el scroll vuelve al borde del trigger,
       momento en que el scrub tiene progress≈1.0 → el motionPath coloca
       los dots en esas mismas coordenadas → CERO SALTO.
     - Desde ahí el scrub retrocede suavemente por el path hacia atrás. */
  dots.forEach((dot, i) => {
    if (orbitEndPos[i]) {
      gsap.set(dot, {
        x:       orbitEndPos[i].x,
        y:       orbitEndPos[i].y,
        force3D: true,
      });
    }
  });
}

/* ────────────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}