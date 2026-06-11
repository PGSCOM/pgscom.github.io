// Fecha con precisión variable: "YYYY", "YYYY-MM" o "YYYY-MM-DD".
// Se muestra con la precisión que tenga (compartido por la portada y las fichas).
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function formatFecha(f) {
	if (!f) return '';
	const [y, m, d] = String(f).split('-');
	if (!m) return y;
	const mes = MESES[Number(m) - 1] ?? '';
	if (d) return `${Number(d)} de ${mes} de ${y}`;
	return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${y}`;
}
