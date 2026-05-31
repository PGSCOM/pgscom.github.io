import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function initScrollCircles() {
    const circles = Array.from(document.querySelectorAll('.scroll-circle'));
    const logoEl  = document.querySelector('.proyectos-logo');
    if (!circles.length) return;

    const vw     = window.innerWidth;
    const vh     = window.innerHeight;
    const count  = circles.length;
    const TWO_PI = Math.PI * 2;
    const orbitR = Math.min(vw, vh) * 0.22;

    /* ── El logo empieza invisible; GSAP lo revela ── */
    if (logoEl) {
        gsap.set(logoEl, { opacity: 0, scale: 0.5, transformOrigin: 'center center' });
    }

    /* ══════════════════════════════════════════════════════════
       CLAVE: calcula la posición REAL del logo cuando el trigger
       termina (.proyectos-hero top = 50% viewport).
       Con esto orbitPos apunta exactamente al logo y no hay salto.
       ══════════════════════════════════════════════════════════ */
    function calcLogoAtTriggerEnd() {
        if (!logoEl) return { x: vw / 2, y: vh * 0.75 };
        const heroEl   = document.querySelector('.proyectos-hero');
        const logoRect = logoEl.getBoundingClientRect();
        if (!heroEl) return { x: logoRect.left + logoRect.width / 2, y: vh * 0.75 };

        // Posiciones absolutas en el documento (independientes del scroll actual)
        const heroDocY = heroEl.getBoundingClientRect().top + window.scrollY;
        const logoDocY = logoRect.top + window.scrollY;

        // Cuando el trigger termina: scrollY = heroDocY - vh * 0.5
        const scrollAtEnd = heroDocY - vh * 0.5;

        return {
            x: logoRect.left + logoRect.width  / 2,  // X no cambia con scroll vertical
            y: logoDocY - scrollAtEnd + logoRect.height / 2,
        };
    }

    const logoTarget = calcLogoAtTriggerEnd();

    /* ── Posiciones predefinidas ── */
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

    // orbitPos ahora apunta a la posición REAL del logo al final del trigger
    const orbitPos = Array.from({ length: count }, (_, i) => {
        const a = (TWO_PI * i) / count - Math.PI / 2;
        return {
            x: logoTarget.x + Math.cos(a) * orbitR,
            y: logoTarget.y + Math.sin(a) * orbitR,
        };
    });

    /* ── Estado inicial ── */
    circles.forEach((el, i) => {
        gsap.set(el, {
            x:        heroPos[i].x,
            y:        heroPos[i].y,
            xPercent: -50,
            yPercent: -50,
            scale:    0.65,
            opacity:  1,
            force3D:  true,
        });
    });

    /* ════════════════════════════════════════════
       SISTEMA DE ÓRBITA
       ════════════════════════════════════════════ */
    let orbitActive = false;
    let orbitAngle  = 0;
    let tickerFn    = null;
    let snapTweens  = [];

    function startOrbit() {
        if (orbitActive || !logoEl) return;
        orbitActive = true;
        orbitAngle  = 0;

        // Matar tweens anteriores
        snapTweens.forEach(t => t.kill());
        snapTweens = [];

        // Forzar el logo visible independientemente del lag del scrub
        gsap.to(logoEl, {
            opacity:  1,
            scale:    1,
            duration: 0.5,
            ease:     'power2.out',
            overwrite: true,
        });

        // Posición actual real del logo
        const rect = logoEl.getBoundingClientRect();
        const lx   = rect.left + rect.width  / 2;
        const ly   = rect.top  + rect.height / 2;

        let completed = 0;

        circles.forEach((el, i) => {
            const a  = (TWO_PI * i) / count - Math.PI / 2;
            const tw = gsap.to(el, {
                x:        lx + Math.cos(a) * orbitR,
                y:        ly + Math.sin(a) * orbitR,
                opacity:  1,
                scale:    1,
                duration: 0.5,
                ease:     'power2.out',
                overwrite: true,
                onComplete() {
                    completed++;
                    // El ticker solo arranca DESPUÉS de que todos los snaps terminen
                    if (completed === count) startOrbitTicker();
                },
            });
            snapTweens.push(tw);
        });
    }

    function startOrbitTicker() {
        if (!orbitActive) return; // puede haberse cancelado durante el snap

        tickerFn = () => {
            if (!logoEl) return;
            const r  = logoEl.getBoundingClientRect();
            const ox = r.left + r.width  / 2;
            const oy = r.top  + r.height / 2;

            // Si el logo sale por arriba → limpiar y parar
            if (oy < -(orbitR + 60)) {
                gsap.set(circles, { opacity: 0 });
                stopOrbit();
                return;
            }

            orbitAngle += 0.006;

            circles.forEach((el, i) => {
                const a = (TWO_PI * i) / count - Math.PI / 2 + orbitAngle;
                gsap.set(el, {
                    x: ox + Math.cos(a) * orbitR,
                    y: oy + Math.sin(a) * orbitR,
                });
            });
        };

        gsap.ticker.add(tickerFn);
    }

    function stopOrbit() {
        if (!orbitActive) return;
        orbitActive = false;
        snapTweens.forEach(t => t.kill());
        snapTweens = [];
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
            scrub:      1.0,   // reducido de 1.5 → más responsivo
            onLeave() {
                startOrbit();
            },
            onEnterBack() {
                stopOrbit();
                // Colocar círculos y logo en su estado de progress=1.0
                // para que el scrub pueda revertir suavemente desde ahí
                circles.forEach((el, i) => {
                    gsap.set(el, {
                        x:       orbitPos[i].x,
                        y:       orbitPos[i].y,
                        opacity: 1,
                        scale:   1,
                    });
                });
                // Logo en estado visible (progress=1.0) para que el scrub lo revierta
                if (logoEl) gsap.set(logoEl, { opacity: 1, scale: 1 });
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
                curviness:  1.4,
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

    /* ── Fase 3 (0.52 → 0.65): Entrada desde esquina superior-derecha ── */
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

    /* ── Fase 4 (0.65 → 0.93): Convergencia al anillo alrededor del logo REAL ── */
    circles.forEach((el, i) => {
        const d    = darkPos[i];
        const o    = orbitPos[i];    // ← ahora apunta al logo real
        const side = i % 2 === 0 ? 1 : -1;
        tl.to(el, {
            motionPath: {
                path: [
                    { x: (d.x + o.x) / 2 + side * vw * 0.09, y: (d.y + o.y) / 2 - vh * 0.07 },
                    { x: o.x, y: o.y },
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

    /* ── Fase 5 (0.93 → 1.00): Hold — el ticker toma el control al salir ── */
}