// Comparador antes/después de vídeo (VideoCompareSlider.astro). Ambos vídeos
// son <video> nativos a tamaño fijo (width/height 100%, object-fit: cover);
// el "before" se recorta con clip-path: inset(0 (100-pos)% 0 0), así sólo se
// ve la franja izquierda y el vídeo no se redimensiona al mover la barra.
// Arrastre con puntero (sólo al click+arrastrar, no en hover), teclado y
// sincronización de reproducción entre ambos (loop + corrección de deriva).
//
// Este script se carga desde la página (proyectos/multiguerras.astro): los
// <script> dentro de componentes no sobreviven al build cuando el componente
// se usa en MDX de colección con varios <Content/> por página.
function initVideoCompareSliders() {
	document.querySelectorAll('[data-vcs]').forEach((root) => {
		if (root.dataset.vcsInit === 'true') return;
		root.dataset.vcsInit = 'true';

		const handle = root.querySelector('.vcs__handle');
		const before = root.querySelector('.vcs__video--before');
		const after = root.querySelector('.vcs__video--after');
		const videos = [before, after];

		let pos = 50;
		const setPos = (value) => {
			// Sin la regla del 100/pos, pos puede llegar a 0 y 100 sin romper nada.
			pos = Math.max(0, Math.min(100, value));
			before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
			handle.style.left = `${pos}%`;
			handle.setAttribute('aria-valuenow', Math.round(pos));
		};
		setPos(50);

		// --- Arrastre (ratón, táctil y lápiz): sólo al click+arrastrar ---
		let dragging = false;
		const updateFromX = (clientX) => {
			const rect = root.getBoundingClientRect();
			setPos(((clientX - rect.left) / rect.width) * 100);
		};
		root.addEventListener('pointerdown', (e) => {
			dragging = true;
			try { root.setPointerCapture(e.pointerId); } catch {}
			updateFromX(e.clientX);
			e.preventDefault();
		});
		root.addEventListener('pointermove', (e) => { if (dragging) updateFromX(e.clientX); });
		const endDrag = (e) => {
			if (!dragging) return;
			dragging = false;
			try { root.releasePointerCapture(e.pointerId); } catch {}
		};
		root.addEventListener('pointerup', endDrag);
		root.addEventListener('pointercancel', endDrag);

		// --- Teclado ---
		handle.addEventListener('keydown', (e) => {
			const step = e.shiftKey ? 10 : 2;
			if (e.key === 'ArrowLeft') { setPos(pos - step); e.preventDefault(); }
			else if (e.key === 'ArrowRight') { setPos(pos + step); e.preventDefault(); }
			else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
			else if (e.key === 'End') { setPos(100); e.preventDefault(); }
		});

		// --- Sincronización: arranque común y corrección de deriva ---
		// Con `loop` en ambos vídeos no hay evento `ended`; si un vídeo se
		// queda atrás del otro, el temporizador lo devuelve a su posición.
		const ready = (v) =>
			v.readyState >= 2
				? Promise.resolve()
				: new Promise((r) => v.addEventListener('loadeddata', r, { once: true }));

		(async () => {
			await Promise.all(videos.map(ready));
			for (const v of videos) v.currentTime = 0;
			for (const v of videos) v.play().catch(() => {});
		})();

		// ponytail: backstop drift correction. Same-tab muted autoplay videos
		// rarely drift; only nudge when clearly out of step to avoid seek stutter.
		const driftCheck = setInterval(() => {
			if (Math.abs(before.currentTime - after.currentTime) > 0.4) {
				before.currentTime = after.currentTime;
			}
		}, 1000);

		document.addEventListener('astro:before-swap', () => clearInterval(driftCheck), { once: true });
	});
}

document.addEventListener('astro:page-load', initVideoCompareSliders);
initVideoCompareSliders();
