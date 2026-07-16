---
titulo: El Periodo de Multiguerras
fecha: 2023-05
fechaFin: 2025
categorias: [programacion, video, vfx]
peso: 100
destacado: 1
descripcion: Desarrollo de un pipeline completo de producción virtual para un cortometraje de ciencia ficción, combinando programación, servidores, render distribuido, Unreal Engine 5, Blender y DaVinci Resolve.
tecnologias: [Blender, OBS Studio, App Inventor, Firebase, Web]
link: https://premiosmacula.es
---

<h2 data-tab="video">Introducción</h2>

> Explicar qué es Multiguerras y por qué este proyecto no consiste únicamente en
> hacer un cortometraje, sino en diseñar un pipeline completo de producción.

---

## Objetivos

- ¿Qué quería conseguir?
- ¿Qué problemas existían?
- ¿Por qué decidí crear tantas herramientas propias?
- ¿Qué limitaciones económicas tenía?

---

## Planificación

### Guion

- Cómo nació la idea.
- Referencias.
- Evolución del guion.

### Organización

- Telegram.
- Canales.
- Gestión del proyecto.
- Reparto de tareas.

### Decisiones técnicas

- 30 fps vs 24 fps.
- SDR vs HDR.
- Formato de grabación.
- Organización de archivos.

---

<h2 data-tab="programacion">Infraestructura</h2>

## Arquitectura general

> Explicar toda la infraestructura.

- Raspberry Pi
- Ordenadores
- Red local
- VPN
- Almacenamiento

Añadir diagrama.

---

## Raspberry Pi

### Hardware

- Carcasa diseñada en FreeCAD.
- Pantalla.
- Alimentación.
- Enchufe inteligente.

### Servicios

- PostgreSQL
- Flamenco
- Gitea
- Servidor de archivos

---

## VPN

### Hamachi

- Primeras pruebas.
- Limitaciones.

### ZeroTier

- Motivos del cambio.
- Funcionamiento.

---

## Sistema de copias de seguridad

Explicar:

- Disco duro
- Ordenador
- Raspberry
- Telegram
- OneDrive

¿Por qué cinco copias?

---

<h2 data-tab="programacion">Programación</h2>

## Git

- Organización
- Branches
- Versionado

## Gitea

- Repositorios
- Desarrollo colaborativo

## Go

- Compilación de Flamenco.

## JavaScript

- Frontend de Flamenco.

## Automatizaciones

- Scripts.
- Herramientas.
- Procesos automáticos.

---

<h2 data-tab="video">Producción Virtual</h2>

## Unreal Engine 5

### ¿Por qué Unreal?

### Organización del proyecto

### Sequencer

### Movie Render Queue

### Materiales

### Optimización

---

## Cámara Virtual

### VCam

- Configuración.

### LiDAR

- Funcionamiento.

### ARKit

- Tracking.

### Timecode

- Sincronización.

---

## MetaHuman

- Captura facial.
- Integración.

---

<h2 data-tab="vfx">Blender</h2>

## Modelado

- Assets.
- Escenarios.

---

## Portal

### Primera versión

### Volúmenes

### Shader

### Optimización

Comparar todas las versiones.

---

## Simulaciones

- Humo.
- Partículas.
- Física.

---

## Composición

- Cycles
- Eevee
- Shadow Catcher
- Alpha

Explicar el flujo completo.

---

<h2 data-tab="programacion">Render distribuido</h2>

## Flamenco

### ¿Qué es?

### Instalación

### Compilación

### Raspberry Pi

### Workers

### Funcionamiento

Poner esquema.

---

## SheepIt

¿Por qué cambiar?

Ventajas.

Economía de puntos.

Google Colab.

---

<h2 data-tab="video">DaVinci Resolve</h2>

## PostgreSQL

Servidor colaborativo.

---

## Organización

- Escenas.
- Tomas.
- Bandejas.

---

## Metadatos

- Cámara.
- Lentes.
- Timecode.

---

## Flujo de trabajo

Desde Unreal hasta Resolve.

---

<h2 data-tab="vfx">VFX</h2>

## Chroma

## Tracking

## Matchmoving

## Composición

## Integración CGI

## Render EXR

## Corrección de color

---

<h2 data-tab="video">Audio</h2>

## Banda sonora

Referencias.

Proceso creativo.

---

## Diseño sonoro

Efectos.

Foley.

Mezcla.

---

<h2 data-tab="video">Producción</h2>

## Rodaje

Material utilizado.

Problemas.

Soluciones.

---

## Organización

Cronograma.

Equipo.

Comunicación.

---

<h2 data-tab="programacion">Problemas encontrados</h2>

#<h2 data-tab="programacion">Infraestructura</h2>

## Render

## Unreal

#<h2 data-tab="vfx">Blender</h2>

## Tracking

## DaVinci

## Organización

Explicar cómo se solucionó cada uno.

---

<h2 data-tab="video">Resultados</h2>

## Qué funcionó

## Qué cambiaría

## Qué aprendí

## Impacto del proyecto

---

<h2 data-tab="video">Galería</h2>

- Concept Art
- Behind the Scenes
- Blender
- Unreal
- Rodaje
- Comparativas Before/After

---

<h2 data-tab="video">Vídeos</h2>

- Tráiler
- Making Of
- Streaming completo
- Time-lapse
- Render Farm

---

<h2 data-tab="programacion">Tecnologías utilizadas</h2>

Separar por categorías.

#<h2 data-tab="programacion">Programación</h2>

...

#<h2 data-tab="programacion">Infraestructura</h2>

...

#<h2 data-tab="video">Producción Virtual</h2>

...

#<h2 data-tab="vfx">VFX</h2>

...

## Software

...

## Hardware

...

---

<h2 data-tab="programacion">Estadísticas</h2>

Añadir datos como:

- Tiempo de desarrollo
- Líneas de código
- Servidores montados
- Escenas renderizadas
- Horas de render
- Tamaño del proyecto
- Número de assets
- Versiones del portal
- Personas implicadas

---

<h2 data-tab="vfx">Conclusiones</h2>

Explicar por qué este proyecto representa la unión entre:

- Ingeniería informática
- Programación
- Redes
- Producción virtual
- Gráficos por ordenador
- VFX
- Automatización
- Producción audiovisual