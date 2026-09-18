// Los <video> usan `data-src` (no `src`) para no descargar nada hasta el primer play.

import { montarFuente } from './hls-media.js';

// Segundos que la tarjeta muestra el póster antes de arrancar el vídeo,
// ajustable por proyecto con `videoDelay` en su frontmatter (-> data-delay).
const DELAY_DEFECTO = 2;

function reproducir(video) {
	montarFuente(video).then(() => video.play().catch(() => {}));
}

// Al salir de pantalla se pausa y se desmonta la fuente: así la próxima vez
// que la tarjeta aparezca vuelve a mostrar el póster antes del vídeo.
function volverAlPoster(video) {
	video.pause();
	video.parentElement.classList.remove('is-playing');
	if (!video.dataset.montado) return;
	video.removeAttribute('src');
	video.load();
	delete video.dataset.montado;
}

// El hover también arranca el vídeo al instante en rejilla/cronología: sirve
// de respaldo si el navegador bloquea el autoplay automático del observer de
// abajo (p. ej. el permiso "Autoplay" de Brave, más estricto que Chrome).
document.querySelectorAll('.ruta-item').forEach((item) => {
	const video = item.querySelector('.ruta-video');
	if (video) item.addEventListener('mouseenter', () => reproducir(video));
});

// Todas las tarjetas con trailer (cronología, rejilla) muestran el póster
// durante `data-delay` segundos desde que entran en pantalla y luego arrancan
// el vídeo solas, sin depender de hover (así funciona en táctil).
const videos = document.querySelectorAll('.ruta-video');

if (videos.length > 0) {
	const timers = new WeakMap();

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target;
				if (entry.isIntersecting) {
					const delay = Number(video.dataset.delay) || DELAY_DEFECTO;
					timers.set(video, setTimeout(() => reproducir(video), delay * 1000));
				} else {
					clearTimeout(timers.get(video));
					volverAlPoster(video);
				}
			});
		},
		{ threshold: 0.25 },
	);

	videos.forEach((video) => {
		// El póster (imagen superpuesta) se desvanece cuando el vídeo empieza a
		// reproducirse de verdad, tanto por el temporizador como por el hover del hero.
		video.addEventListener('playing', () => video.parentElement.classList.add('is-playing'));
		observer.observe(video);
	});
}
