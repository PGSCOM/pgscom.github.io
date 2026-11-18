---
titulo: Faro
fecha: "2026-09"
categorias: [programacion]
peso: 75
imagen: ../../assets/proyectos/faromlx.webp
video: /proyvid/faromlx.mp4
trailer: /proyvid/faromlx.mp4
descripcion: App de iOS para ejecutar modelos LLM localmente con MLX.
tecnologias: [Swift, SwiftUI, MLX, Hugging Face, MCP, GitHub Actions]
link: https://github.com/PGSCOM/MLXChat
txtboton: Ver en GitHub
estadoIA: generado
textoIA: "Este fue un experimento para ver como desarrollar de forma paralela una aplicación con Claude Code. Para ello desarrollé una idea que ya tenía y cada feature la añadía con una Branch y PR nueva"
textotarjetaIA: "Hecha en 1 semana para aprender desarrollo multiagente (Claude Code)"
paginaPropia: true
---

## Qué hace

Faro es una app nativa en SwiftUI para mi iPad que ejecuta LLMs **en local** con el framework MLX.
Intenté hacer que sea diferente a las demás con:
- La posibilidad de descargar cualquier modelo de Hugging Face.
- Poder crear un servidor compatible con la API de OpenAI para usarlo en otro dispositivo o aplicaciones del iPad.
- Soporte para servidores **MCP**.

## Cómo lo programé

- El proyecto de Xcode se genera con **XcodeGen** desde `project.yml`.
- **GitHub Actions** compila un `.ipa` sin firmar en cada push (no tengo Mac para poder compilar en mi máquina).

Usé Orca para gestionar los multiagentes que cada uno tenía su propia Branch y Workspace.

<!-- TODO: capturas / vídeo de la app funcionando -->
