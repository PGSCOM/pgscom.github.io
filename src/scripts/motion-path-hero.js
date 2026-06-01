import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

/* ── estado de módulo ── */
let orbitTicker = null;
let orbitState  = { rotOffset: 0 };
let scrollTl    = null;
let wrappers    = [];
let dots        = [];
let dotData     = [];
let cx = 0, cy = 0;

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
// Distribución procedural de los puntos intermedios (peaks)
function getPeakPos(i, W, H) {
  const isMobile = W < 768;
  const mobilePeaks = [
    {x: 0.15, y: 0.15}, {x: 0.85, y: 0.25},
    {x: 0.20, y: 0.45}, {x: 0.80, y: 0.55},
    {x: 0.25, y: 0.70}, {x: 0.75, y: 0.85}
  ];
  const desktopPeaks = [
    {x: 0.60, y: 0.20}, {x: 0.85, y: 0.30},
    {x: 0.65, y: 0.45}, {x: 0.90, y: 0.55},
    {x: 0.55, y: 0.70}, {x: 0.80, y: 0.80}
  ];
  const p = isMobile ? mobilePeaks[i] : desktopPeaks[i];
  return {
    x: p ? p.x * W : W * 0.5,
    y: p ? p.y * H : H * 0.5
  };
}

/* ────────────────────────────────────────────────────────── */
function initHeroMotion() {
  const layer = document.querySelector('.hero-motion-layer');
  const svg = document.querySelector('.motion-path-svg');
  if (!layer || !svg) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  
  // Adaptamos el SVG de forma 1 a 1 a la pantalla (Píxeles perfectos, no más achatado)
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cards = document.querySelectorAll('.proyecto-card');
  const count = cards.length;
  if (!count) return;

  const isMobile = W < 768;
  const rPx = Math.min(
    isMobile ? 140 : 250,
    W * (isMobile ? 0.38 : 0.22)
  );

  cards.forEach((card, i) => {
    // ── Elemento Wrapper ──
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-dot-wrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '4';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.willChange = 'transform';
    wrapper.dataset.index = i;

    // ── Elemento Dot (Órbita) ──
    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.dataset.index = i;
    dot.appendChild(cloneCardContent(card));
    
    wrapper.appendChild(dot);
    layer.appendChild(wrapper);
    wrappers.push(wrapper);
    dots.push(dot);

    const peak = getPeakPos(i, W, H);
    const ang  = (i / count) * Math.PI * 2 - Math.PI / 2;

    // Coordenadas finales exactas (Círculo perfecto en píxeles de pantalla)
    const endX = W / 2 + Math.cos(ang) * rPx;
    const endY = H / 2 + Math.sin(ang) * rPx;

    const cpScrollX = (peak.x + endX) / 2;
    const cpScrollY = (peak.y + endY) / 2 - (isMobile ? 30 : 60);

    const startX = W + 150; // Inicia fuera de la pantalla
    const startY = H * 0.15 + (i / count) * (H * 0.7);

    const cpIntroX = startX * 0.6 + peak.x * 0.4;
    const cpIntroY = (startY + peak.y) / 2 - 50;

    // ── PATH DE SCROLL ──
    const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sp.setAttribute('d', `M ${peak.x},${peak.y} Q ${cpScrollX},${cpScrollY} ${endX},${endY}`);
    sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', 'transparent');
    sp.id = `mi-path-${i}`;
    svg.appendChild(sp);

    // ── PATH DE INTRO ──
    const ip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ip.setAttribute('d', `M ${startX},${startY} Q ${cpIntroX},${cpIntroY} ${peak.x},${peak.y}`);
    ip.setAttribute('fill', 'none');
    ip.setAttribute('stroke', 'transparent');
    ip.id = `intro-path-${i}`;
    svg.appendChild(ip);
  });

  gsap.set(wrappers, { opacity: 0 });

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

  wrappers.forEach((wrapper, i) => {
    scrollTl.to(wrapper, {
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

  /* ── Exit scroll ── */
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start:   () => window.innerHeight * 0.45,
      end:     () => window.innerHeight * 0.85,
      scrub:   1,
    },
  });
  wrappers.forEach((wrapper, i) => {
    exitTl.to(wrapper, {
      x:       `+=${isMobile ? 700 : 1000}`,
      opacity: 0,
      ease:    'power2.in',
      force3D: true,
      duration: 0.5,
    }, i * 0.07);
  });

  /* ── Timeline de INTRO ── */
  const introTl  = gsap.timeline();
  const introDur = isMobile ? 0.9 : 1.4;

  wrappers.forEach((wrapper, i) => {
    const t0 = 0.12 + i * 0.13;
    introTl.to(wrapper, {
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
    introTl.progress(1).kill();
    window.removeEventListener('scroll', killIntro);
  }, { passive: true });
}

/* ────────────────────────────────────────────────────────── */
function startOrbit() {
  if (orbitTicker) return;

  const layer = document.querySelector('.hero-motion-layer');
  const logoEl = document.querySelector('.proyectos-logo');

  // Ajuste perfecto absoluto compensando el padding del DOM en cualquier dispositivo
  if (layer && logoEl) {
    const logoRect = logoEl.getBoundingClientRect();
    const logoCenterY = logoRect.top + window.scrollY + (logoRect.height / 2);
    layer.style.position = 'absolute';
    layer.style.top = (logoCenterY - window.innerHeight / 2) + 'px';
  }

  if (!wrappers.length) return;

  dots.forEach(dot => gsap.killTweensOf(dot));

  // 💥 FIX DEFINITIVO SCROLL BRUSCO: Obliga a GSAP a colocar los wrappers en su destino 
  // final (Círculo Perfecto) antes de extraer la matemática de la órbita.
  if (scrollTl && scrollTl.progress() < 1) {
    scrollTl.progress(1);
  }

  cx = 0; cy = 0;
  const pos = wrappers.map(w => {
    const x = parseFloat(gsap.getProperty(w, 'x')) || 0;
    const y = parseFloat(gsap.getProperty(w, 'y')) || 0;
    cx += x; cy += y;
    return { x, y };
  });
  cx /= wrappers.length;
  cy /= wrappers.length;

  dotData = pos.map(p => ({
    r: Math.hypot(p.x - cx, p.y - cy),
    a: Math.atan2(p.y - cy, p.x - cx),
  }));

  orbitState.rotOffset = 0;

  const xSet = dots.map(d => gsap.quickSetter(d, 'x', 'px'));
  const ySet = dots.map(d => gsap.quickSetter(d, 'y', 'px'));

  orbitTicker = () => {
    dots.forEach((_, i) => {
      const { r, a } = dotData[i];
      const wX = parseFloat(gsap.getProperty(wrappers[i], 'x')) || pos[i].x;
      const wY = parseFloat(gsap.getProperty(wrappers[i], 'y')) || pos[i].y;
      
      xSet[i](cx + Math.cos(a + orbitState.rotOffset) * r - wX);
      ySet[i](cy + Math.sin(a + orbitState.rotOffset) * r - wY);
    });
  };
  gsap.ticker.add(orbitTicker);

  gsap.to(orbitState, {
    rotOffset: Math.PI * 2,
    duration: 14,
    ease: "none",
    repeat: -1,
    id: "orbitTween"
  });
}

/* ────────────────────────────────────────────────────────── */
function stopOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
  if (layer) {
    layer.style.position = 'fixed';
    layer.style.top = '0';
  }

  if (orbitTicker) {
    gsap.ticker.remove(orbitTicker);
    orbitTicker = null;
  }
  
  const orbitTween = gsap.getById("orbitTween");
  if (orbitTween) {
    orbitTween.kill();
  }

  if (!dots.length) return;

  // Restauración suave de los offsets de cada dot a 0, regresando
  // perfectamente al cauce del scroll animado hacia atrás.
  dots.forEach(dot => {
    gsap.to(dot, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
}

/* ────────────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}
