# Graph Report - pgscom.github.io  (2026-09-27)

## Corpus Check
- 112 files · ~3,347,386 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .css 10, (none) 6, .woff2 1)

## Summary
- 423 nodes · 429 edges · 100 communities (24 shown, 76 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79ccc2d1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assets_logo
- index.astro
- proyecto-video.js
- gsap
- Guía de formato — ficheros de proyecto
- initRuta
- infraestructura.md
- package.json
- generate-posters.mjs
- init
- unreal.md
- premios-macula.md
- initGrafo
- devDependencies
- atencion-especial.mdx
- multiguerras-nav.js
- tsconfig.json
- blender.md
- preproduccion.md
- produccion-virtual.mdx
- VDO.Ninja
- contact.ts
- Preparación del set
- video-compare.js
- diseño-escenarios.md
- Inicios del Blog
- Cómo funciona
- cold-searcher.md
- audio.md
- resultados.md
- multiguerras-timeline.js
- assets_proyectos_portfolio
- data_categorias
- data_contacto
- data_multiguerras
- pages_styles
- styles_contacto
- styles_habilidades
- styles_multiguerras
- styles_proyecto_detalle
- styles_proyectos
- styles_titulo_proyecto
- styles_video_page
- ipad-tunnel.md
- lcemp.md
- mlxchat.md
- pulseboot.md
- blender-cotracker3.md
- unreal-render-farm.md

## God Nodes (most connected - your core abstractions)
1. `Guía de formato — ficheros de proyecto` - 17 edges
2. `initGrafo()` - 12 edges
3. `init()` - 11 edges
4. `scripts` - 9 edges
5. `initRuta()` - 9 edges
6. `gsap` - 8 edges
7. `formatRangoFecha()` - 7 edges
8. `repartir()` - 6 edges
9. `montarFuente()` - 6 edges
10. `build()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Stack` --references--> `build()`  [INFERRED]
  AGENTS.md → src/scripts/proyectos-ruta.js
- `Galería de imágenes / vídeo (lightbox)` --references--> `build()`  [INFERRED]
  FORMATO.md → src/scripts/proyectos-ruta.js
- `GET()` --calls--> `esEnCurso()`  [EXTRACTED]
  src/pages/sitemap.xml.ts → src/utils/fechas.js
- `reproducir()` --calls--> `montarFuente()`  [EXTRACTED]
  src/scripts/card-video.js → src/scripts/hls-media.js
- `rutaEntries` --calls--> `esEnCurso()`  [EXTRACTED]
  src/pages/index.astro → src/utils/fechas.js

## Import Cycles
- None detected.

## Communities (100 total, 76 thin omitted)

### Community 1 - "index.astro"
Cohesion: 0.06
Nodes (39): ref_astro_assets, ref_astro_content, src_assets_logo, src_assets_proyectos_portfolio, collections, habilidades, multiguerras, proyectos (+31 more)

### Community 2 - "proyecto-video.js"
Cohesion: 0.14
Nodes (13): hls.js, reproducir(), videos, esHLS(), montarFuente(), ajustarSkin(), ATRIBUTOS_A_COPIAR, CONFIG_HLS (+5 more)

### Community 3 - "gsap"
Cohesion: 0.19
Nodes (9): gsap, azar(), initHero(), entrance(), startIdleFloat(), dispatchDone(), initPreloader(), hint (+1 more)

### Community 4 - "Guía de formato — ficheros de proyecto"
Cohesion: 0.07
Nodes (30): 10. Desplegable `<details>`, 11. Sección con franja de color (`pd-seccion`), 12. Anclas para sub-items, 13. Pestañas (`data-tab`), 14. Micrositio de capítulos (Multiguerras), 15. Habilidades: el grafo sobre "Proyectos", 1. Frontmatter, 2. Encabezados en el cuerpo (+22 more)

### Community 5 - "initRuta"
Cohesion: 0.13
Nodes (16): Comandos, Contenido de proyectos, Convenciones, Estructura, graphify, Stack, 6. Imágenes, Galería de imágenes / vídeo (lightbox) (+8 more)

### Community 6 - "infraestructura.md"
Cohesion: 0.12
Nodes (15): Composición, Metadatos, Montaje:, PostgreSQL, VFX, Almacenamiento:, Automatizaciones, Carcasa (+7 more)

### Community 7 - "package.json"
Cohesion: 0.05
Nodes (32): dependencies, astro, @astrojs/mdx, gsap, hls.js, lenis, photoswipe, @videojs/html (+24 more)

### Community 8 - "generate-posters.mjs"
Cohesion: 0.20
Nodes (10): @ffmpeg-installer/ffmpeg, ref_node_child_process, ref_node_fs, ref_node_path, sharp, DIRS, extraerFrame(), generarPoster() (+2 more)

### Community 9 - "init"
Cohesion: 0.35
Nodes (10): init(), applyScrub(), attachEndedHandler(), onProgress(), prepareNext(), scheduleScrub(), setVideoSource(), startAfterZoom() (+2 more)

### Community 10 - "unreal.md"
Cohesion: 0.20
Nodes (9): Assets y referencias, Control de versiones, Cámara virtual y tracking, Extras andantes, Extras digitales, MetaHuman, Multitud estática, Portales (+1 more)

### Community 11 - "premios-macula.md"
Cohesion: 0.20
Nodes (9): Audio, Detrás de cámaras, Galería, Generación de entradas, QRs generados por IA, ¿Qué es este proyecto?, Sistema de cámaras, Validación (+1 more)

### Community 12 - "initGrafo"
Cohesion: 0.33
Nodes (11): initGrafo(), caja(), maquetar(), medirEtiqueta(), nebulosas(), orientar(), posicionReposo(), repartir() (+3 more)

### Community 13 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, @astrojs/check, @cloudflare/workers-types, @ffmpeg-installer/ffmpeg, sharp, typescript

### Community 14 - "atencion-especial.mdx"
Cohesion: 0.25
Nodes (7): Escena corriendo, Escena explosión muro, Final del jefe volando, Primer plano cárcel, Recuperación del tracking con IA (CoTracker), Referencia, Referencia

### Community 15 - "multiguerras-nav.js"
Cohesion: 0.32
Nodes (5): abrirGrupo(), centrarActivo(), indice, marcarActivo(), secciones

### Community 16 - "tsconfig.json"
Cohesion: 0.29
Nodes (6): astro/tsconfigs/strict, compilerOptions, types, exclude, extends, include

### Community 17 - "blender.md"
Cohesion: 0.29
Nodes (6): Compilación, Hecho y renderizado en Blender:, Por qué no lo usé, Portal (en Blender), Render Farm (De Flamenco a SheepIt), Simulaciones

### Community 18 - "preproduccion.md"
Cohesion: 0.29
Nodes (6): Decisiones técnicas, FPS, Guion, Notion, Organización, SDR vs HDR

### Community 19 - "produccion-virtual.mdx"
Cohesion: 0.29
Nodes (6): Calibración de cámaras, Emparejamiento de tomas reales y virtuales, Grabación, Movie Render Queue, Render Farm de Unreal, Tracking de cámara

### Community 21 - "VDO.Ninja"
Cohesion: 0.33
Nodes (5): [#1182 — Complete Spanish translation](https://github.com/steveseguin/vdo.ninja/pull/1182) · Abril 2025, [#1184 — Fix: Language reorder by time zone](https://github.com/steveseguin/vdo.ninja/pull/1184) · Abril 2025, [#688 — Fix IPv6 header check](https://github.com/danielpaulus/go-ios/pull/688) · Marzo 2026, go-ios, VDO.Ninja

### Community 22 - "contact.ts"
Cohesion: 0.40
Nodes (3): Env, TelegramResponse, TurnstileResponse

### Community 23 - "Preparación del set"
Cohesion: 0.40
Nodes (4): Galería primer rodaje, Preparación del set, Primer set, Segundo set

### Community 24 - "video-compare.js"
Cohesion: 0.67
Nodes (3): initVideoCompareSliders(), setupSlider(), teardowns

### Community 28 - "Cómo funciona"
Cohesion: 0.40
Nodes (4): Cliente, Cómo funciona, Host (Windows / Linux / macOS), Qué hace

## Knowledge Gaps
- **168 isolated node(s):** `TurnstileResponse`, `TelegramResponse`, `Env`, `name`, `type` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 269 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `gsap` connect `gsap` to `initRuta`, `package.json`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `TurnstileResponse`, `TelegramResponse`, `Env` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.05909090909090909 - nodes in this community are weakly interconnected._
- **Should `proyecto-video.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `Guía de formato — ficheros de proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `initRuta` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `infraestructura.md` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._