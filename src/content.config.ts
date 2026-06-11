import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada proyecto es un .md en src/content/proyectos/: los metadatos van en el
// frontmatter y el contenido de la ficha se escribe en markdown (admite
// imágenes, listas, citas…). El nombre del archivo es el id/URL del proyecto.
const proyectos = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
	schema: z.object({
		titulo: z.string(),
		// "YYYY", "YYYY-MM" o "YYYY-MM-DD"; coerce por si YAML lo lee como número
		fecha: z.coerce.string().optional(),
		categorias: z.array(z.string()).default([]),
		peso: z.number().optional(),
		// Opcional: sin imagen la tarjeta muestra el icono de su categoría
		imagen: z.string().optional(),
		// Orden en el hero (1 = primero); los proyectos sin destacado no flotan
		destacado: z.number().optional(),
		descripcion: z.string().optional(),
		tecnologias: z.array(z.string()).optional(),
		link: z.string().optional(),
		premio: z.string().optional(),
		sub: z
			.array(
				z.object({
					titulo: z.string(),
					descripcion: z.string().optional(),
					categoria: z.string().optional(),
					fecha: z.coerce.string().optional(),
					imagen: z.string().optional(),
					link: z.string().optional(),
				}),
			)
			.optional(),
	}),
});

export const collections = { proyectos };
