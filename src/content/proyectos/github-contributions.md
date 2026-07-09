---
titulo: Contribuciones Open Source
fecha: "2026-03"
categorias: [programacion]
peso: 65
imagen: ../../assets/proyectos/Contribuciones.png
descripcion: PRs merged en proyectos reales — VDO.ninja (WebRTC, ~6k ⭐) y go-ios (automatización iOS).
tecnologias: [JavaScript, Go, Git, GitHub]
link: https://github.com/PGSCOM
---

Contribuciones directas a proyectos de código abierto con impacto real, todas aceptadas por sus mantenedores.

---

## VDO.Ninja

Plataforma de streaming y videollamadas basada en WebRTC, con más de 6 000 estrellas en GitHub. Usada en producción por streamers, broadcasters y estudios de grabación remota.

### [#1182 — Complete Spanish translation](https://github.com/steveseguin/vdo.ninja/pull/1182) · Abril 2025

Completé la traducción al español de VDO.ninja: más de 500 líneas actualizadas en el fichero de localización, incluyendo cadenas del menú principal que no se habían sincronizado con la versión inglesa.

### [#1184 — Fix: Language reorder by time zone](https://github.com/steveseguin/vdo.ninja/pull/1184) · Abril 2025

Corregí un bug en el menú "Available Languages": el código reordenaba opciones seleccionando solo el elemento `<a>` en lugar del `<li>` padre, rompiendo el orden de la lista para usuarios fuera de inglés. Con el fix, el idioma del navegador sube correctamente al segundo puesto sin desplazar el resto de opciones.

---

## go-ios

Implementación multiplataforma e independiente del SO de las funcionalidades de dispositivos iOS. Ampliamente usado en pipelines de CI/CD para automatización de tests y gestión de apps.

### [#688 — Fix IPv6 header check](https://github.com/danielpaulus/go-ios/pull/688) · Marzo 2026

Corregí la detección de paquetes IPv6 en el parser de red: el código usaba un valor hardcodeado en lugar de verificar el campo `version` de la cabecera IP, lo que impedía añadir soporte para los bytes de Traffic Class. El cambio garantiza que la identificación del protocolo es correcta independientemente de los bits adyacentes.
