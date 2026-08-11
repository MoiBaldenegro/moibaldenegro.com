# Review — feature 16 gol-performance

**Veredicto:** APPROVED

## Resumen

- **Spec:** `specs/16_gol-performance/requirements.md` (REQ-16-01..10) + `specs/16_gol-performance/design.md` (Decisiones 1-8)
- **Acceptance:** feature id 16 en `feature_list.json` (status `in_progress`, correcto en fase de review)
- **Informe implementador:** `progress/impl_16_gol-performance.md`
- **Revisado por:** agente revisor (nivel 1) — verificación independiente ejecutada en esta sesión
- **Fecha:** 2026-08-11

## Verificación de la pregunta de revisión (test-first)

**¿Se escribió el test de cada archivo antes del código y en rojo, y la suite quedó en verde al final?** SÍ.

- Evidencia en `progress/impl_16_gol-performance.md` §1: ROJO capturado con `node --test tests/gol-performance.test.mjs` → `# pass 4`, `# fail 6` (REQ-16-01..06), con los errores reales transcritos: "el driver no exporta shouldTick con firma (timestamp, lastTick, interval)", "el driver no declara TICK_INTERVAL_MS", "game-of-life-canvas.ts usa fillRect", "RENDER_SCALE no vale 2", ".hero-background no se promueve con will-change: opacity", ".hero-noise sigue existiendo como capa propia". Esos 6 fallos corresponden exactamente al estado previo (driver de la feature 15 con fillRect por célula y sin throttle, CSS sin will-change y con `.hero-noise`), lo que confirma que el test se escribió contra el código ANTES de la implementación. Corroborado en `progress/current.md` línea 17: "ROJO 6 fail / 4 pass (REQ-16-01..06 fallan contra el estado de la feature 15) → implementación → VERDE 10/10".
- VERDE: test de la feature 10/10 (los 2 fallos intermedios fueron falsos positivos del propio test por prosa de comentarios, corregidos con el patrón `stripComments` ya establecido en REQ-03-05/REQ-15-12; los asertos de código no se relajaron); suite completa 133/133.
- **Verificación independiente del revisor:** `node --test "tests/**/*.test.mjs"` → **133/133 pass, 0 fail, 0 skipped**. ✔
- Nota de coherencia temporal: mtime del test 11:12 frente a driver/gol-render 11:11 — consistente con el flujo documentado (ROJO capturado contra el estado previo; el test se retocó a las 11:12 solo para los escaneos de comentarios tras la primera corrida verde, tal como documenta el informe §5).

## Checklist con evidencia concreta

### Checkpoints (CHECKPOINTS.md)

- C1 (estilos separados de la UI): [x] — los cambios de estilos viven en `src/styles/hero-section.css` (58 líneas); la feature no añade `<style>` ni `style=` a ningún componente. `GameOfLifeBackground.astro` (feature 15, mtime 10:14, no tocado) solo importa su hoja y el driver.
- C2 (sin lógica en UI): [x] — toda la lógica nueva (`shouldTick`, throttle, `renderFrame`) vive en `src/utils/game-of-life-canvas.ts` y `src/utils/gol-render.ts`; el componente solo importa y monta (patrón aprobado en la feature 15).
- C3 (datos vía repositorio): [x] — no aplica: la feature no toca datos ni lectura de JSON; no hay violación nueva.
- C4 (tokens, no valores sueltos): [x] — `hero-section.css` usa solo `var(--...)` y `color-mix(in srgb, var(--color-text) 3%, transparent)` (alfa porcentual sobre token, sin literales de color); el 3% es alfa de mezcla, no color. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles` (verificado por el revisor).
- C5 (≤100 líneas por archivo): [x] — driver 91, `gol-render.ts` 65, `hero-section.css` 58, motor 70 (REQ-16-10 aseverado por el propio test sobre driver + imports relativos + hoja). Nota: `tests/gol-performance.test.mjs` tiene 291 líneas; excede 100 pero sigue el patrón establecido y aprobado en features 1-15 (test files de 95 a 291 líneas); REQ-16-10 solo acota driver/imports/hoja y el test lo asevera exactamente así. No es desviación nueva.
- C6 (sin dependencias externas): [x] — ninguna dependencia añadida; tests con stdlib (`node:test`, `node:fs`); driver con imports relativos únicamente (REQ-16-09).
- C7 (datos válidos): [x] — no aplica (sin datos tocados).
- C8 (errores nombrados): [x] — `GolRenderError` en `gol-render.ts` (líneas 15-20) sigue el patrón `GameOfLifeError` del motor; sin fallos silenciosos nuevos.
- C9 (init.sh verde): [x] — **verificado por el revisor**: `./init.sh` → todas las comprobaciones ✔, "El entorno está perfecto. Podemos empezar a trabajar."
- C10 (UI desktop/móvil): [x] — build OK (2 páginas); media queries de `hero-section.css` (1200px/768px) intactas; look idéntico (mismos tokens, misma cuadrícula `--size-gol-cell`); grano integrado con delta < 2 niveles de 8 bits documentado en design.md Decisión 5.
- C11 (feature_list.json): [x] — status `in_progress`, correcto en fase de review; el cierre a `done` lo ejecuta el líder tras el veredicto.
- C12 (current.md documenta): [x] — `progress/current.md` documenta plan, ROJO, implementación, VERDE, verificación final y leftover pendiente de decisión.
- C13 (sin temporales/debug/TODOs): [x] — sin archivos temporales, sin `print()` de debug, sin TODOs en los archivos de la feature.

### Trazabilidad acceptance ↔ REQ (feature 16)

| Acceptance (feature_list.json) | REQ | Evidencia |
|---|---|---|
| Test en rojo antes de implementar y verde al final | REQ-16-01..10 | Informe §1: ROJO 6 fail / 4 pass (salida transcrita) → VERDE 10/10; suite 133/133 verificada por el revisor |
| `shouldTick` pura: true solo al alcanzar el intervalo, sin mutar argumentos; bucle con `TICK_INTERVAL_MS` en [66.67, 100] | REQ-16-01, REQ-16-02 | Driver líneas 16-18 (`timestamp - lastTick >= interval`, sin reasignación) y 14 (`TICK_INTERVAL_MS = 80` → 12,5 gen/seg); `animate` (líneas 44-51) gatea `stepGrid` + `renderFrame` y avanza `lastTick`. Test funcional con `new Function`: true en 80/80 y 100/80, false en 79/80, args sin mutar |
| Una única `putImageData` por frame sobre `ImageData`; sin `fillRect` | REQ-16-03 | `gol-render.ts`: `createImageData` (línea 40) + único `putImageData` (línea 64); 0 `fillRect` en driver + imports. Verificado en bundle de dist: `putImageData` ×1, `fillRect` ×0, `createImageData` ×1 |
| `RENDER_SCALE = 2` (media resolución); escalado al viewport en la hoja | REQ-16-04 | `gol-render.ts` línea 13 (`RENDER_SCALE = 2`); driver líneas 37-38 dividen el backing store por `RENDER_SCALE`; cuadrícula sigue a viewport/`--size-gol-cell` (líneas 35-36); `game-of-life.css` líneas 11-12 (`width/height: 100%`) |
| `will-change: opacity` en `.hero-background` conservando `opacity: var(--opacity-hero)`; `.hero-noise` integrado con alfa de `--color-text` | REQ-16-05, REQ-16-06 | `hero-section.css` líneas 28-29 (`opacity: var(--opacity-hero)` + `will-change: opacity`); línea 26: primer `radial-gradient(color-mix(in srgb, var(--color-text) 3%, transparent)...)` (grano) + segundo `radial-gradient(...var(--color-hero-top/mid/bottom))` (gradiente del hero, regresión Ronda 2); sin regla `.hero-noise`. Verificado en bundle CSS de dist |
| Tokens intactos: `--opacity-hero` 0.80, `--opacity-gol` 0.15, `--size-gol-cell` 6px | REQ-16-07 | `tokens.css` líneas 88, 91 y 94 exactos; mtime 10:35 (sesión feature 15, no tocado por la 16) |
| Accesibilidad conservada: prefers-reduced-motion, document.hidden, pointer-events none | REQ-16-08 | Driver líneas 29, 54, 64-76 (`matchMedia`, `reducedMotion.matches`, `document.hidden`, `visibilitychange`, `cancelAnimationFrame`); `game-of-life.css` línea 18 (`pointer-events: none`). Verificado en bundle de dist |
| Motor feature 14 intacto; imports relativos, sin dependencias | REQ-16-09 | Driver líneas 10-11 (`./game-of-life.ts`, `./gol-render.ts`); motor mtime 10:01 (sesión feature 14), exports `createGrid/randomizeGrid/stepGrid/GameOfLifeError` verificados por el test |
| ≤100 líneas en driver, imports relativos y hoja | REQ-16-10 | 91 / 65 / 58 / 70 líneas; aseverado por el test |

## Verificaciones ejecutadas por el revisor (todas ✔)

1. `node --test "tests/**/*.test.mjs"` (secuencial) → `# tests 133 / # pass 133 / # fail 0` (incluye los 10 de la feature).
2. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json, progress/current.md y specs/ correctos`.
3. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de tokens.css en src/styles`.
4. `pnpm build` → `✓ Complete!`, `2 page(s) built` (`/index.html`, `/about/index.html`).
5. `./init.sh` (Git Bash) → todas las comprobaciones ✔, "El entorno está perfecto. Podemos empezar a trabajar."
6. `dist/_astro/index.BlNwQJf1.css`: `.hero-background{...background:radial-gradient(color-mix(in srgb, var(--color-text) 3%, transparent) 1px, transparent 1px), radial-gradient(circle at top right, var(--color-hero-top) 0%, ...);opacity:var(--opacity-hero);will-change:opacity;background-size:14px 14px,auto...}` ✔; `.hero-noise` 0 ocurrencias en CSS (la única aparición en `dist/index.html` es el div inerte del DOM, sin regla).
7. Bundle inline de `dist/index.html`: `putImageData` ×1, `fillRect` ×0, `createImageData` ×1, `prefers-reduced-motion` ×1, `visibilitychange` ×2, `document.hidden` ×2, `cancelAnimationFrame` ×1, `GolRenderError` ×1, `shouldTick` minificado como `u(e,t,n){return e-t>=n}` (gate del tick presente), `=80` (TICK_INTERVAL_MS) y `÷2` (RENDER_SCALE) emitidos.
8. `git status --short` + mtimes: archivos de la feature 16 = `src/utils/game-of-life-canvas.ts` (11:11), `src/utils/gol-render.ts` (11:11), `src/styles/hero-section.css` (11:16), `tests/gol-performance.test.mjs` (11:12), `feature_list.json`, `progress/*`. NO tocados por la feature 16: motor `game-of-life.ts` (10:01), `Layout.astro` (10:15), `tokens.css` (10:35), `game-of-life.css` (10:14), `GameOfLifeBackground.astro` (10:14), `tests/game-of-life-background.test.mjs` (10:28) — todos de features 14/15 ya aprobadas (el working tree está sin commitear de sesiones anteriores, no es cambio de esta feature).

## Notas (no bloqueantes, sin cambios requeridos)

1. **Leftover documentado:** el div `<div class="hero-noise"></div>` de `src/components/new-hero/new-hero.astro` (línea 20) queda inerte en el DOM (sin regla CSS → sin pintado ni coste; verificado en dist: el class existe solo en el HTML, 0 reglas CSS). Retirarlo exigiría tocar un archivo fuera de la lista autorizada; si el líder autoriza un follow-up de 1 línea, es limpio. No bloquea.
2. **Ediciones concurrentes del usuario (ajenas a la feature):** `src/content/architecture/00-agilismo.md` (mtime 11:01, img → arch00.webp) y `public/assets/content/`. Documentadas en `progress/current.md` ("Nota de alcance"); la suite pasa 133/133 con ellas. No se tratan como cambio fuera de scope del implementer. No bloquea.
3. **Test file 291 líneas:** excede 100 pero es el patrón de tests del repo (aprobado desde las features 1-11); REQ-16-10 acota driver + imports relativos + hoja, y el propio test lo asevera.
4. **`background-size: 14px 14px, auto`** en `.hero-background`: desviación documentada y necesaria (el shorthand `background:` resetea el tamaño; con dos capas se declara uno por capa, el gradiente en `auto`). Sin literales de color. Aceptada.
5. **`stripComments()` en escaneos de contrato:** patrón ya establecido (REQ-03-05, REQ-15-12); los asertos sobre código no se relajaron (0 `fillRect`, 1 `putImageData`, `.hero-noise` ausente como selector). Aceptada.
6. **Evaluación de la petición del usuario:** mismo look aprobado (tokens intactos REQ-16-07, cuadrícula idéntica, grano integrado con delta < 2 niveles de 8 bits) y lag atacado por ambas causas: A — 12,5 gen/seg (throttle `shouldTick`), 1 escritura por frame (`putImageData`), 4× menos píxeles (`RENDER_SCALE 2`); B — grano integrado (1 capa full-screen menos) + `will-change: opacity` (gradiente rasterizado una vez). Accesibilidad intacta (REQ-16-08).

## Conclusión

La feature cumple REQ-16-01..10, todas las convenciones de `docs/architecture.md` y `docs/conventions.md`, el ciclo rojo/verde está evidenciado y verificado de forma independiente, la suite completa queda en verde (133/133), las verificaciones de dist/bundle confirman `will-change: opacity` + `opacity: var(--opacity-hero)` sin regla `.hero-noise` y `putImageData` ×1 / `fillRect` ×0, y `./init.sh` termina con el entorno perfecto. **APPROVED.**
