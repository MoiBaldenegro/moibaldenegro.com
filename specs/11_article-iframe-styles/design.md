# Diseño — Estilos del iframe de video en el detalle de artículo (feature 11)

## Contexto visual

- Pantalla afectada: `src/pages/posts/[id].astro` — página de detalle de
  artículo, cuerpo markdown renderizado por `<Content />` bajo
  `.post__content > .post__body`. El artículo 02-principios.md embebe
  `<div class="video-container"><iframe …youtube…></iframe></div>` (HTML
  crudo en markdown).
- Estado actual: el iframe se ve con el tamaño por defecto del navegador
  (~300×150), sin proporción 16:9, sin radio y sin margen del bloque, porque
  `article.css` solo se importa desde la portada (`index.astro`), que no
  renderiza cuerpos markdown (commit 573fcef importó en el destino equivocado).
- Estado deseado: video full-width con proporción 16:9, esquinas redondeadas y
  margen vertical con tokens, coherente con la imagen del artículo
  (`.post__image`, REQ-26-04).

## Tokens usados (solo de los tokens del diseño del proyecto)

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-card` | 22px | Radio del contenedor del video (mismo que `.post__image`, REQ-26-04) |
| `--gap-card`    | 14px | Margen vertical del contenedor del video (precedente REQ-17-05) |

## Decisiones y constraints

- Decisión 1: se conserva `article.css` como hoja del contenido embebido y se
  limpia. NO se fusiona en `post.css`: está en 100 líneas exactas (REQ-26-06,
  límite ≤100) y mezclaría dos hojas con historial de features distintas.
- Decisión 2: scoping bajo `.post__content .video-container`, consistente con
  la Decisión 2 de la feature 26 (tipografía del markdown scoping bajo
  `.post__content`); así los estilos solo aplican al cuerpo del artículo.
- Decisión 3: el iframe pierde `border-radius` (el contenedor con
  `overflow: hidden` recorta las esquinas) y `min-height: 500px` (rompe el
  aspect-ratio 16/9 del contenedor; REQ-11-06). El contenedor conserva
  `aspect-ratio: 16 / 9`, `width: 100%`, `overflow: hidden` y gana
  `border-radius: var(--radius-card)` y `margin: var(--gap-card)`.
- Decisión 4: `src/pages/posts/[id].astro` importa `../../styles/article.css`
  (import aditivo: los imports de `post.css`/`post-header.css`/
  `post-readability.css` y sus tests REQ-26-02 no cambian) y
  `src/pages/index.astro` pierde `import "../styles/article.css"` (CSS muerto
  en la portada, REQ-11-08).
- Restricciones aplicables: estilos separados de la UI (CSS en
  `src/styles/*.css`), tokens sin valores sueltos de radio/color, ≤100 líneas
  por archivo, estático por defecto (sin JS de runtime).

## Alternativa descartada

- Fusionar `.video-container` en `post.css`: superaría las 100 líneas de
  `post.css` (viola REQ-26-06) y mezcla dos hojas con historial de features
  distintas (26/39 vs. la de este video). Se descarta en favor de conservar
  `article.css` limpia (Decisión 1).
- Importar `article.css` también en `index.astro` (estado actual): CSS muerto,
  la portada no renderiza cuerpos markdown. Se descarta (REQ-11-08).