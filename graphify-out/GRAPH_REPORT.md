# Graph Report - src  (2026-09-20)

## Corpus Check
- Large corpus: 121 files · ~3,247,230 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 139 nodes · 211 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Homepage & Hero Content
- Project Pages & Layout
- HLS Video Player
- Scroll Animation & Preloader
- Video Scrub Transition
- Projects Route Map
- Multiguerras Section Nav
- Photo Gallery (PhotoSwipe)
- Content Collections Config
- Skills Graph
- Video Compare Slider
- Multiguerras Timeline

## God Nodes (most connected - your core abstractions)
1. `init()` - 11 edges
2. `initRuta()` - 9 edges
3. `formatRangoFecha()` - 7 edges
4. `montarFuente()` - 6 edges
5. `esEnCurso()` - 6 edges
6. `initGrafo()` - 5 edges
7. `envolver()` - 5 edges
8. `rutaEntries` - 4 edges
9. `prepareNext()` - 4 edges
10. `startAfterZoom()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `esEnCurso()`  [EXTRACTED]
  pages/sitemap.xml.ts → utils/fechas.js
- `rutaEntries` --calls--> `esEnCurso()`  [EXTRACTED]
  pages/index.astro → utils/fechas.js
- `rutaEntries` --calls--> `formatFecha()`  [EXTRACTED]
  pages/index.astro → utils/fechas.js
- `rutaEntries` --calls--> `formatRangoFecha()`  [EXTRACTED]
  pages/index.astro → utils/fechas.js
- `reproducir()` --calls--> `montarFuente()`  [EXTRACTED]
  scripts/card-video.js → scripts/hls-media.js

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "Homepage & Hero Content"
Cohesion: 0.10
Nodes (23): assets_logo, data_contacto, catById, cronologia, featured, formGroups, formStatus, heroLayout (+15 more)

### Community 1 - "Project Pages & Layout"
Cohesion: 0.15
Nodes (10): assets_proyectos_portfolio, data_categorias, data_multiguerras, ref_astro_assets, ref_astro_content, styles_multiguerras, styles_proyecto_detalle, styles_titulo_proyecto (+2 more)

### Community 2 - "HLS Video Player"
Cohesion: 0.14
Nodes (13): ref_hls_js, reproducir(), videos, esHLS(), montarFuente(), ajustarSkin(), ATRIBUTOS_A_COPIAR, CONFIG_HLS (+5 more)

### Community 3 - "Scroll Animation & Preloader"
Cohesion: 0.19
Nodes (9): ref_gsap, ref_lenis, initHero(), entrance(), startIdleFloat(), dispatchDone(), initPreloader(), hint (+1 more)

### Community 4 - "Video Scrub Transition"
Cohesion: 0.35
Nodes (10): init(), applyScrub(), attachEndedHandler(), onProgress(), prepareNext(), scheduleScrub(), setVideoSource(), startAfterZoom() (+2 more)

### Community 5 - "Projects Route Map"
Cohesion: 0.38
Nodes (8): initRuta(), build(), construirMascara(), prepararRuta(), puntos(), rectLayout(), setVista(), marcarSinImagen()

### Community 6 - "Multiguerras Section Nav"
Cohesion: 0.32
Nodes (5): abrirGrupo(), centrarActivo(), indice, marcarActivo(), secciones

### Community 8 - "Content Collections Config"
Cohesion: 0.33
Nodes (5): collections, habilidades, multiguerras, proyectos, ref_astro

### Community 9 - "Skills Graph"
Cohesion: 0.53
Nodes (5): initGrafo(), posicionReposo(), seleccionar(), soltar(), tick()

### Community 10 - "Video Compare Slider"
Cohesion: 0.67
Nodes (3): initVideoCompareSliders(), setupSlider(), teardowns

## Knowledge Gaps
- **27 isolated node(s):** `proyectos`, `multiguerras`, `habilidades`, `collections`, `proyectos` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 58 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `Video Scrub Transition` to `Scroll Animation & Preloader`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `proyectos`, `multiguerras`, `habilidades` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Homepage & Hero Content` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._
- **Should `HLS Video Player` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._