---
titulo: Portfolio de cine
fecha: "2024"
fechaFin: ahora
categorias: [video, desarrollo-web]
peso: 55
destacado: 5
imagen: https://cine.pgscom.es/muro.webp # la regenera cine.pgscom.es en cada build
descripcion: Mi web de cine, con estética de plataforma de streaming, para mis cortometrajes, el largo y los making-of.
tecnologias: [Astro, JSON, HTML, CSS]
link: https://cine.pgscom.es/
txtboton: Visitar la web
---

### ¿Qué es?

Una web aparte de mi portfolio general, pensada solo para mi trabajo audiovisual. Imita el aspecto de una plataforma de streaming: portada a pantalla completa con la obra destacada, botón de **Reproducir** y una barra de navegación inferior con *Inicio* y *Próximamente*.

Ahora mismo destaca **El Periodo de Multiguerras** (estrenado en 2025, dos años de producción), con acceso directo a su vídeo de "Detrás de las cámaras".

## Qué contiene

- **Largometraje:** El Periodo de Multiguerras.
- **Cortos:** *Agua*, *Viaje en el Tiempo* y *Arquímedes*, con el making-of de los dos primeros.
- **Podcasts sobre IA** y otras piezas sueltas.
- **Próximamente:** lo que viene después.

<div class="pd-seccion" data-cat="programacion">

### Cómo está hecha

Está construida con **Astro**. Cada obra se define en un archivo **JSON** (título, portada, enlaces, secciones), así que añadir un corto nuevo es editar datos, no código. El vídeo se reproduce desde YouTube y los podcasts desde Spotify.

El código está en [GitHub](https://github.com/PGSCOM/cine).

</div>
