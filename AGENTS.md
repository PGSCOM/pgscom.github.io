# AGENTS.md

Portfolio personal de Pablo García Santamaría (pgscom.es), construido con Astro y desplegado en Cloudflare Pages.

## Stack

- **Astro 7** (`.astro` para páginas/componentes) + `@astrojs/mdx` para contenido.
- Vanilla JS/TS para interactividad (`src/scripts/`), sin framework de UI (React/Vue/etc).
- Librerías puntuales: `gsap` (animación), `lenis` (scroll suave), `hls.js` + `@videojs/html` (vídeo), `photoswipe` (galería).
- `functions/contact.ts`: función de Cloudflare Pages para el formulario de contacto (Turnstile + Telegram).
- `scripts/generate-posters.mjs`: genera posters de los vídeos con ffmpeg antes de `dev`/`build` (hooks `predev`/`prebuild`).

## Comandos

```bash
npm run dev       # servidor de desarrollo (genera posters primero)
npm run build     # build de producción (genera posters primero)
npm run preview   # sirve el build
npm run check     # astro check (tipos)
npm run posters   # solo regenerar posters de vídeo
```

No hay test runner configurado. Para verificar un cambio, `npm run check` y una revisión visual con `npm run dev`.

## Estructura

- `src/pages/` — rutas (incluye `proyectos/[id].astro`, `proyectos/multiguerras.astro`, rutas dinámicas de vídeo).
- `src/content/` — colecciones de contenido (`proyectos/`, `multiguerras/`, `habilidades/`), definidas en `src/content.config.ts`.
- `src/components/`, `src/layouts/` — componentes y layouts Astro.
- `src/scripts/` — JS de interactividad del lado cliente (scroll, vídeo, galería, grafo de skills, ruta de proyectos…).
- `src/data/`, `src/utils/` — datos estáticos (categorías) y helpers (fechas, etc).
- `public/` — estáticos servidos tal cual: vídeos (`proyvid/`, `videos/`; `vid/` es solo la galaxia de la portada), iconos, imágenes.
- `functions/` — Cloudflare Pages Functions.

## Contenido de proyectos

Los ficheros `src/content/proyectos/<slug>.md` tienen un frontmatter extenso (fechas, categorías, imágenes, vídeo, layout de card…). **Antes de tocar o crear uno, lee [`FORMATO.md`](FORMATO.md)** — es la referencia completa de todos los campos disponibles y su efecto.

## graphify

Este repo tiene un grafo de conocimiento en `graphify-out/` (solo código vía AST de `src/`, `functions/` y `scripts/`; `public/`, imágenes y contenido markdown quedan fuera a propósito). El alcance se define en [`.graphifyignore`](.graphifyignore). Antes de explorar el código a base de grep, usa:

```bash
graphify query "<pregunta>"
graphify path "<A>" "<B>"
graphify explain "<concepto>"
```

Tras modificar código, `graphify update .` mantiene el grafo al día (gratis, sin LLM).

## Convenciones

- Nombres de variables, comentarios y contenido en **español** (coherente con el resto del repo).
- Mensajes de commit en español, estilo imperativo/descriptivo corto (ver `git log`).
- Sin CSS-in-JS ni Tailwind: estilos en `src/styles/` y `<style>` scoped dentro de cada `.astro`.
- Los vídeos de proyectos van en `public/proyvid/` o `public/videos/`, nunca en `src/assets/` (eso es solo para imágenes que Astro optimiza en build) ni en `public/vid/`: solo esas dos carpetas se convierten a HLS (`scripts/generate-hls.mjs`), y un mp4 fuera de ellas no se reproduce en iOS desde Cloudflare Pages.
