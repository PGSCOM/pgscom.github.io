// Los <video> usan `data-src` (no `src`) para no descargar nada hasta el primer play.

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
