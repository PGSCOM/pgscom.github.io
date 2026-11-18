---
titulo: Scripts de bolsillo
fecha: "2024-07"
fechaFin: "2026-09"
categorias: [programacion, vfx, diseño-grafico]
peso: 40
descripcion: Pequeñas herramientas para quitarme de encima tareas repetitivas.
tecnologias: [Python, Go, JavaScript, PowerShell, go-ios, WireGuard]
experimento: true
paginaPropia: true
icono: bolsillo
estadoIA: generado
---

Herramientas pequeñas que no merecen ficha propia, pero que uso o he usado. Cada una resuelve un problema concreto que me encontré trabajando.

<h2 data-tab="diseño-grafico"><a href="https://pgscom.github.io/SuperPreset4Wacom/">SuperPreset4Wacom</a></h2>

El software de Wacom guarda la configuración de botones de todas las aplicaciones en un solo `.wacomprefs`. Si tienes los atajos de Blender en un perfil y los de Affinity en otro, tienes que elegir uno de los dos, y tampoco se puede fusionar las configuraciones de otras personas.

[SuperPreset4Wacom](https://pgscom.github.io/SuperPreset4Wacom/) es una web que lee los dos perfiles .wacomprefs y los fusiona en uno nuevo.

<br />

Probada con el driver 6.4.8-6 en una Cintiq 22HD.

[Código](https://github.com/PGSCOM/SuperPreset4Wacom)

<h2 data-tab="vfx"><a href="https://github.com/PGSCOM/3D-Scanner-to-Luma-AI">3D Scanner a Luma AI</a></h2>

La app **3D Scanner** de iOS guarda, junto a cada fotograma, un `.json` con la pose de la cámara que calcula ARKit (`cameraPoseARFrame`). Luma AI acepta un `transforms.json` con esas poses para reconstruir la escena sin tener que estimarlas.

Ahora que el Gaussian Splatting de LumaAI ya no existe, este script ya no es útil.

<h2 data-tab="programacion">iPad por cable</h2>

Quería usar el iPad como segunda pantalla del PC por **USB-C**, sin depender del Wi-Fi, algo estilo Plug And Play como lo hacen otras aplicaciones, pero no quería pagar por un software de terceros. 

La idea es usar [Moonlight](https://moonlight-stream.org/) o [Deskreen](https://deskreen.com/) para recibir un stream de la pantalla virtual del PC, y que el iPad se conectara a ella por cable.

### go-ios

Para la conexión por cable investigué un poco y encontré [go-ios](https://github.com/danielpaulus/go-ios), que permite levantar un túnel directamente sobre el cable USB con el comando:

```sh
sudo ios tunnel start
```
<br />

Luego, hubo un problema al usar Moonlight, que usaba los bytes de Traffic Class de IPv6 al conectarse. go-ios tenía un bug que validaba el header IPv6 comparando el primer byte completo contra el valor fijo 0x60, lo que hacía que si Moonlight mandaba un paquete con un Traffic Class distinto a 0, go-ios lo rechazara.

Pull request solucionando este error: [#688](https://github.com/danielpaulus/go-ios/pull/688)

<h2 data-tab="programacion"><a href="https://github.com/PGSCOM/Teldrive-adder">Teldrive Adder<a/></h2>

[Teldrive](https://github.com/tgdrive/teldrive) es una unidad self-hosted que guarda los archivos en Telegram. Tenía mucho material subido ya a mis mensajes guardados y quería organizarlo en Teldrive sin tener que descargarlo y subirlo otra vez.

Por eso hice [Teldrive Adder](https://github.com/PGSCOM/Teldrive-adder) que conecta con la API de Teldrive y con la de Telegram para importar los archivos directamente.

También reconoce los archivos divididos y los registra como un solo archivo con sus partes en orden.