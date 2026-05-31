import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

let orbitTicker = null;
let orbitRadius = 0;

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
  const rPx = Math.min(isMobile ? 120 : 220, window.innerWidth * (isMobile ? 0.22 : 0.18));
  orbitRadius = rPx;

  const dots = [];

  cards.forEach((card, i) => {
    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.dataset.index = i;
    dot.appendChild(cloneCardContent(card));
    layer.appendChild(dot);
    dots.push(dot);

    const startY = 60 + (i / (count - 1)) * (isMobile ? 300 : 440);
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const endX = 600 + Math.cos(angle) * rPx * 1200 / window.innerWidth;
    const endY = 300 + Math.sin(angle) * rPx * 600 / window.innerHeight;
    const cpX = (1250 + endX) / 2;
    const cpY = (startY + endY) / 2 - (isMobile ? 30 : 60);
    const d = `M 1250,${startY} Q ${cpX},${cpY} ${endX},${endY}`;

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', 'transparent');
    pathEl.id = `mi-path-${i}`;
    svg.appendChild(pathEl);
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.main-container',
      start: () => 2 * window.innerHeight,
      endTrigger: '.proyectos-logo',
      end: 'center center',
      scrub: 1.5,
      onLeave: startOrbit,
      onEnterBack: stopOrbit,
    }
  });

  dots.forEach((dot, i) => {
    tl.to(dot, {
      ease: 'power2.out',
      force3D: true,
      opacity: 1,
      motionPath: {
        path: `#mi-path-${i}`,
        align: `#mi-path-${i}`,
        alignOrigin: [0.5, 0.5],
      },
      duration: 0.7,
    }, i * 0.12);
  });
}

function startOrbit() {
  if (orbitTicker) return;

  const layer = document.querySelector('.hero-motion-layer');
  if (layer) {
    layer.style.position = 'absolute';
    layer.style.top = window.scrollY + 'px';
  }

  const dots = document.querySelectorAll('.proyecto-orb');
  if (!dots.length) return;

  let cx = 0, cy = 0;
  const angles = [];
  dots.forEach(dot => {
    const x = gsap.getProperty(dot, 'x');
    const y = gsap.getProperty(dot, 'y');
    const px = typeof x === 'number' ? x : 0;
    const py = typeof y === 'number' ? y : 0;
    cx += px;
    cy += py;
    angles.push({ x: px, y: py });
  });
  cx /= dots.length;
  cy /= dots.length;

  let angle = 0;
  angles.forEach((p, i) => {
    const a = Math.atan2(p.y - cy, p.x - cx);
    angle += a - (i / dots.length) * Math.PI * 2;
  });
  angle /= dots.length;

  let prevTime = performance.now();
  const r = orbitRadius;

  orbitTicker = function () {
    const now = performance.now();
    const dt = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;
    angle += dt * 0.45;

    dots.forEach((dot, i) => {
      const a = angle + (i / dots.length) * Math.PI * 2;
      gsap.set(dot, {
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        force3D: true,
      });
    });
  };

  gsap.ticker.add(orbitTicker);
}

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

  const dots = document.querySelectorAll('.proyecto-orb');
  if (!dots.length) return;

  const targets = [];
  let allOk = true;
  dots.forEach((dot, i) => {
    const tween = gsap.getTweensOf(dot)[0];
    if (tween) {
      tween.progress(1);
      const x = gsap.getProperty(dot, 'x');
      const y = gsap.getProperty(dot, 'y');
      targets.push({
        x: typeof x === 'number' ? x : 0,
        y: typeof y === 'number' ? y : 0,
      });
    } else {
      allOk = false;
    }
  });

  if (allOk) {
    gsap.to(dots, {
      x: (i) => targets[i].x,
      y: (i) => targets[i].y,
      duration: 0.35,
      ease: 'power2.inOut',
      force3D: true,
      onComplete: () => {
        dots.forEach(dot => {
          gsap.getTweensOf(dot).forEach(t => {
            t.invalidate().resume();
          });
        });
      },
    });
  } else {
    dots.forEach(dot => {
      gsap.getTweensOf(dot).forEach(t => {
        t.invalidate().resume();
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}
