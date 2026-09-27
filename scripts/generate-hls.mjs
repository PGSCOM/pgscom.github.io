// Genera un HLS (playlist + segmentos fMP4) para cada .mp4 local, en
// public/hls/<ruta del vídeo sin .mp4>/index.m3u8 (ignorado por git).
//
// Por qué: Cloudflare Pages ignora las cabeceras `Range` (siempre responde 200
// con el fichero entero). Con un mp4 servido así, Chrome no deja hacer seek y
// Safari/iOS directamente no lo reproduce. Un HLS son ficheros pequeños que
// se piden enteros, así que funciona en cualquier servidor, igual que los
// streams remotos de pgscom-media-web.pages.dev. Los reproductores traducen
// la URL del mp4 a la de su HLS con aHLS() (src/scripts/hls-media.js): el
// autor sigue escribiendo `src="/proyvid/....mp4"`.
//
// Solo reempaqueta (-c copy), no recodifica: tarda milisegundos por vídeo y la
// calidad no cambia. Contrapartida: los segmentos solo pueden cortarse en los
// keyframes que ya tiene el mp4, así que un clip corto con un solo keyframe
// queda en un solo segmento (se descarga entero antes de verse, como antes).
//
// Se llama desde astro.config.mjs al arrancar `dev` y `build`, sea cual sea
// el comando que los lance. Un vídeo que no se pueda convertir tumba el build
// en vez de publicar una ficha con el vídeo roto.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

// Mismas carpetas que la expresión de aHLS() en src/scripts/hls-media.js.
const DIRS = ['public/proyvid', 'public/videos'];
const SALIDA = 'public/hls';

function listaDeMp4(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.mp4'))
		.map((e) => join(e.parentPath, e.name));
}

/** Al día si existe, está completa (ENDLIST) y es posterior al mp4. */
function alDia(mp4, playlist) {
	return existsSync(playlist)
		&& statSync(playlist).mtimeMs >= statSync(mp4).mtimeMs
		&& readFileSync(playlist, 'utf8').includes('#EXT-X-ENDLIST');
}

export default function generarHLS() {
	let generados = 0;
	for (const mp4 of DIRS.flatMap(listaDeMp4)) {
		const destino = join(SALIDA, relative('public', mp4).replace(/\.mp4$/i, ''));
		const playlist = join(destino, 'index.m3u8');
		if (alDia(mp4, playlist)) continue;

		rmSync(destino, { recursive: true, force: true });
		mkdirSync(destino, { recursive: true });
		execFileSync(ffmpeg.path, [
			'-loglevel', 'error', '-i', mp4, '-c', 'copy',
			'-f', 'hls', '-hls_time', '2', '-hls_playlist_type', 'vod', '-hls_segment_type', 'fmp4',
			'-hls_segment_filename', join(destino, 'seg_%03d.m4s'), playlist,
		], { stdio: ['ignore', 'ignore', 'pipe'] });
		generados++;
	}
	if (generados) console.log(`[hls] ${generados} vídeo(s) convertido(s) a HLS.`);
}
