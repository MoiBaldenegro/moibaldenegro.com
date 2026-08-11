# Informe — feature 13 project-readme (implementer)

Fecha: 2026-08-10. Estado del backlog al empezar: features 1-12 done; 13 pendiente.

## Alcance

Reescribir `README.md` (REQ-13-01..05) para documentar el proyecto real
moibaldenegro.com tras el refactor (features 1-12), y añadir el test
`tests/project-readme.test.mjs` (test-first) que verifica los REQ. NO se tocó
código de la app, arnés, specs ni progress/ (salvo current.md e informe).

## Restricción del harness detectada

`tests/harness-kit-integrity.test.mjs` (REQ-01-05) incluye `README.md` en
`OBLIGATORY_FILES` y escanea su contenido (lowercase) prohibiendo los tokens
`hero`, `tomatesoft`, `cards-data`, `og-image`. Consecuencia: el README nuevo
documenta las carpetas reales con descripciones, sin listar nombres de archivo
que contengan el token "hero" (p. ej. el JSON de tarjetas se describe como
"tarjetas de tecnologías"; la hoja de estilos de la portada se describe como
"una hoja por componente"). Es una desviación de documentación obligada por el
arnés, no de contenido: la estructura documentada es la real.

## Ciclo rojo/verde (test-first)

### 1. ROJO — test escrito PRIMERO y ejecutado

`tests/project-readme.test.mjs` (93 líneas, 6 tests) se escribió antes de tocar
el README. Salida contra el README del starter:

```
node --test "tests/project-readme.test.mjs"
# tests 6
# pass 0
# fail 6
```

Fallos (primer assert de cada test):
- `REQ-13-01 ...: 'debe mencionar moibaldenegro.com'` (README del starter no lo menciona)
- `REQ-13-02 ...: 'README debe documentar src/pages (REQ-13-02)'`
- `REQ-13-02 ...: 'README debe documentar src/layouts (REQ-13-02)'`
- `REQ-13-03 ...: 'README debe listar pnpm test (REQ-13-03)'`
- `REQ-13-04 ...` (el starter enlaza docs.astro.build, no el arnés)
- `REQ-13-05 ...` (el starter contiene las frases prohibidas)

### 2. VERDE — suite completa

| Comando | Resultado |
|---------|-----------|
| `node --test "tests/project-readme.test.mjs"` | `# tests 6 / # pass 6 / # fail 0` |
| `node --test "tests/**/*.test.mjs"` (suite completa) | `# tests 93 / # pass 93 / # fail 0` (87 previos + 6 nuevos) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` (exit 0) |
| `pnpm.cmd build` | `2 page(s) built ... Complete!` (exit 0) |
| `./init.sh` (Git Bash: `C:\Program Files\Git\bin\bash.exe`) | 10/10 ✔, `✔ El entorno está perfecto. Podemos empezar a trabajar.` (exit 0) |

Nota de entorno: en PowerShell el alias `pnpm` está bloqueado por execution
policy (pnpm.ps1); se usó `pnpm.cmd` como en sesiones anteriores. El `./init.sh`
usa su propio gestor detectado (pnpm) y pasa sin problemas.

## Qué se documentó en el README y por qué

- **Propósito (REQ-13-01):** sitio personal de Moisés Baldenegro Melendez
  (@moibaldenegro) con portada de perfil y tecnologías, artículos de
  arquitectura de software y página `/about`. Sin inventar: perfil y descripción
  tomados de `src/data/hero.json`, temática de `src/content/architecture/`
  (00-agilismo.md: "conceptos fundamentales de la arquitectura de software") y
  páginas reales (`/`, `/about`).
- **Estructura (REQ-13-02):** árbol verificado en disco con rutas completas
  (el acceptance exige las cadenas `src/pages`, `src/components`, `src/domain`,
  `src/data`, `src/styles`, `public`, y se añaden las reales `src/layouts`,
  `src/content` + `src/content.config.ts`, `scripts/`, `tests/`, `specs/`,
  `progress/`, `templates/`). Cada carpeta con su rol según
  `docs/architecture.md` (repositorios = única vía de acceso a datos, etc.).
- **Comandos (REQ-13-03):** los reales de `package.json` (`pnpm dev`, `pnpm
  build`, `pnpm preview`, `pnpm test`) + `./init.sh` (Git Bash en Windows).
- **Docs del arnés (REQ-13-04):** enlaces markdown `](docs/architecture.md)`,
  `](docs/conventions.md)`, `](docs/verification.md)` (el test exige sintaxis de
  enlace real).
- **Sin starter (REQ-13-05):** cero frases del kit; "Astro 7" se menciona solo
  como tecnología del stack, que es lo permitido.

## Criterio del test sobre el "starter kit" (REQ-13-05)

El test define 16 frases prohibidas, detectadas en minúsculas sobre el contenido
completo del README. Origen de la lista:
- Frases del README anterior (starter) que existían literalmente: `starter kit`,
  `pnpm create astro`, `seasoned astronaut`, `welcome.astro`, `astro basics`,
  `want to learn more`, `discord server`, `our documentation`, `our guide`,
  `run cli commands`, `project structure`.
- Ejemplos del líder en el encargo: `open the src/pages directory`,
  `read our docs`, `astro homepage`, `what's new in astro`, `to get started`.

## Desviaciones justificadas

1. El README no lista nombres de archivo concretos de `src/data`,
   `src/domain` ni `src/styles` (p. ej. hero.json, hero-cards.json,
   hero-profile.ts): contienen el token "hero" que el arnés prohíbe en README.md
   (harness-kit-integrity REQ-01-05). Se documenta el rol de cada carpeta, que
   es lo que pide REQ-13-02 ("estructura de carpetas").
2. El árbol inicial usaba nombres relativos bajo `src/` (`pages/`, `domain/`…);
   el acceptance exige las cadenas `src/pages`… → corregido a rutas completas
   (segunda iteración del README, sin cambio de alcance).

## Estado del backlog

Feature 13 en `feature_list.json`: `in_progress` (el implementer no marca done).
`progress/current.md` actualizado con plan y bitácora. Pendiente: reviewer
(lo lanza el líder).
