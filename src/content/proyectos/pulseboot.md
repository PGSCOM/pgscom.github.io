---
titulo: PulseBoot
fecha: "2026-08"
categorias: [programacion]
peso: 55
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Un ESP32 que sustituye el botón de encendido del PC y lo conecta a la domótica.
tecnologias: [ESP32-C6, ESP-IDF, PlatformIO, Matter, ESPHome, MQTT, Home Assistant]
link: https://github.com/PGSCOM/PulseBoot
txtboton: Ver en GitHub
---

<!-- TODO: foto del montaje dentro de la torre -->

## Qué hace

Un módulo **ESP32-C6** va conectado al botón de encendido de la placa base y lo expone de tres formas a la vez:

- **Matter**: se empareja directamente con Google Home o Apple Home, sin hub.
- **ESPHome**: integración nativa con Home Assistant.
- **MQTT + REST**: para Node-RED, scripts o apps propias.

Lee la señal `PWR_OK` de la fuente para saber si el PC está realmente encendido.

## Firmware

- ESP-IDF sobre PlatformIO, con CI.
- Configuración Wi-Fi por portal cautivo y actualizaciones OTA.
- Licencia MIT para el firmware y CERN-OHL-S para el hardware.

<!-- TODO: pendiente el backend en Cloudflare con panel web -->
