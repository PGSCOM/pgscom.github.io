// Comparador antes/después de vídeo (VideoCompareSlider.astro). Ambos vídeos
// son <video> nativos a tamaño fijo (width/height 100%, object-fit: cover);
// el "before" se recorta con clip-path según la variable CSS --vcs-pos, así
// sólo se ve la franja izquierda y el vídeo no se redimensiona al mover la
// barra. Arrastre con puntero (sólo al click+arrastrar), teclado y
// sincronización de reproducción entre ambos (loop + corrección de deriva).
//
// Este script se carga desde la página (proyectos/multiguerras.astro): los
// <script> dentro de componentes no sobreviven al build cuando el componente
// se usa en MDX de colección con varios <Content/> por página.
//
// Notas de rendimiento respecto a la versión anterior:
//  - Una sola escritura de estilo por frame (--vcs-pos en el contenedor) en
//    lugar de tocar clipPath + left + aria en cada pointermove.
//  - La barra se mueve con transform (compositor) en vez de con `left`.
//  - `pointermove` sólo está enganchado mientras se arrastra, no en hover.
//  - getBoundingClientRect() se cachea al empezar el arrastre y se invalida
//    con scroll/resize, en vez de leerse en cada movimiento.
//  - Los vídeos sólo se reproducen cuando el comparador está en pantalla
//    (IntersectionObserver); fuera de vista se pausan.
//  - La corrección de deriva va sobre `timeupdate` (~4 Hz y sólo mientras hay
//    reproducción) en vez de un setInterval que corre siempre.

/** Limpiezas pendientes, ejecutadas al navegar con View Transitions. */
const teardowns = new Set();

function setupSlider(root) {
	if (root.dataset.vcsInit === 'true') return;
	root.dataset.vcsInit = 'true';

	const handle = root.querySelector('.vcs__handle');
	const before = root.querySelector('.vcs__video--before');
	const after = root.querySelector('.vcs__video--after');
	if (!handle || !before || !after) return;

	const videos = [before, after];
	const disposers = [];

	// --- Posición: una sola escritura por frame sobre --vcs-pos ---
	let pos = 50;
	let frame = 0;
	const commit = () => {
		frame = 0;
		root.style.setProperty('--vcs-pos', `${pos}%`);
		handle.setAttribute('aria-valuenow', Math.round(pos));
	};
	const setPos = (value) => {
		const next = value < 0 ? 0 : value > 100 ? 100 : value;
		if (next === pos) return;
		pos = next;
		if (!frame) frame = requestAnimationFrame(commit);
	};

	// --- Arrastre (ratón, táctil y lápiz): sólo al click+arrastrar ---
	let rect = null;
	let dragging = false;
	const invalidateRect = () => { rect = null; };
	const moveTo = (clientX) => {
		if (!rect) rect = root.getBoundingClientRect();
		if (rect.width) setPos(((clientX - rect.left) / rect.width) * 100);
	};

	const onMove = (e) => moveTo(e.clientX);
	const onUp = (e) => {
		if (!dragging) return;
		dragging = false;
		root.classList.remove('vcs--dragging');
		root.removeEventListener('pointermove', onMove);
		root.removeEventListener('pointerup', onUp);
		root.removeEventListener('pointercancel', onUp);
		window.removeEventListener('scroll', invalidateRect, true);
		try { root.releasePointerCapture(e.pointerId); } catch {}
	};
	const onDown = (e) => {
		if (e.button > 0) return; // ignora botón derecho / auxiliar
		dragging = true;
		rect = root.getBoundingClientRect();
		root.classList.add('vcs--dragging');
		try { root.setPointerCapture(e.pointerId); } catch {}
		root.addEventListener('pointermove', onMove);
		root.addEventListener('pointerup', onUp);
		root.addEventListener('pointercancel', onUp);
		window.addEventListener('scroll', invalidateRect, { passive: true, capture: true });
		moveTo(e.clientX);
		// El handle tiene pointer-events:none, así que nunca recibe foco al
		// hacer click: se lo damos a mano para poder seguir con el teclado.
		handle.focus({ preventScroll: true });
		e.preventDefault();
	};

	root.addEventListener('pointerdown', onDown);
	window.addEventListener('resize', invalidateRect, { passive: true });
	disposers.push(() => {
		root.removeEventListener('pointerdown', onDown);
		window.removeEventListener('resize', invalidateRect);
		window.removeEventListener('scroll', invalidateRect, true);
		if (frame) cancelAnimationFrame(frame);
	});

	// --- Teclado ---
	const onKeyDown = (e) => {
		const step = e.shiftKey ? 10 : 2;
		if (e.key === 'ArrowLeft') setPos(pos - step);
		else if (e.key === 'ArrowRight') setPos(pos + step);
		else if (e.key === 'Home') setPos(0);
		else if (e.key === 'End') setPos(100);
		else return;
		e.preventDefault();
	};
	handle.addEventListener('keydown', onKeyDown);
	disposers.push(() => handle.removeEventListener('keydown', onKeyDown));

	// --- Reproducción: sólo cuando el comparador está en pantalla ---
	const playAll = () => {
		for (const v of videos) {
			const p = v.play();
			if (p) p.catch(() => {});
		}
	};
	const pauseAll = () => { for (const v of videos) v.pause(); };

	// Resuelve también con `error` para que un vídeo roto no deje al otro
	// esperando para siempre.
	const decoded = (v) =>
		v.readyState >= 2
			? Promise.resolve()
			: new Promise((resolve) => {
					const done = () => {
						v.removeEventListener('loadeddata', done);
						v.removeEventListener('error', done);
						resolve();
					};
					v.addEventListener('loadeddata', done);
					v.addEventListener('error', done);
				});

	let visible = false;
	let pending = true; // queda por hacer el arranque sincronizado inicial
	const start = () => {
		if (!pending) { playAll(); return; }
		pending = false;
		Promise.all(videos.map(decoded)).then(() => {
			if (!visible) return;
			for (const v of videos) v.currentTime = 0;
			playAll();
		});
	};

	if ('IntersectionObserver' in window) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					visible = entry.isIntersecting;
					if (visible) start();
					else pauseAll();
				}
			},
			{ rootMargin: '200px 0px' },
		);
		io.observe(root);
		disposers.push(() => io.disconnect());
	} else {
		visible = true;
		start();
	}

	// --- Corrección de deriva ---
	// Con `loop` en ambos vídeos no hay evento `ended`; si uno se queda atrás
	// (o acaba de dar la vuelta antes que el otro) lo devolvemos a su sitio.
	// `timeupdate` dispara ~4 veces por segundo y sólo mientras se reproduce.
	const onTimeUpdate = () => {
		if (Math.abs(before.currentTime - after.currentTime) > 0.4) {
			before.currentTime = after.currentTime;
		}
	};
	after.addEventListener('timeupdate', onTimeUpdate);
	disposers.push(() => after.removeEventListener('timeupdate', onTimeUpdate));

	teardowns.add(() => {
		for (const fn of disposers) fn();
		pauseAll();
	});
}

function initVideoCompareSliders() {
	document.querySelectorAll('[data-vcs]').forEach(setupSlider);
}

document.addEventListener('astro:page-load', initVideoCompareSliders);
document.addEventListener('astro:before-swap', () => {
	for (const fn of teardowns) fn();
	teardowns.clear();
});

// Para páginas sin View Transitions, donde `astro:page-load` no llega nunca.
initVideoCompareSliders();