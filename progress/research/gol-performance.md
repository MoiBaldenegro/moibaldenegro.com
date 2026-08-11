# Análisis — gol-performance: eliminar el lag del fondo GOL con opacity en el hero

> Sesión 2026-08-11 · spec_author · Petición bruta del usuario: "Estuve viendo el
> opacity ese... lo modifiqué yo. Cuando le metemos el opacity me gusta como se
> ve pero tiene una caída tremenda de performance, se laguea." Confirmado por el
> usuario con Lighthouse: al aplicar `opacity: var(--opacity-hero)` en
> `.hero-background` el rendimiento cae, sobre todo en la portada. El look le
> gusta; hay que ELIMINAR el lag.

## 1. Reafirmación y alcance

Optimizar el pipeline del fondo del Juego de la Vida (features 14 + 15) para
eliminar el lag producido por la interacción de dos causas (A: coste del driver
por frame; B: recomposición de pantalla completa con capas semitransparentes),
**sin cambiar el look aprobado** (Decisión 6 de la feature 15: gradiente radial
del hero translúcido vía `--opacity-hero: 0.80` sobre el canvas GOL al
`--opacity-gol: 0.15`).

Capas afectadas: driver `src/utils/game-of-life-canvas.ts` (utilidades),
`src/styles/hero-section.css` (capas del hero), posiblemente un módulo de
dibujo nuevo (`src/utils/gol-render.ts`), y tests node:test
(`tests/gol-performance.test.mjs`). NO se tocan: `src/utils/game-of-life.ts`
(motor, feature 14 aprobada), `tokens.css` (sin tokens nuevos), el componente
`GameOfLifeBackground.astro`, `game-of-life.css` ni el layout.

## 2. Análisis de rendimiento con números del código real

### 2.1 Causa A — coste del driver por frame (`src/utils/game-of-life-canvas.ts`)

Estado actual (verificado en disco, 91 líneas):

- `resize()`: `cols = floor(innerWidth / cellSize)`, `rows = floor(innerHeight / cellSize)`.
  A 1080p con `--size-gol-cell: 6px`: 320 × 180 = **57.600 celdas** por cuadrícula.
- `draw()`: `clearRect` de todo el canvas + un `fillRect` por célula viva.
  Con densidad de siembra 0.15 → **~8.640 `fillRect` por frame**.
- `animate()`: `stepGrid(grid)` (barre las 57.600 celdas; cada una hace 8 lecturas
  de vecinos envolventes ≈ 460k operaciones por generación) + `draw()` +
  `requestAnimationFrame` → **1 generación por frame a 60 fps = 60 gen/seg**.
  - `fillRect`: ~8.640 × 60 = **~518.400 llamadas de dibujo por segundo**.
  - `stepGrid`: ~460k ops × 60 = **~27,7M operaciones de autómata por segundo**
    (innecesarias para un fondo decorativo).
- Backing store del canvas: `cols*cellSize` × `rows*cellSize` = 1920×1080 =
  **2.073.600 px** (a DPR 1).

### 2.2 Causa B — recomposición de pantalla completa con opacity (portada)

En `/` se apilan sobre el canvas animado (hoja `hero-section.css`):

| Capa | Tamaño | Opacidad | Coste por repintado del canvas |
|------|--------|----------|-------------------------------|
| `.gol-canvas` | full-screen fijo | 0.15 | la que repinta (causa A) |
| `.hero-background` | 100vh, gradiente radial 3 paradas | 0.80 | re-blend + **re-rasterización del gradiente** |
| `.hero-noise` | full-screen, puntos 14px | 0.03 | re-blend de otra capa full-screen |
| `.hero-gradient` | 900px, `animation: float` | — | re-blend (transform ya compuesto) |

Cada repintado del canvas invalida la región completa (es full-screen): el
compositor debe re-blendear el viewport entero **60 veces por segundo**,
incluida la re-rasterización del gradiente radial de 100vh de `.hero-background`.
En GPUs integradas (y en /about, donde solo pesa la causa A) esto es el lag
confirmado. `/about` no tiene hero: solo pesa A.

### 2.3 Números objetivo tras la feature

| Métrica | Antes | Después | Factor |
|---------|-------|---------|--------|
| Generaciones/seg | 60 | **12,5** (`TICK_INTERVAL_MS = 80`, rango decidido 10-15) | 4,8× menos |
| Llamadas de dibujo por frame | ~8.640 `fillRect` | **1 `putImageData`** | — |
| Píxeles del backing store (1080p) | 2.073.600 | **518.400** (`RENDER_SCALE = 2`) | 4× menos |
| Recomposiciones full-screen/seg | 60 | 12,5 | 4,8× menos |
| Capas full-screen semitransparentes sobre el canvas en `/` | 2 (background + noise) | **1** (noise integrado) | 1 menos |
| Rasterización del gradiente del hero | por frame | **una sola vez** (`will-change: opacity`) | — |

## 3. Direcciones técnicas evaluadas (decisión por dirección)

### D-A. `ImageData`/`putImageData` en vez de `fillRect` por celda → **SÍ**

Una sola escritura de píxeles por frame (upload determinista de 518k px ≈ 2 MB,
~26 MB/s a 12,5 fps) frente a ~8.640 invocaciones de rasterizado 2D. A 12,5
gen/seg el relleno del buffer en JS (~77.760 escrituras de array para bloques de
3×3 px con RENDER_SCALE 2) es despreciable. El alfa se hornea en el ImageData
(opacidad visible la pone el CSS, que no cambia).

### D-B. Throttle de generación ~10-15 gen/seg con rAF repintando solo al tick → **SÍ (D1 del usuario)**

Función pura `shouldTick(timestamp, lastTick, interval)` (comparación
`timestamp - lastTick >= interval`, sin mutar argumentos) exportada por el
driver. El bucle rAF se mantiene como scheduler (coste trivial por frame: una
comparación) y solo ejecuta `stepGrid` + `draw` cuando `shouldTick` devuelve
true. Constante `TICK_INTERVAL_MS = 80` → **12,5 gen/seg** (dentro de 10-15).

### D-C. Escala interna a mitad de resolución con escalado CSS → **SÍ**

`RENDER_SCALE = 2` en el driver: el backing store pasa a la mitad en cada eje
(4× menos píxeles). La **cuadrícula del autómata no cambia** (mismas cols×rows
del viewport con `--size-gol-cell: 6px` → misma evolución del patrón). El CSS
existente (`width: 100%; height: 100%`) escala el lienzo al viewport con
suavizado por defecto: celdas de 6px CSS = bloques de 3px internos
redimensionados 2× — a `--opacity-gol: 0.15` tras el gradiente al 0.80 el
suavizado es imperceptible y el look aprobado se conserva (D3). En pantallas
DPR 2 el canvas interno coincide con los px CSS; la pérdida de nitidez queda
amortizada por el escalado suave intencional.

### D-D. CSS: promover `.hero-background` y evaluar `.hero-noise` → **SÍ ambas**

- **`will-change: opacity` en `.hero-background`**: promueve el elemento a capa
  de composición propia; el gradiente radial de 100vh se rasteriza **una vez**
  en la textura de la capa y los repintados del canvas solo re-blendean la capa
  (ya translúcida por `opacity: var(--opacity-hero)`), sin re-rasterizar el
  gradiente por frame. Es un cambio de presentación sin efecto visual (la capa
  no contiene texto: no hay riesgo de antialiasing/subpíxel).
- **`.hero-noise` integrado en `.hero-background`**: se elimina una capa
  full-screen semitransparente propia (un blend menos por repintado). El patrón
  de puntos pasa a ser el **primer** `background-image` (shorthand `background:`
  con dos `radial-gradient(...)`), con alfa derivado del token
  `color-mix(in srgb, var(--color-text) 3%, transparent)` — sin literales de
  color (el guardián `scripts/audit-design-tokens.mjs` solo admite tokens fuera
  de tokens.css). Interplay documentado: la opacidad del elemento (0.80) se
  multiplica por el alfa horneado → puntos al 0.024 efectivo frente al 0.03
  previo: delta imperceptible (< 2 niveles de 8 bits en una capa de grano),
  integrado en la misma textura de capa que ya se rasteriza una sola vez.
  El selector `.hero-noise` desaparece; los tests existentes no lo exigen
  (REQ-03-02 exige `.new-hero`, `.hero-background`, `.hero-gradient`,
  `.hero-grid` — verificado en `tests/hero-section-styles.test.mjs`).
- **`.hero-gradient` (900px animado)**: no se toca; su `transform` ya está
  compuesto por el navegador y no es full-screen.

### D-E. Motor `src/utils/game-of-life.ts` → **NO se toca**

La optimización vive íntegramente en el driver (throttle, dibujo, escala) y en
CSS (capas). Cero cambios de API en el motor de la feature 14; el driver sigue
importándolo con import relativo (REQ-16-09).

### D-F. Token nuevo `--speed-gol` vs constante interna → **constante interna**

`TICK_INTERVAL_MS = 80` como constante del driver. Motivos: (1) los tokens CSS
son valores de diseño consumidos por estilos (`docs/conventions.md`); un
intervalo de generación es un parámetro de comportamiento de runtime que CSS no
puede consumir → un token sería CSS muerto; (2) `tokens.css` está en 96 líneas;
añadir tokens compromete el límite de 100 (regla 12) sin beneficio; (3) los
tests de estructura pueden verificar la constante y el rango exactos
(66,67–100 ms) con más precisión que un valor CSS. El "look" no usa velocidad:
nada visible cambia.

### D-G. Límite 100 líneas del driver → **extracción a `src/utils/gol-render.ts` si hace falta**

El driver actual tiene 91 líneas; sumar `shouldTick`, `TICK_INTERVAL_MS`,
`RENDER_SCALE` y el dibujo con ImageData (~+20) lo llevaría a ~110. Decisión:
la función de dibujo (`renderFrame(ctx, grid, cellSize, accent)` que construye
el ImageData y hace el único `putImageData`) vive en un módulo propio
`src/utils/gol-render.ts` (import relativo, mismo patrón de la feature 15). El
test de ≤100 líneas (REQ-16-10) escanea el driver **y sus imports relativos**,
por lo que la extracción queda cubierta aunque el implementador decida otro
reparto (siempre ≤100 por archivo).

## 4. Descomposición en features → **UNA sola feature**

Complejidad media (2-3 archivos + CSS), pero las dos mitades del arreglo (driver
y capas CSS) optimizan el **mismo pipeline visual** y ninguna es valiosa sin la
otra: solo el throttle dejaría la re-rasterización del gradiente por frame; solo
las capas CSS dejarían 60 gen/seg y ~8.640 fillRect/frame. Separar en dos
features obligaría a tocar los mismos archivos dos veces y ninguna entrega un
beneficio independiente y testeable por sí sola. **Una feature: id 16
`gol-performance`** (base → no hay dependencias nuevas; `one_feature_at_a_time`
la implementa completa).

## 5. Verificabilidad de los REQ (tests node:test SIN navegador)

El arnés no mide fps: los tests son de **estructura/contrato** sobre el fuente
(patrón de `tests/game-of-life-background.test.mjs`):

- `shouldTick` exportada, comparación `timestamp - lastTick >= interval`, sin
  reasignación de argumentos (REQ-16-01).
- `TICK_INTERVAL_MS` en [66,67, 100] y uso de `shouldTick` para gatear
  `stepGrid`/`draw` (REQ-16-02).
- `putImageData` presente y `fillRect` ausente en driver + imports relativos
  (REQ-16-03).
- `RENDER_SCALE = 2` y división en el dimensionado del canvas (REQ-16-04).
- `will-change: opacity` y `opacity: var(--opacity-hero)` en `.hero-background`;
  `.hero-noise` ausente; dos `radial-gradient(` y `color-mix` con
  `var(--color-text)` en el bloque (REQ-16-05, REQ-16-06).
- tokens intactos: `--opacity-hero: 0.80`, `--opacity-gol: 0.15`,
  `--size-gol-cell: 6px` (REQ-16-07).
- regresión accesibilidad: `prefers-reduced-motion`, `document.hidden`,
  `visibilitychange`, `cancelAnimationFrame` y `pointer-events: none` persisten
  (REQ-16-08).
- imports del driver 100% relativos e incluyen el motor (REQ-16-09).
- ≤100 líneas en driver, imports relativos y `hero-section.css` (REQ-16-10).

Compatibilidad con la suite existente verificada en disco: los tests de la
feature 15 siguen pasando con el nuevo driver (conserva `requestAnimationFrame`,
`getComputedStyle`/`--color-accent`, `canvas.width = ... cellSize`,
`SEED_DENSITY`/`randomizeGrid`, reduced-motion, visibility) y con el
`.hero-background` fusionado (el test Ronda 2 exige `background: radial-gradient(`
shorthand — se conserva como primer layer — con `var(--color-hero-*)`, `z-index:
-1` y `opacity: var(--opacity-hero)`).

## 6. Riesgos y trabas

- **Look (D3)**: el único delta visual es el grano al 0.024 vs 0.03 (imperceptible,
  documentado en design.md) y el suavizado 2× del canvas a 0.15 (imperceptible).
  Los tokens de aspecto no cambian (REQ-16-07).
- **Audit de tokens**: `color-mix(in srgb, var(--color-text) 3%, transparent)`
  no contiene hex ni rgba( → el guardián sigue en verde; `hero-section.css` no
  gana valores sueltos.
- **100 líneas**: mitigado con la extracción de `gol-render.ts` (D-G); el test
  de ≤100 escanea imports relativos para cubrir cualquier reparto.
- **Tests existentes**: verificado selector a selector (sección 5) que la suite
  de las features 3 y 15 no se rompe; el test de la feature 16 se escribe en
  rojo antes de implementar (patrón del arnés).
- **Regresión visual real**: la medirá el implementer/reviewer en el dev server
  (Lighthouse del usuario como referencia externa); el arnés no puede medir fps.

## 7. Trazabilidad resumida

- REQ-16-01..10 → acceptance de la feature 16 (tests node:test de
  estructura/contrato + regresión de la suite 3/15).
- Feature única, `status: pending`; no se marcan `in_progress`/`done`.
