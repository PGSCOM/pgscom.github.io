# Graph Report - pgscom.github.io  (2026-09-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 173 nodes · 278 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 56,190 input · 196 output

## Graph Freshness
- Built from commit: `69276c68`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Reproducción de vídeo y galería
- Portada y cronología
- Páginas y componentes Astro
- Scroll de la galaxia
- Generación de HLS y posters
- Animación del hero y preloader
- Grafo de habilidades
- Ruta de proyectos
- Navegación de Multiguerras
- Colecciones de contenido
- Formulario de contacto
- Cronología de Multiguerras

## God Nodes (most connected - your core abstractions)
1. `init()` - 12 edges
2. `initGrafo()` - 12 edges
3. `initRuta()` - 9 edges
4. `montarFuente()` - 8 edges
5. `formatRangoFecha()` - 7 edges
6. `envolver()` - 6 edges
7. `esEnCurso()` - 6 edges
8. `blobUrl()` - 6 edges
9. `repartir()` - 6 edges
10. `dibujar()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `reproducir()` --calls--> `montarFuente()`  [EXTRACTED]
  src/scripts/card-video.js → src/scripts/hls-media.js
- `GET()` --calls--> `esEnCurso()`  [EXTRACTED]
  src/pages/sitemap.xml.ts → src/utils/fechas.js
- `volverAlPoster()` --calls--> `desmontarFuente()`  [EXTRACTED]
  src/scripts/card-video.js → src/scripts/hls-media.js
- `envolver()` --calls--> `aHLS()`  [EXTRACTED]
  src/scripts/proyecto-video.js → src/scripts/hls-media.js
- `envolver()` --calls--> `esHLS()`  [EXTRACTED]
  src/scripts/proyecto-video.js → src/scripts/hls-media.js

## Import Cycles
- None detected.

## Communities (13 total, 2 thin omitted)

### Community 0 - "Reproducción de vídeo y galería"
Cohesion: 0.10
Nodes (19): ref_hls_js, ref_photoswipe, reproducir(), videos, volverAlPoster(), aHLS(), blobs, desmontarFuente() (+11 more)

### Community 1 - "Portada y cronología"
Cohesion: 0.10
Nodes (24): ref_astro_content, src_assets_logo, src_data_contacto, catById, cronologia, experimentos, featured, heroLayout (+16 more)

### Community 2 - "Páginas y componentes Astro"
Cohesion: 0.15
Nodes (9): ref_astro_assets, src_assets_proyectos_portfolio, src_data_categorias, src_data_multiguerras, src_styles_multiguerras, src_styles_proyecto_detalle, src_styles_titulo_proyecto, src_styles_video_page (+1 more)

### Community 3 - "Scroll de la galaxia"
Cohesion: 0.21
Nodes (14): init(), applyScrub(), attachEndedHandler(), onProgress(), prepareNext(), scheduleScrub(), setVideoSource(), startAfterZoom() (+6 more)

### Community 4 - "Generación de HLS y posters"
Cohesion: 0.17
Nodes (14): ref_ffmpeg_installer_ffmpeg, ref_node_child_process, ref_node_fs, ref_node_path, ref_sharp, alDia(), DIRS, generarHLS() (+6 more)

### Community 5 - "Animación del hero y preloader"
Cohesion: 0.19
Nodes (10): ref_gsap, ref_lenis, azar(), initHero(), entrance(), startIdleFloat(), dispatchDone(), initPreloader() (+2 more)

### Community 6 - "Grafo de habilidades"
Cohesion: 0.36
Nodes (11): initGrafo(), caja(), dibujar(), maquetar(), medirEtiqueta(), nebulosas(), orientar(), posicionReposo() (+3 more)

### Community 7 - "Ruta de proyectos"
Cohesion: 0.38
Nodes (8): initRuta(), build(), construirMascara(), prepararRuta(), puntos(), rectLayout(), setVista(), marcarSinImagen()

### Community 8 - "Navegación de Multiguerras"
Cohesion: 0.32
Nodes (5): abrirGrupo(), centrarActivo(), indice, marcarActivo(), secciones

### Community 9 - "Colecciones de contenido"
Cohesion: 0.33
Nodes (5): ref_astro, collections, habilidades, multiguerras, proyectos

### Community 10 - "Formulario de contacto"
Cohesion: 0.40
Nodes (3): Env, TelegramResponse, TurnstileResponse

## Knowledge Gaps
- **34 isolated node(s):** `Env`, `TelegramResponse`, `TurnstileResponse`, `videos`, `blobs` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 67 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initGrafo()` connect `Grafo de habilidades` to `Animación del hero y preloader`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **What connects `Env`, `TelegramResponse`, `TurnstileResponse` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reproducción de vídeo y galería` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `Portada y cronología` be split into smaller, more focused modules?**
  _Cohesion score 0.0960591133004926 - nodes in this community are weakly interconnected._