# Análisis — Juego de la Vida como fondo sutil del portfolio

> Sesión 2026-08-11 · spec_author · Petición bruta: "metele el juego de la vida
> sutilmente en el background del portfolio" (moibaldenegro.com, Astro 7.2.0).

## 1. Reafirmación y alcance

Incorporar el autómata celular de Conway (Juego de la Vida) como animación de
fondo **sutil** de todo el portfolio. No es una sección nueva ni un widget
interactivo: es un fondo decorativo persistente que no debe interferir con la
lectura, el contraste ni la interacción.

Capas afectadas: layout único (`src/layouts/Layout.astro`), tokens
(`src/styles/tokens.css`), nueva hoja de estilos, un componente de UI nuevo,
dos módulos de utilidades nuevos y tests node:test. No toca dominio de datos
(no hay JSON nuevo ni repositorios).

## 2. Decisiones (A–E)

### A) JS de runtime vs CSS puro → **canvas 2D + JavaScript vanilla**

- El Juego de la Vida es computación iterativa (nacimiento/supervivencia sobre
  una cuadrícula). CSS no puede calcular generaciones: solo permite un patrón
  precalculado (still life) con `animation-delay`/parpadeo, que es una imitación
  decorativa, no el autómata pedido.
- Opción elegida: un lienzo canvas 2D animado con JS vanilla del navegador,
  **cero dependencias externas** (docs/architecture.md regla 2). Un canvas es un
  solo elemento DOM; el coste es compositing del navegador.
- Justificación explícita de la regla 9 ("Estático por defecto. Cero JavaScript
  de runtime salvo justificación"): el fondo animado es el requerimiento mismo
  del usuario, no interacción trivial; no existe alternativa estática que
  cumpla el alcance. La justificación consta en `specs/15_game-of-life-background/design.md`
  y en la `description` de la feature 15.
- El motor (lógica pura) se aísla en `src/utils/game-of-life.ts` (feature 14)
  y es testeable con node:test sin navegador, coherente con el patrón test-first
  del arnés (igual que las features de dominio 5-7 primero, UI después).

### B) Definición concreta de "sutil"

1. **Opacidad por token**: el lienzo lleva `opacity: var(--opacity-gol)` con
   valor **< 0.25** (propuesto 0.15) — nueva token de la feature 15.
2. **Color de marca, no inventado**: las celdas se dibujan con `--color-accent`
   (#7d68ff) leído en JS vía `getComputedStyle(document.documentElement)`
   (token, nunca hex suelto en el JS).
3. **prefers-reduced-motion**: con movimiento reducido se dibuja un único
   fotograma estático y NO se arranca el bucle de animación (REQ-15-05).
4. **Rendimiento**: el bucle `requestAnimationFrame` se pausa cuando el
   documento está oculto (`document.hidden` / `visibilitychange`, REQ-15-06).
   Como el canvas es fijo y cubre el viewport, siempre está "en viewport"
   cuando la página es visible: la pausa por visibilidad del documento es el
   control de coste equivalente (un IntersectionObserver sería redundante).
5. **Densidad baja**: siembra inicial con densidad ≤ 0.15 (REQ-15-07): pocas
   celdas vivas, patrón aireado.
6. **Sin interferencia**: `pointer-events: none` en el canvas y z-index inferior
   al contenido (REQ-15-01, REQ-15-10); el navbar translúcido
   (`--color-navbar` con blur) y las superficies mantienen el contraste.

### C) Dónde vive → **layout único, todas las páginas**

- El fondo es chrome compartido del portfolio → va en el layout único
  (`Layout.astro`), que lo incluye **una sola vez** importando el componente
  `GameOfLifeBackground.astro` (REQ-15-09). No se crea layout nuevo (regla 11
  "Un solo layout") ni se duplica en páginas.
- Justificación frente a "solo hero / solo home": la petición dice "el
  background del portfolio" (todo el sitio); con el layout único se obtiene
  consistencia en / y /about sin código duplicado. El hero conserva su
  gradiente/glow propio por encima; el fondo queda detrás.
- Estructura (reglas 7 y 8: estilos y lógica separados de la UI):
  - `src/components/GameOfLifeBackground.astro` — marcado `<canvas>` +
    `<script>` de arranque mínimo que llama al driver (≤100 líneas).
  - `src/utils/game-of-life-canvas.ts` — driver: dimensiona al viewport,
    lee tokens, bucle rAF, pausa/estático, siembra. (utilidades de la app;
    carpeta nueva `src/utils/`, plural kebab-case según docs/conventions.md).
  - `src/styles/game-of-life.css` — posición fija, z-index, opacidad por token,
    pointer-events; solo tokens.
  - `Layout.astro` — import del componente (1 línea de marcado).

### D) Tokens

- Existen tokens suficientes de color (`--color-accent`) y fondo
  (`--color-background`); **se amplía tokens.css** dentro de la feature 15 con
  dos tokens nuevos con patrón `--grupo-nombre`:
  - `--opacity-gol: 0.15` (grupo opacity; REQ-15-11, valor < 0.25).
  - `--size-gol-cell: 6px` (grupo size; REQ-15-11).
- `scripts/audit-design-tokens.mjs` (feature 12) excluye tokens.css de su
  auditoría → ampliar tokens no rompe el guardián.
- JS no hardcodea colores: lee `--color-accent` de la custom property.

### E) Límite 100 líneas y sin dependencias externas

- Cero dependencias: engine y driver son vanilla TypeScript/JS del navegador;
  tests con node:test (stdlib).
- Descomposición por archivo (cada uno ≤ 100 líneas): engine (~60-70),
  driver (~80-90), componente (~15), hoja CSS (~30-40), tests por feature.
  Ningún archivo requiere `blocked` por superar 100 líneas.

## 3. Descomposición en features

Complejidad: media-alta (6+ archivos, capas utilidades + UI + tokens + layout).
Se separa **lógica pura de integración UI**, patrón ya usado en el refactor
(dominio primero: features 5-7; UI después: 9-11).

| id | name | Contenido | Depende de |
|----|------|-----------|------------|
| 14 | `game-of-life-engine` | `src/utils/game-of-life.ts`: createGrid, randomizeGrid (densidad), stepGrid (reglas Conway, toroidal, inmutable) + `tests/game-of-life-engine.test.mjs` | — (base) |
| 15 | `game-of-life-background` | tokens `--opacity-gol`/`--size-gol-cell`, driver canvas, componente, hoja CSS, wiring en Layout.astro + `tests/game-of-life-background.test.mjs` | 14 |

Cada feature es independiente y testeable por sí sola; `one_feature_at_a_time`
hace que se implemente primero 14 (base) y después 15.

## 4. Riesgos y trabas

- **Falso positivo de "JS de runtime"**: mitigado con justificación explícita
  en spec (design.md + description) y REQ-15-02 que fija JS vanilla sin
  dependencias.
- **Rendimiento en móvil**: densidad ≤ 0.15, pausa con `document.hidden` y
  tamaño de celda por token acotan el coste; el driver redimensiona con
  `devicePixelRatio` (decisión de implementación permitida por la spec).
- **Audit de tokens**: el guardián (feature 12) no verifica JS; la revisión
  manual del driver (getComputedStyle) lo cubre; los tests de la feature 15
  verifican que el CSS no contiene valores sueltos.
- **Validación EARS**: REQs redactados con exactamente un SHALL y sin verbos
  vagos; verificados contra `scripts/validate-specs.mjs`.
- **README restricción "hero"** (harness-kit-integrity): no afecta, la feature
  no toca README.

## 5. Trazabilidad resumida

- REQ-14-01..09 → acceptance de la feature 14 (test node:test del engine).
- REQ-15-01..12 → acceptance de la feature 15 (tests de archivos + build).
- Sin features marcadas `in_progress`/`done`: las dos quedan `pending`.
