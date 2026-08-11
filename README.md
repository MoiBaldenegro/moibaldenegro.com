# moibaldenegro.com

Sitio personal de **Moisés Baldenegro Melendez** (@moibaldenegro). La portada
muestra su perfil y las tecnologías con las que trabaja, y el sitio publica
artículos sobre **arquitectura de software** y una página `/about` con la
descripción del autor. Es un sitio estático generado con Astro 7 y TypeScript,
sin JavaScript de runtime.

## Estructura del proyecto

```text
/
├── public/                     # archivos estáticos servidos tal cual (favicons, svg)
├── src/
│   ├── src/pages/              # rutas: una página por URL (/, /about)
│   ├── src/layouts/            # layout único con el chrome compartido del sitio
│   ├── src/components/         # componentes de UI (portada, tarjetas, artículos)
│   ├── src/domain/
│   │   ├── src/domain/entities/     # entidades del dominio: modelos tipados
│   │   └── src/domain/repositories/ # repositorios: única vía de acceso a los datos
│   ├── src/data/               # datos estructurados en JSON (perfil, tarjetas)
│   ├── src/content/            # artículos en Markdown + src/content.config.ts
│   └── src/styles/             # tokens del diseño + una hoja por componente
├── scripts/                    # scripts del arnés (node scripts/<slug>.mjs)
├── tests/                      # tests automáticos (node:test)
├── specs/                      # specs EARS por feature
├── progress/                   # bitácora de sesiones del arnés
├── templates/                  # plantillas del arnés
└── package.json
```

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando        | Acción                                                |
| :------------- | :---------------------------------------------------- |
| `pnpm dev`     | Dev server local en `localhost:4321`                  |
| `pnpm build`   | Build de producción a `./dist/`                       |
| `pnpm preview` | Previsualiza el build de producción localmente        |
| `pnpm test`    | Ejecuta los tests automáticos (node:test sobre `tests/`) |
| `./init.sh`    | Verifica entorno, formato, tests y build (Git Bash en Windows) |

## Documentación del arnés

- [docs/architecture.md](docs/architecture.md) — qué significa hacer un buen trabajo en este proyecto.
- [docs/conventions.md](docs/conventions.md) — reglas de estilo, nombres y estructura.
- [docs/verification.md](docs/verification.md) — cómo comprobar que el trabajo funciona.
