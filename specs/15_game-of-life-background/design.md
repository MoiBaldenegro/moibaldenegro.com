# Diseño — game-of-life-background

## Contexto visual

- ¿Qué pantalla, sección o componente se ve afectado? El fondo de todas las páginas del sitio (home y /about): el chrome compartido del layout único `src/layouts/Layout.astro` recibe un componente `GameOfLifeBackground.astro` que pinta un lienzo canvas fijo detrás del contenido.
- ¿Estado actual y estado deseado? Actual: fondo plano `--color-background` (#070716) sin animación. Deseado: Juego de la Vida de Conway animado de forma **sutil** — celdas en el color de acento de la marca a opacidad baja, sin interferir con lectura, contraste ni interacción.

## Justificación de JavaScript de runtime (regla "Estático por defecto")

- El Juego de la Vida es computación iterativa (reglas de nacimiento/supervivencia sobre una cuadrícula) que CSS no puede calcular: CSS solo permite un patrón precalculado con parpadeo (still life), que no es el autómata real pedido por el usuario.
- La opción elegida es un canvas 2D con JavaScript vanilla en el navegador: un solo elemento DOM, cero dependencias, sin frameworks. El rendimiento se controla: pausa con `document.hidden` (visibilitychange), fotograma único estático con `prefers-reduced-motion`, densidad de siembra baja (≤ 0.15), opacidad token < 0.25 y canvas sin captura de eventos de puntero.
- Justificación declarada: el requerimiento explícito del usuario (fondo animado del Juego de la Vida) no es interacción trivial; es la razón de ser de la feature (docs/architecture.md regla 9 permite JS con justificación).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | de tokens.css | Color de las celdas vivas (leído en JS vía `getComputedStyle`) |
| `--opacity-gol` | NUEVO en tokens.css, < 0.25 (propuesto 0.15) | Opacidad del lienzo (grupo `opacity`) |
| `--size-gol-cell` | NUEVO en tokens.css (propuesto 6px) | Tamaño de celda en px (grupo `size`) |
| `--color-background` | de tokens.css | Fondo del documento tras el lienzo |
| `--opacity-hero` | NUEVO en tokens.css (0.80) | Opacidad del FONDO del hero (grupo `opacity`), ver Decisión 6 |

## Decisiones y constraints

- Decisión 1 (JS vs CSS): canvas 2D + JS vanilla, nunca CSS puro. La justificación explícita queda en este design.md y en la `description` de la feature.
- Decisión 2 (dónde vive): componente `GameOfLifeBackground.astro` incluido **una sola vez** en el layout único (regla "Un solo layout": el chrome compartido vive solo en el layout; no se crean layouts nuevos). El fondo aparece en todas las páginas del portfolio de forma consistente.
- Decisión 3 (estructura y 100 líneas): el componente queda mínimo (marcado + `<script>` de arranque); el driver `src/utils/game-of-life-canvas.ts` (canvas, bucle, pausas, accesibilidad) y el engine `src/utils/game-of-life.ts` (feature 14) viven en utilidades separadas (regla "Lógica separada de la UI"); la hoja `src/styles/game-of-life.css` solo consume tokens y declara `position: fixed`, índice z inferior, `opacity: var(--opacity-gol)` y `pointer-events: none`. Cada archivo ≤ 100 líneas.
- Decisión 4 (sutil): opacidad vía token `< 0.25`, color de marca (`--color-accent`), densidad de siembra ≤ 0.15, fotograma estático con `prefers-reduced-motion` y pausa con `document.hidden`.
- Decisión 5 (tokens): se amplía `src/styles/tokens.css` dentro de esta feature con `--opacity-gol` y `--size-gol-cell` (patrón `--grupo-nombre`); `scripts/audit-design-tokens.mjs` excluye tokens.css, por lo que la ampliación no rompe el guardián.
- Decisión 6 (fondo del hero translúcido — ronda 2, tras CHANGES_REQUESTED del reviewer): el hero de la portada ocupa 100vh con un fondo radial opaco (`--color-hero-*`) que tapaba por completo el canvas del GOL en el primer viewport de `/`. Para que el fondo GOL se vea tras el hero sin atenuar el contenido:
  - Se traslada el gradiente radial del hero de `.new-hero` al elemento del fondo `.hero-background` (que ya era `position: absolute; inset: 0; pointer-events: none`), con `z-index: -1`: queda detrás del contenido estático del hero y, dentro del contexto raíz, encima del canvas GOL global (también `z-index: -1`, primer hijo del body → se pinta antes). `overflow: hidden` de `.new-hero` recorta el fondo al área del hero sin afectar al canvas (no es descendiente).
  - La opacidad se aplica **solo** a `.hero-background` vía el token nuevo `--opacity-hero: 0.80` (grupo `opacity`, patrón `--grupo-nombre`). `.new-hero` **no declara opacity**: el contenido del hero (texto y tarjetas, que además viven sobre superficies opacas) mantiene el 100% de contraste — respuesta directa a la observación del reviewer de que el literal `opacity: 0.85` en `.new-hero` atenúa el contenido.
  - Valor: 0.80, no `--opacity-gol` (0.15). Reutilizar 0.15 dejaría el hero casi sin fondo (el texto del hero no tiene fondo propio sobre el canvas) y perdería la profundidad del gradiente; 0.80 conserva la legibilidad del gradiente y deja percibir el GOL de forma sutil (celdas de acento al 15% a través de un fondo al 80%). El ajuste se hizo por la spec (token + test), nunca con literales.
  - Nota de alineación (ronda 3): durante la re-review el valor se ajustó en vivo de 0.85 a 0.80 (cambio concurrente externo, luego verificado y estabilizado); la decisión de diseño no cambia — fondo translúcido vía token, contenido del hero intacto — y **0.80 es el valor final único** alineado en tokens.css, este design.md, el informe del implementador y `progress/current.md`.
- Restricción del proyecto aplicable: estático por defecto (justificado), sin dependencias externas, un solo layout, estilos separados de la UI, lógica separada de la UI, ≤100 líneas por archivo y tokens, no valores sueltos.

## Alternativa descartada

- Alternativa considerada: CSS puro con patrón estático (still life o "gun" precalculado) y `animation-delay` por celda, sin JavaScript.
- Motivo del descarte: no es el Juego de la Vida real (no hay evolución por reglas), exige decenas de elementos DOM por celda o trucos de `box-shadow`, y el resultado no es animación de autómata sino parpadeo decorativo; no satisface la petición del usuario ("el juego de la vida").
