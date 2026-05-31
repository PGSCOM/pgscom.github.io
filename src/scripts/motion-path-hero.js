import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

function initHeroMotion() {
  const isMobile = window.innerWidth < 768;

  const pathD = isMobile
    ? 'M 0,200 Q 200,0 400,200 T 800,200'
    : 'M 0,300 C 200,50 400,550 600,300 S 1000,50 1200,300';

  const pathEl = document.querySelector('#mi-path');
  if (!pathEl) return;
  pathEl.setAttribute('d', pathD);

  gsap.to('#elemento', {
    immediateRender: true,
    ease: 'none',
    motionPath: {
      path: '#mi-path',
      align: '#mi-path',
      alignOrigin: [0.5, 0.5],
      autoRotate: true,
    },
    scrollTrigger: {
      trigger: '.main-container',
      start: 'top top',
      end: '+=800',
      scrub: 1.5,
      markers: false,
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroMotion);
} else {
  initHeroMotion();
}
