# Informe de implementación — feature 1 harness-kit-mount

Fecha: 2026-08-10
Estado: implementación completada, pendiente de reviewer.

> Nota: `progress/impl_01_harness-kit-mount.md` y
> `progress/review_01_harness-kit-mount.md` (con `01_`) son artefactos de una
> sesión PREVIA de implementación (17:19/17:21, mismo día) que dejó la feature
> implementada y APPROVED. El contexto del líder (init.sh fallando) era anterior
> a ese ciclo. Esta sesión re-implementó contra la spec vigente (REQ-01-01..06)
> con ciclo rojo/verde completo y alineó el test a los REQ-01-*.
> `feature_list.json` ya figuraba `done` (cambio externo 17:23:44, coherente con
> el APPROVED en disco); esta sesión NO modificó el status.

## Alcance (spec `specs/01_harness-kit-mount/requirements.md`)

| REQ | Pieza |
|-----|-------|
| REQ-01-01 | `templates/feature_list.json` con exactamente 1 feature de ejemplo |
| REQ-01-02 | `templates/current.md` y `templates/history.md` (estructura de `progress/`) |
| REQ-01-03 | Script `test` en `package.json` ejecutando los tests node:test de `tests/` |
| REQ-01-04/05 | Test de integridad verifica/escanea únicamente los archivos del kit |
| REQ-01-06 | `init.sh` termina con salida ≠ 0 si falla formato/tests/build |

## Ciclo rojo/verde (test-first)

### Rojo — tests escritos contra la spec, feature ausente

Se simula el estado previo a la feature (sin `templates/`, sin script `test`
en `package.json`) y se ejecuta la suite con el test de integridad reescrito
contra REQ-01-01..06:

```
$ node --test "tests/**/*.test.mjs"
# Subtest: REQ-01-01/02: los archivos obligatorios del kit existen en disco
not ok 5 - REQ-01-01/02: ...
  error: 'harness-kit/templates/feature_list.json: no existe'
# Subtest: REQ-01-01: templates/feature_list.json contiene una única feature de ejemplo
not ok 8 - REQ-01-01: ...
  error: "ENOENT: no such file or directory, open '...templates\feature_list.json'"
# Subtest: REQ-01-02: las plantillas de progreso reproducen la estructura de progress/
not ok 9 - REQ-01-02: ...
  error: "ENOENT: no such file or directory, open '...templates\current.md'"
# Subtest: REQ-01-03: package.json define el script test con node:test sobre tests/
not ok 10 - REQ-01-03: ...
  error: 'package.json: falta el script "test"'
# tests 11 / # pass 7 / # fail 4
$ echo $?
1
```

Además, `pnpm test` sin el script falla directamente:

```
$ pnpm test
EXIT=1   (Missing script: test)
```

Nota: los 4 tests REQ-02 del spec_author (feature 2, fuera de alcance) pasan;
los 4 fallos son exactamente las piezas de la feature 1 (plantillas + script).

### Verde — feature implementada

```
$ pnpm test
# tests 11 / # pass 11 / # fail 0
EXIT=0

$ ./init.sh
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
EXIT=0
```

## Cambios (alcance exacto)

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `templates/feature_list.json` | Verificado/existe | 1 feature de ejemplo (`feature-ejemplo`), JSON parseable, estructura `{ project, description, rules, features }` válida para `scripts/validate-feature-list.mjs`. REQ-01-01. |
| `templates/current.md` | Verificado/existe | Espejo de `progress/current.md`: `# Progreso actual`, `### Feature en curso`, `### Plan`, `### Bitácora`, `### Estado`. REQ-01-02. |
| `templates/history.md` | Verificado/existe | Espejo de `progress/history.md`: `# Bitácora de sesiones`, nota append-only, `## Sesiones`. REQ-01-02. |
| `package.json` | Verificado/mantenido | `"test": "node --test \"tests/**/*.test.mjs\""`. REQ-01-03. Se usa el patrón glob porque `node --test tests/` falla en Node v22.22.2 en Windows ("Cannot find module ...tests"); el glob ejecuta igual todos los `*.test.mjs` de `tests/`. |
| `tests/harness-kit-integrity.test.mjs` | REESCRITO contra la spec | 7 tests: obligatorios existen (REQ-01-01/02), escaneo acotado (REQ-01-04/05), tokens solo en archivos del kit (REQ-01-05), plantilla con 1 feature (REQ-01-01), plantillas de progreso (REQ-01-02), script test (REQ-01-03), init.sh salida ≠ 0 (REQ-01-06). `getKitFiles()` solo devuelve `OBLIGATORY_FILES` existentes + archivos de `templates/`; nunca `node_modules/`, `dist/`, `.astro/`, `src/`. 95 líneas físicas / 79 de código (≤100). |
| `feature_list.json` (raíz) | Sin cambios por esta sesión | Ya figuraba `done` al inicio (cambio externo 17:23:44, tras el ciclo previo con review APPROVED). No se tocó. |
| `progress/current.md` | Bitácora | Sesión de implementación documentada. |

## Verificación de acceptance

1. `templates/feature_list.json` con exactamente 1 feature + JSON parseable ✔ (test REQ-01-01, JSON.parse OK)
2. `templates/current.md` y `templates/history.md` reproducen la estructura de `progress/` ✔ (test REQ-01-02)
3. `pnpm test` ejecuta los node:test de `tests/` incl. harness-kit-integrity y termina en verde ✔ (11/11, EXIT=0)
4. El test no lee `node_modules`, `dist`, `.astro` ni `src`; `./init.sh` termina con "entorno perfecto" ✔ (test REQ-01-04/05 + init.sh EXIT=0)

## Fuera de alcance (no tocado)

`src/`, `public/`, `docs/`, `scripts/*.mjs`, `init.sh`, `README.md`,
`specs/` (excepto lectura), `feature_list.json` (salvo status), y los
artefactos pre-stage del spec_author para feature 2 (`src/styles/tokens.css`,
`tests/design-tokens.test.mjs` — untracked, pasan, no son de esta feature).

## Pendiente

La feature ya figura `done` en `feature_list.json` (ciclo previo con
`progress/review_01_harness-kit-mount.md` APPROVED en disco). Esta sesión
re-verificó el estado actual (REQ-01-01..06) y dejó la suite e `init.sh` en
verde; si el líder considera necesario re-revisar el estado actual de
`tests/harness-kit-integrity.test.mjs` (alineado a REQ-01-*), puede lanzar al
reviewer; si acepta el APPROVED previo, la feature ya está cerrada.
