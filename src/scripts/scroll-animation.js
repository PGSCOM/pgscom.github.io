import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function initScrollCircles() {
    const circles = Array.from(document.querySelectorAll('.scroll-circle'));
    const logoEl  = document.querySelector('.proyectos-logo');
    if (!circles.length) return;

    const vw    = window.innerWidth;
    const vh    = window.innerHeight;
    const count = circles.length;
    const TWO_PI = Math.PI * 2;
    const orbitR = Math.min(vw, vh) * 0.22;

    /* ── El logo empieza invisible; GSAP lo revela ── */
    if (logoEl) {
        gsap.set(logoEl, { opacity: 0, scale: 0.5, transformOrigin: 'center center' });
    }

    /* ── Position presets ── */
    const heroPos = [
        { x: vw * 0.70, y: vh * 0.15 },
        { x: vw * 0.88, y: vh * 0.28 },
        { x: vw * 0.66, y: vh * 0.50 },
        { x: vw * 0.82, y: vh * 0.62 },
        { x: vw * 0.92, y: vh * 0.42 },
        { x: vw * 0.74, y: vh * 0.78 },
    ];

    const darkPos = [
        { x: vw * 0.12, y: vh * 0.62 },
        { x: vw * 0.82, y: vh * 0.22 },
        { x: vw * 0.28, y: vh * 0.35 },
        { x: vw * 0.72, y: vh * 0.72 },
        { x: vw * 0.48, y: vh * 0.84 },
        { x: vw * 0.88, y: vh * 0.50 },
    ];

    // Posiciones de órbita centradas en el viewport (el ticker las ajustará al logo real)
    const orbitPos = Array.from({ length: count }, (_, i) => {
        const a = (TWO_PI * i) / count - Math.PI / 2;
        return {
            x: vw / 2 + Math.cos(a) * orbitR,
            y: vh / 2 + Math.sin(a) * orbitR,
        };
    });

    /* ── Estado inicial ── */
    circles.forEach((el, i) => {
        gsap.set(el, {
            x: heroPos[i].x,
            y: heroPos[i].y,
            xPercent: -50,
            yPercent: -50,
            scale: 0.65,
            opacity: 1,
            force3D: true,
        });
    });

    /* ════════════════════════════════════════════
       SISTEMA DE ÓRBITA (ticker)
       ════════════════════════════════════════════ */
    let orbitActive  = false;
    let orbitAngle   = 0;
    let tickerFn     = null;

    function startOrbit() {
        if (orbitActive || !logoEl) return;
        orbitActive = true;

        /* Snap suave a las posiciones reales del logo antes de empezar a rotar */
        const rect = logoEl.getBoundingClientRect();
        const lx   = rect.left + rect.width  / 2;
        const ly   = rect.top  + rect.height / 2;

        circles.forEach((el, i) => {
            const a = (TWO_PI * i) / count - Math.PI / 2;
            gsap.to(el, {
                x: lx + Math.cos(a) * orbitR,
                y: ly + Math.sin(a) * orbitR,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true,
            });
        });

        orbitAngle = 0;

        tickerFn = () => {
            if (!logoEl) return;

            const r  = logoEl.getBoundingClientRect();
            const ox = r.left + r.width  / 2;
            const oy = r.top  + r.height / 2;

            // El logo ha salido completamente por arriba → limpiar y parar
            if (oy < -(orbitR + 60)) {
                gsap.set(circles, { opacity: 0 });
                stopOrbit();
                return;
            }

            orbitAngle += 0.006; // velocidad de rotación (rad/frame a ~60fps)

            circles.forEach((el, i) => {
                const a = (TWO_PI * i) / count - Math.PI / 2 + orbitAngle;
                gsap.set(el, {
                    x: ox + Math.cos(a) * orbitR,
                    y: oy + Math.sin(a) * orbitR,
                    overwrite: 'auto',
                });
            });
        };

        gsap.ticker.add(tickerFn);
    }

    function stopOrbit() {
        if (!orbitActive) return;
        orbitActive = false;
        if (tickerFn) {
            gsap.ticker.remove(tickerFn);
            tickerFn = null;
        }
    }

    /* ════════════════════════════════════════════
       TIMELINE PRINCIPAL (scrubbed)
       ════════════════════════════════════════════ */
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger:    '.main-container',
            start:      'top top',
            endTrigger: '.proyectos-hero',
            end:        'top 50%',
            scrub:      1.5,
            onLeave:      () => startOrbit(),
            onEnterBack:  () => {
                stopOrbit();
                // Devolvemos el logo a invisble para que el scrub lo re-anime
                if (logoEl) gsap.set(logoEl, { opacity: 0, scale: 0.5 });
                // Re-mostramos los círculos si habían sido ocultados por el ticker
                gsap.set(circles, { opacity: 1 });
            },
        },
    });

    /* ── Fase 1 (0 → 0.20): Flotación suave en arco ── */
    circles.forEach((el, i) => {
        const h   = heroPos[i];
        const dir = i % 2 === 0 ? -1 : 1;
        tl.to(el, {
            motionPath: {
                path: [
                    { x: h.x + dir * vw * 0.012, y: h.y - vh * 0.012 },
                    { x: h.x + dir * vw * 0.025, y: h.y - vh * 0.030 },
                ],
                curviness: 1.4,
                autoRotate: false,
            },
            scale:    0.72,
            duration: 0.20,
            ease:     'sine.inOut',
        }, 0);
    });

    /* ── Fase 2 (0.20 → 0.42): Salida curva por la derecha ── */
    circles.forEach((el, i) => {
        const h    = heroPos[i];
        const dir  = i % 2 === 0 ? -1 : 1;
        const arcY = h.y - vh * 0.030 + (i % 3 - 1) * vh * 0.10;
        tl.to(el, {
            motionPath: {
                path: [
                    { x: h.x + vw * 0.12, y: arcY            },
                    { x: vw + 260,         y: arcY + dir * 30 },
                ],
                curviness:  0.9,
                autoRotate: false,
            },
            scale:    0.10,
            opacity:  0,
            duration: 0.22,
            ease:     'power3.in',
        }, 0.20);
    });

    /* ── Fase 3 (0.52 → 0.65): Entrada curva desde esquina superior-derecha ── */
    circles.forEach((el, i) => {
        const d = darkPos[i];
        tl.set(el, {
            x: vw + 180 + i * 25,
            y: -120 + (i % 3) * 50,
            scale:   0,
            opacity: 0,
        }, 0.52);

        tl.to(el, {
            motionPath: {
                path: [
                    { x: d.x + vw * 0.22, y: d.y - vh * 0.18 },
                    { x: d.x,             y: d.y              },
                ],
                curviness:  1.5,
                autoRotate: false,
            },
            scale:    0.65,
            opacity:  1,
            duration: 0.13,
            ease:     'back.out(1.4)',
        }, 0.52 + i * 0.008);
    });

    /* ── Fase 4 (0.65 → 0.93): Convergencia al anillo con arcos bezier ── */
    circles.forEach((el, i) => {
        const d    = darkPos[i];
        const o    = orbitPos[i];
        const side = i % 2 === 0 ? 1 : -1;
        tl.to(el, {
            motionPath: {
                path: [
                    { x: (d.x + o.x) / 2 + side * vw * 0.09, y: (d.y + o.y) / 2 - vh * 0.07 },
                    { x: o.x,                                  y: o.y                          },
                ],
                curviness:  1.6,
                autoRotate: false,
            },
            scale:    1,
            duration: 0.28,
            ease:     'power3.inOut',
        }, 0.65);
    });

    /* ── Logo: fade-in durante la convergencia ── */
    if (logoEl) {
        tl.to(logoEl, {
            opacity:  1,
            scale:    1,
            duration: 0.35,
            ease:     'power2.out',
        }, 0.65);
    }

    /* ── Fase 5 (0.93 → 1.00): Hold — el ticker toma el control al llegar aquí ── */
}
