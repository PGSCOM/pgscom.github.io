import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Sitemap generado proceduralmente: portada + una URL por cada proyecto.
export const GET: APIRoute = async ({ site }) => {
	const base = (site?.href ?? 'https://pgscom.es/').replace(/\/$/, '');

	const urls: string[] = [`${base}/`];
	for (const proyecto of await getCollection('proyectos')) {
		urls.push(`${base}/proyectos/${proyecto.id}`);
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`,
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
