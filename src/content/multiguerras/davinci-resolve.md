---
titulo: DaVinci Resolve
orden: 7
categoria: video
resumen: Servidor colaborativo con PostgreSQL, organización de escenas y metadatos.
---

## PostgreSQL

Para colaborar en el mismo proyecto metí en la RPI4 una base de datos PostgreSQL que guarde el proyecto de Resolve.

## VFX

### Metadatos
Se usó la claqueta virtual de la cámara para determinar la escena y toma que se estaba grabando. 
Y también, gracias al metadato del objetivo se podía saber qué cámara había que configurar en Unreal.

### Composición
Con los metadatos extraídos desde Unreal a CSV (proceso explicado [aquí](#emparejamiento-de tomas-reales-y-virtuales)) se metían las dos tomas con el mismo metadato de escena en una secuencia multicamara y luego se copia a una timeline donde se aplica la pantalla verde, corrección de color y VFX que necesite esa escena.

## Montaje

Ya que cada escena estaba en su respectiva Timeline, era solo arrastrarla en una timeline master.
