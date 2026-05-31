import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

let orbitRAF = null;

function createProjectOrbs() {
  const layer = document.querySelector('.hero-motion-layer');
  if (!layer) return;

  const old = document.getElementById('elemento');
  if (old) old.remove();

  const colors = [
    '#367e78', '#2563eb', '#fbbf24',
    '#f472b6', '#10b981', '#f97316'
  ];

  for (let i = 0; i < colors.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'hero-dot proyecto-orb';
    dot.dataset.index = i;
    dot.style.background = `radial-gradient(circle at 35% 35%, ${colors[i]}, #0a0a0a)`;
    dot.style.boxShadow = `0 0 24px ${colors[i]}66, 0 0 60px ${colors[i]}33`;
    layer.appendChild(dot);
  }
}

function initHeroMotion() {
  createProjectOrbs();

  const isMobile = window.innerWidth < 768;
  const dots = document.querySelectorAll('.proyecto-orb');
  if (!dots.length) return;

  const pathD = isMobile
    ? 'M 0,200 L 300,200 Q 400,0 500,200 T 600,300'
    : 'M 0,300 C 200,50 400,550 600,300';
  const pathEl = document.getElementById('mi-path');
  if (pathEl) pathEl.setAttribute('d', pathD);

  dots.forEach((dot) => {
    gsap.to(dot, {
      ease: 'none',
      motionPath: {
        path: '#mi-path',
        align: '#mi-path',
        alignOrigin: [0.5, 0.5],
      },
      scrollTrigger: {
        trigger: '.main-container',
        start: 'top top',
        endTrigger: '.proyectos-logo',
        end: 'center center',
        scrub: 1.2,
        onLeave: startOrbit,
        onEnterBack: stopOrbit,
      }
    });
  });
}

function startOrbit() {
  if (orbitRAF) return;

  const dots = document.querySelectorAll('.proyecto-orb');
  if (!dots.length) return;

  dots.forEach(dot => {
    gsap.getTweensOf(dot).forEach(t => t.pause());
  });

  const r = Math.min(220, window.innerWidth * 0.18);
  let angle = 0;
  let started = performance.now();
  let expanded = false;

  const animate = (now) => {
    const dt = Math.min((now - started) / 1000, 0.05);
    started = now;

    if (!expanded) {
      angle += dt * 0.25;
      if (angle >= 0.8) expanded = true;
    } else {
      angle += dt * 0.5;
    }

    const currentR = r * (1 - Math.exp(-angle * 3));

    dots.forEach((dot, i) => {
      const a = angle + (i / dots.length) * Math.PI * 2;
      gsap.set(dot, {
        x: Math.cos(a) * currentR,
        y: Math.sin(a) * currentR,
      });
    });

    orbitRAF = requestAnimationFrame(animate);
  };

  orbitRAF = requestAnimationFrame(animate);
}

function stopOrbit() {
  if (!orbitRAF) return;
  cancelAnimationFrame(orbitRAF);
  orbitRAF = null;

  const dots = document.querySelectorAll('.proyecto-orb');
  dots.forEach(dot => {
    gsap.getTweensOf(dot).forEach(t => {
      t.invalidate().resume();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}
