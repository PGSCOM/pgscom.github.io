// Índice lateral del micrositio de Multiguerras: scroll-spy que resalta el
// capítulo activo durante el scroll continuo (no son pestañas, todas las
// secciones están montadas a la vez), acordeones con los subtítulos (H2) de
// cada capítulo y scroll suave + hash al hacer clic en cualquier ítem.
const indice = document.querySelector('#mg-indice');
const secciones = Array.from(document.querySelectorAll('.mg-capitulo'));

if (indice && secciones.length) {
	const enlaces = new Map(
		Array.from(indice.querySelectorAll('.mg-indice-item')).map((a) => [a.dataset.slug, a]),
	);
	const grupos = new Map(
		Array.from(enlaces, ([slug, a]) => [slug, a.closest('.mg-indice-grupo')]),
	);

	// Subtítulos del acordeón. Los slugs de H2 se repiten entre capítulos
	// ("Organización" existe en varios), así que cada enlace se resuelve
	// buscando el heading DENTRO de su sección, nunca con getElementById.
	const subenlaces = new Map(); // elemento heading -> <a> del acordeón
	indice.querySelectorAll('.mg-indice-subitem').forEach((a) => {
		const seccion = document.getElementById(a.dataset.capitulo);
		const heading = seccion?.querySelector(`[id="${a.dataset.heading}"]`);
		if (heading) subenlaces.set(heading, a);
	});

	function abrirGrupo(slug) {
		grupos.forEach((grupo, s) => {
			if (!grupo) return;
			const abierta = s === slug;
			grupo.classList.toggle('abierta', abierta);
			const boton = grupo.querySelector('.mg-indice-toggle');
			if (boton) boton.setAttribute('aria-expanded', String(abierta));
		});
	}

	function marcarActivo(slug) {
		enlaces.forEach((a, s) => a.classList.toggle('act', s === slug));
		// Acordeón: solo el capítulo activo queda desplegado, y los subtítulos
		// marcados de otros capítulos se limpian.
		abrirGrupo(slug);
		subenlaces.forEach((a) => {
			if (a.dataset.capitulo !== slug) a.classList.remove('act');
		});
	}

	function marcarSubActivo(enlace) {
		subenlaces.forEach((a) => a.classList.toggle('act', a === enlace));
	}

	// Clic en el índice → scroll suave que atraviesa capítulos intermedios;
	// sin este bloqueo, el scroll-spy los iría resaltando de paso. Se libera
	// con `scrollend`, o por el timeout si el destino ya estaba a la vista y
	// ese evento nunca llega.
	let spyBloqueado = false;
	let bloqueoTimer;
	function bloquearSpy() {
		spyBloqueado = true;
		clearTimeout(bloqueoTimer);
		bloqueoTimer = setTimeout(() => { spyBloqueado = false; }, 1200);
	}
	window.addEventListener('scrollend', () => {
		clearTimeout(bloqueoTimer);
		spyBloqueado = false;
	});

	// El capítulo cuenta como "activo" en cuanto cruza una franja cercana a
	// la parte superior del viewport, no solo cuando está totalmente visible.
	const opcionesObserver = {
		rootMargin: '-15% 0px -70% 0px',
		threshold: 0,
	};

	const observer = new IntersectionObserver((entries) => {
		if (spyBloqueado) return;
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				marcarActivo(entry.target.id);
			}
		});
	}, opcionesObserver);

	secciones.forEach((seccion) => observer.observe(seccion));

	// Segundo scroll-spy, este sobre los H2: resalta el subtítulo activo
	// dentro del acordeón desplegado.
	const observerSub = new IntersectionObserver((entries) => {
		if (spyBloqueado) return;
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				marcarSubActivo(subenlaces.get(entry.target));
			}
		});
	}, opcionesObserver);

	subenlaces.forEach((_enlace, heading) => observerSub.observe(heading));

	// Clic en el índice: scroll suave al destino y actualización del hash
	// sin recargar ni añadir entradas al historial.
	indice.addEventListener('click', (e) => {
		// Chevrón: solo despliega/pliega el acordeón, sin navegar.
		const boton = e.target.closest('.mg-indice-toggle');
		if (boton) {
			const grupo = boton.closest('.mg-indice-grupo');
			const abierta = grupo.classList.toggle('abierta');
			boton.setAttribute('aria-expanded', String(abierta));
			return;
		}

		// Subtítulo del acordeón: scroll al H2 dentro de su capítulo.
		const sub = e.target.closest('.mg-indice-subitem');
		if (sub) {
			const seccion = document.getElementById(sub.dataset.capitulo);
			const destino = seccion?.querySelector(`[id="${sub.dataset.heading}"]`);
			if (!destino) return;

			e.preventDefault();
			bloquearSpy();
			destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${sub.dataset.heading}`);
			marcarSubActivo(sub);
			return;
		}

		// Capítulo: scroll al inicio de la sección.
		const a = e.target.closest('.mg-indice-item');
		if (!a) return;
		const slug = a.dataset.slug;
		const destino = document.getElementById(slug);
		if (!destino) return;

		e.preventDefault();
		bloquearSpy();
		destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.replaceState(null, '', `#${slug}`);
		marcarActivo(slug);
	});
}
