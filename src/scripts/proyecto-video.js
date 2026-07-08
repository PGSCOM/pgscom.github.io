// Registra los custom elements de Video.js v10 (efecto lateral: customElements.define).
// Se usa el skin "minimal" (menos botones, más discreto).
// Ver https://videojs.org/docs/framework/html/concepts/overview
import '@videojs/html/video/player';
import '@videojs/html/video/minimal-skin';
import '@videojs/html/media/hls-video';

// Una URL que termina en .m3u8 (con o sin query/hash) es una playlist HLS.
const HLS_RE = /\.m3u8(?:[?#]|$)/i;

// Atributos del <video> del autor que se trasladan al elemento de medio real.
// "controls" se omite a propósito: video-skin siempre pone sus propios controles.
const ATRIBUTOS_A_COPIAR = ['poster', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'crossorigin'];

/**
 * El skin minimal muestra sus controles (y el degradado oscuro tras ellos)
 * mientras el vídeo está en pausa, no solo al pasar el ratón (ver
 * controlsFeature en @videojs/core: computeVisible = userActive || media.paused).
 * En reposo eso se suma al icono de play central que añadimos más abajo y
 * oscurece más vídeo del necesario. El degradado (.media-overlay) vive en el
 * shadow root del componente -abierto, pero sin CSS var ni ::part()-, así que
 * la única forma de atenuarlo es inyectar un <style> ahí dentro.
 */
function atenuarDegradadoControles(skin) {
	const estilo = document.createElement('style');
	estilo.textContent = `
		.media-overlay {
			background-image: linear-gradient(to top, oklch(0 0 0 / 0.55), oklch(0 0 0 / 0.32) 4rem, oklch(0 0 0 / 0) 5.5rem) !important;
		}
	`;
	skin.shadowRoot.appendChild(estilo);
}

/** Obtiene la URL del vídeo desde el atributo src o el primer <source> hijo */
function resolverFuente(video) {
	const src = video.getAttribute('src');
	if (src) return src;
	return video.querySelector('source[src]')?.getAttribute('src') ?? null;
}

/**
 * Sustituye un <video> escrito a mano en el markdown por la estructura de
 * Video.js v10 (<video-player><video-skin><video|hls-video slot="media">).
 * MP4 y cualquier otro formato usan el <video> nativo; los .m3u8 usan el
 * <hls-video> de Video.js (hls.js por debajo).
 */
function envolver(video) {
	const src = resolverFuente(video);
	if (!src) return;

	const media = document.createElement(HLS_RE.test(src) ? 'hls-video' : 'video');
	media.setAttribute('slot', 'media');
	media.setAttribute('src', src);
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
	contenedor.appendChild(player);

	// El skin "minimal" no trae gestos de clic ni icono de play central
	// (a diferencia del skin completo). Se añaden aquí a mano: clic en el
	// vídeo alterna reproducción, y una clase CSS muestra/oculta el icono.
	contenedor.classList.add('is-paused');
	media.addEventListener('click', () => {
		if (media.paused) media.play();
		else media.pause();
	});
	media.addEventListener('play', () => contenedor.classList.remove('is-paused'));
	media.addEventListener('pause', () => contenedor.classList.add('is-paused'));

	video.replaceWith(contenedor);
}

// Este script se carga después del que convierte los h2[data-tab] en pestañas
// (ver [id].astro), así que el DOM de .pd-contenido ya está en su forma final
// -a diferencia de Plyr, no hace falta un MutationObserver para vídeos que
// "aparecen" al cambiar de pestaña: solo están ocultos con [hidden].
document.querySelectorAll('.pd-contenido video').forEach(envolver);
