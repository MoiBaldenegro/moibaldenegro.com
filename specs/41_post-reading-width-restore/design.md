# Diseño — Restauración del ancho completo de lectura (feature 41)

## Contexto visual

- Pantalla afectada: detalle de artículo `src/pages/posts/[id].astro`
  (estilos en `src/styles/post.css` feature 26/39, `post-header.css`
  feature 39 y `post-readability.css` feature 40).
- Estado actual: la feature 40 (rechazada por el humano: "no compa lo
  volvieron a poner muy angosto") acotó la columna de lectura a
  `max-inline-size: 70ch` centrada en `section.post__body`; el header hero
  y el contenedor siguen full-width, pero el texto queda en una columna
  estrecha con aire a los lados en ultrawide.
- Estado deseado (decisión del humano, ciclo 33): el contenido del detalle
  vuelve a ocupar el ancho completo de la página (ancho del contenedor
  `min(var(--container-max), 95%)` = 1500px, REQ-39-01 literal). Se
  conservan TODAS las mejoras tipográficas de la 40 que no estrechan.

## Tokens usados (solo de los tokens del diseño del proyecto; sin tokens nuevos)

La hoja NO declara colores, radios, bordes, sombras ni transiciones: solo
tipografía/layout con unidades relativas (rem/lh/em), permitidas como
literales por el precedente REQ-26-05 ("tipografía/layout literales del
componente"). Los tokens que gobiernan el contexto visual del detalle
siguen siendo los ya usados por post.css y post-header.css (intactos):

| Token | Uso (contexto) |
|-------|----------------|
| `--container-max` | ancho del contenedor `.post` (full-width estructural, REQ-39-01/41-13) |
| `--color-text` / `--color-text-secondary` | cuerpo y meta (heredados de post.css) |
| `--font-sans` | familia tipográfica (declarada en `.post__content`) |
| `--radius-card` / `--shadow-card` / `--color-hero-*` / `--color-glow` | panel hero (post-header.css, intacto) |

## Decisiones y constraints

- Decisión 1 (ancho completo, el rechazo del humano): la regla `.post__body`
  de post-readability.css PIERDE `max-inline-size: 70ch` y
  `margin-inline: auto`. El `<section class="post__body">` (sin medida) y el
  `<article class="post__content">` (sin max-width, REQ-39-01) ocupan el
  ancho completo del contenedor. NINGUNA regla de la hoja declara
  `max-width` ni `max-inline-size` (guard del test REQ-40-02/40-12
  actualizado, REQ-41-01/13).
- Decisión 2 (se conserva post__body): el markup de `[id].astro` NO cambia:
  la sección sigue envolviendo el `<Content />` con la clase `post__body`
  como contenedor tipográfico (REQ-40-01 literal, REQ-41-02). Alternativa
  de eliminar la clase y mover la tipografía a `.post__content` descartada
  en §Alternativa (cambio mínimo, cero riesgo sobre REQ-39-08).
- Decisión 3 (se conserva la tipografía, evaluada a ancho completo): el
  `font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` (17→19px) responde
  a la queja original de "fuente muy pequeña" y es independiente del ancho;
  `text-wrap: pretty` en p evita huérfanas a CUALQUIER ancho; `balance` en
  h1-h3 equilibra títulos de 2+ líneas (sin costo en una línea);
  `margin-block-end: 1lh`, `letter-spacing: 0.01em`, h2 1.75rem/h3 1.4rem
  con márgenes en lh y la media query 768px son independientes del ancho.
  Todas se CONSERVAN (REQ-41-03..09).
- Decisión 4 (cambio mínimo en disco): solo se toca
  `src/styles/post-readability.css` (eliminar 2 líneas + comentarios;
  queda en ~40 líneas) y `tests/post-readability.test.mjs` (actualización
  autorizada, ver §Cambios de test). post.css, post-header.css y tokens.css
  NO se tocan (REQ-39-01/26-02..07/40-11 intactos).
- Restricciones: estilos solo en `src/styles/` (sin `<style>` en el .astro,
  sin `style=` inline), ≤100 líneas por archivo, sin hex/rgba sueltos
  (audit-design-tokens), sin tokens nuevos (tokens.css en 87 líneas,
  REQ-26-07/39-09/40-11), sin JS de runtime (text-wrap es CSS puro).

## Cambios de test autorizados (tests/post-readability.test.mjs)

ÚNICAMENTE lo que fija la medida; el resto del contrato de la 40 se
conserva verificado:

1. Test REQ-40-02 (cambia): verifica la AUSENCIA de acotación en la regla
   `.post__body` (no declara `max-width` ni `max-inline-size`); el
   `font-size: clamp()` lo sigue cubriendo el test REQ-40-03 intacto.
2. Test REQ-40-12 (se refuerza, sigue en verde): conserva la aserción
   original (`.post__content` sin max-width + `.post` con
   `var(--container-max)`) y añade el guard de que NINGUNA regla de
   post-readability.css declara `max-width`/`max-inline-size`.
3. Comentario de cabecera del archivo: se actualiza al contrato del ciclo 33
   (medida eliminada; mejoras tipográficas conservadas).
4. Tests REQ-40-01, 03..11 y convenciones: SIN cambios.

## Alternativa descartada

- Alternativa 1: eliminar `section.post__body` y mover la tipografía de
  vuelta a `.post__content`. Motivo: toca `[id].astro`, reescribe los
  selectores de la hoja y el test REQ-40-01 — tres artefactos en riesgo
  para un resultado visual idéntico; el `font-size` en `.post__content`
  ampliaría la superficie de conflictos con el scoping de post.css; la
  sección pierde su ancla estructural. El coste no compensa: la 41 es una
  corrección de rechazo, no un refactor.
- Alternativa 2: columna de lectura más ancha (~1100px, `--reading-max` del
  research del ciclo 31). Motivo: el humano rechazó CUALQUIER acotación
  ("lo volvieron a poner muy angosto"); reintroducir una medida, aunque sea
  más ancha, desobedece la decisión. Documentado en
  `progress/research/ancho-lectura-fullwidth-ciclo33.md` §6 como opción
  futura si el humano la pide explícitamente.
- Alternativa 3: `hyphens: auto` como compensación de líneas largas. Motivo:
  sin `text-align: justify` el español no necesita guionización; mejora
  futura opcional ya documentada en la 40 (Alternativa 4), fuera de alcance.