---
titulo: Faro
fecha: "2026-09"
categorias: [programacion]
peso: 75
imagen: ../../assets/proyectos/faromlx.webp
video: /proyvid/faromlx.mp4
trailer: /proyvid/faromlx.mp4
descripcion: App de iOS y macOS para chatear con modelos de IA que corren en el propio dispositivo.
tecnologias: [Swift, SwiftUI, MLX, Hugging Face, MCP, GitHub Actions]
link: https://github.com/PGSCOM/MLXChat
txtboton: Ver en GitHub
estadoIA: generado
textoIA: "Este fue un experimento para ver como desarrollar de forma paralela una aplicación con Claude Code. Para ello desarrollé una idea que ya tenía y cada feature la añadía con una Branch y PR nueva"
textotarjetaIA: "Hecha en 1 semana para aprender desarrollo multiagente (Claude Code)"
---

## Qué hace

Faro es una app nativa en SwiftUI para mi iPad que ejecuta LLMs **en local** con el framework MLX. Es diferente a otras apps porque:
- No depende de un catálogo cerrado (Se puede descargar cualquier modelo de Hugging Face)
- **Servidor compatible con la API de OpenAI** para usar la potencia del iPad en otras aplicaciones del iPad o en otro dispositivo.
- Soporte para **MCP**.
- Proyectos de chat (Como en ChatGPT) (No testeado lo suficiente)

## Cómo lo programé

- El proyecto de Xcode no se versiona: se genera con **XcodeGen** desde `project.yml`.
- **GitHub Actions** compila un `.ipa` sin firmar en cada push (no tengo Mac para poder compilar en mi máquina).

<!-- TODO: capturas / vídeo de la app funcionando -->
