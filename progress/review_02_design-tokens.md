# Review — feature 02 design-tokens

**Veredicto:** APPROVED (ronda 2 — ver "Re-revisión ronda 2" al final; el CHANGES_REQUESTED de la ronda 1 quedó resuelto)

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?

**Parcialmente.** El ciclo rojo/verde de la feature está bien documentado y es consistente con el disco:
- ROJO (impl_02): `node --test tests/design-tokens.test.mjs` → 4/4 FAIL, todos con `'src/styles/tokens.css no existe (REQ-02-01)'`. Coherente con la estructura actual del test (`readTokensCss()` lanza el assert de existencia antes de cualquier otra comprobación).
- VERDE (impl_02): test de la feature 4/4 pass. Verificado por mí: `node --test "tests/**/*.test.mjs"` → 11/11 pass.

**PERO** la evidencia de la suite completa del informe es **falsa respecto al disco**: impl_02 dice `7/7 pass (4 design-tokens + 3 harness-kit-integrity)`, mientras que el estado actual del disco ejecuta **11 subtests (4 design-tokens + 7 harness-kit-integrity)**. El archivo `tests/harness-kit-integrity.test.mjs` fue modificado a las **17:24:29** (LastWriteTime), es decir DESPUÉS del APPROVED de la feature 1 (`progress/review_01_harness-kit-mount.md`, 17:21:43, que documenta "3 tests presentes, líneas 68/78/92, 105 líneas físicas") y DURANTE la sesión de la feature 2 (impl_02 escrito a las 17:24:36, 7 segundos después). El propio informe impl_02 afirma "No se tocó: ... tests existentes" — contradice el estado real.

## Verificación ejecutada (evidencia concreta)

| # | Punto | Resultado | Evidencia |
|---|-------|-----------|-----------|
| 1 | `src/styles/tokens.css` valores EXACTOS del design.md | ✔ | Leído completo: `--color-background: #070716`, `--color-surface: #101018`, `--color-text: #ffffff`, `--color-text-secondary: #b8b8c5`, `--color-border: rgba(255,255,255,.08)`, `--color-border-strong: rgba(255,255,255,.15)`, `--color-accent: #7d68ff`, `--radius-card: 22px`, `--gap-card: 14px`, `--container-max: 1500px`, `--shadow-card: 0 25px 80px rgba(0,0,0,.35)`, `--transition-default: .28s cubic-bezier(.2,.8,.2,1)`, `--font-sans: Inter, ui-sans-serif, system-ui, sans-serif` — todos coinciden (líneas 13-59). |
| 2 | 12 grupos de REQ-02-02 cubiertos | ✔ | fondo (`--color-background`), superficie (`--color-surface`), texto (`--color-text`, `-secondary`), borde (`--color-border`, `-strong`), acento (`--color-accent`), marca (12 tokens), radio (`--radius-card`), espaciado (`--gap-card`), sombra (`--shadow-card`), tipografía (`--font-sans`), transición (`--transition-default`), contenedor (`--container-max`). Nota: REQ-02-02 enumera 11 grupos en el texto; el test exige 12 incluyendo "marca" (coherente con design.md y con la descripción/acceptance de la feature; superset válido — ver Observaciones). |
| 3 | Patrón `--grupo-nombre` kebab-case en TODAS las custom properties | ✔ | 25 custom properties, todas con dos segmentos o más, minúsculas: `--color-marca-node-bottom`, `--color-marca-github-bottom`, `--color-marca-youtube-bottom`, `--color-marca-twitch-bottom` incluidas. Verificado por lectura + test REQ-02-04 (regex sobre todas las props tras quitar comentarios). |
| 4 | ≤100 líneas y sin valores de otros archivos | ✔ | tokens.css: 61 líneas (máx. 100). Sin imports, sin var() de otros archivos: solo declaraciones `--x: valor` en `:root`. CSS puro, sin dependencias (C6). |
| 5 | Tokens de marca = paleta real de hero.data.ts (comparación real) | ✔ | react `#0E6C82` (=hero.data.ts:49), html `#B74D05` (=:69), node `#08783A` (=:87), github `#091223` (=:107), youtube `#B61111` (=:129), twitch `#6C20B6` (=:149), typescript `#215BC7` (=:169), css `#6E29C8` (=:189), node-bottom `#0A7C39` (=:209), github-bottom `#202A3A` (=:229), youtube-bottom `#BF1616` (=:249), twitch-bottom `#7B29D6` (=:269). Los 12 coinciden exactamente. |
| 6 | Decisión variantes bottom (node/github/youtube/twitch-bottom) | ✔ Aceptable | REQ-02-03 exige derivar de "la paleta de colores actual de hero.data.ts", y esa paleta incluye los 4 hex bottom. Crear tokens propios preserva la identidad visual (features 3/4: "hero idéntico") y habilita `colorToken` de la feature 6 (REQ-06-04: sin hex en fondos) sin cambiar color. Mapear bottom→principal habría descartado 4 colores de la paleta. Nombres `--color-marca-<id>` con los ids reales de las tarjetas, kebab-case. Decisión justificada y no conflictiva con REQ-02-03 (los 8 del acceptance existen). |
| 7 | `tests/design-tokens.test.mjs` verifica lo que dice | ✔ | REQ-02-01: existencia + ≤100 líneas (assert real, `split('\n')`). REQ-02-02: 12 grupos con token representativo. REQ-02-03: regex case-insensitive token+color para los 12 tokens de marca. REQ-02-04: extrae TODAS las custom properties (tras quitar comentarios) y valida kebab-case. REQ-02-05: cualquier grupo ausente → assert falla. |
| 8 | Trazabilidad acceptance ↔ REQ (feature 2) | ✔ | A1: test en rojo antes de tokens.css y verde al final (REQ-02-05) — evidencia del ciclo en impl_02. A2: tokens.css existe con ≥1 token por grupo (REQ-02-01, REQ-02-02). A3: tokens de marca react/html/node/github/youtube/twitch/typescript/css con colores de hero.data.ts (REQ-02-03). A4: todas las custom properties kebab-case (REQ-02-04). Sin brechas. |
| 9 | `node --test "tests/**/*.test.mjs"` | ✔ | Ejecutado por mí: 11/11 pass, `# fail 0`, exit 0 (4 design-tokens + 7 harness-kit-integrity). |
| 10 | `node scripts/check-format.mjs` | ✔ | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0. |
| 11 | `pnpm build` | ✔ | `✓ Complete!` / `1 page(s) built in 816ms`, exit 0. |
| 12 | `./init.sh` (Git Bash) | ✔ | Todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0. |
| 13 | Alcance de la feature | ❌ Parcial | `git status`: sin cambios en hero.css, componentes, hero.data.ts, scripts/, init.sh. **PERO** `tests/harness-kit-integrity.test.mjs` está modificado (M) y su LastWriteTime (17:24:29) cae en la sesión de la feature 2, después del APPROVED de la feature 1 — el alcance declarado en impl_02 ("No se tocó ... tests existentes") no refleja el disco. |

## Checkpoints

- C1 — Estilos separados de la UI: [x] — tokens.css es la hoja central en `src/styles/`; ningún componente tocado.
- C2 — Lógica fuera de la UI: [x] — no se tocó lógica/UI.
- C3 — Datos vía repositorio: [x] — no se tocaron datos ni componentes.
- C4 — Tokens, no valores sueltos: [x] — archivo central de tokens creado con los valores del design.md; base para eliminar valores sueltos en features 3/4/8/10.
- C5 — ≤100 líneas por archivo: [x] — tokens.css 61 líneas. El test tiene 104 líneas físicas / ~88 de código (precedente review_01: lectura "líneas de código", no bloqueante; ver Observaciones).
- C6 — Sin dependencias externas: [x] — CSS puro, node:test.
- Datos (JSON/entidades/repositorios): [ ] — N/A: la feature no toca el dominio.
- `./init.sh` en verde: [x] — exit 0, "El entorno está perfecto".
- UI correcta desktop/móvil: [ ] — N/A: no hay cambios de UI.
- `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress` (pasará a `done` tras APPROVED, protocolo).
- `progress/current.md` documenta la sesión: [x] — bitácora con rojo → implementación → verde de la feature 2.
- Sin temporales/`print()`/TODOs: [x] — sin restos en tokens.css ni en el test de la feature.

## Cambios requeridos

1. **Resolver el cambio no documentado en `tests/harness-kit-integrity.test.mjs`.** El archivo fue modificado a las 17:24:29 (7 tests, 124 líneas, etiquetas REQ-01-xx), DESPUÉS del APPROVED de la feature 1 (review_01: 3 tests, 105 líneas, REQ-17-xx) y en la ventana temporal de la sesión de la feature 2. Opciones: (a) si el cambio es intencional, documentarlo y re-revisarlo como parte de la feature 1 (actualizar `progress/review_01_harness-kit-mount.md` o emitir revisión complementaria — su contenido es coherente con init.sh: `FAILURES` línea 31/39, `exit 1` línea 75, y la suite pasa); (b) si no es intencional, revertirlo. No puede quedar un archivo revisado-aprobado modificado sin revisión.
2. **Corregir la evidencia en `progress/impl_02_design-tokens.md`.** El estado real en disco es: suite completa **11/11** (4 design-tokens + 7 harness-kit-integrity), no `7/7 (4 + 3)`; y el apartado de alcance debe reflejar la modificación de `tests/harness-kit-integrity.test.mjs` (quitar "No se tocó ... tests existentes") o la evidencia queda desactualizada frente al disco, incumpliendo la exigencia de `docs/verification.md` (evidencia del ciclo real).

## Observaciones (no bloqueantes)

1. REQ-02-02 enumera 11 grupos en el texto ("...acento radio espaciado sombra tipografía transición y contenedor") mientras el test exige 12 incluyendo "marca". El test es un superset válido (marca viene exigida por REQ-02-03, design.md y la descripción/acceptance de la feature). Si se quiere exactitud terminológica, ajustar el texto de REQ-02-02 en la spec — decisión del spec_author/líder, no del implementer.
2. `tests/design-tokens.test.mjs` tiene 104 líneas físicas / ~88 de código (16 líneas de comentario de cabecera). Dentro del límite bajo la lectura "líneas de código" usada en review_01 para el test del harness (105 físicas / 97 de código, no bloqueante). Si se toca el archivo en el futuro, compactar el comentario de cabecera para dejarlo holgado.

## Conclusión

La feature 2 en sí (tokens.css + test) es correcta: valores exactos del design.md, 12 grupos, kebab-case total, 61 líneas, tokens de marca idénticos a la paleta real de hero.data.ts, decisión de variantes bottom justificada y válida, trazabilidad acceptance↔REQ completa y suite/init.sh en verde. El bloqueo es de integridad del proceso: un archivo del arnés aprobado en la feature 1 quedó modificado durante la sesión de la feature 2 sin documentar ni re-revisar, y el informe impl_02 afirma un alcance y una evidencia (7/7) que no coinciden con el disco (11/11).

---

## Re-revisión ronda 2 — 2026-08-10

**Veredicto: APPROVED.** Ambos cambios requeridos en la ronda 1 quedaron resueltos y verificados por mí en disco.

### Cambio 1 — test del harness (opción a adoptada) ✔

- `progress/review_01_harness-kit-mount.md` contiene la sección "Revisión complementaria (feature 2)" (líneas 47-86): motiva el cambio detectado (LastWriteTime 17:24:29, ventana de la feature 2, después del APPROVED de la feature 1 a las 17:21:43), compara el estado aprobado vs. el actual (105 líneas/3 tests REQ-17-xx → 95 líneas/7 tests REQ-01-xx), verifica la cobertura REQ-01-01..06 con tabla por REQ, ejecuta la verificación (11/11, formato, build, init.sh), lo adopta como intencional (mejora la trazabilidad y resuelve la observación nº 2 del propio review_01) y **mantiene el APPROVED de la feature 1**. Es coherente y honesto: reconoce que la autoría no consta en la sesión registrada de la feature 2 y que el contenido resultante quedó en disco.
- Verificado por mí en disco: `tests/harness-kit-integrity.test.mjs` tiene 95 líneas físicas y 7 tests con etiquetas REQ-01-01..06 (`getKitFiles()` acotado a `OBLIGATORY_FILES` + `templates/`, `OUT_OF_SCOPE_DIRS` con node_modules/dist/.astro/src, asserts de plantillas/script test/init.sh con `FAILURES`+`exit 1` — coherentes con init.sh líneas 31/39/75). La suite pasa 11/11.

### Cambio 2 — evidencia corregida en impl_02 ✔

- `progress/impl_02_design-tokens.md`: suite completa actualizada a **11/11 (4 design-tokens + 7 harness-kit-integrity)** con nota cronológica que explica el 7/7 inicial (líneas 43-45); apartado de alcance corregido (línea 61: "No se tocó: hero.css, componentes, hero.data.ts, package.json, init.sh, scripts/ ni templates/") y la excepción del harness documentada y resuelta (líneas 63 y 87-118); sección "Resolución de los cambios requeridos (ronda 1)" con diagnóstico, decisión (opción a), evidencia de re-verificación y verificación final. ✔

### Verificación ejecutada por mí (ronda 2)

| Comando | Resultado |
|---------|-----------|
| `node --test "tests/**/*.test.mjs"` | 11/11 pass, `# fail 0`, exit 0 (4 design-tokens + 7 harness-kit-integrity) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0 |
| `pnpm build` | `✓ Complete!` / `1 page(s) built`, exit 0 |
| `bash ./init.sh` | Todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0 |

### Feature 2 en disco (sin cambios desde la ronda 1)

- `src/styles/tokens.css`: 61 líneas, 25 custom properties, valores exactos del design.md, kebab-case total, 12 grupos, tokens de marca idénticos a `hero.data.ts` (incluidas las 4 variantes bottom — decisión aceptada). ✔
- `tests/design-tokens.test.mjs`: 104 líneas, sin cambios (LastWriteTime 17:23:55); verifica existencia/≤100 líneas, 12 grupos, colores de marca y kebab-case sobre todas las props. ✔
- `git status`: sin cambios en hero.css, componentes, hero.data.ts, `scripts/`, `init.sh` ni `package.json` (sigue M solo por la feature 1 aprobada). Nuevos untracked en `progress/` únicamente (`impl_harness-kit-mount.md`, `review_02_design-tokens.md`) — dentro del área de alcance. ✔

### Observaciones (no bloqueantes)

1. impl_02 línea 59 afirma "32 tokens, 70 líneas" para tokens.css; el disco tiene 25 custom properties y 61 líneas. El contaje del informe es impreciso (heredado de la ronda 1); no afecta a la corrección verificada del archivo ni al test.
2. `progress/impl_harness-kit-mount.md` (informe de la sesión de re-implementación de la feature 1) atribuye `src/styles/tokens.css` y `tests/design-tokens.test.mjs` a "artefactos pre-stage del spec_author". Es impreciso: los creó la sesión de la feature 2 (LastWriteTime 17:23:55/17:24:03, documentado en impl_02). No afecta a la feature 2; se anota para la honestidad del registro.

### Checkpoints (estado final)

- C1..C6 Arquitectura: [x] — tokens.css 61 líneas, CSS puro, sin dependencias, valores de design.md; sin tocar componentes/datos.
- `./init.sh` en verde: [x] — exit 0.
- `feature_list.json`: [ ] — feature 2 correctamente en `in_progress`; pasará a `done` tras este APPROVED (protocolo).
- `progress/current.md` documenta la sesión: [x].
- Sin temporales/`print()`/TODOs: [x].

### Conclusión

Los dos cambios requeridos en la ronda 1 están resueltos y verificados: el test del harness quedó documentado y re-revisado (feature 1 mantiene su APPROVED) y la evidencia de impl_02 refleja el estado real del disco (11/11). La feature 2 cumple REQ-02-01..05 y sus 4 acceptance. Suite, formato, build e `init.sh` verificados en verde por el reviewer en esta ronda. **APPROVED.**

---

## Revisión ronda 2 (líder) — 2026-08-10

**Veredicto: APPROVED.** Los 2 cambios requeridos en la ronda 1 quedaron resueltos
(los 2 por la vía documentada) y toda la verificación de la feature 2 se re-ejecutó
por mí en verde.

### Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en
verde al final? **Sí.** `progress/impl_02_design-tokens.md` conserva intacto el ciclo
rojo/verde de la feature 2:
- **ROJO:** `node --test tests/design-tokens.test.mjs` → 4/4 FAIL (todos con
  `'src/styles/tokens.css no existe (REQ-02-01)'`), capturado antes de crear
  tokens.css (impl_02 líneas 8-30).
- **VERDE:** test de la feature 4/4 pass → suite completa **11/11** con salida TAP
  real re-ejecutada (impl_02 líneas 47-65: `# tests 11 / # pass 11 / # fail 0`).

### Cambio 1 — `tests/harness-kit-integrity.test.mjs` (resuelto por la vía del líder) ✔

Verifiqué en `progress/review_01_harness-kit-mount.md` la sección
"Revisión complementaria (líder, feature 1) — 2026-08-10 ~17:30" (líneas 88-176):
- Confirma que `progress/impl_harness-kit-mount.md` documenta la reescritura del
  test (7 tests REQ-01-xx, escaneo acotado) como parte del trabajo de la feature 1
  → el cambio es intencional y documentado.
- Re-verifica el test actual contra REQ-01-01..06 (tabla por REQ, líneas 127-134),
  con comandos ejecutados por el reviewer (11/11, check-format, build, init.sh).
- Veredicto propio: **APPROVED** (línea 176).

Por tanto, el archivo modificado pertenece a la feature 1 (ya aprobada) y **no** es
parte del alcance de la feature 2. Verificado en disco por mí: el test actual tiene
95 líneas físicas y 7 tests con etiquetas `REQ-01-*`; la suite ejecuta 11 subtests
(4 REQ-02 + 7 REQ-01) y pasa.

### Cambio 2 — evidencia corregida en `progress/impl_02_design-tokens.md` ✔

Verificado en el archivo actualizado:
- Suite completa corregida a **11/11** (4 design-tokens + 7 harness-kit-integrity)
  con la salida TAP real de la re-ejecución (líneas 47-65) y nota cronológica que
  explica el 7/7 inicial (línea 67).
- Apartado de alcance corregido (línea 83): la feature crea exactamente 2 archivos
  (`src/styles/tokens.css` + `tests/design-tokens.test.mjs`); la modificación de
  `tests/harness-kit-integrity.test.mjs` queda atribuida a la feature 1 con su
  revisión complementaria APPROVED (línea 85).
- Sección "Corrección de evidencia (ronda 2)" (líneas 135-156): afirma que esta
  ronda solo tocó `progress/impl_02_design-tokens.md` y `progress/current.md`, sin
  código — coherente con `git status` (sin cambios de código de la feature 2).

### Verificación ejecutada por mí (ronda 2)

| Comando | Resultado |
|---------|-----------|
| `node --test "tests/**/*.test.mjs"` | **11/11 pass**, `# fail 0`, EXIT=0 (4 design-tokens + 7 harness-kit-integrity) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, EXIT=0 |
| `pnpm build` | `✓ Complete!` / `1 page(s) built in 860ms`, EXIT=0 |
| `bash ./init.sh` | Todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, EXIT=0 |

### Feature 2 en disco (re-verificación rápida, ya detallada en ronda 1)

- `src/styles/tokens.css` (61 líneas, ≤100): valores exactos del design.md
  (`--color-background: #070716`, `--color-surface: #101018`, `--color-text:
  #ffffff`, `--color-text-secondary: #b8b8c5`, `--color-border:
  rgba(255,255,255,.08)`, `--color-border-strong: rgba(255,255,255,.15)`,
  `--color-accent: #7d68ff`, `--radius-card: 22px`, `--gap-card: 14px`,
  `--container-max: 1500px`, `--shadow-card: 0 25px 80px rgba(0,0,0,.35)`,
  `--transition-default: .28s cubic-bezier(.2,.8,.2,1)`, `--font-sans: Inter,
  ui-sans-serif, system-ui, sans-serif`); 12 grupos cubiertos; 25 custom properties
  todas kebab-case (`--grupo-nombre`). ✔
- Tokens de marca: los 12 hex de tokens.css coinciden exactamente con la paleta de
  `src/data/hero.data.ts` (líneas 49-269: react `#0E6C82`, html `#B74D05`, node
  `#08783A`, github `#091223`, youtube `#B61111`, twitch `#6C20B6`, typescript
  `#215BC7`, css `#6E29C8`, node-bottom `#0A7C39`, github-bottom `#202A3A`,
  youtube-bottom `#BF1616`, twitch-bottom `#7B29D6`). ✔
- `tests/design-tokens.test.mjs` (104 líneas): verifica REQ-02-01 (existencia +
  ≤100 líneas), REQ-02-02 (12 grupos con token representativo), REQ-02-03 (token +
  color case-insensitive para los 12 de marca), REQ-02-04 (todas las custom
  properties kebab-case tras quitar comentarios), REQ-02-05 (ausencia → assert
  falla). ✔

### Alcance (`git status`)

- **Modificados (tracked):** `package.json` (script test — feature 1 aprobada),
  `progress/current.md` (bitácora), `tests/harness-kit-integrity.test.mjs`
  (feature 1, re-aprobada en la revisión complementaria del líder).
- **Untracked de la feature 2:** `src/styles/tokens.css`, `tests/design-tokens.test.mjs`,
  `progress/impl_02_design-tokens.md`, `progress/review_02_design-tokens.md`
  (+ `specs/02_design-tokens/` del spec_author).
- El resto de untracked (`templates/`, `feature_list.json`, `specs/01-13`,
  `progress/impl_01_*`, `impl_harness-kit-mount`, `research/`, `review_01_*`)
  pertenece al arnés/spec_author/feature 1 — fases previas documentadas.
- **Sin cambios fuera de alcance para la feature 2.** ✔

### Checkpoints

- C1 Estilos separados de la UI: [x] — tokens.css en `src/styles/`, sin componentes tocados.
- C2 Lógica separada de la UI: [x] — sin lógica/UI tocada.
- C3 Datos vía repositorio: [x] — sin datos/componentes tocados.
- C4 Tokens, no valores sueltos: [x] — archivo central de tokens con valores del design.md.
- C5 ≤100 líneas por archivo: [x] — tokens.css 61 líneas; test 104 físicas / ~88 de código (no bloqueante, precedente review_01).
- C6 Sin dependencias externas: [x] — CSS puro, node:test.
- `./init.sh` en verde: [x] — "El entorno está perfecto", EXIT=0.
- `feature_list.json`: [x] — feature 2 marcada `done` en disco (protocolo de cierre tras APPROVED de ronda 2).
- `progress/current.md` documenta la sesión: [x].
- Sin temporales/`print()`/TODOs: [x].

### Observaciones (no bloqueantes)

1. El disco ya contenía una "Re-revisión ronda 2" APPROVED al final de este archivo
   (sesión previa del reviewer, current.md bitácora línea 50). Esta sección
   "Revisión ronda 2 (líder)" la confirma con verificación independiente: los 2
   cambios requeridos están resueltos y la suite, formato, build e `init.sh`
   quedaron en verde ejecutados por mí.
2. `feature_list.json` ya figura con feature 2 `status: "done"` (línea 34), lo que
   confirma el cierre del ciclo tras el APPROVED — coherente con el protocolo.

### Conclusión

Los 2 cambios requeridos en la ronda 1 están resueltos: (1) el test del harness
quedó aprobado como parte de la feature 1 en la revisión complementaria del líder
(`progress/review_01_harness-kit-mount.md`, sección "Revisión complementaria
(líder, feature 1)", veredicto APPROVED) y (2) la evidencia de impl_02 refleja el
estado real del disco (suite 11/11 con salida TAP real, alcance atribuido
correctamente a la feature 1). La feature 2 cumple REQ-02-01..05 y sus 4
acceptance; suite, formato, build e `init.sh` verificados en verde por mí en esta
ronda. **APPROVED.**
