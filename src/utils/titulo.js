// Una <span> por letra, agrupadas por palabra: el degradado del título (ver
// titulo-proyecto.css) se aplica letra a letra, y agrupar por palabra permite
// un `white-space: nowrap` que impide que la línea parta a mitad de una
// palabra (cada letra suelta sería, si no, un punto de corte válido).
export const palabrasLetras = (titulo) => titulo.trim().split(/\s+/).map((p) => [...p]);
