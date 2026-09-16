import gsap from 'gsap';

// ── Grafo de aptitudes sobre el título "Proyectos" ────────────────────────
// Chips conectados al logo central por líneas, repartidos de forma orgánica
// (radio y ángulo propios por nodo, no un anillo perfecto) y con un vaivén
// leve y acotado (nunca una rotación rígida). Sin dependencia de física
// nueva: con N≤15 nodos, "repartidos sin solapar" sale de una relajación por
// pares — unas pocas iteraciones de trigonometría simple, no un simulador
// continuo que además convergería y se pararía (ver plan). Un solo bucle de
// rAF, compartido con el ticker de GSAP que ya conduce Lenis
// (src/scripts/smooth-scroll.js).
//
// Al abrir, el propio chip pulsado viaja hasta acoplarse como cabecera del
// panel (no una caja nueva y suelta en medio de la nada): la línea que ya lo
// unía al logo se queda como único trazo vivo, guiando el ojo hasta él. Al
// cerrar, vuelve a interpolar hacia su posición de reposo — que sigue en
// marcha por el vaivén — en vez de saltar a un punto fijo.

function initGrafo() {
	const grafo = document.getElementById('hab-grafo');
	const inner = document.getElementById('hab-grafo-inner');
	const svg = document.getElementById('hab-aristas');
	if (!grafo || !inner || !svg) return;

	const nodos = Array.from(inner.querySelectorAll('.hab-nodo'));
	const logo = inner.querySelector('.hab-centro');
	if (!nodos.length || !logo) return;

	const gHalo = svg.querySelector('.hab-aristas-halo');
	const gTrazo = svg.querySelector('.hab-aristas-trazo');
	const n = nodos.length;
	// El acoplado del chip al panel solo existe en escritorio, donde el panel
	// se superpone al anillo compartiendo su centro; en móvil el panel cae
	// como tarjeta debajo (grid-template-areas en habilidades.css) y no hay
	// nada a lo que anclarse.
	const overlayMQ = window.matchMedia('(min-width: 1025px)');
	// El panel llega a 320px de alto (260 entre 1025-1200px, ver habilidades.css)
	// — el hueco reservado tiene que ser al menos eso, o el chip acoplado
	// asomaría por encima del propio contenedor.
	const estrechoMQ = window.matchMedia('(max-width: 1200px)');

	// Halo desenfocado (sin flecha, enturbiaría el trazo) + trazo nítido con
	// flecha a mitad de camino — vocabulario de .ruta-linea, con dirección.
	const NS = 'http://www.w3.org/2000/svg';
	const halos = nodos.map(() => {
		const l = document.createElementNS(NS, 'line');
		gHalo.append(l);
		return l;
	});
	const trazos = nodos.map(() => {
		const l = document.createElementNS(NS, 'polyline');
		l.setAttribute('marker-mid', 'url(#hab-flecha)');
		gTrazo.append(l);
		return l;
	});

	// Vaivén acotado: oscilación seno con fase y periodo propios por nodo
	// (mismo patrón que la flotación orgánica de src/scripts/hero.js), leve
	// deriva angular compartida. ampA nunca supera 1/5 del hueco angular
	// medio entre nodos, así que el vaivén por sí solo nunca los junta.
	const ampA = Math.min(0.06, ((Math.PI * 2) / n) * 0.18);
	const osc = nodos.map(() => ({
		a: 0, r: 0, // posición de reposo — la calcula y relaja el ResizeObserver
		fa: Math.random() * Math.PI * 2, pa: 5.5 + Math.random() * 3,
		fr: Math.random() * Math.PI * 2, pr: 7 + Math.random() * 4,
	}));

	// Posición "viva" alrededor del reposo (a, r) de un nodo en el instante t
	// — la misma fórmula la usan tick() (rama por defecto) y soltar() (el
	// objetivo en marcha al que hay que llegar sin saltos).
	function posicionReposo(o, t) {
		const a = o.a + t * 0.012 + Math.sin((t / o.pa) * Math.PI * 2 + o.fa) * ampA;
		const r = o.r + Math.sin((t / o.pr) * Math.PI * 2 + o.fr) * (o.r * 0.035);
		return { x: Math.cos(a) * r, y: Math.sin(a) * r };
	}

	let cx = 0, cy = 0, r0 = 0;
	const t0 = performance.now();

	// El chip abierto (acoplado y quieto) y el que está en tránsito (viajando
	// hacia el panel o de vuelta a su reposo) no siguen la fórmula del
	// vaivén: su posición la lleva un gsap.to propio; tick() se limita a leerla.
	let abierto = null;
	let animando = null;

	function tick() {
		if (!osc[0].r) return;
		const t = (performance.now() - t0) / 1000;
		nodos.forEach((nodo, i) => {
			const o = osc[i];
			let x, y;
			if (nodo === abierto || nodo === animando) {
				x = gsap.getProperty(nodo, 'x');
				y = gsap.getProperty(nodo, 'y');
			} else {
				({ x, y } = posicionReposo(o, t));
				gsap.set(nodo, { x, y });
			}
			// El extremo junto al logo usa el ángulo de reposo (a): con ampA tan
			// pequeño la diferencia con el ángulo oscilante es invisible, y así
			// vale igual para el nodo en tránsito, que ya no tiene un ángulo vivo.
			const x1 = cx + Math.cos(o.a) * r0, y1 = cy + Math.sin(o.a) * r0;
			const x2 = cx + x, y2 = cy + y;
			const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
			halos[i].setAttribute('x1', x1); halos[i].setAttribute('y1', y1);
			halos[i].setAttribute('x2', x2); halos[i].setAttribute('y2', y2);
			trazos[i].setAttribute('points', `${x1},${y1} ${mx},${my} ${x2},${y2}`);
		});
	}

	// content-visibility:auto deja la sección sin maquetar hasta que se acerca
	// al viewport (la órbita vieja medía al parsear el módulo y podía salir con
	// radio negativo). ResizeObserver solo dispara con medidas reales, así que
	// sustituye a la vez a esa medición inicial y al listener de resize.
	let listo = false;
	let anchoPrevio = 0;
	new ResizeObserver(([entry]) => {
		const { width: w } = entry.contentRect;
		if (!w) return;
		// La altura la fijamos nosotros mismos más abajo: sin este guard el
		// observer se re-dispararía en bucle sobre su propia escritura.
		if (w === anchoPrevio) return;
		anchoPrevio = w;
		if (!listo) {
			listo = true;
			gsap.set(nodos, { xPercent: -50, yPercent: -50 });
			gsap.set(logo, { xPercent: -50, yPercent: -50 });
			inner.classList.add('listo');
		}
		const wChip = Math.max(...nodos.map((el) => el.offsetWidth));
		const hChip = Math.max(...nodos.map((el) => el.offsetHeight));
		const radioColision = Math.hypot(wChip, hChip) / 2 + 10;
		r0 = logo.offsetWidth / 2 + 10;

		// Reparto orgánico: ángulo base uniforme + jitter, radio propio entre
		// 0.6× y 1.4× de un nominal calibrado para que incluso el más lejano
		// quepa en el ancho real del contenedor.
		const Rlogo = logo.offsetWidth / 2 + radioColision;
		const Rmax = w / 2 - wChip / 2 - 4;
		const Rbase = Math.min(Rmax / 1.4, Math.max(Rlogo * 1.15, Rmax * 0.6));
		osc.forEach((o) => {
			o.a = Math.random() * Math.PI * 2;
			o.r = Math.min(Rmax, Math.max(Rlogo, Rbase * (0.6 + Math.random() * 0.8)));
		});

		// Relajación anti-solape: empuja cada par demasiado cerca a lo largo de
		// la línea que los une, y vuelve a fijar cada nodo a [Rlogo, Rmax] en
		// cada pasada. ~24 iteraciones bastan de sobra con n≤15.
		for (let iter = 0; iter < 24; iter++) {
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					const oi = osc[i], oj = osc[j];
					const xi = Math.cos(oi.a) * oi.r, yi = Math.sin(oi.a) * oi.r;
					const xj = Math.cos(oj.a) * oj.r, yj = Math.sin(oj.a) * oj.r;
					const dx = xj - xi, dy = yj - yi;
					const dist = Math.hypot(dx, dy) || 0.001;
					const minDist = radioColision * 2;
					if (dist >= minDist) continue;
					const empuje = (minDist - dist) / 2;
					const ux = dx / dist, uy = dy / dist;
					const nxi = xi - ux * empuje, nyi = yi - uy * empuje;
					const nxj = xj + ux * empuje, nyj = yj + uy * empuje;
					oi.a = Math.atan2(nyi, nxi); oi.r = Math.hypot(nxi, nyi);
					oj.a = Math.atan2(nyj, nxj); oj.r = Math.hypot(nxj, nyj);
				}
			}
			osc.forEach((o) => { o.r = Math.min(Rmax, Math.max(Rlogo, o.r)); });
		}

		const Rmax2 = Math.max(...osc.map((o) => o.r));
		const panelMaxH = overlayMQ.matches ? (estrechoMQ.matches ? 260 : 320) : 0;
		const mitad = Math.max(Rmax2 + hChip / 2, panelMaxH / 2 + hChip / 2 + 12) + 5;
		const alto = 2 * mitad + 10;
		inner.style.height = `${alto}px`;
		cx = w / 2; cy = alto / 2;
		svg.setAttribute('viewBox', `0 0 ${w} ${alto}`);
		tick();
	}).observe(inner);

	// Solo anima mientras el grafo está en (o cerca de) el viewport
	new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
			grafo.classList.add('visible');
			gsap.ticker.add(tick);
		} else {
			gsap.ticker.remove(tick);
		}
	}, { rootMargin: '10% 0px' }).observe(grafo);

	// Suelta un chip de vuelta a su reposo — que sigue en marcha por el
	// vaivén — interpolando hacia él en cada frame en vez de animar a un
	// punto fijo: si no, el último frame del tween y el primero de tick()
	// no coincidirían y se vería un salto.
	function soltar(nodo) {
		animando = nodo;
		const o = osc[nodos.indexOf(nodo)];
		const inicio = { x: gsap.getProperty(nodo, 'x'), y: gsap.getProperty(nodo, 'y') };
		const estado = { p: 0 };
		gsap.to(estado, {
			p: 1, duration: 0.45, ease: 'power2.inOut',
			onUpdate: () => {
				const t = (performance.now() - t0) / 1000;
				const destino = posicionReposo(o, t);
				gsap.set(nodo, {
					x: gsap.utils.interpolate(inicio.x, destino.x, estado.p),
					y: gsap.utils.interpolate(inicio.y, destino.y, estado.p),
				});
			},
			onComplete: () => { if (animando === nodo) animando = null; },
		});
	}

	function seleccionar(btn) {
		const previo = abierto;
		abierto = btn && btn !== previo ? btn : null;
		grafo.classList.toggle('abierto', Boolean(abierto));

		halos.forEach((l) => l.classList.remove('hab-arista-activa', 'hab-arista-dim'));
		trazos.forEach((l) => l.classList.remove('hab-arista-activa', 'hab-arista-dim'));

		if (previo) {
			previo.setAttribute('aria-expanded', 'false');
			document.getElementById(previo.getAttribute('aria-controls')).hidden = true;
			if (overlayMQ.matches) soltar(previo);
		}
		if (!abierto) return;

		abierto.setAttribute('aria-expanded', 'true');
		const doc = document.getElementById(abierto.getAttribute('aria-controls'));
		doc.hidden = false;

		const i = nodos.indexOf(abierto);
		nodos.forEach((_, j) => {
			const cls = j === i ? 'hab-arista-activa' : 'hab-arista-dim';
			halos[j].classList.add(cls);
			trazos[j].classList.add(cls);
		});

		// El chip viaja y se acopla al borde superior del panel — pasa a hacer
		// de cabecera suya, en vez de dejar una caja sin relación con nada.
		if (overlayMQ.matches) {
			animando = abierto;
			const dockY = -(doc.offsetHeight / 2) - (abierto.offsetHeight / 2) + 6;
			gsap.to(abierto, {
				x: 0, y: dockY, duration: 0.5, ease: 'power2.out',
				onComplete: () => { if (animando === abierto) animando = null; },
			});
		}
	}
	grafo.addEventListener('click', (e) => {
		const btn = e.target.closest('button.hab-nodo');
		if (btn) return seleccionar(btn);
		if (!e.target.closest('.hab-doc')) seleccionar(null);
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') seleccionar(null);
	});
}

// Astro emite este bloque como <script type="module">, ya diferido por el
// navegador: se ejecuta tras parsear el HTML, sin esperar a DOMContentLoaded.
initGrafo();
