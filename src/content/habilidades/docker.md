---
titulo: Docker
categoria: programacion
icono: docker
resumen: Todos mis servicios propios viven en contenedores, definidos en Compose.
orden: 20
progress: 90
cielo: 90
---

Cada servicio del servidor es un `docker-compose.yml` versionado: se levanta,
se tira y se reconstruye igual en cualquier máquina.

- Volúmenes nombrados para separar datos de la imagen, que se reemplaza sin miedo.
- Redes internas: solo el reverse proxy toca el exterior.
- Builds multi-etapa para que la imagen final no arrastre el toolchain.
