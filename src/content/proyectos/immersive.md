---
titulo: Immersive
fecha: "2026-02"
fechaFin: ahora
categorias: [programacion]
peso: 75
destacado: 3
imagen: ../../assets/proyectos/immersive.webp
video: /proyvid/immersive-vr.mp4
trailer: /proyvid/immersive-vr.mp4
descripcion: Alternativa open source a Immersed - tus monitores del PC dentro de unas gafas de realidad virtual.
tecnologias: [Godot 4, OpenXR, C++, DXGI, NVENC, WebXR, Node.js]
link: https://github.com/PGSCOM/Immersive
---

<!-- TODO: motivación (qué gafas tienes, por qué no te valía Immersed) -->

## Qué hace

Programa en el PC que captura las pantallas y las envía por Wi-Fi a unas gafas (Quest, Pico 4), donde aparecen monitores flotantes. También admite crear monitores virtuales. Es una alternativa open source a [Immersed](https://immersed.com/).

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


## Demo

<video src="/proyvid/immersive-vr.mp4" width="1920" height="1080" controls preload="none"></video>
