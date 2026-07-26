// Timeline vertical de "El Periodo de Multiguerras".
// Los datos llegan serializados como JSON en el propio HTML (sin fetch) y este
// script se limita a construir el DOM a partir de ellos, sin ningún estilo.
const datosScript = document.querySelector('#mg-datos-multiguerras');

if (datosScript) {
	let datos = null;

	try {
		datos = JSON.parse(datosScript.textContent);
	} catch (error) {
		// JSON mal formado: no hay nada razonable que pintar.
		datos = null;
	}

	if (datos) {
		const timeline = Array.isArray(datos.timeline) ? datos.timeline : [];

		// Timeline vertical: los datos ya vienen en orden cronológico.
		const timelineEl = document.querySelector('#mg-timeline');
		if (timelineEl && timeline.length > 0) {
			const fragment = document.createDocumentFragment();

			timeline.forEach(({ fecha, titulo, descripcion }) => {
				const item = document.createElement('li');
				item.className = 'mg-timeline-item';

				const spanFecha = document.createElement('span');
				spanFecha.className = 'mg-timeline-fecha';
				spanFecha.textContent = fecha;

				const h3Titulo = document.createElement('h3');
				h3Titulo.className = 'mg-timeline-titulo';
				h3Titulo.textContent = titulo;

				const pDesc = document.createElement('p');
				pDesc.className = 'mg-timeline-desc';
				pDesc.textContent = descripcion;

				item.append(spanFecha, h3Titulo, pDesc);
				fragment.appendChild(item);
			});

			timelineEl.appendChild(fragment);
		}
	}
}
