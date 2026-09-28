# Graph Report - v4-2  (2026-09-28)

## Corpus Check
- 33 files · ~22,658 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .css 8)

## Summary
- 172 nodes · 258 edges · 25 communities (10 shown, 15 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a4e4adff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assets_logo
- index.astro
- proyecto-video.js
- ref_gsap
- initRuta
- content.config.ts
- generate-posters.mjs
- init
- initGrafo
- multiguerras-nav.js
- contact.ts
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

## God Nodes (most connected - your core abstractions)
1. `init()` - 12 edges
2. `initGrafo()` - 11 edges
3. `initRuta()` - 9 edges
4. `montarFuente()` - 8 edges
5. `blobUrl()` - 6 edges
6. `envolver()` - 6 edges
7. `formatRangoFecha()` - 6 edges
8. `repartir()` - 5 edges
9. `esEnCurso()` - 5 edges
10. `setVideoSource()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `esEnCurso()`  [EXTRACTED]
  src/pages/sitemap.xml.ts → src/utils/fechas.js
- `reproducir()` --calls--> `montarFuente()`  [EXTRACTED]
  src/scripts/card-video.js → src/scripts/hls-media.js
- `init()` --calls--> `blobUrl()`  [EXTRACTED]
  src/scripts/galaxia-scroll.js → src/scripts/hls-media.js
- `setVideoSource()` --calls--> `blobUrl()`  [EXTRACTED]
  src/scripts/galaxia-scroll.js → src/scripts/hls-media.js
- `volverAlPoster()` --calls--> `desmontarFuente()`  [EXTRACTED]
  src/scripts/card-video.js → src/scripts/hls-media.js

## Import Cycles
- None detected.

## Communities (25 total, 15 thin omitted)

### Community 1 - "index.astro"
Cohesion: 0.10
Nodes (21): ref_astro_assets, ref_astro_content, src_assets_logo, src_assets_proyectos_portfolio, src_data_categorias, src_data_contacto, src_data_multiguerras, GET() (+13 more)

### Community 2 - "proyecto-video.js"
Cohesion: 0.08
Nodes (23): ref_hls_js, ref_photoswipe, reproducir(), videos, volverAlPoster(), aHLS(), blobs, blobUrl() (+15 more)

### Community 3 - "ref_gsap"
Cohesion: 0.21
Nodes (9): ref_gsap, ref_lenis, initHero(), entrance(), startIdleFloat(), dispatchDone(), initPreloader(), hint (+1 more)

### Community 5 - "initRuta"
Cohesion: 0.38
Nodes (8): initRuta(), build(), construirMascara(), prepararRuta(), puntos(), rectLayout(), setVista(), marcarSinImagen()

### Community 7 - "content.config.ts"
Cohesion: 0.33
Nodes (5): ref_astro, collections, habilidades, multiguerras, proyectos

### Community 8 - "generate-posters.mjs"
Cohesion: 0.17
Nodes (14): ref_ffmpeg_installer_ffmpeg, ref_node_child_process, ref_node_fs, ref_node_path, ref_sharp, alDia(), DIRS, generarHLS() (+6 more)

### Community 9 - "init"
Cohesion: 0.35
Nodes (10): init(), applyScrub(), attachEndedHandler(), onProgress(), prepareNext(), scheduleScrub(), setVideoSource(), startAfterZoom() (+2 more)

### Community 12 - "initGrafo"
Cohesion: 0.32
Nodes (11): azar(), initGrafo(), caja(), maquetar(), medirEtiqueta(), orientar(), posicionReposo(), repartir() (+3 more)

### Community 15 - "multiguerras-nav.js"
Cohesion: 0.32
Nodes (5): abrirGrupo(), centrarActivo(), indice, marcarActivo(), secciones

### Community 22 - "contact.ts"
Cohesion: 0.40
Nodes (3): Env, TelegramResponse, TurnstileResponse

## Knowledge Gaps
- **23 isolated node(s):** `TurnstileResponse`, `TelegramResponse`, `Env`, `DIRS`, `DIRS` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 69 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initGrafo()` connect `initGrafo` to `ref_gsap`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `init()` connect `init` to `proyecto-video.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `TurnstileResponse`, `TelegramResponse`, `Env` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._
- **Should `proyecto-video.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08408408408408409 - nodes in this community are weakly interconnected._