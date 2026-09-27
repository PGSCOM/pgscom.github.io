// Monta la fuente correcta en un <video> con `data-src` (o `src`): nativo si
// el navegador puede reproducirlo (mp4/webm, o HLS en Safari/iOS), hls.js en
// el resto (Chrome/Firefox/Brave/Edge, que no tienen decodificador HLS nativo).
// hls.js se importa dinámicamente y solo cuando hace falta: Vite deduplica el
// módulo con la copia que ya usa Video.js en los vídeos del cuerpo de la ficha.

// Una URL que termina en .m3u8 (con o sin query/hash) es una playlist HLS.
const HLS_RE = /\.m3u8(?:[?#]|$)/i;

export function esHLS(src) {
	return HLS_RE.test(src);
}

// Cloudflare Pages ignora `Range` (siempre 200 con el fichero entero): Chrome
// no deja hacer seek en un mp4 servido así y Safari/iOS no lo reproduce.
// Por eso cada mp4 local tiene su HLS generado en el build
// (scripts/generate-hls.mjs, mismas carpetas que esta expresión).
const MP4_LOCAL_RE = /^\/(proyvid|videos)\/(.+)\.mp4$/i;

/**
 * URL del HLS generado para un mp4 local; cualquier otra URL, sin cambios.
 * Acepta rutas (`/proyvid/...`) y URLs absolutas del propio sitio (PhotoSwipe
 * pasa el `href` ya resuelto).
 */
export function aHLS(src) {
	const url = new URL(src, location.href);
	if (url.origin !== location.origin || !MP4_LOCAL_RE.test(url.pathname)) return src;
	return url.pathname.replace(MP4_LOCAL_RE, '/hls/$1/$2/index.m3u8');
}

// Para clips cortos que necesitan seek fino (scrub, comparadores
// sincronizados), el HLS no sirve: se descargan enteros como blob, que admite
// seek en cualquier navegador sea cual sea el servidor. Uno por URL,
// reutilizado. Si la descarga falla se devuelve la URL tal cual y el <video>
// gestiona su propio error.
const blobs = new Map();
export function blobUrl(src) {
	if (!blobs.has(src)) {
		blobs.set(src, fetch(src)
			.then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
			.then((b) => URL.createObjectURL(b))
			.catch(() => src));
	}
	return blobs.get(src);
}

/** Asigna la fuente a un <video> (data-src o src), eligiendo nativo o hls.js. Idempotente. */
export async function montarFuente(video) {
	if (video.dataset.montado) return;
	const original = video.dataset.src ?? video.getAttribute('src');
	if (!original) return;
	const src = aHLS(original);
	video.dataset.montado = 'true';

	if (esHLS(src) && !video.canPlayType('application/vnd.apple.mpegurl')) {
		const { default: Hls } = await import('hls.js');
		if (!video.dataset.montado) return; // desmontado mientras llegaba hls.js
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(video);
			video._hls = hls;
			return;
		}
	}
	video.src = src;
}

/** Deshace montarFuente(): sin destroy(), hls.js sigue descargando segmentos. */
export function desmontarFuente(video) {
	if (!video.dataset.montado) return;
	delete video.dataset.montado;
	video._hls?.destroy();
	delete video._hls;
	video.removeAttribute('src');
	video.load();
}
