---
titulo: iPad por cable
fecha: "2026-03"
fechaFin: "2026-09"
categorias: [programacion]
peso: 40
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: Usar el iPad como pantalla y cliente del PC por USB-C, sin depender del Wi-Fi.
tecnologias: [Go, go-ios, WireGuard, Docker, Moonlight, Sunshine]
link: https://github.com/PGSCOM/ios-tunnel-stream
txtboton: Ver en GitHub
---

Dos herramientas para conectar un iPad al PC por cable.

## ipad-typec-tunnel

Un servidor **WireGuard** (nativo en Windows o con Docker Compose) que da al iPad, conectado por USB-C, acceso a todos los servicios del PC sin abrir puertos. Genera las configuraciones y un QR para el cliente.

## ios-tunnel-stream

CLI en **Go** que levanta un túnel al iPad con [go-ios](https://github.com/danielpaulus/go-ios) (proyecto al que [también contribuí](/proyectos/github-contributions)) y muestra la URL como QR. Pensado para usarlo con Moonlight/Sunshine y tener una pantalla virtual sin red local.

<!-- TODO: relacionarlo con el post de VMs en iPad del blog si encaja -->
