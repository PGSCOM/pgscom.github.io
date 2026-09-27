// Las animaciones CSS infinitas (degradado del logo y pista de scroll del
// hero, pulso del cielo, partículas del contacto) siguen gastando cada frame
// aunque su bloque esté fuera de pantalla. Cada [data-pausa-fuera] lleva la
// clase .fuera mientras está lejos del viewport; en móvil eso las pausa
// (ver _styles.css) y al volver siguen justo donde se quedaron.
const io = new IntersectionObserver((entradas) => {
	for (const e of entradas) e.target.classList.toggle('fuera', !e.isIntersecting);
}, { rootMargin: '10% 0px' });

document.querySelectorAll('[data-pausa-fuera]').forEach((el) => io.observe(el));
