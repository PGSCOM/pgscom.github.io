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
  const cp1x = startX + dx * 0.1 - dy * curveAmount * sweep;
  const cp1y = startY + dy * 0.1 + dx * curveAmount * sweep;
  const cp2x = startX + dx * 0.9 - dy * curveAmount * sweep;
  const cp2y = startY + dy * 0.9 + dx * curveAmount * sweep;
  return `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
}

function initHeroMotion() {
  const layer = document.querySelector('.hero-motion-layer');
  const svg = document.querySelector('.motion-path-svg');
  if (!layer || !svg) return;

  const W = document.documentElement.clientWidth;
  const H = window.innerHeight;
  const isMobile = W < 768;
  
  svg.style.width = '100vw';
  svg.style.height = '100vh';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cards = document.querySelectorAll('.proyecto-card');
  count = cards.length;
  if (!count) return;

  rPx = Math.min(isMobile ? 130 : 220, W * (isMobile ? 0.35 : 0.22));
  const cx = W / 2;
  const cy = H / 2;
  const loadingRadius = isMobile ? 80 : 140;

  // Elementos DOM para la intro 
  const pEl = document.getElementById('letter-p');
  const gscomWrap = document.getElementById('letters-gscom-wrap');
  const logoWrap = document.getElementById('logo-wrapper');
  
  if (pEl && gscomWrap && logoWrap) {
    // 1. Configuraciones iniciales 
    gsap.set(gscomWrap, { width: 'auto' });
    const targetWidth = gscomWrap.offsetWidth;
    gsap.set(gscomWrap, { width: 0, opacity: 0 });
    
    // 2. Centrado matemático de la 'P' (midiendo antes de escalar a 0)
    const pRect = pEl.getBoundingClientRect();
    const pCenterX = pRect.left + pRect.width / 2;
    const pCenterY = pRect.top + pRect.height / 2;
    const dx = cx - pCenterX + pRect.width * 0.14;
    const dy = cy - pCenterY - pRect.height * 0.12;
    
    gsap.set(logoWrap, { x: dx, y: dy });
    gsap.set(pEl, { scale: 0, opacity: 0 });
  }

  const grayDots = [];
  const clones = [];

  // Creación y setup de los envoltorios
  cards.forEach((card, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-dot-wrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.width = '100px';
    wrapper.style.height = '100px';
    wrapper.style.left = '-50px';
    wrapper.style.top = '-50px';
    wrapper.style.zIndex = '4';
    wrapper.style.pointerEvents = 'none';

    const floatWrapper = document.createElement('div');
    floatWrapper.className = 'hero-float-wrapper';
    floatWrapper.style.position = 'absolute';
    floatWrapper.style.width = '100%';
    floatWrapper.style.height = '100%';

    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    
    // El punto gris para la carga
    const grayCircle = document.createElement('div');
    grayCircle.className = 'gray-loading-dot';
    
    // El ícono real clonado (Oculto inicialmente)
    const contentClone = cloneCardContent(card);
    contentClone.classList.add('orb-content-clone');
    
    dot.appendChild(grayCircle);
    dot.appendChild(contentClone);
    
    floatWrapper.appendChild(dot);
    wrapper.appendChild(floatWrapper);
    layer.appendChild(wrapper);
    wrappers.push(wrapper);
    dots.push(dot);
    grayDots.push(grayCircle);
    clones.push(contentClone);

    const sweep = i % 2 === 0 ? 1 : -1;
    const destX = cx + Math.cos(-Math.PI / 2 + (i / count) * Math.PI * 2) * rPx;
    const destY = cy + Math.sin(-Math.PI / 2 + (i / count) * Math.PI * 2) * rPx;

    const swoopStartX = W / 2 + (sweep * (W * 0.4 + i * 30));
    const swoopStartY = -200 - (i * 60);
    const sp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sp.setAttribute('d', buildCubicPath(swoopStartX, swoopStartY, destX, destY, 0.6, sweep * -1));
    sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', 'transparent');
    sp.id = `scroll-path-${i}`;
    svg.appendChild(sp);

    // Ocultos por defecto en el centro
    gsap.set(wrapper, { x: cx, y: cy, scale: 0, opacity: 0 });

    // Animación de flotación libre constante
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

  /* ── STORYBOARD ANIMATION TIMELINE ── */
  const masterTl = gsap.timeline();
  
  if (pEl && gscomWrap && logoWrap) {
    const proxy = { rotation: 0 };
    
    gsap.set(gscomWrap, { width: 'auto' });
    const realWidth = gscomWrap.offsetWidth;
    gsap.set(gscomWrap, { width: 0 });

    masterTl
      // 1. Nace la "P" en el centro
      .to(pEl, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)' })
      .to(pEl, { scale: 1.4, duration: 0.6, ease: 'power2.inOut' }, "+=0.2")
      // 2. Nacen los envoltorios de forma circular (muestran la piel gris)
      .to(wrappers, { 
        scale: 1, 
        opacity: 1, 
        rotation: "+=180",
        duration: 0.4, 
        stagger: 0.05, 
        ease: 'back.out(2)',
        onStart: function() {
            wrappers.forEach((wrapper, i) => {
                const ang = -Math.PI / 2 + (i / count) * Math.PI * 2;
                gsap.set(wrapper, {
                    x: cx + Math.cos(ang) * loadingRadius,
                    y: cy + Math.sin(ang) * loadingRadius
                });
            });
        }
      }, "<0.1")
      // 3. Orbitan los puntos
      .to(proxy, {
        rotation: Math.PI,
        duration: 1.2,
        ease: 'power1.inOut',
        onUpdate: () => {
          wrappers.forEach((wrapper, i) => {
            const currentAng = -Math.PI / 2 + (i / count) * Math.PI * 2 + proxy.rotation;
            gsap.set(wrapper, {
              x: cx + Math.cos(currentAng) * loadingRadius,
              y: cy + Math.sin(currentAng) * loadingRadius
            });
          });
        }
      }, "<")
      .to(pEl, { scale: 1, duration: 0.6, ease: 'power2.inOut' }, "+=0.2")
      
      // 4. EL MORPH - EXPLOSIÓN A LAS ESQUINAS
      .to(logoWrap, { 
        x: 0, y: 0, duration: 1.2, ease: 'power3.inOut',
        onComplete: () => {
            // Liberamos todo el control y encendemos el scroll
            document.documentElement.style.overflow = '';
            gsap.set(logoWrap, { clearProps: "all" });
            gsap.set(gscomWrap, { clearProps: "width", overflow: "visible" });
            const gradientAnim = 'pgscom-intro-scroll 2s linear forwards, pgscom-loop-scroll 4s linear 2s infinite';
            pEl.style.animation = gradientAnim;
            document.getElementById('letters-gscom').style.animation = gradientAnim;
            window.dispatchEvent(new CustomEvent('loading-done'));
        }
      }, "explode")
      .to(gscomWrap, { width: realWidth, opacity: 1, duration: 1.2, ease: 'power3.inOut' }, "explode")
      // Piel gris muta a los iconos reales
      .to(grayDots, { opacity: 0, scale: 0, duration: 0.4, ease: 'power2.in' }, "explode")
      .to(clones, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, "explode+=0.2");
      
      // Las bolas salen disparadas en curva a sus esquinas
      wrappers.forEach((wrapper, i) => {
        const peak = getPeakPos(i, W, H, isMobile);
        masterTl.to(wrapper, {
          x: peak.x,
          y: peak.y,
          ease: 'power3.out',
          duration: 1.2 + (i % 2) * 0.1
        }, "explode");
      });
  }

  // ── SCROLL EXIT TIMELINE ──
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
      x: `+=${(i % 2 === 0 ? -1 : 1) * 200}`,
      opacity: 0,
      scale: 0.5,
      rotation: (i % 2 === 0 ? -45 : 45),
      ease: 'power2.in',
      duration: 0.8,
    }, i * 0.05);
  });

  // ── SCROLL ORBIT TIMELINE ──
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
    scrollTl.fromTo(wrapper, {
      opacity: 0,
      scale: 0.2,
      rotation: -180
    }, {
      opacity: 1,
      scale: 1,
      rotation: 360,
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

function startOrbit() {
  const layer = document.querySelector('.hero-motion-layer');
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

  orbitTween = gsap.to(orbitState, {
    rot: Math.PI * 2,
    duration: 30,
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

function safeInit() {
  // Ocultar temporalmente para evitar parpadeos antes de que cargue la fuente
  const logoWrap = document.getElementById('logo-wrapper');
  if (logoWrap) logoWrap.style.opacity = '0';
  
  // Esperar a que la tipografía esté renderizada para hacer matemáticas perfectas
  document.fonts.ready.then(() => {
    if (logoWrap) logoWrap.style.opacity = '';
    initHeroMotion();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  safeInit();
}
