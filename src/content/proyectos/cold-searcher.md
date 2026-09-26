---
titulo: Cold Searcher
fecha: "2026-02"
fechaFin: "2026-06"
categorias: [programacion]
peso: 60
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Buscador único para discos externos y nubes, aunque el disco esté desconectado.
tecnologias: [Python, FastAPI, PostgreSQL, pgvector, CLIP, Meilisearch, React, Electron, Docker]
link: https://github.com/PGSCOM/Cold-Searcher
txtboton: Ver en GitHub
---

<!-- TODO: el problema real (cuántos discos tienes, qué buscabas y no encontrabas) -->

## Qué hace

Indexa discos externos y almacenamiento en la nube (Google Drive, Dropbox, OneDrive, S3) en **un solo índice persistente**, así que puedes saber dónde está un archivo aunque el disco esté en un cajón.

- **Búsqueda semántica** con embeddings CLIP: "fotos de playa al atardecer".
- **Búsqueda de texto completo** con Meilisearch.

## Arquitectura

1. **Frontend**: React + Electron + TanStack Query + Tailwind.
2. **API**: FastAPI con SQLAlchemy asíncrono.
3. **Datos**: PostgreSQL con pgvector para los vectores.

Todo se levanta con Docker Compose.
