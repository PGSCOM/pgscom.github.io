---
titulo: CoTracker3 para Blender
fecha: "2026-09"
categorias: [vfx, programacion]
peso: 65
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Addon que cambia el tracker de Blender por CoTracker3, un modelo de IA de Meta.
tecnologias: [Blender, Python, PyTorch, CoTracker3]
link: https://github.com/PGSCOM/Blender-Cotracker3
txtboton: Ver en GitHub
---

Nació en el [Periodo de Multiguerras](/proyectos/multiguerras), donde usé CoTracker3 para recuperar tomas que el tracker de Blender no podía seguir. Aquí lo convertí en un addon.

## Cómo funciona

- Blender **mantiene sus tracks y markers nativos**: el solve de cámara y la estabilización funcionan igual que siempre.
- Solo el cálculo de posiciones se delega a un proceso Python aparte con PyTorch, comunicado por HTTP local.
- Modo **offline** (clip entero, en ambas direcciones) y **online** (en streaming, menos VRAM).
- Grids densos de puntos y gestión de oclusiones.
- Empaquetable como extensión oficial de Blender 4.2+.

<!-- TODO: comparador antes/después (VideoCompareSlider, requiere .mdx) del tracker KLT vs CoTracker3 -->
