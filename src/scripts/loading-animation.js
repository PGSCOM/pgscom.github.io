import gsap from 'gsap';

/**
 * Animación de carga:
 *  1. "P" nace del centro y crece
 *  2. Puntos emergen en círculo alrededor
 *  3. El anillo orbita brevemente
 *  4. "P" se desplaza a la izquierda, "GSCOM" se desliza desde la derecha
 *  5. Puntos desaparecen
 *  6. Pantalla se desvanece → dispara 'loading-done' para que los iconos vuelen
 */
export function runLoadingAnimation() {
  return new Promise((resolve) => {
    const screen  = document.getElementById('loading-screen');
    const pEl     = document.getElementById('loading-p');
    const gscomEl = document.getElementById('loading-gscom');
    const ring    = document.getElementById('loading-dots-ring');

    // Salida de emergencia si faltan elementos
    if (!screen || !pEl || !gscomEl || !ring) {
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new CustomEvent('loading-done'));
      resolve();
      return;
    }

    const dots = Array.from(ring.querySelectorAll('.ldot'));
    const W    = window.innerWidth;
    const H    = window.innerHeight;
    const rPx  = Math.min(W, H) * 0.14;  // radio del anillo
    const n    = dots.length;

    /* ── Posicionar puntos en círculo ── */
    dots.forEach((d, i) => {
      const ang = -Math.PI / 2 + (i / n) * 2 * Math.PI;
      gsap.set(d, {
        xPercent: -50, yPercent: -50,
        x: Math.cos(ang) * rPx,
        y: Math.sin(ang) * rPx,
        opacity: 0,
        scale: 0,
      });
    });

    /* ── Medir GSCOM (fuente ya cargada gracias a fonts.ready) ── */
    gsap.set(gscomEl, { opacity: 0, x: 45 });
    gsap.set(pEl,     { scale: 0.05, opacity: 0 });
    const gscomW = gscomEl.offsetWidth;

    /* ════════════════════════════════════
       TIMELINE PRINCIPAL
       ════════════════════════════════════ */
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl
      /* 1 ─ P aparece desde el centro */
      .to(pEl, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' })

      /* 2 ─ P crece, puntos emergen en círculo */
      .to(pEl, { scale: 2.5, duration: 0.65 })
      .to(dots, {
        opacity: 1,
        scale: 1,
        stagger: { each: 0.065, from: 'start' },
        duration: 0.32,
        ease: 'back.out(2.5)',
      }, '-=0.55')

      /* 3 ─ Órbita breve: el anillo rota */
      .to(ring, { rotation: 60, duration: 0.6, ease: 'power1.inOut' }, '+=0.05')

      /* 4 ─ P vuelve a escala 1 y se desplaza a la izquierda */
      .to(pEl, {
        scale: 1,
        x: -(gscomW * 0.5 + 6),
        duration: 0.62,
        ease: 'power3.inOut',
      }, '+=0.05')

      /* 5 ─ GSCOM se desliza desde la derecha */
      .to(gscomEl, { opacity: 1, x: 0, duration: 0.5 }, '-=0.42')

      /* 6 ─ Puntos desaparecen */
      .to(dots, {
        opacity: 0,
        scale: 0,
        stagger: { each: 0.045, from: 'end' },
        duration: 0.25,
        ease: 'power2.in',
      }, '-=0.35')

      /* 7 ─ Pausa visual breve con el logo completo */
      .addPause('+=0.25')

      /* 8 ─ Fade-out de pantalla:
              • al EMPEZAR → libera el scroll y lanza los iconos (motion-path-hero)
              • al TERMINAR → oculta el DOM del loading y resuelve la promesa     */
      .to(screen, {
        opacity: 0,
        duration: 0.58,
        ease: 'power2.inOut',
        onStart() {
          document.documentElement.style.overflow = '';
          window.dispatchEvent(new CustomEvent('loading-done'));
        },
        onComplete() {
          screen.style.display = 'none';
          resolve();
        },
      });

    // Reproducir automáticamente pasada la pausa
    tl.play();
    // Avanza pasado el addPause automáticamente tras ~0.25 s de pausa real
    tl.eventCallback('onUpdate', function () {
      if (tl.paused() && tl.time() >= tl.duration() - 0.58 - 0.01) {
        tl.resume();
      }
    });
  });
}
