---
titulo: Faro
fecha: "2026-09"
fechaFin: ahora
categorias: [programacion]
peso: 70
# imagen: ../../assets/proyectos/TODO.png   # TODO: captura para la card
descripcion: App de iOS y macOS para chatear con modelos de IA que corren en el propio dispositivo.
tecnologias: [Swift, SwiftUI, MLX, Hugging Face, MCP, GitHub Actions]
link: https://github.com/PGSCOM/MLXChat
txtboton: Ver en GitHub
---

<!-- TODO: contar por qué la empezaste (privacidad, sin conexión, probar MLX…) -->

## Qué hace

Faro es una app nativa en SwiftUI que ejecuta modelos de lenguaje **en local** con MLX, el framework de Apple para Apple Silicon. No depende de un catálogo cerrado: cualquier modelo MLX de Hugging Face se puede descargar y usar.

- **Servidor compatible con la API de OpenAI** para usar el modelo del iPhone o del Mac desde otros equipos de la red.
- **Cliente MCP** para darle herramientas al modelo.
- Voz (TTS), proyectos de chat, instrucciones personalizadas, streaming del razonamiento y varios idiomas.
- Claves guardadas en el Llavero.

## Cómo está montado

- El proyecto de Xcode no se versiona: se genera con **XcodeGen** desde `project.yml`.
- **GitHub Actions** compila un `.ipa` sin firmar en cada push (se instala con AltStore o Sideloadly).
- Requiere Apple Silicon (A17 Pro o chip M) por MLX.

<!-- TODO: capturas / vídeo de la app funcionando -->
