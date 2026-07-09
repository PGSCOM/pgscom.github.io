// Galería de imágenes con lightbox (PhotoSwipe). El autor escribe imágenes
// markdown normales dentro de un <div class="pd-galeria">…</div> (ver
// FORMATO.md); Astro las optimiza y les pone width/height, que reutilizamos
// para que PhotoSwipe pueda maquetar antes incluso de haber cargado la
// imagen a tamaño completo. La librería pesa lo suyo, así que se importa de
// forma dinámica y solo si la ficha tiene alguna galería (mismo patrón que
// proyecto-video.js con Video.js).

const galerias = [...document.querySelectorAll('.pd-contenido .pd-galeria')];

if (galerias.length > 0) {
	// Envuelve cada <img> en un <a> hacia la imagen a tamaño completo: sirve
	// de fallback sin JS (abre la imagen en una pestaña) y es el elemento
	// que PhotoSwipe necesita como "children" de la galería.
	for (const galeria of galerias) {
		for (const img of galeria.querySelectorAll('img')) {
			const enlace = document.createElement('a');
			enlace.href = img.currentSrc || img.src;
			enlace.target = '_blank';
			enlace.rel = 'noopener';
			// Astro pone width/height como atributos HTML en las imágenes de
			// markdown optimizadas; los leemos tal cual, sin depender de que
			// la imagen ya haya cargado (naturalWidth sería 0 hasta entonces).
			const ancho = img.getAttribute('width');
			const alto = img.getAttribute('height');
			if (ancho) enlace.dataset.pswpWidth = ancho;
			if (alto) enlace.dataset.pswpHeight = alto;

			img.replaceWith(enlace);
			enlace.appendChild(img);
		}
	}

	Promise.all([
		import('photoswipe/lightbox'),
		import('photoswipe/style.css'),
	]).then(([{ default: PhotoSwipeLightbox }]) => {
		for (const galeria of galerias) {
			const lightbox = new PhotoSwipeLightbox({
				gallery: galeria,
				children: 'a',
				pswpModule: () => import('photoswipe'),
			});
			lightbox.init();
		}
	});
}
