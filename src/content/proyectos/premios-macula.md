---
titulo: Premios Mácula
fecha: "2022-05"
fechaFin: ahora
categorias: [programacion, video, vfx]
peso: 80
destacado: 2
imagen: ../../assets/proyectos/Macula.png
descripcion: Gala de premios escolar
tecnologias: [Blender, OBS Studio, App Inventor, Firebase, Web]
ocultarFecha: true
link: https://premiosmacula.es
sub:
  - titulo: Sistema de entradas
    descripcion: Sistema de generación y validación de entradas con QR.
    categoria: programacion
    fecha: "2024"
    imagen: ../../assets/proyectos/Herramientas.png
    link: /proyectos/premios-macula#entradas

  - titulo: Diseño y programación de página web
    fecha: "2023"
    categoria: programacion
    link: /proyectos/premios-macula#web
    
  - titulo: Streaming en directo
    fecha: "2022"
    categoria: video
    link: /proyectos/premios-macula#streaming
  
  - titulo: Video introductorio del streaming
    fecha: "2026"
    categoria: vfx
    
---

### ¿Qué es este proyecto?

Los Premios Mácula son una gala de premios de cortometrajes hechos por los alumnos del Colegio San Agustín de Santander. Yo me ofrecí a ayudar desde 2022 con el streaming en directo junto a un compañero mío. Y desde entonces, fuí añadiendo mis aportaciones al proyecto interno.

<h2 data-tab="video">Streaming</h2>

El sistema que tenían anteriormente era muy rudimentario, eran dos ordenadores haciendo 2 streaming por separado en YouTube sin conexión de los micrófonos.

A partir de esa idea, propuse un sistema con OBS Studio y [vdo.ninja](https://github.com/steveseguin/vdo.ninja)

<div class="pd-seccion" data-cat="video">

### Sistema de cámaras
A partir del proyecto vdo.ninja que conocía anteriormente, el Streaming podría tener varias cámaras simultaneas y conectadas mediante WebRTC (P2P) a OBS gracias a vdo.ninja. Para tener mayor estabilidad, también puse un router que posteriormente se cambió a una red mesh para mejorar la conexión al ordenador.

</div>

<div class="pd-seccion" data-cat="video">

### Audio
El audio produjo muchos problemas en todas las galas. Ya que el sistema de audio del colegio no estaba preparado para tener una salida hacia un ordenador y simultaneamente al altavoz original.

<details>
<summary>Problemas en directo</summary>

- En 2022 hubo problemas de conexión a internet por un cable defectuoso y fue necesario usar un móvil y la red 4G para poder retransmitir, aunque con cortes y retrasos.

- En 2024 falló el cable de retorno del sonido y se improvisó con un altavoz Bluetooth.

- En 2025 se incorporaron micrófonos inalámbricos para reducir fallos de audio.

- En 2026 se cambió el sistema de audio, pero siguieron los problemas para enviar el sonido al ordenador y la solución improvisada no funcionó.

</details>

</div>

<h2 data-tab="programacion">Web</h2>

Al ver que no había una manera facil de  acceder a todos los cortometrajes y ver sus nominados, se me ocurrió hacer una página web para poder ver los cortometrajes.

La primera versión fue la de [2023](https://premiosmacula.es/2023/) ([Código Fuente](https://github.com/MaculaCSA/maculacsa.github.io/tree/v1)) que era una página web más o menos simple donde en la versión de escritorio se podía ver una animación con un video mientras se hace scroll.

Al año siguiente ví que había que hacer que se pueda actualizar de forma facil y que se pueda ver los cortometrajes nominados de años pasados. Con esa idea hice desde cero una versión con React y con un script que monta la página web a partir de los datos de un .json.

Esta es la versión actual: https://premiosmacula.es ([Código Fuente](https://github.com/MaculaCSA/maculacsa.github.io))

<h2 data-tab="programacion">Entradas</h2>

<div class="pd-seccion" data-cat="programacion">

### Generación de entradas
Para poder generar entradas con QRs únicos he hecho multiples scripts en Python que a partir de un diseño en SVG, se generan varias entradas con los QRs generados a partir de un .txt con IDs generadas aleatoriamente.

<div class="pd-seccion" data-cat="programacion">

#### QRs generados por IA
Con [ComfyUI](https://comfy.org/) hice un workflow para sustituir la generación de QRs antigua para que cada QR tenga un diseño único.

</div>

</div>

<div class="pd-seccion" data-cat="programacion">

### Validación
Hice un sistema muy simple para poder validar las entradas de los asistentes. Consistía en una App programada con App Inventor que se conectaba a una base de datos en Firebase.

</div>