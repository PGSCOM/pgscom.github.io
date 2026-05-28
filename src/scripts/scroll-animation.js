import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Full-journey scroll animation for the project circles.
 *
 * Storyboard phases:
 *   1. Page load         – circles VISIBLE on the RIGHT side immediately
 *   2. Hero scroll       – circles float gently
 *   3. Logo zoom         – circles EXIT screen (off to the right)
 *   4. Dark bg           – circles REAPPEAR scattered
 *   5. Pre-orbit         – circles CONVERGE into circular arrangement
 *   6. Orbit hold        – circles STAY STUCK in position (no rotation)
 *   7. Fade out           – circles disappear when proyectos-content scrolls in
 *
 * Timing reference (galaxia-scroll.js):
 *   Logo zoom happens at scrollY = vh → 2*vh (progress 0.5 → 1.0)
 *   Total scroll to proyectos-hero ≈ 320vh
 */
export function initScrollCircles() {
	const circles = Array.from(document.querySelectorAll('.scroll-circle'));
	if (!circles.length) return;

	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const count = circles.length;
	const TWO_PI = Math.PI * 2;

	/* ────────────────────────────────────────────
	   Position presets
	   ──────────────────────────────────────────── */

	// Phase 1: Hero — right side, small
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

	// Phase 5: Orbital arrangement — circle around viewport centre
	const orbitR = Math.min(vw, vh) * 0.20;
	const cx = vw / 2;
	const cy = vh / 2;
	const orbitPos = Array.from({ length: count }, (_, i) => {
		const a = (TWO_PI * i) / count - Math.PI / 2; // start from top
		return { x: cx + Math.cos(a) * orbitR, y: cy + Math.sin(a) * orbitR };
	});

	/* ────────────────────────────────────────────
	   Initial state: VISIBLE on right side
	   (loading screen covers the page, so no flash)
	   ──────────────────────────────────────────── */

	circles.forEach((el, i) => {
		gsap.set(el, {
			x: heroPos[i].x,
			y: heroPos[i].y,
			xPercent: -50,
			yPercent: -50,
			scale: 0.35,
			opacity: 1,
			force3D: true,
		});
	});

	/* ────────────────────────────────────────────
	   Main scrubbed timeline
	   trigger:     top of hero  (scrollY = 0)
	   endTrigger:  top of .proyectos-hero at 50% viewport
	   ──────────────────────────────────────────── */

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: '.main-container',
			start: 'top top',
			endTrigger: '.proyectos-hero',
			end: 'top 50%',
			scrub: 1.5,
		},
	});

	/* ── Phase 1 (0 → 0.20): Float gently on right side ── */
	circles.forEach((el, i) => {
		const h = heroPos[i];
		tl.to(el, {
			x: h.x + (i % 2 === 0 ? -1 : 1) * vw * 0.025,
			y: h.y - vh * 0.03,
			scale: 0.4,
			duration: 0.20,
			ease: 'sine.inOut',
		}, 0);
	});

	/* ── Phase 2 (0.20 → 0.42): Exit RIGHT during logo zoom ── */
	circles.forEach((el, i) => {
		tl.to(el, {
			x: vw + 200,
			scale: 0.15,
			opacity: 0,
			duration: 0.22,
			ease: 'power3.in',
		}, 0.20);
	});

	/* ── Gap (0.42 → 0.52): circles hidden off-screen ── */

	/* ── Phase 3 (0.52 → 0.65): Reappear scattered on dark bg ── */
	circles.forEach((el, i) => {
		const d = darkPos[i];

		// Instant reposition (hidden, at dark positions)
		tl.set(el, {
			x: d.x,
			y: d.y,
			scale: 0,
			opacity: 0,
		}, 0.52);

		// Fade/pop in
		tl.to(el, {
			scale: 0.55,
			opacity: 1,
			duration: 0.13,
			ease: 'back.out(1.4)',
		}, 0.52);
	});

	/* ── Phase 4 (0.65 → 0.93): Converge to orbit positions ── */
	circles.forEach((el, i) => {
		const o = orbitPos[i];
		tl.to(el, {
			x: o.x,
			y: o.y,
			scale: 1,
			duration: 0.28,
			ease: 'power3.inOut',
		}, 0.65);
	});

	/* ── Phase 5 (0.93 → 1.00): Hold (circles stuck in orbit) ── */
	// No tweens — circles remain at their orbital positions.

	/* ────────────────────────────────────────────
	   Fade-out: separate scrubbed timeline
	   Triggers when .proyectos-hero is MOSTLY off-screen.
	   Uses its own ScrollTrigger range so it doesn't
	   conflict with the main timeline.
	   ──────────────────────────────────────────── */

	gsap.timeline({
		scrollTrigger: {
			trigger: '.proyectos-hero',
			start: 'center top',   // hero centre hits viewport top
			end: 'bottom top',     // hero bottom hits viewport top
			scrub: 1,
		},
	}).to(circles, {
		opacity: 0,
		scale: 0.7,
		duration: 1,
		ease: 'power2.in',
	});
}
