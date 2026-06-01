import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

let scrollTl = null;
let wrappers = [];
let dots = [];
let orbitTween = null;
let orbitState = { rot: 0 };
let rPx = 0;
let count = 0;

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
function getPeakPos(i, W, H, isMobile) {
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
  return { x: p ? p.x * W : W * 0.5, y: p ? p.y * H : H * 0.5 };
}

function buildCubicPath(startX, startY, endX, endY, curveAmount, sweep) {
  const dx = endX - startX;
  const dy = endY - startY;
  const cp1x = startX + dx * 0.2 - dy * curveAmount * sweep;
  const cp1y = startY + dy * 0.2 + dx * curveAmount * sweep;
  const cp2x = startX + dx * 0.8 - dy * curveAmount * sweep;
  const cp2y = startY + dy * 0.8 + dx * curveAmount * sweep;
  return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
}

/* ────────────────────────────────────────────────────────── */
function initHeroMotion() {
  const layer = document.querySelector('.hero-motion-layer');
  const svg = document.querySelector('.motion-path-svg');
  if (!layer || !svg) return;

  const W = document.documentElement.clientWidth;
  const H = window.innerHeight;
  const isMobile = W < 768;
  
  // Seteamos el SVG para que matchee el 100% de los píxeles reales, evitando el achatamiento
  svg.style.width = '100%';
  svg.style.height = '100vh';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cards = document.querySelectorAll('.proyecto-card');
  count = cards.length;
  if (!count) return;

  rPx = Math.min(isMobile ? 130 : 220, W * (isMobile ? 0.35 : 0.22));
  const cx = W / 2;
  const cy = H / 2;

  cards.forEach((card, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-dot-wrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';
    wrapper.style.left = '0px';
    wrapper.style.top = '0px';
    wrapper.style.zIndex = '4';
    wrapper.style.pointerEvents = 'none';
    wrapper.dataset.index = i;

    const floatWrapper = document.createElement('div');
    floatWrapper.className = 'hero-float-wrapper';
    floatWrapper.style.width = '100%';
    floatWrapper.style.height = '100%';

    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.appendChild(cloneCardContent(card));
    
    floatWrapper.appendChild(dot);
    wrapper.appendChild(floatWrapper);
    layer.appendChild(wrapper);
    wrappers.push(wrapper);
    dots.push(dot);

    const peak = getPeakPos(i, W, H, isMobile);
    const ang = -Math.PI / 2 + (i / count) * Math.PI * 2;
    
    const destX = cx + Math.cos(ang) * rPx;
    const destY = cy + Math.sin(ang) * rPx;

    const sweep = i % 2 === 0 ? 1 : -1;

    // Camino con curvas C (Cúbicas) mucho más estéticas y orgánicas
    const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sp.setAttribute('d', buildCubicPath(peak.x, peak.y, destX, destY, 0.4, sweep));
    sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', 'transparent');
    sp.id = `scroll-path-${i}`;
    svg.appendChild(sp);

    const startX = W + (isMobile ? 150 : 300);
    const startY = peak.y + (Math.random() * 200 - 100);
    
    const ip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ip.setAttribute('d', buildCubicPath(startX, startY, peak.x, peak.y, 0.3, sweep * -1));
    ip.setAttribute('fill', 'none');
    ip.setAttribute('stroke', 'transparent');
    ip.id = `intro-path-${i}`;
    svg.appendChild(ip);

    // Animación extra flotante, ahora independiente de la rotación principal
    gsap.to(floatWrapper, {
      y: "-=15",
      duration: 1.5 + Math.random(),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: Math.random()
    });
  });

  gsap.set(wrappers, { opacity: 0 });

  const introTl = gsap.timeline();
  wrappers.forEach((wrapper, i) => {
    introTl.to(wrapper, {
      opacity: 1,
      motionPath: {
        path: `#intro-path-${i}`,
        align: `#intro-path-${i}`,
        alignOrigin: [0.5, 0.5]
      },
      ease: 'power2.out',
      force3D: true,
      duration: isMobile ? 1 : 1.4,
    }, 0.12 + i * 0.13);
  });

  const KILL_Y = H * 0.4;
  window.addEventListener('scroll', function killIntro() {
    if (window.scrollY < KILL_Y) return;
    introTl.progress(1).kill();
    window.removeEventListener('scroll', killIntro);
  }, { passive: true });

  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start: () => H * 0.45,
      end: () => H * 0.85,
      scrub: 1,
    }
  });
  wrappers.forEach((wrapper, i) => {
    exitTl.to(wrapper, {
      x: `+=${isMobile ? 700 : 1000}`,
      opacity: 0,
      ease: 'power2.in',
      duration: 0.5,
    }, i * 0.07);
  });

  scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start: () => 2 * H,
      endTrigger: '.proyectos-logo',
      end: 'center center',
      scrub: 1.5,
      onLeave: startOrbit,
      onEnterBack: stopOrbit,
    }
  });
  
  wrappers.forEach((wrapper, i) => {
    scrollTl.to(wrapper, {
      ease: 'power1.inOut',
      opacity: 1,
      motionPath: {
        path: `#scroll-path-${i}`,
        align: `#scroll-path-${i}`,
        alignOrigin: [0.5, 0.5]
      },
      duration: 1,
    }, i * 0.1);
  });
}

function startOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
  
  if (scrollTl && scrollTl.scrollTrigger) {
    // Al usar scrollTrigger.end, capturamos el píxel matemático exacto 
    // y lo bloqueamos. Ya no importa a qué velocidad bajes el scroll.
    const st = scrollTl.scrollTrigger;
    if (layer) {
      layer.style.position = 'absolute';
      layer.style.top = st.end + 'px';
    }
    
    // Forzar el final exacto de GSAP previene las asimetrías
    if (scrollTl.progress() < 1) {
      scrollTl.progress(1);
    }
  }

  if (orbitTween) orbitTween.kill();
  orbitState.rot = 0;

  // Órbita basada en compensación trigonométrica pura.
  // Permite trasladar los elementos alrededor de un círculo
  // SIN inyectar propiedades "rotate" en CSS. Los iconos quedan 100% rectos.
  orbitTween = gsap.to(orbitState, {
    rot: Math.PI * 2,
    duration: 25,
    ease: "none",
    repeat: -1,
    onUpdate: () => {
      dots.forEach((dot, i) => {
        const baseA = -Math.PI / 2 + (i / count) * Math.PI * 2;
        const localX = Math.cos(baseA + orbitState.rot) * rPx - Math.cos(baseA) * rPx;
        const localY = Math.sin(baseA + orbitState.rot) * rPx - Math.sin(baseA) * rPx;
        
        gsap.set(dot, { x: localX, y: localY });
      });
    }
  });
}

function stopOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
  if (layer) {
    layer.style.position = 'fixed';
    layer.style.top = '0px';
  }

  if (orbitTween) {
    orbitTween.kill();
    orbitTween = null;
  }

  // Devolvemos el desplazamiento suavemente al origen 0 para
  // enganchar de forma indetectable con el scroll al hacer marcha atrás
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}
