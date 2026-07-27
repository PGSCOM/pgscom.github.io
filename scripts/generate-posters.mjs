// Genera una miniatura (.webp) para cada vídeo local que no tenga ya una al
// lado. Se ejecuta solo, antes de `dev`/`build` (ver package.json), así que
// los autores de contenido no tienen que generar ni subir un `poster` a mano
// (ver FORMATO.md): src/scripts/proyecto-video.js y proyecto-galeria.js
// derivan el poster del `src` cuando el <video> no trae uno explícito,
// asumiendo esta misma convención (mismo nombre, extensión .webp).
//
// ffmpeg extrae el frame en crudo (PNG por stdout, sin tocar disco) y Sharp
// —la misma librería que usa el propio pipeline de imágenes de Astro— lo
// redimensiona y codifica a webp. `getImage()`/`astro:assets` no se puede
// invocar desde aquí (solo funciona dentro del contexto de render de Astro,
// no en un script suelto ni en un plugin de compilación), así que esto es
// lo más cerca que se puede estar de "que lo optimice Astro" sin depender
// de un mecanismo interno no soportado.
//
// No pisa nunca un fichero que ya exista: si algún vídeo necesita una
// miniatura distinta, basta con poner ese fichero a mano y el script lo
// respeta.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';

const DIRS = ['public/proyvid', 'public/vid', 'public/videos'];
const VIDEO_EXT = new Set(['.mp4', '.webm']);
const ANCHO = 960; // mismo ancho que usan los posters ya optimizados por Astro (index.astro, ProyectoHero.astro)
const CALIDAD_WEBP = 80;

function listaDeVideos(dir) {
	if (!existsSync(dir)) return [];
	const resultado = [];
	for (const entrada of readdirSync(dir, { withFileTypes: true })) {
		const ruta = join(dir, entrada.name);
		if (entrada.isDirectory()) resultado.push(...listaDeVideos(ruta));
		else if (VIDEO_EXT.has(extname(entrada.name).toLowerCase())) resultado.push(ruta);
	}
	return resultado;
}

/** Extrae un frame del vídeo como PNG en memoria (sin fichero temporal). */
function extraerFrame(videoPath, ss) {
	return execFileSync(ffmpeg.path, [
		'-ss', ss, '-i', videoPath,
		'-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-',
	], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 50 * 1024 * 1024 });
}

async function generarPoster(videoPath, posterPath) {
	// -ss antes de -i: seek rápido (por keyframe). 1s es seguro para casi
	// todos los clips; si el vídeo dura menos, reintenta en el frame 0.
	for (const ss of ['00:00:01', '00:00:00']) {
		let png;
		try {
			png = extraerFrame(videoPath, ss);
		} catch {
			continue; // probar el siguiente ss
		}
		try {
			await sharp(png)
				.resize({ width: ANCHO, withoutEnlargement: true })
				.webp({ quality: CALIDAD_WEBP })
				.toFile(posterPath);
			return true;
		} catch {
			return false; // ffmpeg dio un frame pero Sharp no pudo codificarlo: no reintentar
		}
	}
	return false;
}

let generados = 0;
let fallidos = 0;

for (const dir of DIRS) {
	for (const video of listaDeVideos(dir)) {
		const poster = video.replace(/\.\w+$/, '.webp');
		if (existsSync(poster)) continue;

		const ok = await generarPoster(video, poster);
		if (ok) {
			generados++;
			console.log(`[posters] generado ${poster}`);
		} else {
			fallidos++;
			console.warn(`[posters] no se pudo generar miniatura para ${video} (¿vídeo corrupto?)`);
		}
	}
}

if (generados) console.log(`[posters] ${generados} miniatura(s) nueva(s).`);
if (fallidos) console.warn(`[posters] ${fallidos} vídeo(s) sin miniatura — se sirven sin poster.`);
if (!generados && !fallidos) console.log('[posters] nada que generar, todo al día.');
