# Review — feature 15 game-of-life-background

**Veredicto:** APPROVED (ronda 3 — re-review final; ver sección "Ronda 3" al final)

## Resumen

- **Spec:** `specs/15_game-of-life-background/requirements.md` (REQ-15-01..12) + `specs/15_game-of-life-background/design.md`
- **Acceptance:** feature id 15 en `feature_list.json` (status `in_progress`, correcto en fase de review)
- **Informe implementador:** `progress/impl_15_game-of-life-background.md`
- **Revisado por:** agente revisor (nivel 1) — verificación independiente ejecutada en esta sesión
- **Fecha:** 2026-08-11

La feature en sí (componente, driver, hoja, tokens, layout) cumple REQ-15-01..12 y
las convenciones. El veredicto es **CHANGES_REQUESTED** por UNA causa concreta y
grave: el working tree contiene una modificación **fuera de scope, no declarada y
sin test** en `src/styles/hero-section.css` (`opacity: 0.85;` en `.new-hero`,
línea 13), que contradice el propio informe del implementador (que afirma no
haber tocado hero) y la regla "tokens, no valores sueltos" de la arquitectura.
Detalle en §Cambios requeridos.

## Verificación de la pregunta de revisión (test-first)

**¿Se escribió el test antes del código y en rojo, y la suite quedó en verde al final?** SÍ, para los 5 archivos de la feature.

- Evidencia en `progress/impl_15_game-of-life-background.md` §1: ROJO capturado con `node --test tests/game-of-life-background.test.mjs` → `# pass 0`, `# fail 15` (15/15), salida transcrita con los errores reales (componente inexistente, driver inexistente, tokens.css sin `--opacity-gol`, layout sin import, hoja inexistente). Corroborado en `progress/current.md` ("ROJO 0 pass / 15 fail (nada existía)"). Los archivos de la feature son nuevos en git (untracked), coherente con el estado "nada existía".
- VERDE: test de la feature 15/15; suite completa 119/119 (`# pass 119`, `# fail 0`).
- **Verificación independiente del revisor:** `node --test "tests/**/*.test.mjs"` → **119/119 pass, 0 fail, 0 skipped**. ✔

**Matiz:** el `opacity: 0.85` de `hero-section.css` NO tiene test (no hay ningún
test que lo referencie) y no es parte del ciclo rojo/verde de esta feature — es
una modificación posterior al informe (mtime 10:19:55, tras `impl_15` a las
10:17:42 y `current.md` a las 10:17:53) que el revisor detectó por `git status`.

## Checklist con evidencia concreta

### Checkpoints (CHECKPOINTS.md)

- C1 (estilos separados de la UI): [x] — `GameOfLifeBackground.astro` (10 líneas) no contiene `<style>` ni `style=`; importa `../styles/game-of-life.css` (línea 2). Test de convención lo asevera.
- C2 (sin lógica en UI): [x] — el `<script>` del componente solo importa `mountGameOfLife` y lo monta (líneas 7-9); sin `for/while/if` (test lo asevera). Toda la lógica vive en `src/utils/game-of-life-canvas.ts`.
- C3 (datos vía repositorio): [x] — la feature no lee JSON; no aplica.
- C4 (tokens, no valores sueltos): [ ] — los archivos de la feature están limpios (game-of-life.css solo `var()`, 0 hex/rgba; `audit-design-tokens.mjs` en verde; tokens `--opacity-gol: 0.15` y `--size-gol-cell: 6px` con patrón `--grupo-nombre`), PERO `src/styles/hero-section.css` línea 13 tiene `opacity: 0.85;` hardcodeado (literal, no token), añadido fuera del scope de la feature (ver Cambios requeridos 1).
- C5 (≤100 líneas por archivo): [x] — componente 10, driver 91, hoja 19, tokens.css 93. Nota: `tests/game-of-life-background.test.mjs` tiene 297 líneas; excede 100 pero sigue el patrón establecido y aprobado en features 1-14 (los test files del repo superan 100 en todos los casos; la spec limita los archivos de la feature, no los tests). No es desviación nueva.
- C6 (sin dependencias externas): [x] — el driver tiene un único import relativo (`./game-of-life.ts`, línea 9); sin dependencias nuevas (node:test/node:fs/node:url stdlib en el test).
- C7-8 (datos válidos, errores nombrados): [x] — no aplica (sin acceso a datos); el engine de la feature 14 (ya aprobado) mantiene `GameOfLifeError`.
- C9 (init.sh verde): [x] — **verificado por el revisor**: `./init.sh` → 10/10 comprobaciones ✔, "El entorno está perfecto".
- C10 (UI desktop/móvil): [x] — build genera el canvas y la regla `.gol-canvas` en ambas páginas; sin navegador headless en el arnés, la verificación es por build/HTML (consistente con la práctica de features previas). Canvas fijo con `inset:0` y viewport-responsive por diseño (REQ-15-08).
- C11 (feature_list.json): [x] — status `in_progress` es el correcto durante la review; el cierre a `done` lo decide el líder tras el veredicto.
- C12 (current.md documenta): [x] — documenta ciclo rojo/verde, archivos y verificación; NO documenta la modificación de `hero-section.css` (ver Cambios requeridos 2).
- C13 (sin temporales/debug/TODOs): [x] — sin archivos temporales, sin `print()`/`console.log`/TODOs en los archivos de la feature (grep verificado). El `opacity: 0.85` de hero-section.css es una modificación no declarada, tratada en C4/Cambios requeridos.

### Trazabilidad acceptance ↔ REQ (feature 15)

| Acceptance (feature_list.json) | REQ | Evidencia |
|---|---|---|
| Test escrito en rojo antes y verde al final (REQ-15-01..12) | todos | §Verificación de la pregunta de revisión: ROJO 0/15 capturado; VERDE 15/15 y suite 119/119; re-verificado por el revisor 119/119 |
| `GameOfLifeBackground.astro` existe y se importa desde Layout.astro exactamente una vez (REQ-15-01, REQ-15-09) | REQ-15-01, REQ-15-09 | `Layout.astro` líneas 4 y 24 (un import, un `<GameOfLifeBackground />`); grep en src/ solo encuentra esas dos referencias + el componente. Test REQ-15-01/09 |
| El driver importa el engine de la feature 14 sin dependencias externas (REQ-15-02) | REQ-15-02 | `game-of-life-canvas.ts` línea 9: `import { createGrid, randomizeGrid, stepGrid, type Cell } from './game-of-life.ts'`. Único import, relativo. `game-of-life.ts` (engine) no duplicado ni modificado (mtime 10:01:39, previo a la sesión de la feature 15; git no lo lista como tocado en esta feature). Test REQ-15-02 |
| tokens.css define `--opacity-gol` < 0.25 y `--size-gol-cell`; game-of-life.css aplica var() de ambos sin hex/rgba (REQ-15-04, 11, 12) | REQ-15-04, REQ-15-11, REQ-15-12 | tokens.css líneas 88 (`--opacity-gol: 0.15`) y 91 (`--size-gol-cell: 6px`); game-of-life.css líneas 17 (`opacity: var(--opacity-gol)`), 15-16 (`min-width/min-height: var(--size-gol-cell)`), 0 hex/rgba (test REQ-15-12 + audit-design-tokens.mjs en verde). Verificado en dist: `--opacity-gol:.15`, `--size-gol-cell:6px`, `.gol-canvas{...opacity:var(--opacity-gol);pointer-events:none;position:fixed;inset:0;z-index:-1...}` |
| El driver lee `--color-accent` vía getComputedStyle y escucha prefers-reduced-motion (fotograma estático) y document.hidden (pausa) (REQ-15-03, 05, 06) | REQ-15-03, REQ-15-05, REQ-15-06 | Driver líneas 17-18 (`getComputedStyle(canvas)` + `getPropertyValue('--color-accent')`), 22 + 55 + 72-76 (`matchMedia('(prefers-reduced-motion: reduce)')`, `reducedMotion.matches`, `onMotionChange` = stop + draw + start → fotograma estático), 55 + 64-70 (`document.hidden`, `visibilitychange`, `cancelAnimationFrame`). Verificado en el bundle de dist: `visibilitychange`, `prefers-reduced-motion`, `getComputedStyle`, `matchMedia`, `cancelAnimationFrame` presentes |
| El driver siembra con densidad ≤ 0.15 y dimensiona según viewport y `--size-gol-cell` (REQ-15-07, 08) | REQ-15-07, REQ-15-08 | Driver línea 11 (`SEED_DENSITY = 0.15`), 39-42 (`window.innerWidth/innerHeight` ÷ `cellSize`), 19 (`getPropertyValue('--size-gol-cell')`). Verificado en dist: `innerWidth`, `innerHeight` en el bundle |
| game-of-life.css declara pointer-events none y los archivos de la feature ≤ 100 líneas (REQ-15-10, 08) | REQ-15-10, REQ-15-08 | game-of-life.css línea 18 (`pointer-events: none`); 10/91/19/93 líneas. Test REQ-15-10 + test de convención |

### Evaluación de "sutileza" (petición original del usuario)

- Opacidad token 0.15 < 0.25 ✔ (REQ-15-04).
- Color de marca `--color-accent` leído del token ✔ (REQ-15-03); celdas de 6px a densidad 0.15 sobre fondo oscuro `--color-background`.
- `pointer-events: none` + `z-index: -1` + `aria-hidden="true"` ✔ — no interfiere con interacción ni lectores de pantalla (REQ-15-01/10).
- `prefers-reduced-motion` → fotograma estático ✔ y pausa con `document.hidden` ✔ (REQ-15-05/06).
- ⚠ Contraste/lectura: la feature en sí respeta el contenido; la modificación no declarada `opacity: 0.85` en `.new-hero` (hero-section.css) atenúa el contenido completo del hero (texto + tarjetas + fondo), lo que REDUCE el contraste del contenido principal — justo lo que el design.md define como no deseado ("sin interferir con lectura, contraste ni interacción"). Ese efecto no está autorizado por la spec y debe revertirse o canalizarse por la spec (ver Cambios requeridos 1).

## Verificaciones ejecutadas por el revisor (todas ✔ salvo lo indicado)

1. `node --test "tests/**/*.test.mjs"` → `# tests 119 / # pass 119 / # fail 0 / # skipped 0`.
2. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` (exit 0).
3. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (exit 0).
4. `pnpm build` → `✓ Complete!`, `2 page(s) built` (`/about/index.html`, `/index.html`).
5. `dist/index.html` y `dist/about/index.html`: `<canvas class="gol-canvas" aria-hidden="true">` como primer hijo del body (2 coincidencias por página), `.gol-canvas{...position:fixed;inset:0;z-index:-1;opacity:var(--opacity-gol);pointer-events:none...}`, tokens `--opacity-gol:.15` / `--size-gol-cell:6px` en `:root`, y el bundle `type="module"` contiene `visibilitychange`, `prefers-reduced-motion`, `getComputedStyle`, `matchMedia`, `requestAnimationFrame`, `cancelAnimationFrame`, `innerWidth`, `innerHeight`, `createGrid` (engine + driver bundleados).
6. `./init.sh` → verde completo: 10/10 comprobaciones, "El entorno está perfecto" (exit 0).
7. `git status --short` → los archivos esperados de la feature (componente, driver, hoja, test, tokens.css, Layout.astro, impl_15, specs/15) **más** `M src/styles/hero-section.css`, que NO está en el scope declarado.
8. Grep en `src/` → sin TODO/FIXME/console.log/print; única inclusión de GameOfLifeBackground en Layout.astro.

## Notas (no bloqueantes)

1. **Fallos silenciosos del driver:** `game-of-life-canvas.ts` líneas 15 y 20 devuelven `() => {}` (noop) si `getContext` falla o si los tokens no están definidos. La regla 3 de `docs/architecture.md` prefiere errores nombrados; en un decorativo de runtime es degradación defensiva aceptable, pero convendría documentarlo en el design.md (o un `console.warn` en dev). No bloqueante: la spec no exige manejo de errores para el driver y la falla de tokens se detecta en build por el audit.
2. **`reducedMotion.addEventListener('change', ...)`** (línea 80) es API moderna; Safari < 14 necesitaría `addListener`. Irrelevante para un portfolio moderno; no bloqueante.
3. **El GOL es invisible bajo el hero en la portada:** el hero ocupa 100vh con fondo opaco (`--color-hero-*`), por lo que el canvas no se ve en el primer viewport de `/` (sí en `/about` y bajo el pliegue). El requisito REQ-15-09 (componente una vez en el layout, fondo en todas las páginas) se cumple; la visibilidad sobre el hero no está exigida por la spec. Si se quiere ver el GOL tras el hero, el ajuste debe hacerse por la spec (ver Cambios requeridos 1), no con un `opacity` suelto.

## Cambios requeridos

1. **Revertir la modificación no declarada de `src/styles/hero-section.css`** (quitar `opacity: 0.85;` de la línea 13, bloque `.new-hero`; restaurar el estado commiteado). Es un cambio fuera del scope de la feature 15 (la spec no menciona hero-section.css), posterior al informe (mtime 10:19:55 > impl_15 10:17:42), sin test y con un literal no tokenizado que reduce el contraste del contenido del hero. Alternativa SI el objetivo es que el GOL se vea tras el hero: tramitarlo como parte de la feature — actualizar `specs/15_game-of-life-background/design.md` con la decisión, usar un token del diseño (p. ej. un `--opacity-*` o hacer translúcido el fondo del hero vía tokens, nunca un literal), añadir el test correspondiente en `tests/game-of-life-background.test.mjs`, documentarlo en `progress/impl_15_game-of-life-background.md` y re-ejecutar la verificación completa (suite, build, inspección de dist, `./init.sh`).
2. **Corregir el informe `progress/impl_15_game-of-life-background.md` §2**, cuya afirmación "No toqué: hero/articles (features 9-10)… (verificado con `git status`: solo los archivos de esta feature…)" es inexacta: `git status` muestra `M src/styles/hero-section.css`. El informe debe reflejar el estado real del working tree tras resolver el punto 1.

## Conclusión

Los 12 requisitos (REQ-15-01..12), los 7 acceptance de `feature_list.json` y las convenciones de `docs/architecture.md`/`docs/conventions.md` se cumplen en los 5 archivos de la feature; el ciclo rojo/verde está evidenciado y re-verificado (119/119), `./init.sh` termina con el entorno perfecto y el build incluye el fondo GOL sutil (opacidad 0.15, color de marca, densidad 0.15, pausas de accesibilidad) en ambas páginas. Sin embargo, la modificación **no declarada, fuera de scope y sin token** en `src/styles/hero-section.css` impide aprobar el working tree tal como está: viola el scope de una sola feature, la regla de tokens y la precisión del informe. **CHANGES_REQUESTED.**

---

# Ronda 2 — re-review (2026-08-11)

**Veredicto ronda 2:** CHANGES_REQUESTED

## Qué verificó el revisor de forma independiente (ronda 2)

1. `git diff src/styles/hero-section.css` al INICIO de la ronda 2: ✔ el literal
   `opacity: 0.85` ya no existe; el diff mostraba exactamente el cambio
   declarado por la Decisión 6 (gradiente movido a `.hero-background` +
   `z-index: -1` + `opacity: var(--opacity-hero)`); `.hero-noise { opacity: 0.03 }`
   (línea 31) es pre-existente de la feature 3 (NO aparece en el diff). ✔
2. `src/styles/tokens.css` línea 91: `--opacity-hero: 0.85` con patrón
   `--grupo-nombre` (leído al inicio de la ronda 2). ✔
3. Tests nuevos de ronda 2 existen en `tests/game-of-life-background.test.mjs`
   (líneas 299-365, bloque "Ronda 2"): verifican `.new-hero` sin `opacity`,
   `.hero-background` con `opacity: var(--opacity-hero)` + `z-index: -1` +
   gradiente `--color-hero-*`, ausencia del literal `0.85`, y `--opacity-hero`
   definido con patrón y valor (0,1). ✔ Evidencia de ROJO en
   `progress/impl_15_game-of-life-background.md` §6: 2 fail reales (17 y 19),
   16 y 18 en verde porque el literal ya se había revertido. ✔
4. Verificaciones ejecutadas por el revisor en ronda 2:
   - `node --test "tests/**/*.test.mjs"` → **123/123 ✔** (primera ejecución, ~10:35)
   - `node scripts/check-format.mjs` → FORMATO ✔
   - `node scripts/audit-design-tokens.mjs` → AUDIT ✔
   - `pnpm build` → 2 páginas ✔; `dist/_astro/*.css` contenía
     `.hero-background{...;z-index:-1;...;opacity:var(--opacity-hero);...}` ✔
   - `./init.sh` → "El entorno está perfecto" ✔ (ejecutado ~10:36, ANTES del cambio concurrente)
   - `dist/index.html`: `<canvas class="gol-canvas" aria-hidden="true">` ✔;
     `:root{...--opacity-gol:.15;--opacity-hero:.8...}` (el minificador de Astro
     emite `.8`; el valor fuente era 0.85 en ese momento)
   - `git status --short` → alcance esperado: 5 archivos de la feature +
     tokens.css + Layout.astro + hero-section.css (justificado por Decisión 6) +
     specs/15 + tests + informes. ✔

## ⚠️ Hallazgo crítico: el working tree cambió DURANTE la revisión

Entre la primera lectura del revisor (~10:33) y la re-verificación final se
modificaron dos archivos SIN aviso:

| Archivo | mtime | Cambio detectado |
|---|---|---|
| `src/styles/tokens.css` | 2026-08-11 10:35:55 | `--opacity-hero: 0.85` → `0.80` (línea 91) |
| `src/styles/hero-section.css` | 2026-08-11 10:38:29 | Se ELIMINÓ `opacity: var(--opacity-hero);` de `.hero-background` (líneas 18-22) |

El diff de `hero-section.css` al final de la ronda 2 ya NO contiene la línea
`opacity: var(--opacity-hero);`: el bloque `.hero-background` termina en
`background: radial-gradient(...)` (ver diff actual y `dist/_astro/index.*.css`
del build final: `.hero-background{...;z-index:-1;background:radial-gradient(...);position:absolute;inset:0;overflow:hidden}` — sin opacity).

## Consecuencias verificadas (estado final)

1. **Suite en ROJO: `node --test "tests/**/*.test.mjs"` → `# pass 122 / # fail 1`**
   — falla el test de ronda 2 en `tests/game-of-life-background.test.mjs:321`
   (`not ok 17 - Ronda 2: el fondo del hero es translúcido vía var(--opacity-hero)...`,
   error: `'el fondo del hero no usa var(--opacity-hero) (Decisión 6)'`).
2. **La Decisión 6 ya no está implementada:** el fondo del hero vuelve a ser
   100% opaco → el canvas GOL queda INVISIBLE tras el hero en la portada → la
   intención del usuario ("juego de la vida sutilmente en el background") NO se
   cumple en el primer viewport de `/`.
3. **Token muerto:** `--opacity-hero` está definido en tokens.css (0.80) pero no
   se consume en ningún selector (solo aparece en un comentario de
   hero-section.css línea 16). Contradice la Decisión 6 del design.md (que exige
   `opacity: var(--opacity-hero)` en `.hero-background`) y la regla de tokens.
4. **Informes desactualizados:** `progress/impl_15_game-of-life-background.md`
   §6/§7 y `progress/current.md` describen el estado 0.85 + `var(--opacity-hero)`
   aplicado, que ya no coincide con el working tree.

## Checkpoints (ronda 2)

- C1: [x]
- C2: [x]
- C3: [x]
- C4: [ ] ← `--opacity-hero` definido pero sin consumir; Decisión 6 no aplicada en `.hero-background`
- C5: [x] (hero-section.css 55 líneas, tokens.css 96 — ≤100)
- C6: [x]
- C7-8: [x] (no aplica)
- C9: [ ] ← suite en rojo (122/123) tras el cambio concurrente; `./init.sh` no puede estar verde
- C10: [ ] ← build final sin `opacity` en `.hero-background` → GOL invisible tras el hero
- C11: [x]
- C12: [ ] ← informe/current.md no reflejan el estado real del working tree
- C13: [x]

## Cambios requeridos (ronda 2)

1. **Restablecer la Decisión 6 en el working tree:** re-aplicar
   `opacity: var(--opacity-hero)` en `.hero-background` (`src/styles/hero-section.css`)
   y consumir el token (el estado que el revisor verificó en verde a las ~10:35,
   123/123, es el correcto). El valor final del token (`0.85` del design.md vs
   `0.80` actual) debe ser UNO SOLO y quedar alineado en tokens.css, design.md,
   informe y tests.
2. **Estabilizar el working tree durante la revisión:** no modificar archivos de
   la feature mientras el reviewer está en curso; cualquier ajuste posterior a la
   entrega debe comunicarse y re-verificarse desde cero.
3. **Actualizar `progress/impl_15_game-of-life-background.md`** (y `current.md`)
   para que reflejen el valor final del token y el estado real del árbol.
4. Re-ejecutar: `node --test "tests/**/*.test.mjs"` (123/123), check-format,
   audit-design-tokens, `pnpm build` + inspección de dist (`.hero-background`
   con `opacity:var(--opacity-hero)` y `z-index:-1`) y `./init.sh` verde.

## Conclusión

El trabajo de la ronda 1 y la respuesta inicial a la ronda 2 estaban bien
(evidencia rojo/verde sólida, Decisión 6 documentada, tests correctos, suite
123/123 verificada por el revisor a las ~10:35). PERO el estado actual del
working tree —modificado durante la revisión— deja la suite en rojo (122/123),
la Decisión 6 sin implementar y un token muerto: el GOL vuelve a ser invisible
tras el hero. Regla dura: **nunca aprobar con tests rojos**. **CHANGES_REQUESTED.**

---

# Ronda 3 — re-review final (2026-08-11)

**Veredicto ronda 3:** APPROVED

## Qué verificó el revisor de forma independiente (ronda 3, en secuencia)

1. `node --test "tests/**/*.test.mjs"` → **# tests 123 / # pass 123 / # fail 0 /
   # skipped 0** ✔ (ejecutado en primer lugar, sin paralelismo con el build —
   el test REQ-11-05 hace su propio astro build).
2. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos` (exit 0) ✔
3. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (exit 0) ✔
4. `pnpm build` → `✓ Complete!`, `2 page(s) built` (`/index.html`, `/about/index.html`) ✔
5. `./init.sh` → 10/10 comprobaciones ✔, **"El entorno está perfecto"** (exit 0) ✔

## Verificación en disco (fuentes y dist)

- `src/styles/tokens.css` **línea 91: `--opacity-hero: 0.80`** ✔ (patrón `--grupo-nombre`, grupo `opacity`); `--opacity-gol: 0.15` (línea 88) y `--size-gol-cell: 6px` (línea 94) intactos.
- `src/styles/hero-section.css` **línea 22: `opacity: var(--opacity-hero);` en `.hero-background`**, con `z-index: -1` (línea 20), gradiente `--color-hero-*` movido desde `.new-hero` (líneas 18-23). `.new-hero` (líneas 6-12) **sin `opacity` ni `background`** → contenido del hero al 100% de contraste. `.hero-noise { opacity: 0.03 }` (línea 31) es pre-existente de la feature 3 (NO aparece en el diff de esta feature; ya constatado en ronda 2).
- `dist/index.html` (CSS minificado): `.hero-background{...z-index:-1;...opacity:var(--opacity-hero);position:absolute;inset:0;overflow:hidden}` ✔ — **usa `var(--opacity-hero)`, no un literal**; `:root{...--opacity-hero:.8...}` (Astro emite `.8` por 0.80, valor fuente confirmado en tokens.css) ✔; `--opacity-gol:.15` y `--size-gol-cell:6px` en `:root` ✔; `.new-hero{min-height:100vh;color:var(--color-text);font-family:var(--font-sans);position:relative;overflow:hidden}` — sin background/opacity ✔; `.gol-canvas{z-index:-1;...opacity:var(--opacity-gol);pointer-events:none;position:fixed;inset:0}` ✔.
- Canvas GOL: `gol-canvas` presente en `dist/index.html` (2 coincidencias: elemento + CSS) y `dist/about/index.html` (2) → el fondo está en `/` y `/about` ✔.
- `git status --short`: alcance esperado y nada fuera de scope — `M feature_list.json` (15 `in_progress`, 14 `done`), `M progress/current.md`, `M progress/history.md` (solo el cierre de la feature 14 por el líder, verificado en el diff), `M src/layouts/Layout.astro` (solo import + `<GameOfLifeBackground />`), `M src/styles/hero-section.css`, `M src/styles/tokens.css`; untracked: componente, hoja, `src/utils/` (engine 14 + driver 15), tests de 14/15, specs/14, specs/15, `progress/impl_14|15`, `progress/review_14|15`, `progress/research/`. Sin archivos ajenos ✔.
- `progress/review_15_game-of-life-background.md` **no tocado por el implementer**: mtime 10:43:06, anterior a `impl_15` (10:46:22) y `current.md` (10:46:44); el informe declara "NO tocado" y el contenido no contiene escritos de ronda 3 ✔.

## Pregunta de revisión (test-first) — ronda 3

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?** SÍ.

- Ronda 1: test-first con ROJO capturado (0 pass / 15 fail, "nada existía") → VERDE 15/15, suite 119/119 (evidencia en `impl_15` §1 y `current.md`).
- Ronda 2: 4 tests nuevos en ROJO (17 y 19 fallan; evidencia transcrita en `impl_15` §6) → VERDE 19/19, suite 123/123.
- Ronda 3: sin cambios de código → no requería tests nuevos (los de ronda 2 aceptan cualquier valor de `--opacity-hero` en (0,1) y verifican `var(--opacity-hero)` en `.hero-background`, por lo que pasan con 0.80). Re-verificado por el revisor: **123/123 ✔**.

## Alineación documental a 0.80 (valor final único)

- `specs/15_game-of-life-background/design.md`: Decisión 6 dice `--opacity-hero: 0.80`, tabla de tokens `(0.80)`, y nota de alineación de ronda 3 (ajuste en vivo 0.85→0.80, decisión de diseño intacta) ✔.
- `progress/impl_15_game-of-life-background.md`: §7 y §8 afirman "Valor final único `--opacity-hero: 0.80`" y documentan el cambio concurrente y la restauración ✔.
- `progress/current.md`: "Valor final único: `--opacity-hero: 0.80`" con la verificación completa ✔.
- Tests: no referencian un valor fijo (aceptan (0,1)) → sin desalineación ✔.

## Evaluación de la intención del usuario ("juego de la vida sutilmente en el background del portfolio")

- **Visible tras el hero:** el hero de la portada es translúcido (`.hero-background` al 80% vía token, `z-index:-1`, gradiente movido) y el canvas GOL global (`z-index:-1`, primer hijo del body) se percibe a través de él en el primer viewport de `/` y en `/about` ✔. El cambio quedó tramitado por la spec (Decisión 6 + token + tests), no con literales.
- **Sutil:** `--opacity-gol: 0.15` (< 0.25), densidad de siembra 0.15, celdas de 6px en color de marca `--color-accent` ✔.
- **Accesible y no intrusivo:** `prefers-reduced-motion` → fotograma estático (driver línea 22/55/72-76), `document.hidden` + `visibilitychange` → pausa (líneas 55, 65, 79, 88), `pointer-events: none` (hoja línea 18), `aria-hidden="true"` (componente línea 5) ✔.
- **Contraste del contenido:** `.new-hero` sin opacity/background → texto y tarjetas del hero con contraste pleno; el GOL solo asoma tras el fondo ✔.

## Checkpoints (ronda 3)

- C1: [x]
- C2: [x]
- C3: [x] (no aplica)
- C4: [x] — `--opacity-hero` definido (0.80) Y consumido (`var(--opacity-hero)` en `.hero-background`); sin literales en el diff de la feature; audit en verde
- C5: [x] — componente 10, driver 94, hoja 19, tokens.css 96, hero-section.css 56, todos ≤100
- C6: [x]
- C7-8: [x] (no aplica)
- C9: [x] — `./init.sh` → "El entorno está perfecto" (verificado por el revisor)
- C10: [x] — build con canvas y reglas correctas en `/` y `/about` (verificación por build/HTML, práctica del arnés sin navegador headless)
- C11: [x] — feature 15 `in_progress` (correcto en fase de review); 14 `done`
- C12: [x] — `current.md` refleja ronda 3 con valor final 0.80
- C13: [x] — sin temporales/debug/TODOs

## Conclusión (ronda 3 — final)

Se resolvieron los dos problemas de la ronda 2: (1) `opacity: var(--opacity-hero)` está restaurado en `.hero-background` y el token `--opacity-hero` se consume (sin token muerto), y (2) el valor final es UNO SOLO — `0.80` — alineado en tokens.css, design.md, informe y current.md, con los tests aceptando cualquier valor en (0,1). El working tree está estabilizado y dentro del scope de la feature (los únicos archivos modificados son los declarados; `history.md` contiene solo el cierre de la feature 14 por el líder). Verificación independiente completa en secuencia: suite **123/123**, check-format ✔, audit-design-tokens ✔, `pnpm build` ✔ (`.hero-background` con `opacity:var(--opacity-hero)` y `z-index:-1` en dist, token emitido como `.8`, canvas GOL en `/` y `/about`) e `./init.sh` → "El entorno está perfecto". La intención del usuario (GOL sutil tras el hero translúcido, accesible, sin romper contraste) queda cumplida y verificada. **APPROVED.**
