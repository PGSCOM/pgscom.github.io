---
titulo: Immersive
fecha: "2026-02"
fechaFin: ahora
categorias: [programacion]
peso: 75
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Alternativa open source a Immersed - tus monitores del PC dentro de unas gafas de realidad virtual.
tecnologias: [Godot 4, OpenXR, C++, DXGI, NVENC, WebXR, Node.js]
link: https://pgscom.github.io/Immersive/
---

<!-- TODO: motivación (qué gafas tienes, por qué no te valía Immersed) -->

## Qué hace

Un programa en el PC captura las pantallas y las envía por Wi-Fi a unas gafas (Quest, Pico 4), donde aparecen como hasta **3 paneles flotantes**.

- Teclado virtual QWERTY dentro de la VR.
- Foveated rendering con eye-tracking, hand tracking (pinch) y passthrough.
- Audio del PC (WASAPI loopback).
- Hasta **4 gafas conectadas a la vez**.
- Driver de pantalla virtual (IDD) para tener monitores que no existen físicamente.
- Cliente WebXR alternativo con un puente en Node.js.

## Cómo funciona

### Host (Windows / Linux / macOS)

Captura con **DXGI Desktop Duplication** y codifica por software (MJPEG) o por hardware (**NVENC / AMF / QSV** vía Media Foundation). Control por TCP y vídeo por UDP.

### Cliente

Hecho en **Godot 4 + OpenXR**. La arquitectura y el protocolo están documentados en el repo (`ARCHITECTURE.md`, `PROTOCOL.md`) y hay CI en GitHub Actions para el host y el export de Godot.

<!-- TODO: vídeo grabado desde las gafas -->
