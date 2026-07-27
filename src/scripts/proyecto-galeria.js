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

// Si el autor no puso `poster`, se deriva del propio vídeo: scripts/generate-posters.mjs
// genera un .webp con el mismo nombre junto a cada vídeo LOCAL antes de dev/build (ver
// FORMATO.md). No aplica a streams remotos.
function derivarPoster(src) {
	return /^https?:\/\//i.test(src) ? null : src.replace(/\.\w+$/, '.webp');
}

/** Crea el <a> que envuelve cada miniatura y que PhotoSwipe usa como item de la galería. */
function crearEnlace(href, ancho, alto) {
	const a = document.createElement('a');
	a.href = href;
	a.target = '_blank';
	a.rel = 'noopener';
	if (ancho) a.dataset.pswpWidth = ancho;
	if (alto) a.dataset.pswpHeight = alto;
	return a;
}

if (galerias.length > 0) {
	for (const galeria of galerias) {
		for (const img of galeria.querySelectorAll('img')) {
			const enlace = crearEnlace(img.currentSrc || img.src, img.getAttribute('width'), img.getAttribute('height'));
			img.replaceWith(enlace);
			enlace.appendChild(img);
		}

		for (const video of galeria.querySelectorAll('video')) {
			const src = video.getAttribute('src');
			if (!src) continue;

			// `videoWidth`/`videoHeight` valen 0 hasta que cargan los metadatos (y con
			// preload="none" nunca han cargado aquí), así que se usan los atributos
			// declarados en el <video> si existen; 1920x1080 es solo el último
			// recurso para clips sin dimensiones anotadas.
			const ancho = video.getAttribute('width') || video.videoWidth || 1920;
			const alto = video.getAttribute('height') || video.videoHeight || 1080;
			const enlace = crearEnlace(src, ancho, alto);
			enlace.dataset.pswpType = 'video';
			let poster = video.getAttribute('poster');
			if (!poster) {
				poster = derivarPoster(src);
				// También se aplica a la miniatura del grid, no solo al lightbox.
				if (poster) video.setAttribute('poster', poster);
			}
			if (poster) enlace.dataset.pswpVideoPoster = poster;

			// El lightbox construye un <video> nuevo en `contentLoad` (más abajo); esta
			// miniatura nunca se reproduce, así que no hace falta tocar sus atributos.
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

				// PhotoSwipe precarga (y añade al DOM) las diapositivas vecinas a la
				// activa, no solo la visible, así que `contentAppend` no implica que el
				// vídeo se vea: aquí solo lo insertamos. Reproducir/pausar se gestiona
				// en `contentActivate`/`contentDeactivate`, que sí reflejan qué
				// diapositiva es la que está realmente visible.
				lightbox.on('contentAppend', (e) => {
					const { content } = e;
					if (content.type !== 'video') return;
					if (!content.element || content.element.parentNode) return;

					e.preventDefault();
					content.slide.container.appendChild(content.element);
				});

				lightbox.on('contentActivate', (e) => {
					const { content } = e;
					if (content.type !== 'video' || !content.element) return;

					content.element.play().catch(() => {});
				});

				lightbox.on('contentDeactivate', (e) => {
					const { content } = e;
					if (content.type !== 'video' || !content.element) return;

					content.element.pause();
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
