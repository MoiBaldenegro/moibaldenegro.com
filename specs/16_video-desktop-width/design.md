# Diseño — Ancho acotado y centrado del video embebido en desktop (feature 16)

## Contexto visual

- Pantalla afectada: `src/pages/posts/[id].astro` — página de detalle de
  artículo; el video embebido del cuerpo markdown (02-principios.md) bajo
  `.post__content > .video-container`.
- Estado actual (feature 11): el contenedor es full-width
  (`width: 100%; max-width: 100%`) → en desktop la columna mide
  `min(var(--container-max), 95%)` = hasta ~1400px y el video se ve enorme.
- Estado deseado: en desktop (≥769px) el video queda «un poco más pequeño y
  centrado» (max-width 640px, centrado con margin auto); en móvil/tablet
  (≤768px) conserva el full-width actual sin ningún cambio.

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--video-max-width` | 640px (NUEVO) | Ancho máximo del contenedor del video en desktop (feature 16) |
| `--gap-card` | 14px | Margen vertical del contenedor (reutilizado; `auto` horizontal en desktop) |
| `--radius-card` | 22px | Radio del contenedor (ya existente, no cambia) |

## Decisiones y constraints

- Decisión 1: media query `@media (min-width: 769px)` al final de article.css
  que sobrescribe SOLO `max-width` y `margin` del contenedor. El breakpoint
  769px complementa los `max-width: 768px` existentes (layout.css, post.css,
  search-results.css): 768px = móvil/tablet (full-width intacto), ≥769px =
  desktop (acotado y centrado). Sin solapamiento ni hueco.
- Decisión 2: token nuevo `--video-max-width: 640px` en el grupo Contenedor de
  tokens.css. Justificación (precedente --radius-thumb, feature 9): la escala
  existente no aplica (--container-max 1500px es el contenedor del sitio, no
  un embed) y el valor es componente-específico; 640px es el embed 16:9
  estándar de YouTube y ~46% de la columna desktop (~1400px): «un poco más
  pequeño». Consecuencia documentada: tokens.css pasa de 91 a 93 líneas
  (comentario justificativo + token) y los 5 tests que fijan el conteo exacto
  (REQ-17-09/26-07/39-09/40-11/42-09) se ajustan con justificación REQ-43-06.
- Decisión 3: la regla base `.post__content .video-container` NO se modifica
  (REQ-11-02/05 intactos: `width: 100%`, `max-width: 100%`,
  `margin: var(--gap-card)`). El override vive dentro de la MQ con
  `margin: var(--gap-card) auto` → centrado horizontal con el mismo gap
  vertical. Los tests REQ-11 no requieren ajuste (el regex `containerRule()`
  captura la primera ocurrencia del selector = regla base; la MQ va después).
- Decisión 4: sin JS (estático por defecto), sin cambios en post.css (100
  líneas exactas, REQ-26-06), sin cambios en `[id].astro` (article.css ya se
  importa desde la feature 11, REQ-11-01).
- Restricciones aplicables: estilos separados de la UI (CSS en
  `src/styles/*.css`), tokens sin valores sueltos de color/radio, ≤100 líneas
  por archivo.

## Alternativa descartada

- Hardcodear `max-width: 640px` en article.css: el guardián
  audit-design-tokens.mjs solo audita colores y architecture.md §6 no lista
  anchos, por lo que sería permisible; se descarta por coherencia con el
  sistema de tokens (--container-max ya es un token de ancho) y para evitar
  fricción de revisión («valor suelto»).
- Reutilizar `--container-max` (1500px): no acota nada (el contenedor ya mide
  menos que eso en 95% del viewport) — inaplicable.
- MQ `max-width: 768px` con la regla base acotada (full-width solo en móvil):
  invertiría la precedencia y obligaría a tocar la regla base, rompiendo
  REQ-11-02/05 — se descarta en favor de una MQ aditiva (Decisión 1).