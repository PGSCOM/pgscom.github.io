import gsap from 'gsap';

// Indicador de scroll: balanceo vertical suave que sugiere el gesto de
// bajar. Solo anima transform/opacity (barato para la GPU) y se pausa
// cuando no está a la vista para no gastar ciclos.
const hint = document.querySelector('.pd-scroll-hint');

if (hint) {
	const bob = gsap.to(hint, {
		y: 9,
		duration: 1.2,
		ease: 'sine.inOut',
		repeat: -1,
		yoyo: true,
	});

	// El indicador solo importa arriba del todo. Fade al empezar a bajar,
	// con la animación en pausa mientras está oculto.
	let visible = true;
	let pendiente = false;

	const actualizar = () => {
		pendiente = false;
		const debeVerse = window.scrollY < 40;
		if (debeVerse === visible) return;
		visible = debeVerse;
		gsap.to(hint, { autoAlpha: debeVerse ? 1 : 0, duration: 0.35, ease: 'power1.out', overwrite: 'auto' });
		debeVerse ? bob.play() : bob.pause();
	};

	window.addEventListener('scroll', () => {
		if (!pendiente) {
			pendiente = true;
			requestAnimationFrame(actualizar);
		}
	}, { passive: true });
}
