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
txtboton: "Ver la demo"              # Texto de ese botón (defecto: "Visitar proyecto")
enlaceExterno: https://...           # La card enlaza fuera en vez de a la ficha interna
urlvideopage: https://cdn/master.m3u8 # Genera /proyectos/<id>/video (página solo con el vídeo, Video.js)
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

### Galería de imágenes / vídeo (lightbox)

Para mostrar varias fotos o vídeos en una cuadrícula que se amplíe a pantalla completa al hacer clic, envuélvelos en un `<div class="pd-galeria">`:

```html
<div class="pd-galeria">

![Descripción foto 1](../../assets/proyectos/mi-foto-1.jpg)

![Descripción foto 2](../../assets/proyectos/mi-foto-2.jpg)

<video src="/videos/mi-clip.mp4" muted></video>

![Descripción foto 3](../../assets/proyectos/mi-foto-3.jpg)

</div>
```

Deja siempre una línea en blanco después del `<div>`, entre cada elemento y antes del `</div>`, igual que con `pd-seccion` (sección 11), para que Astro procese el markdown interior.

- **Imágenes**: colócalas en `src/assets/proyectos/` y referéncialas con ruta relativa (`../../assets/proyectos/...`) — así Astro las optimiza. **No** uses `public/` ni una etiqueta `<img>` cruda: quedaría sin optimizar y el lightbox no tendría las dimensiones para maquetar bien.
- **Vídeos**: coloca el archivo en `public/videos/` y referéncialo con ruta absoluta (`/videos/...`), igual que los vídeos del cuerpo (sección 9). **No hace falta poner `poster` a mano**: `npm run dev`/`build` genera automáticamente una miniatura junto al vídeo (mismo nombre, `.webp`) — ver "Miniaturas automáticas" al final de la sección 9. Si quieres una miniatura distinta a la que sale sola, pon tu propio `poster="/videos/mi-clip.jpg"` (cualquier formato de imagen vale para una puesta a mano) y se respeta. Añade también `width`/`height` con las dimensiones reales del clip: el lightbox los usa para maquetar el vídeo con el aspecto correcto antes de que carguen sus metadatos (sin ellos, cae a 1920×1080 y un clip vertical sale mal encajado). El vídeo se abre en el lightbox con controles nativos.

La cuadrícula recorta las miniaturas a 4:3. Al hacer clic se abren a pantalla completa (con [PhotoSwipe](https://photoswipe.com/)) y se puede navegar entre fotos y vídeos de esa misma galería con flechas o gestos táctiles.

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

### Miniaturas automáticas

No hace falta escribir `poster` a mano para un vídeo **local** (uno servido desde `public/`,
no un stream remoto): `npm run dev` y `npm run build` generan solos una miniatura junto a cada
vídeo sin miniatura (mismo nombre, extensión `.webp`, extraída del propio clip con ffmpeg y
comprimida con Sharp — ver `scripts/generate-posters.mjs`). Si ya existe un fichero con ese
nombre, o si el `<video>` trae su propio `poster`, no se toca. Para forzar la generación sin
arrancar el servidor: `npm run posters`.

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

### Comparador antes/después (`VideoCompareSlider`)

Para comparar dos vídeos del mismo plano con una barra que se arrastra (p. ej.
original vs. editado), usa el componente `VideoCompareSlider`. A diferencia de
los vídeos del cuerpo, **no** pasa por Video.js: sus dos `<video>` son nativos,
van a tamaño fijo (100% del contenedor) y el de la izquierda se recorta con
`clip-path`, así que ningún vídeo se redimensiona al mover la barra.

El archivo tiene que ser **`.mdx`** (un `.md` no puede importar componentes). El
import va arriba del todo, y el componente se escribe donde vaya la comparación:

```mdx
import VideoCompareSlider from '../../components/VideoCompareSlider.astro';

<VideoCompareSlider
  beforeSrc="/videos/mi-clip/antes.mp4"
  afterSrc="/videos/mi-clip/despues.mp4"
  beforeLabel="Original"
  afterLabel="Editado"
/>
```

| Prop | Obligatorio | Descripción |
|------|-------------|-------------|
| `beforeSrc` | ✅ | URL del vídeo que se ve a la izquierda de la barra |
| `afterSrc` | ✅ | URL del vídeo que se ve a la derecha de la barra |
| `beforeLabel` | — | Etiqueta superior izquierda; si se omite, no se dibuja ninguna |
| `afterLabel` | — | Etiqueta superior derecha; si se omite, no se dibuja ninguna |
| `poster` | — | Miniatura para ambos vídeos antes de que carguen (opcional: arrancan en autoplay mudo) |

Comportamiento:

- **Sincronizados y en bucle**: ambos arrancan juntos en `currentTime = 0`, van
  con `loop` y un temporizador corrige la deriva si se desfasan más de 0,4 s.
- **La barra solo se mueve al clicar y arrastrar** (no en hover). También
  responde al teclado si el asa está enfocada: `←`/`→` (2 en 2, `Shift` = 10),
  `Inicio`/`Fin` para ir a los extremos.
- Los archivos van en `public/` y se referencian con ruta absoluta, igual que
  los vídeos normales de esta sección. Es el autor quien debe garantizar que
  ambos clips tengan la misma duración y arranquen en el mismo instante: el
  componente sincroniza la reproducción, no los contenidos.
- Se usa dentro de los capítulos de Multiguerras (`src/content/multiguerras/*.mdx`),
  donde el import es exactamente el del ejemplo.

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

## 14. Micrositio de capítulos (Multiguerras)

El proyecto **Multiguerras** no usa una ficha normal: en vez de un único `.md`, su
contenido se reparte en varios capítulos independientes dentro de
`src/content/multiguerras/*.md`. La página `src/pages/proyectos/multiguerras.astro`
los lee todos, genera el índice lateral con acordeones y los renderiza uno tras otro
en scroll continuo. Esta sección explica cómo escribir esos capítulos; el resto de la
guía (secciones 1–13: negrita, listas, galerías, vídeos, `pd-seccion`, `details`...)
sigue aplicando igual dentro del cuerpo de cada capítulo.

### Frontmatter de un capítulo

```yaml
---
titulo: Render distribuido            # OBLIGATORIO — título del capítulo (h2 e índice)
orden: 11                             # OBLIGATORIO — posición en el índice y el scroll
categoria: programacion               # OBLIGATORIO — programacion | video | vfx
resumen: Cómo se coordina el render entre Raspberry Pi y workers.  # Opcional
imagen: ../../assets/proyectos/multiguerras/render.jpg            # Opcional
---
```

- **`titulo`**, **`orden`** y **`categoria`** son obligatorios; `categoria` solo admite
  `programacion`, `video` o `vfx` (colorea el número del capítulo, el punto del índice
  y el borde activo).
- **`resumen`** es una frase corta que aparece bajo el título del capítulo, en la
  cabecera de la sección.
- **`imagen`** es opcional y activa un fondo bajo demanda: si se define, la cabecera
  del capítulo pasa a ser un banner con esa foto de fondo (oscurecida con un
  degradado) y el número del capítulo como marca de agua grande sobre la imagen. Sin
  `imagen`, la cabecera es plana, con el número pequeño de siempre. Colócala en
  `src/assets/proyectos/` como cualquier otra imagen de proyecto (sección 6) para que
  Astro la optimice.

### Nombre de archivo y orden

El nombre del archivo (`render-distribuido.md`) es el slug (`#render-distribuido`)
que usa el índice y las anclas internas — no tiene por qué coincidir con `orden`, pero
conviene que sea descriptivo. `orden` es el número que decide dónde aparece el
capítulo en el índice y en el scroll; dos capítulos no deberían compartir `orden`.

### Subtítulos del índice (acordeón)

Cada `##` (h2) que uses en el cuerpo del capítulo aparece automáticamente como
subtítulo plegable bajo ese capítulo en el índice lateral (un acordeón con chevrón,
que se despliega solo al hacer scroll a ese capítulo o al pulsar el chevrón a mano).
No hace falta marcarlo con ningún atributo especial — a diferencia de las pestañas
`data-tab` (sección 13), que no se usan aquí:

```markdown
## Flamenco

Texto del apartado.

### ¿Qué es?

Los `###` (h3) no aparecen en el acordeón — solo estructuran el texto dentro del
apartado, igual que en una ficha normal.

## SheepIt

Otro apartado, otro subtítulo en el acordeón.
```

Los `##` de capítulos distintos pueden repetir el mismo texto (p. ej. varios
capítulos tienen un apartado "Organización") sin conflicto: el enlace de cada
subtítulo se resuelve siempre dentro de su propio capítulo, nunca por un id global.

### Ejemplo de capítulo completo

```markdown
---
titulo: Render distribuido
orden: 11
categoria: programacion
resumen: Cómo se coordina el render entre Raspberry Pi y workers.
imagen: ../../assets/proyectos/multiguerras/render.jpg
---

## Flamenco

### ¿Qué es?

Explicación breve.

### Instalación

Pasos de instalación, con código inline: `pip install flamenco`.

## SheepIt

¿Por qué se usó como alternativa? Ventajas y economía de puntos.
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
