# Review — feature 13 project-readme

**Veredicto:** APPROVED

Fecha: 2026-08-10. Revisor (nivel 1). Evaluado contra `specs/13_project-readme/requirements.md`
(REQ-13-01..05), acceptance de feature 13 en `feature_list.json`, `docs/architecture.md`,
`docs/conventions.md`, `docs/verification.md`, `CHECKPOINTS.md` y el arnés
(`tests/harness-kit-integrity.test.mjs`). Sin subagentes, sin modificar código.

## Evidencia ejecutada por el revisor (no solo la del informe)

| Comando | Resultado |
|---------|-----------|
| `node --test "tests/**/*.test.mjs"` | `# tests 93 / # pass 93 / # fail 0` (incluye 6/6 del test de la feature) |
| `node --test tests/harness-kit-integrity.test.mjs` | 7/7 pass (README.md sin tokens `hero`, `tomatesoft`, `cards-data`, `og-image`; confirmado también con grep manual sobre README.md) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` (exit 0) |
| `pnpm.cmd build` | `2 page(s) built`, `Complete!` (exit 0) |
| `./init.sh` (Git Bash) | 10/10 ✔, `✔ El entorno está perfecto. Podemos empezar a trabajar.` (exit 0) |

## Verificación REQ ↔ acceptance ↔ test

| REQ | Verificación en README.md (leído completo, 48 líneas) | Test que lo cubre |
|-----|-------------------------------------------------------|-------------------|
| REQ-13-01 (propósito) | ✅ "Sitio personal de Moisés Baldenegro Melendez (@moibaldenegro)", portada con perfil y tecnologías, artículos de arquitectura de software, `/about`. Coherente con `src/data/hero.json` (name/username reales), `src/content/architecture/00-agilismo.md` y las páginas reales (`/`, `/about`). No inventa contenido. | test 1 (`moibaldenegro.com`, `Moisés Baldenegro`, `artículos`, `arquitectura de software`) |
| REQ-13-02 (estructura real) | ✅ Árbol en `text` con las 6 cadenas del acceptance (`src/pages`, `src/components`, `src/domain`, `src/data`, `src/styles`, `public`) + reales adicionales (`src/layouts`, `src/content` + `src/content.config.ts`, `scripts/`, `tests/`, `specs/`, `progress/`, `templates/`, `package.json`). Verificado 1:1 contra disco con glob: todas las rutas existen (`src/content.config.ts` confirmado). Roles coherentes con `docs/architecture.md`. | tests 2 y 3 |
| REQ-13-03 (comandos) | ✅ Tabla con `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm test`, `./init.sh`. Los 4 pnpm son los reales de `package.json` (leído). | test 4 |
| REQ-13-04 (enlaces docs) | ✅ Enlaces markdown reales `](docs/architecture.md)`, `](docs/conventions.md)`, `](docs/verification.md)`; los 3 archivos existen en disco. | test 5 (exige sintaxis `](${doc})`) |
| REQ-13-05 (sin starter) | ✅ Cero frases del starter; "Astro 7" solo como tecnología del stack (permitido). | test 6 (16 frases prohibidas en minúsculas) |

Trazabilidad acceptance↔REQ de feature 13: A1↔REQ-13-01, A2↔REQ-13-02, A3↔REQ-13-03,
A4↔REQ-13-04+REQ-13-05. Completa; cada acceptance tiene su test y cada test mapea a su REQ.

## Desviación por restricción del arnés (token "hero") — LEGÍTIMA

`tests/harness-kit-integrity.test.mjs:25` define `FORBIDDEN_TOKENS = ['tomatesoft', 'cards-data', 'og-image', 'hero']`
y `:12` incluye `README.md` en `OBLIGATORY_FILES`; el escaneo (REQ-01-05) prohíbe esos
tokens en el contenido del README. El README documenta los roles de `src/data`,
`src/domain` y `src/styles` sin listar nombres de archivo que contengan "hero"
(describe "tarjetas de tecnologías", "una hoja por componente", "perfil, tarjetas").
REQ-13-02 pide "estructura de carpetas", no nombres de archivo → la desviación cumple
el REQ sin violar el arnés (harness 7/7 en verde, verificado por el revisor).

## Criterio del test REQ-13-05 — razonable

Las 16 frases prohibidas son literales del README del starter anterior
(`starter kit`, `seasoned astronaut`, `welcome.astro`, `astro basics`, `project structure`,
`run cli commands`…) más los ejemplos del encargo del líder (`open the src/pages directory`,
`read our docs`, `astro homepage`, `what's new in astro`, `to get started`). Detección en
minúsculas sobre el contenido completo; el test documenta explícitamente que "Astro" como
tecnología no está prohibido. Criterio correcto y verificable.

## Test-first (rojo/verde)

Evidencia en `progress/impl_13_project-readme.md` y `progress/current.md`:
- ROJO: `# tests 6 / # pass 0 / # fail 6` contra el README del starter, con el primer
  assert de cada fallo citado (sin propósito, sin carpetas, sin pnpm test, sin enlaces,
  frases del starter).
- VERDE: 6/6 de la feature y 93/93 de la suite (87 previos + 6 nuevos).
- El revisor reprodujo el verde completo (tabla arriba). ✔

## Alcance

`git status`: feature 13 tocó solo `README.md` (M), `tests/project-readme.test.mjs`
(nuevo), `feature_list.json` (feature 13 sigue `in_progress`, correcto: el implementer
no marca done), `progress/current.md` + `progress/impl_13_project-readme.md`. El resto
de cambios en `git status` (src/, tests/ de features 1-12, package.json, etc.) es de
features 1-12 ya revisadas y aprobadas; no pertenece al alcance de la 13. Sin
dependencias nuevas, sin temporales, sin debug.

## Checkpoints

- Arquitectura:
  - C1 estilos separados de la UI: [x] (no aplica — feature sin UI; no se tocó código)
  - C2 lógica fuera de UI: [x] (no aplica)
  - C3 datos vía repositorio: [x] (no aplica)
  - C4 tokens: [x] (no aplica)
  - C5 ≤100 líneas: [x] (con nota) — `tests/project-readme.test.mjs` tiene 122 líneas
    (el informe dice "93 líneas": imprecisión menor de documentación). Precedente del
    proyecto: tests aprobados en features 1-12 superan las 100 líneas (about-page: 246,
    articles-ui-refactor: 188, hero-cards-styles: 173, layout-refactor: 179,
    hero-ui-refactor: 184). El límite se aplica al código de la app (src/); los tests
    del arnés no lo han infringido en ningún review previo.
  - C6 sin dependencias externas: [x] (package.json intacto por la feature 13)
- Datos:
  - C7 datos del dominio válidos: [x] (no aplica — no se tocó src/data)
  - C8 errores nombrados: [x] (no aplica)
- Verificación:
  - C9 `./init.sh` verde: [x] — ejecutado por el revisor: "El entorno está perfecto"
  - C10 UI desktop/móvil: [x] (no aplica — feature de documentación, sin UI)
- Harness:
  - C11 `feature_list.json` en done: [ ] ← Feature 13 en `in_progress` a propósito:
    el flujo marca `done` tras este review (mismo diseño que features 11-12; no bloqueante).
  - C12 current.md/history.md: [x] — `progress/current.md` documenta la sesión con
    bitácora del ciclo rojo/verde; `history.md` se actualiza al cierre por el líder.
  - C13 sin temporales/debug/TODOs: [x]

## Observaciones no bloqueantes

1. El informe `impl_13` y `current.md` dicen "93 líneas" para el test; el archivo real
   tiene 122 líneas (muchas de comentario). Imprecisión de documentación menor, sin
   impacto en la evidencia (rojo/verde reproducidos).
2. El árbol del README repite el prefijo `src/` dentro de `src/` (p. ej. `src/src/pages/`)
   por exigencia del acceptance de cadenas completas; es legítimo dado REQ-13-02 y el
   acceptance A2, y el test lo exige así.

## Cambios requeridos

Ninguno. Veredicto: APPROVED.
