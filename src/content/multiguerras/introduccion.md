---
titulo: Introducción
orden: 1
categoria: video
---

<video src="https://pgscom-media-web.pages.dev/periodomultiguerras/master.m3u8" poster="https://pgscom-media-web.pages.dev/periodomultiguerras/miniatura.png" controls preload="none"></video>

Multiguerras a parte de ser un cortometraje, es un proyecto para experimentar con técnicas de producción virtual, VFX, gestión de multimedia, producción de audio, gestión de sistemas de archivos y metadatos, y en general, para ver todo lo que conlleva la producción de un proyecto audiovisual grande.


## Guion

El guion fue escrito al 100% por mí, y me fuí basando en ideas que tuve en proyectos anteriores (Como en el proyecto cancelado "El desafío")

Al principio hice un guion bastante más largo de lo que es pero al final lo recorté a lo que es ahora (Quitando escenas como unas del descubrimiento de América o un desenlace final).

> Un error que cometí fue hacer que los personajes sobreexplicaran lo que estaba pasando en la escena, cuando hay otros medios no verbales de contar la historia.

## Organización

Nada más arrancar el proyecto cree:

- Un canal de Telegram para poder comunicarme con el equipo y subir archivos grandes.
- Una organización de Github (Ver [infraestructura](#infraestructura))
- Notion
### Notion
El notion lo usé para organizar cada toma que se iba a grabar. Cada una tenía unas propiedades que decían si se necesitaba VFX, si requería [Atención Especial](#atencion-especial).

<div class="pd-galeria" style="grid-template-columns: repeat(auto-fill, minmax(25%, 1fr));">

![Tabla de Notion "Renderizados"](../../assets/proyectos/multiguerras/notion1.png)
![Tabla de Notion "Tareas"](../../assets/proyectos/multiguerras/notion2.png)
![Tabla de Notion "Tareas"](../../assets/proyectos/multiguerras/notion3.png)
</div>

## Decisiones técnicas

### FPS
Los FPS del proyecto son 30, en vez de 24. Creo que esa decisión fue un error.
### SDR vs HDR
Por el momento Blender no soportaba fácilmente espacios de color, y por eso se decidió que el proyecto fuera SDR.
