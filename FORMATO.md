# Guía de formato — ficheros de proyecto

Referencia completa de todo lo que puedes usar al escribir `src/content/proyectos/<slug>.md`.

---

## 1. Frontmatter

```yaml
---
titulo: Nombre del Proyecto          # OBLIGATORIO — aparece en el <h1> y la card
fecha: "2024-03"                     # OBLIGATORIO — "YYYY", "YYYY-MM" o "YYYY-MM-DD"
fechaFin: "2025"                     # Opcional — omitir si sigue activo; "ahora" = en curso
categorias: [programacion, video]    # OBLIGATORIO — uno o más IDs de categorías.json
peso: 75                             # Ancho en la línea de tiempo (0–100, defecto 50)
destacado: 2                         # Aparece en el carrusel del hero; entero, menor = primero
imagen: ../../assets/proyectos/x.png # Imagen de la card y og:image
portada: ../../assets/proyectos/x.png # Portada en el hero de la ficha (si difiere de imagen)
trailer: /videos/mi-trailer.mp4      # Vídeo en el hero (reemplaza a portada)
descripcion: "Frase breve"           # Subtítulo en el hero y og:description
tecnologias: [Python, Blender]       # Etiquetas de tech mostradas en la ficha
link: https://...                    # Botón "Visitar proyecto" en el hero
enlaceExterno: https://...           # La card enlaza fuera en vez de a la ficha interna
ocultarFecha: true                   # Oculta el rango de fechas en la card
premio: "Mejor cortometraje"         # Badge dorado en el hero (🏆)
sub:                                 # Sub-items anidados en la línea de tiempo
  - titulo: Sub-proyecto
    descripcion: Texto breve
    categoria: programacion          # ID de categoría (singular)
    fecha: "2024"
    imagen: ../../assets/proyectos/sub.png
    link: /proyectos/slug#seccion    # Enlace interno con ancla
---
```

### IDs de categorías disponibles

| ID | Color de acento |
|----|----------------|
| `programacion` | azul `#0098FF` |
| `video` | violeta `#5A598E` |
| `vfx` | naranja `#e87d0d` |
| `diseño-grafico` | verde `#a7f175` |
| `fotografia` | — |
| `desarrollo-web` | — |

---

## 2. Encabezados en el cuerpo

El `<h1>` lo genera la página automáticamente con `titulo`. En el cuerpo usa desde `##`:

```markdown
## Sección principal       → 1.7 rem, blanco
### Subsección             → 1.4 rem, blanco
#### Detalle pequeño       → 1.1 rem, azul claro
```

---

## 3. Texto básico

```markdown
Párrafo normal.

**Negrita** → texto en azul claro (#93c5fd)
*Cursiva* o _cursiva_
~~Tachado~~
```

---

## 4. Listas

```markdown
- Elemento A
- Elemento B
  - Sub-elemento (indentar 2 espacios)

1. Primer paso
2. Segundo paso
```

---

## 5. Enlaces

```markdown
[Texto del enlace](https://ejemplo.com)

URL directa: https://ejemplo.com  ← también se enlaza sola

Enlace interno con ancla: [ver la sección](#streaming)
```

Los enlaces aparecen en azul claro con subrayado. El ID del ancla lo genera Astro automáticamente a partir del texto del encabezado (minúsculas, espacios → guión).

---

## 6. Imágenes

```markdown
![Descripción](../../assets/proyectos/imagen.png)
```

Las imágenes del contenido se muestran redondeadas con sombra. Coloca siempre los archivos en `src/assets/proyectos/` para que Astro los optimice.

### Galería de imágenes (lightbox)

Para mostrar varias fotos en una cuadrícula que se amplíe a pantalla completa al hacer clic, envuélvelas en un `<div class="pd-galeria">` con imágenes markdown normales dentro:

```html
<div class="pd-galeria">

![Descripción foto 1](../../assets/proyectos/mi-foto-1.jpg)

![Descripción foto 2](../../assets/proyectos/mi-foto-2.jpg)

![Descripción foto 3](../../assets/proyectos/mi-foto-3.jpg)

</div>
```

Deja siempre una línea en blanco después del `<div>`, entre cada imagen y antes del `</div>`, igual que con `pd-seccion` (sección 11), para que Astro procese el markdown interior.

- Coloca las imágenes en **`src/assets/proyectos/`** y referéncialas con ruta relativa (`../../assets/proyectos/...`), igual que cualquier otra imagen del cuerpo — así Astro las optimiza en el build. **No** uses `public/` ni una etiqueta `<img>` cruda: quedaría sin optimizar y el lightbox no tendría las dimensiones para maquetar bien.
- La cuadrícula recorta las miniaturas a 4:3. Al hacer clic se abren a pantalla completa (con [PhotoSwipe](https://photoswipe.com/)) y se puede navegar entre las fotos de esa misma galería con flechas o gestos táctiles.

---

## 7. Cita destacada (blockquote)

```markdown
> Texto de la cita.
> Puede tener varias líneas.
```

Se renderiza con fondo degradado azul/violeta y borde izquierdo azul, en cursiva.

---

## 8. Código

````markdown
Inline: `comando` o `variable`

Bloque:
```python
print("hola mundo")
```
````

El inline usa fondo oscuro y color lavanda. Los bloques de código heredan el mismo estilo.

---

## 9. Vídeos

Los vídeos del cuerpo se renderizan con **Video.js v10**, un reproductor moderno basado en
Web Components con controles personalizados, barra de progreso, volumen y pantalla completa.
Solo se admiten dos tipos de fuente: **MP4** (u otro formato que reproduzca el navegador de
forma nativa) y **HLS fragmentado** (`.m3u8`). **No hay soporte para embeds de YouTube/Vimeo**
(Video.js v10 todavía no lo implementa en esta beta).

Se escribe siempre con una etiqueta `<video>` normal — el script de la página la detecta y la
convierte automáticamente en el reproductor:

```html
<video src="/videos/mi-video.mp4" controls></video>
```

```html
<video src="/videos/mi-video/master.m3u8" controls></video>
```

El tipo se decide por la URL: si termina en `.m3u8` se reproduce como HLS (con el reproductor
HLS integrado de Video.js); cualquier otra extensión se trata como vídeo normal.

### Selector de calidad

Si el `.m3u8` es un *master playlist* con varias resoluciones (ver "Cómo codificar el vídeo"
más abajo), el reproductor añade automáticamente un selector de calidad al menú de ajustes (⚙️):
"Auto" más una entrada por cada resolución disponible. Con un HLS de una sola calidad, o con
MP4, esa entrada no aparece (solo queda la de velocidad de reproducción) — no hace falta marcar
nada a mano, se detecta solo según cuántas resoluciones traiga el vídeo.

`controls` no cambia el aspecto (el reproductor siempre pone sus propios controles) pero
consérvalo: es lo que hace que el `<video>` funcione como vídeo nativo de respaldo si el
JavaScript no llega a cargar. Atributos opcionales que también se admiten: `poster`,
`autoplay`, `muted`, `loop`, `playsinline`, `preload`.

### Dónde colocar los archivos

A diferencia de las imágenes (`![](../../assets/...)`), los vídeos **no** se procesan con el
optimizador de Astro: la etiqueta `<video>` pasa tal cual al HTML final. Colócalos en
**`public/videos/`** y referencia la ruta absoluta desde ahí:

```
public/
└── videos/
    ├── mi-video.mp4                  → /videos/mi-video.mp4
    └── mi-video-hls/
        ├── master.m3u8                → /videos/mi-video-hls/master.m3u8
        ├── 1080p/
        │   ├── prog.m3u8
        │   └── seg_000.ts, seg_001.ts...
        ├── 720p/
        │   ├── prog.m3u8
        │   └── seg_000.ts, seg_001.ts...
        └── 480p/
            ├── prog.m3u8
            └── seg_000.ts, seg_001.ts...
```

Un HLS son varios archivos (una playlist `.m3u8` + los segmentos `.ts` que referencia): copia
la carpeta entera a `public/`. Si el master agrupa varias resoluciones (una subcarpeta por
calidad, como arriba) aparece el selector de calidad; con un solo `.m3u8` sin subcarpetas
(HLS de una única calidad) funciona igual, solo que sin selector.

### Cómo codificar el vídeo

Con [ffmpeg](https://ffmpeg.org/) instalado:

**MP4** (H.264 + AAC, con `faststart` para que empiece a reproducirse antes de descargarse entero):

```bash
ffmpeg -i entrada.mov -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 160k -movflags +faststart mi-video.mp4
```

- `-crf 20` — calidad (18–23 es un buen rango; menor = más calidad y más peso).
- `-preset slow` — mejor compresión a cambio de más tiempo de codificación (`fast`/`medium` si tienes prisa).

**HLS** (segmenta un vídeo ya codificado en una playlist `.m3u8` + trozos `.ts` de 6 segundos):

```bash
ffmpeg -i entrada.mov -vf scale=1920:1080 -c:v libx264 -crf 20 -preset slow -force_key_frames "expr:gte(t,n_forced*6)" -c:a aac -b:a 128k -hls_time 6 -hls_playlist_type vod -hls_segment_filename "seg_%03d.ts" master.m3u8
```

Úsalo para vídeos largos (streamings, making-ofs) donde interese que el navegador vaya
pidiendo trozos en vez de descargar el archivo entero de golpe. Para clips cortos, MP4 normal
es más simple y suficiente.

**HLS con varias calidades** (genera varias resoluciones más el `master.m3u8` que las agrupa,
en un solo comando — es lo que hace falta para que aparezca el selector de calidad):

```bash
ffmpeg -i entrada.mov -filter_complex \
  "[0:v]split=3[v1][v2][v3]; \
   [v1]scale=w=1920:h=1080[v1out]; \
   [v2]scale=w=1280:h=720[v2out]; \
   [v3]scale=w=854:h=480[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -crf 20 -preset slow -b:v:0 5000k \
  -map "[v2out]" -c:v:1 libx264 -crf 20 -preset slow -b:v:1 2800k \
  -map "[v3out]" -c:v:2 libx264 -crf 20 -preset slow -b:v:2 1400k \
  -map a:0 -map a:0 -map a:0 -c:a aac -b:a 128k \
  -f hls -hls_time 6 -hls_playlist_type vod \
  -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p" \
  -master_pl_name master.m3u8 \
  -hls_segment_filename "%v/seg_%03d.ts" "%v/prog.m3u8"
```

Genera las subcarpetas `1080p/`, `720p/` y `480p/` (cada una con su `prog.m3u8` y sus
segmentos) más el `master.m3u8` que las agrupa — la estructura de la sección anterior. Ajusta
resoluciones y bitrates al vídeo de origen (no subas de su resolución nativa); añade o quita
variantes cambiando el número en `split=N` y repitiendo el patrón `scale`/`-map`/`-c:v:N`.

Los vídeos se muestran redondeados con sombra, igual que las imágenes.

---

## 10. Desplegable `<details>`

Útil para información secundaria o listas largas:

```html
<details>
<summary>Título del desplegable</summary>

Contenido oculto hasta que el usuario haga clic.
Puede contener markdown normal: listas, párrafos, etc.

</details>
```

Deja una línea en blanco entre el `<summary>` y el contenido para que el markdown se procese correctamente.

---

## 11. Sección con franja de color (`pd-seccion`)

Agrupa contenido relacionado con una categoría concreta mediante una barra lateral de color:

```html
<div class="pd-seccion" data-cat="video">

### Título de la subsección

Párrafo y cualquier otro markdown aquí.

</div>
```

| `data-cat` | Color de la barra |
|------------|-------------------|
| `programacion` | azul `#0098FF` |
| `video` | violeta `#5A598E` |
| `vfx` | naranja `#e87d0d` |
| `diseño-grafico` | verde `#a7f175` |
| *(sin data-cat)* | blanco tenue |

Deja siempre una línea en blanco después del `<div>` y antes del `</div>` para que Astro procese el markdown interior.

Las secciones se pueden anidar:

```html
<div class="pd-seccion" data-cat="programacion">

### Nivel 1

<div class="pd-seccion" data-cat="vfx">

#### Nivel 2 anidado

</div>

</div>
```

---

## 12. Anclas para sub-items

Si un sub-item del frontmatter apunta a `link: /proyectos/slug#seccion`, la sección debe existir en el cuerpo. Los encabezados generan anclas automáticamente:

```markdown
## Entradas        → ancla #entradas
## Web             → ancla #web
### Mi sección     → ancla #mi-sección
```

---

## 13. Pestañas (`data-tab`)

Si un proyecto tiene varias secciones con `##`, puedes convertirlas en **pestañas seleccionables** con icono y color de categoría.

En vez de `##`, escribe `<h2 data-tab="id-categoria">`:

```html
<h2 data-tab="video">Streaming</h2>

Contenido de la pestaña (markdown normal).

<h2 data-tab="programacion">Web</h2>

Contenido de la pestaña.

<h2 data-tab="programacion">Entradas</h2>

Contenido de la pestaña.
```

| Regla | Detalle |
|-------|---------|
| `data-tab` | ID de categoría de `categorias.json` — define el color del underline y el icono |
| Mínimo | Debe haber al menos **2** `h2` con `data-tab` para que aparezcan las pestañas |
| Sin `data-tab` | Los `h2` sin `data-tab` se renderizan como títulos normales, no se convierten en pestañas |
| Anclas | Se generan automáticamente del texto (ej. `Streaming` → `#streaming`), igual que con `##` |
| Contenido | Todo lo que sigue al `h2` hasta el siguiente pertenece a esa pestaña |

Se usa junto con `pd-seccion` para categorizar el interior de cada pestaña si hace falta:

```html
<h2 data-tab="video">Streaming</h2>

<div class="pd-seccion" data-cat="video">

### Sistema de cámaras

Texto técnico sobre vídeo.

</div>
```

---

## Ejemplo completo

```markdown
---
titulo: Mi Proyecto
fecha: "2024-01"
categorias: [programacion, video]
peso: 70
imagen: ../../assets/proyectos/mi-proyecto.png
descripcion: Una frase corta y descriptiva.
tecnologias: [Python, Blender]
link: https://github.com/usuario/repo
---

### ¿Qué es este proyecto?

Una descripción en un par de párrafos. Con **términos clave** en negrita
y [enlace al repo](https://github.com/usuario/repo) cuando sea relevante.

## Primera sección

<div class="pd-seccion" data-cat="programacion">

### Detalle técnico

Explicación con código inline: `pip install xyz`.

<details>
<summary>Pasos de instalación</summary>

1. Clona el repositorio
2. Instala dependencias
3. Ejecuta `python main.py`

</details>

</div>

## Segunda sección

> Nota importante o cita destacada.

![Captura de pantalla](../../assets/proyectos/captura.png)
```
