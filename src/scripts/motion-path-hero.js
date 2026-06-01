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
// Clona el HTML original de las cards para usarlo en la animación
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
// Distribución de las posiciones de "espera" tras la intro
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

// Magia: Genera curvas de Bézier cúbicas en forma de "S" para un vuelo orgánico
function buildCubicPath(startX, startY, endX, endY, curveAmount, sweep) {
  const dx = endX - startX;
  const dy = endY - startY;
  const cp1x = startX + dx * 0.1 - dy * curveAmount * sweep;
  const cp1y = startY + dy * 0.1 + dx * curveAmount * sweep;
  const cp2x = startX + dx * 0.9 - dy * curveAmount * sweep;
  const cp2y = startY + dy * 0.9 + dx * curveAmount * sweep;
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
  
  // Tamaño en pixeles absolutos para evitar achatamiento en pantallas wide/estrechas
  svg.style.width = '100vw';
  svg.style.height = '100vh';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cards = document.querySelectorAll('.proyecto-card');
  count = cards.length;
  if (!count) return;

  rPx = Math.min(isMobile ? 130 : 220, W * (isMobile ? 0.35 : 0.22));
  const cx = W / 2;
  const cy = H / 2;

  cards.forEach((card, i) => {
    // 1. Wrapper Base (Viaja por el MotionPath)
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-dot-wrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';
    wrapper.style.left = '-50px'; // Centrado en el path
    wrapper.style.top = '-50px';
    wrapper.style.zIndex = '4';
    wrapper.style.pointerEvents = 'none';

    // 2. Float Wrapper (Añade el efecto de gravedad cero independiente)
    const floatWrapper = document.createElement('div');
    floatWrapper.className = 'hero-float-wrapper';
    floatWrapper.style.position = 'absolute';
    floatWrapper.style.width = '100%';
    floatWrapper.style.height = '100%';

    // 3. Dot (El que orbita trigonométricamente al final)
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

    // --- PATH 1: INTRO (Efecto "Big Bang" desde el centro)
    const introStartX = W / 2;
    const introStartY = H / 2 + 50; 
    const ip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ip.setAttribute('d', buildCubicPath(introStartX, introStartY, peak.x, peak.y, 0.8, sweep));
    ip.setAttribute('fill', 'none');
    ip.setAttribute('stroke', 'transparent');
    ip.id = `intro-path-${i}`;
    svg.appendChild(ip);

    // --- PATH 2: SCROLL (Vuelo en picado hacia la órbita)
    const swoopStartX = W / 2 + (sweep * (W * 0.4 + i * 30));
    const swoopStartY = -200 - (i * 60);
    const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sp.setAttribute('d', buildCubicPath(swoopStartX, swoopStartY, destX, destY, 0.6, sweep * -1));
    sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', 'transparent');
    sp.id = `scroll-path-${i}`;
    svg.appendChild(sp);

    // --- ANIMACIÓN: Flotación espacial orgánica continua
    gsap.to(floatWrapper, {
      y: () => (Math.random() > 0.5 ? "+=18" : "-=18"),
      x: () => (Math.random() > 0.5 ? "+=12" : "-=12"),
      rotation: () => (Math.random() * 8 - 4),
      duration: () => 2.5 + Math.random() * 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: () => Math.random() * 2
    });
  });

  // Estado inicial oculto y pequeño
  gsap.set(wrappers, { opacity: 0, scale: 0, rotation: -180 });

  /* ── 1. TIMELINE INTRO ── */
  const introTl = gsap.timeline();
  wrappers.forEach((wrapper, i) => {
    introTl.to(wrapper, {
      opacity: 1,
      scale: 1,
      rotation: 0, // Giran mientras se abren
      motionPath: {
        path: `#intro-path-${i}`,
        align: `#intro-path-${i}`,
        alignOrigin: [0.5, 0.5]
      },
      ease: 'back.out(1.5)', // Rebote chulo al final
      force3D: true,
      duration: isMobile ? 1.4 : 1.8,
    }, 0.1 + i * 0.12);
  });

  const KILL_Y = H * 0.4;
  window.addEventListener('scroll', function killIntro() {
    if (window.scrollY < KILL_Y) return;
    introTl.progress(1).kill();
    window.removeEventListener('scroll', killIntro);
  }, { passive: true });

  /* ── 2. TIMELINE EXIT (Al hacer scroll se elevan como humo) ── */
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
      y: `-=${H * 0.5}`,
      x: `+=${(i % 2 === 0 ? -1 : 1) * 200}`, // Se separan a los lados
      opacity: 0,
      scale: 0.5,
      rotation: (i % 2 === 0 ? -45 : 45),
      ease: 'power2.in',
      duration: 0.8,
    }, i * 0.05);
  });

  /* ── 3. TIMELINE SCROLL HACIA LA ÓRBITA ── */
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
    // Usamos fromTo para garantizar un reseteo impecable si subes y bajas el scroll rápido
    scrollTl.fromTo(wrapper, {
      opacity: 0,
      scale: 0.2,
      rotation: -180
    }, {
      opacity: 1,
      scale: 1,
      rotation: 360, // Hacen un giro espectacular de 360 grados durante el vuelo y acaban rectos
      ease: 'power2.inOut',
      motionPath: {
        path: `#scroll-path-${i}`,
        align: `#scroll-path-${i}`,
        alignOrigin: [0.5, 0.5]
      },
      duration: 1.2,
    }, i * 0.08);
  });
}

/* ────────────────────────────────────────────────────────── */
function startOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
  const logoEl = document.querySelector('.proyectos-logo');
  
  if (scrollTl && scrollTl.scrollTrigger) {
    const st = scrollTl.scrollTrigger;
    if (layer) {
      layer.style.position = 'absolute';
      layer.style.top = st.end + 'px';
    }
    if (scrollTl.progress() < 1) {
      scrollTl.progress(1);
    }
  }

  if (orbitTween) orbitTween.kill();
  orbitState.rot = 0;

  // Órbita basada en pura matemática trigonométrica
  // Traslada los iconos en círculo perfecto manteniéndolos apuntando rectos siempre.
  orbitTween = gsap.to(orbitState, {
    rot: Math.PI * 2,
    duration: 30, // Un poco más lento para más elegancia
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
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto"
    });
  });
}

// Espera a que la animación de carga termine antes de volar los iconos
function waitAndInit() {
  window.addEventListener('loading-done', initHeroMotion, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitAndInit);
} else {
  waitAndInit();
}
