---
titulo: CoTracker3 para Blender
fecha: "2026-09"
categorias: [vfx, programacion]
peso: 65
imagen: ../../assets/proyectos/blender-cotracker3.webp
video: /proyvid/blender-cotracker3.mp4
trailer: /proyvid/blender-cotracker3.mp4
descripcion: Addon que cambia el tracker de Blender por CoTracker3, un modelo de IA de Meta.
tecnologias: [Blender, Python, PyTorch, CoTracker3]
link: https://github.com/PGSCOM/Blender-Cotracker3
txtboton: Ver en GitHub
estadoIA: generado
experimento: true
---

A partir del workflow alternativo que se tuvo que usar en el [Periodo de Multiguerras](/proyectos/multiguerras), donde usé un [space con CoTracker3](https://huggingface.co/spaces/PGSCOM/cotracker) para recuperar tomas en las que el tracking falló, cree un addon para Blender que reemplaza el tracking nativo por el de [CoTracker3](https://cotracker3.github.io/).

Este fue un experimento sencillo, pero después de utilizarlo vi que el sistema de tracking de Blender es limitado comparado como alternativas a workflows con [Colmap](https://github.com/colmap/colmap) + [Blender Addon Fotogrametry Importer](https://github.com/SBCV/Blender-Addon-Photogrammetry-Importer).

## Cómo funciona

- Lo único que se sustituye es el cálculo de posiciones que se delega a un proceso Python aparte con PyTorch, comunicado por HTTP local.
- Modo **offline** (clip entero) y **online** (en streaming).

## Demo

<iframe width="100%" style="aspect-ratio:16/9;height:auto;" src="https://www.youtube.com/embed/j6hVbNbe9MM" title="Demo de CoTracker3 para Blender" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<!-- TODO: comparador antes/después (VideoCompareSlider, requiere .mdx) del tracker KLT vs CoTracker3 -->
