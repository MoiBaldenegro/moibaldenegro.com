# Review — feature 1 harness-kit-mount

**Veredicto:** APPROVED

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?
**Sí.** `progress/impl_01_harness-kit-mount.md` documenta la evidencia en dos pasos:
1. **Rojo 1 (estado previo):** `node --test "tests/**/*.test.mjs"` → `# tests 3 / # pass 0 / # fail 3` (templates/ ausentes, fuga de token en `.git/index` por escaneo recursivo de todo el repo, `templates/feature_list.json` no parseable). Además `pnpm test` fallaba con "Missing script: test" (no existía el script).
2. **Rojo 2 (test corregido, test-first):** el test de integridad se ajustó primero con escaneo acotado (contra REQ-01-04/05) → `# pass 1 / # fail 2` (solo fallan las piezas ausentes: plantillas).
3. **Verde:** tras crear `templates/` y añadir el script `test`, la suite queda 3/3 (verificado por mí, abajo).

## Verificación ejecutada (evidencia concreta)

| # | Punto | Resultado | Evidencia |
|---|-------|-----------|-----------|
| 1 | `templates/feature_list.json`: exactamente 1 feature de ejemplo, parseable, estructura exigida por `scripts/validate-feature-list.mjs` | ✔ | `JSON.parse` OK (ejecutado); contiene `{ project, description, rules, features }` con 1 feature (`id` entero 1, `name`/`title`/`description` no vacíos, `acceptance` array no vacío, `status: "pending"` válido). Cumple todas las reglas de `scripts/validate-feature-list.mjs` (líneas 13-84). REQ-01-01. |
| 2 | `templates/current.md` y `templates/history.md` existen y reproducen la estructura de `progress/` | ✔ | `current.md`: cabecera `# Progreso actual`, `### Feature en curso`, `### Plan`, `### Bitácora`, `### Estado` (espejo de `progress/current.md`). `history.md`: cabecera `# Bitácora de sesiones`, nota append-only, `## Sesiones` (espejo de `progress/history.md`). REQ-01-02. |
| 3 | Script `test` en `package.json`; `pnpm test` ejecuta la suite y pasa | ✔ | `"test": "node --test \"tests/**/*.test.mjs\""` (package.json línea 12). `pnpm.cmd test` → `# tests 3 / # pass 3 / # fail 0`. REQ-01-03. La desviación del ejemplo del líder (`tests/` con barra final) está justificada y documentada (Node v22.22.2 en Windows: "Cannot find module ...tests"); el glob ejecuta todos los `*.test.mjs` de `tests/`. |
| 4 | Escaneo del test acotado; no recorre node_modules/dist/.astro/src/public/tests/.git; 3 tests presentes; REQ-01-04/05 cubiertos | ✔ | Inspeccionado `tests/harness-kit-integrity.test.mjs`: `getKitFiles()` (líneas 49-66) devuelve SOLO `OBLIGATORY_FILES` existentes (vía `existsSync`) + entradas de `templates/` (vía `readdirSync`). No hay recursión ni rutas fuera del kit: imposible leer `node_modules/`, `dist/`, `.astro/`, `src/`, `public/`, `tests/`, `.git/`. Los 3 tests siguen presentes (líneas 68, 78, 92). El comentario de cabecera (líneas 5-12) documenta el alcance acotado y por qué. REQ-01-04 y REQ-01-05 cubiertos. |
| 5 | `CHECKPOINTS.md` y agentes `.opencode/agents/*.md` + `.claude/agents/*.md` existen | ✔ | Confirmado en disco: `CHECKPOINTS.md` (38 líneas, con contenido), `.opencode/agents/` con 5 archivos (spec_author, leader, implementer, reviewer, explorer), `.claude/agents/` con los mismos 5. El implementer no los tocó; la afirmación del informe es correcta. |
| 6 | Comandos ejecutados por mí: `check-format`, `pnpm test`, `pnpm build`, `./init.sh` (Git Bash) | ✔ | `node scripts/check-format.mjs` → "FORMATO ✔". `pnpm.cmd test` → 3/3 pass. `pnpm.cmd build` → "Complete!" (1 página). `bash ./init.sh` → "✔ El entorno está perfecto. Podemos empezar a trabajar." con EXIT CODE 0. REQ-01-06 (init.sh con estado 0 en verde; fallaría con código ≠ 0 si algo fallara). |
| 7 | Alcance: `git status` solo con archivos de esta feature | ✔ | Modificados (vs HEAD): `package.json` (+1), `progress/current.md`, `tests/harness-kit-integrity.test.mjs`. Untracked: `templates/`, `feature_list.json`, `progress/impl_01_harness-kit-mount.md`, `progress/research/`, `specs/01-13/`. Nada en `src/`, `public/`, `docs/`, `scripts/`, `init.sh`. Los untracked `specs/02-13` y `feature_list.json` son del spec_author (fase previa, documentada en `progress/current.md`), no de esta feature. |
| 8 | Acceptance "feature 1 no crea feature_list.json ni specs de otras features" | ✔ | El implementer solo cambió el status de la feature 1 (`pending` → `in_progress`, protocolo del arnés) en `feature_list.json`; no creó ni modificó specs de otras features ni el resto del backlog. Coherente con el acceptance. |

## Checkpoints

- Arquitectura (C1 estilos separados, C2 lógica separada, C3 datos vía repositorio, C4 tokens, C5 100 líneas, C6 sin dependencias): [ ] — N/A: esta feature no toca código de la aplicación (solo arnés/tests); no se introdujeron violaciones nuevas.
- Datos (repositorios/entidades): [ ] — N/A: sin datos de dominio en esta feature.
- Verificación:
  - `./init.sh` termina en verde (entorno, formato, tests al 100%, build): [x] — verificado con EXIT CODE 0.
  - UI correcta desktop/móvil: [ ] — N/A: no hay cambios de UI.
- Harness:
  - `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress`; pasará a `done` tras este APPROVED (protocolo).
  - `progress/current.md` documenta la sesión: [x] — bitácora completa (rojo → implementación → verde). `history.md` se actualizará al cierre (protocolo).
  - Sin temporales/`print()`/TODOs: [x] — sin restos en los archivos revisados.

## Observaciones (no bloqueantes)

1. `tests/harness-kit-integrity.test.mjs` tiene 105 líneas físicas / 97 de código (convención: máx. 100 líneas de código). Está dentro del límite bajo la lectura "líneas de código", pero roza el límite físico; si se toca el archivo en el futuro, convendría compactar el comentario de cabecera para dejarlo holgado. No justifica CHANGES_REQUESTED.
2. Los nombres de test usan `REQ-17-01..05` (numeración de la spec previa del kit) mientras la spec de esta feature usa `REQ-01-01..06`. El comportamiento es correcto y la trazabilidad acceptance↔REQ de la feature 1 se cumple; solo es una etiqueta heredada (documentada en el comentario del archivo).

## Conclusión

Cumple REQ-01-01..06 y los 4 acceptance de la feature. Suite, build e `init.sh` verificados en verde por el reviewer. Sin cambios requeridos.

---

## Revisión complementaria (feature 2) — 2026-08-10

**Motivo:** durante la revisión de la feature 2 (CHANGES_REQUESTED, `progress/review_02_design-tokens.md`) se detectó que `tests/harness-kit-integrity.test.mjs` quedó modificado en el working tree durante la ventana de esa sesión (LastWriteTime 17:24:29, después del APPROVED de esta feature a las 17:21:43). En la sesión de la feature 2 no consta una escritura propia sobre este archivo, pero el contenido resultante quedó en disco y se revisa aquí de forma complementaria para que ningún archivo aprobado quede modificado sin revisión.

### Cambio detectado

| Estado aprobado (review_01) | Estado actual en disco |
|---|---|
| 105 líneas físicas, 3 tests | 95 líneas físicas, 7 tests |
| Etiquetas `REQ-17-01..05` (herencia de la spec previa del kit) | Etiquetas `REQ-01-01..06` alineadas con la spec de la feature 1 |
| Escaneo acotado a los archivos del kit (documentado en comentario) | Mismo escaneo acotado + test explícito `REQ-01-04/05` que verifica que el escaneo nunca lee `node_modules/`, `dist/`, `.astro/` ni `src/` (`OUT_OF_SCOPE_DIRS`) |
| — | Tests explícitos para `templates/feature_list.json` con 1 feature (REQ-01-01), plantillas `current.md`/`history.md` (REQ-01-02), script `test` en package.json (REQ-01-03), fuga de tokens (REQ-01-05) y `init.sh` con `FAILURES`/`exit 1` (REQ-01-06) |

### Verificación de la feature 1 con el estado actual (REQ-01-01..06)

| REQ | Cobertura actual | Resultado |
|-----|------------------|-----------|
| REQ-01-01 | test `REQ-01-01: templates/feature_list.json contiene una única feature de ejemplo` (JSON.parse + length === 1) | ✔ |
| REQ-01-02 | test `REQ-01-02: las plantillas de progreso reproducen la estructura de progress/` (secciones de current.md y history.md) | ✔ |
| REQ-01-03 | test `REQ-01-03: package.json define el script test con node:test sobre tests/` | ✔ |
| REQ-01-04 | test `REQ-01-01/02: los archivos obligatorios del kit existen en disco` + test `REQ-01-04/05` de escaneo acotado | ✔ |
| REQ-01-05 | test `REQ-01-04/05` (alcance del escaneo) + test `REQ-01-05: los tokens de la app no aparecen en los archivos del kit` | ✔ |
| REQ-01-06 | test `REQ-01-06: init.sh termina con estado distinto de cero ante fallos` (`FAILURES` + `exit 1` presentes en init.sh) | ✔ |

### Verificación ejecutada

- `node --test "tests/**/*.test.mjs"` → **11/11 pass** (4 design-tokens + 7 harness-kit-integrity), `# fail 0`, exit 0.
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0.
- `pnpm build` → `✓ Complete!` / `1 page(s) built`, exit 0.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0.

### Decisión

El cambio se **adopta como intencional**: su contenido es correcto, coherente con la spec de la feature 1 y mejora la trazabilidad (alinea las etiquetas de los tests con `REQ-01-01..06`, resolviendo la observación nº 2 de esta misma review). Revertirlo habría descartado una mejora verificada. La feature 1 **sigue cumpliendo REQ-01-01..06** y sus 4 acceptance con el estado actual del test.

**Veredicto de la feature 1: se MANTIENE el APPROVED.**

**Veredicto de la feature 2: CHANGES_REQUESTED resuelto** (evidencia en `progress/impl_02_design-tokens.md`, sección "Resolución de los cambios requeridos (ronda 1)").

---

## Revisión complementaria (líder, feature 1) — 2026-08-10 ~17:30

**Motivo:** el líder lanza revisión complementaria de la feature 1 para cerrar la
opción (a) señalada en `progress/review_02_design-tokens.md` (CHANGES_REQUESTED):
la reescritura de `tests/harness-kit-integrity.test.mjs` (7 tests REQ-01-xx,
escaneo acotado) fue señalada como "no documentada" en la sesión de la feature 2;
el líder confirma que `progress/impl_harness-kit-mount.md` documenta exactamente
esa reescritura como parte del trabajo de la feature 1 → el cambio ES intencional
y documentado. Esta sección re-verifica el estado actual contra la spec
REQ-01-01..06 con veredicto propio.

### Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó
en verde al final?
**Sí.** `progress/impl_harness-kit-mount.md` documenta el ciclo con salidas reales:
1. **Rojo:** `node --test "tests/**/*.test.mjs"` → `# tests 11 / # pass 7 / # fail 4`
   con `not ok 5/8/9/10` (templates/ ausentes, script `test` ausente); `pnpm test`
   → `EXIT=1 (Missing script: test)`. Los 4 fallos son exactamente las piezas de la
   feature 1; los 4 tests REQ-02 (feature 2, fuera de alcance) pasan.
2. **Verde:** `pnpm test` → `# tests 11 / # pass 11 / # fail 0`, `EXIT=0`;
   `./init.sh` → "El entorno está perfecto", `EXIT=0`.

### Verificación en disco del test actual (7 tests, REQ-01-xx)

- `tests/harness-kit-integrity.test.mjs`: 95 líneas físicas (≤100), 7 tests con
  etiquetas `REQ-01-*` (verificado con `wc -l` y `grep -c "^test("`).
- **REQ-01-04/05 (escaneo acotado):** `getKitFiles()` (líneas 29-42) devuelve SOLO
  los `OBLIGATORY_FILES` existentes (`existsSync`) + entradas de primer nivel de
  `templates/` (`readdirSync` no recursivo). No hay recursión ni rutas fuera del
  kit: es imposible recorrer `node_modules/`, `dist/`, `.astro/`, `src/`,
  `public/`, `tests/` ni `.git/`. El test `REQ-01-04/05` (líneas 50-57) verifica
  explícitamente que ningún archivo escaneado cae en `node_modules/`, `dist/`,
  `.astro/` ni `src/`, y el test `REQ-01-05` (líneas 59-67) verifica que los
  tokens de la app (`tomatesoft`, `cards-data`, `og-image`, `hero`) no aparecen
  en los archivos del kit. ✔

| REQ | Cobertura actual (test REQ-01-*) | Resultado |
|-----|----------------------------------|-----------|
| REQ-01-01 | archivos obligatorios existen + `templates/feature_list.json` parseable con exactamente 1 feature (JSON.parse + `length === 1`) | ✔ |
| REQ-01-02 | `templates/current.md` (`### Feature en curso`, `### Plan`, `### Bitácora`, `### Estado`) y `templates/history.md` (`## Sesiones`) | ✔ |
| REQ-01-03 | `package.json` con `"test": "node --test \"tests/**/*.test.mjs\""` (línea 12) | ✔ |
| REQ-01-04 | verificación SOLO de los archivos del kit (OBLIGATORY_FILES + plantillas) | ✔ |
| REQ-01-05 | escaneo de tokens limitado a archivos del kit + test explícito de alcance | ✔ |
| REQ-01-06 | test verifica que `init.sh` contiene contador `FAILURES` y `exit 1` | ✔ |

### Comandos ejecutados por el reviewer (verificación propia)

| Comando | Resultado |
|---------|-----------|
| `pnpm test` | `# tests 11 / # pass 11 / # fail 0`, EXIT=0 (7 REQ-01 + 4 REQ-02) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, EXIT=0 |
| `pnpm build` | `✓ Complete!` / `1 page(s) built`, EXIT=0 |
| `bash ./init.sh` | `✔ El entorno está perfecto. Podemos empezar a trabajar.`, EXIT=0 |

### Alcance declarado vs. `git status`

- **Modificados (tracked):** `package.json` (script test, REQ-01-03),
  `progress/current.md` (bitácora), `tests/harness-kit-integrity.test.mjs`
  (feature 1). Coincide con el informe.
- **Untracked:** `templates/` (feature 1), `feature_list.json` y `specs/01-13`
  (artefactos del arnés/spec_author, fases previas documentadas), `progress/`
  (impl_01_, impl_harness-kit-mount, review_01_, research/), y la sesión
  concurrente de la feature 2 (`src/styles/tokens.css`,
  `tests/design-tokens.test.mjs`, `progress/impl_02_design-tokens.md`,
  `progress/review_02_design-tokens.md`, `specs/02_design-tokens/`) — **no
  tocada por esta revisión.**
- No hay cambios fuera de la feature 1 salvo artefactos del arnés y de la sesión
  concurrente de la feature 2. Coherente con el alcance declarado. ✔

### Observaciones

1. Queda resuelta la observación nº 2 del APPROVED original (etiquetas `REQ-17-*`
   heredadas): el test actual usa `REQ-01-01..06`, alineado con la spec.
2. Queda resuelta la observación nº 1 del APPROVED original (105 líneas físicas):
   el archivo actual tiene 95 líneas físicas / 79 de código, dentro del límite
   con holgura.

### Decisión

El cambio es intencional, está documentado en `progress/impl_harness-kit-mount.md`
con evidencia de salidas reales (rojo 4-fail → verde 11/11), el test actual
cumple REQ-01-01..06 (incluidos REQ-01-04/05 con escaneo acotado al kit) y la
suite, el formato, el build e `init.sh` quedaron verificados en verde por mí.
No se requiere ningún cambio.

**Veredicto de la revisión complementaria (líder, feature 1): APPROVED.**
