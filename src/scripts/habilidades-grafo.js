import gsap from 'gsap';
import lenis from './smooth-scroll.js';

// ── Constelaciones de aptitudes sobre el título "Proyectos" ───────────────
// Cada habilidad es una estrella (un punto con destellos) con su chip de
// icono y nombre pegado al lado, y cada categoría una constelación. Cruza el
// cielo un horizonte que pasa por el logo: sobre él van las habilidades que
// domino (progress 100); las que estoy aprendiendo cuelgan por encima o por
// debajo, más lejos cuanto menos llevo. Cada categoría tiene su columna, sus
// estrellas unidas por el árbol de líneas más corto que parte de su alfa (la
// de más progreso, la más brillante), como en una carta celeste, y su nombre
// cerca. Un pulso de luz sale de cada alfa y recorre su árbol hacia fuera,
// tramo a tramo.
//
// El reparto es una búsqueda con semilla fija (el cielo sale igual en cada
// visita): cada estrella prueba posiciones al azar dentro de su columna y se
// queda con la que cae a buena distancia de su constelación sin pisar
// ninguna otra etiqueta ni el logo. Si no cabe, el cielo crece y se vuelve a
// repartir, así que no hay solapes haya 5 habilidades o 60. Un vaivén de
// pocos píxeles (menor que la mitad del hueco entre cajas) las mantiene
// vivas sin juntarlas nunca. Un solo bucle de rAF, compartido con el ticker
// de GSAP que ya conduce Lenis (src/scripts/smooth-scroll.js).
//
// Al abrir, la propia estrella pulsada viaja hasta acoplarse como cabecera
// del panel; al cerrar, vuelve a interpolar hacia su posición de reposo —
// que sigue en marcha por el vaivén— en vez de saltar a un punto fijo.

// PRNG pequeño con semilla (mulberry32): mismo cielo en cada carga
function azar(semilla) {
	return () => {
		semilla = (semilla + 0x6d2b79f5) | 0;
		let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function initGrafo() {
	const grafo = document.getElementById('hab-grafo');
	const inner = document.getElementById('hab-grafo-inner');
	const svg = document.getElementById('hab-aristas');
	if (!grafo || !inner || !svg) return;

	const nodos = Array.from(inner.querySelectorAll('.hab-nodo'));
	const logo = inner.querySelector('.hab-centro');
	if (!nodos.length || !logo) return;

	// El acoplado de la estrella al panel solo existe en escritorio, donde el
	// panel se superpone al cielo compartiendo su centro; en móvil el panel
	// cae como tarjeta debajo (grid-template-areas en habilidades.css) y no
	// hay nada a lo que anclarse.
	const overlayMQ = window.matchMedia('(min-width: 1025px)');
	// El panel llega a 320px de alto (260 entre 1025-1200px, ver habilidades.css)
	// — el hueco reservado tiene que ser al menos eso, o la estrella acoplada
	// asomaría por encima del propio contenedor.
	const estrechoMQ = window.matchMedia('(max-width: 1200px)');
	// ≤768px no hay cielo: las tarjetas van en rejilla por categoría (CSS) y el
	// panel se abre debajo de la fila de la tarjeta pulsada, no al final.
	const rejillaMQ = window.matchMedia('(max-width: 768px)');
	const docs = grafo.querySelector('.hab-docs');

	// Hueco mínimo entre cajas; el vaivén nunca pasa de AMP < HUECO/2. Con
	// "reducir movimiento", y en móvil (táctil o ≤1024px), el cielo se queda
	// quieto: mover 35 nodos, sus líneas y la máscara en cada frame ahoga la
	// CPU de un teléfono, y 2px de deriva en esa pantalla ni se ven. Misma
	// media query que apaga los destellos en habilidades.css.
	const HUECO = 8;
	// Aire entre etiquetas al repartir: con solo HUECO el cielo se lee como un
	// bloque apelotonado.
	const AIRE = 24;
	const AMP = window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 1024px), (pointer: coarse)').matches ? 0 : 3;
	// Separación entre estrellas de una misma constelación: nunca menos de
	// DMIN (la línea que las une tiene que verse), idealmente unos IDEAL px.
	const DMIN = 58;
	const IDEAL = 96;
	// La línea se queda a esta distancia del centro de cada estrella
	const CORTE = 9;
	// Lo que tarda el pulso de luz en recorrer cada tramo (ver .hab-pulso)
	const PASO = 0.7;

	// Cuánto domino cada habilidad (0–100): marca a qué distancia de la línea va
	const progreso = nodos.map((n) => Number(n.dataset.progreso ?? 100));
	// Orden de colocación: primero las más dominadas (se quedan el sitio en la
	// línea), a igualdad, el de `orden` con que llegan los nodos.
	const porProgreso = [...nodos.keys()].sort((a, b) => progreso[b] - progreso[a] || a - b);

	// ── Constelaciones: una por categoría, en el orden en que aparecen. Su
	// alfa es la estrella con más progreso.
	const grupos = [];
	const grupoDe = nodos.map((nodo, i) => {
		const cat = nodo.dataset.cat ?? '';
		let g = grupos.find((x) => x.cat === cat);
		if (!g) {
			g = { cat, miembros: [], nombre: null };
			grupos.push(g);
			if (nodo.dataset.catTitulo) {
				g.nombre = document.createElement('span');
				g.nombre.className = 'hab-constelacion';
				g.nombre.textContent = nodo.dataset.catTitulo;
				g.nombre.setAttribute('aria-hidden', 'true');
				g.nombre.style.setProperty('--cat-color', nodo.style.getPropertyValue('--cat-color'));
				inner.append(g.nombre);
			}
		}
		g.miembros.push(i);
		// Cada estrella titila a su ritmo
		nodo.style.setProperty('--titilar', `${3.5 + Math.random() * 3}s`);
		nodo.style.setProperty('--retardo', `${-Math.random() * 6}s`);
		return g;
	});
	for (const g of grupos) nodos[porProgreso.find((i) => grupoDe[i] === g)].classList.add('hab-nodo--alfa');

	// Reposo de cada estrella (bx, by), lado de su etiqueta (izq), medidas
	// de su nodo (ancho, so: de su borde izquierdo al centro de la estrella)
	// y desplazamiento vigente de la estrella al borde izquierdo de la caja
	// (ox); lo calcula repartir().
	const est = nodos.map(() => ({
		bx: 0, by: 0, izq: false, ancho: 0, so: 0, ox: 0,
		fx: Math.random() * Math.PI * 2, px: 6 + Math.random() * 4,
		fy: Math.random() * Math.PI * 2, py: 7 + Math.random() * 5,
	}));

	// Posición "viva" de la estrella alrededor de su reposo en el instante t —
	// la misma fórmula la usan dibujar() (rama por defecto) y soltar() (el
	// objetivo en marcha al que hay que llegar sin saltos).
	function posicionReposo(o, t) {
		return {
			x: o.bx + Math.sin((t / o.px) * Math.PI * 2 + o.fx) * AMP * 0.7,
			y: o.by + Math.sin((t / o.py) * Math.PI * 2 + o.fy) * AMP * 0.7,
		};
	}

	let cx = 0, cy = 0;
	let trazos = [];
	// Hueco de cada etiqueta en la máscara de las líneas (ver repartir())
	let huecos = [];
	let capasGuia = [];
	const t0 = performance.now();
	let listo = false;

	// La estrella abierta (acoplada y quieta) y la que está en tránsito no
	// siguen la fórmula del vaivén: su posición la lleva un gsap.to propio;
	// dibujar() se limita a leerla.
	let abierto = null;
	let animando = null;

	const pos = nodos.map(() => ({ x: 0, y: 0 }));
	// gsap.set crea un tween por llamada: en dibujar(), 35 por frame. Los
	// quickSetter escriben la misma caché de transform sin crear nada.
	const mover = nodos.map((n) => ({ x: gsap.quickSetter(n, 'x', 'px'), y: gsap.quickSetter(n, 'y', 'px') }));

	// Con el cielo quieto (AMP 0) el ticker solo redibuja mientras una estrella
	// viaja; el resto de veces se llama a dibujar() a mano (al maquetar y al
	// acabar cada viaje).
	const tick = () => { if (AMP || animando) dibujar(); };

	function dibujar() {
		if (!listo) return;
		const t = (performance.now() - t0) / 1000;
		nodos.forEach((nodo, i) => {
			if (nodo === abierto || nodo === animando) {
				pos[i].x = gsap.getProperty(nodo, 'x') - est[i].ox;
				pos[i].y = gsap.getProperty(nodo, 'y');
			} else {
				pos[i] = posicionReposo(est[i], t);
				mover[i].x(pos[i].x + est[i].ox);
				mover[i].y(pos[i].y);
			}
		});
		huecos.forEach(({ i, el }) => {
			const { lab, ox } = est[i];
			el.setAttribute('x', cx + pos[i].x + ox + lab.l - 3);
			el.setAttribute('y', cy + pos[i].y - est[i].alto / 2 + lab.t - 3);
		});
		trazos.forEach(({ a, b, lineas }) => {
			const dx = pos[b].x - pos[a].x, dy = pos[b].y - pos[a].y;
			const d = Math.hypot(dx, dy) || 1;
			const k = Math.min(CORTE / d, 0.5);
			for (const l of lineas) {
				l.setAttribute('x1', cx + pos[a].x + dx * k); l.setAttribute('y1', cy + pos[a].y + dy * k);
				l.setAttribute('x2', cx + pos[b].x - dx * k); l.setAttribute('y2', cy + pos[b].y - dy * k);
			}
		});
	}

	// Gira el chip al otro lado de su estrella sin mover la estrella
	function orientar(i, izq) {
		const o = est[i];
		const x = gsap.getProperty(nodos[i], 'x') - o.ox;
		nodos[i].classList.toggle('hab-nodo--izq', izq);
		o.ox = izq ? -(o.ancho - o.so) : -o.so;
		medirEtiqueta(i);
		gsap.set(nodos[i], { x: x + o.ox });
	}

	// Posición del chip dentro de su nodo (cambia con el lado)
	function medirEtiqueta(i) {
		const e = nodos[i].querySelector('.hab-nodo-placa');
		est[i].lab = { l: e.offsetLeft, t: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight };
	}

	// Caja del nodo si su estrella está en (x, y), con el chip a la derecha
	// (izq = false) o a la izquierda.
	function caja(m, x, y, izq) {
		const l = izq ? x - (m.ancho - m.so) : x - m.so;
		return { l, r: l + m.ancho, t: y - m.alto / 2, b: y + m.alto / 2 };
	}
	const pisa = (a, b, h) => a.l < b.r + h && b.l < a.r + h && a.t < b.b + h && b.t < a.b + h;
	// ¿El segmento A–B atraviesa la caja k (agrandada m px)? Recorte de
	// Liang–Barsky: se estrecha el tramo [t0, t1] contra cada lado.
	function corta(A, B, k, m) {
		const dx = B.x - A.x, dy = B.y - A.y;
		let t0 = 0, t1 = 1;
		for (const [p, q] of [[-dx, A.x - k.l + m], [dx, k.r + m - A.x], [-dy, A.y - k.t + m], [dy, k.b + m - A.y]]) {
			if (p === 0) { if (q < 0) return false; continue; }
			const r = q / p;
			if (p < 0) { if (r > t1) return false; t0 = Math.max(t0, r); }
			else { if (r < t0) return false; t1 = Math.min(t1, r); }
		}
		return true;
	}

	function repartir(w) {
		const med = nodos.map((el) => {
			const e = el.querySelector('.hab-estrella');
			el.classList.remove('hab-nodo--izq');
			return { ancho: el.offsetWidth, alto: el.offsetHeight, so: e.offsetLeft + e.offsetWidth / 2 };
		});
		const n = nodos.length;
		const logoR = logo.offsetWidth / 2 + 6;
		const zonaLogo = { l: -logoR, r: logoR, t: -logoR, b: logoR };
		const rMin = logoR + 34;
		const topeX = w / 2 - 4 - AMP;
		// Tamaño del cielo: el área de todas las cajas con holgura (esto es un
		// cielo, no un puzle apretado), repartida a lo ancho: rMax es su media
		// altura. En pantallas estrechas no puede ensancharse, así que cada píxel
		// de holgura se paga en scroll: ahí va más apretado.
		const holgura = w < 1000 ? 1.6 : 2.2;
		const area = med.reduce((s, m) => s + (m.ancho + AIRE) * (m.alto + AIRE), 0) * holgura;
		let rMax = Math.max(rMin + 120, (1.4 * area) / (4 * topeX));
		// Estiramiento horizontal con que se busca sitio a los nombres
		const sx = Math.min(2.4, Math.max(0.55, topeX / Math.sqrt(area / Math.PI + rMin * rMin)));

		// Columna de cada constelación: como poco tan ancha como lo que domina
		// puesto en fila sobre la línea, y el resto del ancho repartido por
		// número de estrellas.
		const enFila = grupos.map((g) => g.miembros.reduce((s, i) => s + (progreso[i] >= 100 ? med[i].ancho + AIRE : 0), 0));
		const sobra = Math.max(0, 2 * topeX - enFila.reduce((s, v) => s + v, 0));
		let xCol = -topeX;
		grupos.forEach((g, gi) => {
			g.x0 = xCol; xCol += enFila[gi] + (sobra * g.miembros.length) / n; g.x1 = xCol;
		});

		// Distancia a la línea a la que aspira lo que estoy aprendiendo (0 lo
		// más cerca, 1 lo más lejos). Con raíz: lo proporcional a lo que le
		// falta es el área que queda entre ella y la línea, no la distancia; si
		// no, las muchas que rondan el 75–90% se amontonarían junto a la línea.
		const pObra = progreso.filter((p) => p < 100);
		const oMax = Math.max(...pObra), oMin = Math.min(...pObra);
		const lejania = (i) => (progreso[i] >= 100 ? 0 : oMax === oMin ? 0.5 : Math.sqrt((oMax - progreso[i]) / (oMax - oMin)));

		let puestos;
		for (let intento = 0; ; intento++) {
			const rnd = azar(0x5eed + n);
			puestos = new Array(n);
			const cajas = [zonaLogo];
			// Líneas ya trazadas (aprox.: cada estrella a su vecina más cercana
			// de la constelación), para no tachar etiquetas con ellas.
			const lineas = [];
			const propiosDe = new Map(grupos.map((g) => [g, []]));
			let cabe = true;
			for (const i of porProgreso) {
				const g = grupoDe[i], propios = propiosDe.get(g);
				// Franja de distancias a la línea a la que puede ir la estrella. En
				// pantallas estrechas lo que domino no cabe en una sola fila sobre
				// la línea: con cada intento puede separarse un poco más.
				const [lo, hi] = progreso[i] >= 100 ? [0, 3 + 30 * intento] : [90, rMax];
				const yObj = lo + (hi - lo) * (0.05 + 0.9 * lejania(i));
				// La alfa (la primera de su constelación en colocarse) apunta al
				// centro de su columna, arriba o abajo según la columna; las demás
				// crecen desde ella.
				const objetivo = { x: (g.x0 + g.x1) / 2, y: (grupos.indexOf(g) % 2 ? 1 : -1) * yObj };
				let mejor = null;
				for (let c = 0; c < 160; c++) {
					// Lo que domino, por toda la línea (dos de una misma categoría no
					// caben en el ancho de su columna); la puntuación ya lo acerca a
					// ella.
					const [c0, c1] = progreso[i] >= 100 ? [-topeX, topeX] : [g.x0, g.x1];
					const x0 = c0 + (c1 - c0) * (0.05 + 0.9 * rnd());
					const y = (rnd() < 0.5 ? -1 : 1) * (lo + (hi - lo) * rnd());
					for (const izq of [false, true]) {
						// Si el chip se sale por un lado, la estrella se desliza hacia
						// dentro en vez de descartar el sitio: si no, en pantallas
						// estrechas las columnas de los bordes casi no tendrían hueco
						// y el cielo crecería sin llegar a caber.
						const k0 = caja(med[i], x0, y, izq);
						const x = x0 + Math.max(0, -topeX - k0.l) - Math.max(0, k0.r - topeX);
						const k = x === x0 ? k0 : caja(med[i], x, y, izq);
						if (k.l < -topeX || k.r > topeX) continue; // chip más ancho que el cielo
						if (cajas.some((o) => pisa(k, o, AIRE))) continue;
						let puntos;
						let padre = null;
						if (propios.length) {
							let dmin = Infinity, gx = 0, gy = 0;
							for (const p of propios) {
								const d = Math.hypot(p.x - x, p.y - y);
								if (d < dmin) { dmin = d; padre = p; }
								gx += p.x; gy += p.y;
							}
							if (dmin < DMIN) continue;
							gx /= propios.length; gy /= propios.length;
							// La distancia a la línea manda: una estrella poco dominada
							// se va lejos aunque la línea hasta su vecina quede larga.
							puntos = Math.abs(dmin - IDEAL) + 0.2 * Math.hypot(x - gx, y - gy) + 3 * Math.abs(Math.abs(y) - yObj);
						} else {
							puntos = Math.hypot(x - objetivo.x, y - objetivo.y);
						}
						let p = puntos + (izq ? 10 : 0);
						if (mejor && p >= mejor.p) continue;
						// Cada etiqueta tachada por una línea (la suya nueva sobre
						// otras, o las ya trazadas sobre la suya) cuesta mucho.
						const yo = { x, y };
						if (padre) for (const o of cajas) if (o !== padre.k && corta(padre, yo, o, 6)) p += 250;
						for (const [A, B] of lineas) if (corta(A, B, k, 6)) p += 250;
						if (!mejor || p < mejor.p) mejor = { x, y, izq, k, p, padre };
					}
				}
				if (!mejor) { cabe = false; break; }
				puestos[i] = mejor;
				propios.push(mejor);
				cajas.push(mejor.k);
				if (mejor.padre) lineas.push([mejor.padre, mejor]);
			}
			if (cabe) break;
			rMax *= 1.12;
			// ponytail: tras 40 crecimientos (×90 de alto) algo va muy mal;
			// antes que un bucle infinito, se aceptan solapes.
			if (intento > 40) {
				puestos = Array.from(puestos, (p) => p ?? { x: 0, y: rMax, izq: false, k: caja(med[0], 0, rMax, false) });
				break;
			}
		}

		// Líneas: por cada constelación, el árbol más corto que une sus
		// estrellas partiendo de su alfa (Prim). Cada tramo va de padre a hijo y
		// guarda su profundidad, que marca cuándo pasa el pulso.
		const P = (j) => puestos[j];
		const aristas = [];
		for (const g of grupos) {
			const raiz = porProgreso.find((i) => grupoDe[i] === g);
			const dentro = [raiz];
			const fuera = g.miembros.filter((i) => i !== raiz);
			const prof = { [raiz]: -1 };
			while (fuera.length) {
				let mejor = null;
				for (const p of dentro) {
					for (const [k, q] of fuera.entries()) {
						// Un tramo que tacharía una etiqueta ajena, solo si no hay otro
						const d = Math.hypot(P(p).x - P(q).x, P(p).y - P(q).y)
							+ (puestos.some((o, j) => j !== p && j !== q && corta(P(p), P(q), o.k, 4)) ? 1e4 : 0);
						if (!mejor || d < mejor.d) mejor = { p, q, k, d };
					}
				}
				prof[mejor.q] = prof[mejor.p] + 1;
				aristas.push([mejor.p, mejor.q, prof[mejor.q]]);
				dentro.push(mejor.q);
				fuera.splice(mejor.k, 1);
			}
		}
		// ¿Alguna línea atraviesa la caja k? Muestreo cada 6px (de sobra para
		// cajas de más de 12px de alto), sin contar los primeros 26px junto a
		// cada estrella: ahí la línea nace, dentro de la caja de su propio nodo
		// (medio alto de caja + margen), y eso no es tachar nada.
		const cruzaLinea = (k, m = 4) => aristas.some(([a, b]) => {
			const A = P(a), B = P(b);
			const d = Math.hypot(B.x - A.x, B.y - A.y);
			for (let j = 26; j <= d - 26; j += 6) {
				const x = A.x + ((B.x - A.x) * j) / d, y = A.y + ((B.y - A.y) * j) / d;
				if (x > k.l - m && x < k.r + m && y > k.t - m && y < k.b + m) return true;
			}
			return false;
		});

		// Si una línea tacha la etiqueta de una estrella, se pasa al otro lado
		// siempre que allí quepa y quede limpia.
		puestos.forEach((p, i) => {
			if (!cruzaLinea(p.k)) return;
			const k = caja(med[i], p.x, p.y, !p.izq);
			if (k.l < -topeX || k.r > topeX || cruzaLinea(k)) return;
			if (puestos.some((q, j) => j !== i && pisa(k, q.k, HUECO)) || pisa(k, zonaLogo, HUECO)) return;
			p.izq = !p.izq;
			p.k = k;
		});

		nodos.forEach((el, i) => {
			const p = puestos[i], o = est[i];
			Object.assign(o, { bx: p.x, by: p.y, izq: p.izq, ancho: med[i].ancho, alto: med[i].alto, so: med[i].so });
			el.classList.toggle('hab-nodo--izq', p.izq);
			o.ox = p.izq ? -(o.ancho - o.so) : -o.so;
			medirEtiqueta(i);
		});

		nebulosas(aristas);

		// Las líneas van bajo una máscara con un hueco por cada etiqueta: donde
		// una línea no ha podido esquivar un nombre, pasa por detrás de él en
		// vez de tacharlo, como en una carta celeste impresa.
		const NS = 'http://www.w3.org/2000/svg';
		const crear = (tag, attrs) => {
			const el = document.createElementNS(NS, tag);
			for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
			return el;
		};
		const mascara = crear('mask', { id: 'hab-mascara', maskUnits: 'userSpaceOnUse', x: -1e4, y: -1e4, width: 2e4, height: 2e4 });
		mascara.append(crear('rect', { x: -1e4, y: -1e4, width: 2e4, height: 2e4, fill: '#fff' }));
		huecos = nodos.map((_, i) => {
			const el = crear('rect', { width: est[i].lab.w + 6, height: est[i].lab.h + 6, rx: 14, fill: '#000' });
			mascara.append(el);
			return { i, el };
		});
		const capa = crear('g', { mask: 'url(#hab-mascara)' });
		svg.replaceChildren(crear('defs', {}), capa);
		svg.firstChild.append(mascara);
		// El horizonte (en coordenadas del cielo: maquetar() lo lleva al centro)
		// y su rótulo, fuera de la máscara, con su propio hueco en ella.
		const guias = crear('g', {}), huecosGuias = crear('g', {}), rotulos = crear('g', {});
		capa.append(guias);
		mascara.append(huecosGuias);
		svg.append(rotulos);
		capasGuia = [guias, huecosGuias, rotulos];
		guias.append(crear('line', { class: 'hab-guia', x1: -topeX, x2: topeX, y1: 0, y2: 0 }));
		const cruzaGuia = (k, m = 8) => k.t < m && k.b > -m;
		// Cada tramo: su línea y, encima, el pulso que la recorre (pathLength 1:
		// el guion del pulso mide lo mismo en proporción, sea el tramo largo o
		// corto).
		trazos = aristas.map(([a, b, prof]) => {
			const el = crear('g', { class: 'hab-arista' });
			el.style.setProperty('--cat-color', nodos[b].style.getPropertyValue('--cat-color'));
			el.style.setProperty('--retraso', `${prof * PASO}s`);
			const lineas = [crear('line', { class: 'hab-trazo' }), crear('line', { class: 'hab-pulso', pathLength: 1 })];
			el.append(...lineas);
			capa.append(el);
			return { a, b, el, lineas };
		});

		// Nombre de cada constelación: lo más cerca posible de su centro, en el
		// primer hueco que no pise ninguna estrella ni la cruce ninguna línea;
		// si no cabe, no se pinta.
		const ocupadas = [zonaLogo, ...puestos.map((p) => p.k)];
		for (const g of grupos) {
			if (!g.nombre) continue;
			const ps = g.miembros.map((i) => puestos[i]);
			const gx = ps.reduce((s, p) => s + p.x, 0) / ps.length;
			const gy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
			g.nombre.hidden = false;
			const hw = g.nombre.offsetWidth / 2, hh = g.nombre.offsetHeight / 2;
			let sitio = null;
			for (let d = 0; d <= 300 && !sitio; d += 15) {
				for (let s = 0; s < 16 && !sitio; s++) {
					const x = gx + Math.cos((s / 16) * Math.PI * 2) * d * sx;
					const y = gy + Math.sin((s / 16) * Math.PI * 2) * d;
					const k = { l: x - hw, r: x + hw, t: y - hh, b: y + hh };
					if (k.l < -topeX || k.r > topeX) continue;
					// Doble hueco: el nombre flota en su constelación, no pegado a una estrella
					// y ninguna línea rozándolo: a menos de 12px parece tacharlo
					if (!ocupadas.some((o) => pisa(k, o, 2 * HUECO)) && !cruzaLinea(k, 12) && !cruzaGuia(k)) sitio = { x, y, k };
				}
			}
			g.nombre.hidden = !sitio;
			if (!sitio) continue;
			ocupadas.push(sitio.k);
			gsap.set(g.nombre, { x: sitio.x, y: sitio.y });
		}

		// Rótulo del horizonte: sobre la propia línea (que se corta a su paso),
		// en el primer hueco libre desde la izquierda.
		const rotulo = crear('text', { class: 'hab-guia-texto', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
		rotulo.textContent = 'Domino';
		rotulos.append(rotulo);
		const hw = rotulo.getComputedTextLength() / 2 + 6, hh = 8;
		const libre = Array.from({ length: 60 }, (_, s) => -topeX + 40 + s * 20)
			.map((x) => ({ x, k: { l: x - hw, r: x + hw, t: -hh, b: hh } }))
			.find(({ k }) => k.r <= topeX && !ocupadas.some((o) => pisa(k, o, 6)) && !cruzaLinea(k, 4));
		if (libre) {
			rotulo.setAttribute('x', libre.x);
			rotulo.setAttribute('y', 0);
			huecosGuias.append(crear('rect', { x: libre.k.l, y: -hh, width: 2 * hw, height: 2 * hh, fill: '#000' }));
			ocupadas.push(libre.k);
		} else rotulo.remove();

		let arriba = 0, abajo = 0;
		for (const o of ocupadas) { arriba = Math.max(arriba, -o.t); abajo = Math.max(abajo, o.b); }
		return { arriba, abajo, altoNodo: Math.max(...med.map((m) => m.alto)) };
	}

	// Nebulosa de cada constelación: la silueta de sus estrellas, chips y
	// líneas difuminada en una bruma de su color, con grano para que el
	// degradado no se escalone. Un <svg> por constelación, pintado una vez
	// por reparto: su opacidad (reposo, resaltada, atenuada) la anima el
	// compositor sin volver a pasar el filtro. Se queda en el reposo de cada
	// estrella; el vaivén de 2px no se nota en una bruma de 30px de radio.
	function nebulosas(aristas) {
		const capa = document.getElementById('hab-nebulosas');
		if (!capa) return;
		const P = (j) => ({ x: est[j].bx, y: est[j].by });
		const n = (v) => v.toFixed(1);
		capa.replaceChildren();
		grupos.forEach((g, gi) => {
			// Mismo tono que su categoría, pero con la luz igualada: si no, la
			// de un color oscuro (Audiovisual) apenas se vería junto a las
			// claras. Las categorías sin color propio (el gris neutro de
			// index.astro) toman un verde azulado que no repite ningún tono.
			const cat = nodos[g.miembros[0]].style.getPropertyValue('--cat-color').trim();
			const color = cat === '#9bb4d0' ? 'hsl(172 45% 55%)' : `hsl(from ${cat} h clamp(40, s, 75) 58)`;
			let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
			const formas = g.miembros.map((i) => {
				const o = est[i];
				const x = o.bx + o.ox + o.lab.l - 18, y = o.by - o.alto / 2 + o.lab.t - 18;
				const w = o.lab.w + 36, h = o.lab.h + 36;
				l = Math.min(l, x, o.bx - 50); r = Math.max(r, x + w, o.bx + 50);
				t = Math.min(t, y, o.by - 50); b = Math.max(b, y + h, o.by + 50);
				return `<circle cx="${n(o.bx)}" cy="${n(o.by)}" r="50"/><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="32"/>`;
			});
			const puentes = aristas
				.filter(([, bb]) => grupoDe[bb] === g)
				.map(([a, bb]) => `<line x1="${n(P(a).x)}" y1="${n(P(a).y)}" x2="${n(P(bb).x)}" y2="${n(P(bb).y)}"/>`);
			// Margen del filtro: 3σ del desenfoque, para que la bruma se apague
			// entera antes del borde de su región y no quede cortada en seco.
			const m = 3 * 34;
			const id = `hab-bruma-${gi}`;
			const el = document.createElement('div');
			el.className = 'hab-nebulosa';
			el.innerHTML = `<svg width="1" height="1" overflow="visible">
				<filter id="${id}" filterUnits="userSpaceOnUse" x="${n(l - m)}" y="${n(t - m)}" width="${n(r - l + 2 * m)}" height="${n(b - t + 2 * m)}" color-interpolation-filters="sRGB">
					<feGaussianBlur stdDeviation="34" result="bruma"/>
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${gi + 3}"/>
					<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.7 0 0 0 0.45"/>
					<feComposite in="bruma" operator="in"/>
				</filter>
				<g filter="url(#${id})" style="fill: ${color}; stroke: ${color}">${formas.join('')}<g stroke-width="64" stroke-linecap="round">${puentes.join('')}</g></g>
			</svg>`;
			capa.append(el);
			g.nebulosa = el;
		});
	}

	// content-visibility:auto deja la sección sin maquetar hasta que se acerca
	// al viewport. ResizeObserver solo dispara con medidas reales, así que
	// sustituye a la vez a una medición inicial y al listener de resize.
	let anchoPrevio = 0;
	function maquetar(w) {
		if (rejillaMQ.matches) {
			// De vuelta a la rejilla (al estrechar la ventana): fuera las
			// posiciones y el lado que les dio el cielo; el resto es CSS.
			if (listo) {
				listo = false;
				inner.classList.remove('listo');
				inner.style.height = '';
				nodos.forEach((n) => n.classList.remove('hab-nodo--izq'));
				gsap.set([...nodos, logo], { clearProps: 'transform' });
			}
			return;
		}
		if (!listo) {
			listo = true;
			gsap.set(nodos, { xPercent: 0, yPercent: -50 });
			gsap.set([logo, ...grupos.flatMap((g) => g.nombre ?? [])], { xPercent: -50, yPercent: -50 });
			inner.classList.add('listo');
		}
		const { arriba, abajo, altoNodo } = repartir(w);
		// Con el panel superpuesto (escritorio), centrado sobre el logo, el cielo
		// es simétrico y le deja sitio. Sin superposición cada mitad mide lo que
		// ocupa: sin cola vacía bajo la constelación más corta.
		let sobre = arriba + AMP + 6, bajo = abajo + AMP + 6;
		if (overlayMQ.matches) {
			const panelMaxH = estrechoMQ.matches ? 260 : 320;
			sobre = bajo = Math.max(Math.max(arriba, abajo) + AMP, panelMaxH / 2 + altoNodo + 8) + 6;
		}
		const alto = sobre + bajo;
		inner.style.height = `${alto}px`;
		inner.style.setProperty('--centro-y', `${sobre}px`);
		cx = w / 2; cy = sobre;
		for (const el of capasGuia) el.setAttribute('transform', `translate(${cx} ${cy})`);
		svg.setAttribute('viewBox', `0 0 ${w} ${alto}`);
		dibujar();
	}
	new ResizeObserver(([entry]) => {
		const { width: w } = entry.contentRect;
		// La altura la fijamos nosotros mismos: sin este guard el observer se
		// re-dispararía en bucle sobre su propia escritura.
		if (!w || w === anchoPrevio) return;
		anchoPrevio = w;
		maquetar(w);
	}).observe(inner);
	// Las etiquetas se miden con la fuente real: si Chakra Petch llega después
	// del primer reparto, las cajas cambian de ancho y hay que repartir otra vez.
	document.fonts?.ready.then(() => { if (anchoPrevio) maquetar(anchoPrevio); });

	// Solo anima mientras el grafo está en (o cerca de) el viewport
	new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
			grafo.classList.add('visible');
			gsap.ticker.add(tick);
		} else {
			gsap.ticker.remove(tick);
		}
	}, { rootMargin: '10% 0px' }).observe(grafo);

	// Al pasar por una estrella se enciende su constelación entera
	function resaltar(g) {
		trazos.forEach(({ b, el }) => el.classList.toggle('hab-arista-grupo', grupoDe[b] === g));
		grupos.forEach((x) => {
			x.nombre?.classList.toggle('activa', x === g);
			x.nebulosa?.classList.toggle('activa', x === g);
		});
	}
	const alPasar = (e) => {
		const nodo = e.target.closest?.('.hab-nodo');
		resaltar(nodo ? grupoDe[nodos.indexOf(nodo)] : null);
	};
	inner.addEventListener('pointerover', alPasar);
	inner.addEventListener('focusin', alPasar);
	inner.addEventListener('pointerleave', () => resaltar(null));
	inner.addEventListener('focusout', () => resaltar(null));

	// Suelta una estrella de vuelta a su reposo — que sigue en marcha por el
	// vaivén — interpolando hacia él en cada frame en vez de animar a un
	// punto fijo: si no, el último frame del tween y el primero de dibujar()
	// no coincidirían y se vería un salto.
	function soltar(nodo) {
		animando = nodo;
		const i = nodos.indexOf(nodo);
		orientar(i, est[i].izq);
		const inicio = { x: gsap.getProperty(nodo, 'x'), y: gsap.getProperty(nodo, 'y') };
		const estado = { p: 0 };
		gsap.to(estado, {
			p: 1, duration: 0.45, ease: 'power2.inOut',
			onUpdate: () => {
				const t = (performance.now() - t0) / 1000;
				const destino = posicionReposo(est[i], t);
				gsap.set(nodo, {
					x: gsap.utils.interpolate(inicio.x, destino.x + est[i].ox, estado.p),
					y: gsap.utils.interpolate(inicio.y, destino.y, estado.p),
				});
			},
			onComplete: () => { if (animando === nodo) animando = null; dibujar(); },
		});
	}

	function seleccionar(btn) {
		const previo = abierto;
		abierto = btn && btn !== previo ? btn : null;
		grafo.classList.toggle('abierto', Boolean(abierto));

		trazos.forEach(({ el }) => el.classList.remove('hab-arista-activa', 'hab-arista-dim'));
		const gAbierto = abierto && grupoDe[nodos.indexOf(abierto)];
		grupos.forEach((g) => g.nebulosa?.classList.toggle('abierta', g === gAbierto));

		if (previo) {
			previo.setAttribute('aria-expanded', 'false');
			const docPrevio = document.getElementById(previo.getAttribute('aria-controls'));
			docPrevio.hidden = true;
			// En la rejilla se movió junto a su tarjeta: vuelve a su sitio
			docs.append(docPrevio);
			if (overlayMQ.matches && listo) soltar(previo);
		}
		if (!abierto) return;

		abierto.setAttribute('aria-expanded', 'true');
		const doc = document.getElementById(abierto.getAttribute('aria-controls'));
		if (rejillaMQ.matches) {
			// Tras la última tarjeta de su fila, a todo el ancho de la rejilla
			let fin = abierto;
			for (let s = abierto.nextElementSibling; s?.classList.contains('hab-nodo') && s.offsetTop === abierto.offsetTop; s = s.nextElementSibling) fin = s;
			fin.after(doc);
		}
		doc.hidden = false;

		const i = nodos.indexOf(abierto);
		trazos.forEach(({ a, b, el }) => {
			el.classList.add(a === i || b === i ? 'hab-arista-activa' : 'hab-arista-dim');
		});

		// En la rejilla, tarjeta y panel a la vista (abrir otra cierra la
		// anterior, y lo que había encima puede encoger); 80px libres abajo, ahí
		// flota la barra de navegación inferior.
		if (rejillaMQ.matches) {
			const t = abierto.getBoundingClientRect(), d = doc.getBoundingClientRect();
			if (t.top < 24 || d.bottom > window.innerHeight - 80) {
				lenis.scrollTo(abierto, { offset: -Math.max(24, window.innerHeight - 80 - (d.bottom - t.top)) });
			}
		// Sin superposición el panel cae debajo del cielo, que puede ser más
		// alto que la pantalla: si queda fuera de la vista, se lleva hasta ella.
		} else if (!overlayMQ.matches && doc.getBoundingClientRect().bottom > window.innerHeight) {
			// 80px libres abajo: ahí flota la barra de navegación inferior
			lenis.scrollTo(doc, { offset: -Math.max(24, window.innerHeight - doc.offsetHeight - 80) });
		}

		// La estrella viaja y se acopla sobre el borde superior del panel —
		// pasa a hacer de cabecera suya, en vez de dejar una caja sin relación
		// con nada.
		if (overlayMQ.matches) {
			animando = abierto;
			// Como cabecera, siempre estrella + nombre en orden de lectura
			orientar(i, false);
			const dockY = -(doc.offsetHeight / 2) - (abierto.offsetHeight / 2) + 6;
			// Se centra el chip sobre el panel, no el nodo entero: la estrella
			// queda asomando a su izquierda.
			const { lab } = est[i];
			gsap.to(abierto, {
				x: -(lab.l + lab.w / 2), y: dockY, duration: 0.5, ease: 'power2.out',
				onComplete: () => { if (animando === abierto) animando = null; dibujar(); },
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
	// Al cruzar el corte de la rejilla el panel abierto se queda sin sitio
	rejillaMQ.addEventListener('change', () => seleccionar(null));
}

// Astro emite este bloque como <script type="module">, ya diferido por el
// navegador: se ejecuta tras parsear el HTML, sin esperar a DOMContentLoaded.
initGrafo();
