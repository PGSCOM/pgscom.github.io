import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Sitemap generado proceduralmente: portada + una URL por cada proyecto con lastmod.
export const GET: APIRoute = async ({ site }) => {
	const base = (site?.href ?? 'https://pgscom.es/').replace(/\/$/, '');
	const ahora = new Date().toISOString().slice(0, 10);

	const proyectos = await getCollection('proyectos');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <lastmod>${ahora}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
${proyectos
	.map((p) => {
		const fecha = p.data.fecha ?? '';
		const lastmod = fecha ? `${fecha.slice(0, 7)}-01` : ahora;
		return `  <url>
    <loc>${base}/proyectos/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
	})
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
