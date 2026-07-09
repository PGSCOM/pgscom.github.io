import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Durante los dos primeros viewports de scroll, el logo enmascara un vídeo que se
// escala hasta llenar la pantalla mientras el vídeo avanza al ritmo del scroll
// (scrub). Al completar el zoom se pasa a un vídeo de intro y luego a una
// playlist en bucle, con doble búfer para que el corte entre vídeos no se note.

function init() {
	const logoEl = document.querySelector('#logoanimar');
	const maskEl = document.querySelector('.galaxiamask');
	const videoA = document.querySelector('#video-galaxia-a');
	const videoB = document.querySelector('#video-galaxia-b');

	if (!logoEl || !maskEl || !videoA || !videoB) return;

	gsap.config({ force3D: true });

	// Timeline del zoom: el logo crece y la máscara se abre con él
	const tl = gsap.timeline({ paused: true });
	tl.fromTo(logoEl,
		{ scale: 1, y: 0 },
		{
			scale: 25, y: 45, duration: 1, ease: 'power2.in',
			onUpdate() {
				const p = this.progress();
				const s = 33 * (1 + 24 * p * p * p) - 8;
				maskEl.style.webkitMaskSize = `${s}vh ${s}vh`;
				maskEl.style.maskSize = `${s}vh ${s}vh`;
			}
		}, 1)
	.to(logoEl, { opacity: 0, duration: 0.001, ease: 'none' }, 1.8);

	const VIDEO_SCRUB = '/vid/empezar_scroll.mp4';
	const VIDEO_INTRO = 'https://pgscom.github.io/webvid/empezar.mp4';
	const PLAYLIST    = ['https://pgscom.github.io/webvid/loopinversed.mp4', 'https://pgscom.github.io/webvid/loop.mp4'];

	// El zoom ocupa el tramo [1s, 2s] de la timeline y recorre los 2s del vídeo
	const ZOOM_START_S     = 1;
	const ZOOM_END_S       = 2;
	const SCRUB_DURATION_S = 2;

	let playlistIndex    = 0;
	let afterZoomStarted = false;

	let activeVideo = videoA;
	let bufferVideo = videoB;
	let activeReady = false; // metadatos del vídeo de scrub disponibles
	let nextReady   = null;  // promesa de la precarga del búfer

	// Scrub: como mucho un seek por frame, y nunca antes de tener metadatos
	let pendingScrubT = null;
	let scrubRafId    = 0;

	function applyScrub() {
		scrubRafId = 0;
		if (pendingScrubT == null || !activeReady) return;
		const t = pendingScrubT;
		pendingScrubT = null;
		try {
			if (Math.abs((activeVideo.currentTime || 0) - t) < 0.02) return;
			if (typeof activeVideo.fastSeek === 'function') activeVideo.fastSeek(t);
			else activeVideo.currentTime = t;
		} catch {}
	}

	function scheduleScrub(t) {
		pendingScrubT = t;
		if (!scrubRafId) scrubRafId = requestAnimationFrame(applyScrub);
	}

	// Resuelve con metadatos o con error: una carga fallida no cuelga la cadena
	function waitForMetadata(el) {
		return new Promise(resolve => {
			if ((el.readyState >= 1 && !isNaN(el.duration)) || el.error) { resolve(); return; }
			el.addEventListener('loadedmetadata', resolve, { once: true });
			el.addEventListener('error', resolve, { once: true });
		});
	}

	async function setVideoSource(el, src, startTime = 0, autoplay = false) {
		try {
			el.loop = false;
			if (el.src !== location.origin + src && el.src !== src) el.src = src;
			el.load();
			await waitForMetadata(el);

			const t = Math.max(0, Math.min(startTime, el.duration || Infinity));
			if (!isNaN(t)) try { el.currentTime = t; } catch {}

			if (autoplay) try { await el.play(); } catch {}
			else el.pause();
		} catch {}
	}

	async function prepareNext(src) {
		await setVideoSource(bufferVideo, src, 0, false);
		// Forzar el buffering del primer frame para que el cambio sea instantáneo
		try { await bufferVideo.play(); bufferVideo.pause(); } catch {}
	}

	function attachEndedHandler() {
		activeVideo.onended = async () => {
			await swapToPreloaded();
			playlistIndex = (playlistIndex + 1) % PLAYLIST.length;
			nextReady = prepareNext(PLAYLIST[playlistIndex]);
		};
		bufferVideo.onended = null;
	}

	async function swapToPreloaded() {
		try { bufferVideo.currentTime = 0; } catch {}
		try { await bufferVideo.play(); } catch {}
		bufferVideo.style.opacity = '1';

		await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

		activeVideo.style.opacity = '0';
		try { activeVideo.pause(); } catch {}

		[activeVideo, bufferVideo] = [bufferVideo, activeVideo];
		attachEndedHandler();
	}

	// Tras el zoom: espera a que el vídeo de intro esté precargado y cambia.
	// Si su carga falló (sin red), se queda el último frame del scrub en vez
	// de cortar a negro.
	async function startAfterZoom() {
		if (afterZoomStarted) return;
		afterZoomStarted = true;

		pendingScrubT = null;
		if (scrubRafId) { cancelAnimationFrame(scrubRafId); scrubRafId = 0; }

		await nextReady;
		if (bufferVideo.error) return;

		await swapToPreloaded();
		nextReady = prepareNext(PLAYLIST[playlistIndex]);
	}

	// Señal para el preloader: se resuelve cuando el vídeo de scrub tiene
	// suficiente buffer para reproducirse sin cortes (o si falla su carga,
	// para no colgar la pantalla de carga).
	window.__galaxiaScrubReady = new Promise((resolve) => {
		function done() {
			window.__galaxiaScrubDone = true;
			window.dispatchEvent(new CustomEvent('galaxia-scrub-ready'));
			resolve();
		}
		if (activeVideo.readyState >= 3 || activeVideo.error) { done(); return; }
		activeVideo.addEventListener('canplaythrough', done, { once: true });
		activeVideo.addEventListener('error', done, { once: true });
	});

	// El vídeo de scrub se carga en el elemento activo; si llega tarde, aplica
	// el seek que hubiera quedado pendiente de scrolls anteriores
	setVideoSource(activeVideo, VIDEO_SCRUB, 0, false).then(() => {
		activeReady = true;
		if (pendingScrubT != null && !afterZoomStarted) scheduleScrub(pendingScrubT);
	});
	nextReady = prepareNext(VIDEO_INTRO);

	function onProgress(progress) {
		tl.progress(progress);

		if (afterZoomStarted) return;

		const seekTime = progress * tl.duration();
		if (seekTime < ZOOM_END_S) {
			const localP = Math.max(0, (seekTime - ZOOM_START_S) / (ZOOM_END_S - ZOOM_START_S));
			try { if (!activeVideo.paused) activeVideo.pause(); } catch {}
			scheduleScrub(localP * SCRUB_DURATION_S);
		} else {
			startAfterZoom();
		}
	}

	// ScrollTrigger (sincronizado con Lenis) en vez de un listener propio.
	// onRefresh cubre la posición inicial al cargar o redimensionar.
	ScrollTrigger.create({
		start: 0,
		end: () => window.innerHeight * 2,
		onUpdate: (self) => onProgress(self.progress),
		onRefresh: (self) => onProgress(self.progress),
	});
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
