# Diseño — gol-performance

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? La portada `/` (y en menor
  medida `/about`): el fondo del Juego de la Vida (canvas fijo del layout) y las
  capas del hero que se apilan encima (`src/styles/hero-section.css`). En la
  portada el canvas animado queda bajo `.hero-background` (gradiente radial
  100vh, `opacity: var(--opacity-hero)` 0.80 — Decisión 6 de la feature 15),
  `.hero-noise` (puntos a pantalla completa al 0.03) y `.hero-gradient` (900px
  con animación float).
- ¿Estado actual y estado deseado? Actual: con el opacity aplicado, cada
  repintado del canvas (60 gen/seg) obliga a recomponer y re-rasterizar el
  viewport completo (lag confirmado por el usuario con Lighthouse). Deseado:
  **exactamente el mismo look** (GOL sutil tras el hero translúcido vía
  `--opacity-hero` 0.80 y `--opacity-gol` 0.15) **sin el lag**: menos
  generaciones por segundo, una sola escritura de píxeles por frame, la mitad de
  píxeles internos, el gradiente rasterizado una sola vez y una capa full-screen
  menos sobre el canvas.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--opacity-hero` | 0.80 (SIN cambios) | Opacidad de `.hero-background` — look aprobado (REQ-16-05, REQ-16-07) |
| `--opacity-gol` | 0.15 (SIN cambios) | Opacidad del canvas GOL (REQ-16-07) |
| `--size-gol-cell` | 6px (SIN cambios) | Tamaño de celda: la cuadrícula del autómata no cambia (REQ-16-07) |
| `--color-accent` | de tokens.css | Color de las celdas (leído por el driver, sin cambios) |
| `--color-text` | de tokens.css | Alfa del grano integrado: `color-mix(in srgb, var(--color-text) 3%, transparent)` (REQ-16-06) |

> **No se añaden tokens.** El intervalo de generación (`TICK_INTERVAL_MS = 80`)
> es una constante interna del driver, no un token CSS: los tokens son valores
> de diseño consumidos por estilos (`docs/conventions.md`); un parámetro de
> comportamiento de runtime que CSS no puede consumir sería CSS muerto, y
> `tokens.css` (96 líneas) no debe crecer (límite 100, regla 12).

## Decisiones y constraints

- Decisión 1 (throttle del autómata — D1 del usuario): el bucle `requestAnimationFrame`
  se mantiene como scheduler barato (una comparación por frame) y solo avanza
  generación (`stepGrid` + dibujo) cuando la función pura
  `shouldTick(timestamp, lastTick, interval)` devuelve true. Constante
  `TICK_INTERVAL_MS = 80` → **12,5 gen/seg** (dentro del rango decidido 10-15).
  La función es pura (no muta argumentos) e importable para tests de contrato.
- Decisión 2 (una escritura por frame): el dibujo usa un `ImageData` rellenado
  por bloques de celda y un único `ctx.putImageData(img, 0, 0)` por frame,
  eliminando los ~8.640 `fillRect`/frame del driver actual. El alfa visible
  sigue saliendo del CSS (`--opacity-gol`), que no cambia.
- Decisión 3 (media resolución): `RENDER_SCALE = 2` — el backing store del
  canvas pasa a mitad de tamaño en cada eje (4× menos píxeles); el CSS existente
  (`width/height: 100%` en `game-of-life.css`) escala al viewport con suavizado
  por defecto. La cuadrícula del autómata es la misma (cols×rows del viewport
  con `--size-gol-cell`), así que el patrón evoluciona igual; a 0.15 tras el
  gradiente al 0.80 el suavizado 2× es imperceptible.
- Decisión 4 (capa GPU del fondo del hero): `will-change: opacity` en
  `.hero-background` promueve el elemento a capa de composición propia: el
  gradiente radial de 100vh se rasteriza **una vez** y los repintados del canvas
  solo re-blendean la capa (ya translúcida por `var(--opacity-hero)`). Sin
  cambio visual (la capa no contiene texto: sin riesgo de antialiasing).
- Decisión 5 (integrar el grano): `.hero-noise` deja de ser capa propia y su
  patrón de puntos pasa a ser el **primer** `background-image` del shorthand
  `background:` de `.hero-background` (los dos `radial-gradient(...)` — el
  primero los puntos, el segundo el gradiente del hero, que es lo que exige el
  test existente de la Ronda 2). El alfa del grano se hornea con
  `color-mix(in srgb, var(--color-text) 3%, transparent)` (token, sin literales:
  el guardián `scripts/audit-design-tokens.mjs` sigue en verde). Interplay
  documentado: la opacidad del elemento (0.80) multiplica el alfa horneado →
  puntos al ~0.024 frente al 0.03 previo: delta < 2 niveles de 8 bits en una
  capa de grano casi invisible — se conserva la intención visual del ruido con
  una capa full-screen menos por repintado.
- Decisión 6 (motor intacto): la optimización vive en driver + CSS; el motor
  `src/utils/game-of-life.ts` (feature 14, aprobada) **no se toca** y el driver
  sigue importándolo con import relativo (REQ-16-09).
- Decisión 7 (límite 100 líneas): si el driver (91 líneas hoy) supera 100 al
  sumar `shouldTick`/`TICK_INTERVAL_MS`/`RENDER_SCALE` y el dibujo, la pintura
  con ImageData se extrae a `src/utils/gol-render.ts` (`renderFrame(ctx, grid,
  cellSize, accent)`, import relativo). El test de ≤100 líneas (REQ-16-10)
  escanea el driver **y sus imports relativos**, cubriendo cualquier reparto.
- Decisión 8 (accesibilidad intacta — D3): se conservan `prefers-reduced-motion`
  (fotograma estático), pausa con `document.hidden`/`visibilitychange` y
  `pointer-events: none` en el canvas (REQ-16-08).
- Restricciones del proyecto aplicables: tokens (no valores sueltos — el grano
  usa `color-mix` sobre token), sin dependencias externas, estilos separados de
  la UI, lógica separada de la UI, ≤100 líneas por archivo, estático por defecto
  (el JS de runtime ya está justificado en la feature 15 y no crece: el dibujo
  sigue siendo canvas vanilla).

## Alternativas descartadas

- Alternativa A (solo throttle, sin ImageData ni media resolución): insuficiente
  — seguiría habiendo ~108.000 `fillRect`/seg y la re-rasterización del
  gradiente en cada repintado; no ataca la causa B.
- Alternativa B (eliminar el GOL o el hero translúcido): viola el look aprobado
  por el usuario (D3 innegociable).
- Alternativa C (WebGL/GPU shaders para el autómata): sobredimensionado para un
  fondo decorativo a 12,5 gen/seg; añade complejidad y riesgo sin beneficio
  perceptible, y contradice "sin dependencias" y "estático por defecto".
- Alternativa D (token `--speed-gol` en CSS): CSS no puede consumir el intervalo
  del autómata; sería un token muerto y engorda `tokens.css` hacia el límite de
  100 líneas. El intervalo es una constante interna (Decisión de la sección
  "Tokens usados").
- Alternativa E (eliminar `.hero-noise` sin integrarlo): el delta visual sería
  el mismo que integrarlo (el grano desaparece del todo), pero la integración
  conserva la intención del ruido con el mismo coste de capas; se prefiere
  integrar (Decisión 5).
