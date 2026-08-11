# Informe de implementación — feature 16 gol-performance

- **Feature:** 16 — gol-performance ("Eliminar el lag del fondo GOL con opacity en el hero sin cambiar el look")
- **Implementer:** agente implementador
- **Fecha:** 2026-08-11
- **Spec:** `specs/16_gol-performance/requirements.md` (REQ-16-01..10) + `specs/16_gol-performance/design.md` (Decisiones 1-8)
- **Análisis:** `progress/research/gol-performance.md`
- **Estado en `feature_list.json`:** `in_progress` (no la marqué done; el cierre lo decide el líder tras el reviewer)

## 1. Ciclo rojo/verde (test-first, OBLIGATORIO)

### ROJO — `node --test tests/gol-performance.test.mjs` (antes de implementar)

Escribí PRIMERO `tests/gol-performance.test.mjs` (10 tests) contra REQ-16-01..10 y
el design.md (Decisiones 1-8). En ese momento el driver de la feature 15 seguía
dibujando con `fillRect` por célula, sin `shouldTick`/`TICK_INTERVAL_MS`/
`RENDER_SCALE`, y `hero-section.css` aún tenía `.hero-noise` como capa propia.
Salida capturada (extracto de los 6 fallos):

```
# Subtest: REQ-16-01: el driver exporta shouldTick como función pura (no muta sus argumentos)
not ok 1 - REQ-16-01: ...
  error: 'el driver no exporta shouldTick con firma (timestamp, lastTick, interval) (REQ-16-01)'
not ok 2 - REQ-16-02: el bucle avanza generación solo cuando shouldTick lo permite (TICK_INTERVAL_MS 66.67-100)
  error: 'el driver no declara TICK_INTERVAL_MS (REQ-16-02)'
not ok 3 - REQ-16-03: una única putImageData por frame sobre ImageData y sin fillRect en el scope
  error: 'game-of-life-canvas.ts usa fillRect (REQ-16-03)'
not ok 4 - REQ-16-04: RENDER_SCALE 2 — media resolución y escalado CSS en la hoja
  error: 'RENDER_SCALE no vale 2 (REQ-16-04)'
not ok 5 - REQ-16-05: .hero-background es capa promovida con will-change opacity y conserva var(--opacity-hero)
  error: '.hero-background no se promueve con will-change: opacity (REQ-16-05)'
not ok 6 - REQ-16-06: .hero-noise ya no es capa propia y su patrón se integra como primer fondo con alfa de --color-text
  error: '.hero-noise sigue existiendo como capa propia (REQ-16-06)'
# pass 4
# fail 6
```

6/10 en rojo (REQ-16-01..06: todo lo que la feature debe añadir/cambiar). Los 4
que ya pasaban (REQ-16-07 tokens intactos, REQ-16-08 accesibilidad, REQ-16-09
imports relativos, REQ-16-10 ≤100 líneas) son regresiones que el estado actual
ya cumplía.

### VERDE (implementación + verificación progresiva)

Implementé los 3 archivos (§2). Primera ejecución: 8/10 con 2 fallos **falsos
positivos del propio test** (los escaneos negativos casaban con la *prosa* de
los comentarios: "Sustituye el fillRect por célula…" y "El grano de
.hero-noise se integra…"). Apliqué a los escaneos de contrato el mismo patrón
que ya usa el repo (REQ-03-05 y REQ-15-12 quitan los comentarios antes de
buscar literales): `stripComments()` en el scope del driver y en el escaneo
negativo de `.hero-noise`. Los asertos de código no cambiaron. Segunda
ejecución — **10/10 ✔**:

```
# tests 10
# pass 10
# fail 0
# cancelled 0
# skipped 0
```

3. Suite completa (secuencial, los tests que hacen build propio corren en
   orden): `node --test --test-concurrency=1 "tests/**/*.test.mjs"` → **133/133
   ✔** (123 previos + 10 nuevos; `# pass 133`, `# fail 0`).
4. `node scripts/check-format.mjs` → `FORMATO ✔ feature_list.json,
   progress/current.md y specs/ correctos`.
5. `node scripts/audit-design-tokens.mjs` → `AUDIT ✔ ningún color fuera de
   tokens.css en src/styles`.
6. `pnpm build` → 2 páginas generadas, `✓ Complete!` (`/` y `/about/index.html`).
7. `./init.sh` (Git Bash) → todas las comprobaciones ✔:

```
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

## 2. Archivos tocados y por qué

| Archivo | Qué contiene el cambio | Por qué |
|---------|------------------------|---------|
| `tests/gol-performance.test.mjs` (nuevo, 291 líneas) | 10 tests de estructura/contrato sobre el fuente (sin navegador, patrón de `tests/game-of-life-background.test.mjs`). REQ-16-01 incluye verificación FUNCIONAL de `shouldTick` evaluando el cuerpo puro extraído del fuente con `new Function` (el arnés corre Node 22 sin type-stripping, así que no se importa el `.ts`). | Test-first obligatorio contra REQ-16-01..10 + design.md. |
| `src/utils/gol-render.ts` (nuevo, 65 líneas) | `RENDER_SCALE = 2` (exportado), `GolRenderError`, `hexToRgb` y `renderFrame(ctx, grid, cellSize, accent)`: construye un `ImageData` por bloques de celda (3×3 px con `--size-gol-cell` 6px ÷ 2) y lo vuelca con un ÚNICO `putImageData`. Sin `fillRect`. | Decisión 7 del design.md: el driver (91 líneas) superaría 100 al sumar throttle + pintura; la pintura se extrae a módulo propio con import relativo (cubierto por REQ-16-10, que escanea el driver y sus imports relativos). REQ-16-03/04. |
| `src/utils/game-of-life-canvas.ts` (91 líneas) | `shouldTick(timestamp, lastTick, interval)` pura exportada; `TICK_INTERVAL_MS = 80` (12,5 gen/seg); `animate(timestamp)` que solo hace `stepGrid` + `renderFrame` cuando `shouldTick` devuelve true (y avanza `lastTick`); `resize()` dimensiona el backing store a mitad (`÷ RENDER_SCALE`) manteniendo la cuadrícula del autómata a viewport/`--size-gol-cell`; `start()` fija `lastTick = performance.now()`; `draw()` sustituido por `renderFrame`. Se conservan: `getComputedStyle`/`--color-accent`/`--size-gol-cell`, `SEED_DENSITY = 0.15`, `requestAnimationFrame`, pausa `document.hidden`/`visibilitychange`, fotograma estático `prefers-reduced-motion` y cleanup. | REQ-16-01/02/03/04 + Decisión 6 (motor intacto: sigue importando `./game-of-life.ts` con import relativo, REQ-16-09). |
| `src/styles/hero-section.css` (58 líneas) | `.hero-background` añade `will-change: opacity` (capa de composición propia: el gradiente se rasteriza una vez) conservando `opacity: var(--opacity-hero)`; el shorthand `background:` pasa a tener DOS `radial-gradient`: primero el grano con `color-mix(in srgb, var(--color-text) 3%, transparent)` (patrón de puntos del antiguo `.hero-noise`, alfa horneado), segundo el gradiente del hero con `var(--color-hero-*)`; `background-size: 14px 14px, auto` por capa. La regla `.hero-noise` se elimina. | REQ-16-05/06, Decisión 4 y 5 del design.md. Sin literales de color: el guardián `audit-design-tokens.mjs` sigue en verde. |
| `feature_list.json` | `status: "in_progress"` (solo eso). | Protocolo del arnés. |
| `progress/current.md` | Sesión documentada (feature, plan, estado). | Protocolo del arnés. |

No toqué: `src/utils/game-of-life.ts` (motor, REQ-16-09), `tokens.css` (REQ-16-07:
0 tokens nuevos, 0 valores cambiados), `GameOfLifeBackground.astro`,
`game-of-life.css`, `Layout.astro` ni specs.

## 3. Cobertura de cada REQ (trazabilidad)

| REQ | Cómo lo cubre el test |
|-----|-----------------------|
| REQ-16-01 | El test extrae `export function shouldTick(timestamp, lastTick, interval): boolean`, verifica la firma exacta, que el cuerpo no reasigna sus argumentos (`\b(timestamp\|lastTick\|interval)\s*=[^=>]`) y evalúa el cuerpo con `new Function`: true al superar (100/80), true al alcanzar (80/80), false antes (79/80) y sin mutación de argumentos. |
| REQ-16-02 | `TICK_INTERVAL_MS` parseado y acotado a [66.67, 100] (80 ✓ = 12,5 gen/seg); el bloque `animate(timestamp)` contiene `shouldTick(...TICK_INTERVAL_MS)`, `stepGrid(` dentro del tick y `lastTick = timestamp`. |
| REQ-16-03 | Escanea driver + imports relativos (con comentarios quitados, ver §5): 0 `fillRect`; `putImageData` aparece exactamente 1 vez; el módulo `gol-render.ts` existe, expone `renderFrame(` y construye el fotograma desde `ImageData`. |
| REQ-16-04 | `RENDER_SCALE = 2` en el scope; `canvas.width/height = … / RENDER_SCALE`; la cuadrícula sigue con `Math.floor(window.innerWidth / cellSize)`; `game-of-life.css` conserva `width/height: 100%` (el escalado al viewport queda en la hoja). |
| REQ-16-05 | El bloque `.hero-background` declara `will-change: opacity` Y conserva `opacity: var(--opacity-hero)`. |
| REQ-16-06 | `.hero-noise` ausente (sin comentarios); el bloque tiene `color-mix(in srgb, var(--color-text) 3%, transparent)`, el shorthand empieza con el `radial-gradient(color-mix(…` (grano como primer fondo), hay ≥2 `radial-gradient(` y el segundo conserva `var(--color-hero-(top|mid|bottom))` (regresión de la Ronda 2 de la feature 15). |
| REQ-16-07 | `--opacity-hero: 0.80`, `--opacity-gol: 0.15` y `--size-gol-cell: 6px` exactos en tokens.css (look aprobado intacto). |
| REQ-16-08 | Regresión: `matchMedia('(prefers-reduced-motion: reduce)')`, `reducedMotion.matches`, `document.hidden`, `visibilitychange`, `cancelAnimationFrame` en el driver y `pointer-events: none` en `.gol-canvas` (hoja intacta). |
| REQ-16-09 | Todos los imports del driver relativos (`./`), incluyen `game-of-life`; regresión ligera del motor: sigue exportando `createGrid`, `randomizeGrid`, `stepGrid` y `GameOfLifeError`. |
| REQ-16-10 | ≤100 líneas en `game-of-life-canvas.ts` (91), cada import relativo (motor 70, `gol-render.ts` 65) y `hero-section.css` (58). |

## 4. Tokens (tabla del design.md) — sin cambios

| Token | Valor | Uso |
|-------|-------|-----|
| `--opacity-hero` | 0.80 (SIN cambios, REQ-16-07) | Opacidad de `.hero-background` — look aprobado |
| `--opacity-gol` | 0.15 (SIN cambios, REQ-16-07) | Opacidad del canvas GOL |
| `--size-gol-cell` | 6px (SIN cambios, REQ-16-07) | Tamaño de celda (cuadrícula idéntica) |
| `--color-accent` | de tokens.css (sin cambios) | Color de las celdas, leído por el driver y horneado en el ImageData |
| `--color-text` | de tokens.css (sin cambios) | Alfa del grano integrado: `color-mix(in srgb, var(--color-text) 3%, transparent)` |

`TICK_INTERVAL_MS = 80` es constante interna del driver (Decisión de la sección
"Tokens usados" del design.md): los tokens son valores de diseño consumidos por
estilos; un intervalo de runtime que CSS no puede consumir sería un token
muerto y engordaría `tokens.css` (96 líneas) hacia el límite de 100.

## 5. Desviaciones justificadas

- **`stripComments()` en los escaneos de contrato (REQ-16-03 y REQ-16-06):** los
  escaneos negativos (`fillRect`, `.hero-noise`) y el conteo de `putImageData`
  miran el CÓDIGO, no la prosa de los comentarios (que documentan qué se
  sustituyó). Es el mismo patrón ya establecido en el repo (REQ-03-05 y
  REQ-15-12 quitan los comentarios antes de buscar literales). Los asertos
  sobre código no se relajaron: 0 `fillRect`, exactamente 1 `putImageData`,
  `.hero-noise` ausente como selector.
- **`background-size: 14px 14px, auto` en `.hero-background`:** el shorthand
  `background:` resetea `background-size`; con dos capas hay que declarar un
  tamaño por capa para conservar el espaciado de 14px del grano (el gradiente
  del hero queda en `auto` = tamaño del elemento). Sin literales de color.
- **El div `<div class="hero-noise"></div>` de `new-hero.astro` queda inerte en
  el DOM:** con la regla CSS eliminada, el div (y el preexistente
  `.hero-flower`, que tampoco tiene regla) no recibe estilos: altura 0, sin
  pintado, sin coste visual ni de rendimiento. Retirarlo del marcado exigiría
  tocar `src/components/new-hero/new-hero.astro`, **fuera de la lista de
  archivos autorizada por el líder** para esta feature; lo dejo y lo señalo
  aquí para decisión del líder/reviewer (la eliminación sería una línea, si se
  autoriza como follow-up).
- **Verificación funcional de `shouldTick` con `new Function`:** el arnés corre
  Node 22.22.2 (sin type-stripping por defecto), así que el test no importa el
  `.ts`; extrae el cuerpo de la función pura del fuente y lo evalúa en un
  sandbox (compatible con el patrón de tests de estructura del repo y con
  REQ-16-01 sin navegador).

## 6. Verificación final (todo en verde)

```
node --test --test-concurrency=1 "tests/**/*.test.mjs"   → # pass 133 / # fail 0
node scripts/check-format.mjs                            → FORMATO ✔
node scripts/audit-design-tokens.mjs                     → AUDIT ✔
pnpm build                                               → ✓ Complete! · 2 page(s) built
./init.sh                                                → ✔ El entorno está perfecto.
```

Verificación en `dist/` (build de producción):

- CSS (`dist/_astro/index.BlNwQJf1.css`): `.hero-background` con
  `will-change:opacity`, `background-size:14px 14px,auto` y
  `opacity:var(--opacity-hero)` ✔; `color-mix(in srgb, var(--color-text) 3%,
  transparent)` presente ✔; **`hero-noise`: 0 ocurrencias** (regla eliminada) ✔;
  `radial-gradient` ×4 (2 en `.hero-background` + gradiente del glow + otro
  componente) ✔.
- Bundle del driver (script inline minificado en `dist/index.html`):
  `putImageData` **1 vez** y `fillRect` **0 veces** ✔; `createImageData`
  presente ✔; `TICK_INTERVAL_MS=80` emitido (`l=80`) y `RENDER_SCALE=2`
  inlineado como `÷2` en `resize` y `renderFrame` (los identificadores
  `shouldTick`/`RENDER_SCALE` aparecen renombrados por el minificador;
  `shouldTick` = `u(e,t,n){return e-t>=n}` gateando el paso de generación) ✔;
  `GolRenderError` presente ✔; `prefers-reduced-motion`/`visibilitychange`/
  `document.hidden`/`cancelAnimationFrame` presentes ✔.
- Dev server (`http://localhost:4321`, HTTP 200): sirve el `color-mix` del
  nuevo fondo; el HTML servido mantiene el canvas `gol-canvas` y el div inerte
  `hero-noise` (ver §5).

## 7. Resultado final

Ciclo rojo (6 fail / 4 pass) → verde (10/10). Suite completa **133/133 ✔**,
check-format ✔, audit-design-tokens ✔, build ✔, `./init.sh` → **"El entorno
está perfecto"**. El look aprobado no cambia (mismos tokens, misma cuadrícula,
grano integrado con delta imperceptible documentado en design.md) y el lag se
ataca en las dos causas: A (12,5 gen/seg + 1 putImageData + 4× menos píxeles) y
B (grano integrado → 1 capa full-screen menos + `will-change: opacity` →
gradiente rasterizado una vez). Feature 16 en `in_progress` en
`feature_list.json` (el cierre lo decide el líder tras el reviewer). Listo
para que el líder lance al reviewer.
