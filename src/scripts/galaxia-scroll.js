import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function init() {
	const targetEl    = document.querySelector('.image-container');
	const logoEl      = document.querySelector('#logoanimar');
	const maskEl      = document.querySelector('.galaxiamask');
	const videoA      = document.querySelector('#video-galaxia-a');
	const videoB      = document.querySelector('#video-galaxia-b');

	if (!targetEl || !logoEl || !maskEl || !videoA || !videoB) return;

	const isMobile = window.matchMedia('(max-width: 768px)').matches;

	const tl = gsap.timeline({ paused: true });
	gsap.config({ force3D: true });

	tl.fromTo(targetEl,
		{ opacity: 1, scale: 1 },
		{ opacity: 0, scale: 0.8, duration: isMobile ? 0.311 : 0.8, ease: 'power2.out', force3D: true }, 0)
	.fromTo(logoEl,
		{ scale: 1, y: 0 },
		{
			scale: 25, y: 45, duration: 1, ease: 'power2.in', force3D: true,
			onUpdate() {
				const p = this.progress();
				const scale = 1 + 24 * p * p * p;
				const s = 34 * scale - 8;
				maskEl.style.webkitMaskSize = `${s}vh ${s}vh`;
				maskEl.style.maskSize = `${s}vh ${s}vh`;
			}
		}, 1)
	.to(logoEl, { opacity: 0, duration: 0.001, ease: 'none' }, 1.8);

	const VIDEO_SCROLL     = '/vid/empezar_scroll.mp4';
	const VIDEO_INTRO_FULL = 'https://pgscom.github.io/webvid/empezar.mp4';
	const PLAYLIST         = ['https://pgscom.github.io/webvid/loopinversed.mp4', 'https://pgscom.github.io/webvid/loop.mp4'];

	const ZOOM_START_S  = 1;
	const ZOOM_END_S    = 2;
	const SCRUB_DURATION_S = 2;

	let playlistIndex          = 0;
	let isScrollScrubActive    = true;
	let afterZoomStarted       = false;
	let activeMetadataReady    = false;

	let activeVideo = videoA;
	let bufferVideo = videoB;

	let pendingScrubT = null;
	let scrubRafId    = 0;

	function applyScrub() {
		scrubRafId = 0;
		if (pendingScrubT == null || !activeMetadataReady) return;
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

	function waitForMetadata(el) {
		return new Promise(resolve => {
			if (el.readyState >= 1 && !isNaN(el.duration)) { resolve(); return; }
			el.addEventListener('loadedmetadata', resolve, { once: true });
		});
	}

	async function setVideoSource(el, src, startTime = 0, autoplay = false) {
		try {
			el.loop = false;
			if (el.src !== location.origin + src && el.src !== src) el.src = src;
			el.load();
			await waitForMetadata(el);
			if (el === activeVideo) activeMetadataReady = true;

			const t = Math.max(0, Math.min(startTime, el.duration || Infinity));
			if (!isNaN(t)) try { el.currentTime = t; } catch {}

			if (autoplay) try { await el.play(); } catch {}
			else el.pause();
		} catch {}
	}

	async function prepareNext(src, startTime = 0) {
		await setVideoSource(bufferVideo, src, startTime, false);
		try { await bufferVideo.play(); bufferVideo.pause(); } catch {}
	}

	function attachEndedHandler() {
		activeVideo.onended = async () => {
			await swapToPreloaded();
			playlistIndex = (playlistIndex + 1) % PLAYLIST.length;
			prepareNext(PLAYLIST[playlistIndex], 0);
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

	setVideoSource(activeVideo, VIDEO_SCROLL, 0, false);
	prepareNext(VIDEO_INTRO_FULL, 0);

	function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

	function onScroll() {
		const scrollY   = window.scrollY || document.documentElement.scrollTop;
		const progress  = clamp(scrollY / (2 * window.innerHeight), 0, 1);
		const seekTime  = progress * tl.duration();

		tl.progress(progress);

		if (!isScrollScrubActive) return;

		if (seekTime <= ZOOM_START_S) {
			try { if (!activeVideo.paused) activeVideo.pause(); } catch {}
			scheduleScrub(0);
		} else if (seekTime < ZOOM_END_S) {
			const localP = (seekTime - ZOOM_START_S) / (ZOOM_END_S - ZOOM_START_S);
			try { if (!activeVideo.paused) activeVideo.pause(); } catch {}
			scheduleScrub(localP * SCRUB_DURATION_S);
		} else if (!afterZoomStarted && activeMetadataReady) {
			afterZoomStarted    = true;
			isScrollScrubActive = false;

			pendingScrubT = null;
			if (scrubRafId) { cancelAnimationFrame(scrubRafId); scrubRafId = 0; }

			swapToPreloaded().then(() => prepareNext(PLAYLIST[playlistIndex], 0));
		}
	}

	onScroll();

	let rafPending = false;
	window.addEventListener('scroll', () => {
		if (!rafPending) {
			rafPending = true;
			requestAnimationFrame(() => { onScroll(); rafPending = false; });
		}
	}, { passive: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
