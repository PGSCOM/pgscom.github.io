/**
 * card-video.js
 *
 * Controla la carga y reproducción de los vídeos de las tarjetas de proyecto.
 * Los <video> se renderizan con `data-src` y `preload="none"` para que el
 * navegador no descargue nada hasta que sea necesario.
 *
 * Hero cards (.hero-card-video):
 *   - El vídeo arranca al hover del `.hero-card` y se pausa al salir.
 *   - La primera vez se asigna `src` desde `data-src` (carga diferida).
 *
 * Tarjetas del timeline (.ruta-video):
 *   - Un IntersectionObserver arranca el vídeo al entrar en viewport
 *     y lo pausa al salir. También carga `src` la primera vez.
 */

/* ── Hero: play/pause al hover ─────────────────────────────────────── */
document.querySelectorAll('.hero-card').forEach((card) => {
	const video = card.querySelector('.hero-card-video');
	if (!video) return;

	card.addEventListener('mouseenter', () => {
		if (!video.src && video.dataset.src) {
			video.src = video.dataset.src;
		}
		video.play().catch(() => {});
	});

	card.addEventListener('mouseleave', () => {
		video.pause();
	});
});

/* ── Timeline: play/pause al entrar/salir del viewport ─────────────── */
const rutaVideos = document.querySelectorAll('.ruta-video');

if (rutaVideos.length > 0) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target;
				if (entry.isIntersecting) {
					if (!video.src && video.dataset.src) {
						video.src = video.dataset.src;
					}
					video.play().catch(() => {});
				} else {
					video.pause();
				}
			});
		},
		{ threshold: 0.25 },
	);

	rutaVideos.forEach((video) => observer.observe(video));
}
