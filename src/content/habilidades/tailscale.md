---
titulo: Tailscale
categoria: programacion
icono: tailscale
resumen: Red privada entre mis máquinas, sin abrir puertos ni montar una VPN clásica.
orden: 10
progress: 75
---

Tengo montada una **tailnet** para llegar al servidor de casa desde cualquier sitio sin
exponer nada a internet.

- **Subnet router** en la Raspberry para alcanzar toda la LAN de casa desde el portátil.
- **MagicDNS** para llamar a las máquinas por nombre (`nas`, `render`) en vez de por IP.
- **ACLs** en la política de la tailnet para que los dispositivos prestados solo vean lo que toca.
- `tailscale serve` para publicar un servicio interno en HTTPS sin certificados a mano.
