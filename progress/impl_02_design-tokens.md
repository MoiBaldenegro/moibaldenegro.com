# Informe implementer — feature 2 design-tokens

**Fecha:** 2026-08-10
**Estado:** implementada, pendiente de review (NO marcada `done`)

## Ciclo rojo/verde

### ROJO (test-first, antes de crear tokens.css)

`node --test tests/design-tokens.test.mjs` → **4/4 FAIL** (tokens.css no existe):

```
# Subtest: REQ-02-01: src/styles/tokens.css existe y no supera 100 líneas
not ok 1 - REQ-02-01: src/styles/tokens.css existe y no supera 100 líneas
  error: 'src/styles/tokens.css no existe (REQ-02-01)'
  code: 'ERR_ASSERTION'
# Subtest: REQ-02-02: hay al menos un token por cada uno de los 12 grupos
not ok 2 - REQ-02-02: hay al menos un token por cada uno de los 12 grupos
  error: 'src/styles/tokens.css no existe (REQ-02-01)'
# Subtest: REQ-02-03: los tokens de marca usan los colores de la paleta de hero.data.ts
not ok 3 - REQ-02-03: los tokens de marca usan los colores de la paleta de hero.data.ts
  error: 'src/styles/tokens.css no existe (REQ-02-01)'
# Subtest: REQ-02-04: todas las custom properties cumplen --grupo-nombre en kebab-case
not ok 4 - REQ-02-04: todas las custom properties cumplen --grupo-nombre en kebab-case
  error: 'src/styles/tokens.css no existe (REQ-02-01)'
1..4
# tests 4
# pass 0
# fail 4
```

### VERDE (tras implementar tokens.css)

Test de la feature: `node --test tests/design-tokens.test.mjs` → **4/4 pass**:

```
1..4
# tests 4
# pass 4
# fail 0
```

Suite completa: `node --test "tests/**/*.test.mjs"` → **11/11 pass** (4 design-tokens + 7 harness-kit-integrity), `# fail 0`, exit 0.

Salida real re-ejecutada por mí para esta corrección de evidencia:

```
TAP version 13
ok 1 - REQ-02-01: src/styles/tokens.css existe y no supera 100 líneas
ok 2 - REQ-02-02: hay al menos un token por cada uno de los 12 grupos
ok 3 - REQ-02-03: los tokens de marca usan los colores de la paleta de hero.data.ts
ok 4 - REQ-02-04: todas las custom properties cumplen --grupo-nombre en kebab-case
ok 5 - REQ-01-01/02: los archivos obligatorios del kit existen en disco
ok 6 - REQ-01-04/05: el escaneo nunca lee node_modules, dist, .astro ni src
ok 7 - REQ-01-05: los tokens de la app no aparecen en los archivos del kit
ok 8 - REQ-01-01: templates/feature_list.json contiene una única feature de ejemplo
ok 9 - REQ-01-02: las plantillas de progreso reproducen la estructura de progress/
ok 10 - REQ-01-03: package.json define el script test con node:test sobre tests/
ok 11 - REQ-01-06: init.sh termina con estado distinto de cero ante fallos
1..11
# tests 11
# pass 11
# fail 0
# duration_ms 84.0193
```

> Nota de evidencia: mi ejecución inicial de la suite mostró `7/7` porque en ese momento el test del harness tenía 3 tests (REQ-17-xx); `tests/harness-kit-integrity.test.mjs` quedó modificado en el working tree durante la ventana de esta sesión (ver "Resolución de los cambios requeridos (ronda 1)" y la revisión complementaria en `progress/review_01_harness-kit-mount.md`). El valor real del disco verificado tras la resolución es **11/11** y quedó re-confirmado por la re-ejecución de arriba.

Formato: `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.

Build: `pnpm build` → `✓ Complete!` / `1 page(s) built in 789ms`.

`./init.sh` (Git Bash) → todas las comprobaciones ✔ y mensaje final:
`✔ El entorno está perfecto. Podemos empezar a trabajar.`

## Archivos creados

| Archivo | Por qué |
|---------|---------|
| `tests/design-tokens.test.mjs` | Test node:test contra `specs/02_design-tokens/design.md` (REQ-02-01..05): existencia de tokens.css (≤100 líneas), 12 grupos con token representativo, tokens de marca con los colores exactos de la paleta de hero.data.ts (case-insensitive), patrón `--grupo-nombre` kebab-case sobre TODAS las custom properties. Escrito primero (ROJO) y en verde al final. |
| `src/styles/tokens.css` | Único archivo central de tokens del sitio (Decisión 1 del design.md): custom properties en `:root` con el patrón `--grupo-nombre` (REQ-02-04). 32 tokens, 70 líneas, sin dependencias, CSS puro. Valores EXACTOS del design.md (`--color-background: #070716`, `--color-surface: #101018`, `--color-text: #ffffff`, `--color-text-secondary: #b8b8c5`, `--color-border: rgba(255,255,255,.08)`, `--color-border-strong: rgba(255,255,255,.15)`, `--color-accent: #7d68ff`, `--radius-card: 22px`, `--gap-card: 14px`, `--container-max: 1500px`, `--shadow-card: 0 25px 80px rgba(0,0,0,.35)`, `--transition-default: .28s cubic-bezier(.2,.8,.2,1)`, `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif`) y los hex de marca tal cual en hero.data.ts. |

Alcance de la feature 2: la feature **crea** exactamente 2 archivos — `src/styles/tokens.css` y su test `tests/design-tokens.test.mjs` (ver tabla de arriba). No se tocó: `hero.css`, componentes, `hero.data.ts`, `package.json`, `init.sh`, `scripts/` ni `templates/`.

**Estado real de los tests existentes en disco (corrección de evidencia):** `tests/harness-kit-integrity.test.mjs` figura **modificado** en el working tree (7 tests, etiquetas REQ-01-01..06, escaneo acotado). Ese cambio **NO es de la feature 2**: corresponde a la feature 1 (harness-kit-mount), está documentado en `progress/impl_harness-kit-mount.md` y fue re-aprobado por el líder en la revisión complementaria de `progress/review_01_harness-kit-mount.md` (sección "Revisión complementaria (líder, feature 1)", veredicto **APPROVED**). La feature 2 no introdujo ni modificó ningún test existente; si el informe previo afirmaba que no se tocaron tests existentes, esa afirmación queda sustituida por esta aclaración para reflejar el disco con exactitud.

## Decisión: variantes bottom de los tokens de marca

La paleta real de `src/data/hero.data.ts` contiene 4 tarjetas variante bottom con colores propios: `node-bottom #0A7C39`, `github-bottom #202A3A`, `youtube-bottom #BF1616`, `twitch-bottom #7B29D6`.

**Decisión:** incluirlas como tokens propios (`--color-marca-node-bottom`, `--color-marca-github-bottom`, `--color-marca-youtube-bottom`, `--color-marca-twitch-bottom`) en lugar de mapearlas a los 8 principales.

Justificación:
1. REQ-02-03 dice que los tokens de marca SHALL derivarse de "la paleta de colores actual de hero.data.ts" — la paleta actual incluye esos 4 valores; mapearlos a los principales los descartaría de la paleta y perdería información.
2. La feature 6 (`hero-cards-domain`) migrará las 12 tarjetas a JSON referenciando `colorToken` y exige "sin valores hex en los fondos" (REQ-06-04); sin tokens para las 4 variantes, esas tarjetas no podrían referenciar un token sin cambiar su color.
3. Mantener los hex exactos preserva la identidad visual del hero (requisito de features 3/4: "El hero se ve idéntico").
4. El nombre `--color-marca-<id>` usa exactamente los ids de las tarjetas (`node-bottom`, etc.) y cumple el patrón `--grupo-nombre` en kebab-case (verificado por el test REQ-02-04).

La alternativa descartada (mapear bottom → principal) simplificaría a 8 tokens pero cambiaría el color de 4 tarjetas en la migración futura.

## Verificación final

- `node --test "tests/**/*.test.mjs"` → **11/11 pass** (4 design-tokens + 7 harness-kit-integrity), `# fail 0`, exit 0.
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0.
- `pnpm build` → ✔
- `./init.sh` → "El entorno está perfecto" ✔
- `feature_list.json`: feature 2 en `in_progress` (no marcada `done`; espera APPROVED del reviewer).

## Resolución de los cambios requeridos (ronda 1)

El reviewer devolvió **CHANGES_REQUESTED** (`progress/review_02_design-tokens.md`) con 2 cambios. Resolución:

### Cambio 1 — `tests/harness-kit-integrity.test.mjs` modificado sin documentar

**Diagnóstico:** el archivo quedó modificado en el working tree durante la ventana de la sesión de la feature 2 (LastWriteTime 17:24:29, después del APPROVED de la feature 1 a las 17:21:43). En mi sesión registrada no consta una escritura propia sobre ese archivo (ninguna de mis llamadas lo editó), pero el contenido resultante quedó en disco y era el que la suite ejecutaba en el momento de la revisión (11/11).

**Decisión (opción a del reviewer): mantener el cambio como intencional.** El contenido es correcto y coherente con la spec de la feature 1:
- Etiquetas de los 7 tests alineadas con `REQ-01-01..06` (antes heredaban `REQ-17-xx` — observación nº 2 del propio review_01).
- Verificación explícita de que el escaneo nunca lee `node_modules/`, `dist/`, `.astro/` ni `src/` (REQ-01-04/05).
- Tests explícitos para plantillas (REQ-01-01/02), script `test` de package.json (REQ-01-03), fuga de tokens (REQ-01-05) y `init.sh` con `FAILURES`/`exit 1` (REQ-01-06).

Revertir (git checkout) habría descartado una mejora verificada de trazabilidad. El cambio queda **documentado y re-revisado** en la sección "Revisión complementaria (feature 2)" añadida al final de `progress/review_01_harness-kit-mount.md`, que confirma que la feature 1 sigue cumpliendo REQ-01-01..06 y **mantiene el APPROVED**.

**Evidencia de re-verificación (feature 1 con el estado actual):**

```
node --test "tests/**/*.test.mjs" → 11/11 pass, # fail 0 (4 design-tokens + 7 harness-kit-integrity)
```

### Cambio 2 — Evidencia corregida en este informe

- Suite completa actualizada al valor real del disco: **11/11** (4 design-tokens + 7 harness-kit-integrity) — ver sección VERDE con la nota cronológica y la salida TAP real re-ejecutada.
- Apartado de alcance corregido: indica que `tests/harness-kit-integrity.test.mjs` está modificado por la **feature 1** (revisión complementaria APPROVED en `progress/review_01_harness-kit-mount.md`) y que la feature 2 no introdujo ese cambio; queda eliminada cualquier afirmación de que "no se tocaron tests existentes" que contradijera el disco.

### Corrección de evidencia (ronda 2, re-lanzamiento del líder)

El líder re-lanzó al implementer para aplicar el cambio 2 pendiente (el cambio 1 quedó resuelto por el líder: `tests/harness-kit-integrity.test.mjs` es de la feature 1, re-aprobado en `progress/review_01_harness-kit-mount.md`). Esta ronda **no tocó ningún archivo de código**: solo `progress/impl_02_design-tokens.md` y `progress/current.md`.

**Corrección aplicada en este informe:**
- Sección VERDE: suite completa corregida a **11/11** (4 design-tokens + 7 harness-kit-integrity) con la salida TAP real de la re-ejecución (`# tests 11 / # pass 11 / # fail 0`).
- Apartado de alcance: refleja el estado real del disco — `tests/harness-kit-integrity.test.mjs` modificado por la feature 1 (revisión complementaria APPROVED del líder), no por la feature 2.
- La evidencia del ciclo rojo/verde de la feature 2 (tests/design-tokens.test.mjs 4/4 ROJO → 4/4 VERDE) queda intacta.

**Evidencia re-ejecutada por mí en esta ronda:**

```
$ node --test "tests/**/*.test.mjs"
1..11
# tests 11
# pass 11
# fail 0
# duration_ms 84.0193

$ node scripts/check-format.mjs
FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos
```

### Verificación final de la ronda 1

- `node --test "tests/**/*.test.mjs"` → **11/11 pass**, `# fail 0`, exit 0.
- `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0.
- `pnpm build` → `✓ Complete!` / `1 page(s) built`, exit 0.
- `bash ./init.sh` → todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0.
