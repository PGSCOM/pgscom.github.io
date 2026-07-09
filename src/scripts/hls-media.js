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

/** Asigna la fuente a un <video> (data-src o src), eligiendo nativo o hls.js. Idempotente. */
export async function montarFuente(video) {
	if (video.dataset.montado) return;
	const src = video.dataset.src ?? video.getAttribute('src');
	if (!src) return;
	video.dataset.montado = 'true';

	if (esHLS(src) && !video.canPlayType('application/vnd.apple.mpegurl')) {
		const { default: Hls } = await import('hls.js');
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
