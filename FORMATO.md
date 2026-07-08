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

Los vídeos del cuerpo se renderizan con **Plyr**, un reproductor personalizado con controles, barra de progreso, volumen y pantalla completa. Se integran automáticamente escribiendo HTML estándar de `<video>` en el markdown:

```html
<video src="../../assets/proyectos/mi-video.mp4" controls></video>
```

También se aceptan fuentes externas (YouTube, Vimeo) indicando `src` directamente:

```html
<video src="https://www.youtube.com/watch?v=VIDEO_ID" controls></video>
```

> **Nota**: el atributo `controls` activa Plyr, pero puedes omitirlo para que el vídeo sea mudo/fondo. Siempre es mejor ponerlo para que Plyr pueda tomar el control.

Los vídeos se muestran redondeados con sombra, igual que las imágenes. Los archivos deben colocarse en `src/assets/proyectos/` para que Astro los procese.

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
