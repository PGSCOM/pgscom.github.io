---
titulo: Render farm para Unreal
fecha: "2025-01"
categorias: [vfx, programacion]
peso: 45
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Granja de render distribuida para el Movie Render Queue de Unreal Engine 5.
tecnologias: [Python, Flask, Unreal Engine 5, Cloudflare]
link: https://github.com/PGSCOM/unrealRenderFarm
txtboton: Ver en GitHub
---

Fork de [unrealRenderFarm](https://github.com/leixingyu/unrealRenderFarm) adaptado para renderizar el [Periodo de Multiguerras](/proyectos/multiguerras) entre varios ordenadores.

## Cambios propios

- Quité la asignación automática de worker, que limitaba cada máquina a un único trabajo.
- Manager y worker independientes para poder repartirlos en máquinas distintas.
- Manager adaptado a Windows y configuración movida a `config.json`.
- Script para mandar trabajos directamente desde la Render Queue de Unreal.
- Servidor protegido detrás de Cloudflare.
