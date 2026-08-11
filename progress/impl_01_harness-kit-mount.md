# Informe de implementación — feature 1 harness-kit-mount

Fecha: 2026-08-10
Estado: implementación completada, pendiente de reviewer.

## Causa del rojo

El arnés estaba a medio montar. `./init.sh` fallaba por dos motivos:

1. **No existía script `test` en `package.json`** → `pnpm test` (invocado por
   `init.sh`) fallaba con "Missing script: test".
2. **`tests/harness-kit-integrity.test.mjs` escaneaba TODO el repo**
   (`getKitFiles()` recursivo desde la raíz, incluyendo `.git/`, `node_modules/`,
   `dist/`, `.astro/`, `src/`, `public/`, `tests/`, `progress/`, `specs/`)
   buscando tokens de la app (`tomatesoft`, `cards-data`, `og-image`, `hero`).
   Con el código real de la app (y hasta con `.git/index`) el test fallaba por
   falsas fugas. Además, 3 archivos obligatorios del kit no existían:
   `templates/feature_list.json`, `templates/current.md`, `templates/history.md`.

## Evidencia del rojo

### Rojo 1 — estado actual antes del cambio (`node --test "tests/**/*.test.mjs"`):

```
not ok 1 - REQ-17-01/02: los archivos obligatorios del kit existen en disco
  error: 'harness-kit/templates/feature_list.json: archivo obligatorio del kit no existe'
not ok 2 - REQ-17-03/05: los tokens de la app no aparecen en los archivos del kit
  error: 'harness-kit/.git/index: fuga de token de app detectada "hero"'
not ok 3 - REQ-17-04: templates/feature_list.json contiene una única feature de ejemplo
# tests 3 / # pass 0 / # fail 3
```

Nota: `node --test tests/` con barra final NO funciona en Node v22.22.2 en
Windows ("Cannot find module ...tests"); el patrón glob
`node --test "tests/**/*.test.mjs"` sí ejecuta la suite.

### Rojo 2 — test corregido (test-first), antes de crear las piezas:

```
not ok 1 - REQ-17-01/02: los archivos obligatorios del kit existen en disco
  error: 'harness-kit/templates/feature_list.json: archivo obligatorio del kit no existe'
not ok 3 - REQ-17-04: templates/feature_list.json contiene una única feature de ejemplo
  error: "ENOENT: no such file or directory, open '...templates\feature_list.json'"
# pass 1  (test de tokens con escaneo acotado YA pasa: no hay fugas en el kit)
# fail 2
```

El test de integridad se escribió/ajustó primero (contra la spec REQ-01-04/05) y
se observó en rojo por las piezas ausentes, antes de implementarlas.

## Cambios realizados (alcance exacto)

| Archivo | Acción | Por qué |
|---------|--------|---------|
| `templates/feature_list.json` | CREADO | Plantilla con exactamente 1 feature de ejemplo; estructura `{ project, description, rules, features }` validada por `scripts/validate-feature-list.mjs` (id entero, name/title/description no vacíos, acceptance array, status válido). REQ-01-01. |
| `templates/current.md` | CREADO | Plantilla que reproduce la estructura de `progress/current.md` (cabecera `# Progreso actual`, `### Feature en curso`, `### Plan`, `### Bitácora`, `### Estado`) con placeholders. REQ-01-02. |
| `templates/history.md` | CREADO | Plantilla que reproduce la estructura de `progress/history.md` (cabecera `# Bitácora de sesiones`, nota append-only, sección `## Sesiones`). REQ-01-02. |
| `package.json` | MODIFICADO | Añadido `"test": "node --test \"tests/**/*.test.mjs\""`. REQ-01-03. Se usó el patrón glob (no `tests/`) porque el argumento directorio con barra final falla en Node v22.22.2 en Windows; el glob ejecuta todos los `*.test.mjs` de `tests/` igualmente. |
| `tests/harness-kit-integrity.test.mjs` | MODIFICADO | Escaneo acotado: `getKitFiles()` devuelve solo OBLIGATORY_FILES existentes + archivos de `templates/`. Nunca recorre `node_modules`, `dist`, `.astro`, `src`, `public`, `tests`, `.git`. Se eliminó el hack de auto-exclusión del propio test (ya no es necesario: el test vive en `tests/`, fuera del alcance). Comentario de cabecera documenta el alcance acotado. Se mantienen los 3 tests (archivos obligatorios, tokens, plantilla con 1 feature). REQ-01-04/05. |
| `feature_list.json` (raíz) | MODIFICADO | Status de feature 1: `pending` → `in_progress` (protocolo del arnés). NO marcada `done`: lo hará el implementer solo tras el APPROVED del reviewer. |
| `progress/current.md` | MODIFICADO | Bitácora de la sesión de implementación añadida. |
| `CHECKPOINTS.md` | VERIFICADO (sin cambios) | Ya existía en disco con contenido (criterios objetivos de estado final correcto). |
| `.opencode/agents/*.md` (5) | VERIFICADO (sin cambios) | Ya existían en disco con contenido (spec_author, leader, implementer, reviewer, explorer; líder orquesta, implementer implementa una feature, reviewer aprueba contra docs, spec_author descompone al backlog, explorer investiga y deja informe en `progress/research/`). |
| `.claude/agents/*.md` (5) | VERIFICADO (sin cambios) | Espejo de Claude del kit; los 5 ya existían con contenido. |

### Desviaciones justificadas

1. **Punto 5 del alcance del líder** ("crear CHECKPOINTS.md y los agentes"):
   esos archivos ya existían en disco con contenido (los creó la fase de montaje
   previa al harness). Solo se verificó su existencia y contenido; no se
   modificaron. El test REQ-17-01/02 ya los encontraba (el único fallo de
   archivos eran las plantillas de `templates/`).
2. **Forma del script `test`**: el líder sugirió `node --test tests/` como
   ejemplo; en Node v22.22.2 en Windows ese argumento falla ("Cannot find
   module"), así que se usó el patrón glob `node --test "tests/**/*.test.mjs"`
   (mismo comportamiento: ejecuta los tests node:test de `tests/`).
3. El test de tokens ahora solo falla por archivos realmente presentes en el
   kit: al no existir `templates/` aún, `getKitFiles()` se protege con
   `existsSync` para que el fallo sea limpio (test 1) y no un ENOENT genérico.

## Evidencia del verde

```
$ node --test "tests/**/*.test.mjs"
# tests 3 / # pass 3 / # fail 0

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos

$ pnpm test
# tests 3 / # pass 3 / # fail 0

$ pnpm build
[build] ✓ Completed in 258ms.
[build] 1 page(s) built in 814ms
[build] Complete!

$ ./init.sh   (Git Bash)
✔ node instalado
✔ gestor de paquetes instalado (pnpm)
✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción
✔ El entorno está perfecto. Podemos empezar a trabajar.
```

`./init.sh` termina con estado de salida 0 y el mensaje de entorno perfecto
(REQ-01-06: si algo fallara, `init.sh` ya sale con código distinto de cero).

## Archivos NO tocados (fuera de alcance)

`init.sh`, `scripts/*.mjs` (validadores), `AGENTS.md`, `KICKOFF.md`,
`README.md` (feature 13), `docs/`, `src/`, `public/`, `specs/` de features.

## Pendiente

Revisión del reviewer (lo lanza el líder). Tras el APPROVED se marcará la
feature 1 como `done` en `feature_list.json` y se moverá el resumen a
`progress/history.md`.
