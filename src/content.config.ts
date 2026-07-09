import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada proyecto es un .md en src/content/proyectos/: los metadatos van en el
// frontmatter y el contenido de la ficha se escribe en markdown (admite
// imágenes, listas, citas…). El nombre del archivo es el id/URL del proyecto.
const proyectos = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/proyectos' }),
	// `image()` resuelve rutas relativas al .md y entrega un ImageMetadata que
	// Astro optimiza en el build (ver src/assets/proyectos/).
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			// "YYYY", "YYYY-MM" o "YYYY-MM-DD"; coerce por si YAML lo lee como número
			fecha: z.coerce.string().optional(),
			// Fin del rango: una fecha o "ahora" (en curso). Sin este campo, `fecha`
			// es un punto único. Las subtarjetas (`sub`) no admiten rango.
			fechaFin: z.coerce.string().optional(),
			categorias: z.array(z.string()).default([]),
			peso: z.number().optional(),
			// Opcional: sin imagen la tarjeta muestra el icono de su categoría
			imagen: image().optional(),
			// Imagen grande de la cabecera de la ficha; si falta se usa `imagen`
			portada: image().optional(),
			// Vídeo "trailer" (mp4/webm) para la cabecera; sustituye a la portada
			trailer: z.string().optional(),
			// Vídeo en bucle para la tarjeta (hero y timeline). Ruta a un archivo en
			// public/ (p. ej. /vid/blog.mp4). Usa `imagen` como poster; no sustituye a `trailer`.
			video: z.string().optional(),
			// Orden en el hero (1 = primero); los proyectos sin destacado no flotan
			destacado: z.number().optional(),
			descripcion: z.string().optional(),
			tecnologias: z.array(z.string()).optional(),
			link: z.string().optional(),
			premio: z.string().optional(),
			// Si está presente, la tarjeta abre esta URL en pestaña nueva
			// en lugar de la ficha interna /proyectos/<id>
			enlaceExterno: z.string().optional(),
			// Oculta el badge de fecha en la tarjeta del timeline
			ocultarFecha: z.boolean().optional(),
			sub: z
				.array(
					z.object({
						titulo: z.string(),
						descripcion: z.string().optional(),
						categoria: z.string().optional(),
						fecha: z.coerce.string().optional(),
						imagen: image().optional(),
						link: z.string().optional(),
					}),
				)
				.optional(),
		}),
});

export const collections = { proyectos };
