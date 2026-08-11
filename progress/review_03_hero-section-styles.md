# Review — feature 03 hero-section-styles

**Veredicto:** APPROVED (ronda 2 — ver "Re-revisión ronda 2" al final; el CHANGES_REQUESTED de la ronda 1 quedó resuelto)

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?

**Sí, con evidencia consistente con el disco.**
- ROJO (impl_03, líneas 10-21): `node --test tests/hero-section-styles.test.mjs` → `# tests 5 / # pass 0 / # fail 5`, todos con `'src/styles/hero-section.css no existe'` (salvo REQ-03-01: `'new-hero.astro no importa ../../styles/hero-section.css'`). Coherente con la estructura del test actual (`readSectionCss()` lanza el assert de existencia antes de nada).
- VERDE (impl_03): test de la feature 5/5 → suite completa 16/16. **Re-ejecutado por mí**: `node --test "tests/**/*.test.mjs"` → 16/16 pass, `# fail 0`, exit 0 (4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles). La evidencia del ciclo es real y verificable.

## Verificación ejecutada (evidencia concreta)

| # | Punto | Resultado | Evidencia |
|---|-------|-----------|-----------|
| 1 | `src/styles/hero-section.css` ≤100 líneas | ✔ | 98 líneas físicas (REQ-03-04). |
| 2 | Sin hex/rgb()/rgba() hardcodeados | ✔ | Lectura completa: colores/radios/transiciones solo `var(--...)`; sin `#`, `rgb(`, `rgba(`. Los únicos valores literales son dimensiones (900px, 74px, 0.95rem, 14px…) que no son color/radio/sombra/transición (REQ-03-05 y test REQ-03-05 en verde). |
| 3 | Selectores de fondo/navbar/grid + media queries (REQ-03-02) | ✔ | `.new-hero`, `.hero-background`, `.hero-gradient` (con `animation: float`), `.hero-noise`, `.hero-navbar` (+ nav/a/::after/hover), `.hero-grid`, `@keyframes float`, media 1200 (solo grid) y 768 (navbar nav, navbar a, grid). |
| 4 | Equivalencia con los originales de hero.css (git diff HEAD) | ✔ | Verificado contra el diff: todos los valores numéricos idénticos — gradiente `#25144f 0% / #0b0818 35% / #05050b 100%`, glow `rgba(120,70,255,.25)`, navbar `rgba(8,8,18,.75)`, hover `#9a89ff`, pill `999px`, grid `12×95px`, media 1200 `6×140px`, media 768 `1fr/190px`, keyframes float (0/50/100). Sustituciones equivalentes: `#fff`→`var(--color-text)` (#ffffff), `white`→`var(--color-text)`, `--transition` (.28s cubic-bezier(.2,.8,.2,1))→`--transition-default` (idéntico), `--container` 1500px→`--container-max`, `--gap` 14px→`--gap-card`. |
| 5 | Diferencias deliberadas (punto de atención del líder) | ✔ Aceptables | (a) `a::after` transition `.25s`→`var(--transition-default)` (`.28s`): 30 ms imperceptibles; exigida por REQ-03-03 (transiciones desde tokens) y design.md; documentada. (b) Glow `border-radius:50%`→`var(--radius-pill)` 999px: sobre un cuadrado 900×900 el navegador clampa el radio al 50% del lado → círculo idéntico; el `::after` ya usaba 999px originalmente. Ambas no rompen "el hero se ve idéntico". |
| 6 | `new-hero.astro` (REQ-03-01) | ✔ | Importa `../../styles/tokens.css`, `../../styles/hero-section.css` y conserva `../../styles/hero.css` (líneas 2-4). Conservar hero.css es correcto: el markup `.profile-card` vive en este componente y `hero-card.astro` no tiene hoja propia — se estilan desde hero.css hasta la feature 4 (justificación del informe, línea 73, verificada en el markup líneas 43-100). Importar tokens.css es necesario: ningún otro componente lo importaba (hallazgo documentado en current.md) y sin él los `var(--color-*)` no resuelven. |
| 7 | Tokens añadidos a tokens.css (7) | ✔ Legítimos | `--color-hero-top #25144f`, `--color-hero-mid #0b0818`, `--color-hero-bottom #05050b`, `--color-glow rgba(120,70,255,.25)`, `--color-navbar rgba(8,8,18,.75)`, `--color-accent-hover #9a89ff`, `--radius-pill 999px` — todos con valores idénticos a los de hero.css. Sin ellos es imposible cumplir REQ-03-03 (solo var()) manteniendo el aspecto idéntico (REQ-03-02); la alternativa (hardcodear) viola "Tokens, no valores sueltos". Todos cumplen `--grupo-nombre` kebab-case. tokens.css: 71 líneas ≤100. |
| 8 | Test de la feature 2 sigue verde con los 7 tokens | ✔ | REQ-02-02 (12 grupos) y REQ-02-04 (regex kebab-case sobre TODAS las custom properties, incluidos los 7 nuevos) pasan: suite 16/16 ejecutada por mí. |
| 9 | `tests/hero-section-styles.test.mjs` verifica lo que dice | ✔ | REQ-03-01 (import en astro), REQ-03-04 (≤100 líneas real, `split('\n')`), REQ-03-02 (5 selectores), REQ-03-03 (regex de declaraciones color/radio/transición exige `var(--`), REQ-03-05 (regex hex y `rgba?\(`). 113 líneas físicas / ~87 de código — dentro del límite bajo la lectura de reviews previos (precedente review_01/02, no bloqueante). |
| 10 | Suite completa, formato, build, init.sh (ejecutados por mí) | ✔ | `node --test "tests/**/*.test.mjs"` 16/16; `node scripts/check-format.mjs` → `FORMATO ✔`; `pnpm.cmd build` → `1 page(s) built / Complete!`; `bash ./init.sh` → `✔ El entorno está perfecto.` exit 0. |
| 11 | Bundle emitido (evidencia "hero idéntico") | ✔ | `dist/_astro/index.DkvBU9Qt.css` contiene los 7 tokens nuevos, `var(--color-text)`, `var(--transition-default)`, `var(--gap-card)`, reglas `.hero-navbar`/`.hero-grid` y la regla media 768 (ver hallazgo #12). |
| 12 | **Hallazgo: `.hero-grid` del media 768 duplicado en hero.css** | ❌ | `src/styles/hero.css` líneas 452-458 conserva `.hero-grid { grid-template-columns:1fr; grid-auto-rows:190px }` dentro de `@media (max-width:768px)`, IDÉNTICA a la de hero-section.css (líneas 94-97). El informe impl_03 afirma que se movió: "@media (max-width:768px): solo .hero-navbar nav, .hero-navbar a y .hero-grid" (línea 83) y en "Quedan en hero.css" solo lista :root/reset/tarjetas/perfil/scrollbar (líneas 86-89). Confirmado en el bundle: la regla `grid-template-columns:1fr;grid-auto-rows:190px` aparece 2 veces. Sin impacto visual (mismos valores; hero.css se importa después y gana el cascade con el mismo valor), pero contradice el alcance declarado y deja dos fuentes de verdad. |
| 13 | Alcance (`git status`) | ✔ | Cambios de la feature 3: `src/styles/hero-section.css` (nuevo), `src/styles/hero.css` (M), `src/styles/tokens.css` (M en working tree), `src/components/new-hero/new-hero.astro` (M), `tests/hero-section-styles.test.mjs` (nuevo), `feature_list.json` (status 3 `in_progress`), `progress/impl_03_*`, `progress/current.md`. El resto de cambios visibles (package.json, tests/harness-kit-integrity.test.mjs, templates/, specs/01-13, etc.) pertenece a features 1-2/arnés sin commitear — documentado en reviews previos (review_02 ronda 2, líneas 189-200). Sin cambios fuera de alcance nuevos. |
| 14 | Trazabilidad acceptance ↔ REQ (feature 3) | ✔ | A1: hero-section.css existe + import en new-hero.astro → REQ-03-01. A2: test verifica ≤100 líneas y sin hex/rgba → REQ-03-04/05. A3: var() para colores/radios + selectores fondo/navbar/grid → REQ-03-02/03. A4: hero idéntico → equivalencia numérica verificada salvo 2 diferencias imperceptibles documentadas (aceptables). Sin brechas. |

## Checkpoints

- C1 — Estilos separados de la UI: [x] — new-hero.astro sin `<style>`; importa tokens.css + hero-section.css + hero.css.
- C2 — Lógica fuera de la UI: [x] — solo imports y paso de datos en el frontmatter.
- C3 — Datos vía repositorio: [ ] — N/A: la feature no toca datos/dominio (precedente reviews 01/02).
- C4 — Tokens, no valores sueltos: [x] — hero-section.css consume solo tokens (REQ-03-03); hero.css conserva valores sueltos planificados para eliminación en la feature 4 (documentado en design.md, decisión 1).
- C5 — ≤100 líneas por archivo: [x] — hero-section.css 98, tokens.css 71, test ~87 de código; hero.css 540 y new-hero.astro 104 son violaciones transitorias con discusión registrada (design.md decisión 1 + feature 4; informe líneas 111-113 + feature 9), precedente de reviews previos.
- C6 — Sin dependencias externas: [x] — CSS puro, node:test.
- Datos (JSON/entidades/repositorios): [ ] — N/A.
- `./init.sh` en verde: [x] — exit 0, "El entorno está perfecto", verificado por mí.
- UI correcta desktop/móvil: [x] — verificación estática por equivalencia numérica completa de valores (solo 2 diferencias imperceptibles documentadas); build sin errores; dev server no levantado (no práctico en esta máquina), misma práctica que reviews previos.
- `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress` (protocolo: pasará a `done` tras APPROVED).
- `progress/current.md` documenta la sesión: [x] — bitácora con rojo → implementación → verde de la feature 3.
- Sin temporales/`print()`/TODOs: [x] — sin restos.

## Cambios requeridos

1. **Retirar de `src/styles/hero.css` el bloque `.hero-grid` dentro de `@media (max-width:768px)` (líneas 452-458: `grid-template-columns:1fr; grid-auto-rows:190px`).** La regla ya vive en `src/styles/hero-section.css` (líneas 94-97); dejar la copia contradice el alcance declarado en impl_03 ("movidos … y .hero-grid" del media 768) y crea dos fuentes de verdad (confirmado: aparece 2 veces en el bundle). Sin impacto visual: valores idénticos. Si se decide conservarla deliberadamente, documentarlo en el informe y justificar.
2. **Corregir `progress/impl_03_hero-section-styles.md`** (sección "Selectores movidos a hero-section.css vs. lo que queda en hero.css", líneas 75-89) para reflejar el estado real del disco tras el cambio: el media 768 de hero.css quedó solo con `.hero-grid` (hasta que se retire) y las partes de tarjetas/perfil.

## Observaciones (no bloqueantes)

1. impl_03 línea 38 afirma que el bundle verificado es `dist/assets/index.*.css`; el CSS emitido está en `dist/_astro/index.*.css` (dist/assets/ solo contiene `svg/` y `moises-hero.jpg`). La sustancia de la afirmación (ambas hojas aplicadas, tokens presentes) es correcta — verificada por mí en `dist/_astro/index.DkvBU9Qt.css`.
2. `--color-surface` y `--radius-card` aparecen en la tabla de tokens de design.md pero no se usan en la hoja final; el informe lo declara explícitamente (línea 93). Decisión del implementer razonable: la navbar usa su token translúcido propio y la sección usa radio de píldora para preservar el aspecto. No bloqueante (design.md es diseño de intención; el acceptance "hero idéntico" manda).

## Conclusión

La feature 3 es esencialmente correcta: extracción completa y fiel de fondo/navbar/grid a `hero-section.css` (98 líneas, solo tokens), 7 tokens nuevos legítimos y con valores idénticos (kebab-case, test de la feature 2 en verde), import de las 3 hojas justificado, test que verifica REQ-03-01..05 con ciclo rojo/verde real, suite 16/16, formato, build e `init.sh` en verde verificados por mí, y las 2 diferencias deliberadas aceptables (30 ms de transición y círculo idéntico). El bloqueo es de integridad: la regla `.hero-grid` del breakpoint 768 quedó duplicada en hero.css (contradice el propio informe) y el informe no refleja ese estado. Cambio mínimo y accionable.

---

# Revisión ronda 2 (líder)

**Veredicto:** APPROVED

**Fecha:** 2026-08-10 (17:45) — relanzada por el líder tras la resolución del implementer.

## Pregunta de revisión (test-first)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?

**Sí.** El informe impl_03 (ronda 2) documenta el ciclo re-ejecutado contra el estado real: ROJO 5/5 (`tests/hero-section-styles.test.mjs` con la feature revertida: `# tests 5 / # pass 0 / # fail 5`) → implementación restaurada → VERDE 5/5 y suite 16/16. **Re-ejecutado por mí en esta ronda:** `node --test "tests/**/*.test.mjs"` → `# tests 16 / # pass 16 / # fail 0`, exit 0.

## Verificación de los 2 cambios requeridos

### Cambio 1 — `.hero-grid` duplicado retirado de hero.css ✔ RESUELTO

| Verificación | Resultado | Evidencia |
|---|---|---|
| `grep "hero-grid" src/styles/hero.css` | ✔ 0 coincidencias (exit 1) | Grep ejecutado por mí: sin matches para `hero-grid`, `grid-template-columns:1fr` ni `grid-auto-rows:190px` en hero.css. |
| Bloque `@media (max-width:768px)` de hero.css (líneas 450-508) | ✔ sin `.hero-grid` | Lectura completa del bloque: solo `.profile-card`, `.hero-card`, `.profile-content*`, `.profile-username`, `.card-header h3`, `.card-icon svg`. Coincide exactamente con lo declarado en impl_03 (línea 64). |
| `hero-section.css` conserva la regla | ✔ | Línea 97: `.hero-grid { grid-template-columns: 1fr; grid-auto-rows: 190px; }` dentro de `@media (max-width: 768px)` (línea 94). |
| Bundle generado sin duplicado | ✔ | `pnpm build` ejecutado por mí → `dist/_astro/index.JVu1u6U_.css`: `grid-auto-rows:190px` aparece **1 sola vez**; `grid-template-columns:1fr` **1 vez**; `.hero-grid` 3 veces (base línea 78 + media 1200 línea 92 + media 768 línea 97), las tres procedentes de hero-section.css. |

### Cambio 2 — impl_03 corregido ✔ RESUELTO

- La sección "Selectores movidos…" (líneas 92-106) refleja el disco: lista los movidos (fondo, navbar, grid, keyframes, media 1200 solo grid, media 768 navbar/grid) y en "Quedan en hero.css" declara "media 768 **sin** `.hero-grid`, retirado por el cambio 1 del reviewer" (línea 105).
- La tabla de cambios (línea 64) describe el media 768 de hero.css con la lista exacta de selectores verificada por mí en disco.
- **Observación 1 de la ronda 1 resuelta:** ya no se menciona `dist/assets/`; el informe cita `dist/_astro/index.*.css` (líneas 64 y 131) y el hash actual `JVu1u6U_`, que coincide con el bundle real que generé en esta ronda. Sin afirmaciones falsas.

## Re-verificación de la feature completa

| # | Punto | Resultado | Evidencia |
|---|-------|-----------|-----------|
| 1 | `src/styles/hero-section.css` | ✔ | 98 líneas (REQ-03-04); solo `var(--...)` en colores/radios/transiciones (REQ-03-03/05); selectores fondo/navbar/grid + media queries (REQ-03-02). |
| 2 | Import en `new-hero.astro` | ✔ | Líneas 2-4: `tokens.css` + `hero-section.css` + `hero.css` (REQ-03-01; hero.css justificado hasta feature 4). |
| 3 | Suite | ✔ | Ejecutada por mí: 16/16 pass, 0 fail (4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles). |
| 4 | Formato | ✔ | `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`. |
| 5 | Build | ✔ | `pnpm build` → `1 page(s) built / Complete!` (dist/_astro/index.JVu1u6U_.css). |
| 6 | `./init.sh` | ✔ | Ejecutado por mí → `✔ El entorno está perfecto. Podemos empezar a trabajar.` exit 0. |
| 7 | `git status` (alcance) | ✔ | Solo archivos de la feature 3 (`src/styles/hero-section.css` nuevo, `src/styles/hero.css` M, `src/components/new-hero/new-hero.astro` M, `tests/hero-section-styles.test.mjs` nuevo, `progress/impl_03_*` nuevo, `progress/current.md` M, `progress/review_03_*` M) + artefactos previos del arnés (package.json M, tests/harness-kit-integrity.test.mjs M, `templates/`, `specs/01-13`, `src/styles/tokens.css` de feature 2, `progress/impl_01/02`, `progress/review_01/02`, `progress/research/`). Sin cambios fuera de alcance. |
| 8 | `feature_list.json` | ✔ | Feature 3 en `in_progress` (protocolo correcto: pasará a `done` tras este APPROVED). |

## Checkpoints (ronda 2)

- C1 — Estilos separados de la UI: [x]
- C2 — Lógica fuera de la UI: [x]
- C3 — Datos vía repositorio: [ ] — N/A (la feature no toca datos/dominio; precedente reviews 01/02).
- C4 — Tokens, no valores sueltos: [x]
- C5 — ≤100 líneas por archivo: [x] — hero-section.css 98, tokens.css 71; hero.css 532 y new-hero.astro 104 son violaciones transitorias ya discutidas (design.md decisión 1, features 4 y 9).
- C6 — Sin dependencias externas: [x]
- Datos (JSON/entidades/repositorios): [ ] — N/A.
- `./init.sh` en verde: [x] — exit 0, "El entorno está perfecto", ejecutado por mí.
- UI correcta desktop/móvil: [x] — equivalencia numérica completa verificada en ronda 1 + bundle sin duplicados en esta ronda.
- `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress` hasta que el líder la marque `done` tras este veredicto.
- `progress/current.md` documenta la sesión: [x]
- Sin temporales/`print()`/TODOs: [x]

## Conclusión (ronda 2)

Ambos cambios requeridos están resueltos y verificados por mí en disco y en el bundle (`grid-auto-rows:190px` aparece 1 sola vez en `dist/_astro/index.JVu1u6U_.css`; impl_03 refleja el estado real sin afirmaciones falsas). Re-ejecuté la suite 16/16, check-format, build e `init.sh`: todo en verde. Feature 3 **APROBADA**.

---

## Re-revisión ronda 2 — 2026-08-10

**Veredicto: APPROVED.** Los 2 cambios requeridos en la ronda 1 quedaron resueltos y verificados por mí en disco.

### Cambio 1 — `.hero-grid` del media 768 retirado de `src/styles/hero.css` ✔

- Verificado por grep sobre `src/styles/hero.css`: **cero coincidencias** de `.hero-grid` / `grid-template-columns:1fr` (el patrón solo aparece en `src/styles/hero-section.css` líneas 78, 92 y 97). El único resto de sección en hero.css son los `::-webkit-scrollbar` de `.new-hero` (líneas 514-528), fuera del alcance de REQ-03-02 y documentado.
- Lectura del bloque `@media (max-width:768px)` de hero.css (líneas 450-508): queda solo con `.profile-card`, `.hero-card`, `.profile-content`, `.profile-content h1`, `.profile-content p`, `.profile-username`, `.card-header h3` y `.card-icon svg` — ninguna regla de sección.
- Evidencia en el bundle emitido por mí (`pnpm build`): `grid-template-columns:1fr;grid-auto-rows:190px` aparece **1 sola vez** (en la ronda 1 aparecía 2). Una única fuente de verdad; sin impacto visual.

### Cambio 2 — informe `progress/impl_03_hero-section-styles.md` corregido ✔

- Sección "Resolución de los cambios requeridos (ronda 1)" (línea 140) con evidencia de ambos cambios: bloque 768 verificado por lectura, grep sin coincidencias, bundle con la regla única (líneas 146-152), y estado del media 768 de hero.css sin `.hero-grid` (línea 149).
- Sección "Selectores movidos" refleja el estado real (línea 100 y bullet "media 768 **sin** `.hero-grid`").
- Nota del bundle corregida a `dist/_astro/index.*.css` (líneas 131, 151); la ruta `dist/assets/` errónea ya no aparece. Además añadió verificación visual con dev server (HTTP 200, 3 hojas servidas, línea 132) — refuerza el acceptance "el hero se ve idéntico" (REQ-03-02).

### Verificación ejecutada por mí (ronda 2)

| Comando | Resultado |
|---------|-----------|
| `node --test "tests/**/*.test.mjs"` | **16/16 pass**, `# fail 0`, exit 0 (4 design-tokens + 7 harness-kit-integrity + 5 hero-section-styles) |
| `node scripts/check-format.mjs` | `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`, exit 0 |
| `pnpm.cmd build` | `1 page(s) built`, `Complete!`, exit 0 |
| `bash ./init.sh` | Todas las comprobaciones ✔ → `✔ El entorno está perfecto. Podemos empezar a trabajar.`, exit 0 |

### Pregunta de revisión (test-first, ronda 2)

¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final? **Sí.** El ciclo rojo/verde de la ronda 1 sigue intacto y verificado: ROJO 5/5 (archivo ausente, impl_03 líneas 10-21), VERDE 5/5 + suite 16/16 re-ejecutada por mí en ambas rondas. Los cambios de esta ronda no tocaron tests ni código de la feature (solo hero.css −7 líneas y el informe); la suite sigue 16/16.

### Checkpoints (estado final)

- C1 Estilos separados de la UI: [x] — sin `<style>` en new-hero.astro; imports tokens.css + hero-section.css + hero.css.
- C2 Lógica separada de la UI: [x] — frontmatter solo imports/paso de datos.
- C3 Datos vía repositorio: [ ] — N/A (no toca datos/dominio).
- C4 Tokens, no valores sueltos: [x] — hero-section.css solo `var(--...)`; hero.css con valores sueltos transitorios (eliminación en feature 4, documentado en design.md).
- C5 ≤100 líneas por archivo: [x] — hero-section.css 98, tokens.css 71; hero.css 532 y new-hero.astro 104 son violaciones transitorias con discusión registrada (design.md decisión 1, feature 4/9).
- C6 Sin dependencias externas: [x] — CSS puro, node:test.
- `./init.sh` en verde: [x] — exit 0, "El entorno está perfecto" (ejecutado por mí).
- UI correcta desktop/móvil: [x] — equivalencia numérica completa + bundle verificado + dev server HTTP 200 con las 3 hojas (impl_03 línea 132).
- `feature_list.json` con la tarea en `done`: [ ] — correctamente en `in_progress` (pasará a `done` tras este APPROVED, protocolo).
- `progress/current.md` documenta la sesión: [x] — bitácora de la sesión 2 añadida (línea 34).
- Sin temporales/`print()`/TODOs: [x] — sin restos.

### Conclusión

Los 2 cambios requeridos en la ronda 1 están resueltos y verificados en disco y en el bundle emitido: la regla `.hero-grid` del breakpoint 768 vive únicamente en `hero-section.css` (1 ocurrencia en el build) y el informe refleja el estado real con evidencia (incluida verificación visual). La feature 3 cumple REQ-03-01..05 y sus 4 acceptance; suite 16/16, formato, build e `init.sh` verificados en verde por mí en esta ronda. **APPROVED.**
