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
			// Proyecto pequeño: sale de la rejilla y va a la lista compacta de debajo
			experimento: z.boolean().optional(),
			// Opcional: sin imagen la tarjeta muestra el icono de su categoría
			imagen: image().optional(),
			// Imagen grande de la cabecera de la ficha; si falta se usa `imagen`
			portada: image().optional(),
			// Vídeo "trailer" (mp4/webm) para la cabecera; sustituye a la portada
			trailer: z.string().optional(),
			// Vídeo en bucle para la tarjeta (hero y timeline). Ruta a un archivo en
			// public/ (p. ej. /vid/blog.mp4). Usa `imagen` como poster; no sustituye a `trailer`.
			video: z.string().optional(),
			// Segundos que la tarjeta muestra `imagen` antes de arrancar `video` al
			// aparecer en pantalla. Sin este campo, se usa el valor por defecto (2s).
			videoDelay: z.number().optional(),
			// Orden en el hero (1 = primero); los proyectos sin destacado no flotan
			destacado: z.number().optional(),
			descripcion: z.string().optional(),
			// true: muestra `descripcion` siempre visible bajo el título de la tarjeta.
			// string: usa ese texto (solo en la tarjeta). Ausente/false: se revela al hover.
			descripcionexterior: z.union([z.boolean(), z.string()]).optional(),
			tecnologias: z.array(z.string()).optional(),
			link: z.string().optional(),
			// Texto del botón de enlace externo del hero; sin este campo, "Visitar proyecto"
			txtboton: z.string().optional(),
			premio: z.string().optional(),
			// Si está presente, la tarjeta abre esta URL en pestaña nueva
			// en lugar de la ficha interna /proyectos/<id>
			enlaceExterno: z.string().optional(),
			// Si está presente, genera /proyectos/<id>/video: página solo con el
			// vídeo del proyecto en el reproductor Video.js (ver
			// src/pages/proyectos/[id]/video.astro). `link` suele apuntar ahí.
			urlvideopage: z.string().optional(),
			// Oculta el badge de fecha en la tarjeta del timeline
			ocultarFecha: z.boolean().optional(),
			// Sustituye el título de la tarjeta por una imagen (como el logo de un
			// juego en la biblioteca de Steam). El título sigue siendo el `alt`.
			logo: image().optional(),
			// Anclaje del logo. Sin este campo ocupa el hueco del título dentro del
			// overlay (nunca pisa chips ni descripción). Con valor, flota sobre el arte.
			logoPos: z
				.enum([
					'abajo-izq', 'abajo-centro', 'abajo-der',
					'centro-izq', 'centro', 'centro-der',
					'arriba-izq', 'arriba-centro', 'arriba-der',
				])
				.optional(),
			logoAncho: z.number().min(10).max(100).optional(), // % del ancho de la tarjeta
			logoAlto: z.number().min(10).max(100).optional(), // % máximo del alto
			// Degradado letra a letra en el título (ficha y tarjeta). `true` usa el
			// degradado por defecto; un par de colores lo sustituye.
			tituloDegradado: z.union([z.boolean(), z.array(z.string()).length(2)]).optional(),
			// Multiplicador del tamaño del título en la tarjeta (el degradado
			// necesita tamaño para leerse). 1 = como ahora.
			tituloEscala: z.number().min(0.5).max(3).optional(),
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

// Capítulos del micrositio de "El Periodo de Multiguerras". Cada .md es un
// apartado independiente (Infraestructura, Blender, Render distribuido…);
// src/pages/proyectos/multiguerras.astro los lee todos, genera el índice
// lateral y renderiza cada uno como una sección del scroll continuo.
const multiguerras = defineCollection({
	loader: glob({ pattern: '*.{md,mdx}', base: './src/content/multiguerras' }),
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			// Orden en el índice lateral y el scroll del contenido
			orden: z.number(),
			// Categoría dueña del capítulo (ver src/data/categorias.json):
			// da color al capítulo y al ítem del índice
			categoria: z.enum(['programacion', 'video', 'vfx']),
			// Texto corto: subtítulo del capítulo
			resumen: z.string().optional(),
			imagen: image().optional(),
			// Multiplicadores 0–1 del negro que se superpone a `imagen`.
			// 1 o ausente = aspecto por defecto; 0 = foto limpia.
			opacidadtarjeta: z.number().min(0).max(1).optional(), // velo del banner
			opacidadindice: z.number().min(0).max(1).optional(), // fundido de la fila del índice
		}),
});

// Competencias técnicas sueltas que se listan en la home (Tailscale, Docker,
// montar un NAS…). No son proyectos: no tienen ficha ni URL propia.
// El CUERPO markdown es el panel desplegable; sin cuerpo, la fila se pinta
// plana, sin "+" y sin clic.
// Solo .md: en .mdx el `body` incluye las líneas `import`, así que un archivo
// "vacío" con un import parecería tener cuerpo y saldría como expandible.
const habilidades = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/habilidades' }),
	schema: z.object({
		titulo: z.string(),
		// ID de src/data/categorias.json: solo da el color de acento de la fila
		categoria: z.string().optional(),
		// Nombre de archivo (sin .svg) dentro de public/icons/marcas/
		icono: z.string().optional(),
		// Una línea, siempre visible bajo el título
		resumen: z.string().optional(),
		// Menor = antes. Sin este campo va al montón del medio y desempata por título
		orden: z.number().default(50),
	}),
});

export const collections = { proyectos, multiguerras, habilidades };
