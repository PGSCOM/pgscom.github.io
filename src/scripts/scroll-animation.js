import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/**
 * Full-journey scroll animation for the project circles.
 *
 * Storyboard phases:
 *   1. Page load         – circles VISIBLE on the RIGHT side (scale 0.65)
 *   2. Hero float        – gentle arc drift
 *   3. Logo zoom         – curved EXIT off right edge
 *   4. Dark bg           – curved ENTRY from top-right corner
 *   5. Convergence       – bezier arcs into orbital ring
 *   6. Orbit hold        – circles STUCK in position
 *   7. Fade out          – disappear as proyectos-hero enters viewport
 */
export function initScrollCircles() {
    const circles = Array.from(document.querySelectorAll('.scroll-circle'));
    if (!circles.length) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const count = circles.length;
    const TWO_PI = Math.PI * 2;

    /* ── Position presets ── */

    // Phase 1: Hero — scattered on right side, clearly visible
    const heroPos = [
        { x: vw * 0.70, y: vh * 0.15 },
        { x: vw * 0.88, y: vh * 0.28 },
        { x: vw * 0.66, y: vh * 0.50 },
        { x: vw * 0.82, y: vh * 0.62 },
        { x: vw * 0.92, y: vh * 0.42 },
        { x: vw * 0.74, y: vh * 0.78 },
    ];

    // Phase 4: Dark background — spread across viewport
    const darkPos = [
        { x: vw * 0.12, y: vh * 0.62 },
        { x: vw * 0.82, y: vh * 0.22 },
        { x: vw * 0.28, y: vh * 0.35 },
        { x: vw * 0.72, y: vh * 0.72 },
        { x: vw * 0.48, y: vh * 0.84 },
        { x: vw * 0.88, y: vh * 0.50 },
    ];

    // Phase 5: Orbital ring — slightly larger radius so it reads clearly
    const orbitR = Math.min(vw, vh) * 0.22;
    const cx = vw / 2;
    const cy = vh / 2;
    const orbitPos = Array.from({ length: count }, (_, i) => {
        const a = (TWO_PI * i) / count - Math.PI / 2;
        return { x: cx + Math.cos(a) * orbitR, y: cy + Math.sin(a) * orbitR };
    });

    /* ── Initial state: visible, properly sized ── */
    circles.forEach((el, i) => {
        gsap.set(el, {
            x: heroPos[i].x,
            y: heroPos[i].y,
            xPercent: -50,
            yPercent: -50,
            scale: 0.65,      // FIX: was 0.35 — now clearly visible
            opacity: 1,
            force3D: true,
        });
    });

    /* ── Main scrubbed timeline ── */
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.main-container',
            start: 'top top',
            endTrigger: '.proyectos-hero',
            end: 'top 50%',
            scrub: 1.5,
        },
    });

    /* ── Phase 1 (0 → 0.20): Gentle arc float on right side ── */
    circles.forEach((el, i) => {
        const h = heroPos[i];
        const dir = i % 2 === 0 ? -1 : 1;

        tl.to(el, {
            motionPath: {
                path: [
                    // midpoint arc
                    { x: h.x + dir * vw * 0.012, y: h.y - vh * 0.012 },
                    // end of float
                    { x: h.x + dir * vw * 0.025, y: h.y - vh * 0.030 },
                ],
                curviness: 1.4,
                autoRotate: false,
            },
            scale: 0.72,
            duration: 0.20,
            ease: 'sine.inOut',
        }, 0);
    });

    /* ── Phase 2 (0.20 → 0.42): Curved exit RIGHT during logo zoom ── */
    circles.forEach((el, i) => {
        const h = heroPos[i];
        const dir = i % 2 === 0 ? -1 : 1;
        const floatEndX = h.x + dir * vw * 0.025;
        const floatEndY = h.y - vh * 0.030;
        // Arc slightly up/down before sweeping off-screen
        const arcY = floatEndY + (i % 3 - 1) * vh * 0.10;

        tl.to(el, {
            motionPath: {
                path: [
                    { x: floatEndX + vw * 0.12, y: arcY },
                    { x: vw + 260, y: arcY + dir * 30 },
                ],
                curviness: 0.9,
                autoRotate: false,
            },
            scale: 0.10,
            opacity: 0,
            duration: 0.22,
            ease: 'power3.in',
        }, 0.20);
    });

    /* ── Gap (0.42 → 0.52): circles hidden off-screen ── */

    /* ── Phase 3 (0.52 → 0.65): Curved entry from top-right corner ── */
    circles.forEach((el, i) => {
        const d = darkPos[i];

        // Start off-screen top-right, staggered per circle
        tl.set(el, {
            x: vw + 180 + i * 25,
            y: -120 + (i % 3) * 50,
            scale: 0,
            opacity: 0,
        }, 0.52);

        tl.to(el, {
            motionPath: {
                path: [
                    // sweeping arc inward
                    { x: d.x + vw * 0.22, y: d.y - vh * 0.18 },
                    { x: d.x, y: d.y },
                ],
                curviness: 1.5,
                autoRotate: false,
            },
            scale: 0.65,      // FIX: was 0.55 — more visible on dark background
            opacity: 1,
            duration: 0.13,
            ease: 'back.out(1.4)',
        }, 0.52 + i * 0.008); // tiny stagger so they don't all pop at once
    });

    /* ── Phase 4 (0.65 → 0.93): Bezier convergence into orbital ring ── */
    circles.forEach((el, i) => {
        const d = darkPos[i];
        const o = orbitPos[i];

        // Push the arc to the "outside" of the orbit so each circle
        // swoops in from its own direction — looks like the storyboard
        const side = i % 2 === 0 ? 1 : -1;
        const midX = (d.x + o.x) / 2 + side * vw * 0.09;
        const midY = (d.y + o.y) / 2 - vh * 0.07;

        tl.to(el, {
            motionPath: {
                path: [
                    { x: midX, y: midY },
                    { x: o.x, y: o.y },
                ],
                curviness: 1.6,
                autoRotate: false,
            },
            scale: 1,
            duration: 0.28,
            ease: 'power3.inOut',
        }, 0.65);
    });

    /* ── Phase 5 (0.93 → 1.00): Hold (circles remain at orbital positions) ── */

    /* ── Fade-out: EARLIER — starts as proyectos-hero enters viewport ── */
    // FIX: was 'center top' which is far too late
    gsap.timeline({
        scrollTrigger: {
            trigger: '.proyectos-hero',
            start: 'top 80%',   // begins fading when header is 80% down viewport
            end: 'center top',  // fully gone when header center hits top
            scrub: 1,
        },
    }).to(circles, {
        opacity: 0,
        scale: 0.6,
        duration: 1,
        ease: 'power2.in',
    });
}
