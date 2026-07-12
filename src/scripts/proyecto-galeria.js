// Galería con lightbox (PhotoSwipe). El autor escribe imágenes markdown
// normales dentro de un <div class="pd-galeria">…</div> (ver FORMATO.md);
// Astro las optimiza y les pone width/height, que reutilizamos para que
// PhotoSwipe pueda maquetar antes incluso de haber cargado la imagen a
// tamaño completo.
//
// También admite <video> dentro de la galería (con poster de thumbnail):
// se abre en el lightbox como vídeo nativo con controles. La librería
// pesa lo suyo, así que se importa de forma dinámica y solo si la ficha
// tiene alguna galería.

const galerias = [...document.querySelectorAll('.pd-contenido .pd-galeria')];

if (galerias.length > 0) {
	for (const galeria of galerias) {
		for (const img of galeria.querySelectorAll('img')) {
			const enlace = document.createElement('a');
			enlace.href = img.currentSrc || img.src;
			enlace.target = '_blank';
			enlace.rel = 'noopener';
			const ancho = img.getAttribute('width');
			const alto = img.getAttribute('height');
			if (ancho) enlace.dataset.pswpWidth = ancho;
			if (alto) enlace.dataset.pswpHeight = alto;

			img.replaceWith(enlace);
			enlace.appendChild(img);
		}

		for (const video of galeria.querySelectorAll('video')) {
			const src = video.getAttribute('src');
			if (!src) continue;

			const enlace = document.createElement('a');
			enlace.href = src;
			enlace.target = '_blank';
			enlace.rel = 'noopener';
			enlace.dataset.pswpType = 'video';

			const poster = video.getAttribute('poster');
			if (poster) enlace.dataset.pswpVideoPoster = poster;

			if (video.videoWidth && video.videoHeight) {
				enlace.dataset.pswpWidth = video.videoWidth;
				enlace.dataset.pswpHeight = video.videoHeight;
			} else {
				enlace.dataset.pswpWidth = '1920';
				enlace.dataset.pswpHeight = '1080';
			}

			video.removeAttribute('controls');
			video.removeAttribute('autoplay');
			video.muted = false;

			video.replaceWith(enlace);
			enlace.appendChild(video);
		}
	}

	Promise.all([
		import('photoswipe/lightbox'),
		import('photoswipe/style.css'),
	]).then(([{ default: PhotoSwipeLightbox }]) => {
		const hayVideo = galerias.some((g) => g.querySelector('a[data-pswp-type="video"]'));

		for (const galeria of galerias) {
			const lightbox = new PhotoSwipeLightbox({
				gallery: galeria,
				children: 'a',
				pswpModule: () => import('photoswipe'),
			});

			if (hayVideo) {
				lightbox.addFilter('itemData', (itemData) => {
					const el = itemData.element;
					if (el?.dataset.pswpVideoPoster) {
						itemData.videoPoster = el.dataset.pswpVideoPoster;
					}
					return itemData;
				});

				lightbox.on('contentLoad', (e) => {
					const { content } = e;
					if (content.type !== 'video') return;

					e.preventDefault();

					const video = document.createElement('video');
					video.src = content.data.src;
					video.controls = true;
					video.playsInline = true;
					video.style.width = '100%';
					video.style.height = '100%';
					video.style.objectFit = 'contain';
					video.style.maxWidth = '100%';
					video.style.maxHeight = '100%';
					video.style.background = '#000';

					if (content.data.videoPoster) {
						video.poster = content.data.videoPoster;
					}

					content.element = video;
					content.onLoaded();
				});

				lightbox.on('contentAppend', (e) => {
					const { content } = e;
					if (content.type !== 'video') return;
					if (!content.element || content.element.parentNode) return;

					e.preventDefault();
					content.slide.container.appendChild(content.element);
				});

				lightbox.on('contentRemove', (e) => {
					const { content } = e;
					if (content.type !== 'video') return;
					if (!content.element || !content.element.parentNode) return;

					e.preventDefault();
					content.element.pause();
					content.element.remove();
				});
			}

			lightbox.init();
		}
	});
}
