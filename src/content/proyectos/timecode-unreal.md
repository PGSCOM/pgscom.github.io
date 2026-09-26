---
titulo: TimecodeUnreal
fecha: "2023-09"
fechaFin: "2024-11"
categorias: [vfx, programacion]
peso: 40
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Convierte los renders de Unreal en .mov con timecode listos para DaVinci Resolve.
tecnologias: [Python, FFmpeg, Unreal Engine, DaVinci Resolve]
link: https://github.com/PGSCOM/TimecodeUnreal
txtboton: Ver en GitHub
---

Script de Python que uso en el pipeline del [Periodo de Multiguerras](/proyectos/multiguerras).

1. Toma la secuencia de PNG que sale de Unreal Engine.
2. La junta en un `.mov` **con timecode** usando FFmpeg.
3. Genera un `.csv` de metadatos que DaVinci Resolve importa para etiquetar escenas y tomas solas.

<!-- TODO: cuánto tiempo te ahorró en el montaje -->
