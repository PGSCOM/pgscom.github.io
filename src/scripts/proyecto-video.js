import { esHLS, montarFuente } from './hls-media.js';

// Atributos del <video> original que se traspasan al reproductor. `controls`
// no se copia: el skin de Video.js aporta los suyos. Ver FORMATO.md §9.
const ATRIBUTOS_A_COPIAR = ['poster', 'autoplay', 'muted', 'loop', 'playsinline', 'preload'];

// Ajuste de hls.js para los vídeos del cuerpo. El buffer de lectura por
// delante por defecto de hls.js son 30 s: si el CDN entrega los segmentos con
// margen variable, ese margen tan justo provoca micro-cortes ("trabado") en
// VOD al vaciarse el buffer entre peticiones. Lo ampliamos para dar más
// colchón. El reproductor ya activa capLevelToPlayerSize y backBufferLength,
// así que aquí solo tocamos el buffer futuro. (PhotoSwipe/lightbox no entra
// aquí: esos vídeos los gestiona proyecto-galeria.js, no Video.js.)
const CONFIG_HLS = {
	hlsJs: { maxBufferLength: 60 },
};

// El skin minimal muestra controles y degradado también en pausa, no solo al
// hover (controlsFeature en @videojs/core: computeVisible = userActive ||
// media.paused), lo que se suma a nuestro icono de play central. Vive en el
// shadow root sin CSS var ni ::part(), así que solo se puede atenuar inyectando
// un <style> ahí dentro.
function atenuarDegradadoControles(skin) {
	if (!skin.shadowRoot) return;
	const estilo = document.createElement('style');
	estilo.textContent = `
		.media-overlay {
			background-image: linear-gradient(to top, oklch(0 0 0 / 0.55), oklch(0 0 0 / 0.32) 4rem, oklch(0 0 0 / 0) 5.5rem) !important;
		}
	`;
	skin.shadowRoot.appendChild(estilo);
}

/** URL del vídeo desde el atributo `src` o el primer `<source>` hijo. */
function resolverFuente(video) {
	const src = video.getAttribute('src');
	if (src) return src;
	return video.querySelector('source[src]')?.getAttribute('src') ?? null;
}

// Si el autor no puso `poster`, se deriva del propio vídeo: scripts/generate-posters.mjs
// genera un .webp con el mismo nombre junto a cada vídeo LOCAL antes de dev/build (ver
// FORMATO.md). No aplica a streams remotos (HLS ya traen su miniatura subida a mano).
function derivarPoster(src) {
	return /^https?:\/\//i.test(src) ? null : src.replace(/\.\w+$/, '.webp');
}

/** Reemplaza un `<video>` nativo por el reproductor Video.js (player > skin > media). */
function envolver(video) {
	try {
		const src = resolverFuente(video);
		if (!src) return;

		const esHls = esHLS(src);
		const media = document.createElement(esHls ? 'hlsjs-video' : 'video');
		media.setAttribute('slot', 'media');
		media.setAttribute('src', src);
		if (esHls) media.config = CONFIG_HLS;
		if (!video.hasAttribute('poster')) {
			const poster = derivarPoster(src);
			if (poster) video.setAttribute('poster', poster);
		}
		for (const attr of ATRIBUTOS_A_COPIAR) {
			if (video.hasAttribute(attr)) media.setAttribute(attr, video.getAttribute(attr));
		}

		const skin = document.createElement('video-minimal-skin');
		skin.appendChild(media);
		atenuarDegradadoControles(skin);

		const player = document.createElement('video-player');
		player.appendChild(skin);

		const contenedor = document.createElement('div');
		contenedor.className = 'pd-video';
		if (video.hasAttribute('style')) {
			contenedor.setAttribute('style', video.getAttribute('style'));
		}
		contenedor.appendChild(player);

		// Icono de play central propio del estado de pausa (el skin minimal no
		// trae uno de fábrica); el clic para alternar reproducción ya lo aporta
		// el <media-gesture> del skin, así que aquí solo reflejamos el estado.
		contenedor.classList.add('is-paused');
		media.addEventListener('play', () => contenedor.classList.remove('is-paused'));
		media.addEventListener('pause', () => contenedor.classList.add('is-paused'));

		video.replaceWith(contenedor);
	} catch (err) {
		console.error('[video] Error al envolver un vídeo:', err, video);
	}
}

// Este script se carga después del que convierte los h2[data-tab] en pestañas
// (ver [id].astro), así que el DOM de .pd-contenido ya está en su forma final.
// A diferencia de reproductores anteriores, no hace falta un MutationObserver
// para vídeos que "aparecen" al cambiar de pestaña: solo están ocultos con
// [hidden]. Se excluyen los <video> de las galerías (los gestiona el lightbox).
const videos = [...document.querySelectorAll('.pd-contenido video')]
	.filter((v) => !v.closest('.pd-galeria'));

if (videos.length > 0) {
	// Cada import se tolera por separado: si uno falla, los demás pueden seguir
	// cargándose (degradación graceful). Luego comprobamos que los custom
	// elements imprescindibles estén definidos antes de envolver nada.
	const cargas = [
		import('@videojs/html/video/player').catch(() => null),
		import('@videojs/html/video/minimal-skin').catch(() => null),
	];
	// El motor HLS es la parte más pesada: solo se descarga si hay alguna playlist HLS.
	if (videos.some((v) => esHLS(resolverFuente(v) ?? ''))) {
		cargas.push(import('@videojs/html/media/hlsjs-video').catch(() => null));
	}
	Promise.all(cargas).then(() => {
		if (!customElements.get('video-player') || !customElements.get('video-minimal-skin')) return;
		videos.forEach(envolver);
	});
}

// El trailer de cabecera es un <video> nativo con `data-src` (mp4/webm de
// respaldo, o HLS): se monta con el mismo helper que las tarjetas de la home,
// no con Video.js (no lleva controles). Nativo en Safari/iOS, hls.js en el
// resto.
const trailer = document.querySelector('.pd-hero-media[data-src]');
if (trailer) {
	montarFuente(trailer).then(() => trailer.play?.().catch(() => {}));
}
