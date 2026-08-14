# Diseño — Legibilidad del detalle de artículo (feature 40)

## Contexto visual

- Pantalla afectada: detalle de artículo `src/pages/posts/[id].astro`
  (estilos en `src/styles/post.css` feature 26/39, `post-header.css`
  feature 39).
- Estado actual: `.post__content` a ancho completo del contenedor
  (1500px, REQ-39-01) → líneas de ~140-190 caracteres; cuerpo hereda
  ~16px; párrafos con `margin: 0 0 16px`; h2 1.6rem / h3 1.3rem; sin
  text-wrap; sin letter-spacing.
- Estado deseado (petición del humano, ciclo 32): mejoras de lectura y
  "la fuente se ve muy pequeña" en desktop. La prop "pretty" es
  `text-wrap: pretty` (CSS Text 4).

## Resolución de la tensión con REQ-39-01 (ancho completo)

- Decisión: el contenedor `.post`, el header hero `.post__hero` y la
  regla `.post__content` conservan el ancho completo del sitio
  (REQ-39-01 literal, zero cambios en tests existentes). La medida de
  lectura se aplica SOLO a la columna de texto: el `<section>` del
  `<Content />` recibe la clase BEM nueva `post__body` con
  `max-inline-size: 70ch; margin-inline: auto`.
- Trade-off: en ultrawide el texto queda centrado con aire a los lados
  (patrón editorial NYT/Medium); el header y el layout siguen full-width,
  el sitio conserva su lenguaje visual ancho. Análisis completo en
  `progress/research/legibilidad-detalle-post-ciclo32.md` §3.

## Tokens usados (solo de los tokens del diseño del proyecto; sin tokens nuevos)

La hoja nueva NO declara colores, radios, bordes, sombras ni transiciones:
solo tipografía/layout con unidades relativas (rem/ch/lh/em), permitidas
como literales por el precedente REQ-26-05 ("tipografía/layout literales
del componente"). Por eso no consume tokens de color; los tokens que
gobiernan el contexto visual del detalle siguen siendo los ya usados por
post.css y post-header.css:

| Token | Uso (contexto) |
|-------|----------------|
| `--container-max` | ancho del contenedor `.post` (full-width estructural, REQ-39-01) |
| `--color-text` / `--color-text-secondary` | cuerpo y meta (heredados de post.css) |
| `--font-sans` | familia tipográfica (declarada en `.post__content`) |
| `--radius-card` / `--shadow-card` / `--color-hero-*` / `--color-glow` | panel hero (post-header.css, intacto) |

## Decisiones y constraints

- Decisión 1 (medida): `.post__body { max-inline-size: 70ch; margin-inline:
  auto; }` — 70ch dentro del óptimo 45-75ch (66 ideal, tope WCAG AAA 80ch);
  `ch` escala con la fuente (WCAG 1.4.4). La medida va en la clase nueva y
  NO en `.post__content` para preservar el contrato REQ-39-01 y su test
  (la regla `.post__content` de post.css no declara max-width).
- Decisión 2 (tamaño de cuerpo): `.post__body { font-size:
  clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem); }` — fluido 17px→19px
  (NYT 18px / Rello CHI 2016: 18pt); rem para zoom 200%. Se declara en
  `.post__body` para que hereden p, li, a, code (0.9em) y pre.
- Decisión 3 (text-wrap): `text-wrap: pretty` SOLO en `.post__content p`
  (Chrome/Edge 117+, Safari 26+; Firefox degrada silenciosamente — mejora
  progresiva, sin `@supports`, sin interacción SSR); `text-wrap: balance`
  en `.post__content h1,h2,h3` (seguro ~92%). NO aplicar a ul/ol/li/pre
  ni a `*` (costo de layout sin beneficio).
- Decisión 4 (espaciado): `margin-block-end: 1lh` en p (≈32px a
  19px/1.7, ritmo vertical atado al line-height; hoy 16px fijos) y
  márgenes de encabezado asimétricos con `lh` (más arriba que abajo para
  que el título "conecte" con su texto): h2 `1.5lh 0 0.5lh`, h3
  `1.25lh 0 0.375lh`. line-height 1.7 unitless se CONSERVA (ya óptimo,
  WCAG 1.4.12).
- Decisión 5 (tema oscuro): `letter-spacing: 0.01em` en p — confort de
  lectura en oscuro (Mantlr/Smashing 2025-26). El contraste actual
  (secundario 10.18:1) no se toca: ya cumple AA/AAA.
- Decisión 6 (jerarquía): h2 1.6rem→1.75rem, h3 1.3rem→1.4rem en desktop;
  en ≤768px h2 1.4rem (hoy 1.35rem) y h3 1.2rem, dentro de una media
  query de la hoja nueva (post.css conserva la suya con `.post__title`,
  contrato REQ-39-07 intacto).
- Decisión 7 (hoja nueva): los estilos van en `src/styles/
  post-readability.css` porque post.css está en 100 líneas exactas
  (añadir ahí superaría el límite). Se importa en [id].astro DESPUÉS de
  post.css y post-header.css (el orden de import fija la cascada: a
  igual especificidad gana la última hoja). post.css y post-header.css NO
  se tocan (contratos REQ-26-02..07 y REQ-39-01..09 intactos).
- Decisión 8 (markup): el `<section>` del Content pasa a
  `<section class="post__body">` (una línea; [id].astro pasa de 51 a 52
  líneas). El primer `<h1>` y el primer `<img>` de la página no cambian:
  pares `title-${entry.id}`/`img-${entry.id}` (REQ-24-03/05) intactos.
- Restricciones: estilos solo en `src/styles/` (sin `<style>` en el
  .astro, sin `style=` inline), ≤100 líneas por archivo, sin hex/rgba
  sueltos (audit-design-tokens), sin tokens nuevos (REQ-26-07/39-09
  fijan tokens.css en 87 líneas), sin JS de runtime (text-wrap es CSS
  puro, mejora progresiva).
- Tests: los existentes (post-header REQ-39-01..09, post-page-styles
  REQ-26-02..07, view-transitions REQ-24-03/05, design-tokens) se
  conservan SIN modificaciones; se añade `tests/post-readability.test.mjs`
  (test-first) con el contrato REQ-40-01..12, incluido el guard de la
  tensión (`.post__content` sin max-width, REQ-40-12).

## Alternativa descartada

- Alternativa 1: tokens nuevos (`--font-size-body`, `--measure-reading`)
  en tokens.css. Motivo del descarte: REQ-26-07 prohíbe explícitamente los
  grupos `--font-size-` y `--reading-` (alternativa descartada del design
  de la 26) y fija tokens.css en 87 líneas; un único consumidor no justifica
  actualizar tests autorizados ni arriesgar REQ-26-07/39-09. Los literales
  con unidades relativas son la práctica del repo para tipografía.
- Alternativa 2: aplicar la medida a `.post__content` (article). Motivo:
  rompería REQ-39-01 y su test (la regla no puede declarar max-width);
  la clase `post__body` logra el mismo resultado visual sin tocar el
  contrato.
- Alternativa 3: columna de lectura más ancha (~1100px, token
  `--reading-max` del research del ciclo 31). Motivo: ~90-100 caracteres,
  aún 1.3-1.5× el óptimo; 70ch resuelve la queja de raíz. Si el humano lo
  prefiere, es cambiar un solo valor.
- Alternativa 4: `hyphens: auto` y `overflow-wrap: break-word`. Motivo:
  sin `text-align: justify` el español no necesita guionización; se deja
  documentado como mejora futura opcional (fuera de alcance).
