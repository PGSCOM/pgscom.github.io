---
titulo: Scripts de bolsillo
fecha: "2024-07"
fechaFin: "2026-09"
categorias: [programacion, vfx, diseño-grafico]
peso: 40
descripcion: Pequeñas herramientas para quitarme de encima tareas repetitivas, del escaneo 3D a la tableta Wacom.
tecnologias: [Python, Go, JavaScript, PowerShell, Telethon, go-ios, WireGuard]
experimento: true
paginaPropia: true
icono: bolsillo
estadoIA: generado
---

Cuatro herramientas pequeñas que no merecen ficha propia, pero que uso o he usado. Cada una resuelve un problema concreto que me encontré trabajando.

<h2 data-tab="diseño-grafico">SuperPreset4Wacom</h2>

El software de Wacom guarda la configuración de botones y aplicaciones en un `.wacomprefs`, pero no permite **combinar** dos. Si tienes los atajos de Blender en un perfil y los de Affinity en otro, tienes que elegir uno.

[SuperPreset4Wacom](https://pgscom.github.io/SuperPreset4Wacom/) es una web de un solo archivo que lee los dos perfiles (son XML) y genera uno nuevo:

- Lee el `ApplicationMap` de cada archivo y los botones asociados a cada aplicación.
- Cuatro modos de fusión: **A de base** más las apps que solo están en B (o al revés), o **fusión total** eligiendo cuál gana si hay conflicto.
- Funciona entero en el navegador: los perfiles no salen del ordenador.

Probada con el driver 6.4.8-6 en una Cintiq 22HD. → [Abrir la herramienta](https://pgscom.github.io/SuperPreset4Wacom/) · [Código](https://github.com/PGSCOM/SuperPreset4Wacom)

<h2 data-tab="vfx">3D Scanner a Luma AI</h2>

La app **3D Scanner** de iOS guarda, junto a cada fotograma, un `.json` con la pose de la cámara que calcula ARKit (`cameraPoseARFrame`). Luma AI acepta un `transforms.json` con esas poses para reconstruir la escena sin tener que estimarlas.

[El script](https://github.com/PGSCOM/3D-Scanner-to-Luma-AI) en **Python** recorre la carpeta de la captura, convierte cada pose en una matriz 4×4 con NumPy y escribe un único `transforms.json` en el [formato de Luma](https://docs.lumalabs.ai/MCrGAEukR4orR9). Así la reconstrucción NeRF usa las posiciones reales del iPhone.

<h2 data-tab="programacion">iPad por cable</h2>

Quería usar el iPad como segunda pantalla del PC por **USB-C**, sin depender del Wi-Fi. Llegué a una solución en tres pasos.

<div class="pd-seccion" data-cat="programacion">

### 1. ipad-typec-tunnel

El primer intento fue una VPN [WireGuard](https://github.com/PGSCOM/ipad-typec-tunnel). Un servidor nativo en Windows, o con Docker Compose para el acceso remoto, da al iPad acceso a todos los servicios del PC sin abrir puertos. Incluye las configuraciones, los QR del cliente y un script de PowerShell que prepara el firewall.

</div>

<div class="pd-seccion" data-cat="programacion">

### 2. El script de PowerShell

Después probé [go-ios](https://github.com/danielpaulus/go-ios), que levanta un túnel de red directamente sobre el cable. [Este script](https://gist.github.com/PGSCOM/612a6c49d81e3c00e3f60ed7963e8b36) lanza `ios tunnel start` como administrador y busca la IP del túnel (la IPv6 que empieza por `fd`, o la interfaz `tun0` si no la encuentra). Luego pinta un QR en la terminal: al escanearlo, un Atajo del iPad copia la dirección al portapapeles.

</div>

<div class="pd-seccion" data-cat="programacion">

### 3. ios-tunnel-stream

[ios-tunnel-stream](https://github.com/PGSCOM/ios-tunnel-stream) es el **port a Go** de ese script: un binario multiplataforma en lugar de un `.ps1` que solo funciona en Windows.

- Detecta la IP del túnel y genera el QR en local, sin el servicio web que usaba el script.
- `-port` y `-path` montan una URL completa (`http://[ip]:8889/live`); `-ip` se salta la detección.
- Junto con Moonlight/Sunshine o Deskreen, el iPad recibe el stream de una pantalla virtual sin red local.

Por el camino también [contribuí a go-ios](/proyectos/github-contributions).

</div>

<h2 data-tab="programacion">Teldrive Adder</h2>

[Teldrive](https://github.com/tgdrive/teldrive) es una unidad self-hosted que guarda los archivos en Telegram. Tenía mucho material subido ya a un canal y no quería descargarlo para volver a subirlo.

[Teldrive Adder](https://github.com/PGSCOM/Teldrive-adder) son unos scripts en **Python** con **Telethon**:

- **Reenvía** los mensajes al canal de Teldrive y los registra en su API. Los archivos no pasan por el ordenador.
- Reconoce los **archivos divididos** (`.001`/`.002` de 7-Zip, `.part1.rar` de WinRAR) y los registra como un solo archivo con sus partes en orden.
- Salta lo que ya existe en la carpeta de destino, inicia sesión con un QR de Telegram (con 2FA) y tiene un modo `--list` para ver antes qué se va a importar.
- Scripts aparte para verificar descargas y limpiar archivos corruptos.
