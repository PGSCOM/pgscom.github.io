// Los <video> usan `data-src` (no `src`) para no descargar nada hasta el primer play.

import { montarFuente } from './hls-media.js';

function reproducir(video) {
	montarFuente(video).then(() => video.play().catch(() => {}));
}

document.querySelectorAll('.hero-card').forEach((card) => {
	const video = card.querySelector('.hero-card-video');
	if (!video) return;

	card.addEventListener('mouseenter', () => reproducir(video));
	card.addEventListener('mouseleave', () => video.pause());
});

// Vídeos que arrancan al entrar en el viewport, sin depender de hover (así
// funcionan también en táctil): cronología y rejilla.
const scrollVideos = document.querySelectorAll('.ruta-video, .rejilla-video');

if (scrollVideos.length > 0) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const video = entry.target;
				if (entry.isIntersecting) reproducir(video);
				else video.pause();
			});
		},
		{ threshold: 0.25 },
	);

	scrollVideos.forEach((video) => observer.observe(video));
}
